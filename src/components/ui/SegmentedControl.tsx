import React from 'react';

export interface SegmentedControlOption<T extends string = string> {
  id: T;
  label: React.ReactNode;
  count?: number;
}

export interface SegmentedControlProps<T extends string = string> {
  options: Array<SegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  size = 'sm',
}: SegmentedControlProps<T>) {
  const containerPadding = size === 'sm' ? 'p-0.5' : 'p-1';
  const buttonPadding = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div
      role="group"
      className={`inline-flex items-center rounded-lg bg-surface-raised border border-line-subtle ${containerPadding} ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.id)}
            className={`min-h-[38px] sm:min-h-7! rounded-md! font-medium transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${buttonPadding} ${
              isSelected
                ? 'bg-surface text-ink font-semibold shadow-xs'
                : 'bg-transparent text-ink-3 hover:text-ink'
            }`}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={`text-xs tabular-nums px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected ? 'bg-surface-raised text-ink' : 'bg-surface text-ink-3'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
