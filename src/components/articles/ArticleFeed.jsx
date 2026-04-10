import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, RotateCcw, Settings, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ArticleCard, { clearAllSeenArticles, getCachedImage } from './ArticleCard';
import ArticleFilters from './ArticleFilters';
import Tooltip from '@/components/ui/Tooltip';
import { ALL_JOURNALS, ACS_JOURNALS, RSC_JOURNALS, WILEY_JOURNALS, ELSEVIER_JOURNALS, SPRINGER_JOURNALS } from '@/components/journals/JournalList';

const FILTERS_KEY = 'cjf_feed_filters';

function loadStoredFilters() {
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const hasAny = parsed.keyword || parsed.journal || parsed.dateFrom || parsed.dateTo;
    return hasAny ? parsed : null;
  } catch { return null; }
}

function saveStoredFilters(filters) {
  try {
    const hasAny = filters.keyword || filters.journal || filters.dateFrom || filters.dateTo;
    if (hasAny) localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    else localStorage.removeItem(FILTERS_KEY);
  } catch { /* ignore */ }
}

function filtersFromParams(params) {
  return {
    keyword: params.get('keyword') || '',
    journal: params.get('journal') || '',
    dateFrom: params.get('from') || '',
    dateTo: params.get('to') || '',
  };
}
const GA_REQUIRED_IDS = new Set([
  ...ACS_JOURNALS, ...RSC_JOURNALS, ...WILEY_JOURNALS,
  ...ELSEVIER_JOURNALS, ...SPRINGER_JOURNALS,
].map(j => j.id));

// Only hide articles on image failure for publishers where we *construct* GA URLs
// (Elsevier from PII, Springer from DOI) — a 404 means the GA genuinely doesn't exist.
// For ACS/RSC/Wiley the URL comes from the feed; failure = network/Cloudflare issue, not missing GA.
const GA_HIDE_ON_FAIL_IDS = new Set([
  ...ELSEVIER_JOURNALS, ...SPRINGER_JOURNALS,
].map(j => j.id));

const QUICK_FILTER_KEY = 'cjf_quick_filters';
function loadQuickFilters() {
  try { return JSON.parse(localStorage.getItem(QUICK_FILTER_KEY) || '{"enabled":false,"keywords":[],"authors":[]}'); }
  catch { return { enabled: false, keywords: [], authors: [] }; }
}


