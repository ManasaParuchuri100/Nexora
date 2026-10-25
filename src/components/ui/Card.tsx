import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  id?: string;
}

export function Card({ children, className = '', onClick, id }: CardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-surface border border-line rounded-xl shadow-card overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-4 sm:p-5 flex items-start justify-between gap-4 border-b border-line-subtle ${className}`}>
      <div className="min-w-0 space-y-0.5">
        <h3 className="text-sm sm:text-base font-semibold text-ink tracking-tight truncate">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-ink-3">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
