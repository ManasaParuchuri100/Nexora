import React from 'react';
import { Sparkline } from './Sparkline';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  delta?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  periodText?: string;
  hint?: string;
  sparklineData?: number[];
  onClick?: () => void;
  className?: string;
  id?: string;
}

export function StatCard({
  label,
  value,
  icon,
  delta,
  periodText = 'vs previous period',
  hint,
  sparklineData,
  onClick,
  className = '',
  id,
}: StatCardProps) {
  const content = (
    <div className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-3 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-surface-raised border border-line-subtle flex items-center justify-center text-ink-2 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-ink tabular-nums">
          {value}
        </span>
        {sparklineData && sparklineData.length > 1 && (
          <Sparkline
            data={sparklineData}
            tone={delta?.trend === 'down' ? 'danger' : 'brand'}
          />
        )}
      </div>

      <div className="flex flex-col gap-1 text-xs">
        {delta && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium tabular-nums ${
                delta.trend === 'up'
                  ? 'bg-ok-soft text-ok'
                  : delta.trend === 'down'
                  ? 'bg-danger-soft text-danger'
                  : 'bg-surface-raised text-ink-3'
              }`}
            >
              {delta.trend === 'up' ? '↑' : delta.trend === 'down' ? '↓' : '→'} {delta.value}
            </span>
            <span className="text-ink-3 text-[11px]">{periodText}</span>
          </div>
        )}
        {hint && (
          <p className="text-[11px] text-ink-3 truncate">
            {hint}
          </p>
        )}
      </div>
    </div>
  );

  const baseClasses = `bg-surface border border-line rounded-xl shadow-card text-left transition-all ${className}`;

  if (onClick) {
    return (
      <button
        id={id}
        type="button"
        onClick={onClick}
        className={`${baseClasses} min-h-24! rounded-xl! hover:border-line hover:bg-surface-hover cursor-pointer focus-visible:outline-none`}
      >
        {content}
      </button>
    );
  }

  return (
    <div id={id} className={baseClasses}>
      {content}
    </div>
  );
}
