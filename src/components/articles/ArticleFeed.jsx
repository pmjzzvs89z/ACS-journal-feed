import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Inbox, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ArticleCard, { clearAllSeenArticles } from './ArticleCard';
import ArticleFilters from './ArticleFilters';
import { ALL_JOURNALS } from '@/components/journals/JournalList';

const getLastMonthDateFrom = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
};

const DEFAULT_FILTERS = { keyword: '', journal: '', dateFrom: '', dateTo: '' };

const QUICK_FILTER_KEY = 'cjf_quick_filters';
function loadQuickFilters() {
  try { return JSON.parse(localStorage.getItem(QUICK_FILTER_KEY) || '{"enabled":false,"keywords":[],"authors":[]}'); }
  catch { return { enabled: false, keywords: [], authors: [] }; }
}


const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
];


export default function ArticleFeed({ articles, isLoading, onRefresh, followedCount, savedArticles = [], onSaveToggle, followedJournals = [] }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [quickFilters, setQuickFilters] = useState(loadQuickFilters);
  const [sortBy, setSortBy] = useState('date_desc');
  const [resetKey, setResetKey] = useState(0);

  const handleResetArticles = () => {
    clearAllSeenArticles();
    setResetKey(prev => prev + 1);
  };

  const filtered = useMemo(() => {
    const results = articles.filter(a => {
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

      // Quick filter
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
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <Inbox className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No journals selected</h3>
        <p className="text-blue-600 max-w-md flex flex-wrap items-center justify-center gap-x-1">
          <span>To see recent research articles in your feed, select</span>
          <span className="inline-flex items-center gap-1"><Settings className="w-4 h-4" /><strong>Journal Selector</strong></span>
          <span className="ml-1">button in the top right corner.</span>
        </p>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500">Loading articles...</p>
      </div>
    );
  }

  // Build journal list from both loaded articles AND all active followed journals (use abbreviations)
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Latest Articles</h2>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length}{filtered.length !== articles.length ? ` of ${articles.length}` : ''} article{filtered.length !== 1 ? 's' : ''} from {followedCount} journal{followedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <select
            value={filters.journal}
            onChange={e => setFilters({ ...filters, journal: e.target.value })}
            className="h-9 text-sm border-[1.5px] border-[#DCE8F6] rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Selected Journals</option>
            {journals.map(j => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-9 text-sm border-[1.5px] border-[#DCE8F6] rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button
            onClick={handleResetArticles}
            size="sm"
            variant="outline"
            className="text-xs"
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
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No articles found</h3>
          <p className="text-slate-500 max-w-md">
            We couldn't fetch articles right now. Try refreshing or check back later.
          </p>
        </motion.div>
      )}
    </div>
  );
}