function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border-[1.5px] border-border overflow-hidden animate-pulse">
      <div className="flex items-stretch gap-0">
        <div className="hidden sm:flex flex-shrink-0 w-[405px] bg-slate-200 dark:bg-slate-700" style={{ minHeight: '160px' }} />
        <div className="flex-1 py-5 pr-5 pl-10 space-y-3">
          <div className="flex gap-2 items-center">
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ArticleFeed({ articles, isLoading, loadingProgress, onRefresh, followedCount, savedArticles = [], onSaveToggle, followedJournals = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  // Hydrate filters from localStorage on mount if URL has none
  // (e.g. returning from Journal Selector or Guide routes)
  useEffect(() => {
    const fromUrl = filtersFromParams(searchParams);
    const hasUrlFilters = fromUrl.keyword || fromUrl.journal || fromUrl.dateFrom || fromUrl.dateTo;
    if (hasUrlFilters) return;
    const stored = loadStoredFilters();
    if (!stored) return;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (stored.keyword) next.set('keyword', stored.keyword);
      if (stored.journal) next.set('journal', stored.journal);
      if (stored.dateFrom) next.set('from', stored.dateFrom);
      if (stored.dateTo) next.set('to', stored.dateTo);
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilters = useCallback((newFilters) => {
    saveStoredFilters(newFilters);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      // Update or remove each filter param
      if (newFilters.keyword) next.set('keyword', newFilters.keyword);
      else next.delete('keyword');
      if (newFilters.journal) next.set('journal', newFilters.journal);
      else next.delete('journal');
      if (newFilters.dateFrom) next.set('from', newFilters.dateFrom);
      else next.delete('from');
      if (newFilters.dateTo) next.set('to', newFilters.dateTo);
      else next.delete('to');
      return next;
    }, { replace: true });
  }, [setSearchParams]);
  const [quickFilters, setQuickFilters] = useState(loadQuickFilters);
  const [resetKey, setResetKey] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState(new Set());

  // Infinite scroll — only render a slice of articles, grow on scroll
  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // O(1) lookup for saved articles instead of .find() per card
  const savedMap = useMemo(() => {
    const m = new Map();
    savedArticles.forEach(s => m.set(s.article_id, s));
    return m;
  }, [savedArticles]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, quickFilters]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleImageFail = React.useCallback((articleId) => {
    setFailedImageIds(prev => {
      if (prev.has(articleId)) return prev;
      const next = new Set(prev);
      next.add(articleId);
      return next;
    });
  }, []);

  const handleResetArticles = () => {
    clearAllSeenArticles();
    setResetKey(prev => prev + 1);
  };

  const filtered = useMemo(() => {
    const results = articles.filter(a => {
      // Hide articles that lack a graphical abstract (e.g. corrections, errata, early papers)
      if (GA_REQUIRED_IDS.has(a.journalId) && !getCachedImage(a)) return false;
      // Also hide if the GA image failed to load (404 from publisher CDN)
      // Only for Elsevier/Springer where URLs are constructed and 404 = no GA exists
      if (GA_HIDE_ON_FAIL_IDS.has(a.journalId) && failedImageIds.has(a.link)) return false;

      const kw = filters.keyword.toLowerCase();
      const authorStr = (Array.isArray(a.author) ? a.author.join(' ') : a.author || '').toLowerCase();
      if (kw && !a.title?.toLowerCase().includes(kw) && !a.content?.toLowerCase().includes(kw) && !a.description?.toLowerCase().includes(kw) && !authorStr.includes(kw)) return false;

      if (filters.journal && a.journalId !== filters.journal) return false;

      if (filters.dateFrom && a.pubDate) {
        if (new Date(a.pubDate) < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo && a.pubDate) {
        if (new Date(a.pubDate) > new Date(filters.dateTo + 'T23:59:59')) return false;
      }

      if (quickFilters.enabled && (quickFilters.keywords.length > 0 || quickFilters.authors.length > 0)) {
        const haystack = [a.title || '', a.content || '', a.description || ''].join(' ').toLowerCase();
        const aStr = (Array.isArray(a.author) ? a.author.join(' ') : a.author || '').toLowerCase();
        const kwMatch = quickFilters.keywords.length === 0 || quickFilters.keywords.some(k => haystack.includes(k.toLowerCase()));
        const auMatch = quickFilters.authors.length === 0 || quickFilters.authors.some(au => aStr.includes(au.toLowerCase()));
        if (!kwMatch || !auMatch) return false;
      }

      return true;
    });

    // Primary sort: journal name A→Z; secondary sort: newest first within each journal
    results.sort((a, b) => {
      const cmp = (a.journalAbbrev || '').localeCompare(b.journalAbbrev || '', undefined, { sensitivity: 'base' });
      if (cmp !== 0) return cmp;
      return new Date(b.pubDate || 0) - new Date(a.pubDate || 0);
    });

    return results;
  }, [articles, filters, quickFilters, failedImageIds]);

  // Slice for rendering — only mount what's needed
  const visibleArticles = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll observer — loads more articles when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleCount(prev => prev + PAGE_SIZE);
      }
    }, { rootMargin: '400px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  if (followedCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
          <Inbox className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Welcome to Literature Tracker</h3>
        <p className="text-lg text-blue-600 dark:text-blue-400 max-w-lg flex flex-wrap items-center justify-center gap-x-1">
          <span>To get started, select your favorite journals in</span>
          <span className="inline-flex items-center gap-1"><Settings className="w-4 h-4 font-bold" /><strong>Journal Selector</strong></span>
          <span>and view them in the</span>
          <strong>Feed</strong>
        </p>
      </motion.div>
    );
  }

  if (isLoading) {
    const progressLabel = loadingProgress?.total > 0
      ? `Loading ${Math.min(loadingProgress.done, loadingProgress.total)} of ${loadingProgress.total} journals…`
      : 'Loading articles…';

    return (
      <div>
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Latest Articles</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{progressLabel}</p>
          </div>
          {loadingProgress?.total > 0 && (
            <div className="flex-shrink-0 mx-4">
              <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((loadingProgress.done / loadingProgress.total) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  // Build journal list from both loaded articles AND all active followed journals
  const journalsFromArticles = new Map(
    articles.map(a => [a.journalId, { id: a.journalId, name: a.journalAbbrev, color: a.journalColor }])
  );
  const activeFollowed = followedJournals.filter(j => j.is_active);
  activeFollowed.forEach(j => {
    if (!journalsFromArticles.has(j.journal_id)) {
      const meta = ALL_JOURNALS.find(x => x.id === j.journal_id);
      journalsFromArticles.set(j.journal_id, {
        id: j.journal_id,
        name: meta?.abbrev || j.journal_name,
        color: meta?.color || '#0066b3',
      });
    }
  });
  const journals = [...journalsFromArticles.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  return (
    <div>
      {/* 3-column row: heading | journal picker (centered) | sort + reset */}
      <div className="flex items-center mb-4">
        {/* Left: heading */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Latest Articles</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filtered.length}{filtered.length !== articles.length ? ` of ${articles.length}` : ''} article{filtered.length !== 1 ? 's' : ''} from {followedCount} journal{followedCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Center: journal filter */}
        <div className="feed-pulse-strong flex-shrink-0 mx-4 rounded-lg">
          <select
            value={filters.journal}
            onChange={e => setFilters({ ...filters, journal: e.target.value })}
            className="h-9 text-sm border border-blue-200 dark:border-blue-700 rounded-lg px-3 bg-blue-50/60 dark:bg-blue-900/30 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
          >
            <option value="">All Selected Journals</option>
            {journals.map(j => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </div>

        {/* Right: reset */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <Tooltip label="Reset all articles to 'unread' (blue titles)" delay={500} className="app-tooltip-lg">
            <Button
              onClick={handleResetArticles}
              size="sm"
              variant="outline"
              className="text-xs border border-blue-100 dark:border-slate-600 rounded-lg bg-blue-50/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-100/60 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
          </Tooltip>
        </div>
      </div>

      <ArticleFilters
        articles={articles}
        filters={filters}
        onChange={setFilters}
        quickFilters={quickFilters}
        onQuickFiltersChange={setQuickFilters}
      />

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {visibleArticles.map((article, index) => (
            <ArticleCard
              key={`${article.journalId}-${article.link}`}
              article={article}
              index={index}
              savedRecord={savedMap.get(article.link)}
              onSaveToggle={onSaveToggle}
              resetKey={resetKey}
              onImageFail={GA_HIDE_ON_FAIL_IDS.has(article.journalId) ? handleImageFail : undefined}
              cachedImageUrl={getCachedImage(article)}
            />
          ))}
        </AnimatePresence>
        {/* Sentinel for infinite scroll */}
        {hasMore && <div ref={sentinelRef} className="h-4" />}
      </div>

      {filtered.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-amber-400 dark:text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No articles found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            We couldn't fetch articles right now. Try refreshing or check back later.
          </p>
        </motion.div>
      )}

      {/* Back to Top button — centered at bottom */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl border border-slate-600 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
            Top
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating up-arrow on the right edge — mid-screen vertical */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed right-[max(0.5rem,calc(50vw-41.75rem))] top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-7 h-11 rounded-lg bg-slate-700 hover:bg-slate-600 text-white shadow-lg hover:shadow-xl border border-slate-600 transition-colors"
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
