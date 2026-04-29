// @ts-nocheck — see ArticleCard for rationale
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Settings, ArrowUp, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import ArticleCard from './ArticleCard';
import { clearAllSeenArticles } from '@/utils/seenArticles';
import { getCachedImage } from '@/utils/articleMeta';
import ArticleFilters from './ArticleFilters';
import JournalDropdown from './JournalDropdown';
import SkeletonCard from './SkeletonCard';
import Tooltip from '@/components/ui/Tooltip';
import { useAuth } from '@/lib/AuthContext';
import {
  ALL_JOURNALS, ACS_JOURNALS, RSC_JOURNALS, WILEY_JOURNALS, ELSEVIER_JOURNALS, SPRINGER_JOURNALS,
  MDPI_JOURNALS, TAYLOR_JOURNALS, AAAS_JOURNALS,
  ACS_MATERIALS_JOURNALS, RSC_MATERIALS_JOURNALS, WILEY_MATERIALS_JOURNALS,
  ELSEVIER_MATERIALS_JOURNALS, MDPI_MATERIALS_JOURNALS, SPRINGER_MATERIALS_JOURNALS,
  IOP_MATERIALS_JOURNALS,
  ACS_ENGINEERING_JOURNALS, RSC_ENGINEERING_JOURNALS, WILEY_ENGINEERING_JOURNALS,
  ELSEVIER_ENGINEERING_JOURNALS, SPRINGER_ENGINEERING_JOURNALS,
  TAYLOR_ENGINEERING_JOURNALS, ASME_ENGINEERING_JOURNALS, ICHEMEE_ENGINEERING_JOURNALS,
  PUBLISHER_ORDER,
} from '@/components/journals/JournalList';

const PUBLISHER_ID_MAP = (() => {
  const map = new Map();
  const add = (arr, key) => arr.forEach(j => map.set(j.id, key));
  add(ACS_JOURNALS, 'acs');
  add(ACS_MATERIALS_JOURNALS, 'acs');
  add(ACS_ENGINEERING_JOURNALS, 'acs');
  add(RSC_JOURNALS, 'rsc');
  add(RSC_MATERIALS_JOURNALS, 'rsc');
  add(RSC_ENGINEERING_JOURNALS, 'rsc');
  add(WILEY_JOURNALS, 'wiley');
  add(WILEY_MATERIALS_JOURNALS, 'wiley');
  add(WILEY_ENGINEERING_JOURNALS, 'wiley');
  add(ELSEVIER_JOURNALS, 'elsevier');
  add(ELSEVIER_MATERIALS_JOURNALS, 'elsevier');
  add(ELSEVIER_ENGINEERING_JOURNALS, 'elsevier');
  add(MDPI_JOURNALS, 'mdpi');
  add(MDPI_MATERIALS_JOURNALS, 'mdpi');
  add(SPRINGER_JOURNALS, 'springer');
  add(SPRINGER_MATERIALS_JOURNALS, 'springer');
  add(SPRINGER_ENGINEERING_JOURNALS, 'springer');
  add(TAYLOR_JOURNALS, 'taylor');
  add(TAYLOR_ENGINEERING_JOURNALS, 'taylor');
  add(AAAS_JOURNALS, 'aaas');
  add(ASME_ENGINEERING_JOURNALS, 'asme');
  add(ICHEMEE_ENGINEERING_JOURNALS, 'icheme');
  add(IOP_MATERIALS_JOURNALS, 'iop');
  return map;
})();

const FILTERS_KEY_BASE = 'cjf_feed_filters';
const LEGACY_FILTERS_KEY = 'cjf_feed_filters';

function filtersKeyFor(userId) {
  return userId ? `${FILTERS_KEY_BASE}:${userId}` : null;
}

function loadStoredFilters(userId) {
  const key = filtersKeyFor(userId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed.journal ? { journal: parsed.journal } : null;
  } catch { return null; }
}

function saveStoredFilters(userId, filters) {
  const key = filtersKeyFor(userId);
  if (!key) return;
  try {
    if (filters.journal) localStorage.setItem(key, JSON.stringify({ journal: filters.journal }));
    else localStorage.removeItem(key);
  } catch { /* ignore */ }
}

// Purge legacy un-namespaced key so it can never bleed between accounts
try { localStorage.removeItem(LEGACY_FILTERS_KEY); } catch { /* ignore */ }

