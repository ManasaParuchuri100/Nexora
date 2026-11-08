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
import { useTheme } from '../../../context/ThemeContext';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [notes, setNotes] = useState('');
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [aiDraftMessage, setAiDraftMessage] = useState(
    lead
      ? `Hello ${lead.name},\n\nWe have reviewed ${lead.company}'s requirements for ${lead.description || 'platform automation'}. TECAVY can orchestrate your pipeline with zero latency and full multichannel controls.\n\nWould tomorrow at 11:30 AM IST suit for a tailored platform walkthrough?`
      : ''
  );

  if (!lead) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col border transition-colors ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900' 
            : 'bg-surface border-line text-ink'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-start justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-surface-raised border-line'
        }`}>
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                lead.tag === 'Priority' || lead.isPriority
                  ? 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-danger dark:border-rose-800/40'
                  : lead.tag === 'Returning'
                  ? 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40'
                  : lead.tag === 'Follow-up'
                  ? 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-warn dark:border-amber-800/40'
                  : 'text-slate-700 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {lead.tag || 'New lead'}
              </span>
              <span className="text-xs text-slate-400 dark:text-ink-2 ">
                ID: {lead.id}
              </span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-ink'
            }`}>
              {lead.company || lead.name}
            </h2>
            <p className={`text-xs mt-1 ${
              isLight ? 'text-slate-500' : 'text-ink-2'
            }`}>
              {lead.description || 'Enterprise prospect inquiry requiring bespoke onboarding.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-ink dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Advancement Flow */}
        <div className={`px-6 py-4 border-b ${
          isLight ? 'bg-white border-slate-200' : 'bg-surface border-line-subtle'
        }`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-2 ${
            isLight ? 'text-slate-500' : 'text-ink-3'
          }`}>
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
                  className={`py-2 px-2 text-center rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-teal-600 border-teal-600 text-ink font-semibold shadow-xs'
                      : isPast
                      ? isLight 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-emerald-500/30 bg-emerald-950/20 text-ok'
                      : isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        : 'border-line-subtle bg-surface-raised text-ink-3 hover:text-ink-2'
                  }`}
                >
                  <div className={`text-[10px] uppercase font-bold mb-0.5 ${
                    isCurrent ? 'text-teal-100' : 'opacity-60'
                  }`}>
                    0{i + 1}
                  </div>
                  <div className="truncate">{st}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Lead Details Grid */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200/90' : 'bg-surface-raised border-line-subtle'
          }`}>
            <div>
              <span className={`text-[11px] uppercase tracking-wider block font-semibold ${
                isLight ? 'text-slate-500' : 'text-ink-3'
              }`}>
                Estimated Value
              </span>
              <span className={`text-lg font-bold mt-0.5 block ${
                isLight ? 'text-slate-900' : 'text-ink'
              }`}>
                {lead.value || '₹4.5L'}
              </span>
            </div>
            <div>
              <span className={`text-[11px] uppercase tracking-wider block font-semibold ${
                isLight ? 'text-slate-500' : 'text-ink-3'
              }`}>
                Intent Score
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-ok mt-0.5 block">
                {lead.score} / 100
              </span>
            </div>
            <div>
              <span className={`text-[11px] uppercase tracking-wider block font-semibold ${
                isLight ? 'text-slate-500' : 'text-ink-3'
              }`}>
                Source
              </span>
              <span className={`text-xs font-medium mt-0.5 block truncate ${
                isLight ? 'text-slate-700' : 'text-ink'
              }`}>
                {lead.source}
              </span>
            </div>
            <div>
              <span className={`text-[11px] uppercase tracking-wider block font-semibold ${
                isLight ? 'text-slate-500' : 'text-ink-3'
              }`}>
                Last Activity
              </span>
              <span className={`text-xs mt-0.5 block ${
                isLight ? 'text-slate-600' : 'text-ink-2'
              }`}>
                {lead.lastActivity || 'Today'}
              </span>
            </div>
          </div>

          {/* Assignee & Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className={`text-[11px] uppercase tracking-wider block font-semibold ${
                isLight ? 'text-slate-500' : 'text-ink-3'
              }`}>
                Assigned Team Lead
              </span>
              <div className={`flex items-center space-x-3 p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-surface-raised border-line-subtle'
              }`}>
                <div className="w-9 h-9 rounded-full bg-teal-600 text-ink flex items-center justify-center text-xs font-bold">
                  {lead.assignee?.name ? lead.assignee.name.charAt(0) : 'R'}
                </div>
                <div>
                  <h4 className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-ink'}`}>
                    {lead.assignee?.name || 'Rahul — Sales'}
                  </h4>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-ink-2'}`}>
                    {lead.assignee?.role || 'Lead Manager'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className={`text-[11px] uppercase tracking-wider block font-semibold ${
                isLight ? 'text-slate-500' : 'text-ink-3'
              }`}>
                Primary Contact
              </span>
              <div className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-surface-raised border-line-subtle'
              }`}>
                <div className={`flex items-center space-x-2 font-medium ${isLight ? 'text-slate-800' : 'text-ink'}`}>
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  <span>{lead.email}</span>
                </div>
                <div className={`flex items-center space-x-2 text-[11px] ${isLight ? 'text-slate-500' : 'text-ink-2'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Scheduled date: {lead.date || 'Today'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Response Generator */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-teal-50/50 border-teal-200/80' : 'bg-surface-raised border-line'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-teal-900' : 'text-ink'
                }`}>
                  TECAVY AI Follow-up Composer
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiDraft(!showAiDraft)}
                className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
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
                  className={`w-full p-3 rounded-lg text-xs leading-relaxed resize-none focus:outline-none focus:border-teal-600 border ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-800' 
                      : 'bg-surface border-line text-ink'
                  }`}
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      onDispatchResponse?.(lead.company || lead.name);
                      onClose();
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-ink px-4 py-2 rounded-lg font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Follow-up Note</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-surface-raised border-line'
        }`}>
          <button
            type="button"
            onClick={handleTogglePriority}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              lead.isPriority
                ? 'border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-700 dark:text-danger dark:bg-rose-950/40'
                : isLight
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-line text-ink-2 hover:text-ink'
            }`}
          >
            {lead.isPriority ? '★ Priority Lead' : '☆ Mark Priority'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-line text-ink hover:bg-surface-hover'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
