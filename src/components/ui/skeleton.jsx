import React from 'react';

// Thin primitive wrapping a pulsing placeholder block. Used by Admin
// dashboard (Most Followed / Most Saved / Activity Chart / Recent Saves)
// and the small loading placeholders in Settings / Guide.
//
// Article-card skeletons use `SkeletonCard` in ArticleFeed.jsx directly —
// that variant matches the final card dimensions to prevent layout shift.
// Don't reach for this primitive there.
/**
 * @param {{ className?: string, style?: import('react').CSSProperties }} props
 */
export default function Skeleton({ className = '', style }) {
  return (
    <div
      className={`bg-muted rounded animate-pulse ${className}`}
      style={style}
    />
  );
}
