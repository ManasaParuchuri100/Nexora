import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Send, 
  Sparkles, 
  TrendingUp, 
  User, 
  Paperclip, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { Lead, LeadStage, LeadTag } from '../../../types';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onDispatchResponse?: (leadName: string) => void;
}

const STAGES: LeadStage[] = ['Contacted', 'Negotiation', 'Offer sent', 'Deal closed'];

export default function LeadDetailModal({
  lead,
  onClose,
  onUpdateLead,
  onDispatchResponse
}: LeadDetailModalProps) {
  if (!lead) return null;

  const [notes, setNotes] = useState('');
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [aiDraftMessage, setAiDraftMessage] = useState(
    `Hello ${lead.name},\n\nWe have reviewed ${lead.company}'s requirements for ${lead.description || 'spatial operations'}. Nexora can orchestrate your dedicated pipeline with zero latency and full typography controls.\n\nWould Thursday at 2:00 PM EST suit for an executive demonstration?`
  );

  const handleStageChange = (newStage: LeadStage) => {
    const updated: Lead = {
      ...lead,
      stage: newStage,
      status: 
        newStage === 'Deal closed' ? 'Converted' :
        newStage === 'Offer sent' ? 'Proposal' :
        newStage === 'Negotiation' ? 'Qualified' : 'Contacted'
    };
    onUpdateLead(updated);
  };

  const handleTogglePriority = () => {
    onUpdateLead({
      ...lead,
      isPriority: !lead.isPriority,
      tag: !lead.isPriority ? 'Priority' : 'New lead'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#071C1A] border border-[rgba(169,191,165,0.3)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2px] shadow-2xl flex flex-col text-[#E8E9D8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[rgba(169,191,165,0.2)] flex items-start justify-between bg-[#061816]">
          <div>
            <div className="flex items-center space-x-3 mb-1.5">
              <span className={`text-[10px] uppercase tracking-widest font-mono px-2.5 py-0.5 border ${
                lead.tag === 'Priority' ? 'text-white bg-[#0A2E28] border-[#A9BFA5]' :
                lead.tag === 'Returning' ? 'text-sky-300 bg-sky-950/40 border-sky-500/30' :
                lead.tag === 'Follow-up' ? 'text-amber-300 bg-amber-950/40 border-amber-500/30' :
                'text-[#A9BFA5] bg-[#A9BFA5]/10 border-[#A9BFA5]/30'
              }`}>
                {lead.tag || 'New lead'}
              </span>
              <span className="text-xs font-mono text-[#A9BFA5]/70">
                ID: {lead.id}
              </span>
            </div>
            <h2 className="serif text-2xl sm:text-3xl font-light text-white tracking-tight">
              {lead.company || lead.name}
            </h2>
            <p className="text-xs text-[#A9BFA5]/80 font-light mt-1">
              {lead.description || 'Enterprise prospect inquiry requiring bespoke onboarding.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#A9BFA5]/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Advancement Flow */}
        <div className="px-6 py-4 border-b border-[rgba(169,191,165,0.15)] bg-[#071C1A]">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5]/60 block mb-2">
            Pipeline Stage Progression
          </span>
          <div className="grid grid-cols-4 gap-2">
            {STAGES.map((st, i) => {
              const isCurrent = (lead.stage || 'Contacted') === st;
              const currentIndex = STAGES.indexOf(lead.stage || 'Contacted');
              const isPast = STAGES.indexOf(st) < currentIndex;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStageChange(st)}
                  className={`py-2 px-2 text-center border text-[11px] font-mono tracking-wider transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[#A9BFA5] bg-[#0D2D2A] text-white font-medium shadow-sm'
                      : isPast
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:border-emerald-500/50'
                      : 'border-[rgba(169,191,165,0.15)] bg-[#061816] text-[#A9BFA5]/60 hover:text-[#A9BFA5] hover:border-[rgba(169,191,165,0.3)]'
                  }`}
                >
                  <div className="text-[9px] text-[#A9BFA5]/50 uppercase mb-0.5">0{i + 1}</div>
                  <div className="truncate">{st}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Lead Details Grid */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-[rgba(169,191,165,0.15)] bg-[#061816]">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5]/60 block">
                Estimated Value
              </span>
              <span className="serif text-xl text-white font-light mt-0.5 block">
                {lead.value}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5]/60 block">
                Intent Score
              </span>
              <span className="font-mono text-base text-emerald-400 font-medium mt-0.5 block">
                {lead.score} / 100
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5]/60 block">
                Source
              </span>
              <span className="text-xs text-[#E8E9D8] font-light mt-0.5 block truncate">
                {lead.source}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5]/60 block">
                Last Activity
              </span>
              <span className="text-xs text-[#A9BFA5] font-light mt-0.5 block">
                {lead.lastActivity}
              </span>
            </div>
          </div>

          {/* Assignee & Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5]/60 block">
                Assigned Team Lead
              </span>
              <div className="flex items-center space-x-3 p-3 border border-[rgba(169,191,165,0.15)] bg-[#061816]">
                {lead.assignee?.avatar ? (
                  <img
                    src={lead.assignee.avatar}
                    alt={lead.assignee.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#A9BFA5]/30"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#0D2D2A] border border-[#A9BFA5]/30 flex items-center justify-center text-xs font-mono text-[#E8E9D8]">
                    {lead.assignee?.name ? lead.assignee.name.charAt(0) : 'N'}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-medium text-white">
                    {lead.assignee?.name || 'Mateo Petty'}
                  </h4>
                  <p className="text-[11px] text-[#A9BFA5]/70 font-mono">
                    {lead.assignee?.role || 'Lead Manager'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5]/60 block">
                Primary Contact
              </span>
              <div className="p-3 border border-[rgba(169,191,165,0.15)] bg-[#061816] space-y-1 text-xs">
                <div className="flex items-center space-x-2 text-white font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#A9BFA5]" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-[#A9BFA5]/70 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-[#A9BFA5]/60" />
                  <span>Scheduled date: {lead.date || '13 May'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Response Generator */}
          <div className="border border-[rgba(169,191,165,0.2)] p-4 bg-[#061816] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#A9BFA5]" />
                <span className="text-xs font-medium text-white uppercase tracking-wider font-mono">
                  Nexora AI Follow-up Composer
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiDraft(!showAiDraft)}
                className="text-[10px] font-mono uppercase tracking-wider text-[#A9BFA5] hover:text-white underline cursor-pointer"
              >
                {showAiDraft ? 'Hide Draft' : 'Open Draft'}
              </button>
            </div>

            {showAiDraft && (
              <div className="space-y-3 pt-2">
                <textarea
                  rows={4}
                  value={aiDraftMessage}
                  onChange={(e) => setAiDraftMessage(e.target.value)}
                  className="w-full bg-[#071C1A] border border-[rgba(169,191,165,0.25)] text-xs text-[#E8E9D8] p-3 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] font-light leading-relaxed resize-none"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      onDispatchResponse?.(lead.company || lead.name);
                      onClose();
                    }}
                    className="bg-[#E8E9D8] text-[#071C1A] px-4 py-1.5 rounded-[2px] font-semibold text-xs uppercase tracking-wider hover:bg-white transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Follow-up Note</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[rgba(169,191,165,0.2)] bg-[#061816] flex items-center justify-between">
          <button
            type="button"
            onClick={handleTogglePriority}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
              lead.isPriority
                ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/30'
                : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white'
            }`}
          >
            {lead.isPriority ? '★ Priority Lead' : '☆ Mark Priority'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 border border-[rgba(169,191,165,0.3)] text-xs uppercase font-mono tracking-wider text-[#E8E9D8] hover:bg-[#0D2D2A] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
