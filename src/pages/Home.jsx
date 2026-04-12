import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { entities } from '@/api/entities';
import { fetchRssFeed } from '@/utils/fetchRss';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, Bookmark, Rss, BookOpen, RefreshCw, Moon, Sun, LogOut } from 'lucide-react';
import ArticleFeed from '@/components/articles/ArticleFeed';
import SavedFeed from '@/components/articles/SavedFeed';
import RecommendedFeed from '@/components/articles/RecommendedFeed';
import { ALL_JOURNALS } from '@/components/journals/JournalList';
import Tooltip from '@/components/ui/Tooltip';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/lib/AuthContext';

const RULES_KEY = 'cjf_autosave_rules';

function getAutoSaveRules() {
  try { return JSON.parse(localStorage.getItem(RULES_KEY) || '{}'); }
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
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const location = useLocation();
  const isSettingsActive = location.pathname === createPageUrl('Settings');
  const isGuideActive = location.pathname === createPageUrl('Guide');

  // Fetch followed journals — keep fresh for 10 min so navigating back doesn't trigger a refetch
  const { data: followedJournals = [], isLoading: isLoadingJournals } = useQuery({
    queryKey: ['followedJournals'],
    queryFn: () => entities.FollowedJournal.list(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch saved articles
  const { data: savedArticles = [], refetch: refetchSaved } = useQuery({
    queryKey: ['savedArticles'],
    queryFn: () => entities.SavedArticle.list(),
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

  // RSS fetch function for TanStack Query
  const fetchArticlesQuery = useCallback(async () => {
    const activeJournals = followedJournals.filter(j => j.is_active);
    if (activeJournals.length === 0) return [];

    progressSetterRef.current({ done: 0, total: activeJournals.length });
    const allArticles = [];

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
            }
          } catch (error) {
            console.error(`Error fetching ${journal.journal_name}:`, error);
          }
        })
      );
      progressSetterRef.current({ done: Math.min(i + BATCH_SIZE, activeJournals.length), total: activeJournals.length });
    }

    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    return allArticles;
  }, [followedJournals]);

  // Cached RSS query — stays fresh for 20 minutes
  // Only block on isLoadingJournals if we have no journal data yet (first load).
  // On subsequent mounts (navigating back), followedJournals is already cached,
  // so journalQueryKey is stable and the articles cache is served instantly.
  const hasJournalData = followedJournals.length > 0;
  const {
    data: articles = [],
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

  // Auto-save side effect — runs whenever articles change
  useEffect(() => {
    if (!articles.length) return;
    const rules = getAutoSaveRules();
    if (!rules.enabled) return;

    (async () => {
      try {
        const currentSaved = await entities.SavedArticle.list();
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
  }, [articles]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unread badge count
  useEffect(() => {
    if (!articles.length) { setUnreadCount(0); return; }
    try {
      const seen = new Set(JSON.parse(localStorage.getItem('seenArticles') || '[]'));
      setUnreadCount(articles.filter(a => !seen.has(a.link)).length);
    } catch {}
  }, [articles]);

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
                    : 'bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700'
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
                    : 'bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700'
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
                      : 'bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700'
                  }`}>
                    <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  </button>
                </Link>
              </Tooltip>
              <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} delay={500}>
                <button
                  onClick={toggleDark}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700"
                >
                  {isDark ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
                </button>
              </Tooltip>
              <Tooltip label="Log out" delay={500}>
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors bg-blue-50/60 dark:bg-slate-800 text-muted-foreground border-blue-100 dark:border-slate-700 hover:bg-red-100/60 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
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
