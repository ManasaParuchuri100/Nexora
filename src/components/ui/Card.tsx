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
      className={`bg-surface border border-line rounded-[15px] shadow-card overflow-hidden min-w-0 ${className}`}
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
    <div className={`px-[22px] pt-[22px] pb-4 flex items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-bold text-ink tracking-[-0.3px] truncate">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] leading-[1.65] text-ink-3 mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
