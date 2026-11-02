import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  id?: string;
  title?: string;
  'aria-label'?: string;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  id,
  title,
  'aria-label': ariaLabel,
}: ButtonProps) {
  // Use Tailwind important modifier (e.g. min-h-8!, rounded-lg!) to override index.css button rules
  const sizeClasses = size === 'sm'
    ? 'min-h-[44px] sm:min-h-[30px]! sm:h-[30px] px-2.5 text-[11px] font-bold gap-1.5'
    : 'min-h-[44px] sm:min-h-[39px]! sm:h-[39px] px-3.5 text-[13px] font-bold gap-2';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-brand text-on-brand border border-brand hover:bg-brand-hover hover:border-brand-hover';
      break;
    case 'secondary':
      variantClasses = 'bg-surface text-ink-2 border border-line hover:bg-surface-hover hover:text-ink hover:border-line-strong';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-brand hover:bg-brand-soft border border-transparent';
      break;
    case 'danger':
      variantClasses = 'bg-danger-soft text-danger border border-transparent hover:border-danger/30';
      break;
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-[9px]! whitespace-nowrap cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>}
      {children && <span className="truncate">{children}</span>}
      {trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
    </button>
  );
}
