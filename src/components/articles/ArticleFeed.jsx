import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, RotateCcw, Settings, ArrowUp, Check, ChevronDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import ArticleCard from './ArticleCard';
import { clearAllSeenArticles } from '@/utils/seenArticles';
import { getCachedImage } from '@/utils/articleMeta';
import ArticleFilters from './ArticleFilters';
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
} from '@/components/journals/JournalList';

// Distinct per-publisher accent colors used to underline journal names in
// the "All Selected Journals" dropdown so the user can recognize at a
// glance which publisher a journal belongs to.
//
// ⚠️  KEEP IN SYNC with the publisher color table in CLAUDE.md (section
//     "Publisher colors").  If you change a hex value here, update CLAUDE.md
//     and vice-versa so future sessions don't get conflicting guidance.
const PUBLISHER_COLORS = {
  acs:      '#2563eb', // blue-600
  elsevier: '#ea580c', // orange-600
  rsc:      '#c026d3', // fuchsia-600
  wiley:    '#16a34a', // green-600
  aaas:     '#dc2626', // red-600
  mdpi:     '#0891b2', // cyan-600
  springer: '#ca8a04', // yellow-600
  taylor:   '#7c3aed', // violet-600
  asme:     '#475569', // slate-600
  icheme:   '#475569', // slate-600
  iop:      '#475569', // slate-600
};

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

function publisherColorForJournalId(id) {
  const key = PUBLISHER_ID_MAP.get(id);
  return key ? PUBLISHER_COLORS[key] : '#64748b';
}

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

function JournalDropdown({ value, onChange, journals }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = journals.find(j => j.id === value);
  const label = selected ? selected.name : 'All Selected Journals';

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 h-9 text-sm border border-slate-300 dark:border-blue-700 rounded-lg px-3 bg-slate-200/80 dark:bg-blue-900/30 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-slate-300/80 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
      >
        <span className="truncate max-w-[220px]">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>
      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 min-w-[220px] max-h-[90vh] overflow-y-auto rounded-xl py-1 shadow-2xl bg-neutral-100 dark:bg-[rgb(28,30,38)] border border-neutral-300 dark:border-white/10"
          style={{
            zIndex: 9999,
            isolation: 'isolate',
          }}
        >
          {(() => {
            const PUB_LABELS = {
              acs: 'ACS', elsevier: 'Elsevier', rsc: 'RSC', wiley: 'Wiley',
              aaas: 'AAAS', mdpi: 'MDPI', springer: 'Springer Nature',
              taylor: 'Taylor & Francis', asme: 'ASME', icheme: 'IChemE',
              iop: 'IOP Publishing', other: 'Other',
            };
            const rows = [];
            rows.push({ type: 'item', journal: { id: '', name: 'All Selected Journals' }, isFirstInGroup: true, pub: null });
            let prevPub = null;
            journals.forEach((j, idx) => {
              const pub = PUBLISHER_ID_MAP.get(j.id) || 'other';
              const isFirstInGroup = idx === 0 || pub !== prevPub;
              if (isFirstInGroup) {
                rows.push({ type: 'sep', key: `sep-${idx}-${pub}` });
                rows.push({ type: 'label', key: `lbl-${pub}`, pub });
              }
              rows.push({ type: 'item', journal: j, isFirstInGroup, pub });
              prevPub = pub;
            });
            return rows.map((row) => {
              if (row.type === 'sep') {
                return (
                  <div
                    key={row.key}
                    className="my-1 mx-3 border-t border-slate-300 dark:border-white/15"
                  />
                );
              }
              if (row.type === 'label') {
                const labelColor = PUBLISHER_COLORS[row.pub] || '#64748b';
                return (
                  <div key={row.key} className="px-3 pt-0.5 pb-[1px]">
                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: labelColor }}>
                      {PUB_LABELS[row.pub] || row.pub}
                    </span>
                  </div>
                );
              }
              const j = row.journal;
              const isSelected = j.id === value;
              const publisherColor = j.id ? publisherColorForJournalId(j.id) : null;
              return (
                <button
                  key={j.id || '__all'}
                  type="button"
                  onClick={() => { onChange(j.id); setOpen(false); }}
                  className="w-full flex items-center gap-2 pl-3 pr-4 py-[0.08rem] text-sm text-left transition-colors text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="w-4 flex-shrink-0 flex items-center justify-center">
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : publisherColor ? (
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: publisherColor }} />
                    ) : null}
                  </span>
                  <span className="truncate">
                    {j.name}
                  </span>
                </button>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-slate-50 dark:bg-card rounded-2xl border-card border-slate-400/80 dark:border-slate-600 overflow-hidden animate-pulse">
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

export default function ArticleFeed({ articles, failedJournals = [], isLoading, loadingProgress, onRefresh, followedCount, savedArticles = [], onSaveToggle, followedJournals = [] }) {
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
  }, [setSearchParams]);
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
  }, [filters]);

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

  if (followedCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
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
        <p className="text-welcome-body text-blue-600 dark:text-blue-400 max-w-xl mb-6 leading-relaxed">
          This literature tracker allows you to follow any of the hundreds of
          journals across <span className="text-yellow-800 dark:text-yellow-500">Chemistry</span>,{' '}
          <span className="text-yellow-800 dark:text-yellow-500">Engineering</span>, and{' '}
          <span className="text-yellow-800 dark:text-yellow-500">Materials Science</span> — from ACS,
          RSC, Wiley, Elsevier, Springer Nature, and more.
        </p>
        <Link to={createPageUrl('Settings')}>
          <button className="feed-pulse inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-welcome-cta font-semibold transition-colors bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 shadow-sm">
            <Settings className="w-4 h-4" />
            <span>Journal Selector</span>
          </button>
        </Link>
      </motion.div>
    );
  }

  // Group journals by publisher in a fixed priority order, then alphabetically
  // within each group. A gray separator row is rendered between publishers in
  // the dropdown to visually distinguish them.
  const PUBLISHER_ORDER = ['acs', 'elsevier', 'rsc', 'wiley', 'mdpi', 'springer', 'taylor', 'aaas', 'asme', 'icheme', 'iop', 'other'];
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
          />
        </div>

        {/* Right: reset */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <Tooltip label="Reset all articles to 'unread' (blue titles)" delay={500}>
            <Button
              onClick={handleResetArticles}
              size="sm"
              variant="outline"
              className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Per-journal failure banner — visible when some feeds failed */}
      {failedJournals.length > 0 && !isLoading && (
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
        </div>
      )}

      <ArticleFilters
        filters={filters}
        onChange={setFilters}
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
