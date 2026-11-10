import React from 'react';

/** A quiet placeholder for content that is still loading. Respects reduced motion. */
export function Skeleton({ className = '', lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={`grid gap-2 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={`h-3.5 rounded-[6px] bg-surface-raised motion-safe:animate-pulse ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