function filtersFromParams(params) {
  return {
    journal: params.get('journal') || '',
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


export default function ArticleFeed({ articles, failedJournals = [], isLoading, isLoadingJournals = false, hasJournalsHint = null, loadingProgress, onRefresh, followedCount, savedArticles = [], onSaveToggle, followedJournals = [] }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const urlFilters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const filters = useMemo(() => ({ keyword, journal: urlFilters.journal }), [keyword, urlFilters.journal]);

  // Build a set of the current user's active journal IDs so we can detect
  // stale filters left over from a different account.
  const activeJournalIds = useMemo(
    () => new Set(followedJournals.filter(j => j.is_active).map(j => j.journal_id)),
    [followedJournals]
  );

  // Hydrate journal filter from localStorage on mount if URL has none
  // (e.g. returning from Journal Selector or Guide routes).
  // Also clear any stale filter that references a journal the current
  // account doesn't follow — prevents an invisible empty feed after
  // switching accounts.
  useEffect(() => {
    const fromUrl = filtersFromParams(searchParams);
    // If the URL has a journal filter that doesn't match any followed journal, clear it
    if (fromUrl.journal && activeJournalIds.size > 0 && !activeJournalIds.has(fromUrl.journal)) {
      saveStoredFilters(userId, { journal: '' });
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('journal');
        return next;
      }, { replace: true });
      return;
    }
    if (fromUrl.journal) return;
    const stored = loadStoredFilters(userId);
    if (!stored?.journal) return;
    // Also validate stored filter against current journals
    if (activeJournalIds.size > 0 && !activeJournalIds.has(stored.journal)) {
      saveStoredFilters(userId, { journal: '' });
      return;
    }
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('journal', stored.journal);
      return next;
    }, { replace: true });

  }, [activeJournalIds]);

  const setFilters = useCallback((newFilters) => {
    // Keyword stays in local state only — never written to URL.
    setKeyword(newFilters.keyword || '');
    // Only journal is persisted to URL + localStorage.
    saveStoredFilters(userId, { journal: newFilters.journal });
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newFilters.journal) next.set('journal', newFilters.journal);
      else next.delete('journal');
      return next;
    }, { replace: true });
  }, [setSearchParams, userId]);
  const [resetKey, setResetKey] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState(new Set());

  // Infinite scroll — only render a slice of articles, grow on scroll
  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // Failed-feeds banner: auto-dismiss after 60s, also dismissible by user.
  // Keyed off the failure list so a fresh set of failures re-shows the banner.
  const failedKey = failedJournals.join('|');
  const [dismissedFailedKey, setDismissedFailedKey] = useState('');
  useEffect(() => {
    if (!failedKey) return;
    setDismissedFailedKey('');
    const t = setTimeout(() => setDismissedFailedKey(failedKey), 60000);
    return () => clearTimeout(t);
  }, [failedKey]);
  const showFailedBanner = failedJournals.length > 0 && dismissedFailedKey !== failedKey;

  // O(1) lookup for saved articles instead of .find() per card
  const savedMap = useMemo(() => {
    const m = new Map();
    savedArticles.forEach(s => m.set(s.article_id, s));
    return m;
  }, [savedArticles]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Accumulate image failures in a ref and flush to state every ~300ms so
  // a burst of staggered 404s (which each trigger `handleImageFail`) causes
  // at most one re-filter pass instead of N. Without this, the `filtered`
  // memo rebuilds on every single image failure, visibly stuttering the
  // feed when many GA URLs 404 at once.
  const pendingFailedRef = useRef(new Set());
  const failedFlushTimerRef = useRef(null);
  useEffect(() => () => {
    if (failedFlushTimerRef.current) clearTimeout(failedFlushTimerRef.current);
  }, []);
  const handleImageFail = React.useCallback((articleId) => {
    if (pendingFailedRef.current.has(articleId)) return;
    pendingFailedRef.current.add(articleId);
    if (failedFlushTimerRef.current) return;
    failedFlushTimerRef.current = setTimeout(() => {
      failedFlushTimerRef.current = null;
      const pending = pendingFailedRef.current;
      if (pending.size === 0) return;
      pendingFailedRef.current = new Set();
      setFailedImageIds(prev => {
        let added = false;
        const next = new Set(prev);
        pending.forEach(id => { if (!next.has(id)) { next.add(id); added = true; } });
        return added ? next : prev;
      });
    }, 300);
  }, []);

  const handleResetArticles = () => {
    clearAllSeenArticles();
    setResetKey(prev => prev + 1);
  };

  const filtered = useMemo(() => {
    const applyFilters = (requireGA) => articles.filter(a => {
      // Hide articles that lack a graphical abstract (e.g. corrections, errata, early papers)
      if (requireGA && GA_REQUIRED_IDS.has(a.journalId) && !getCachedImage(a)) return false;
      // Also hide if the GA image failed to load (404 from publisher CDN)
      // Only for Elsevier/Springer where URLs are constructed and 404 = no GA exists
      if (requireGA && GA_HIDE_ON_FAIL_IDS.has(a.journalId) && failedImageIds.has(a.link)) return false;

      const kw = filters.keyword.toLowerCase();
      const authorStr = (Array.isArray(a.author) ? a.author.join(' ') : a.author || '').toLowerCase();
      if (kw && !a.title?.toLowerCase().includes(kw) && !a.content?.toLowerCase().includes(kw) && !a.description?.toLowerCase().includes(kw) && !authorStr.includes(kw)) return false;

      if (filters.journal && a.journalId !== filters.journal) return false;

      return true;
    });

    // Try with GA filter first; if it hides ALL articles, fall back to
    // showing them without images rather than displaying an empty feed.
    let results = applyFilters(true);
    if (results.length === 0 && articles.length > 0) {
      results = applyFilters(false);
    }

    // Primary sort: journal name A→Z; secondary sort: newest first within each journal
    results.sort((a, b) => {
      const cmp = (a.journalAbbrev || '').localeCompare(b.journalAbbrev || '', undefined, { sensitivity: 'base' });
      if (cmp !== 0) return cmp;
      return new Date(b.pubDate || 0) - new Date(a.pubDate || 0);
    });

    return results;
  }, [articles, filters, failedImageIds]);

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

  // Keyboard shortcut: tap Cmd (Mac) or Ctrl (Windows/Linux) alone to toggle
  // the journal-filter dropdown. "Tap" means press + release without any
  // other key pressed in between — so Cmd+C, Ctrl+A, etc. are not affected.
  useEffect(() => {
    let modifierIsolated = false;
    const isModifier = (key) => key === 'Meta' || key === 'Control';
    const isTypingTarget = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };
    const onKeyDown = (e) => {
      if (e.repeat) return;
      if (isModifier(e.key)) {
        modifierIsolated = true;
      } else {
        // Any non-modifier key press — the modifier is being used in a combo
        modifierIsolated = false;
      }
    };
    const onKeyUp = (e) => {
      if (!isModifier(e.key)) return;
      const tapped = modifierIsolated;
      modifierIsolated = false;
      if (!tapped) return;
      if (isTypingTarget()) return;
      const btn = document.getElementById('feed-journal-dropdown-trigger');
      if (btn) {
        btn.click();
        // Focus the button so Arrow Up/Down keys flow to its keydown handler
        btn.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Build journal list from both loaded articles AND all active followed journals.
  // Dedupe by RSS URL so cross-field siblings (same feed, different journal ID)
  // don't appear twice in the dropdown. Home.jsx fetches a single entry per URL
  // and tags its articles with one specific journal_id; we preserve that ID here
  // so the filter actually finds the tagged articles.
  const journalsFromArticles = useMemo(() => {
    const map = new Map();                  // key: journal id → journal meta
    const seenRss = new Set();               // dedupe set
    const idByRss = new Map();               // rss_url → chosen id (the one articles are tagged with)

    // First pass: journals that have articles — these are authoritative.
    articles.forEach(a => {
      if (map.has(a.journalId)) return;
      map.set(a.journalId, { id: a.journalId, name: a.journalAbbrev, color: a.journalColor });
      const meta = ALL_JOURNALS.find(x => x.id === a.journalId);
      if (meta) {
        seenRss.add(meta.rss_url);
        idByRss.set(meta.rss_url, a.journalId);
      }
    });

    // Second pass: active followed journals that have no articles yet.
    // Skip any whose RSS URL has already been claimed by a sibling.
    followedJournals.filter(j => j.is_active).forEach(j => {
      if (seenRss.has(j.rss_url)) return;
      if (map.has(j.journal_id)) return;
      const meta = ALL_JOURNALS.find(x => x.id === j.journal_id);
      map.set(j.journal_id, {
        id: j.journal_id,
        name: meta?.abbrev || j.journal_name,
        color: meta?.color || '#0066b3',
      });
      seenRss.add(j.rss_url);
    });
    return map;
  }, [articles, followedJournals]);

  const welcomeScreen = (
    <motion.div
      key="welcome-screen"                 /* stable key: React keeps it mounted across conditional branches */
      initial={{ opacity: 0 }}              /* only opacity — no y-translate to avoid the layout jump on render */
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col items-center text-center px-4 pb-20"
      // 13.46vh ≈ vertically centers the block against the viewport
      // minus the sticky header. Tuned visually — do not change without
      // checking both short (no-scroll) and tall viewports.
      style={{ paddingTop: '13.46vh' }}
    >
      <img
        src="/logo.svg"
        alt="Literature Tracker"
        className="w-24 h-24 object-contain mb-6 drop-shadow-lg"
      />
      <h3 className="text-welcome sm:text-welcome-lg font-bold text-slate-900 dark:text-white mb-3">
        Welcome to Literature Tracker
      </h3>
      <p className="text-welcome-body text-[#0099ff] dark:text-[#0099ff] max-w-xl mb-6 leading-relaxed">
        This literature tracker allows you to follow any of the hundreds of
        journals across <span className="text-cyan-500 dark:text-cyan-400">Chemistry</span>,{' '}
        <span className="text-cyan-500 dark:text-cyan-400">Engineering</span>, and{' '}
        <span className="text-cyan-500 dark:text-cyan-400">Materials Science</span> — from ACS,
        RSC, Wiley, Elsevier, Springer Nature, and more.
      </p>
      <Link to={createPageUrl('Settings')} className="feed-pulse inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-welcome-cta font-semibold transition-colors bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 shadow-sm">
        <Settings className="w-4 h-4" />
        <span>Journal Selector</span>
      </Link>
    </motion.div>
  );

  // While the Supabase followed-journals query is still resolving, use
  // the cached hint from the previous session to decide what to show:
  //   - hint === false → show Welcome optimistically (no blank flash)
  //   - hint === true  → fall through to skeleton cards below
  //   - hint === null  → brand-new session, show blank (rare)
  if (isLoadingJournals) {
    if (hasJournalsHint === false) return welcomeScreen;
    if (hasJournalsHint === true) {
      // fall through to the isLoading branch below which renders skeletons
    } else {
      return <div />;
    }
  }

  // First-time users (followed journals confirmed empty) see the Welcome
  // screen — without flashing skeleton cards while RSS fetches resolve
  // to nothing. Gated on !isLoadingJournals so returning users with
  // hasJournalsHint=true don't briefly hit this branch (followedJournals
  // defaults to [] while the Supabase query resolves, which would
  // otherwise show Welcome for ~500ms before the feed appears).
  if (!isLoadingJournals && followedCount === 0) {
    return welcomeScreen;
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

  // Group journals by publisher in a fixed priority order (see PUBLISHER_ORDER
  // in JournalList.jsx), then alphabetically within each group. A gray
  // separator row is rendered between publishers in the dropdown.
  const publisherIndex = (id) => {
    const key = PUBLISHER_ID_MAP.get(id) || 'other';
    const idx = PUBLISHER_ORDER.indexOf(key);
    return idx === -1 ? PUBLISHER_ORDER.length : idx;
  };
  const journals = [...journalsFromArticles.values()].sort((a, b) => {
    const pa = publisherIndex(a.id);
    const pb = publisherIndex(b.id);
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

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
          <JournalDropdown
            value={filters.journal}
            onChange={(id) => setFilters({ ...filters, journal: id })}
            journals={journals}
            publisherKeyForId={(id) => PUBLISHER_ID_MAP.get(id) || 'other'}
          />
        </div>

        {/* Right: mark-unread */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <Tooltip label="Mark all articles as unread (blue titles)" delay={500}>
            <Button
              onClick={handleResetArticles}
              size="sm"
              variant="outline"
              className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            >
              Mark unread
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Per-journal failure banner — visible when some feeds failed.
          Auto-dismisses after 60s; user can also dismiss with the X button. */}
      {showFailedBanner && !isLoading && (
        <div className="flex items-start gap-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-500">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span>
              {failedJournals.length === 1
                ? `Couldn't reach ${failedJournals[0]}.`
                : `Couldn't reach ${failedJournals.length} journal${failedJournals.length > 1 ? 's' : ''}: ${failedJournals.slice(0, 5).join(', ')}${failedJournals.length > 5 ? `, +${failedJournals.length - 5} more` : ''}.`}
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-300 font-medium flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
          <button
            onClick={() => setDismissedFailedKey(failedKey)}
            aria-label="Dismiss"
            className="self-center flex items-center justify-center text-red-600/80 dark:text-red-500/80 hover:text-red-800 dark:hover:text-red-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <ArticleFilters
        filters={filters}
        onChange={setFilters}
      />

      <div className="space-y-4">
        {/* No AnimatePresence wrapper — cards have no entry/exit animation
            per the CLAUDE.md hard rule. popLayout mode added layout-tracking
            overhead that delayed unmount/mount by an animation tick, which
            in turn delayed the ReadCube extension's MutationObserver from
            scanning new DOI markers (visible as a ~500ms lag before the
            "Papers / PDF" buttons reappeared on filter change). */}
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
            {(filters.keyword || filters.journal)
              ? 'No articles match your current filters. Try clearing the search or changing the journal filter.'
              : failedJournals.length > 0
                ? 'All feeds failed to load. Check your connection and try again.'
                : 'We couldn\'t fetch articles right now. Try refreshing or check back later.'}
          </p>
          {failedJournals.length > 0 && !filters.keyword && !filters.journal && (
            <button
              onClick={onRefresh}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          )}
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white dark:bg-slate-300 dark:hover:bg-slate-400 dark:text-slate-900 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl border border-slate-600 dark:border-slate-400 transition-colors"
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
