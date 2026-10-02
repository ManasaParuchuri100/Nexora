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
    { label: 'Overview', category: 'overview' as NavCategory, sub: 'default' as SubCategory, icon: Activity, desc: 'Executive pulse & cross-functional dashboard' },
    { label: 'Engage / Inbox', category: 'engage' as NavCategory, sub: 'inbox' as SubCategory, icon: Activity, desc: 'Omnichannel message inquiries' },
    { label: 'Engage / Conversations', category: 'engage' as NavCategory, sub: 'conversations' as SubCategory, icon: Activity, desc: 'Active conversational CRM threads' },
    { label: 'Engage / Human Handoff', category: 'engage' as NavCategory, sub: 'human-handoff' as SubCategory, icon: Activity, desc: 'Autonomous escalation queue for review' },
    { label: 'Leads / All Leads', category: 'leads' as NavCategory, sub: 'all-leads' as SubCategory, icon: Users, desc: 'Directory of all prospects and client accounts' },
    { label: 'Leads / Pipeline', category: 'leads' as NavCategory, sub: 'pipeline' as SubCategory, icon: Users, desc: 'Visual Kanban pipeline across conversion stages' },
    { label: 'Leads / Follow-ups', category: 'leads' as NavCategory, sub: 'follow-ups' as SubCategory, icon: Users, desc: 'Scheduled cadences and follow-up letters' },
    { label: 'Content / AI Content', category: 'content' as NavCategory, sub: 'ai-content' as SubCategory, icon: Wand2, desc: 'Creative Studio prompt & brief synthesis' },
    { label: 'Content / Social Posts', category: 'content' as NavCategory, sub: 'social-posts' as SubCategory, icon: Share2, desc: 'Multichannel composition & scheduler' },
    { label: 'Content / Content Library', category: 'content' as NavCategory, sub: 'content-library' as SubCategory, icon: Wand2, desc: 'Archive of saved visual & editorial assets' },
    { label: 'Campaigns / Campaigns', category: 'campaigns' as NavCategory, sub: 'campaigns-list' as SubCategory, icon: Megaphone, desc: 'Plan and orchestrate live campaigns' },
    { label: 'Campaigns / Create Campaign', category: 'campaigns' as NavCategory, sub: 'create-campaign' as SubCategory, icon: Megaphone, desc: 'Step-by-step AI campaign blueprint generator' },
    { label: 'Campaigns / Campaign Performance', category: 'campaigns' as NavCategory, sub: 'campaign-performance' as SubCategory, icon: TrendingUp, desc: 'Performance analytics and conversion metrics' },
    { label: 'Analytics / Overview', category: 'analytics' as NavCategory, sub: 'analytics-overview' as SubCategory, icon: Activity, desc: 'Executive performance KPIs and growth metrics' },
    { label: 'Analytics / Lead Analytics', category: 'analytics' as NavCategory, sub: 'lead-analytics' as SubCategory, icon: TrendingUp, desc: 'Acquisition velocity and conversion heatmaps' },
    { label: 'Analytics / Channel Performance', category: 'analytics' as NavCategory, sub: 'channel-performance' as SubCategory, icon: TrendingUp, desc: 'Attribution, CAC, and ROI by channel' },
    { label: 'Settings / Business Profile', category: 'settings' as NavCategory, sub: 'business-profile' as SubCategory, icon: Sparkles, desc: 'Studio brand parameters and tone guidelines' },
    { label: 'Settings / Channels', category: 'settings' as NavCategory, sub: 'channels' as SubCategory, icon: Share2, desc: 'Manage connected API and social endpoints' },
    { label: 'Settings / AI & Automation', category: 'settings' as NavCategory, sub: 'ai-automation' as SubCategory, icon: Sparkles, desc: 'Configure AI rules, temperature & handoff triggers' },
    { label: 'Settings / Team & Access', category: 'settings' as NavCategory, sub: 'team-access' as SubCategory, icon: Users, desc: 'Manage studio collaborators & permissions' }
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
