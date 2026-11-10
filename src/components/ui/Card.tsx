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
      className={`bg-surface border border-line rounded-[10px] shadow-card overflow-hidden min-w-0 ${className}`}
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
    <div className={`px-6 pt-6 pb-4 flex items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h3 className="font-display text-[16px] font-semibold text-ink tracking-[-0.01em] truncate">
          {title}
        </h3>
        {description && (
          <p className="text-[13px] leading-[1.6] text-ink-3 mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-t border-line flex items-center justify-end gap-2 ${className}`}>{children}</div>;
}
