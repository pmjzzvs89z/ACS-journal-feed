import React, { useState } from 'react';
import { Plus, X, Zap, Tag, User } from 'lucide-react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AutoSaveRules({ rules, onRulesChange }) {
  const [keywordInput, setKeywordInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');

  const addKeyword = () => {
    const val = keywordInput.trim();
    if (!val || rules.keywords.includes(val)) { setKeywordInput(''); return; }
    onRulesChange({ ...rules, keywords: [...rules.keywords, val] });
    setKeywordInput('');
  };

  const removeKeyword = (kw) => {
    onRulesChange({ ...rules, keywords: rules.keywords.filter(k => k !== kw) });
  };

  const addAuthor = () => {
    const val = authorInput.trim();
    if (!val || rules.authors.includes(val)) { setAuthorInput(''); return; }
    onRulesChange({ ...rules, authors: [...rules.authors, val] });
    setAuthorInput('');
  };

  const removeAuthor = (au) => {
    onRulesChange({ ...rules, authors: rules.authors.filter(a => a !== au) });
  };

  const handleKeyDown = (e, addFn) => {
    if (e.key === 'Enter') { e.preventDefault(); addFn(); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
      {/* Header row with toggle */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">Auto-Save Rules</p>
          <p className="text-xs text-slate-400">Articles matching these rules are saved automatically</p>
        </div>
        <ToggleSwitch
          checked={rules.enabled}
          onCheckedChange={(v) => onRulesChange({ ...rules, enabled: v })}
        />
      </div>

      {/* Rules body — always visible */}
      <div className="px-4 py-3">
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
            {rules.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {rules.keywords.map(kw => (
                  <Badge key={kw} variant="secondary" className="gap-1 pr-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs">
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
            {rules.authors.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {rules.authors.map(au => (
                  <Badge key={au} variant="secondary" className="gap-1 pr-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs">
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
      </div>
    </div>
  );
}