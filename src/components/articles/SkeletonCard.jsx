import React from 'react';

// Article-card skeleton that matches the final card layout (image slot +
// text lines) to prevent layout shift while RSS feeds load. Used by
// ArticleFeed during the loading state.
//
// For non-article skeletons (Admin dashboard, Settings, Guide), use the
// generic `Skeleton` primitive in `src/components/ui/Skeleton.jsx`.
export default function SkeletonCard() {
  return (
    <div className="bg-slate-50 dark:bg-card rounded-2xl border-card border-slate-400/80 dark:border-slate-600 overflow-hidden animate-pulse">
      <div className="flex items-stretch gap-0">
        <div className="hidden sm:flex flex-shrink-0 w-[405px] bg-slate-200 dark:bg-slate-700" style={{ minHeight: '160px' }} />
        <div className="flex-1 py-5 pr-5 pl-10 space-y-3">
          <div className="flex gap-2 items-center">
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}
