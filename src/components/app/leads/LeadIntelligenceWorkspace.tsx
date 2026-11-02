import React, { useState, useEffect, useRef } from 'react';
import { 
  X,
  Sparkles, 
  MessageSquare, 
  Send, 
  UserCheck, 
  RotateCw, 
  Plus, 
  Lock, 
  Bot, 
  User, 
  Check,
  Clock,
  Building2,
  Mail,
  Phone,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { 
  Lead, 
  LeadTemperature, 
  LeadHandlingMode, 
  LeadTimelineEvent, 
  LeadFollowUp,
  LeadStage,
  NavCategory,
  SubCategory
} from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { useConversations, ConversationItem } from '../../../data/conversations';
import { 
  deriveTemperature, 
  deriveQualification, 
  deriveScoreSignals, 
  stageToStatus 
} from '../../../lib/leadIntel';
import { formatRelative } from '../../../lib/time';
import { BRAND_NAME } from '../../../config/brand';

interface LeadIntelligenceWorkspaceProps {
  key?: React.Key | string | number;
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onNavigate?: (category: NavCategory, subCategory?: SubCategory) => void;
  onNotify?: (title: string, desc: string) => void;
}

export function getChannelBadge(source?: string) {
  const s = (source || '').toLowerCase();
  if (s.includes('whatsapp')) {
    return { 
      name: 'WhatsApp', 
      badge: 'text-ok bg-ok-soft border-transparent' 
    };
  }
  if (s.includes('instagram')) {
    return { 
      name: 'Instagram', 
      badge: 'text-pink-700 bg-pink-50 border-pink-200' 
    };
  }
  if (s.includes('linkedin')) {
    return { 
      name: 'LinkedIn', 
      badge: 'text-info bg-info-soft border-sky-200' 
    };
  }
  if (s.includes('website')) {
    return { 
      name: 'Website', 
      badge: 'text-brand bg-brand-soft border-brand/30' 
    };
  }
  return { 
    name: source || 'Direct', 
    badge: 'text-ink-2 bg-surface-raised border-line' 
  };
}

const STAGE_OPTIONS: LeadStage[] = [
  'New',
  'Engaged',
  'Qualified',
  'Contacted',
  'Proposal',
  'Won',
  'Lost'
];

export default function LeadIntelligenceWorkspace({
  lead,
  onClose,
  onUpdateLead,
  onNavigate: _onNavigate,
  onNotify
}: LeadIntelligenceWorkspaceProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Synced reactive conversations store
  const [conversations, setConversations] = useConversations();

  // Sub-tabs: 'qualification' | 'conversation' | 'info' | 'timeline' | 'notes'
  type WorkspaceSubTab = 'qualification' | 'conversation' | 'info' | 'timeline' | 'notes';
  // Accordion: several sections can be open at once
  const [openSections, setOpenSections] = useState<Set<WorkspaceSubTab>>(() => new Set<WorkspaceSubTab>(['qualification']));
  const toggleSection = (id: WorkspaceSubTab) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  // Opens a section (keeping others as they are) and scrolls it into view
  const setActiveSubTab = (id: WorkspaceSubTab) => {
    setOpenSections(prev => (prev.has(id) ? prev : new Set(prev).add(id)));
    setTimeout(() => {
      document.getElementById(`lead-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Reply text input
  const [replyText, setReplyText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Handling mode: AI or HUMAN
  const [handlingMode, setHandlingMode] = useState<LeadHandlingMode>(lead?.handlingMode || 'AI');

  // Activity timeline
  const [timelineEvents, setTimelineEvents] = useState<LeadTimelineEvent[]>(lead?.timelineEvents || []);

  // Follow-ups
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>(lead?.followUps || []);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [newFollowUpText, setNewFollowUpText] = useState('');
  const [newFollowUpTime, setNewFollowUpTime] = useState('Tomorrow — 11:00 AM');

  // Internal Notes
  const [notes, setNotes] = useState<string[]>(lead?.internalNotes || []);
  const [newNote, setNewNote] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>(lead?.tags || []);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // AI Summary
  const [aiSummary, setAiSummary] = useState<string>(lead?.conversationSummary || '');
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ALL hooks must be declared above this early return
  if (!lead) return null;

  // Unify conversation thread with useConversations()
  const matchedConvo = conversations.find(
    (c) => c.leadReferenceId === lead.id || c.id === lead.id
  );
  const conversationMessages = matchedConvo?.messages || [];

  // Intelligence derivation
  const temperature: LeadTemperature = deriveTemperature(
    lead.score,
    lead.temperatureOverride
  );
  const qualificationChecks = deriveQualification(lead, matchedConvo);
  const scoreSignals = deriveScoreSignals(lead, matchedConvo);

  const intentLevel =
    lead.intentLevel ||
    (temperature === 'HOT'
      ? 'High purchase intent'
      : temperature === 'WARM'
      ? 'Evaluating alternatives'
      : 'Information gathering');

  const aiRecommendation =
    lead.aiRecommendation ||
    (temperature === 'HOT'
      ? 'Schedule a sales discovery call'
      : 'Send product overview & follow-up sequence');

  // Stage change handler (Single source of truth)
  const handleStageChange = (newStage: LeadStage) => {
    const newStatus = stageToStatus(newStage);
    const now = new Date();
    const newTimelineEvt: LeadTimelineEvent = {
      id: `t-${Date.now()}`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      at: now.toISOString(),
      title: `Stage updated to ${newStage}`,
      description: `Pipeline status mapped to ${newStatus}`,
      type: 'status_change'
    };
    const updatedTimeline = [newTimelineEvt, ...timelineEvents];
    setTimelineEvents(updatedTimeline);

    const updated: Lead = {
      ...lead,
      stage: newStage,
      status: newStatus,
      timelineEvents: updatedTimeline
    };
    onUpdateLead(updated);
    if (onNotify) {
      onNotify('Stage Updated', `Lead stage changed to ${newStage}.`);
    }
  };

  // Temperature change handler (Stores override without changing score)
  const handleTemperatureChange = (newTemp: LeadTemperature) => {
    // If clicking same as current override, reset override to undefined
    const nextOverride = lead.temperatureOverride === newTemp ? undefined : newTemp;
    const now = new Date();
    const newTimelineEvt: LeadTimelineEvent = {
      id: `t-${Date.now()}`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      at: now.toISOString(),
      title: nextOverride ? `Temperature overridden to ${newTemp}` : 'Temperature reset to calculated',
      type: 'qualification'
    };
    const updatedTimeline = [newTimelineEvt, ...timelineEvents];
    setTimelineEvents(updatedTimeline);

    const updated: Lead = {
      ...lead,
      temperatureOverride: nextOverride,
      temperature: deriveTemperature(lead.score, nextOverride),
      timelineEvents: updatedTimeline
    };
    onUpdateLead(updated);
    if (onNotify) {
      onNotify(
        'Temperature Updated',
        nextOverride ? `Lead temperature overridden to ${newTemp}.` : 'Temperature reset to calculated.'
      );
    }
  };

  // Send message to unified thread
  const handleSendMessage = () => {
    if (!replyText.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isoAt = now.toISOString();

    if (matchedConvo) {
      const newMsg: ConversationItem['messages'][number] = {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        senderName: lead.assignee?.name || 'Agent',
        text: replyText.trim(),
        time: timeStr
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === matchedConvo.id
            ? {
                ...c,
                messages: [...c.messages, newMsg],
                time: 'Just now',
                timestampRaw: Date.now()
              }
            : c
        )
      );
    }

    const newTimelineEvt: LeadTimelineEvent = {
      id: `t-${Date.now()}`,
      time: timeStr,
      at: isoAt,
      title: `${handlingMode === 'AI' ? 'AI' : 'Agent'} sent reply`,
      description: replyText.trim().slice(0, 70) + (replyText.length > 70 ? '...' : ''),
      type: 'message'
    };
    const updatedTimeline = [newTimelineEvt, ...timelineEvents];
    setTimelineEvents(updatedTimeline);

    onUpdateLead({
      ...lead,
      timelineEvents: updatedTimeline,
      lastActivity: 'Just now'
    });

    setReplyText('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Generate AI Reply
  const handleGenerateAiReply = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setReplyText(
        `Hi ${lead.name}, thanks for confirming! I have shared our platform overview. Would tomorrow at 11:30 AM or 3:00 PM work for a tailored walkthrough?`
      );
      setIsAiGenerating(false);
      setActiveSubTab('conversation');
    }, 400);
  };

  // Toggle Human Handoff
  const handleToggleHandoff = () => {
    const nextMode: LeadHandlingMode = handlingMode === 'AI' ? 'HUMAN' : 'AI';
    setHandlingMode(nextMode);

    const now = new Date();
    const newTimelineEvent: LeadTimelineEvent = {
      id: `t-${Date.now()}`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      at: now.toISOString(),
      title: nextMode === 'HUMAN' ? 'Human agent took over conversation' : 'Conversation handed back to AI',
      description: `Handling mode switched to ${nextMode}`,
      type: 'handoff'
    };
    const updatedTimeline = [newTimelineEvent, ...timelineEvents];
    setTimelineEvents(updatedTimeline);

    onUpdateLead({
      ...lead,
      handlingMode: nextMode,
      timelineEvents: updatedTimeline
    });

    if (onNotify) {
      onNotify(
        nextMode === 'HUMAN' ? 'Human Handoff Active' : 'AI Handled',
        nextMode === 'HUMAN' ? 'Sales agent is now handling prospect replies.' : 'AI auto-responder resumed.'
      );
    }
  };

  // Regenerate summary
  const handleRegenerateSummary = () => {
    setIsRegeneratingSummary(true);
    setTimeout(() => {
      const generated = `${lead.name} from ${lead.company} is actively evaluating our solution. Score: ${lead.score}/100 with ${temperature} intent. ${
        lead.budget ? `Budget: ${lead.budget}. ` : ''
      }${lead.timeline ? `Timeline: ${lead.timeline}. ` : ''}Recommended action: ${aiRecommendation}.`;
      setAiSummary(generated);
      setIsRegeneratingSummary(false);
      onUpdateLead({ ...lead, conversationSummary: generated });
      if (onNotify) onNotify('Summary Refreshed', 'AI intelligence summary updated.');
    }, 450);
  };

  // Add follow-up
  const handleAddFollowUp = () => {
    if (!newFollowUpText.trim()) return;
    const now = new Date();
    const newFollowUp: LeadFollowUp = {
      id: `f-${Date.now()}`,
      title: newFollowUpText.trim(),
      dueTime: newFollowUpTime,
      dueAt: now.toISOString(),
      kind: 'task',
      type: 'upcoming',
      isCompleted: false
    };
    const updated = [newFollowUp, ...followUps];
    setFollowUps(updated);

    const newTimelineEvt: LeadTimelineEvent = {
      id: `t-${Date.now()}`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      at: now.toISOString(),
      title: `Follow-up task scheduled: ${newFollowUp.title}`,
      type: 'follow_up'
    };
    const updatedTimeline = [newTimelineEvt, ...timelineEvents];
    setTimelineEvents(updatedTimeline);

    setNewFollowUpText('');
    setShowAddFollowUp(false);
    onUpdateLead({
      ...lead,
      followUps: updated,
      timelineEvents: updatedTimeline
    });
    if (onNotify) onNotify('Follow-up Added', `Scheduled: ${newFollowUp.title}`);
  };

  // Toggle follow-up completed
  const handleToggleFollowUp = (id: string) => {
    const targetItem = followUps.find((f) => f.id === id);
    const now = new Date();
    const willComplete = targetItem ? !targetItem.isCompleted : false;

    const updated = followUps.map((f) =>
      f.id === id
        ? {
            ...f,
            isCompleted: willComplete,
            completedAt: willComplete ? now.toISOString() : undefined
          }
        : f
    );
    setFollowUps(updated);

    if (targetItem) {
      const newTimelineEvt: LeadTimelineEvent = {
        id: `t-${Date.now()}`,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        at: now.toISOString(),
        title: willComplete
          ? `Follow-up completed: ${targetItem.title}`
          : `Follow-up reopened: ${targetItem.title}`,
        type: 'follow_up'
      };
      const updatedTimeline = [newTimelineEvt, ...timelineEvents];
      setTimelineEvents(updatedTimeline);
      onUpdateLead({
        ...lead,
        followUps: updated,
        timelineEvents: updatedTimeline
      });
    } else {
      onUpdateLead({ ...lead, followUps: updated });
    }
  };

  // Add internal note
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const now = new Date();
    const updated = [newNote.trim(), ...notes];
    setNotes(updated);

    const newTimelineEvt: LeadTimelineEvent = {
      id: `t-${Date.now()}`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      at: now.toISOString(),
      title: 'Internal note added',
      description: newNote.trim().slice(0, 60),
      type: 'ai_action'
    };
    const updatedTimeline = [newTimelineEvt, ...timelineEvents];
    setTimelineEvents(updatedTimeline);

    setNewNote('');
    onUpdateLead({
      ...lead,
      internalNotes: updated,
      timelineEvents: updatedTimeline
    });
    if (onNotify) onNotify('Note Added', 'Internal note saved.');
  };

  // Add tag
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const formatted = newTagInput.trim();
    if (!tags.includes(formatted)) {
      const updated = [...tags, formatted];
      setTags(updated);
      onUpdateLead({ ...lead, tags: updated });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    onUpdateLead({ ...lead, tags: updated });
  };

  const channelBadge = getChannelBadge(lead.preferredChannel || lead.source);
  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'LD';

  const navItems: Array<{
    id: WorkspaceSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    count?: number;
  }> = [
    { id: 'qualification', label: 'AI qualification', icon: Sparkles },
    { id: 'conversation', label: 'Conversation', icon: MessageSquare, count: conversationMessages.length },
    { id: 'info', label: 'Lead info & source', icon: Building2 },
    { id: 'timeline', label: 'Activity timeline', icon: Clock, count: timelineEvents.length },
    { id: 'notes', label: 'Follow-ups & notes', icon: Lock, count: followUps.length },
  ];

  const tempTag = temperature === 'HOT' ? 'red' : temperature === 'WARM' ? 'amber' : '';
  const verifiedCount = qualificationChecks.filter(c => c.status === 'verified').length;

  const renderSectionHeader = (id: WorkspaceSubTab, hint: string) => {
    const item = navItems.find(n => n.id === id)!;
    const Icon = item.icon;
    const open = openSections.has(id);
    return (
      <button
        type="button"
        id={`lead-section-${id}`}
        onClick={() => toggleSection(id)}
        aria-expanded={open}
        aria-controls={`lead-section-body-${id}`}
        className={`nx-acc-head group ${open ? 'open' : ''}`}
      >
        <span className="nx-acc-icon">
          <Icon className="w-[15px] h-[15px]" strokeWidth={1.8} />
        </span>
        <span className="flex-1 min-w-0 text-left">
          <span className="block font-display text-[15px] font-bold tracking-[-0.3px] text-ink">{item.label}</span>
          <span className="block text-[11px] text-ink-3 truncate mt-[3px]">{hint}</span>
        </span>
        {typeof item.count === 'number' && item.count > 0 && (
          <span className="text-[11px] font-bold text-ink-3 tabular-nums">{item.count}</span>
        )}
        <span className="nx-acc-chevron">
          <ChevronDown className="w-4 h-4" strokeWidth={1.8} />
        </span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay backdrop-blur-[2px] cursor-pointer animate-fadeIn"
        onClick={onClose}
        aria-label="Close lead profile"
      />

      {/* Drawer */}
      <div className="nx-drawer relative w-full max-w-[960px] h-full flex flex-col z-10 bg-surface text-ink select-text animate-fadeIn">

        {/* Header */}
        <div className="px-[27px] pt-[24px] pb-5 border-b border-line shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-[46px] h-[46px] rounded-[12px] grid place-items-center bg-avatar text-avatar-ink font-extrabold text-[15px] shrink-0 mt-1">
                {initials}
              </div>
              <div className="min-w-0">
                <span className="eyebrow">Lead details</span>
                <h1 className="text-[26px] leading-[1.2] font-bold tracking-[-1px] text-ink mt-1 mb-1 truncate">{lead.name}</h1>
                <p className="text-[13px] text-ink-3 m-0 truncate">
                  {lead.company}
                  {lead.title ? ` · ${lead.title}` : ''}
                  {lead.location ? ` · ${lead.location}` : ''}
                  {` · ${channelBadge.name}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                id="lead-stage-select"
                aria-label="Update lead stage"
                value={lead.stage || 'New'}
                onChange={(e) => handleStageChange(e.target.value as LeadStage)}
                className="hidden md:block text-[12px] font-bold h-[35px] min-h-[35px]! px-3 pr-8 cursor-pointer"
              >
                {STAGE_OPTIONS.map((stg) => (
                  <option key={stg} value={stg}>Stage: {stg}</option>
                ))}
              </select>
              <select
                id="lead-temp-select"
                aria-label="Override lead temperature"
                value={temperature}
                onChange={(e) => handleTemperatureChange(e.target.value as LeadTemperature)}
                className="hidden md:block text-[12px] font-bold h-[35px] min-h-[35px]! px-3 pr-8 cursor-pointer"
              >
                <option value="HOT">Hot</option>
                <option value="WARM">Warm</option>
                <option value="COLD">Cold</option>
              </select>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close lead profile"
                className="w-[35px] h-[35px] min-h-[35px]! rounded-[9px]! border border-line bg-surface text-ink-2 grid place-items-center hover:bg-surface-hover cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-[7px] flex-wrap mt-4">
            <span className="nx-tag">{lead.stage || 'New'}</span>
            <span className={`nx-tag ${tempTag}`}>
              {temperature === 'HOT' ? 'Hot' : temperature === 'WARM' ? 'Warm' : 'Cold'} · {lead.score}/100
              {lead.temperatureOverride ? ' · override' : ''}
            </span>
            <span className="nx-tag teal">{handlingMode === 'HUMAN' ? 'Human owned' : 'AI owned'}</span>
            <span className="nx-tag">{channelBadge.name}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 mt-[18px] pt-4 border-t border-line">
            {[
              ['Budget', lead.budget || lead.value || null, ''],
              ['Timeline', lead.timeline || null, ''],
              [
                'Decision maker',
                lead.decisionMaker === true ? 'Verified approver' : lead.decisionMaker === false ? 'Requires approval' : null,
                lead.decisionMaker === true ? 'text-ok' : lead.decisionMaker === false ? 'text-danger' : '',
              ],
              ['Owner', lead.assignee?.name || null, ''],
            ].map(([label, value, tone]) => (
              <div key={label as string} className="min-w-0">
                <div className="text-[11px] text-ink-3">{label as string}</div>
                <div className={`text-[13px] font-bold mt-1 truncate ${value ? (tone as string) || 'text-ink' : 'text-ink-3 font-normal'}`}>
                  {(value as string) || 'Not provided'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body: vertically stacked, collapsible sections */}
        <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-w-0 overflow-y-auto bg-surface px-[27px] pt-[18px] pb-10 nx-acc">
          <div className="flex items-center justify-between gap-3 pb-3">
            <span className="text-[9px] font-extrabold uppercase tracking-[1.8px] text-muted-decor">Sections</span>
            <button
              type="button"
              className="nx-link text-[11px]"
              onClick={() =>
                setOpenSections(
                  openSections.size === navItems.length
                    ? new Set<WorkspaceSubTab>()
                    : new Set<WorkspaceSubTab>(navItems.map(n => n.id))
                )
              }
            >
              {openSections.size === navItems.length ? 'Collapse all' : 'Expand all'}
            </button>
          </div>

          {/* ========================================================
              TAB 1: AI QUALIFICATION
             ======================================================== */}
          {renderSectionHeader('qualification', `${lead.score}/100 · ${verifiedCount} of ${qualificationChecks.length} criteria verified`)}
          {openSections.has('qualification') && (
            <div className="nx-section-body">
            <div className="space-y-[15px]">

              {/* Score & summary */}
              <section className="nx-panel nx-pad">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] text-ink-3">Qualification score</div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-display text-[34px] leading-none font-extrabold tracking-[-1.3px] text-ink tabular-nums">{lead.score}</span>
                      <span className="text-[14px] text-ink-3">/ 100</span>
                    </div>
                  </div>
                  <span className={`nx-tag ${tempTag}`}>{intentLevel.replace(/🔥\s*/g, '')}</span>
                </div>
                <div className="nx-progress mt-2.5"><div style={{ width: `${Math.min(100, Math.max(0, lead.score))}%` }} /></div>

                {(lead.aiConfidence !== undefined || lead.purchaseReadiness !== undefined) && (
                  <div className="mt-3">
                    {lead.aiConfidence !== undefined && (
                      <div className="nx-kv"><span>Confidence</span><b>{lead.aiConfidence}</b></div>
                    )}
                    {lead.purchaseReadiness !== undefined && (
                      <div className="nx-kv"><span>Readiness</span><b className="text-ok">{lead.purchaseReadiness}</b></div>
                    )}
                  </div>
                )}

                <div className="nx-split" />
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-[13px] font-bold text-ink m-0">Conversation summary</h3>
                  <button
                    type="button"
                    onClick={handleRegenerateSummary}
                    disabled={isRegeneratingSummary}
                    className="nx-link text-[11px] inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isRegeneratingSummary ? 'animate-spin' : ''}`} />
                    {isRegeneratingSummary ? 'Regenerating…' : 'Regenerate'}
                  </button>
                </div>
                <p className="text-[12px] text-ink-2 mt-2 mb-0">
                  {aiSummary || lead.description || (
                    <span className="text-ink-3">No summary yet. Regenerate to create one from lead signals.</span>
                  )}
                </p>
              </section>

              {/* Qualification criteria */}
              <section className="nx-panel nx-pad">
                <div className="nx-sectionhead">
                  <div>
                    <h2>Qualification criteria</h2>
                    <p>{verifiedCount} of {qualificationChecks.length} verified</p>
                  </div>
                </div>
                <div className="border-t border-line">
                  {qualificationChecks.map((check) => (
                    <div key={check.key} className="nx-row">
                      <div className={`nx-alerticon ${check.status === 'verified' ? 'green' : check.status === 'missing' ? 'red' : ''}`}>
                        {check.status === 'verified' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : check.status === 'missing' ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <HelpCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong>{check.label}</strong>
                        <p className="truncate">{check.detail}</p>
                      </div>
                      <span className={`nx-tag ${check.status === 'verified' ? 'green' : check.status === 'missing' ? 'red' : ''}`}>
                        {check.status === 'verified' ? 'Verified' : check.status === 'missing' ? 'Missing' : 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Score signals */}
              <section className="nx-panel nx-pad">
                <div className="nx-sectionhead">
                  <div>
                    <h2>Why this lead is qualified</h2>
                    <p>Each signal's contribution to the score.</p>
                  </div>
                </div>
                <div className="border-t border-line pt-1">
                  {scoreSignals.map((signal, idx) => (
                    <div key={idx} className="nx-kv">
                      <span>{signal.label}</span>
                      <b className={`tabular-nums ${signal.points >= 0 ? 'text-ok' : 'text-danger'}`}>
                        {signal.points >= 0 ? `+${signal.points}` : signal.points}
                      </b>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recommended next action */}
              <div className="nx-insight">
                <div className="nx-spark"><Sparkles className="w-[18px] h-[18px]" /></div>
                <div className="flex-1 min-w-0">
                  <span className="eyebrow">Next best action</span>
                  <h3>{aiRecommendation}</h3>
                  {lead.timeline && <p>Expected timeline: {lead.timeline}</p>}
                  <div className="flex gap-[9px] mt-[13px] flex-wrap">
                    <button
                      type="button"
                      className="nx-btn sm primary"
                      onClick={() => {
                        setActiveSubTab('notes');
                        setShowAddFollowUp(true);
                        if (onNotify) onNotify('Follow-up task', `Follow-up queued for ${lead.name}.`);
                      }}
                    >
                      Schedule follow-up →
                    </button>
                    <button type="button" className="nx-btn sm" onClick={handleGenerateAiReply}>
                      Draft with AI
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: CONVERSATION (UNIFIED WITH useConversations)
             ======================================================== */}
          {renderSectionHeader('conversation', `${conversationMessages.length} message${conversationMessages.length === 1 ? '' : 's'} · ${channelBadge.name}`)}
          {openSections.has('conversation') && (
            <div className="nx-section-body">
            <div className="space-y-4">
              
              {/* Channel & Mode banner */}
              <div className={`flex items-center justify-between p-3.5 rounded-[13px] border text-xs transition-colors ${
                'bg-surface border-line text-ink-2 '
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-ok" />
                  <span className="font-semibold">{channelBadge.name}</span>
                  {lead.phone && <span className="text-ink-3">({lead.phone})</span>}
                </div>
                <div className="flex items-center space-x-3">
                  <span className={'text-ink-3 font-medium'}>
                    {handlingMode === 'HUMAN' ? 'Human handling' : 'AI handling'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleHandoff}
                    className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                  >
                    {handlingMode === 'HUMAN' ? 'Hand back to AI' : 'Take over'}
                  </button>
                </div>
              </div>

              {/* Chat Thread Container */}
              <div className={`nx-keep border rounded-[13px] flex flex-col max-h-[460px] overflow-hidden transition-colors nx-messages ${
                'bg-surface border-line'
              }`}>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {conversationMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ink-3">
                      <MessageSquare className="w-10 h-10 mb-2 stroke-[1.5] opacity-50" />
                      <p className="text-sm font-medium">No conversation messages yet</p>
                      <p className="text-xs mt-1 max-w-xs">
                        Messages sent here or received in Inbox will be synchronized with this lead.
                      </p>
                    </div>
                  ) : (
                    conversationMessages.map((msg) => {
                      const isCustomer = msg.sender === 'customer';
                      const isAi = msg.sender === 'ai';
                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                        >
                          <div className={`flex items-center space-x-1.5 mb-1 text-[11px] px-1 ${
                            'text-ink-3'
                          }`}>
                            {isCustomer ? (
                              <>
                                <User className="w-3 h-3" />
                                <span className={`font-semibold ${'text-ink'}`}>
                                  {msg.senderName}
                                </span>
                              </>
                            ) : isAi ? (
                              <>
                                <Bot className="w-3 h-3 text-brand" />
                                <span className="font-semibold text-brand">{BRAND_NAME} AI</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 text-info" />
                                <span className="font-semibold text-info">Agent ({msg.senderName})</span>
                              </>
                            )}
                            <span>·</span>
                            <span className="text-[10px] font-mono tabular-nums">{msg.time}</span>
                          </div>

                          <div className={`max-w-[82%] sm:max-w-[75%] leading-[1.6] ${
                            isCustomer
                              ? 'nx-bubble'
                              : 'nx-bubble mine'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Reply Toolbar & Composer */}
                <div className={`p-3.5 border-t space-y-2.5 transition-colors ${
                  'bg-surface-raised border-line'
                }`}>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleGenerateAiReply}
                      disabled={isAiGenerating}
                      className="text-xs font-semibold text-brand hover:underline flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                      <span>{isAiGenerating ? 'Generating response...' : 'Generate AI Reply'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleHandoff}
                      className={`text-xs font-medium cursor-pointer ${
                        'text-ink-3 hover:text-ink'
                      }`}
                    >
                      {handlingMode === 'AI' ? 'Take Over Conversation →' : 'Hand Back to AI 🤖'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="lead-reply-input"
                      type="text"
                      placeholder={`Reply to ${lead.name} via ${channelBadge.name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                      className={`flex-1 text-xs px-3.5 py-2.5 rounded-lg border transition-colors focus:outline-none focus:border-brand/30 ${
                        'bg-surface border-line text-ink placeholder:text-ink-3'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!replyText.trim()}
                      className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-40 transition-colors "
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: LEAD INFO & SOURCE
             ======================================================== */}
          {renderSectionHeader('info', 'Contact, requirement scope and attribution')}
          {openSections.has('info') && (
            <div className="nx-section-body">
            <div className="space-y-6">
              
              {/* Card 1: Contact Information */}
              <div className={`p-[22px] rounded-[15px] border space-y-4  transition-colors ${
                'bg-surface border-line'
              }`}>
                <span className={`font-display text-[15px] font-bold tracking-[-0.3px] text-ink normal-case block ${
                  'text-ink-2'
                }`}>
                  Contact Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Full Name</span>
                    <span className={`font-semibold ${'text-ink'}`}>{lead.name}</span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Job Title</span>
                    <span className={'text-ink font-medium'}>
                      {lead.title || <span className="italic text-ink-3">Not provided</span>}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Email Address</span>
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="text-brand font-medium hover:underline flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>{lead.email}</span>
                      </a>
                    ) : (
                      <span className="italic text-ink-3">Not provided</span>
                    )}
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Phone Number</span>
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="text-brand font-medium hover:underline flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{lead.phone}</span>
                      </a>
                    ) : (
                      <span className="italic text-ink-3">Not provided</span>
                    )}
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Company</span>
                    <span className={`font-semibold ${'text-ink'}`}>{lead.company}</span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Company Size</span>
                    <span className={'text-ink font-medium'}>
                      {lead.companySize || <span className="italic text-ink-3">Not provided</span>}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Location</span>
                    <span className={'text-ink font-medium'}>
                      {lead.location || <span className="italic text-ink-3">Not provided</span>}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Preferred Channel</span>
                    <span className="text-brand font-semibold">{channelBadge.name}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Business & Requirement */}
              <div className={`p-[22px] rounded-[15px] border space-y-4  transition-colors ${
                'bg-surface border-line'
              }`}>
                <span className={`font-display text-[15px] font-bold tracking-[-0.3px] text-ink normal-case block ${
                  'text-ink-2'
                }`}>
                  Business & Requirement Scope
                </span>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-1.5 ${
                      'text-ink-3'
                    }`}>Requirement Statement</span>
                    <p className={`p-3.5 rounded-lg border leading-relaxed font-normal ${
                      'bg-surface-raised border-line text-ink'
                    }`}>
                      {lead.requirement || lead.description || (
                        <span className="italic text-ink-3">Not provided</span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                        'text-ink-3'
                      }`}>Budget Allocated</span>
                      <span className="text-ok font-semibold tabular-nums">
                        {lead.budget || lead.value || <span className="italic text-ink-3 font-normal">Not provided</span>}
                      </span>
                    </div>
                    <div>
                      <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                        'text-ink-3'
                      }`}>Expected Timeline</span>
                      <span className={`font-semibold ${'text-ink'}`}>
                        {lead.timeline || <span className="italic text-ink-3 font-normal">Not provided</span>}
                      </span>
                    </div>
                    <div>
                      <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                        'text-ink-3'
                      }`}>Decision Maker</span>
                      {lead.decisionMaker === true ? (
                        <span className="text-ok font-semibold">✓ Yes (Verified)</span>
                      ) : lead.decisionMaker === false ? (
                        <span className="text-danger font-semibold">Requires approval</span>
                      ) : (
                        <span className="italic text-ink-3">Not determined</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Attribution & Campaign Source */}
              <div className={`p-[22px] rounded-[15px] border space-y-4  transition-colors ${
                'bg-surface border-line'
              }`}>
                <span className={`font-display text-[15px] font-bold tracking-[-0.3px] text-ink normal-case block ${
                  'text-ink-2'
                }`}>
                  Lead Source & Attribution
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Origin Channel</span>
                    <span className={`font-semibold ${'text-ink'}`}>{lead.source}</span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Campaign Name</span>
                    <span className={'text-ink font-medium'}>
                      {lead.campaignAttribution?.campaignName || <span className="italic text-ink-3">Not provided</span>}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>First Touch</span>
                    <span className={'text-ink-2'}>
                      {lead.campaignAttribution?.firstTouch || <span className="italic text-ink-3">Not provided</span>}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                      'text-ink-3'
                    }`}>Last Touch</span>
                    <span className={'text-ink-2'}>
                      {lead.campaignAttribution?.lastTouch || lead.lastActivity || <span className="italic text-ink-3">Not provided</span>}
                    </span>
                  </div>
                  {lead.campaignAttribution?.adName && (
                    <div className="sm:col-span-2">
                      <span className={`block text-[11px] font-normal text-ink-3 mb-0.5 ${
                        'text-ink-3'
                      }`}>Creative / Ad Name</span>
                      <span className={`font-medium ${'text-ink'}`}>
                        {lead.campaignAttribution.adName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: ACTIVITY TIMELINE
             ======================================================== */}
          {renderSectionHeader('timeline', `${timelineEvents.length} event${timelineEvents.length === 1 ? '' : 's'}`)}
          {openSections.has('timeline') && (
            <div className="nx-section-body">
            <div className="space-y-4">
              <div className={`p-[22px] rounded-[15px] border space-y-6  transition-colors ${
                'bg-surface border-line'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-line-subtle">
                  <span className={`font-display text-[15px] font-bold tracking-[-0.3px] text-ink normal-case ${
                    'text-ink-2'
                  }`}>
                    Chronological Activity Timeline
                  </span>
                  <span className={`text-xs font-mono tabular-nums ${
                    'text-ink-3'
                  }`}>
                    {timelineEvents.length} events logged
                  </span>
                </div>

                {timelineEvents.length === 0 ? (
                  <div className="text-center py-10 text-ink-3">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 stroke-[1.5]" />
                    <p className="text-xs font-medium">No activity events recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                    {timelineEvents.map((evt) => (
                      <div key={evt.id} className="flex items-start space-x-3.5 relative pl-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px]  ${
                          evt.type === 'message'
                            ? 'bg-info-soft text-info border border-sky-200'
                            : evt.type === 'ai_action'
                            ? 'bg-brand-soft text-brand border border-brand/30'
                            : evt.type === 'qualification'
                            ? 'bg-ok-soft text-ok border border-transparent'
                            : evt.type === 'handoff'
                            ? 'bg-warn-soft text-warn border border-transparent'
                            : 'bg-purple-50 text-purple-600 border border-purple-200'
                        }`}>
                          {evt.type === 'message' ? <MessageSquare className="w-3 h-3" /> :
                           evt.type === 'ai_action' ? <Bot className="w-3 h-3" /> :
                           evt.type === 'qualification' ? <Check className="w-3 h-3" /> :
                           evt.type === 'handoff' ? <UserCheck className="w-3 h-3" /> :
                           <Clock className="w-3 h-3" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className={`text-xs font-semibold ${'text-ink'}`}>
                              {evt.title}
                            </span>
                            <span className="text-[11px] font-mono tabular-nums text-ink-3 shrink-0">
                              {evt.at ? formatRelative(evt.at) : evt.time}
                            </span>
                          </div>
                          {evt.description && (
                            <p className={`text-xs font-normal mt-0.5 leading-relaxed ${
                              'text-ink-3'
                            }`}>
                              {evt.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: FOLLOW-UPS, NOTES & TAGS
             ======================================================== */}
          {renderSectionHeader('notes', `${followUps.length} follow-up${followUps.length === 1 ? '' : 's'} · ${notes.length} note${notes.length === 1 ? '' : 's'} · ${tags.length} tag${tags.length === 1 ? '' : 's'}`)}
          {openSections.has('notes') && (
            <div className="nx-section-body">
            <div className="space-y-6">
              
              {/* Card 1: Scheduled Follow-ups */}
              <div className={`p-[22px] rounded-[15px] border space-y-4  transition-colors ${
                'bg-surface border-line'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-line-subtle">
                  <span className={`font-display text-[15px] font-bold tracking-[-0.3px] text-ink normal-case ${
                    'text-ink-2'
                  }`}>
                    Scheduled Follow-ups
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddFollowUp(!showAddFollowUp)}
                    className="text-xs font-semibold text-brand hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Follow-up</span>
                  </button>
                </div>

                {showAddFollowUp && (
                  <div className={`p-4 rounded-lg border space-y-3 animate-fadeIn ${
                    'bg-surface-raised border-line'
                  }`}>
                    <input
                      type="text"
                      placeholder="e.g. Schedule discovery call regarding requirements..."
                      value={newFollowUpText}
                      onChange={(e) => setNewFollowUpText(e.target.value)}
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:border-brand/30 ${
                        'bg-surface border-line text-ink'
                      }`}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Due date & time..."
                        value={newFollowUpTime}
                        onChange={(e) => setNewFollowUpTime(e.target.value)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-mono tabular-nums focus:outline-none focus:border-brand/30 ${
                          'bg-surface border-line text-ink-2'
                        }`}
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowAddFollowUp(false)}
                          className={`text-xs font-medium cursor-pointer px-2.5 py-1.5 ${
                            'text-ink-3 hover:text-ink'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddFollowUp}
                          disabled={!newFollowUpText.trim()}
                          className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-lg  cursor-pointer disabled:opacity-40"
                        >
                          Save Follow-up
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {followUps.length === 0 ? (
                  <p className="text-xs text-ink-3 py-3 text-center">No scheduled follow-ups.</p>
                ) : (
                  <div className="space-y-2">
                    {followUps.map((item) => (
                      <div 
                        key={item.id}
                        className={`p-3.5 rounded-lg border text-xs flex items-start justify-between gap-3 transition-colors ${
                          item.isCompleted 
                            ? 'bg-surface-raised border-line opacity-60'
                            : 'bg-surface border-line '
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            type="button"
                            onClick={() => handleToggleFollowUp(item.id)}
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center cursor-pointer transition-colors border ${
                              item.isCompleted 
                                ? 'bg-brand border-brand/30 text-white' 
                                : 'border-line-strong hover:border-brand/30'
                            }`}
                            aria-label={item.isCompleted ? "Mark incomplete" : "Mark complete"}
                          >
                            {item.isCompleted && <Check className="w-3 h-3 stroke-[2.5]" />}
                          </button>
                          <div>
                            <p className={`font-medium leading-snug ${
                              item.isCompleted 
                                ? 'line-through text-ink-3' 
                                : 'text-ink'
                            }`}>
                              {item.title}
                            </p>
                            <span className="text-[11px] font-mono tabular-nums text-ink-3 mt-0.5 block">
                              {item.dueTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 2: Internal Notes */}
              <div className={`p-[22px] rounded-[15px] border space-y-4  transition-colors ${
                'bg-surface border-line'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-line-subtle">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span className={`font-display text-[15px] font-bold tracking-[-0.3px] text-ink normal-case ${
                      'text-ink-2'
                    }`}>
                      Internal Notes
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-warn bg-warn-soft border border-transparent px-2.5 py-0.5 rounded-md">
                    Internal Team Only
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start space-x-2">
                    <textarea
                      placeholder="Add an internal note or context about this prospect..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                      className={`flex-1 text-xs p-3 rounded-lg border resize-none focus:outline-none focus:border-brand/30 ${
                        'bg-surface border-line text-ink placeholder:text-ink-3'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-3.5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors shrink-0 "
                    >
                      Add Note
                    </button>
                  </div>

                  {notes.length === 0 ? (
                    <p className="text-xs text-ink-3 py-3 text-center">No internal notes yet.</p>
                  ) : (
                    <div className="space-y-2 pt-2">
                      {notes.map((note, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border text-xs leading-relaxed ${
                            'bg-surface-raised border-line text-ink-2'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 text-[11px] text-ink-3">
                            <span className="font-semibold text-brand">Team Note</span>
                          </div>
                          <p>{note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Lead Tags */}
              <div className={`p-[22px] rounded-[15px] border space-y-4  transition-colors ${
                'bg-surface border-line'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-line-subtle">
                  <span className={`font-display text-[15px] font-bold tracking-[-0.3px] text-ink normal-case ${
                    'text-ink-2'
                  }`}>
                    Lead Tags
                  </span>
                  {!isAddingTag && (
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(true)}
                      className="text-xs font-semibold text-brand hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tag</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span 
                      key={tag}
                      className="nx-tag teal"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="min-h-0! hover:text-danger cursor-pointer opacity-70 hover:opacity-100"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {isAddingTag && (
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="text"
                      placeholder="Tag label..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                      className={`text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:border-brand/30 ${
                        'bg-surface border-line text-ink'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3.5 py-1.5 text-xs bg-brand hover:bg-brand-hover text-white rounded-lg font-semibold cursor-pointer "
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(false)}
                      className={`text-xs cursor-pointer px-2 ${
                        'text-ink-3 hover:text-ink'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

            </div>
            </div>
          )}

        </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-line px-[27px] py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-surface">
          <div className="flex items-center gap-2 text-[11px] text-ink-3">
            <span>Assigned: <b className="text-ink">{lead.assignee?.name || 'Unassigned'}</b></span>
            <span>·</span>
            <span className={`nx-tag ${handlingMode === 'HUMAN' ? 'amber' : 'green'}`}>
              {handlingMode === 'HUMAN' ? 'Human attention active' : 'AI qualifier active'}
            </span>
          </div>

          <div className="flex items-center gap-[9px] flex-wrap">
            <button
              type="button"
              className="nx-btn sm"
              onClick={() => {
                setActiveSubTab('conversation');
                setTimeout(() => {
                  document.getElementById('lead-reply-input')?.focus();
                }, 50);
              }}
            >
              Reply
            </button>
            <button
              type="button"
              className="nx-btn sm"
              onClick={() => {
                setActiveSubTab('notes');
                setShowAddFollowUp(true);
              }}
            >
              Add follow-up
            </button>
            <button type="button" className="nx-btn sm" onClick={handleToggleHandoff}>
              <UserCheck className="w-3.5 h-3.5" />
              {handlingMode === 'HUMAN' ? 'Hand back to AI' : 'Take over'}
            </button>
            <button
              type="button"
              className="nx-btn sm primary"
              onClick={() => {
                setActiveSubTab('qualification');
                if (onNotify) onNotify('Discovery call queued', 'Discovery call invite ready to send.');
              }}
            >
              Schedule discovery call →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
