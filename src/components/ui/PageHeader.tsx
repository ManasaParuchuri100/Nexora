import React from 'react';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Small tracked kicker above the title, e.g. "Workspace / Leads". */
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-[26px] ${className}`}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="text-[28px] leading-[1.25] font-bold tracking-[-1.1px] text-ink mt-2 mb-1.5">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] leading-[1.65] text-ink-3 m-0">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-[9px] flex-wrap">{actions}</div>}
    </div>
  );
}
