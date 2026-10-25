import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  AlertTriangle, 
  Bot, 
  UserCheck, 
  ChevronDown, 
  ChevronLeft,
  Check, 
  CheckCheck,
  Calendar, 
  Clock, 
  MessageSquare,
  Sparkles,
  Phone,
  Building2,
  MapPin,
  CheckCircle2,
  PanelRight,
  X,
  FileText,
  Filter,
  Share2,
  Globe,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Lead, SubCategory } from '../../types';
import { ConversationItem, useConversations } from '../../data/conversations';
import { BRAND_NAME } from '../../config/brand';
import { 
  Button, 
  Badge, 
  SegmentedControl, 
  Avatar, 
  ProgressBar, 
  EmptyState 
} from '../ui';

interface EngageViewProps {
  activeSubCategory: SubCategory;
  leads: Lead[];
  onNavigateSub: (sub: SubCategory) => void;
  onSelectLead?: (lead: Lead) => void;
  onNotify?: (title: string, desc: string) => void;
  isFirstRun?: boolean;
  onNavigateSettings?: () => void;
}

export type InboxFilterTab = 'needs_you' | 'all' | 'ai_handling' | 'closed';
export type ChannelFilter = 'All' | 'WhatsApp' | 'Instagram' | 'LinkedIn' | 'Website';
export type SortOption = 'newest' | 'oldest_waiting' | 'score';
export type InboxSpecialFilter = 'all' | 'overdue-followups' | 'asked-pricing' | 'ready-to-book' | 'waiting-human';

function getChannelIcon(channel: ConversationItem['channel']) {
  switch (channel) {
    case 'WhatsApp':
      return Phone;
    case 'Instagram':
      return Share2;
    case 'LinkedIn':
      return Building2;
    case 'Website':
    default:
      return Globe;
  }
}

function getMessageDateGroup(timeStr: string): string {
  const lower = timeStr.toLowerCase();
  if (lower.includes('yesterday')) return 'Yesterday';
  if (lower.includes('friday')) return 'Friday';
  if (lower.includes('oct 14') || lower.includes('oct 15')) return 'Oct 14, 2026';
  return 'Today';
}

const STAGES = ['New', 'Contacted', 'Engaged', 'Qualified', 'Proposal', 'Won', 'Lost'];
const TEAM_MEMBERS = ['Rahul — Sales', 'Sarah — Solutions', 'Priya — AE', 'You'];

