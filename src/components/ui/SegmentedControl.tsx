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
  const containerPadding = '';
  const buttonPadding = size === 'sm' ? 'px-3 py-[7px] text-[12px]' : 'px-3 py-2 text-[13px]';

  return (
    <div
      role="group"
      className={`inline-flex items-center gap-[5px] flex-wrap ${containerPadding} ${className}`}
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
            className={`min-h-[38px] sm:min-h-0! rounded-[7px]! font-bold transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${buttonPadding} ${
              isSelected
                ? 'bg-brand-soft text-brand'
                : 'bg-transparent text-[#718196] hover:text-ink hover:bg-surface-hover'
            }`}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={`text-[10px] tabular-nums font-bold ${
                  isSelected ? 'text-brand' : 'text-ink-3'
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
