import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2, ExternalLink, BookOpen, Calendar, Users, Download, ChevronDown, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { entities } from '@/api/entities';
import { format } from 'date-fns';
import ExportModal from './ExportModal';
import AutoSaveRules from './AutoSaveRules';
import ShareButton from './ShareButton';
import { useAuth } from '@/lib/AuthContext';

// Auto-save rules are stored in Supabase (auto_save_rules table) so they
// sync across devices. localStorage is used as a fast read cache so the
// UI doesn't flash while the Supabase fetch is in flight.
const RULES_KEY_BASE = 'cjf_autosave_rules';
const LEGACY_RULES_KEY = 'cjf_autosave_rules';
const defaultRules = { enabled: false, keywords: [], authors: [] };

function rulesKeyFor(userId) {
  return userId ? `${RULES_KEY_BASE}:${userId}` : null;
}

function loadRulesFromCache(userId) {
  const key = rulesKeyFor(userId);
  if (!key) return defaultRules;
  try { return { ...defaultRules, ...JSON.parse(localStorage.getItem(key) || '{}') }; }
  catch { return defaultRules; }
}

function cacheRules(userId, rules) {
  const key = rulesKeyFor(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(rules));
}

const SavedCard = React.memo(function SavedCard({ saved, onUnsave, selected, onToggleSelect }) {
  const handleUnsave = () => {
    onUnsave(saved.id);
  };

  const formatDate = (d) => {
    try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; }
  };

  return (
    <motion.article
      initial={false}
      animate={false}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`group bg-slate-50 dark:bg-card rounded-2xl border-card transition-all duration-300 overflow-hidden ${selected ? 'border-blue-400 dark:border-blue-500 shadow-md' : 'border-slate-400/80 dark:border-slate-600 hover:shadow-xl'}`}
    >
      <div className="flex items-stretch gap-0">
        {/* Checkbox */}
        <div className="flex items-start pt-5 pl-4 pr-1 flex-shrink-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(saved.id)}
            className="w-4 h-4 rounded border-border text-blue-600 cursor-pointer accent-blue-600"
          />
        </div>

        {/* Thumbnail */}
        {saved.thumbnail && (
          <div className="hidden sm:flex flex-shrink-0 w-[368px] items-center justify-center bg-slate-50 dark:bg-card border-r border-border p-2" style={{ minHeight: '160px', maxHeight: '220px' }}>
            <img
              src={saved.thumbnail}
              alt="Graphical abstract"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
              style={{ maxHeight: '210px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 p-5">
          {saved.thumbnail && (
            <div className="sm:hidden w-full mb-4 rounded-xl overflow-hidden bg-slate-50 dark:bg-card border border-border">
              <img src={saved.thumbnail} alt="Graphical abstract" referrerPolicy="no-referrer" className="w-full max-h-40 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-2.5 py-0.5"
                  style={{
                    backgroundColor: `${saved.journal_color}18`,
                    color: saved.journal_color,
                    borderColor: `${saved.journal_color}35`
                  }}
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  {saved.journal_abbrev}
                </Badge>
                {saved.pub_date && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(saved.pub_date)}
                  </span>
                )}
              </div>

              <a href={saved.link} target="_blank" rel="noopener noreferrer">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                  {saved.title}
                </h3>
              </a>

              {saved.authors && (
                <p className="text-xs text-muted-foreground flex items-start gap-1 mb-2">
                  <Users className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <span>{saved.authors}</span>
                </p>
              )}

              {saved.link && (
                <a href={saved.link} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors block mb-3 truncate">
                  {saved.link}
                </a>
              )}

              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={handleUnsave}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
                <ShareButton
                  title={saved.title}
                  url={saved.link}
                  authors={saved.authors}
                  journal={saved.journal_name || saved.journal_abbrev}
                  doi={saved.doi || (saved.link ? (saved.link.match(/10\.\d{4,}\/[^\s?&#"'<>]+/) || [])[0] : null)}
                  pubDate={saved.pub_date}
                  abstract={saved.abstract}
                />
              </div>
            </div>

            <a href={saved.link} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-muted-foreground hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-200">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export default function SavedFeed({ savedArticles, onRefresh, articles = [] }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [exportOpen, setExportOpen] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [rules, setRulesState] = useState(() => loadRulesFromCache(userId));
  // Optimistic removal — IDs added here vanish from the list instantly
  // while the API call runs in the background.
  const [removingIds, setRemovingIds] = useState(new Set());

  // Filter out optimistically removed articles so the card disappears
  // immediately on click.
  const visibleArticles = removingIds.size > 0
    ? savedArticles.filter(a => !removingIds.has(a.id))
    : savedArticles;

  const handleOptimisticUnsave = (id) => {
    setRemovingIds(prev => new Set(prev).add(id));
    entities.SavedArticle.delete(id)
      .then(() => onRefresh())
      .catch(() => {
        // Revert on failure
        setRemovingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      })
      .finally(() => {
        setRemovingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      });
  };

  // One-time cleanup: purge the legacy un-namespaced rules key so it can
  // never bleed into a different account again.
  useEffect(() => {
    localStorage.removeItem(LEGACY_RULES_KEY);
  }, []);

  // Fetch rules from Supabase on mount and when user changes. Falls back
  // to localStorage cache so the UI is instant, then reconciles with the
  // server-side version.
  useEffect(() => {
    setRulesState(loadRulesFromCache(userId));
    if (!userId) return;
    let cancelled = false;
    entities.AutoSaveRules.get().then(row => {
      if (cancelled) return;
      if (row) {
        const synced = {
          enabled: row.enabled,
          keywords: row.keywords || [],
          authors: row.authors || [],
        };
        setRulesState(synced);
        cacheRules(userId, synced);
      }
    }).catch((err) => { console.error('[AutoSaveRules] fetch failed:', err); });
    return () => { cancelled = true; };
  }, [userId]);

  const handleRulesChange = useCallback((newRules) => {
    setRulesState(newRules);
    cacheRules(userId, newRules);
    // Notify useAutoSave hook so the green dot updates instantly
    window.dispatchEvent(new CustomEvent('autosave-rules-changed', { detail: newRules }));
    // Persist to Supabase in the background
    if (userId) {
      entities.AutoSaveRules.upsert(newRules).catch((err) => {
        console.error('[AutoSaveRules] upsert failed:', err);
      });
    }
  }, [userId]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = visibleArticles.length > 0 && selectedIds.size === visibleArticles.length;

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(visibleArticles.map(a => a.id)));
  };

  const articlesToExport = selectedIds.size > 0
    ? visibleArticles.filter(a => selectedIds.has(a.id))
    : visibleArticles;

  const RulesToggle = () => (
    <button
      onClick={() => setRulesExpanded(!rulesExpanded)}
      className="w-full bg-card rounded-2xl border-container border-border shadow-sm px-4 py-2 mb-4 flex items-center justify-between hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 flex-1 text-left min-w-0">
        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Auto-Save Rules <span className="font-normal text-muted-foreground">(optional)</span></h3>
          {rules.enabled && (
            <p className="text-xs text-muted-foreground mt-0.5">Enabled · {rules.keywords.length} keyword{rules.keywords.length !== 1 ? 's' : ''}, {rules.authors.length} author{rules.authors.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {rules.enabled && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" title="Auto-save is active" />
        )}
        <ChevronDown className={`w-5 h-5 text-blue-500 transition-transform stroke-[2.5] ${rulesExpanded ? 'rotate-180' : ''}`} />
      </div>
    </button>
  );

  if (visibleArticles.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <RulesToggle />
        {rulesExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <AutoSaveRules rules={rules} onRulesChange={handleRulesChange} articles={articles} />
          </motion.div>
        )}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6">
            <Bookmark className="w-10 h-10 text-amber-300 dark:text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No saved articles yet</h3>
          <p className="text-blue-600 dark:text-blue-400 max-w-md">Click the bookmark icon under any of the articles in the feed to save it here for later</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 rounded border-border accent-blue-600 cursor-pointer"
          />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Saved Articles</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {visibleArticles.length} article{visibleArticles.length !== 1 ? 's' : ''}
              {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              onClick={() => {
                const count = selectedIds.size;
                const isAll = count === visibleArticles.length;
                if (!window.confirm(`Remove ${isAll ? 'all ' : ''}${count} ${isAll ? '' : 'selected '}article${count !== 1 ? 's' : ''}?`)) return;
                const ids = [...selectedIds];
                setRemovingIds(prev => new Set([...prev, ...ids]));
                (isAll ? entities.SavedArticle.deleteAll() : entities.SavedArticle.deleteMany(ids))
                  .then(() => { onRefresh(); setSelectedIds(new Set()); })
                  .catch((err) => {
                    console.error('[SavedFeed] bulk delete failed:', err);
                    setRemovingIds(prev => { const next = new Set(prev); ids.forEach(id => next.delete(id)); return next; });
                  })
                  .finally(() => {
                    setRemovingIds(prev => { const next = new Set(prev); ids.forEach(id => next.delete(id)); return next; });
                  });
              }}
              className="gap-2 bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-500 dark:text-amber-500 border border-slate-300 dark:border-slate-700"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
              Remove ({selectedIds.size})
            </Button>
          )}
          <Button
            onClick={() => setExportOpen(true)}
            className="gap-2 bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Export{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
          </Button>
        </div>
      </div>

      <RulesToggle />

      {rulesExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-4"
        >
          <AutoSaveRules rules={rules} onRulesChange={handleRulesChange} articles={articles} />
        </motion.div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {visibleArticles.map((saved) => (
            <SavedCard
              key={saved.id}
              saved={saved}
              onUnsave={handleOptimisticUnsave}
              selected={selectedIds.has(saved.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </AnimatePresence>
      </div>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        articles={articlesToExport}
      />
    </div>
  );
}
