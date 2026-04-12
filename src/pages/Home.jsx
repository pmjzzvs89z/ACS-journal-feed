import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { entities } from '@/api/entities';
import { fetchRssFeed } from '@/utils/fetchRss';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, Bookmark, Rss, BookOpen, RefreshCw, Moon, Sun, LogOut } from 'lucide-react';
import ArticleFeed from '@/components/articles/ArticleFeed';
import SavedFeed from '@/components/articles/SavedFeed';
import RecommendedFeed from '@/components/articles/RecommendedFeed';
import { setSeenArticlesUser, getSeenArticleIds } from '@/components/articles/ArticleCard';
import { ALL_JOURNALS } from '@/components/journals/JournalList';
import Tooltip from '@/components/ui/Tooltip';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/lib/AuthContext';

// Auto-save rules live in localStorage namespaced by user id — see
// SavedFeed.jsx for the read/write side. This helper mirrors that scheme
// so the auto-save side effect below only ever reads the current user's
// rules. Without a userId we return an empty object, which disables
// auto-save entirely.
const RULES_KEY_BASE = 'cjf_autosave_rules';

function getAutoSaveRules(userId) {
  if (!userId) return {};
  try { return JSON.parse(localStorage.getItem(`${RULES_KEY_BASE}:${userId}`) || '{}'); }
  catch { return {}; }
}

function articleMatchesRules(article, rules) {
  const keywords = rules.keywords || [];
  const authors = rules.authors || [];
  if (keywords.length === 0 && authors.length === 0) return false;

  const haystack = [
    article.title || '',
    article.content || '',
    article.description || '',
  ].join(' ').toLowerCase();

  const authorStr = (Array.isArray(article.author)
    ? article.author.join(' ')
    : article.author || '').toLowerCase();

  const kwMatch = keywords.length === 0 || keywords.some(kw => haystack.includes(kw.toLowerCase()));
  const auMatch = authors.length === 0 || authors.some(au => authorStr.includes(au.toLowerCase()));

  if (keywords.length > 0 && authors.length > 0) return kwMatch && auMatch;
  return kwMatch || auMatch;
}

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
  const { logout, user } = useAuth();
  const userId = user?.id;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const queryClient = useQueryClient();

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
    const activeJournals = followedJournals.filter(j => j.is_active);
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

    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
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

  // Auto-save side effect — runs whenever articles change or the
  // authenticated user changes. Guarded by userId so a logged-out state
  // or an account switch cannot apply stale rules to a different user.
  useEffect(() => {
    if (!articles.length) return;
    if (!userId) return;
    const rules = getAutoSaveRules(userId);
    if (!rules.enabled) return;

    (async () => {
      try {
        const currentSaved = await entities.SavedArticle.list();
        // After the async gap, verify the authenticated user hasn't
        // changed mid-flight (e.g. logout + re-login during the fetch).
        // entities.SavedArticle.create() stamps the *current* auth user,
        // so without this guard a stale effect could attribute articles
        // that matched User A's rules to User B's account.
        if (userIdRef.current !== userId) return;
        const savedIds = new Set(currentSaved.map(s => s.article_id));
        const toSave = articles.filter(a => !savedIds.has(a.link) && articleMatchesRules(a, rules));
        if (toSave.length > 0) {
          await Promise.all(toSave.map(a => {
            const abstract = (() => {
              const sources = [a.content, a.description];
              for (const src of sources) {
                if (!src) continue;
                const pMatches = src.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
                if (pMatches) { for (const p of pMatches) { const t = p.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); if (t.length > 60) return t; } }
                const plain = src.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                if (plain.length > 60) return plain;
              }
              return '';
            })();
            const thumbnail = (() => {
              if (a.enclosure?.link) return a.enclosure.link;
              if (a.enclosure?.url) return a.enclosure.url;
              if (a.thumbnail) return a.thumbnail;
              const sources = [a.content, a.description];
              for (const src of sources) {
                if (!src) continue;
                // Decode HTML entities before searching (edge function returns HTML-encoded content)
                const el = document.createElement('textarea');
                el.innerHTML = src;
                const decoded = el.value;
                const m = decoded.match(/\bsrc=["']([^"']+\.(?:png|jpg|jpeg|gif|webp))["']/i);
                if (m) return m[1];
              }
              return '';
            })();
            return entities.SavedArticle.create({
              article_id: a.link,
              title: a.title,
              link: a.link,
              authors: Array.isArray(a.author) ? a.author.join(', ') : (a.author || ''),
              pub_date: a.pubDate,
              journal_name: a.journalName,
              journal_abbrev: a.journalAbbrev,
              journal_color: a.journalColor,
              thumbnail,
              abstract,
            });
          }));
          queryClient.invalidateQueries({ queryKey: ['savedArticles'] });
        }
      } catch (e) {
        console.error('Auto-save error:', e);
      }
    })();
  }, [articles, userId]);  

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

  // "New articles available" banner — show after 30 min since last fetch
  useEffect(() => {
    if (!dataUpdatedAt) { setShowRefreshBanner(false); return; }
    const check = () => setShowRefreshBanner(Date.now() - dataUpdatedAt > 30 * 60 * 1000);
    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const handleRefresh = () => {
    setShowRefreshBanner(false);
    refetchArticles();
  };

  const activeJournalCount = followedJournals.filter(j => j.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex items-center gap-1.5 px-4 py-1 rounded-lg border text-sm font-semibold transition-colors ${
                  activeTab === 'feed'
                    ? 'bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                    : 'feed-pulse bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-100/60 dark:hover:bg-blue-900/40'
                }`}
              >
                <Rss className={`w-4 h-4 ${activeTab === 'feed' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="hidden sm:inline">Feed</span>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-medium transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                    : 'bg-blue-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="hidden sm:inline">Saved</span>
                {savedArticles.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{savedArticles.length}</span>
                )}
              </button>
            </div>

            <div className="flex-1 flex items-center gap-2 justify-end">
              <Link to={createPageUrl('Settings')}>
                <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                  isSettingsActive
                    ? 'bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                    : 'bg-blue-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700'
                }`}>
                  <Settings className={`w-4 h-4 ${isSettingsActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  <span className="hidden sm:inline">Journal Selector</span>
                </button>
              </Link>
              <Tooltip label="User Guide" delay={500}>
                <Link to={createPageUrl('Guide')}>
                  <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                    isGuideActive
                      ? 'bg-blue-50/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                      : 'bg-blue-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700'
                  }`}>
                    <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  </button>
                </Link>
              </Tooltip>
              <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} delay={500}>
                <button
                  onClick={toggleDark}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-blue-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700"
                >
                  {isDark ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
                </button>
              </Tooltip>
              <Tooltip label={`Log out from ${user?.email}`} delay={500}>
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-blue-50/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-blue-100 dark:border-slate-700 hover:bg-red-100/60 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* New articles available banner */}
      {showRefreshBanner && activeTab === 'feed' && (
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <main className="flex-1 min-w-0">
            {activeTab === 'feed' ? (
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
            ) : activeTab === 'saved' ? (
              <SavedFeed
                savedArticles={savedArticles}
                onRefresh={refetchSaved}
                articles={articles}
              />
            ) : (
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