export default function EngageView({
  activeSubCategory,
  leads,
  onNavigateSub,
  onSelectLead,
  onNotify,
  isFirstRun = false,
  onNavigateSettings
}: EngageViewProps) {
  const [conversations, setConversations] = useConversations();

  // Special intent filter state synced with activeSubCategory from Overview
  const [specialFilter, setSpecialFilter] = useState<InboxSpecialFilter>(() => {
    if (activeSubCategory === 'overdue-followups' || activeSubCategory === 'follow-ups') return 'overdue-followups';
    if (activeSubCategory === 'asked-pricing' || activeSubCategory === 'pricing') return 'asked-pricing';
    if (activeSubCategory === 'ready-to-book' || activeSubCategory === 'book-call') return 'ready-to-book';
    if (activeSubCategory === 'waiting-human' || activeSubCategory === 'human-handoff') return 'waiting-human';
    return 'all';
  });

  // Filter tabs
  const [activeTab, setActiveTab] = useState<InboxFilterTab>('needs_you');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  // Selected conversation
  const [selectedConvoId, setSelectedConvoId] = useState<string>('convo-rahul');
  const [showLeadPanel, setShowLeadPanel] = useState(true);

  // Composer states
  const [replyInput, setReplyInput] = useState('');
  const [composerMode, setComposerMode] = useState<'reply' | 'note'>('reply');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string }>>([]);

  // Menus
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

  // Mobile initial view MUST be 'list', not 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'details'>('list');

  // Close filter popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(event.target as Node)) {
        setShowFilterPopover(false);
      }
    }
    if (showFilterPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterPopover]);

  // Sync specialFilter whenever activeSubCategory changes
  useEffect(() => {
    if (activeSubCategory === 'overdue-followups' || activeSubCategory === 'follow-ups') {
      setSpecialFilter('overdue-followups');
    } else if (activeSubCategory === 'asked-pricing' || activeSubCategory === 'pricing') {
      setSpecialFilter('asked-pricing');
    } else if (activeSubCategory === 'ready-to-book' || activeSubCategory === 'book-call') {
      setSpecialFilter('ready-to-book');
    } else if (activeSubCategory === 'waiting-human' || activeSubCategory === 'human-handoff') {
      setSpecialFilter('waiting-human');
    }
  }, [activeSubCategory]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const active = conversations.filter(c => c.status !== 'closed');
    return {
      needs_you: active.filter(c => c.status === 'needs_you').length,
      all: active.length,
      ai_handling: conversations.filter(c => c.status === 'ai_handling').length,
      closed: conversations.filter(c => c.status === 'closed').length
    };
  }, [conversations]);

  // Filtered & Sorted conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      // 1. Tab filter
      if (activeTab === 'needs_you') {
        if (c.status !== 'needs_you') return false;
      } else if (activeTab === 'ai_handling') {
        if (c.status !== 'ai_handling') return false;
      } else if (activeTab === 'closed') {
        if (c.status !== 'closed') return false;
      } else if (activeTab === 'all') {
        if (c.status === 'closed') return false;
      }

      // 2. Special filter from Overview
      if (specialFilter === 'overdue-followups' && !c.isOverdueFollowUp) return false;
      if (specialFilter === 'asked-pricing' && !c.askedForPricing) return false;
      if (specialFilter === 'ready-to-book' && !c.readyToBookCall) return false;
      if (specialFilter === 'waiting-human' && !c.waitingForHuman) return false;

      // 3. Channel filter
      if (channelFilter !== 'All' && c.channel !== channelFilter) return false;

      // 4. Assignee filter
      if (assigneeFilter !== 'All' && !c.assignedTo.toLowerCase().includes(assigneeFilter.toLowerCase())) return false;

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchCompany = c.company.toLowerCase().includes(q);
        const matchSnippet = c.snippet.toLowerCase().includes(q);
        const matchMsg = c.messages.some(m => m.text.toLowerCase().includes(q));
        if (!matchName && !matchCompany && !matchSnippet && !matchMsg) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest_waiting') {
        const tA = a.timestampRaw || 0;
        const tB = b.timestampRaw || 0;
        return tA - tB;
      }
      if (sortBy === 'score') {
        return b.score - a.score;
      }
      const tA = a.timestampRaw || 0;
      const tB = b.timestampRaw || 0;
      return tB - tA;
    });
  }, [conversations, activeTab, specialFilter, channelFilter, assigneeFilter, searchQuery, sortBy]);

  // Active selected conversation
  const currentConvo = useMemo(() => {
    return conversations.find(c => c.id === selectedConvoId) || filteredConversations[0] || conversations[0];
  }, [conversations, selectedConvoId, filteredConversations]);

  // When selected conversation changes
  const handleSelectConversation = (id: string) => {
    setSelectedConvoId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
    setMobileView('chat');
  };

  // Reply handler: logic fix sets status to 'waiting_on_customer', clears waitingForHuman and askedForPricing
  const handleSendMessage = () => {
    const trimmed = replyInput.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    const textToSend = trimmed || (attachedFiles.length > 0 ? `Sent attachment: ${attachedFiles.map(f => f.name).join(', ')}` : '');

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConvo?.id) {
          return {
            ...c,
            status: 'waiting_on_customer',
            waitingForHuman: false,
            askedForPricing: false,
            snippet: textToSend,
            unread: false,
            messages: [
              ...c.messages,
              {
                id: `m-${Date.now()}`,
                sender: 'agent',
                senderName: 'You',
                text: textToSend,
                time: 'Just now'
              }
            ]
          };
        }
        return c;
      })
    );

    setReplyInput('');
    setAttachedFiles([]);
    if (onNotify) {
      onNotify('Reply Dispatched', `Message sent to ${currentConvo?.name || 'customer'}.`);
    }
  };

  // Attachment helpers
  const handleAttachFile = () => {
    if (attachedFiles.some(f => f.name === 'Commercial_Pricing_Sheet.pdf')) {
      setAttachedFiles(prev => [...prev, { name: 'Technical_Specifications.pdf', size: '850 KB' }]);
    } else {
      setAttachedFiles(prev => [...prev, { name: 'Commercial_Pricing_Sheet.pdf', size: '1.2 MB' }]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Suggestion chip: Pricing Deck inserts clean sentence and adds file chip preview
  const handleInsertPricingDeck = () => {
    setReplyInput("I've attached our commercial pricing sheet and enterprise tier breakdown for your review.");
    setAttachedFiles([{ name: 'Commercial_Pricing_Sheet.pdf', size: '1.2 MB' }]);
  };

  const handleInsertBookCall = () => {
    setReplyInput("Let's schedule a 20-minute discovery call to walk through your requirements. What time works best for you this week?");
  };

  const handleInsertProposal = () => {
    setReplyInput("I've prepared a tailored studio proposal based on your specifications.");
    setAttachedFiles([{ name: 'Studio_Proposal_Overview.pdf', size: '2.4 MB' }]);
  };

  // Actions
  const handleTakeover = () => {
    setConversations(prev => prev.map(c => c.id === currentConvo?.id ? { ...c, aiAlert: undefined } : c));
    if (onNotify) onNotify('Human Takeover', 'AI paused. You now have full manual control.');
  };

  const handleResumeAI = () => {
    setConversations(prev => prev.map(c => c.id === currentConvo?.id ? {
      ...c,
      status: 'ai_handling',
      aiAlert: undefined,
      waitingForHuman: false,
      askedForPricing: false
    } : c));
    if (onNotify) onNotify('AI Resumed', `${BRAND_NAME} autonomous AI resumed handling.`);
  };

  const handleMarkResolved = () => {
    setConversations(prev => prev.map(c => c.id === currentConvo?.id ? {
      ...c,
      status: 'closed',
      waitingForHuman: false,
      askedForPricing: false
    } : c));
    if (onNotify) onNotify('Resolved', 'Conversation marked as resolved and moved to Closed.');
  };

  const handleAssign = (member: string) => {
    setConversations(prev => prev.map(c => c.id === currentConvo?.id ? { ...c, assignedTo: member } : c));
    setShowAssignMenu(false);
    if (onNotify) onNotify('Assigned', `Conversation assigned to ${member}.`);
  };

  const handleSnooze = (period: string) => {
    setShowSnoozeMenu(false);
    if (onNotify) onNotify('Snoozed', `Conversation snoozed until ${period}.`);
  };

  const handleStageChange = (newStage: string) => {
    setConversations(prev => prev.map(c => c.id === currentConvo?.id ? { ...c, stage: newStage } : c));
    if (onNotify) onNotify('Stage Updated', `Pipeline stage moved to ${newStage}.`);
  };

  const handleOpenLead = () => {
    if (!currentConvo || !onSelectLead) return;

    // 1. Match by leadReferenceId === lead.id
    let match = currentConvo.leadReferenceId
      ? leads.find(l => l.id === currentConvo.leadReferenceId)
      : undefined;

    // 2. Exact email match (if conversation has an email)
    if (!match && (currentConvo as any).email) {
      const convoEmail = String((currentConvo as any).email).trim().toLowerCase();
      match = leads.find(l => l.email && l.email.trim().toLowerCase() === convoEmail);
    }

    // 3. BOTH name and company matching (case-insensitive). Never match on company alone.
    if (!match && currentConvo.name && currentConvo.company) {
      const cName = currentConvo.name.trim().toLowerCase();
      const cComp = currentConvo.company.trim().toLowerCase();
      match = leads.find(l =>
        l.name.trim().toLowerCase() === cName &&
        l.company.trim().toLowerCase() === cComp
      );
    }

    if (match) {
      onSelectLead(match);
      return;
    }

    // If nothing matches, build a lead from only the fields the conversation really has
    // (name, company, location, channel as source, score, temperature, stage, qualification budget/timeline/decisionMaker, assignedTo).
    // Leave email, phone and title undefined. Do not invent them.
    const builtLead: Lead = {
      id: currentConvo.leadReferenceId || `lead-${currentConvo.id}`,
      name: currentConvo.name,
      company: currentConvo.company,
      location: currentConvo.location || undefined,
      source: (currentConvo.channel as any) || 'Direct',
      score: currentConvo.score ?? 50,
      temperature: currentConvo.temperature,
      stage: (currentConvo.stage as any) || 'New',
      status: (currentConvo.stage as any) || 'New',
      value: currentConvo.qualification?.budget || '₹0',
      lastActivity: currentConvo.time || 'Just now',
      budget: currentConvo.qualification?.budget,
      timeline: currentConvo.qualification?.timeline,
      decisionMaker: currentConvo.qualification?.decisionMaker,
      assignee: currentConvo.assignedTo ? {
        name: currentConvo.assignedTo,
        role: 'Sales Representative'
      } : undefined,
      email: undefined,
      phone: undefined,
      title: undefined
    };

    onSelectLead(builtLead);
  };

  // Qualification verified count
  const verifiedCount = useMemo(() => {
    if (!currentConvo) return 0;
    let count = 0;
    if (currentConvo.qualification.requirement) count++;
    if (currentConvo.qualification.budget && currentConvo.qualification.budget !== 'Unspecified') count++;
    if (currentConvo.qualification.timeline && currentConvo.qualification.timeline !== 'Unknown') count++;
    if (currentConvo.qualification.decisionMaker) count++;
    return count;
  }, [currentConvo]);

  // First-run empty state
  if (isFirstRun) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-canvas">
        <EmptyState
          icon={<MessageSquare className="w-8 h-8 text-brand" />}
          title="No active conversations"
          description="Connect a channel to begin receiving WhatsApp, Instagram, or Website leads."
          action={
            <Button variant="primary" size="sm" onClick={onNavigateSettings}>
              Connect channel
            </Button>
          }
        />
      </div>
    );
  }

  const specialFilterLabel = 
    specialFilter === 'waiting-human' ? 'Waiting for human' :
    specialFilter === 'overdue-followups' ? 'Overdue follow-ups' :
    specialFilter === 'asked-pricing' ? 'Asked for pricing' :
    specialFilter === 'ready-to-book' ? 'Ready to book a call' : '';

  return (
    <div className="flex-1 min-h-0 flex flex-row overflow-hidden bg-canvas text-ink select-text">
      
      {/* =========================================================================
          PANEL 1: CONVERSATION LIST (LEFT)
          ========================================================================= */}
      <div className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-line bg-surface flex flex-col h-full ${
        mobileView === 'list' ? 'flex' : 'hidden md:flex'
      }`}>
        
        {/* Top Header: Tabs */}
        <div className="p-3 pb-2 border-b border-line-subtle space-y-2">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-raised border border-line-subtle text-xs font-medium">
            {[
              { id: 'needs_you', label: 'Needs you', count: tabCounts.needs_you },
              { id: 'all', label: 'All', count: tabCounts.all },
              { id: 'ai_handling', label: 'AI', count: tabCounts.ai_handling },
              { id: 'closed', label: 'Resolved', count: tabCounts.closed }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as InboxFilterTab);
                  setSpecialFilter('all');
                }}
                className={`flex-1 min-h-7! rounded-md! py-1 px-1.5 flex items-center justify-center transition-colors cursor-pointer text-xs focus-visible:outline-none ${
                  activeTab === tab.id && specialFilter === 'all'
                    ? 'bg-surface text-ink font-semibold shadow-xs'
                    : 'bg-transparent text-ink-3 hover:text-ink'
                }`}
              >
                <span className="truncate">{tab.label}</span>
                <span className="ml-1 text-xs tabular-nums font-semibold px-1 py-0.2 rounded-full bg-surface-raised text-ink-3">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar + filter popover button */}
          <div className="flex items-center gap-1.5 relative">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                aria-label="Search conversations"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-line-subtle text-ink placeholder:text-ink-3 focus-visible:outline-none focus:border-brand"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-ink-3 hover:text-ink cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              aria-label="Filter conversations"
              onClick={() => setShowFilterPopover(prev => !prev)}
              className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                channelFilter !== 'All' || assigneeFilter !== 'All' || sortBy !== 'newest'
                  ? 'bg-brand-soft border-brand text-brand font-semibold'
                  : 'bg-surface border-line-subtle text-ink-2 hover:bg-surface-hover'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
            </button>

            {/* Filter Popover */}
            {showFilterPopover && (
              <div 
                ref={filterPopoverRef}
                className="absolute right-0 top-full mt-1.5 w-64 p-3 bg-surface border border-line rounded-xl shadow-pop z-50 text-xs space-y-3 animate-fadeIn"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-line-subtle">
                  <span className="font-semibold text-ink">Filters & Sorting</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setChannelFilter('All');
                      setAssigneeFilter('All');
                      setSortBy('newest');
                    }}
                    className="text-xs text-brand hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                {/* Channel Filter */}
                <div className="space-y-1">
                  <label className="text-ink-3 font-medium block">Channel</label>
                  <select
                    value={channelFilter}
                    onChange={e => setChannelFilter(e.target.value as ChannelFilter)}
                    className="w-full bg-surface border border-line-subtle rounded-md px-2 py-1 text-xs text-ink cursor-pointer"
                  >
                    {['All', 'WhatsApp', 'Instagram', 'LinkedIn', 'Website'].map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                {/* Assignee Filter */}
                <div className="space-y-1">
                  <label className="text-ink-3 font-medium block">Assignee</label>
                  <select
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value)}
                    className="w-full bg-surface border border-line-subtle rounded-md px-2 py-1 text-xs text-ink cursor-pointer"
                  >
                    <option value="All">All assignees</option>
                    {TEAM_MEMBERS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Option */}
                <div className="space-y-1">
                  <label className="text-ink-3 font-medium block">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortOption)}
                    className="w-full bg-surface border border-line-subtle rounded-md px-2 py-1 text-xs text-ink cursor-pointer"
                  >
                    <option value="newest">Newest message</option>
                    <option value="oldest_waiting">Oldest waiting</option>
                    <option value="score">Lead score (High to low)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Removable Filter Chip for Overview-driven filters */}
        {specialFilter !== 'all' && (
          <div className="px-3 pt-2">
            <div className="flex items-center justify-between px-3 py-1.5 bg-brand-soft text-brand text-xs rounded-lg border border-line-subtle">
              <span className="truncate">Filtered: {specialFilterLabel}</span>
              <button
                type="button"
                aria-label="Clear filter"
                onClick={() => setSpecialFilter('all')}
                className="hover:opacity-70 cursor-pointer shrink-0 ml-1.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Conversation List Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-line-subtle p-2 space-y-1">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((convo) => {
              const isSelected = convo.id === currentConvo?.id;
              const ChannelIcon = getChannelIcon(convo.channel);
              const lastMsg = convo.messages[convo.messages.length - 1];
              const tagLabel = convo.status === 'ai_handling' || lastMsg?.sender === 'ai' 
                ? 'AI' 
                : convo.status === 'waiting_on_customer' || lastMsg?.sender === 'agent'
                ? 'You'
                : null;

              const statusTitle = convo.status === 'needs_you' 
                ? 'Needs human attention' 
                : convo.status === 'ai_handling' 
                ? 'Handled by AI' 
                : convo.status === 'waiting_on_customer'
                ? 'Waiting on customer reply'
                : 'Resolved';

              return (
                <button
                  key={convo.id}
                  type="button"
                  onClick={() => handleSelectConversation(convo.id)}
                  className={`w-full min-h-16! rounded-lg! p-3 text-left transition-colors cursor-pointer border flex flex-col gap-1.5 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-brand-soft border-brand/40 shadow-xs'
                      : 'bg-surface border-transparent hover:bg-surface-hover hover:border-line-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      
                      {/* Avatar with Channel Icon Badge */}
                      <div className="relative shrink-0">
                        <Avatar name={convo.name} size="md" />
                        <div 
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-surface border border-line-subtle flex items-center justify-center text-ink-3 shadow-2xs"
                          title={convo.channel}
                        >
                          <ChannelIcon className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm truncate ${convo.unread ? 'font-bold text-ink' : 'font-medium text-ink'}`}>
                            {convo.name}
                          </span>
                          {convo.unread && (
                            <span className="w-2 h-2 rounded-full bg-brand shrink-0" title="Unread" />
                          )}
                        </div>
                        <span className="text-xs text-ink-3 truncate block">
                          {convo.company}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-ink-3 tabular-nums font-mono">
                        {convo.time}
                      </span>
                      <span 
                        className={`w-2 h-2 rounded-full ${
                          convo.status === 'needs_you'
                            ? 'bg-danger'
                            : convo.status === 'ai_handling'
                            ? 'bg-info'
                            : convo.status === 'waiting_on_customer'
                            ? 'bg-brand'
                            : 'bg-line-subtle'
                        }`} 
                        title={statusTitle} 
                      />
                    </div>
                  </div>

                  {/* One-line snippet at text-sm */}
                  <p className="text-sm text-ink-3 truncate leading-snug">
                    {convo.snippet}
                  </p>

                  {/* Bottom tags & Rose waiting chip */}
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    {convo.waitingForHuman && (
                      <Badge tone="danger" size="sm">
                        Waiting {convo.time || '18m'}
                      </Badge>
                    )}
                    {tagLabel && (
                      <Badge tone={tagLabel === 'AI' ? 'info' : 'neutral'} size="sm">
                        {tagLabel}
                      </Badge>
                    )}
                    {convo.askedForPricing && (
                      <Badge tone="brand" size="sm">
                        Pricing
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center">
              <EmptyState
                icon={<MessageSquare className="w-6 h-6 text-ink-3" />}
                title="No conversations found"
                description="Try clearing your search query or adjusting your filters."
                action={
                  searchQuery || channelFilter !== 'All' ? (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => {
                        setSearchQuery('');
                        setChannelFilter('All');
                        setSpecialFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : null
                }
              />
            </div>
          )}
        </div>

      </div>

      {/* =========================================================================
          PANEL 2: CONVERSATION WORKSPACE (CENTRE)
          ========================================================================= */}
      <div className={`flex-1 min-w-0 flex flex-col h-full bg-surface ${
        mobileView === 'chat' ? 'flex' : 'hidden md:flex'
      }`}>
        {currentConvo ? (
          <>
            {/* Conversation Header */}
            <div className="p-3 sm:px-4 border-b border-line-subtle flex items-center justify-between gap-3 shrink-0 bg-surface">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile back button */}
                <button
                  type="button"
                  aria-label="Back to conversations"
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-hover cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <Avatar name={currentConvo.name} size="md" />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink truncate">
                      {currentConvo.name} · {currentConvo.company}
                    </span>
                    <Badge tone="brand" size="sm">{currentConvo.stage}</Badge>
                    <Badge tone={currentConvo.score >= 90 ? 'success' : currentConvo.score >= 80 ? 'warning' : 'danger'} size="sm">
                      Score {currentConvo.score}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-3">
                    {(() => {
                      const Icon = getChannelIcon(currentConvo.channel);
                      return (
                        <span className="flex items-center gap-1">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{currentConvo.channel}</span>
                        </span>
                      );
                    })()}
                    <span>·</span>
                    <span>Assigned: {currentConvo.assignedTo}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 relative">
                {/* Assign Dropdown */}
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowAssignMenu(prev => !prev);
                      setShowSnoozeMenu(false);
                    }}
                    leadingIcon={<UserCheck className="w-3.5 h-3.5" />}
                  >
                    <span className="hidden sm:inline">Assign</span>
                  </Button>

                  {showAssignMenu && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-line rounded-xl shadow-pop py-1 z-50 text-xs animate-fadeIn">
                      <div className="px-3 py-1 font-semibold text-ink-3 uppercase text-xs tracking-wider">
                        Assign to
                      </div>
                      {TEAM_MEMBERS.map(member => (
                        <button
                          key={member}
                          type="button"
                          onClick={() => handleAssign(member)}
                          className="w-full px-3 py-1.5 text-left text-ink hover:bg-surface-hover transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{member}</span>
                          {currentConvo.assignedTo === member && (
                            <Check className="w-3.5 h-3.5 text-brand" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Snooze Dropdown */}
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowSnoozeMenu(prev => !prev);
                      setShowAssignMenu(false);
                    }}
                    leadingIcon={<Clock className="w-3.5 h-3.5" />}
                  >
                    <span className="hidden sm:inline">Snooze</span>
                  </Button>

                  {showSnoozeMenu && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-line rounded-xl shadow-pop py-1 z-50 text-xs animate-fadeIn">
                      <div className="px-3 py-1 font-semibold text-ink-3 uppercase text-xs tracking-wider">
                        Snooze conversation
                      </div>
                      {[
                        { id: 'today', label: 'Later today (4h)' },
                        { id: 'tomorrow', label: 'Tomorrow (9 AM)' },
                        { id: 'next_week', label: 'Next week (Mon)' }
                      ].map(sn => (
                        <button
                          key={sn.id}
                          type="button"
                          onClick={() => handleSnooze(sn.label)}
                          className="w-full px-3 py-1.5 text-left text-ink hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          {sn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mark Resolved */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMarkResolved}
                  leadingIcon={<CheckCircle2 className="w-3.5 h-3.5 text-ok" />}
                >
                  <span className="hidden sm:inline">Resolve</span>
                </Button>

                {/* Toggle details panel */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setMobileView('details');
                    } else {
                      setShowLeadPanel(prev => !prev);
                    }
                  }}
                  aria-label={showLeadPanel ? 'Hide details' : 'Show details'}
                >
                  <PanelRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* AI Paused Banner: Calm info style with Sparkles */}
            {currentConvo.aiAlert?.isPaused && currentConvo.status === 'needs_you' && (
              <div className="mx-4 mt-3 p-3.5 rounded-xl bg-info-soft border border-line-subtle text-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-info shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-ink">
                      {currentConvo.aiAlert.reason || 'AI response paused to allow human review.'}
                    </h5>
                    <p className="text-xs text-ink-3">
                      Confidence score: {currentConvo.aiAlert.confidence}. Manual handoff active.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="primary" size="sm" onClick={handleTakeover}>
                    Take over
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowAssignMenu(true)}>
                    Assign
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleResumeAI}>
                    Let AI continue
                  </Button>
                </div>
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {currentConvo.messages.map((m, index) => {
                const prevMsg = currentConvo.messages[index - 1];
                const currentDay = getMessageDateGroup(m.time);
                const prevDay = prevMsg ? getMessageDateGroup(prevMsg.time) : null;
                const showSeparator = !prevDay || currentDay !== prevDay;

                const isAgent = m.sender === 'agent';
                const isAI = m.sender === 'ai';

                return (
                  <React.Fragment key={m.id}>
                    {showSeparator && (
                      <div className="flex items-center justify-center my-3">
                        <span className="text-xs text-ink-3 font-medium px-2.5 py-0.5 rounded-full bg-surface-raised border border-line-subtle">
                          {currentDay}
                        </span>
                      </div>
                    )}

                    <div className={`flex gap-3 ${isAgent ? 'justify-end' : 'justify-start'}`}>
                      {!isAgent && (
                        <div className="shrink-0 mt-0.5">
                          {isAI ? (
                            <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                              <Bot className="w-4 h-4" />
                            </div>
                          ) : (
                            <Avatar name={m.senderName || currentConvo.name} size="sm" />
                          )}
                        </div>
                      )}

                      <div className={`space-y-1 max-w-[80%] ${isAgent ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 px-1 text-xs text-ink-3">
                          <span className="font-semibold text-ink">
                            {isAI ? `${BRAND_NAME} AI` : m.senderName}
                          </span>
                          <span>{m.time}</span>
                        </div>

                        <div className={`rounded-2xl p-3 text-sm leading-relaxed border ${
                          isAgent
                            ? 'bg-brand-soft text-ink border-brand/20'
                            : isAI
                            ? 'bg-surface text-ink border-line-subtle'
                            : 'bg-surface-raised text-ink border-line-subtle'
                        }`}>
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>

                        {/* Delivery ticks on your messages */}
                        {isAgent && (
                          <div className="flex items-center justify-end gap-1 px-1 text-xs text-ink-3">
                            <span>Delivered</span>
                            <CheckCheck className="w-3.5 h-3.5 text-brand" />
                          </div>
                        )}
                      </div>

                      {isAgent && (
                        <div className="shrink-0 mt-0.5">
                          <Avatar name="You" size="sm" />
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Composer */}
            <div className="p-3 sm:p-4 border-t border-line-subtle bg-surface space-y-2.5 shrink-0">
              
              {/* Context-Aware Suggestion Chips Toolbar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-xs text-ink-3 uppercase tracking-wider shrink-0 font-semibold">
                  Quick chips:
                </span>
                
                {/* Pricing Deck chip: inserts clean sentence + file chip preview */}
                <button
                  type="button"
                  onClick={handleInsertPricingDeck}
                  className="px-2.5 py-1 rounded-lg border border-line-subtle bg-surface hover:bg-surface-hover text-ink transition-colors cursor-pointer shrink-0 font-medium flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-brand" />
                  <span>Pricing Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={handleInsertBookCall}
                  className="px-2.5 py-1 rounded-lg border border-line-subtle bg-surface hover:bg-surface-hover text-ink transition-colors cursor-pointer shrink-0 font-medium flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-ok" />
                  <span>Book Call</span>
                </button>

                <button
                  type="button"
                  onClick={handleInsertProposal}
                  className="px-2.5 py-1 rounded-lg border border-line-subtle bg-surface hover:bg-surface-hover text-ink transition-colors cursor-pointer shrink-0 font-medium flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  <span>Proposal Overview</span>
                </button>
              </div>

              {/* Attached file chips preview */}
              {attachedFiles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-raised border border-line-subtle text-xs text-ink"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand" />
                      <span className="font-medium truncate max-w-[160px]">{file.name}</span>
                      <span className="text-ink-3">({file.size})</span>
                      <button
                        type="button"
                        aria-label="Remove attachment"
                        onClick={() => removeAttachment(idx)}
                        className="text-ink-3 hover:text-danger cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea Input Container */}
              <div className={`border border-line rounded-xl overflow-hidden focus-within:border-brand transition-colors ${
                composerMode === 'note' ? 'bg-surface-raised' : 'bg-surface'
              }`}>
                <textarea
                  rows={2}
                  aria-label={composerMode === 'note' ? 'Internal note message' : 'Message reply'}
                  value={replyInput}
                  onChange={e => setReplyInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    composerMode === 'note'
                      ? 'Add internal note (only visible to team members)...'
                      : `Type a message to ${currentConvo.name} (Enter to send, Shift+Enter for new line)...`
                  }
                  className="w-full p-3 text-sm bg-transparent text-ink placeholder:text-ink-3 resize-none focus-visible:outline-none"
                />

                <div className="px-3 py-2 border-t border-line-subtle flex items-center justify-between gap-3 bg-surface">
                  <div className="flex items-center gap-2">
                    {/* Reply / Internal Note toggle */}
                    <SegmentedControl
                      options={[
                        { id: 'reply', label: 'Reply' },
                        { id: 'note', label: 'Note' }
                      ]}
                      value={composerMode}
                      onChange={val => setComposerMode(val as 'reply' | 'note')}
                      size="sm"
                    />

                    {/* Attach button */}
                    <button
                      type="button"
                      aria-label="Attach file"
                      onClick={handleAttachFile}
                      className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-hover cursor-pointer transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <span className="text-xs text-ink-3 hidden sm:inline">
                      {composerMode === 'reply' ? `Replying via ${currentConvo.channel}` : 'Internal team note'}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!replyInput.trim() && attachedFiles.length === 0}
                    leadingIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Send
                  </Button>
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              title="No conversation selected"
              description="Choose a conversation from the left panel to review messages and draft replies."
            />
          </div>
        )}
      </div>

      {/* =========================================================================
          PANEL 3: PROSPECT DETAILS (RIGHT)
          ========================================================================= */}
      {showLeadPanel && currentConvo && (
        <div className={`w-full md:w-80 shrink-0 border-l border-line bg-surface flex flex-col h-full overflow-y-auto ${
          mobileView === 'details' ? 'flex' : 'hidden lg:flex'
        }`}>
          
          {/* Header */}
          <div className="p-4 border-b border-line-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Back to conversation"
                onClick={() => setMobileView('chat')}
                className="lg:hidden p-1 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-hover cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="font-semibold text-sm text-ink">Details</h3>
            </div>
            <button
              type="button"
              aria-label="Close details"
              onClick={() => {
                if (window.innerWidth < 1024) setMobileView('chat');
                else setShowLeadPanel(false);
              }}
              className="p-1 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-hover cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-5 text-xs">
            
            {/* 1. Contact Info */}
            <div className="space-y-2.5">
              <span className="font-semibold text-ink-3 uppercase text-xs tracking-wider block">
                Contact
              </span>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-ink">
                  <Phone className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                  <span className="truncate">+91 98201 44820</span>
                </div>
                <div className="flex items-center gap-2 text-ink">
                  <Mail className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                  <span className="truncate">{currentConvo.name.toLowerCase().replace(/\s+/g, '.')}@example.com</span>
                </div>
                <div className="flex items-center gap-2 text-ink">
                  <MapPin className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                  <span className="truncate">{currentConvo.location}</span>
                </div>
              </div>
            </div>

            {/* 2. Pipeline Stage Selector */}
            <div className="space-y-1.5 pt-3 border-t border-line-subtle">
              <label className="font-semibold text-ink-3 uppercase text-xs tracking-wider block">
                Stage
              </label>
              <select
                value={currentConvo.stage}
                onChange={e => handleStageChange(e.target.value)}
                className="w-full bg-surface border border-line rounded-lg px-2.5 py-1.5 text-xs text-ink font-medium cursor-pointer focus-visible:outline-none focus:border-brand"
              >
                {STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 3. Deal Summary */}
            <div className="space-y-2.5 pt-3 border-t border-line-subtle">
              <span className="font-semibold text-ink-3 uppercase text-xs tracking-wider block">
                Deal
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs text-ink-3">Budget</span>
                  <p className="text-sm font-semibold text-ink">{currentConvo.qualification.budget}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-ink-3">Timeline</span>
                  <p className="text-sm font-semibold text-ink">{currentConvo.qualification.timeline}</p>
                </div>
              </div>
            </div>

            {/* 4. Qualification Checklist with "n of 4 verified" progress */}
            <div className="space-y-2.5 pt-3 border-t border-line-subtle">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-3 uppercase text-xs tracking-wider">
                  Qualification
                </span>
                <span className="text-xs font-medium text-ink-2">
                  {verifiedCount} of 4 verified
                </span>
              </div>

              <ProgressBar 
                value={(verifiedCount / 4) * 100} 
                size="sm" 
                tone={verifiedCount >= 3 ? 'ok' : 'brand'} 
              />

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${currentConvo.qualification.requirement ? 'text-ok' : 'text-ink-3'}`} />
                  <span className={currentConvo.qualification.requirement ? 'text-ink font-medium' : 'text-ink-3'}>
                    Specific requirement verified
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${currentConvo.qualification.budget && currentConvo.qualification.budget !== 'Unspecified' ? 'text-ok' : 'text-ink-3'}`} />
                  <span className={currentConvo.qualification.budget ? 'text-ink font-medium' : 'text-ink-3'}>
                    Budget allocated ({currentConvo.qualification.budget})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${currentConvo.qualification.timeline && currentConvo.qualification.timeline !== 'Unknown' ? 'text-ok' : 'text-ink-3'}`} />
                  <span className={currentConvo.qualification.timeline ? 'text-ink font-medium' : 'text-ink-3'}>
                    Target timeline stated ({currentConvo.qualification.timeline})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${currentConvo.qualification.decisionMaker ? 'text-ok' : 'text-ink-3'}`} />
                  <span className={currentConvo.qualification.decisionMaker ? 'text-ink font-medium' : 'text-ink-3'}>
                    Key decision maker engaged
                  </span>
                </div>
              </div>
            </div>

            {/* 5. AI "Why this score" list from existing whyPoints field */}
            {currentConvo.whyPoints && currentConvo.whyPoints.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-line-subtle">
                <span className="font-semibold text-ink-3 uppercase text-xs tracking-wider block">
                  Why this score ({currentConvo.score})
                </span>
                <ul className="space-y-1.5 text-xs text-ink-2">
                  {currentConvo.whyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                      <span>{pt.replace(/^\+\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 6. Next action & Lead Profile CTAs */}
            <div className="space-y-2 pt-4 border-t border-line-subtle">
              <span className="font-semibold text-ink-3 uppercase text-xs tracking-wider block">
                Next action
              </span>
              
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-between"
                onClick={() => {
                  if (onNotify) onNotify('Action Queued', currentConvo.nextAction);
                }}
              >
                <span className="truncate">{currentConvo.nextAction}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Button>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenLead}
                >
                  Lead profile
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (onNotify) onNotify('Follow-up Scheduled', `Follow-up queued for ${currentConvo.name}.`);
                  }}
                >
                  Schedule
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
