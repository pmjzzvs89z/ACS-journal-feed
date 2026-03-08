import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Plus, Tag, User, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ToggleSwitch from '@/components/ui/ToggleSwitch';


const QUICK_FILTER_KEY = 'cjf_quick_filters';

function loadQuickFilters() {
  try { return JSON.parse(localStorage.getItem(QUICK_FILTER_KEY) || '{"enabled":false,"keywords":[],"authors":[]}'); }
  catch { return { enabled: false, keywords: [], authors: [] }; }
}

function saveQuickFilters(qf) {
  localStorage.setItem(QUICK_FILTER_KEY, JSON.stringify(qf));
}

export default function ArticleFilters({ articles, filters, onChange, quickFilters, onQuickFiltersChange }) {
  const [expanded, setExpanded] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');

  const hasActive = filters.keyword || filters.journal || filters.dateFrom || filters.dateTo;
  const hasQuickItems = quickFilters.keywords.length > 0 || quickFilters.authors.length > 0;
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const clear = () => onChange({ keyword: '', journal: '', dateFrom: '', dateTo: '' });

  const updateQF = (updated) => {
    saveQuickFilters(updated);
    onQuickFiltersChange(updated);
  };

  const addKeyword = () => {
    const val = keywordInput.trim();
    if (!val || quickFilters.keywords.includes(val)) { setKeywordInput(''); return; }
    updateQF({ ...quickFilters, keywords: [...quickFilters.keywords, val] });
    setKeywordInput('');
  };

  const removeKeyword = (kw) => updateQF({ ...quickFilters, keywords: quickFilters.keywords.filter(k => k !== kw) });

  const addAuthor = () => {
    const val = authorInput.trim();
    if (!val || quickFilters.authors.includes(val)) { setAuthorInput(''); return; }
    updateQF({ ...quickFilters, authors: [...quickFilters.authors, val] });
    setAuthorInput('');
  };

  const removeAuthor = (au) => updateQF({ ...quickFilters, authors: quickFilters.authors.filter(a => a !== au) });

  const handleKeyDown = (e, addFn) => { if (e.key === 'Enter') { e.preventDefault(); addFn(); } };

  // Show indicator dot if quick filter is enabled and has items
  const hasQuickActive = quickFilters.enabled && hasQuickItems;

  return (
    <div className="mb-6">
      <div className="bg-white rounded-2xl border border-[#DFE8F3] shadow-sm overflow-hidden">
        {/* Search row */}
        <div className="flex items-center gap-2 px-4 py-3">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <Input
            placeholder="Search by title, keyword or author…"
            value={filters.keyword}
            onChange={e => set('keyword', e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm"
          />
          <button
            onClick={() => setExpanded(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${expanded ? 'bg-blue-50/60 text-blue-600 border-blue-200' : 'bg-blue-50/60 text-slate-500 border-blue-100 hover:bg-blue-100/60'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {expanded ? <ChevronUp className="w-5 h-5 text-blue-500 stroke-[2.5]" /> : <ChevronDown className="w-5 h-5 text-blue-500 stroke-[2.5]" />}
            {(hasActive || hasQuickActive) && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-0.5" />}
          </button>
          {hasActive && (
            <button onClick={clear} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {expanded && (
          <div className="border-t border-slate-100 px-4 py-4 space-y-5">
            {/* Persistent Filter section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3 h-3 text-blue-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Persistent Filter</span>
                <span className="text-xs text-slate-400 flex-1">Persistent keywords & authors filters when turned on</span>
                <ToggleSwitch
                  checked={quickFilters.enabled}
                  onCheckedChange={(v) => updateQF({ ...quickFilters, enabled: v })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Keywords */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Keywords</label>
                  </div>
                  <div className="flex gap-2 mb-1.5">
                    <Input
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={e => handleKeyDown(e, addKeyword)}
                      placeholder="e.g. photocatalysis"
                      className="text-sm h-8 flex-1"
                    />
                    <Button size="sm" variant="outline" onClick={addKeyword} className="h-8 px-3 flex-shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {quickFilters.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {quickFilters.keywords.map(kw => (
                        <Badge key={kw} variant="secondary" className="gap-1 pr-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                          {kw}
                          <button onClick={() => removeKeyword(kw)} className="hover:text-red-500 transition-colors ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Authors */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Authors</label>
                  </div>
                  <div className="flex gap-2 mb-1.5">
                    <Input
                      value={authorInput}
                      onChange={e => setAuthorInput(e.target.value)}
                      onKeyDown={e => handleKeyDown(e, addAuthor)}
                      placeholder="e.g. Smith J"
                      className="text-sm h-8 flex-1"
                    />
                    <Button size="sm" variant="outline" onClick={addAuthor} className="h-8 px-3 flex-shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {quickFilters.authors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {quickFilters.authors.map(au => (
                        <Badge key={au} variant="secondary" className="gap-1 pr-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                          {au}
                          <button onClick={() => removeAuthor(au)} className="hover:text-red-500 transition-colors ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!hasQuickItems && (
                <p className="text-xs text-slate-400 italic mt-2">Add keywords or authors above, then enable the toggle to filter the feed.</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Date filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Published after</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={e => set('dateFrom', e.target.value)}
                  className="text-xs border border-slate-200 rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  style={{ height: '1.4rem', lineHeight: '1.4rem' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Published before</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={e => set('dateTo', e.target.value)}
                  className="text-xs border border-slate-200 rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  style={{ height: '1.4rem', lineHeight: '1.4rem' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}