import React from 'react';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`pb-4 border-b border-line-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0 space-y-0.5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-ink-3">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
