import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Activity, 
  Megaphone, 
  Wand2, 
  Share2, 
  Users, 
  Sparkles, 
  ArrowRight,
  TrendingUp
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
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: 'Insights / Live Leads', category: 'insights' as NavCategory, sub: 'live-leads' as SubCategory, icon: Activity, desc: 'Jump to real-time prospect inquiries' },
    { label: 'Insights / Stats', category: 'insights' as NavCategory, sub: 'stats' as SubCategory, icon: Activity, desc: 'Review 248 leads & 64% conversion' },
    { label: 'Insights / Trending Topics', category: 'insights' as NavCategory, sub: 'trending-topics' as SubCategory, icon: TrendingUp, desc: 'Explore market radar & trends' },
    { label: 'Campaigns / All Campaigns', category: 'campaigns' as NavCategory, sub: 'campaigns-overview' as SubCategory, icon: Megaphone, desc: 'Plan, launch, and manage campaigns' },
    { label: 'Campaigns / Create New Campaign', category: 'campaigns' as NavCategory, sub: 'create-campaign' as SubCategory, icon: Megaphone, desc: 'AI campaign roadmap & execution blueprint flow' },
    { label: 'Creative Lab / Create', category: 'creative-lab' as NavCategory, sub: 'create' as SubCategory, icon: Wand2, desc: 'Draft AI marketing copy & briefs' },
    { label: 'Creative Lab / Generated Assets', category: 'creative-lab' as NavCategory, sub: 'generated-assets' as SubCategory, icon: Wand2, desc: 'Browse saved creative copies' },
    { label: 'Social Hub / AI Guided Creation', category: 'social-hub' as NavCategory, sub: 'ai-guided-creation' as SubCategory, icon: Share2, desc: 'Multichannel composition tool' },
    { label: 'Social Hub / Connect Accounts', category: 'social-hub' as NavCategory, sub: 'connect' as SubCategory, icon: Share2, desc: 'LinkedIn, X, Substack integrations' },
    { label: 'Leads / Lead Automation', category: 'leads' as NavCategory, sub: 'lead-automation' as SubCategory, icon: Users, desc: 'Automated qualification & routing' },
    { label: 'Assistant Copilot', category: 'assistant' as NavCategory, sub: 'overview' as SubCategory, icon: Sparkles, desc: 'Conversational command center' }
  ];

  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#071C1A] border border-[rgba(169,191,165,0.25)] shadow-2xl overflow-hidden animate-scaleUp text-[#E8E9D8]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-[rgba(169,191,165,0.2)] bg-[#061816]">
          <Search className="w-4 h-4 text-[#A9BFA5] mr-3 shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or jump to section..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-[#E8E9D8] placeholder-[#A9BFA5]/40 focus:outline-none font-light"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 border border-[rgba(169,191,165,0.25)] rounded-[2px] text-[#A9BFA5]/60 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-[rgba(169,191,165,0.1)] p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#A9BFA5]/50 font-light">
              No matching commands found.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectNav(cmd.category, cmd.sub);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-[2px] hover:bg-[#0D2D2A]/40 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-[#A9BFA5] group-hover:text-[#E8E9D8]" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs font-medium text-[#E8E9D8]">{cmd.label}</p>
                      <p className="text-[11px] text-[#A9BFA5]/60 font-light">{cmd.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A9BFA5]/40 group-hover:text-[#E8E9D8] group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })
          )}
        </div>

        {/* Quick action bar */}
        <div className="p-3 border-t border-[rgba(169,191,165,0.15)] bg-[#061816] flex items-center justify-between text-[11px] text-[#A9BFA5]/70 font-mono">
          <span>Shortcuts: +Lead, +Campaign, +Content</span>
          <span>Nexora Command</span>
        </div>
      </div>
    </div>
  );
}
