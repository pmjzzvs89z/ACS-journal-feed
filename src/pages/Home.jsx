import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, Bookmark, Rss, Sparkles, BookOpen } from 'lucide-react';
import ArticleFeed from '@/components/articles/ArticleFeed';
import SavedFeed from '@/components/articles/SavedFeed';
import RecommendedFeed from '@/components/articles/RecommendedFeed';
import { ALL_JOURNALS } from '@/components/journals/JournalList';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';


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

  // Must satisfy at least one keyword (if any set) AND at least one author (if any set)
  if (keywords.length > 0 && authors.length > 0) return kwMatch && auMatch;
  return kwMatch || auMatch;
}

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'feed';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userKeywords, setUserKeywords] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const queryClient = useQueryClient();

  // Remove ?tab= from URL immediately so refreshing always lands on Feed
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('tab')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  const location = useLocation();
  const isSettingsActive = location.pathname === createPageUrl('Settings');
  const isGuideActive = location.pathname === createPageUrl('Guide');

  // Fetch followed journals
  const { data: followedJournals = [], isLoading: isLoadingJournals } = useQuery({
    queryKey: ['followedJournals'],
    queryFn: () => base44.entities.FollowedJournal.list(),
  });

  // Fetch saved articles
  const { data: savedArticles = [], refetch: refetchSaved } = useQuery({
    queryKey: ['savedArticles'],
    queryFn: () => base44.entities.SavedArticle.list(),
  });



  // Fetch RSS feeds
  const fetchArticles = useCallback(async () => {
    const activeJournals = followedJournals.filter(j => j.is_active);
    if (activeJournals.length === 0) {
      setArticles([]);
      return;
    }

    setIsLoadingArticles(true);
    const allArticles = [];

    // Process journals sequentially to avoid rate limiting
    const BATCH_SIZE = 2;
    for (let i = 0; i < activeJournals.length; i += BATCH_SIZE) {
      const batch = activeJournals.slice(i, i + BATCH_SIZE);
      if (i > 0) await new Promise(r => setTimeout(r, 2000));
      await Promise.all(
        batch.map(async (journal) => {
          const journalInfo = ALL_JOURNALS.find(j => j.id === journal.journal_id);
          try {
            let items = [];
            const response = await base44.functions.invoke('fetchRssFeed', { rss_url: journal.rss_url });
            const data = response.data;
            if (data.status === 'ok' && data.items) {
              items = data.items;
            }
            const journalArticles = items.map(item => ({
              ...item,
              journalId: journal.journal_id,
              journalName: journal.journal_name,
              journalAbbrev: journalInfo?.abbrev || journal.journal_name,
              journalColor: journalInfo?.color || '#0066b3',
            }));
            allArticles.push(...journalArticles);
          } catch (error) {
            console.error(`Error fetching ${journal.journal_name}:`, error);
          }
        })
      );
    }

    // Sort by date, newest first
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    setArticles(allArticles);

    // Auto-save matching articles
    const rules = getAutoSaveRules();
    if (rules.enabled) {
      const currentSaved = await base44.entities.SavedArticle.list();
      const savedIds = new Set(currentSaved.map(s => s.article_id));
      const toSave = allArticles.filter(a => !savedIds.has(a.link) && articleMatchesRules(a, rules));
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
            const sources = [a.content, a.description, a.enclosure?.link];
            for (const src of sources) {
              if (!src) continue;
              const m = typeof src === 'string' && src.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (m) return m[1];
            }
            return '';
          })();
          return base44.entities.SavedArticle.create({
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
    }

    setIsLoadingArticles(false);
  }, [followedJournals, queryClient]);

  useEffect(() => {
    if (!isLoadingJournals) {
      fetchArticles();
    }
  }, [followedJournals, isLoadingJournals, fetchArticles]);

  const activeJournalCount = followedJournals.filter(j => j.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3.5">
              <img src="https://media.base44.com/images/public/6999e9b080715094c0e4fdd7/c11d32ff5_Screenshot2026-03-07at95434PM.png" alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Literature Tracker</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Follow your favorite journals</p>
              </div>
            </div>

            {/* Tab switcher */}
             <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`flex items-center gap-1.5 px-4 py-1 rounded-lg border text-sm font-semibold transition-colors ${activeTab === 'feed' ? 'bg-blue-50/60 text-blue-600 border-blue-200' : 'bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60'}`}
               >
                 <Rss className={`w-4 h-4 ${activeTab === 'feed' ? 'text-blue-600' : ''}`} />
                 <span className="hidden sm:inline">Feed</span>
               </button>
               <button
                 onClick={() => setActiveTab('saved')}
                 className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-medium transition-colors ${activeTab === 'saved' ? 'bg-blue-50/60 text-blue-600 border-blue-200' : 'bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60'}`}
               >
                 <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'text-blue-600' : ''}`} />
                 <span className="hidden sm:inline">Saved</span>
                 {savedArticles.length > 0 && (
                   <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{savedArticles.length}</span>
                 )}
               </button>
               {/* For You tab - hidden but code preserved for future use
               <button
                 onClick={() => setActiveTab('recommended')}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'recommended' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <Sparkles className={`w-4 h-4 ${activeTab === 'recommended' ? 'text-blue-600' : ''}`} />
                 <span className="hidden sm:inline">For You</span>
               </button>
               */}
               </div>

            <div className="flex items-center gap-2">
              <Link to={createPageUrl('Settings')}>
                <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isSettingsActive ? 'bg-blue-50/60 text-blue-600 border-blue-200' : 'bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60'}`}>
                  <Settings className={`w-4 h-4 ${isSettingsActive ? 'text-blue-600' : ''}`} />
                  <span className="hidden sm:inline">Journal Selector</span>
                </button>
              </Link>
              <Link to={createPageUrl('Guide')}>
                <button className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${isGuideActive ? 'bg-blue-50/60 text-blue-600 border-blue-200' : 'bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60'}`}>
                  <BookOpen className={`w-4 h-4 ${isGuideActive ? 'text-blue-600' : ''}`} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'feed' ? (
              <ArticleFeed
                articles={articles}
                isLoading={isLoadingArticles || isLoadingJournals}
                onRefresh={fetchArticles}
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