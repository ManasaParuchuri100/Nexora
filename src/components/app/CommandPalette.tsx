import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Plus, 
  User, 
  MessageSquare, 
  Layers, 
  ArrowRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { NavCategory, SubCategory } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNav: (category: NavCategory, subCategory?: SubCategory) => void;
  onTriggerQuickAction: (action: 'campaign' | 'content' | 'lead' | 'schedule') => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectNav,
  onTriggerQuickAction
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-surface-raised border border-line shadow-2xl rounded-[8px] overflow-hidden  text-xs text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar (Page 9 spec) */}
        <div className="flex items-center px-4 py-3.5 border-b border-line bg-surface">
          <Search className="w-4 h-4 text-ink-2 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search leads, conversations, campaigns, or actions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-ink text-xs focus:outline-none placeholder:text-ink-3 font-light"
          />
          <button type="button" onClick={onClose} className="text-ink-2 hover:text-ink p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content sections */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 divide-y divide-line-subtle">
          
          {/* ACTIONS */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-ink-3 font-semibold block">
              ACTIONS
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerQuickAction('lead');
                }}
                className="px-2.5 py-1 bg-surface-hover hover:bg-brand border border-line rounded text-ink cursor-pointer"
              >
                + New lead
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerQuickAction('schedule');
                }}
                className="px-2.5 py-1 bg-surface-hover hover:bg-brand border border-line rounded text-ink cursor-pointer"
              >
                + New post
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerQuickAction('campaign');
                }}
                className="px-2.5 py-1 bg-surface-hover hover:bg-brand border border-line rounded text-ink cursor-pointer"
              >
                + New campaign
              </button>
            </div>
          </div>

          {/* LEADS */}
          <div className="pt-3 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-ink-3 font-semibold block">
              LEADS
            </span>
            <div 
              onClick={() => {
                onClose();
                onSelectNav('leads', 'all-leads');
              }}
              className="p-2 hover:bg-surface-hover rounded cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-ink">Aster Labs</span>
                <span className="text-ink-2 ml-2">· Qualified · Hot</span>
              </div>
              <span className="text-ink-3 text-[11px]">92 score</span>
            </div>
          </div>

          {/* CONVERSATIONS */}
          <div className="pt-3 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-ink-3 font-semibold block">
              CONVERSATIONS
            </span>
            <div 
              onClick={() => {
                onClose();
                onSelectNav('inbox', 'inbox');
              }}
              className="p-2 hover:bg-surface-hover rounded cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-ink">Rahul Sharma</span>
                <span className="text-ink-2 ml-2">· WhatsApp · 4 min ago</span>
              </div>
              <span className="text-warn text-[11px]">Needs you</span>
            </div>
          </div>

          {/* PAGES */}
          <div className="pt-3 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-ink-3 font-semibold block">
              PAGES
            </span>
            {[
              { label: 'Overview', category: 'overview' as const, sub: 'overview' as const },
              { label: 'Onboarding', category: 'onboarding' as const, sub: 'default' as const },
              { label: 'Inbox', category: 'inbox' as const, sub: 'inbox' as const },
              { label: 'Leads', category: 'leads' as const, sub: 'all-leads' as const },
              { label: 'Follow-ups', category: 'leads' as const, sub: 'follow-ups' as const },
              { label: 'Engagement agent', category: 'agent' as const, sub: 'default' as const },
              { label: 'Content studio', category: 'content' as const, sub: 'create' as const },
              { label: 'Schedule', category: 'content' as const, sub: 'schedule' as const },
              { label: 'Library', category: 'content' as const, sub: 'library' as const },
              { label: 'Campaigns', category: 'campaigns' as const, sub: 'campaign-list' as const },
              { label: 'Analytics', category: 'analytics' as const, sub: 'overview' as const },
            ]
              .filter(p => !query.trim() || p.label.toLowerCase().includes(query.toLowerCase()))
              .map(page => (
                <button
                  key={page.label}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectNav(page.category, page.sub);
                  }}
                  className="w-full text-left p-2 hover:bg-surface-hover rounded cursor-pointer text-xs flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
                >
                  <span className="text-ink">{page.label}</span>
                  <span className="text-ink-3 text-[11px]">Jump to page</span>
                </button>
              ))}
          </div>

        </div>

        {/* Footer hints */}
        <div className="px-4 py-2 border-t border-line-subtle bg-surface text-[11px] text-ink-3 flex items-center justify-between">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}
