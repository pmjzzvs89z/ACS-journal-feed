// @ts-nocheck — see ArticleCard for rationale
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';

const HISTORY_MAX = 10;
const HISTORY_KEY_BASE = 'cjf_search_history';

function historyKeyFor(userId) {
  return userId ? `${HISTORY_KEY_BASE}:${userId}` : null;
}

function loadHistory(userId) {
  const key = historyKeyFor(userId);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(userId, history) {
  const key = historyKeyFor(userId);
  if (!key) return;
  try { localStorage.setItem(key, JSON.stringify(history)); } catch { /* ignore */ }
}

export default function ArticleFilters({ filters, onChange }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [history, setHistory] = useState(() => loadHistory(userId));
  const [showHistory, setShowHistory] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Reload history when userId changes (account switch)
  useEffect(() => {
    setHistory(loadHistory(userId));
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showHistory) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowHistory(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showHistory]);

  const set = (key, value) => onChange({ ...filters, [key]: value });

  // Record a search term — called on Enter or when the user picks from
  // history. Deduplicates and caps at HISTORY_MAX entries.
  const recordSearch = useCallback((term) => {
    if (!term || !term.trim()) return;
    const trimmed = term.trim();
    setHistory(prev => {
      const next = [trimmed, ...prev.filter(h => h !== trimmed)].slice(0, HISTORY_MAX);
      saveHistory(userId, next);
      return next;
    });
  }, [userId]);

  const removeHistoryItem = useCallback((term, e) => {
    e.stopPropagation();
    setHistory(prev => {
      const next = prev.filter(h => h !== term);
      saveHistory(userId, next);
      return next;
    });
  }, [userId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filters.keyword.trim()) {
      recordSearch(filters.keyword);
      setShowHistory(false);
    } else if (e.key === 'Escape') {
      setShowHistory(false);
    }
  };

  const handleHistorySelect = (term) => {
    set('keyword', term);
    recordSearch(term);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory(userId, []);
  };

  // Filter history to show only items matching current input (if any)
  const visibleHistory = filters.keyword
    ? history.filter(h => h.toLowerCase().includes(filters.keyword.toLowerCase()) && h !== filters.keyword)
    : history;

  return (
    <div className="mb-6" ref={wrapRef}>
      <div className="bg-card rounded-2xl border-card border-slate-400/80 dark:border-slate-600 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            placeholder="Search by title, keyword or author…"
            value={filters.keyword}
            onChange={e => set('keyword', e.target.value)}
            onFocus={() => { if (history.length > 0) setShowHistory(true); }}
            onKeyDown={handleKeyDown}
            className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm bg-transparent dark:bg-transparent text-foreground placeholder:text-muted-foreground"
          />
          {filters.keyword && (
            <button
              onClick={() => set('keyword', '')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search history dropdown */}
      {showHistory && visibleHistory.length > 0 && (
        <div className="relative">
          <div
            className="absolute left-0 right-0 top-1 z-50 bg-card rounded-xl border border-border shadow-lg py-1 max-h-[300px] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Recent searches</span>
              <button
                onClick={clearHistory}
                className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Clear all
              </button>
            </div>
            {visibleHistory.map(term => (
              <button
                key={term}
                onClick={() => handleHistorySelect(term)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 truncate">{term}</span>
                <button
                  onClick={(e) => removeHistoryItem(term, e)}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
