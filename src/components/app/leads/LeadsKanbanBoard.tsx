import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Calendar, 
  Paperclip, 
  MessageSquare, 
  Plus, 
  ArrowRight,
  Sparkles,
  Phone,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Lead, LeadStage, LeadTag } from '../../../types';

interface LeadsKanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLead: (updated: Lead) => void;
  onAddLeadModal?: () => void;
}

interface ColumnConfig {
  stage: LeadStage;
  label: string;
  badgeCount: number;
}

const COLUMNS: ColumnConfig[] = [
  { stage: 'Contacted', label: 'Contacted', badgeCount: 16 },
  { stage: 'Negotiation', label: 'Negotiation', badgeCount: 18 },
  { stage: 'Offer sent', label: 'Offer sent', badgeCount: 12 },
  { stage: 'Deal closed', label: 'Deal closed', badgeCount: 12 },
];

export default function LeadsKanbanBoard({
  leads,
  onSelectLead,
  onUpdateLead,
  onAddLeadModal
}: LeadsKanbanBoardProps) {
  // Track open dropdown options menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Group leads by stage
  const getLeadsForStage = (stage: LeadStage) => {
    return leads.filter(l => {
      // Direct stage match or status mapping fallback
      if (l.stage) return l.stage === stage;
      if (stage === 'Deal closed') return l.status === 'Converted';
      if (stage === 'Offer sent') return l.status === 'Proposal';
      if (stage === 'Negotiation') return l.status === 'Qualified';
      return l.status === 'Contacted' || l.status === 'New';
    });
  };

  const getTagBadgeStyle = (tag?: LeadTag, isPriority?: boolean) => {
    if (tag === 'Priority' || isPriority) {
      return 'text-white bg-[#061816] border border-[#A9BFA5] font-semibold';
    }
    if (tag === 'Returning') {
      return 'text-sky-300 bg-sky-950/40 border border-sky-500/30';
    }
    if (tag === 'Follow-up') {
      return 'text-amber-300 bg-amber-950/40 border border-amber-500/30';
    }
    // Default: 'New lead'
    return 'text-[#A9BFA5] bg-[#A9BFA5]/15 border border-[#A9BFA5]/30';
  };

  const handleAdvanceStage = (lead: Lead, targetStage: LeadStage) => {
    const updated: Lead = {
      ...lead,
      stage: targetStage,
      status: 
        targetStage === 'Deal closed' ? 'Converted' :
        targetStage === 'Offer sent' ? 'Proposal' :
        targetStage === 'Negotiation' ? 'Qualified' : 'Contacted'
    };
    onUpdateLead(updated);
    setActiveMenuId(null);
  };

  return (
    <div className="w-full">
      {/* 4 Pipeline Columns Grid matching screenshot layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {COLUMNS.map(col => {
          const colLeads = getLeadsForStage(col.stage);
          // Use badge count from screenshot or actual count, whichever is larger
          const count = Math.max(col.badgeCount, colLeads.length);

          return (
            <div
              key={col.stage}
              className="flex flex-col space-y-4"
            >
              {/* Column Header matching screenshot */}
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(169,191,165,0.15)]">
                <div className="flex items-center space-x-2.5">
                  <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8] tracking-tight">
                    {col.label}
                  </h3>
                  {/* Dark Circular Badge matching screenshot */}
                  <span className="w-6 h-6 rounded-full bg-[#051513] border border-[rgba(169,191,165,0.25)] flex items-center justify-center text-[11px] font-mono text-[#A9BFA5]">
                    {count}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-4 min-h-[400px]">
                {colLeads.map(lead => {
                  const isHighlighted = lead.isPriority || lead.name === 'PulseWorks';
                  const isMenuOpen = activeMenuId === lead.id;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`relative border p-5 rounded-[2px] transition-all cursor-pointer group select-none ${
                        isHighlighted
                          ? 'bg-[#0D2D2A] border-[#A9BFA5] shadow-[0_4px_24px_rgba(169,191,165,0.08)] ring-1 ring-[#A9BFA5]/20'
                          : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)] hover:border-[rgba(169,191,165,0.4)] hover:bg-[#09221F]'
                      }`}
                    >
                      {/* Card Top: Tag badge & More Options */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-[2px] ${getTagBadgeStyle(
                          lead.tag,
                          lead.isPriority
                        )}`}>
                          {lead.tag || 'New lead'}
                        </span>

                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : lead.id)}
                            className="p-1 text-[#A9BFA5]/60 hover:text-white transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Options Dropdown Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-6 w-44 bg-[#051513] border border-[rgba(169,191,165,0.3)] shadow-2xl rounded-[2px] py-1 text-xs font-mono z-30">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectLead(lead);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[#E8E9D8] hover:bg-[#0D2D2A] hover:text-white transition-colors"
                              >
                                View Lead Brief
                              </button>

                              <div className="border-t border-[rgba(169,191,165,0.15)] my-1" />
                              <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-[#A9BFA5]/50">
                                Move Stage:
                              </div>

                              {COLUMNS.map(c => (
                                <button
                                  key={c.stage}
                                  type="button"
                                  disabled={lead.stage === c.stage}
                                  onClick={() => handleAdvanceStage(lead, c.stage)}
                                  className={`w-full text-left px-3 py-1 text-[11px] transition-colors ${
                                    lead.stage === c.stage
                                      ? 'text-[#A9BFA5]/30 cursor-not-allowed'
                                      : 'text-[#A9BFA5] hover:bg-[#0D2D2A] hover:text-white'
                                  }`}
                                >
                                  &rarr; {c.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Title (Company Name) */}
                      <h4 className="serif text-base sm:text-lg font-light text-[#E8E9D8] group-hover:text-white transition-colors leading-snug mb-1">
                        {lead.company || lead.name}
                      </h4>

                      {/* Description */}
                      <p className="text-[11px] sm:text-xs text-[#A9BFA5]/75 font-light leading-relaxed mb-4 line-clamp-2">
                        {lead.description || 'Enterprise prospect requiring client intake automation and reporting.'}
                      </p>

                      {/* Assigned Team Member with Avatar */}
                      <div className="flex items-center space-x-2.5 pb-4 mb-3 border-b border-[rgba(169,191,165,0.12)]">
                        {lead.assignee?.avatar ? (
                          <img
                            src={lead.assignee.avatar}
                            alt={lead.assignee.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#A9BFA5]/30"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#0D2D2A] border border-[#A9BFA5]/30 flex items-center justify-center text-[10px] font-mono text-white">
                            {lead.assignee?.name ? lead.assignee.name.charAt(0) : 'N'}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-[#E8E9D8] leading-tight">
                            {lead.assignee?.name || 'Mateo Petty'}
                          </p>
                          <p className="text-[10px] text-[#A9BFA5]/60 font-mono">
                            {lead.assignee?.role || 'Lead Manager'}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer: Date, Attachments/Calls, Messages */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#A9BFA5]/70">
                        {/* Date */}
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#A9BFA5]/70" />
                          <span>{lead.date || '13 May'}</span>
                        </div>

                        {/* Counts (Calls/Attachments and Messages) */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Paperclip className="w-3.5 h-3.5 text-[#A9BFA5]/70" />
                            <span>{lead.attachmentsCount ?? 2}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-3.5 h-3.5 text-[#A9BFA5]/70" />
                            <span>{lead.messagesCount ?? 4}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Optional + Add card button inside column */}
                <button
                  type="button"
                  onClick={onAddLeadModal}
                  className="w-full py-2.5 border border-dashed border-[rgba(169,191,165,0.2)] text-[11px] font-mono text-[#A9BFA5]/60 hover:text-[#E8E9D8] hover:border-[rgba(169,191,165,0.4)] hover:bg-[#071C1A]/50 transition-all cursor-pointer flex items-center justify-center space-x-1.5 rounded-[2px]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add prospect</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
