import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Calendar, 
  Paperclip, 
  MessageSquare, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Lead, LeadStage, LeadTag } from '../../../types';

interface LeadsKanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLead: (updated: Lead) => void;
  onAddLeadModal?: () => void;
  initialStage?: LeadStage;
}

interface ColumnConfig {
  stage: LeadStage;
  label: string;
  badgeCount: number;
  description: string;
}

const COLUMNS: ColumnConfig[] = [
  { 
    stage: 'Contacted', 
    label: 'Contacted', 
    badgeCount: 16,
    description: 'Initial outreach, intake verification, and discovery calls'
  },
  { 
    stage: 'Negotiation', 
    label: 'Negotiation', 
    badgeCount: 18,
    description: 'Scope evaluation, pricing models, and contract adjustments'
  },
  { 
    stage: 'Offer sent', 
    label: 'Offer sent', 
    badgeCount: 12,
    description: 'Formal proposals & statements of work awaiting client signature'
  },
  { 
    stage: 'Deal closed', 
    label: 'Deal closed', 
    badgeCount: 12,
    description: 'Signed agreements, contract finalization, and project onboarding'
  },
];

export default function LeadsKanbanBoard({
  leads,
  onSelectLead,
  onUpdateLead,
  onAddLeadModal,
  initialStage = 'Contacted'
}: LeadsKanbanBoardProps) {
  // Only show any ONE of the 4 stages at a time
  const [selectedStage, setSelectedStage] = useState<LeadStage>(initialStage);
  
  // Track open dropdown options menu for cards
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
      return 'text-ink bg-surface-raised border border-line-strong font-semibold';
    }
    if (tag === 'Returning') {
      return 'text-sky-300 bg-sky-950/40 border border-sky-500/30';
    }
    if (tag === 'Follow-up') {
      return 'text-warn bg-amber-950/40 border border-amber-500/30';
    }
    // Default: 'New lead'
    return 'text-ink-2 bg-brand border border-line-strong';
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

  const currentStageIndex = COLUMNS.findIndex(c => c.stage === selectedStage);
  const activeCol = COLUMNS[currentStageIndex >= 0 ? currentStageIndex : 0];
  const activeLeads = getLeadsForStage(activeCol.stage);

  return (
    <div className="w-full space-y-6">
      {/* Stage Selector Ribbon - exactly one of the 4 is selected at a time */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {COLUMNS.map((col, index) => {
          const isSelected = selectedStage === col.stage;
          const colLeads = getLeadsForStage(col.stage);
          const count = Math.max(col.badgeCount, colLeads.length);

          return (
            <button
              key={col.stage}
              type="button"
              onClick={() => {
                setSelectedStage(col.stage);
                setActiveMenuId(null);
              }}
              className={`p-3.5 sm:p-4 text-left transition-all duration-150 border rounded-[9px] cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-surface-hover border-line-strong text-ink shadow-[0_4px_20px_rgba(169,191,165,0.12)] ring-1 ring-[#A9BFA5]/30'
                  : 'bg-surface border-line text-ink-3 hover:border-line hover:bg-[#09221F] hover:text-ink'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px]  tracking-widest uppercase text-ink-3">
                  Stage 0{index + 1}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <h3 className={`font-display font-bold text-base sm:text-lg font-light tracking-tight transition-colors ${
                  isSelected ? 'text-ink' : 'text-ink-3'
                }`}>
                  {col.label}
                </h3>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px]  border transition-colors ${
                  isSelected 
                    ? 'bg-brand text-on-brand border-brand font-bold'
                    : 'bg-surface-raised text-ink-2 border-line'
                }`}>
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-subtle">
        <div className="flex items-center space-x-3">
          <h2 className="font-display font-bold text-2xl sm:text-3xl font-light text-ink tracking-tight">
            {activeCol.label}
          </h2>
          <span className="w-7 h-7 rounded-full bg-surface-raised border border-line flex items-center justify-center text-xs  text-ink-2">
            {activeLeads.length}
          </span>
          <span className="text-xs text-ink-3 font-light hidden lg:inline">
            &mdash; {activeCol.description}
          </span>
        </div>

        {/* Quick Stepper + Add Prospect Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={currentStageIndex === 0}
            onClick={() => {
              if (currentStageIndex > 0) {
                setSelectedStage(COLUMNS[currentStageIndex - 1].stage);
                setActiveMenuId(null);
              }
            }}
            className={`px-3 py-1.5 rounded-[9px] border text-xs  transition-colors flex items-center space-x-1 ${
              currentStageIndex === 0
                ? 'opacity-30 cursor-not-allowed border-line-subtle text-ink-3'
                : 'border-line text-ink-2 hover:text-ink hover:border-line-strong cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev Stage</span>
          </button>

          <button
            type="button"
            disabled={currentStageIndex === COLUMNS.length - 1}
            onClick={() => {
              if (currentStageIndex < COLUMNS.length - 1) {
                setSelectedStage(COLUMNS[currentStageIndex + 1].stage);
                setActiveMenuId(null);
              }
            }}
            className={`px-3 py-1.5 rounded-[9px] border text-xs  transition-colors flex items-center space-x-1 ${
              currentStageIndex === COLUMNS.length - 1
                ? 'opacity-30 cursor-not-allowed border-line-subtle text-ink-3'
                : 'border-line text-ink-2 hover:text-ink hover:border-line-strong cursor-pointer'
            }`}
          >
            <span className="hidden sm:inline">Next Stage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {onAddLeadModal && (
            <button
              type="button"
              onClick={onAddLeadModal}
              className="bg-brand text-on-brand px-3.5 py-1.5 rounded-[9px] font-semibold text-xs uppercase tracking-wider hover:bg-brand-hover transition-colors cursor-pointer flex items-center space-x-1.5 ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Prospect</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards Display for Active Stage Only */}
      {activeLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {activeLeads.map(lead => {
            const isHighlighted = lead.isPriority || lead.name === 'PulseWorks';
            const isMenuOpen = activeMenuId === lead.id;

            return (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className={`relative border p-5 rounded-[9px] transition-all cursor-pointer group select-none flex flex-col justify-between ${
                  isHighlighted
                    ? 'bg-surface-hover border-line-strong shadow-[0_4px_24px_rgba(169,191,165,0.08)] ring-1 ring-[#A9BFA5]/20'
                    : 'bg-surface border-line hover:border-line hover:bg-[#09221F]'
                }`}
              >
                <div>
                  {/* Card Top: Tag badge & More Options */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] uppercase tracking-wider  px-2.5 py-0.5 rounded-[9px] ${getTagBadgeStyle(
                      lead.tag,
                      lead.isPriority
                    )}`}>
                      {lead.tag || 'New lead'}
                    </span>

                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : lead.id)}
                        className="p-1 text-ink-3 hover:text-ink transition-colors cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Options Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-6 w-44 bg-surface-raised border border-line shadow-2xl rounded-[9px] py-1 text-xs  z-30">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectLead(lead);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-ink hover:bg-surface-hover hover:text-ink transition-colors"
                          >
                            View Lead Brief
                          </button>

                          <div className="border-t border-line-subtle my-1" />
                          <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-ink-3">
                            Move Stage:
                          </div>

                          {COLUMNS.map(c => (
                            <button
                              key={c.stage}
                              type="button"
                              disabled={lead.stage === c.stage}
                              onClick={() => handleAdvanceStage(lead, c.stage)}
                              className={`w-full text-left px-3 py-1 text-[11px] transition-colors flex items-center justify-between ${
                                lead.stage === c.stage
                                  ? 'text-ink-3 cursor-not-allowed'
                                  : 'text-ink-2 hover:bg-surface-hover hover:text-ink'
                              }`}
                            >
                              <span>{c.label}</span>
                              <ArrowRight className="w-3 h-3 text-ink-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Title (Company Name) */}
                  <h4 className="font-display font-bold text-base sm:text-lg font-light text-ink group-hover:text-ink transition-colors leading-snug mb-1">
                    {lead.company || lead.name}
                  </h4>

                  {/* Description */}
                  <p className="text-[11px] sm:text-xs text-ink-3 font-light leading-relaxed mb-4 line-clamp-2">
                    {lead.description || 'Enterprise prospect requiring client intake automation and reporting.'}
                  </p>
                </div>

                <div>
                  {/* Assigned Team Member with Avatar */}
                  <div className="flex items-center space-x-2.5 pb-4 mb-3 border-b border-line-subtle">
                    {lead.assignee?.avatar ? (
                      <img
                        src={lead.assignee.avatar}
                        alt={lead.assignee.name}
                        className="w-8 h-8 rounded-full object-cover border border-line-strong"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-hover border border-line-strong flex items-center justify-center text-[10px]  text-ink">
                        {lead.assignee?.name ? lead.assignee.name.charAt(0) : 'N'}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-ink leading-tight">
                        {lead.assignee?.name || 'Mateo Petty'}
                      </p>
                      <p className="text-[10px] text-ink-3 ">
                        {lead.assignee?.role || 'Lead Manager'}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Date, Attachments, Messages & View Action */}
                  <div className="flex items-center justify-between text-[11px]  text-ink-2 pt-1">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-ink-2" />
                      <span>{lead.date || '13 May'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-ink-2">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{lead.messagesCount ?? 4}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="px-2 py-0.5 text-[10px]  rounded-[9px] bg-surface-hover hover:bg-brand text-ink-2 hover:text-on-brand border border-line transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-line bg-surface p-12 text-center rounded-[9px] space-y-3">
          <p className="font-display font-bold text-xl text-ink font-light">
            No prospects found in {activeCol.label}
          </p>
          <p className="text-xs text-ink-3 ">
            Try adjusting your search or tag filters, or add a new prospect to this stage.
          </p>
          {onAddLeadModal && (
            <button
              type="button"
              onClick={onAddLeadModal}
              className="inline-flex items-center space-x-1.5 text-xs text-ink bg-surface-hover border border-line px-3.5 py-2 rounded-[9px] hover:border-line-strong transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add prospect to {activeCol.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
