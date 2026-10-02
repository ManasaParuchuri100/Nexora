import React, { useState } from 'react';
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  Send, 
  UserCheck, 
  MessageSquare, 
  RotateCw, 
  Plus, 
  Lock, 
  AlertTriangle,
  Bot, 
  User, 
  ExternalLink,
  CheckCircle2,
  Tag as TagIcon
} from 'lucide-react';
import { 
  Lead, 
  LeadTemperature, 
  LeadHandlingMode, 
  LeadMessage, 
  LeadTimelineEvent, 
  LeadFollowUp,
  NavCategory,
  SubCategory
} from '../../../types';
import { useTheme } from '../../../context/ThemeContext';

interface LeadIntelligenceWorkspaceProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onNavigate?: (category: NavCategory, subCategory?: SubCategory) => void;
  onNotify?: (title: string, desc: string) => void;
}

export function getChannelBadge(source: string) {
  const s = (source || '').toLowerCase();
  if (s.includes('whatsapp')) {
    return { name: 'WhatsApp', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' };
  }
  if (s.includes('instagram')) {
    return { name: 'Instagram', color: 'text-pink-400 bg-pink-950/60 border-pink-500/40' };
  }
  if (s.includes('linkedin')) {
    return { name: 'LinkedIn', color: 'text-sky-400 bg-sky-950/60 border-sky-500/40' };
  }
  if (s.includes('website')) {
    return { name: 'Website', color: 'text-teal-400 bg-teal-950/60 border-teal-500/40' };
  }
  return { name: source || 'Direct', color: 'text-[#A9BFA5] bg-[#0D2D2A] border-[rgba(169,191,165,0.3)]' };
}

export default function LeadIntelligenceWorkspace({
  lead,
  onClose,
  onUpdateLead,
  onNavigate,
  onNotify
}: LeadIntelligenceWorkspaceProps) {
  const { theme } = useTheme();

  if (!lead) return null;

  // Intelligence derivation
  const isHot = lead.score >= 85 || lead.temperature === 'HOT' || lead.isPriority;
  const isWarm = (lead.score >= 65 && lead.score < 85) || lead.temperature === 'WARM';
  const temperature: LeadTemperature = lead.temperature || (isHot ? 'HOT' : isWarm ? 'WARM' : 'COLD');

  const intentLevel = lead.intentLevel || (isHot ? 'High purchase intent' : isWarm ? 'Evaluating alternatives' : 'Information gathering');
  const aiRecommendation = lead.aiRecommendation || (isHot ? 'Schedule a sales discovery call within 24 hours' : 'Send product comparison deck & follow-up sequence');

  // Contact & Business details
  const phone = lead.phone || '+91 98201 44820';
  const jobTitle = lead.title || (lead.name === 'Rahul Sharma' ? 'VP of Marketing & Growth' : 'Head of Growth & Operations');
  const location = lead.location || (lead.name.includes('Rahul') ? 'Pune, India' : 'San Francisco, CA');
  const companySize = lead.companySize || '25 - 50 employees';
  const budget = lead.budget || lead.value || '₹5L – ₹8L ($10,000)';
  const timeline = lead.timeline || 'Within 30 days';
  const requirement = lead.requirement || (lead.description || 'Omnichannel lead management and WhatsApp automated workflows with human handoff.');
  const preferredChannel = lead.preferredChannel || (lead.source.includes('WhatsApp') ? 'WhatsApp' : lead.source);
  const decisionMaker = lead.decisionMaker !== undefined ? lead.decisionMaker : true;

  // Active view tab: conversation vs timeline
  const [activeTab, setActiveTab] = useState<'conversation' | 'timeline'>('conversation');

  // Conversation history
  const [messages, setMessages] = useState<LeadMessage[]>(lead.messages || [
    {
      id: 'm-1',
      sender: 'customer',
      senderName: lead.name,
      text: `Hi, I wanted to know more about your Tecavy OS solution for ${lead.company}.`,
      time: '10:42 AM',
      channel: lead.source
    },
    {
      id: 'm-2',
      sender: 'ai',
      senderName: 'Tecavy AI Assistant',
      text: "Absolutely! I can help with that. Could you tell me a little about what you're looking to automate?",
      time: '10:44 AM'
    },
    {
      id: 'm-3',
      sender: 'customer',
      senderName: lead.name,
      text: 'We need lead management, WhatsApp automation, and quick escalation when high-ticket prospects reply.',
      time: '10:46 AM',
      channel: lead.source
    },
    {
      id: 'm-4',
      sender: 'ai',
      senderName: 'Tecavy AI Assistant',
      text: `That sounds like a great fit for our Enterprise tier. What is your expected implementation timeline and budget range for ${lead.company}?`,
      time: '10:48 AM'
    },
    {
      id: 'm-5',
      sender: 'customer',
      senderName: lead.name,
      text: `We have an allocated budget of ${budget} and want to go live within 30 days. Can we review pricing and schedule a quick call?`,
      time: '10:51 AM',
      channel: lead.source
    },
    {
      id: 'm-6',
      sender: 'ai',
      senderName: 'Tecavy AI Assistant',
      text: 'Thank you! I have flagged your profile for priority executive review and our sales team has been assigned to coordinate your discovery walkthrough.',
      time: '10:53 AM'
    }
  ]);

  // Reply text state
  const [replyText, setReplyText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Timeline events
  const [timelineEvents, setTimelineEvents] = useState<LeadTimelineEvent[]>(lead.timelineEvents || [
    { id: 't-1', time: '10:42 AM', title: `Lead captured from ${lead.source}`, description: 'Inbound prospect inquiry via campaign', type: 'message' },
    { id: 't-2', time: '10:44 AM', title: 'AI responded with qualification flow', description: 'Triggered Marketing OS qualification prompt', type: 'ai_action' },
    { id: 't-3', time: '10:47 AM', title: 'Requirement identified', description: 'Lead management & WhatsApp automation', type: 'qualification' },
    { id: 't-4', time: '10:49 AM', title: `Lead classified as ${temperature}`, description: `AI score calculated: ${lead.score}/100`, type: 'qualification' },
    { id: 't-5', time: '10:51 AM', title: 'Budget & timeline identified', description: `${budget} · Rollout <30 days`, type: 'qualification' },
    { id: 't-6', time: '10:53 AM', title: 'AI recommended human handoff', description: 'High purchase intent flagged', type: 'handoff' },
    { id: 't-7', time: '11:05 AM', title: `Assigned to ${lead.assignee?.name || 'Sales Team'}`, description: 'Primary owner for discovery call', type: 'assignment' }
  ]);

  // Follow-ups
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>(lead.followUps || [
    { id: 'f-1', title: 'Discovery call & tailored architecture demo', dueTime: 'Tomorrow — 11:00 AM', isCompleted: false, type: 'upcoming' },
    { id: 'f-2', title: 'Enterprise pricing sheet shared via email', dueTime: 'Yesterday, 4:15 PM', isCompleted: true, type: 'previous' }
  ]);
  const [newFollowUpText, setNewFollowUpText] = useState('');
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);

  // Internal Notes
  const [notes, setNotes] = useState<string[]>(lead.internalNotes || [
    'Client is specifically interested in WhatsApp automation with team escalation. Mention enterprise SLA during discovery.',
    'Pre-approved budget in ₹5L–8L range. Target rollout before end of month.'
  ]);
  const [newNote, setNewNote] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>(lead.tags || [
    temperature,
    'CRM',
    'WhatsApp',
    'Enterprise',
    'High Intent',
    'Decision Maker'
  ]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Handling mode
  const [handlingMode, setHandlingMode] = useState<LeadHandlingMode>(lead.handlingMode || 'AI');

  // AI Summary
  const [aiSummary, setAiSummary] = useState<string>(
    lead.conversationSummary || 
    `${lead.name} from ${lead.company} is evaluating Tecavy for omnichannel lead management and WhatsApp automation. They have a clearly defined requirement, an estimated budget of ${budget}, and want implementation within 30 days. They appear to be the key decision maker and requested pricing and a discovery call.`
  );
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);

  // Status handler
  const handleStatusChange = (newStatus: Lead['status']) => {
    const updated: Lead = {
      ...lead,
      status: newStatus,
      stage: newStatus === 'Won' ? 'Deal closed' :
             newStatus === 'Proposal' ? 'Offer sent' :
             newStatus === 'Qualified' ? 'Negotiation' : 'Contacted'
    };
    onUpdateLead(updated);
    if (onNotify) onNotify('Status Updated', `Lead status updated to ${newStatus}.`);
  };

  // Temperature handler
  const handleTemperatureChange = (newTemp: LeadTemperature) => {
    const newScore = newTemp === 'HOT' ? Math.max(88, lead.score) : newTemp === 'WARM' ? 72 : 54;
    const updated: Lead = {
      ...lead,
      temperature: newTemp,
      score: newScore,
      isPriority: newTemp === 'HOT'
    };
    onUpdateLead(updated);
    if (onNotify) onNotify('Temperature Changed', `Lead flagged as ${newTemp} (${newScore}/100).`);
  };

  // Send message
  const handleSendMessage = () => {
    if (!replyText.trim()) return;
    const newMsg: LeadMessage = {
      id: `m-${Date.now()}`,
      sender: handlingMode === 'AI' ? 'ai' : 'human',
      senderName: handlingMode === 'AI' ? 'Tecavy AI' : (lead.assignee?.name || 'Sales Team'),
      text: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    setReplyText('');

    const newTimelineEvent: LeadTimelineEvent = {
      id: `t-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `${handlingMode === 'AI' ? 'AI' : 'Agent'} sent reply`,
      description: newMsg.text.slice(0, 60) + '...',
      type: 'message'
    };
    const updatedTimeline = [...timelineEvents, newTimelineEvent];
    setTimelineEvents(updatedTimeline);

    onUpdateLead({
      ...lead,
      messages: updatedMsgs,
      timelineEvents: updatedTimeline,
      lastActivity: 'Just now'
    });
  };

  // Generate AI Reply
  const handleGenerateAiReply = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setReplyText(
        `Hi ${lead.name}, thanks for confirming! I have shared our Enterprise overview and pricing sheet. Would tomorrow at 11:30 AM or 3:00 PM IST work for a 20-minute tailored walkthrough with our solution architect?`
      );
      setIsAiGenerating(false);
    }, 500);
  };

  // Toggle Human Handoff
  const handleToggleHandoff = () => {
    const nextMode: LeadHandlingMode = handlingMode === 'AI' ? 'HUMAN' : 'AI';
    setHandlingMode(nextMode);

    const newTimelineEvent: LeadTimelineEvent = {
      id: `t-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: nextMode === 'HUMAN' ? 'Human agent took over conversation' : 'Conversation handed back to AI',
      description: `Handling mode switched to ${nextMode}`,
      type: 'handoff'
    };
    const updatedTimeline = [...timelineEvents, newTimelineEvent];
    setTimelineEvents(updatedTimeline);

    onUpdateLead({
      ...lead,
      handlingMode: nextMode,
      humanAttentionRequired: nextMode === 'HUMAN',
      timelineEvents: updatedTimeline
    });

    if (onNotify) {
      onNotify('Handoff Updated', `Conversation is now ${nextMode === 'HUMAN' ? 'Human Handled' : 'AI Handled'}.`);
    }
  };

  // Regenerate Summary
  const handleRegenerateSummary = () => {
    setIsRegeneratingSummary(true);
    setTimeout(() => {
      setAiSummary(
        `Updated Synthesis: ${lead.name} (${lead.company}) demonstrates exceptional buying signals with a verified budget (${budget}) and urgency for a 30-day rollout. Core focus is automated WhatsApp CRM workflows with team escalation. Discovery call should emphasize SLA response times and enterprise multi-channel routing.`
      );
      setIsRegeneratingSummary(false);
      if (onNotify) onNotify('Summary Updated', 'AI synthesis refreshed.');
    }, 600);
  };

  // Add follow-up
  const handleAddFollowUp = () => {
    if (!newFollowUpText.trim()) return;
    const newF: LeadFollowUp = {
      id: `f-${Date.now()}`,
      title: newFollowUpText.trim(),
      dueTime: 'Tomorrow — 11:00 AM',
      isCompleted: false,
      type: 'upcoming'
    };
    const updated = [newF, ...followUps];
    setFollowUps(updated);
    setNewFollowUpText('');
    setShowAddFollowUp(false);
    onUpdateLead({ ...lead, followUps: updated });
    if (onNotify) onNotify('Follow-up Scheduled', newF.title);
  };

  // Toggle follow-up complete
  const handleToggleFollowUp = (id: string) => {
    const updated = followUps.map(f => f.id === id ? { ...f, isCompleted: !f.isCompleted } : f);
    setFollowUps(updated);
    onUpdateLead({ ...lead, followUps: updated });
  };

  // Add note
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const updated = [newNote.trim(), ...notes];
    setNotes(updated);
    setNewNote('');
    onUpdateLead({ ...lead, internalNotes: updated });
    if (onNotify) onNotify('Internal Note Saved', 'Note is visible only to internal team.');
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
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    onUpdateLead({ ...lead, tags: updated });
  };

  const channelBadge = getChannelBadge(lead.source);

  return (
    <div className="flex-1 w-full bg-[#071C1A] text-[#E8E9D8] select-text">
      {/* 1. TOP BREADCRUMB & CONTEXT NAVIGATION */}
      <div className="border-b border-[rgba(169,191,165,0.15)] bg-[#061816] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-1.5 text-[#A9BFA5] hover:text-[#E8E9D8] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-semibold uppercase tracking-wider">Back to Leads</span>
          </button>
          <span className="text-[#A9BFA5]/40">/</span>
          <span className="text-[#A9BFA5]/70 uppercase tracking-wider">Lead Intelligence</span>
          <span className="text-[#A9BFA5]/40">/</span>
          <span className="text-[#E8E9D8] font-medium">{lead.name}</span>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Status selector */}
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
            className="text-xs font-mono px-2.5 py-1 rounded-[2px] bg-[#071C1A] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:outline-none cursor-pointer"
          >
            <option value="New">Status: New</option>
            <option value="Engaged">Status: Engaged</option>
            <option value="Qualified">Status: Qualified</option>
            <option value="Contacted">Status: Contacted</option>
            <option value="Proposal">Status: Proposal</option>
            <option value="Won">Status: Won</option>
            <option value="Lost">Status: Lost</option>
          </select>

          {/* Temperature selector */}
          <select
            value={temperature}
            onChange={(e) => handleTemperatureChange(e.target.value as LeadTemperature)}
            className="text-xs font-mono px-2.5 py-1 rounded-[2px] bg-[#071C1A] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:outline-none cursor-pointer"
          >
            <option value="HOT">🔥 HOT</option>
            <option value="WARM">🟠 WARM</option>
            <option value="COLD">🔵 COLD</option>
          </select>

          {/* Quick Handoff toggle */}
          <button
            type="button"
            onClick={handleToggleHandoff}
            className={`text-xs font-mono px-3 py-1 rounded-[2px] border transition-colors cursor-pointer flex items-center space-x-1.5 ${
              handlingMode === 'HUMAN' 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' 
                : 'bg-[#071C1A] border-[rgba(169,191,165,0.25)] text-[#A9BFA5] hover:text-[#E8E9D8]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{handlingMode === 'HUMAN' ? 'Human Handled' : 'AI Handled'}</span>
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* 2. LEAD IDENTITY & EXECUTIVE HEADER */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[rgba(169,191,165,0.15)]">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <h1 className="serif text-3xl sm:text-4xl font-light text-white tracking-tight">
                {lead.name}
              </h1>
              <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-[2px] border ${
                temperature === 'HOT' 
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
                  : temperature === 'WARM' 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                  : 'bg-sky-500/15 border-sky-500/40 text-sky-300'
              }`}>
                {temperature === 'HOT' ? '🔥 HOT' : temperature === 'WARM' ? '🟠 WARM' : '🔵 COLD'} ({lead.score}/100)
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${channelBadge.color}`}>
                {channelBadge.name}
              </span>
            </div>

            <p className="text-sm font-mono text-[#A9BFA5] flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[#E8E9D8] font-semibold">{lead.company}</span>
              <span>·</span>
              <span>{jobTitle}</span>
              <span>·</span>
              <span>{location}</span>
              <span>·</span>
              <span className="text-[#E8E9D8]">Budget: {budget}</span>
            </p>
          </div>

          {/* Primary Quick Actions */}
          <div className="flex items-center space-x-2 pt-1 md:pt-0">
            <button
              type="button"
              onClick={() => {
                setShowAddFollowUp(true);
                if (onNotify) onNotify('Call Queued', 'Discovery call invite generated.');
              }}
              className="px-4 py-2 text-xs font-mono font-semibold rounded-[2px] bg-[#E8E9D8] hover:bg-white text-[#071C1A] transition-colors cursor-pointer shadow-sm flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Discovery Call</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('conversation');
                setTimeout(() => {
                  document.getElementById('simplified-reply-input')?.focus();
                }, 50);
              }}
              className="px-3.5 py-2 text-xs font-mono rounded-[2px] border border-[rgba(169,191,165,0.3)] bg-[#061816] text-[#E8E9D8] hover:bg-[#0D2D2A] transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#A9BFA5]" />
              <span>Reply</span>
            </button>
          </div>
        </div>

        {/* 3. AI UNDERSTANDING & RECOMMENDED ACTION HERO (Calm, High-Impact Single Card) */}
        <div className="p-5 rounded-[2px] bg-[#061816] border border-emerald-500/30 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                  AI Recommendation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  96% Confidence
                </span>
              </div>

              <h2 className="serif text-xl sm:text-2xl font-light text-white">
                {aiRecommendation}
              </h2>

              <p className="text-xs sm:text-sm text-[#A9BFA5] font-light leading-relaxed max-w-3xl">
                {aiSummary}
              </p>

              {/* Qualification Checklist inline */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#E8E9D8] font-mono">
                <span className="flex items-center space-x-1 text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>Requirement identified</span>
                </span>
                <span className="flex items-center space-x-1 text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>Budget {budget}</span>
                </span>
                <span className="flex items-center space-x-1 text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>Timeline &lt;30 days</span>
                </span>
                <span className="flex items-center space-x-1 text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>Decision maker verified</span>
                </span>
              </div>
            </div>

            {/* Action buttons inside banner */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddFollowUp(true);
                  if (onNotify) onNotify('Recommendation Accepted', 'Discovery call scheduled with Rahul.');
                }}
                className="px-4 py-2 text-xs font-mono font-semibold rounded-[2px] bg-emerald-400 hover:bg-emerald-300 text-[#071C1A] transition-colors cursor-pointer text-center"
              >
                Accept Recommendation
              </button>

              <button
                type="button"
                onClick={handleRegenerateSummary}
                disabled={isRegeneratingSummary}
                className="px-3 py-1.5 text-xs font-mono rounded-[2px] border border-[rgba(169,191,165,0.25)] bg-[#071C1A] text-[#A9BFA5] hover:text-[#E8E9D8] transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <RotateCw className={`w-3 h-3 ${isRegeneratingSummary ? 'animate-spin' : ''}`} />
                <span>Regenerate Summary</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. MAIN 2-COLUMN VIEW (Left: Conversation & Timeline | Right: CRM Intel & Notes) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================
              LEFT COLUMN (~60%): CONVERSATION & TIMELINE TABS
             ======================================================== */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Tab Header */}
            <div className="flex items-center justify-between border-b border-[rgba(169,191,165,0.15)] pb-1">
              <div className="flex items-center space-x-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('conversation')}
                  className={`text-xs font-mono uppercase tracking-widest pb-2 transition-colors cursor-pointer relative ${
                    activeTab === 'conversation'
                      ? 'text-white font-semibold'
                      : 'text-[#A9BFA5]/70 hover:text-[#E8E9D8]'
                  }`}
                >
                  <span>Live Conversation ({messages.length})</span>
                  {activeTab === 'conversation' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A9BFA5]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`text-xs font-mono uppercase tracking-widest pb-2 transition-colors cursor-pointer relative ${
                    activeTab === 'timeline'
                      ? 'text-white font-semibold'
                      : 'text-[#A9BFA5]/70 hover:text-[#E8E9D8]'
                  }`}
                >
                  <span>Activity Timeline ({timelineEvents.length})</span>
                  {activeTab === 'timeline' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A9BFA5]" />
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-mono text-[#A9BFA5]/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Channel: {channelBadge.name}</span>
              </div>
            </div>

            {/* TAB CONTENT: CONVERSATION */}
            {activeTab === 'conversation' && (
              <div className="border border-[rgba(169,191,165,0.2)] rounded-[2px] bg-[#061816] flex flex-col h-[560px]">
                {/* Scrollable messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg) => {
                    const isCustomer = msg.sender === 'customer';
                    const isAi = msg.sender === 'ai';
                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center space-x-2 mb-1 text-[10px] font-mono text-[#A9BFA5]/70 px-1">
                          {isCustomer ? (
                            <>
                              <User className="w-3 h-3 text-[#A9BFA5]" />
                              <span className="font-semibold text-[#E8E9D8]">{msg.senderName}</span>
                            </>
                          ) : isAi ? (
                            <>
                              <Bot className="w-3 h-3 text-emerald-400" />
                              <span className="font-semibold text-emerald-300">Tecavy AI</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 text-sky-400" />
                              <span className="font-semibold text-sky-300">Agent ({msg.senderName})</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{msg.time}</span>
                        </div>

                        <div className={`p-3.5 rounded-[2px] text-xs max-w-[85%] leading-relaxed ${
                          isCustomer
                            ? 'bg-[#0D2D2A]/70 border border-[rgba(169,191,165,0.25)] text-[#E8E9D8]'
                            : isAi
                            ? 'bg-[#12302A]/90 border border-emerald-500/30 text-emerald-50'
                            : 'bg-[#153444]/90 border border-sky-500/30 text-sky-50'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply toolbar */}
                <div className="p-3.5 border-t border-[rgba(169,191,165,0.15)] bg-[#071C1A] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleGenerateAiReply}
                      disabled={isAiGenerating}
                      className="text-xs font-mono text-emerald-300 hover:text-emerald-200 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                      <span>{isAiGenerating ? 'Drafting...' : 'Generate AI Reply'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleHandoff}
                      className="text-[11px] font-mono text-[#A9BFA5] hover:text-[#E8E9D8] cursor-pointer"
                    >
                      {handlingMode === 'AI' ? 'Take Over Conversation →' : 'Hand Back to AI 🤖'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="simplified-reply-input"
                      type="text"
                      placeholder={`Reply to ${lead.name} via ${channelBadge.name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                      className="flex-1 bg-[#061816] border border-[rgba(169,191,165,0.25)] text-xs text-[#E8E9D8] px-3.5 py-2.5 rounded-[2px] focus:outline-none focus:border-[#A9BFA5]"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!replyText.trim()}
                      className="px-4 py-2.5 bg-[#E8E9D8] hover:bg-white text-[#071C1A] text-xs font-mono font-semibold rounded-[2px] transition-colors cursor-pointer disabled:opacity-40 flex items-center space-x-1"
                    >
                      <span>Send</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="border border-[rgba(169,191,165,0.2)] rounded-[2px] bg-[#061816] p-6 space-y-4">
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[rgba(169,191,165,0.2)]">
                  {timelineEvents.map((evt) => (
                    <div key={evt.id} className="flex items-start space-x-3 relative pl-1">
                      <div className="w-5 h-5 rounded-full bg-[#0D2D2A] border border-[rgba(169,191,165,0.4)] flex items-center justify-center shrink-0 z-10 text-[10px]">
                        {evt.type === 'message' ? <MessageSquare className="w-2.5 h-2.5 text-[#A9BFA5]" /> :
                         evt.type === 'ai_action' ? <Bot className="w-2.5 h-2.5 text-emerald-400" /> :
                         evt.type === 'qualification' ? <Check className="w-2.5 h-2.5 text-emerald-300" /> :
                         evt.type === 'handoff' ? <UserCheck className="w-2.5 h-2.5 text-amber-400" /> :
                         <Clock className="w-2.5 h-2.5 text-[#A9BFA5]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-medium text-[#E8E9D8]">
                            {evt.title}
                          </span>
                          <span className="text-[10px] font-mono text-[#A9BFA5]/60">
                            {evt.time}
                          </span>
                        </div>
                        {evt.description && (
                          <p className="text-[11px] text-[#A9BFA5]/75 font-light mt-0.5">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ========================================================
              RIGHT COLUMN (~40%): LEAD PROFILE, CRM DATA & NOTES
             ======================================================== */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Qualification & Parameters */}
            <div className="border border-[rgba(169,191,165,0.2)] rounded-[2px] p-5 bg-[#061816] space-y-3.5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#A9BFA5] font-semibold block">
                Qualification Overview
              </span>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(169,191,165,0.1)]">
                  <span className="text-[#A9BFA5]/70">Requirement</span>
                  <span className="text-emerald-300 font-medium">✓ Identified</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(169,191,165,0.1)]">
                  <span className="text-[#A9BFA5]/70">Budget</span>
                  <span className="text-[#E8E9D8] font-semibold">✓ {budget}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(169,191,165,0.1)]">
                  <span className="text-[#A9BFA5]/70">Timeline</span>
                  <span className="text-[#E8E9D8]">✓ {timeline}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(169,191,165,0.1)]">
                  <span className="text-[#A9BFA5]/70">Decision Maker</span>
                  <span className="text-emerald-300">✓ {decisionMaker ? 'Yes' : 'Influencer'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A9BFA5]/70">Intent Tier</span>
                  <span className="text-rose-400 font-semibold">🔥 {intentLevel}</span>
                </div>
              </div>

              {/* Requirement detail description */}
              <div className="pt-2 border-t border-[rgba(169,191,165,0.1)]">
                <span className="text-[11px] font-mono text-[#A9BFA5]/70 block mb-1">Scope of Interest:</span>
                <p className="text-xs text-[#E8E9D8] font-light leading-relaxed">
                  {requirement}
                </p>
              </div>
            </div>

            {/* Contact & Attribution Details */}
            <div className="border border-[rgba(169,191,165,0.2)] rounded-[2px] p-5 bg-[#061816] space-y-3.5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#A9BFA5] font-semibold block">
                Contact & Attribution
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#A9BFA5]/70 font-mono">Email</span>
                  <a href={`mailto:${lead.email}`} className="text-emerald-300 hover:underline font-mono">
                    {lead.email}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A9BFA5]/70 font-mono">Phone</span>
                  <a href={`tel:${phone}`} className="text-[#E8E9D8] font-mono hover:text-white">
                    {phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A9BFA5]/70 font-mono">Assigned Owner</span>
                  <span className="text-[#E8E9D8] font-medium">{lead.assignee?.name || 'Rahul — Sales'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A9BFA5]/70 font-mono">Source Channel</span>
                  <span className="text-[#E8E9D8] font-medium">{lead.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A9BFA5]/70 font-mono">Campaign</span>
                  <span className="text-[#E8E9D8]">October Lead Generation</span>
                </div>
              </div>

              {/* Tags */}
              <div className="pt-2 border-t border-[rgba(169,191,165,0.1)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-[#A9BFA5]/70">Tags</span>
                  {!isAddingTag && (
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(true)}
                      className="text-[11px] font-mono text-emerald-300 hover:underline cursor-pointer"
                    >
                      + Add
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span 
                      key={tag}
                      className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-[1px] bg-[#0D2D2A] text-[#E8E9D8] border border-[rgba(169,191,165,0.25)]"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[#A9BFA5]/60 hover:text-rose-400 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {isAddingTag && (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                      className="flex-1 bg-[#071C1A] border border-[rgba(169,191,165,0.3)] text-xs font-mono px-2 py-1 rounded-[1px] text-[#E8E9D8] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-2 py-1 text-xs font-mono bg-[#E8E9D8] text-[#071C1A] rounded-[1px] font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(false)}
                      className="text-xs text-[#A9BFA5] hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Follow-ups & Internal Notes */}
            <div className="border border-[rgba(169,191,165,0.2)] rounded-[2px] p-5 bg-[#061816] space-y-4">
              {/* Follow-up section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#A9BFA5] font-semibold">
                    Follow-ups
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddFollowUp(!showAddFollowUp)}
                    className="text-xs font-mono text-[#A9BFA5] hover:text-[#E8E9D8] flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Schedule</span>
                  </button>
                </div>

                {showAddFollowUp && (
                  <div className="p-2.5 rounded-[2px] bg-[#071C1A] border border-[rgba(169,191,165,0.3)] space-y-2 mb-2">
                    <input
                      type="text"
                      placeholder="Follow-up reminder..."
                      value={newFollowUpText}
                      onChange={(e) => setNewFollowUpText(e.target.value)}
                      className="w-full bg-[#061816] border border-[rgba(169,191,165,0.2)] text-xs text-[#E8E9D8] px-2.5 py-1.5 rounded-[2px] focus:outline-none"
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAddFollowUp(false)}
                        className="text-[11px] font-mono text-[#A9BFA5] hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddFollowUp}
                        className="px-2.5 py-1 bg-[#E8E9D8] text-[#071C1A] text-xs font-mono font-semibold rounded-[2px] cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  {followUps.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-2 rounded-[2px] border text-xs flex items-start justify-between gap-2 ${
                        item.isCompleted ? 'bg-[#061816] border-[rgba(169,191,165,0.1)] opacity-60' : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)]'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFollowUp(item.id)}
                          className={`w-3.5 h-3.5 rounded-[1px] border mt-0.5 flex items-center justify-center cursor-pointer ${
                            item.isCompleted ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-[#A9BFA5]/50'
                          }`}
                        >
                          {item.isCompleted && <Check className="w-2.5 h-2.5" />}
                        </button>
                        <div>
                          <p className={`leading-snug ${item.isCompleted ? 'line-through text-[#A9BFA5]' : 'text-[#E8E9D8]'}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] font-mono text-[#A9BFA5]/60">
                            {item.dueTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes section */}
              <div className="pt-3 border-t border-[rgba(169,191,165,0.15)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#E8E9D8] font-semibold">
                      Internal Notes
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#A9BFA5]/60">Team Only</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="Add private note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
                      className="flex-1 bg-[#071C1A] border border-[rgba(169,191,165,0.25)] text-xs text-[#E8E9D8] px-2.5 py-1.5 rounded-[2px] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-2.5 py-1.5 bg-[#E8E9D8] text-[#071C1A] text-xs font-mono font-semibold rounded-[2px] cursor-pointer disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>

                  {notes.map((n, i) => (
                    <div 
                      key={i} 
                      className="p-2.5 rounded-[2px] bg-[#071C1A]/80 border border-amber-500/20 text-xs text-amber-100/90 font-light leading-relaxed"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
