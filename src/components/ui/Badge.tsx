import React from 'react';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'hot';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, tone = 'neutral', size = 'sm', className = '' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-[4px] text-[10px] leading-none' : 'px-2 py-[5px] text-[10px]';

  let toneClasses = '';
  switch (tone) {
    case 'brand':
      toneClasses = 'bg-brand-soft text-brand border-line-subtle';
      break;
    case 'success':
      toneClasses = 'bg-ok-soft text-ok border-line-subtle';
      break;
    case 'warning':
      toneClasses = 'bg-warn-soft text-warn border-line-subtle';
      break;
    case 'danger':
      toneClasses = 'bg-danger-soft text-danger border-line-subtle';
      break;
    case 'info':
      toneClasses = 'bg-info-soft text-info border-line-subtle';
      break;
    case 'hot':
      toneClasses = 'bg-hot-soft text-hot border-line-subtle';
      break;
    case 'neutral':
    default:
      toneClasses = 'bg-surface-raised text-ink-2 border-line-subtle';
      break;
  }

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 font-bold rounded-[6px]! border border-transparent! whitespace-nowrap ${sizeClasses} ${toneClasses} ${className}`}
    >
      {children}
    </span>
  );
}
