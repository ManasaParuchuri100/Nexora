import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  tone?: 'brand' | 'ok' | 'warn' | 'danger' | 'info' | 'hot';
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  tone = 'brand',
  size = 'md',
  className = '',
  label,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';

  const toneClass =
    tone === 'ok'
      ? 'bg-ok'
      : tone === 'warn'
      ? 'bg-warn'
      : tone === 'danger'
      ? 'bg-danger'
      : tone === 'info'
      ? 'bg-info'
      : tone === 'hot'
      ? 'bg-hot'
      : 'bg-brand';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-ink-3">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-surface-raised border border-line-subtle rounded-full overflow-hidden ${heightClass}`}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          style={{ width: `${percentage}%` }}
          className={`h-full rounded-full transition-all duration-300 ${toneClass}`}
        />
      </div>
    </div>
  );
}
