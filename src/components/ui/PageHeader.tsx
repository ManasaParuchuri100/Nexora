import React from 'react';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Small tracked kicker above the title, e.g. "Workspace / Leads". */
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  /** Slim single-row header for dense, table-first pages. */
  compact?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className = '',
  compact = false,
}: PageHeaderProps) {
  if (compact) {
    return (
      <div className={`flex items-center justify-between gap-4 mb-4 flex-wrap ${className}`}>
        <div className="min-w-0 flex items-baseline gap-3 flex-wrap">
          <h1 className="text-[22px] leading-[1.25] font-semibold tracking-[-0.02em] text-ink m-0">{title}</h1>
          {subtitle && <p className="text-[13px] text-ink-3 m-0 hidden md:block">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-[9px] flex-wrap">{actions}</div>}
      </div>
    );
  }
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6 ${className}`}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="text-[28px] leading-[1.25] font-semibold tracking-[-0.02em] text-ink mt-2 mb-1.5">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] leading-[1.6] text-ink-3 m-0">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-[9px] flex-wrap">{actions}</div>}
    </div>
  );
}
