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
    ? 'min-h-[44px] sm:min-h-8! sm:h-8 px-2.5 text-xs font-medium gap-1.5'
    : 'min-h-[44px] sm:min-h-9! sm:h-9 px-3.5 text-sm font-medium gap-2';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-brand text-on-brand hover:opacity-90 active:opacity-95 shadow-xs border-transparent';
      break;
    case 'secondary':
      variantClasses = 'bg-surface text-ink border border-line hover:bg-surface-hover active:bg-surface-raised shadow-xs';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-ink-2 hover:text-ink hover:bg-surface-hover active:bg-surface-raised border-transparent';
      break;
    case 'danger':
      variantClasses = 'bg-danger-soft text-danger border border-line-subtle hover:opacity-90 active:opacity-95';
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
      className={`inline-flex items-center justify-center rounded-lg! cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>}
      {children && <span className="truncate">{children}</span>}
      {trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
    </button>
  );
}
