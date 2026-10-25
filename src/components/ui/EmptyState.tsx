import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-xl border border-line-subtle bg-surface space-y-4 max-w-md mx-auto ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-raised border border-line-subtle flex items-center justify-center mx-auto text-ink-2">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="text-xs text-ink-3 leading-relaxed">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
