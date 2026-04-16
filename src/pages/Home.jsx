import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { entities } from '@/api/entities';
import { fetchRssFeed } from '@/utils/fetchRss';
import { useQuery } from '@tanstack/react-query';
import { Settings, Bookmark, Rss, BookOpen, RefreshCw, Moon, Sun, LogOut } from 'lucide-react';
import ArticleFeed from '@/components/articles/ArticleFeed';
import SavedFeed from '@/components/articles/SavedFeed';
import RecommendedFeed from '@/components/articles/RecommendedFeed';
import { setSeenArticlesUser, getSeenArticleIds } from '@/utils/seenArticles';
import { ALL_JOURNALS } from '@/components/journals/JournalList';
import Tooltip from '@/components/ui/Tooltip';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/lib/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAutoSave } from '@/hooks/useAutoSave';

export default function Home() {
  const [loadingProgress, setLoadingProgress] = useState({ done: 0, total: 0 });
  const progressSetterRef = useRef(setLoadingProgress);
  progressSetterRef.current = setLoadingProgress;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'feed';
  const setActiveTab = useCallback((tab) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tab === 'feed') next.delete('tab');
      else next.set('tab', tab);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [showRefreshBanner, setShowRefreshBanner] = useState(false);
  const [userKeywords, setUserKeywords] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [isDark, toggleDark] = useDarkMode();

  // Offline indicator — shows a small banner when the browser reports no
  // network. React Query will keep serving cached data, but the user should
  // know why the feed isn't refreshing.
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  const { logout, user } = useAuth();
  const userId = user?.id;

  useEffect(() => { document.title = 'Literature Tracker'; }, []);

  const location = useLocation();
  const isSettingsActive = location.pathname === createPageUrl('Settings');
  const isGuideActive = location.pathname === createPageUrl('Guide');

  // Fetch followed journals — keep fresh for 10 min so navigating back doesn't trigger a refetch.
  // Query key includes userId so each account has its own cache entry and
  // switching users never serves stale data from the previous account.
  // Disabled until auth resolves to avoid a "Not authenticated" throw from getUserId().
  // isPending (not isLoading) so that `isLoadingJournals` stays true while
  // the query is disabled during auth init.  In TanStack Query v5,
  // isLoading = isPending && isFetching — disabled queries have isFetching
  // = false, so isLoading would be false and prematurely enable the
  // articles query with an empty journal list.
  const { data: followedJournals = [], isPending: isLoadingJournals } = useQuery({
    queryKey: ['followedJournals', userId],
    queryFn: () => entities.FollowedJournal.list(),
    staleTime: 10 * 60 * 1000,
    enabled: !!userId,
  });

  // Fetch saved articles — same per-user isolation as above.
  const { data: savedArticles = [], refetch: refetchSaved } = useQuery({
    queryKey: ['savedArticles', userId],
    queryFn: () => entities.SavedArticle.list(),
    enabled: !!userId,
  });

  // Stable query key based on sorted active journal IDs
  const journalQueryKey = useMemo(() => {
    const ids = followedJournals
      .filter(j => j.is_active)
      .map(j => j.journal_id)
      .sort()
      .join(',');
    return ['articles', ids || 'none'];
  }, [followedJournals]);

  // RSS fetch function for TanStack Query.
  // Returns { articles, failedJournals } so ArticleFeed can surface
  // per-journal failure banners instead of showing a silent empty feed.
  const fetchArticlesQuery = useCallback(async () => {
    const knownIds = new Set(ALL_JOURNALS.map(j => j.id));
    // Deduplicate by RSS URL so cross-field siblings (same feed, different
    // journal ID) are only fetched once.
    const seenRss = new Set();
    const activeJournals = followedJournals.filter(j => {
      if (!j.is_active || !knownIds.has(j.journal_id)) return false;
      if (seenRss.has(j.rss_url)) return false;
      seenRss.add(j.rss_url);
      return true;
    });
    if (activeJournals.length === 0) return { articles: [], failedJournals: [] };

    progressSetterRef.current({ done: 0, total: activeJournals.length });
    const allArticles = [];
    const failedJournals = [];

    const BATCH_SIZE = 6;
    for (let i = 0; i < activeJournals.length; i += BATCH_SIZE) {
      const batch = activeJournals.slice(i, i + BATCH_SIZE);
      if (i > 0) await new Promise(r => setTimeout(r, 400));
      await Promise.all(
        batch.map(async (journal) => {
          const journalInfo = ALL_JOURNALS.find(j => j.id === journal.journal_id);
          try {
            const data = await fetchRssFeed(journal.rss_url);
            if (data.status === 'ok' && data.items) {
              const journalArticles = data.items.map(item => ({
                ...item,
                journalId: journal.journal_id,
                journalName: journal.journal_name,
                journalAbbrev: journalInfo?.abbrev || journal.journal_name,
                journalColor: journalInfo?.color || '#0066b3',
              }));
              allArticles.push(...journalArticles);
            } else {
              failedJournals.push(journalInfo?.abbrev || journal.journal_name);
            }
          } catch (_error) {
            failedJournals.push(journalInfo?.abbrev || journal.journal_name);
          }
        })
      );
      progressSetterRef.current({ done: Math.min(i + BATCH_SIZE, activeJournals.length), total: activeJournals.length });
    }

    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    return { articles: allArticles, failedJournals };
  }, [followedJournals]);

  // Cached RSS query — stays fresh for 20 minutes
  // Only block on isLoadingJournals if we have no journal data yet (first load).
  // On subsequent mounts (navigating back), followedJournals is already cached,
  // so journalQueryKey is stable and the articles cache is served instantly.
  const hasJournalData = followedJournals.length > 0;
  const {
    data: feedResult,
    isLoading: isLoadingArticles,
    dataUpdatedAt,
    refetch: refetchArticles,
  } = useQuery({
    queryKey: journalQueryKey,
    queryFn: fetchArticlesQuery,
    staleTime: 20 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: hasJournalData || !isLoadingJournals,
  });

  const articles = feedResult?.articles ?? [];
  const failedJournals = feedResult?.failedJournals ?? [];

  // Auto-save articles that match the user's keyword/author rules
  const { autoSaveEnabled } = useAutoSave(articles, userId);

  // Propagate the signed-in user id to the seen-articles module so that
  // every read/write (including those inside ArticleCard) uses the
  // per-user storage key. Must run before the unread-count effect so the
  // count reflects the correct user's read history after an account
  // switch.
  useEffect(() => {
    setSeenArticlesUser(userId);
  }, [userId]);

  // Unread badge count — re-computes whenever articles or the signed-in
  // user changes, so switching accounts immediately reflects the new
  // user's reading history.
  useEffect(() => {
    if (!articles.length) { setUnreadCount(0); return; }
    try {
      const seen = getSeenArticleIds();
      setUnreadCount(articles.filter(a => !seen.has(a.link)).length);
    } catch { /* ignore */ }
  }, [articles, userId]);

  // "New articles available" banner — show after 90 min since last fetch
  useEffect(() => {
    if (!dataUpdatedAt) { setShowRefreshBanner(false); return; }
    const check = () => setShowRefreshBanner(Date.now() - dataUpdatedAt > 90 * 60 * 1000);
    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const handleRefresh = () => {
    setShowRefreshBanner(false);
    refetchArticles();
  };

  // Dedupe by RSS URL so cross-field siblings count as one journal
  // (matches the dedup used for fetching and for the Settings panel).
  const activeJournalCount = (() => {
    const seen = new Set();
    return followedJournals.filter(j => {
      if (!j.is_active) return false;
      if (seen.has(j.rss_url)) return false;
      seen.add(j.rss_url);
      return true;
    }).length;
  })();

  // Keyboard shortcuts (j/k navigate focused article, s save, o open, ? help).
  // Disabled whenever focus is in an input/textarea/contenteditable or any
  // modal dialog is open — we don't want to hijack typing.
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  useEffect(() => {
    const isTypingContext = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.getAttribute && el.getAttribute('contenteditable') === 'true') return true;
      if (document.querySelector('[role="dialog"]')) return true;
      return false;
    };
    const focusArticleByIndex = (idx) => {
      const cards = document.querySelectorAll('main article');
      if (!cards.length) return;
      const clamped = Math.max(0, Math.min(cards.length - 1, idx));
      const card = cards[clamped];
      card.scrollIntoView({ block: 'center', behavior: 'smooth' });
      const link = card.querySelector('a[href]');
      if (link instanceof HTMLElement) link.focus({ preventScroll: true });
    };
    const currentArticleIndex = () => {
      const cards = Array.from(document.querySelectorAll('main article'));
      const active = document.activeElement;
      const idx = cards.findIndex(c => c.contains(active));
      return idx === -1 ? 0 : idx;
    };
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingContext()) return;
      if (e.key === 'j') { e.preventDefault(); focusArticleByIndex(currentArticleIndex() + 1); }
      else if (e.key === 'k') { e.preventDefault(); focusArticleByIndex(currentArticleIndex() - 1); }
      else if (e.key === 'o') {
        const cards = document.querySelectorAll('main article');
        const idx = currentArticleIndex();
        const link = cards[idx]?.querySelector('a[href^="http"]');
        if (link instanceof HTMLAnchorElement) { e.preventDefault(); window.open(link.href, '_blank', 'noopener'); }
      } else if (e.key === 's') {
        const cards = document.querySelectorAll('main article');
        const idx = currentArticleIndex();
        const saveBtn = cards[idx]?.querySelector('button[aria-label^="Save"], button[aria-label^="Unsave"]');
        if (saveBtn instanceof HTMLElement) { e.preventDefault(); saveBtn.click(); }
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsHelp(v => !v);
      } else if (e.key === 'Escape') {
        setShowShortcutsHelp(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Arrow-key navigation between feed/saved tabs (per WAI-ARIA tablist pattern)
  const handleTabKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab(activeTab === 'feed' ? 'saved' : 'feed');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab(activeTab === 'saved' ? 'feed' : 'saved');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Skip-to-content link — visible only when focused via Tab */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-1 flex items-center gap-3.5">
              <img
                src="/logo.svg"
                alt="Literature Tracker"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Literature Tracker</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Follow your favorite journals</p>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-4" role="tablist" aria-label="Home sections" onKeyDown={handleTabKeyDown}>
              <button
                role="tab"
                aria-selected={activeTab === 'feed'}
                tabIndex={activeTab === 'feed' ? 0 : -1}
                onClick={() => setActiveTab('feed')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-semibold transition-colors ${
                  activeTab === 'feed'
                    ? 'bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                    : 'feed-pulse bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-slate-300/80 dark:hover:bg-blue-900/40'
                }`}
              >
                <Rss className={`w-4 h-4 ${activeTab === 'feed' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="hidden sm:inline">Feed</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'saved'}
                tabIndex={activeTab === 'saved' ? 0 : -1}
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="hidden sm:inline">Saved</span>
                {savedArticles.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {savedArticles.length}
                  </span>
                )}
                {autoSaveEnabled && (
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                )}
              </button>
            </div>

            <div className="flex-1 flex items-center gap-2 justify-end">
              <Link to={createPageUrl('Settings')} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                isSettingsActive
                  ? 'bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700'
              }`}>
                <Settings className={`w-4 h-4 ${isSettingsActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="hidden sm:inline">Journal Selector</span>
              </Link>
              <Tooltip label="User Guide" delay={500}>
                <Link to={createPageUrl('Guide')} aria-label="User Guide" className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                  isGuideActive
                    ? 'bg-slate-200/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700'
                }`}>
                  <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                </Link>
              </Tooltip>
              <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} delay={500}>
                <button
                  onClick={toggleDark}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-700"
                >
                  {isDark ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
                </button>
              </Tooltip>
              <Tooltip label={`Log out from ${user?.email}`} delay={500}>
                <button
                  onClick={logout}
                  aria-label="Log out"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-red-100/60 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-amber-500 dark:bg-amber-600 text-white text-sm py-2 px-4 flex items-center justify-center gap-2">
          <span>You're offline — showing cached articles. The feed will refresh when you reconnect.</span>
        </div>
      )}

      {/* New articles available banner */}
      {showRefreshBanner && activeTab === 'feed' && activeJournalCount > 0 && (
        <div className="bg-blue-600 dark:bg-blue-700 text-white text-sm py-2 px-4 flex items-center justify-center gap-3">
          <span>New articles may be available.</span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh now
          </button>
          <button onClick={() => setShowRefreshBanner(false)} className="ml-2 text-white/70 hover:text-white text-lg leading-none">×</button>
        </div>
      )}

      {/* Last-updated timestamp (feed only) */}
      {activeTab === 'feed' && dataUpdatedAt && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <p className="text-xs text-muted-foreground">
            Feed last refreshed {(() => {
              const mins = Math.floor((Date.now() - dataUpdatedAt) / 60000);
              if (mins < 1) return 'just now';
              if (mins === 1) return '1 minute ago';
              if (mins < 60) return `${mins} minutes ago`;
              const hrs = Math.floor(mins / 60);
              return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
            })()}
          </p>
        </div>
      )}

      {showShortcutsHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowShortcutsHelp(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              // Simple focus trap — keep Tab cycling within the dialog
              const dialog = e.currentTarget.querySelector('[data-shortcuts-panel]');
              if (!dialog) return;
              const focusable = dialog.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
              if (focusable.length === 0) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                if (last instanceof HTMLElement) last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                if (first instanceof HTMLElement) first.focus();
              }
            }
          }}
        >
          <div
            data-shortcuts-panel
            className="bg-card rounded-2xl border-container border-border shadow-xl p-6 max-w-sm w-[92%]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-foreground mb-3">Keyboard shortcuts</h2>
            <ul className="text-sm text-foreground space-y-2">
              <li className="flex justify-between"><span>Next article</span><kbd className="font-mono text-xs bg-muted px-2 py-0.5 rounded">j</kbd></li>
              <li className="flex justify-between"><span>Previous article</span><kbd className="font-mono text-xs bg-muted px-2 py-0.5 rounded">k</kbd></li>
              <li className="flex justify-between"><span>Open in new tab</span><kbd className="font-mono text-xs bg-muted px-2 py-0.5 rounded">o</kbd></li>
              <li className="flex justify-between"><span>Save / unsave</span><kbd className="font-mono text-xs bg-muted px-2 py-0.5 rounded">s</kbd></li>
              <li className="flex justify-between"><span>Switch tabs</span><span className="flex gap-1"><kbd className="font-mono text-xs bg-muted px-2 py-0.5 rounded">←</kbd><kbd className="font-mono text-xs bg-muted px-2 py-0.5 rounded">→</kbd></span></li>
              <li className="flex justify-between"><span>This help</span><kbd className="font-mono text-xs bg-muted px-2 py-0.5 rounded">?</kbd></li>
            </ul>
            <button
              ref={(el) => { if (el instanceof HTMLElement) el.focus(); }}
              onClick={() => setShowShortcutsHelp(false)}
              className="mt-4 w-full px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <main id="main-content" className="flex-1 min-w-0">
            {activeTab === 'feed' ? (
              <ErrorBoundary key="feed">
                <ArticleFeed
                  articles={articles}
                  failedJournals={failedJournals}
                  isLoading={isLoadingArticles || isLoadingJournals}
                  loadingProgress={loadingProgress}
                  onRefresh={handleRefresh}
                  followedCount={activeJournalCount}
                  savedArticles={savedArticles}
                  onSaveToggle={refetchSaved}
                  followedJournals={followedJournals}
                />
              </ErrorBoundary>
            ) : activeTab === 'saved' ? (
              <ErrorBoundary key="saved">
                <SavedFeed
                  savedArticles={savedArticles}
                  onRefresh={refetchSaved}
                  articles={articles}
                />
              </ErrorBoundary>
            ) : (
              <ErrorBoundary key="recommended">
                <RecommendedFeed
                  followedJournals={followedJournals}
                  savedArticles={savedArticles}
                  onSaveToggle={refetchSaved}
                  userKeywords={userKeywords}
                  setUserKeywords={setUserKeywords}
                  selectedKeywords={selectedKeywords}
                  setSelectedKeywords={setSelectedKeywords}
                  filterEnabled={filterEnabled}
                  setFilterEnabled={setFilterEnabled}
                />
              </ErrorBoundary>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
