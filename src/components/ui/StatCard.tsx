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
    <div className="px-5 sm:px-[22px] py-5 flex flex-col justify-between h-full gap-2.5 min-h-[121px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-medium text-ink-3">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-[10px] bg-brand-soft flex items-center justify-center text-brand shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-[29px] leading-none font-extrabold tracking-[-0.04em] text-ink tabular-nums">
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
              className={`inline-flex items-center text-[11px] font-bold tabular-nums ${
                delta.trend === 'up'
                  ? 'text-ok'
                  : delta.trend === 'down'
                  ? 'text-danger'
                  : 'text-ink-3'
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

  const baseClasses = `bg-surface border border-line rounded-[15px] shadow-card text-left transition-all ${className}`;

  if (onClick) {
    return (
      <button
        id={id}
        type="button"
        onClick={onClick}
        className={`${baseClasses} min-h-24! rounded-[15px]! hover:border-line-strong hover:-translate-y-px hover:shadow-pop cursor-pointer focus-visible:outline-none`}
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
