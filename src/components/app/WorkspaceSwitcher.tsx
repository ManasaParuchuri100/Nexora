import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { BRAND_NAME } from '../../config/brand';

export interface Workspace {
  id: string;
  name: string;
  role: string;
}

export const workspacesFor = (name: string, role: string): Workspace[] => [
  { id: 'ws-1', name: name || `${BRAND_NAME} Workspace`, role: role || 'Owner' },
  { id: 'ws-2', name: `${BRAND_NAME} Retail Hub`, role: 'Admin' },
  { id: 'ws-3', name: 'Sterling Creative', role: 'Viewer' },
];

/** The one place to pick a workspace. The sidebar only shows the current one, read-only. */
export default function WorkspaceSwitcher({
  current,
  onSelect,
  baseName,
  role,
  isDemoWorkspace,
  onToggleDemoWorkspace,
}: {
  current: string;
  onSelect: (name: string) => void;
  baseName: string;
  role: string;
  isDemoWorkspace: boolean;
  onToggleDemoWorkspace?: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const workspaces = workspacesFor(baseName, role);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="relative min-w-0" ref={ref}>
      <button
        type="button"
        id="workspace-switcher"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 h-10 min-h-10! max-w-[240px] pl-1.5 pr-2.5 rounded-[8px]! border border-line bg-surface hover:border-line-strong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="w-7 h-7 rounded-[6px] grid place-items-center bg-avatar text-avatar-ink text-[12px] font-semibold uppercase shrink-0">
          {current[0]}
        </span>
        <span className="hidden sm:block min-w-0 text-left">
          <span className="block text-[13px] font-medium text-ink truncate leading-tight">{current}</span>
          <span className="block text-[12px] text-ink-3 truncate leading-tight">{isDemoWorkspace ? 'Demo workspace' : role}</span>
        </span>
        <ChevronsUpDown className="w-4 h-4 text-ink-3 shrink-0" />
      </button>

      {open && (
        <div role="listbox" aria-label="Workspaces" className="absolute left-0 top-full mt-2 w-[280px] bg-surface border border-line rounded-[10px] shadow-pop py-1.5 z-50 text-sm animate-fadeIn">
          <div className="px-3 py-1 text-[12px] font-medium text-ink-3">Workspaces</div>
          {workspaces.map(ws => (
            <button
              key={ws.id}
              type="button"
              role="option"
              aria-selected={current === ws.name}
              onClick={() => { onSelect(ws.name); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-[14px] text-ink hover:bg-surface-hover transition-colors text-left cursor-pointer min-h-0!"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="truncate font-medium">{ws.name}</span>
                <span className="text-[12px] text-ink-3">({ws.role})</span>
              </span>
              {current === ws.name && <Check className="w-4 h-4 text-brand shrink-0" />}
            </button>
          ))}
          <div className="border-t border-line-subtle my-1.5" />
          <label className="px-3 py-2 flex items-center justify-between text-[13px] text-ink cursor-pointer hover:bg-surface-hover">
            <span className="font-medium">Demo workspace</span>
            <input type="checkbox" checked={isDemoWorkspace} onChange={e => onToggleDemoWorkspace?.(e.target.checked)} className="accent-brand cursor-pointer" />
          </label>
          <div className="border-t border-line-subtle my-1.5" />
          <button type="button" onClick={() => setOpen(false)} className="w-full px-3 py-2 text-left text-[13px] font-medium text-brand hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-1.5 min-h-0!">
            <Plus className="w-3.5 h-3.5" /> New workspace
          </button>
        </div>
      )}
    </div>
  );
}
