import React, { useRef } from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  count?: number;
}

export interface TabsProps<T extends string = string> {
  tabs: Array<TabItem<T>>;
  value: T;
  onChange: (id: T) => void;
  /** Prefix used to link each tab to its panel (aria-controls / aria-labelledby). */
  idPrefix?: string;
  label?: string;
  className?: string;
}

/** Local page tabs. Arrow keys, Home and End move between tabs. */
export function Tabs<T extends string = string>({
  tabs,
  value,
  onChange,
  idPrefix = 'tabs',
  label = 'Sections',
  className = '',
}: TabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (from: number, delta: number | 'start' | 'end') => {
    const n = tabs.length;
    const next = delta === 'start' ? 0 : delta === 'end' ? n - 1 : (from + delta + n) % n;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={`flex gap-1.5 flex-wrap ${className}`}>
      {tabs.map((t, i) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={el => { refs.current[i] = el; }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            className={`nx-tab ${selected ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') { e.preventDefault(); move(i, 1); }
              else if (e.key === 'ArrowLeft') { e.preventDefault(); move(i, -1); }
              else if (e.key === 'Home') { e.preventDefault(); move(i, 'start'); }
              else if (e.key === 'End') { e.preventDefault(); move(i, 'end'); }
            }}
          >
            {t.label}
            {typeof t.count === 'number' && <span className="nx-tab-count">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Wrap the content of the selected tab so it is linked to its tab button. */
export function TabPanel({ idPrefix = 'tabs', id, children }: { idPrefix?: string; id: string; children: React.ReactNode }) {
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-tab-${id}`} tabIndex={0} className="focus-visible:outline-none">
      {children}
    </div>
  );
}
