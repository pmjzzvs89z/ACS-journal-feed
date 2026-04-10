import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ArticleFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="mb-6">
      <div className="bg-card rounded-2xl border-[1.5px] border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Search by title, keyword or author…"
            value={filters.keyword}
            onChange={e => set('keyword', e.target.value)}
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
    </div>
  );
}
