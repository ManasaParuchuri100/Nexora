import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  MessageSquare, 
  UserCheck, 
  Search, 
  Filter, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  Mail, 
  Share2, 
  Phone, 
  Building, 
  ChevronRight,
  User,
  ShieldAlert,
  Check,
  CornerDownLeft
} from 'lucide-react';
import { Lead, SubCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface EngageViewProps {
  activeSubCategory: SubCategory;
  leads: Lead[];
  onNavigateSub: (sub: SubCategory) => void;
  onSelectLead?: (lead: Lead) => void;
  onNotify?: (title: string, desc: string) => void;
}

interface MessageItem {
  id: string;
  senderName: string;
  senderEmail: string;
  company: string;
  channel: 'Email' | 'LinkedIn' | 'X' | 'Website';
  subject: string;
  snippet: string;
  fullMessage: string;
  timestamp: string;
  isUnread: boolean;
  isPriority: boolean;
  dealValue?: string;
  handoffReason?: string;
}

const INITIAL_INBOX_MESSAGES: MessageItem[] = [
  {
    id: 'msg-1',
    senderName: 'Dr. Evelyn Vance',
    senderEmail: 'evelyn@asterlabs.health',
    company: 'Aster Labs',
    channel: 'Email',
    subject: 'Atelier OS Rollout for 40 Healthcare Directors',
    snippet: 'We reviewed your security compliance whitepaper. We need a private cloud deployment preview by Thursday.',
    fullMessage: `Hello Nexora team,\n\nWe reviewed your security compliance whitepaper with our compliance committee. We are currently evaluating an Atelier OS rollout across 40 healthcare practice directors.\n\nCould we arrange a private demo preview and review the HIPAA sandbox verification timeline before this Thursday?\n\nBest regards,\nDr. Evelyn Vance\nAster Labs`,
    timestamp: '14 min ago',
    isUnread: true,
    isPriority: true,
    dealValue: '$48,000',
    handoffReason: 'High Deal Value & Custom Compliance Review'
  },
  {
    id: 'msg-2',
    senderName: 'Marcus Sterling',
    senderEmail: 'm.sterling@sterling-creative.co',
    company: 'Sterling Atelier',
    channel: 'LinkedIn',
    subject: 'Questions regarding custom typography generator engine',
    snippet: 'Can the 3D studio render engine export high-res TIFF passes with alpha masks for print billboards?',
    fullMessage: `Hi team, our studio is considering switching our full design pipeline to Nexora. One critical question: does the 3D visual generator support multi-layer EXR or 16-bit TIFF with transparent passes for large format outdoor billboards? We are eager to test this on an upcoming luxury retail client.`,
    timestamp: '42 min ago',
    isUnread: true,
    isPriority: false,
    dealValue: '$24,000'
  },
  {
    id: 'msg-3',
    senderName: 'Clara Chen',
    senderEmail: 'clara@veritascap.ventures',
    company: 'Veritas Capital',
    channel: 'Website',
    subject: 'Executive briefing for portfolio companies',
    snippet: 'Interested in a group workshop on quiet software architectures for our 12 Series-A founders.',
    fullMessage: `Hi, I lead platform acceleration at Veritas Capital. We want to bring Nexora in for an executive briefing on how high-conviction studios eliminate SaaS alert fatigue. Are you open to a private workshop next month?`,
    timestamp: '2 hours ago',
    isUnread: false,
    isPriority: true,
    dealValue: '$32,000',
    handoffReason: 'Executive Workshop & Multi-Entity Rollout'
  },
  {
    id: 'msg-4',
    senderName: 'Julian Thorne',
    senderEmail: 'julian@thorne-arch.de',
    company: 'Thorne Architecture',
    channel: 'X',
    subject: 'Inquiry on Scandinavian Atelier Dark Mode',
    snippet: 'Loving the aesthetic composure. Is the API accessible for custom client presentation portals?',
    fullMessage: `Sent you a direct note! We run an architectural practice in Berlin and want to embed Nexora client presentations directly into our client portals. Is the webhook suite live for beta users?`,
    timestamp: 'Yesterday',
    isUnread: false,
    isPriority: false,
    dealValue: '$16,500'
  }
];

export default function EngageView({
  activeSubCategory,
  leads,
  onNavigateSub,
  onSelectLead,
  onNotify
}: EngageViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [inboxFilter, setInboxFilter] = useState<'All' | 'Unread' | 'Priority'>('All');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_INBOX_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState<string>(INITIAL_INBOX_MESSAGES[0].id);
  const [replyText, setReplyText] = useState('');

  // Selected message
  const activeMessage = messages.find(m => m.id === selectedMessageId) || messages[0];

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchesSearch = 
        m.senderName.toLowerCase().includes(search.toLowerCase()) ||
        m.company.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = 
        inboxFilter === 'All' ||
        (inboxFilter === 'Unread' && m.isUnread) ||
        (inboxFilter === 'Priority' && m.isPriority);

      return matchesSearch && matchesFilter;
    });
  }, [messages, search, inboxFilter]);

  const handoffList = useMemo(() => {
    return messages.filter(m => !!m.handoffReason);
  }, [messages]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    if (onNotify) {
      onNotify('Reply Dispatched', `Response transmitted to ${activeMessage.senderName} via ${activeMessage.channel}.`);
    }
    setReplyText('');
  };

  const handleMarkAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isUnread: false } : m));
  };

  const handleApplyAISuggestion = (suggestion: string) => {
    setReplyText(suggestion);
  };

  const isInbox = activeSubCategory === 'inbox' || activeSubCategory === 'overview' || !activeSubCategory;
  const isConversations = activeSubCategory === 'conversations';
  const isHumanHandoff = activeSubCategory === 'human-handoff';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header with Subnav Switcher */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-[rgba(169,191,165,0.2)] gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5] font-medium block mb-1">
            COMMUNICATION & CONVERSATIONS
          </span>
          <h1 className={`serif text-3xl sm:text-4xl font-light tracking-tight ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
            Engage
          </h1>
          <p className="mt-1 text-xs text-[#A9BFA5]/80 font-light">
            Unified omnichannel messaging, conversational CRM threads, and autonomous human takeover queues.
          </p>
        </div>

        {/* Subnav Pills */}
        <div className="inline-flex rounded-[2px] border border-[rgba(169,191,165,0.2)] p-0.5 bg-inherit">
          <button
            type="button"
            onClick={() => onNavigateSub('inbox')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isInbox
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inbox</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSub('conversations')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isConversations
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Conversations</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSub('human-handoff')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isHumanHandoff
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Human Handoff ({handoffList.length})</span>
          </button>
        </div>
      </section>

      {/* 1. INBOX & CONVERSATIONS TWO-PANE VIEW */}
      {(isInbox || isConversations) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Message List */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`p-4 rounded-[2px] border ${
                isLight
                  ? 'bg-white border-[#E2ECE0]'
                  : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)]'
              }`}
            >
              {/* Search & Filter Header */}
              <div className="space-y-3 mb-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A9BFA5]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search inquiries or sender..."
                    className={`w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-[2px] border focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#122420] focus:border-[#143630]'
                        : 'bg-[#061816] border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5]'
                    }`}
                  />
                </div>

                <div className="flex items-center space-x-2 text-[11px] font-mono">
                  {(['All', 'Unread', 'Priority'] as const).map((filterOption) => (
                    <button
                      key={filterOption}
                      type="button"
                      onClick={() => setInboxFilter(filterOption)}
                      className={`px-2.5 py-0.5 rounded-[2px] border transition-colors cursor-pointer ${
                        inboxFilter === filterOption
                          ? isLight
                            ? 'bg-[#143630] border-[#143630] text-white'
                            : 'bg-[#E8E9D8] border-[#E8E9D8] text-[#071C1A] font-semibold'
                          : isLight
                            ? 'border-[#D0DDD0] text-[#3E6A5E] hover:text-[#122420]'
                            : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white'
                      }`}
                    >
                      {filterOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message List Rows */}
              <div className="divide-y divide-[rgba(169,191,165,0.1)]">
                {filteredMessages.map((msg) => {
                  const isSelected = msg.id === selectedMessageId;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessageId(msg.id);
                        handleMarkAsRead(msg.id);
                      }}
                      className={`p-3 transition-colors cursor-pointer rounded-[2px] my-1 ${
                        isSelected
                          ? isLight
                            ? 'bg-[#EDF3EA] border-l-2 border-[#143630]'
                            : 'bg-[#0D2D2A]/70 border-l-2 border-[#A9BFA5]'
                          : isLight
                            ? 'hover:bg-[#F8F9F5]'
                            : 'hover:bg-[#061816]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center space-x-2 truncate">
                          {msg.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          )}
                          <span className={`font-medium truncate ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
                            {msg.senderName}
                          </span>
                          <span className="text-[10px] font-mono text-[#A9BFA5]/60">· {msg.company}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#A9BFA5]/60 shrink-0">
                          {msg.timestamp}
                        </span>
                      </div>

                      <div className="text-xs font-medium truncate mb-1">
                        {msg.subject}
                      </div>

                      <p className="text-[11px] text-[#A9BFA5]/80 line-clamp-1 font-light">
                        {msg.snippet}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] font-mono text-[#A9BFA5]/60">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{msg.channel}</span>
                        </span>
                        {msg.dealValue && (
                          <span className="text-emerald-400 font-medium">
                            {msg.dealValue}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Pane: Thread Viewer & AI Assisted Reply */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className={`p-5 rounded-[2px] border ${
                isLight
                  ? 'bg-white border-[#E2ECE0]'
                  : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)]'
              }`}
            >
              {/* Message Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-[rgba(169,191,165,0.15)] gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className={`text-base font-semibold ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
                      {activeMessage.subject}
                    </h2>
                    {activeMessage.isPriority && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        VIP Priority
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-[#A9BFA5]">
                    <span className="font-medium text-[#E8E9D8]">{activeMessage.senderName}</span>
                    <span>&lt;{activeMessage.senderEmail}&gt;</span>
                    <span>· {activeMessage.company}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0D2D2A] text-emerald-400 border border-emerald-500/20">
                    Est. Value: {activeMessage.dealValue || '$20,000'}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="py-5 text-xs font-mono leading-relaxed whitespace-pre-wrap select-text">
                {activeMessage.fullMessage}
              </div>

              {/* AI Smart Response Suggestion */}
              <div
                className={`p-3.5 rounded-[2px] border my-3 space-y-2 ${
                  isLight
                    ? 'border-[#D0DDD0] bg-[#F8F9F5]'
                    : 'border-[rgba(169,191,165,0.2)] bg-[#061816]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A9BFA5]">
                  <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Copilot Suggested Response</span>
                  </span>
                  <span>1-Click Apply</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyAISuggestion(`Hi ${activeMessage.senderName.split(' ')[0]},\n\nThank you for reaching out. We would be delighted to schedule a private walkthrough and review the compliance preview.\n\nCould we arrange a 20-minute briefing this Thursday at 2:00 PM EST?\n\nWarm regards,\nNexora Atelier Systems`)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-[2px] border border-[rgba(169,191,165,0.25)] hover:bg-[#0D2D2A] text-[#A9BFA5] hover:text-white cursor-pointer"
                  >
                    + Confirm Briefing & Thursday Slot
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyAISuggestion(`Hi ${activeMessage.senderName.split(' ')[0]},\n\nYes, absolutely. The Nexora Atelier engine fully supports 16-bit TIFF rendering and high-resolution spatial passes with isolated alpha channels for large-format print.\n\nI have attached our technical asset spec sheet for your review.\n\nBest,\nNexora Studio`)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-[2px] border border-[rgba(169,191,165,0.25)] hover:bg-[#0D2D2A] text-[#A9BFA5] hover:text-white cursor-pointer"
                  >
                    + Provide Technical Specs & TIFF Clarification
                  </button>
                </div>
              </div>

              {/* Reply Box */}
              <div className="space-y-3 pt-2">
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write your response to ${activeMessage.senderName}...`}
                  className={`w-full p-3 text-xs font-mono rounded-[2px] border focus:outline-none transition-colors resize-none leading-relaxed ${
                    isLight
                      ? 'bg-[#F8F9F5] border-[#D0DDD0] text-[#122420] focus:border-[#143630]'
                      : 'bg-[#061816] border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-[#A9BFA5]'
                  }`}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#A9BFA5]/60">
                    Transmitting via {activeMessage.channel} API
                  </span>

                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className={`px-4 py-2 text-xs font-mono rounded-[2px] flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      !replyText.trim()
                        ? 'opacity-40 cursor-not-allowed bg-neutral-500 text-white'
                        : isLight
                          ? 'bg-[#143630] text-white hover:bg-[#0A1F1B]'
                          : 'bg-[#E8E9D8] text-[#071C1A] hover:bg-white font-medium'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HUMAN HANDOFF QUEUE VIEW */}
      {isHumanHandoff && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-[2px] border ${
              isLight
                ? 'bg-white border-[#E2ECE0]'
                : 'bg-[#071C1A] border-[rgba(169,191,165,0.2)]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(169,191,165,0.15)]">
              <div>
                <h3 className={`text-sm font-semibold tracking-wide ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
                  Autonomous Escalation & Human Handoff Queue
                </h3>
                <p className="text-[11px] text-[#A9BFA5]/70 font-mono">
                  Conversations where the AI model paused automation and requested human partner review
                </p>
              </div>

              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {handoffList.length} Awaiting Takeover
              </span>
            </div>

            <div className="space-y-3">
              {handoffList.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-[2px] border transition-all ${
                    isLight
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-amber-500/20 bg-amber-950/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold">{item.senderName}</span>
                        <span className="text-[10px] font-mono text-[#A9BFA5]/70">· {item.company}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {item.handoffReason}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#E8E9D8] mt-1.5 line-clamp-2">
                        "{item.snippet}"
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMessageId(item.id);
                          onNavigateSub('conversations');
                        }}
                        className="px-3 py-1.5 text-xs font-mono rounded-[2px] bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 cursor-pointer flex items-center space-x-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Take Over Conversation</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
