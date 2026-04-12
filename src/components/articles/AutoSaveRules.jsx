import React, { useState, useMemo } from 'react';
import { Plus, X, Zap, Tag, User } from 'lucide-react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { articleMatchesRules } from '@/utils/articleMatch';

export default function AutoSaveRules({ rules, onRulesChange, articles = [] }) {
  const [keywordInput, setKeywordInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');

  const MAX_ITEMS = 20;
  const MAX_LENGTH = 100;

  const addKeyword = () => {
    const val = keywordInput.trim().slice(0, MAX_LENGTH);
    if (!val || rules.keywords.includes(val) || rules.keywords.length >= MAX_ITEMS) { setKeywordInput(''); return; }
    onRulesChange({ ...rules, keywords: [...rules.keywords, val] });
    setKeywordInput('');
  };

  const removeKeyword = (kw) => {
    onRulesChange({ ...rules, keywords: rules.keywords.filter(k => k !== kw) });
  };

  const addAuthor = () => {
    const val = authorInput.trim().slice(0, MAX_LENGTH);
    if (!val || rules.authors.includes(val) || rules.authors.length >= MAX_ITEMS) { setAuthorInput(''); return; }
    onRulesChange({ ...rules, authors: [...rules.authors, val] });
    setAuthorInput('');
  };

  const removeAuthor = (au) => {
    onRulesChange({ ...rules, authors: rules.authors.filter(a => a !== au) });
  };

  const handleKeyDown = (e, addFn) => {
    if (e.key === 'Enter') { e.preventDefault(); addFn(); }
  };

  // Preview: count how many current feed articles match these rules
  const matchCount = useMemo(() => {
    if (rules.keywords.length === 0 && rules.authors.length === 0) return 0;
    return articles.filter(a => articleMatchesRules(a, rules)).length;
  }, [articles, rules]);

  return (
    <div className="bg-card rounded-2xl border-container border-border shadow-sm mb-4 overflow-hidden">
      {/* Header row with toggle */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Auto-Save Rules</p>
          <p className="text-xs text-muted-foreground">Articles matching these rules are saved automatically</p>
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
                  <Badge key={kw} variant="secondary" className="gap-1 pr-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 text-xs">
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
                  <Badge key={au} variant="secondary" className="gap-1 pr-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 text-xs">
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

        {/* Match preview */}
        {(rules.keywords.length > 0 || rules.authors.length > 0) && articles.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 px-1">
            Would match <span className="font-semibold text-foreground">{matchCount}</span> of {articles.length} current feed article{articles.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}