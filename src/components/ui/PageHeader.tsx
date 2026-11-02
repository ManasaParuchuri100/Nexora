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
    <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-5 mb-[22px] ${className}`}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="text-[24px] sm:text-[28px] leading-[1.25] font-extrabold tracking-[-0.04em] text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-ink-3 mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{actions}</div>}
    </div>
  );
}
