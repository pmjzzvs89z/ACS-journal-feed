import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, RotateCcw, Settings, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ArticleCard, { clearAllSeenArticles, extractImage } from './ArticleCard';
import ArticleFilters from './ArticleFilters';
import { ALL_JOURNALS, ACS_JOURNALS, RSC_JOURNALS, WILEY_JOURNALS, ELSEVIER_JOURNALS, SPRINGER_JOURNALS } from '@/components/journals/JournalList';

const DEFAULT_FILTERS = { keyword: '', journal: '', dateFrom: '', dateTo: '' };
const GA_REQUIRED_IDS = new Set([
  ...ACS_JOURNALS, ...RSC_JOURNALS, ...WILEY_JOURNALS,
  ...ELSEVIER_JOURNALS, ...SPRINGER_JOURNALS,
].map(j => j.id));

const QUICK_FILTER_KEY = 'cjf_quick_filters';
function loadQuickFilters() {
  try { return JSON.parse(localStorage.getItem(QUICK_FILTER_KEY) || '{"enabled":false,"keywords":[],"authors":[]}'); }
  catch { return { enabled: false, keywords: [], authors: [] }; }
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
];

function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border-[1.5px] border-border overflow-hidden animate-pulse">
      <div className="flex items-stretch gap-0">
        <div className="hidden sm:flex flex-shrink-0 w-[368px] bg-slate-200 dark:bg-slate-700" style={{ minHeight: '160px' }} />
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
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [quickFilters, setQuickFilters] = useState(loadQuickFilters);
  const [sortBy, setSortBy] = useState('date_desc');
  const [resetKey, setResetKey] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleResetArticles = () => {
    clearAllSeenArticles();
    setResetKey(prev => prev + 1);
  };

  const filtered = useMemo(() => {
    const results = articles.filter(a => {
      // Hide articles that lack a graphical abstract (e.g. corrections, errata, early papers)
      if (GA_REQUIRED_IDS.has(a.journalId) && !extractImage(a)) return false;

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

    if (sortBy === 'date_asc') {
      results.sort((a, b) => new Date(a.pubDate || 0) - new Date(b.pubDate || 0));
    } else {
      results.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
    }

    return results;
  }, [articles, filters, quickFilters, sortBy]);

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
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No journals selected</h3>
        <p className="text-blue-600 dark:text-blue-400 max-w-md flex flex-wrap items-center justify-center gap-x-1">
          <span>To see recent research articles in your feed, select</span>
          <span className="inline-flex items-center gap-1"><Settings className="w-4 h-4" /><strong>Journal Selector</strong></span>
          <span className="ml-1">button in the top right corner.</span>
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
  const journals = [...journalsFromArticles.values()].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      {/* 3-column row: heading | journal picker (centered) | sort + reset */}
      <div className="flex items-center mb-4">
        {/* Left: heading */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Latest Articles</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filtered.length}{filtered.length !== articles.length ? ` of ${articles.length}` : ''} article{filtered.length !== 1 ? 's' : ''} from {followedCount} journal{followedCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Center: journal filter */}
        <div className="flex-shrink-0 mx-4">
          <select
            value={filters.journal}
            onChange={e => setFilters({ ...filters, journal: e.target.value })}
            className="h-9 text-sm border border-blue-100 dark:border-slate-600 rounded-lg px-3 bg-blue-50/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-blue-100/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <option value="">All Selected Journals</option>
            {journals.map(j => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </div>

        {/* Right: sort + reset */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-9 text-sm border border-blue-100 dark:border-slate-600 rounded-lg px-3 bg-blue-50/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-blue-100/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button
            onClick={handleResetArticles}
            size="sm"
            variant="outline"
            className="text-xs border border-blue-100 dark:border-slate-600 rounded-lg bg-blue-50/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-100/60 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
            title="Reset all articles to blue"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>
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
          {filtered.map((article, index) => (
            <ArticleCard
              key={`${article.journalId}-${article.link}`}
              article={article}
              index={index}
              savedRecord={savedArticles.find(s => s.article_id === article.link)}
              onSaveToggle={onSaveToggle}
              resetKey={resetKey}
            />
          ))}
        </AnimatePresence>
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-accent text-foreground text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl border border-border transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
            Top
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
