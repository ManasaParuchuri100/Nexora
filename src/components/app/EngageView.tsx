import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  AlertTriangle, 
  Bot, 
  User, 
  UserCheck, 
  ChevronDown, 
  ChevronLeft,
  Check, 
  Flame, 
  Calendar, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Phone,
  Building2,
  MapPin,
  CheckCircle2,
  PanelRight,
  PanelRightClose,
  Archive,
  RefreshCw,
  X,
  FileText,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { Lead, SubCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';

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

interface ConversationItem {
  id: string;
  name: string;
  company: string;
  location: string;
  time: string;
  channel: 'WhatsApp' | 'Instagram' | 'LinkedIn' | 'Website';
  status: 'needs_you' | 'ai_handling' | 'closed';
  snippet: string;
  stage: string;
  score: number;
  temperature: 'HOT' | 'WARM' | 'COLD';
  intelPill: string;
  whyPoints: string[];
  qualification: {
    requirement: boolean;
    budget: string;
    timeline: string;
    decisionMaker: boolean;
  };
  nextAction: string;
  aiAlert?: {
    isPaused: boolean;
    reason: string;
    confidence: 'low' | 'medium' | 'high';
  };
  messages: Array<{
    id: string;
    sender: 'customer' | 'ai' | 'agent';
    senderName: string;
    text: string;
    time: string;
  }>;
  assignedTo: string;
  leadReferenceId?: string;
  unread?: boolean;
  // Intent categories synced with Overview "Needs You" section
  isOverdueFollowUp?: boolean;
  overdueText?: string;
  askedForPricing?: boolean;
  readyToBookCall?: boolean;
  waitingForHuman?: boolean;
}

export type InboxSpecialFilter = 'all' | 'overdue-followups' | 'asked-pricing' | 'ready-to-book' | 'waiting-human';

export default function EngageView({
  activeSubCategory,
  leads,
  onNavigateSub,
  onSelectLead,
  onNotify,
  isFirstRun = false,
  onNavigateSettings
}: EngageViewProps) {
  const { theme } = useTheme();

  // Special intent filter state synced with activeSubCategory from Overview Needs You section
  const [specialFilter, setSpecialFilter] = useState<InboxSpecialFilter>(() => {
    if (activeSubCategory === 'overdue-followups' || activeSubCategory === 'follow-ups') return 'overdue-followups';
    if (activeSubCategory === 'asked-pricing' || activeSubCategory === 'pricing') return 'asked-pricing';
    if (activeSubCategory === 'ready-to-book' || activeSubCategory === 'book-call') return 'ready-to-book';
    if (activeSubCategory === 'waiting-human' || activeSubCategory === 'human-handoff') return 'waiting-human';
    return 'all';
  });

  // Top Filter Bar State
  const [activeTab, setActiveTab] = useState<InboxFilterTab>('needs_you');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLeadPanel, setShowLeadPanel] = useState(true);
  // Mobile responsive view mode: 'list' | 'chat' | 'details'
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'details'>('chat');

  // Sync specialFilter whenever activeSubCategory prop changes
  React.useEffect(() => {
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

  // Initial Conversations Data with intentional categorization matching Overview "Needs You" metrics
  const [conversations, setConversations] = useState<ConversationItem[]>([
    // 1. Rahul Sharma - Asked for Pricing & Waiting for Human (Aster Labs)
    {
      id: 'convo-rahul',
      name: 'Rahul Sharma',
      company: 'Aster Labs',
      location: 'Pune',
      time: '4m',
      channel: 'WhatsApp',
      status: 'needs_you',
      waitingForHuman: true,
      askedForPricing: true,
      snippet: 'Asked for custom pricing: Enterprise CRM & WhatsApp automation.',
      stage: 'Qualified',
      score: 92,
      temperature: 'HOT',
      intelPill: 'Aster Labs · Pune · Hot',
      whyPoints: ['+ asked for pricing twice', '+ clear budget ₹5-8L', '+ requested live call'],
      qualification: {
        requirement: true,
        budget: '₹5-8L',
        timeline: '30 days',
        decisionMaker: false
      },
      nextAction: 'schedule pricing discovery call',
      aiAlert: {
        isPaused: true,
        reason: 'AI paused: prospect asked for custom pricing. Confidence: low.',
        confidence: 'low'
      },
      messages: [
        {
          id: 'm1',
          sender: 'customer',
          senderName: 'Rahul',
          text: 'Hi, I need pricing for enterprise CRM and WhatsApp automation.',
          time: '10:42 AM'
        },
        {
          id: 'm2',
          sender: 'ai',
          senderName: 'AI',
          text: 'Absolutely Rahul! Could you share your monthly volume and team size so I can calculate your tier?',
          time: '10:44 AM'
        },
        {
          id: 'm3',
          sender: 'customer',
          senderName: 'Rahul',
          text: 'Can someone speak to me about enterprise pricing for 12 seats?',
          time: '10:46 AM'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-rahul-sharma'
    },

    // 2. Neha Gupta - Asked for Pricing (Kavya Luxury Interiors)
    {
      id: 'convo-neha',
      name: 'Neha Gupta',
      company: 'Kavya Luxury Interiors',
      location: 'New Delhi',
      time: '15m',
      channel: 'Instagram',
      status: 'needs_you',
      unread: true,
      askedForPricing: true,
      snippet: 'Asked for pricing: Commercial pricing sheet for 5 store locations.',
      stage: 'Qualified',
      score: 89,
      temperature: 'HOT',
      intelPill: 'Kavya Interiors · Pricing Inquiry',
      whyPoints: ['+ asked for commercial price sheet', '+ multi-store expansion', '+ verified store owner'],
      qualification: {
        requirement: true,
        budget: '₹4.5L',
        timeline: '15 days',
        decisionMaker: true
      },
      nextAction: 'send commercial pricing PDF',
      aiAlert: {
        isPaused: true,
        reason: 'AI paused: commercial rate card requested.',
        confidence: 'medium'
      },
      messages: [
        {
          id: 'm-n1',
          sender: 'customer',
          senderName: 'Neha',
          text: 'Hi! We love your studio workflows. Could you please send your detailed commercial pricing sheet?',
          time: '11:15 AM'
        },
        {
          id: 'm-n2',
          sender: 'ai',
          senderName: 'AI',
          text: 'Hello Neha! Our business plans start at ₹45,000/mo. Would you like a customized enterprise quote?',
          time: '11:17 AM'
        },
        {
          id: 'm-n3',
          sender: 'customer',
          senderName: 'Neha',
          text: 'Yes please, send the full pricing breakdown for our 5 store locations.',
          time: '11:20 AM'
        }
      ],
      assignedTo: 'Sarah — Solutions',
      leadReferenceId: 'lead-neha'
    },

    // 3. Elena Rostova - Overdue Follow-up & Waiting for Human (Nordic Space Design)
    {
      id: 'convo-elena',
      name: 'Elena Rostova',
      company: 'Nordic Space Design',
      location: 'Stockholm',
      time: '2d ago',
      channel: 'WhatsApp',
      status: 'needs_you',
      isOverdueFollowUp: true,
      overdueText: '2 days overdue',
      waitingForHuman: true,
      snippet: 'Follow-up overdue (2 days): Updated proposal & contract addendum.',
      stage: 'Proposal',
      score: 88,
      temperature: 'HOT',
      intelPill: 'Nordic Space · Overdue · Score 88',
      whyPoints: ['+ requested bespoke contract', '+ 14 seats requirement', '+ executive sign-off pending'],
      qualification: {
        requirement: true,
        budget: '$15,000',
        timeline: '14 days',
        decisionMaker: true
      },
      nextAction: 'dispatch updated contract addendum',
      aiAlert: {
        isPaused: true,
        reason: 'Follow-up overdue by 2 days: contract addendum pending.',
        confidence: 'low'
      },
      messages: [
        {
          id: 'm-e1',
          sender: 'customer',
          senderName: 'Elena',
          text: 'Can we get an updated proposal before Friday morning CET?',
          time: '2 days ago'
        },
        {
          id: 'm-e2',
          sender: 'customer',
          senderName: 'Elena',
          text: 'Hi, following up on the proposal revision promised on Wednesday.',
          time: 'Yesterday'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-nordic'
    },

    // 4. Priya Mehta - Overdue Follow-up (Nova Retail Hub)
    {
      id: 'convo-priya',
      name: 'Priya Mehta',
      company: 'Nova Retail Hub',
      location: 'Bengaluru',
      time: '1d ago',
      channel: 'WhatsApp',
      status: 'needs_you',
      unread: true,
      isOverdueFollowUp: true,
      overdueText: '1 day overdue',
      snippet: 'Follow-up overdue (1 day): Email revised catalog & quotation.',
      stage: 'Proposal',
      score: 85,
      temperature: 'HOT',
      intelPill: 'Nova Retail · Overdue Follow-up',
      whyPoints: ['+ verbal commitment given', '+ email quote promised Monday', '+ CFO review pending'],
      qualification: {
        requirement: true,
        budget: '₹7.2L',
        timeline: '30 days',
        decisionMaker: true
      },
      nextAction: 'email revised quote & catalog',
      aiAlert: {
        isPaused: true,
        reason: 'Follow-up overdue: revised quotation promised yesterday.',
        confidence: 'low'
      },
      messages: [
        {
          id: 'm-p1',
          sender: 'customer',
          senderName: 'Priya',
          text: 'We are waiting for the revised proposal email promised on Monday.',
          time: 'Yesterday'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-priya'
    },

    // 5. Vikram Patel - Overdue Follow-up (Apex Logistics)
    {
      id: 'convo-vikram',
      name: 'Vikram Patel',
      company: 'Apex Logistics',
      location: 'Ahmedabad',
      time: '2d ago',
      channel: 'LinkedIn',
      status: 'needs_you',
      isOverdueFollowUp: true,
      overdueText: '2 days overdue',
      snippet: 'Follow-up overdue (2 days): Technical debrief & NDA dispatch.',
      stage: 'Qualified',
      score: 82,
      temperature: 'WARM',
      intelPill: 'Apex Logistics · Overdue Follow-up',
      whyPoints: ['+ technical demo completed', '+ NDA requested', '+ fleet automation inquiry'],
      qualification: {
        requirement: true,
        budget: '₹6.0L',
        timeline: '45 days',
        decisionMaker: true
      },
      nextAction: 'send mutual NDA & specs',
      aiAlert: {
        isPaused: true,
        reason: 'Follow-up overdue by 2 days: technical debrief.',
        confidence: 'medium'
      },
      messages: [
        {
          id: 'm-v1',
          sender: 'customer',
          senderName: 'Vikram',
          text: 'Following up on the technical NDA doc we discussed 2 days ago.',
          time: '2 days ago'
        }
      ],
      assignedTo: 'Sarah — Solutions',
      leadReferenceId: 'lead-vikram'
    },

    // 6. David Chen - Overdue Follow-up (Zenith Media Group)
    {
      id: 'convo-david',
      name: 'David Chen',
      company: 'Zenith Media Group',
      location: 'Singapore',
      time: '18h ago',
      channel: 'Website',
      status: 'needs_you',
      isOverdueFollowUp: true,
      overdueText: '18 hours overdue',
      snippet: 'Follow-up overdue (18h): Review enterprise multi-channel deck.',
      stage: 'Contacted',
      score: 80,
      temperature: 'WARM',
      intelPill: 'Zenith Media · Overdue Follow-up',
      whyPoints: ['+ team sync pending', '+ requested slide deck', '+ enterprise budget'],
      qualification: {
        requirement: true,
        budget: '$12,000',
        timeline: '20 days',
        decisionMaker: false
      },
      nextAction: 'send technical deck to stakeholders',
      aiAlert: {
        isPaused: true,
        reason: 'Follow-up overdue: slide deck promised yesterday evening.',
        confidence: 'medium'
      },
      messages: [
        {
          id: 'm-d1',
          sender: 'customer',
          senderName: 'David',
          text: 'Need to review the enterprise deck before our team sync tonight.',
          time: 'Yesterday'
        }
      ],
      assignedTo: 'Sarah — Solutions',
      leadReferenceId: 'lead-david'
    },

    // 7. Maya Lin - Overdue Follow-up (Urban Spaces Architecture)
    {
      id: 'convo-maya',
      name: 'Maya Lin',
      company: 'Urban Spaces Architecture',
      location: 'Hyderabad',
      time: '1d ago',
      channel: 'WhatsApp',
      status: 'needs_you',
      isOverdueFollowUp: true,
      overdueText: '1 day overdue',
      snippet: 'Follow-up overdue (1 day): Commercial terms check-in.',
      stage: 'Qualified',
      score: 86,
      temperature: 'HOT',
      intelPill: 'Urban Spaces · Overdue Follow-up',
      whyPoints: ['+ pricing reviewed', '+ follow-up call promised', '+ principal architect inquiry'],
      qualification: {
        requirement: true,
        budget: '₹5.5L',
        timeline: '30 days',
        decisionMaker: true
      },
      nextAction: 'call principal architect',
      aiAlert: {
        isPaused: true,
        reason: 'Follow-up overdue: commercial check-in scheduled for yesterday.',
        confidence: 'low'
      },
      messages: [
        {
          id: 'm-my1',
          sender: 'customer',
          senderName: 'Maya',
          text: 'Checking in on our commercial terms discussion from yesterday.',
          time: 'Yesterday'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-maya'
    },

    // 8. Marcus Sterling - Ready to Book a Call & Waiting for Human (Sterling Atelier)
    {
      id: 'convo-marcus',
      name: 'Marcus Sterling',
      company: 'Sterling Atelier',
      location: 'London',
      time: '3h',
      channel: 'Website',
      status: 'needs_you',
      waitingForHuman: true,
      readyToBookCall: true,
      snippet: 'Ready to book a call: Live discovery walkthrough this week.',
      stage: 'Qualified',
      score: 91,
      temperature: 'HOT',
      intelPill: 'Sterling Atelier · Ready to Book',
      whyPoints: ['+ high deal volume', '+ confirmed ready to book call', '+ verified enterprise'],
      qualification: {
        requirement: true,
        budget: '$25,000',
        timeline: 'Immediate',
        decisionMaker: true
      },
      nextAction: 'schedule live discovery walkthrough',
      aiAlert: {
        isPaused: true,
        reason: 'Customer ready to book live walkthrough: AI passed to sales.',
        confidence: 'low'
      },
      messages: [
        {
          id: 'm-m1',
          sender: 'customer',
          senderName: 'Marcus',
          text: 'We reviewed the platform and are ready to book a live discovery walkthrough this week.',
          time: '7:50 AM'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-sterling'
    },

    // 9. Ananya Roy - Ready to Book a Call (Summit Healthcare)
    {
      id: 'convo-ananya',
      name: 'Ananya Roy',
      company: 'Summit Healthcare',
      location: 'Kolkata',
      time: '45m',
      channel: 'Website',
      status: 'needs_you',
      unread: true,
      readyToBookCall: true,
      snippet: 'Ready to book a call: Clinical director free tomorrow at 3 PM for demo.',
      stage: 'Qualified',
      score: 93,
      temperature: 'HOT',
      intelPill: 'Summit Healthcare · Ready to Book',
      whyPoints: ['+ director available tomorrow 3pm', '+ enterprise compliance verified', '+ ready to book demo'],
      qualification: {
        requirement: true,
        budget: '₹8.0L',
        timeline: 'Immediate',
        decisionMaker: true
      },
      nextAction: 'confirm demo invitation for tomorrow 3 PM',
      aiAlert: {
        isPaused: true,
        reason: 'Ready to book: clinical director requested calendar booking.',
        confidence: 'low'
      },
      messages: [
        {
          id: 'm-ar1',
          sender: 'customer',
          senderName: 'Ananya',
          text: 'Our clinical director is ready to book a 30-min demo call tomorrow at 3 PM. Can you send the link?',
          time: '9:15 AM'
        }
      ],
      assignedTo: 'Sarah — Solutions',
      leadReferenceId: 'lead-ananya'
    },

    // 10. Carlos Mendez - Ready to Book a Call (Horizon Ventures)
    {
      id: 'convo-carlos',
      name: 'Carlos Mendez',
      company: 'Horizon Ventures',
      location: 'Madrid',
      time: '1h',
      channel: 'LinkedIn',
      status: 'needs_you',
      readyToBookCall: true,
      snippet: 'Ready to book a call: Consultation for our 12 portfolio companies.',
      stage: 'Qualified',
      score: 87,
      temperature: 'HOT',
      intelPill: 'Horizon Ventures · Ready to Book',
      whyPoints: ['+ portfolio group deal', '+ confirmed ready to book call', '+ immediate onboarding'],
      qualification: {
        requirement: true,
        budget: '€18,000',
        timeline: 'Immediate',
        decisionMaker: true
      },
      nextAction: 'send calendar booking link',
      aiAlert: {
        isPaused: true,
        reason: 'Lead ready to book partner consultation.',
        confidence: 'low'
      },
      messages: [
        {
          id: 'm-cm1',
          sender: 'customer',
          senderName: 'Carlos',
          text: 'We reviewed your solution deck and are ready to book a partner consultation this week.',
          time: '8:30 AM'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-carlos'
    },

    // 11. Samantha Reed - Ready to Book a Call (Nexus Retail Group)
    {
      id: 'convo-samantha',
      name: 'Samantha Reed',
      company: 'Nexus Retail Group',
      location: 'New York',
      time: '2h',
      channel: 'WhatsApp',
      status: 'needs_you',
      readyToBookCall: true,
      snippet: 'Ready to book a call: Procurement onboarding walkthrough today.',
      stage: 'Qualified',
      score: 94,
      temperature: 'HOT',
      intelPill: 'Nexus Retail · Ready to Book',
      whyPoints: ['+ procurement team ready', '+ budget approved', '+ requested today call'],
      qualification: {
        requirement: true,
        budget: '$35,000',
        timeline: 'Immediate',
        decisionMaker: true
      },
      nextAction: 'schedule procurement walkthrough',
      aiAlert: {
        isPaused: true,
        reason: 'Procurement ready to book walkthrough.',
        confidence: 'low'
      },
      messages: [
        {
          id: 'm-sr1',
          sender: 'customer',
          senderName: 'Samantha',
          text: 'Our team is ready to book the procurement onboarding walkthrough today. Who is our lead?',
          time: '10:05 AM'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-samantha'
    },

    // 12. Aisha Khan - AI Handling (PulseWorks)
    {
      id: 'convo-aisha',
      name: 'Aisha Khan',
      company: 'PulseWorks',
      location: 'Mumbai',
      time: '12m',
      channel: 'Instagram',
      status: 'ai_handling',
      snippet: 'Do you ship to Bangalore and Delhi locations as well under single billing?',
      stage: 'Engaged',
      score: 92,
      temperature: 'HOT',
      intelPill: 'Score 92 · Budget ₹6L',
      whyPoints: ['+ budget ₹6L', '+ omnichannel requirement', '+ verified store owner'],
      qualification: {
        requirement: true,
        budget: '₹6L',
        timeline: 'Immediate',
        decisionMaker: true
      },
      nextAction: 'share product demo reel',
      aiAlert: undefined,
      messages: [
        {
          id: 'm-a1',
          sender: 'customer',
          senderName: 'Aisha',
          text: 'Hi! Do you ship to retail chain networks with multiple branch portals?',
          time: '10:35 AM'
        },
        {
          id: 'm-a2',
          sender: 'ai',
          senderName: 'AI',
          text: 'Yes Aisha! Tecavy supports multi-location routing with localized dispatch rules. How many store branches are you aiming to connect?',
          time: '10:37 AM'
        },
        {
          id: 'm-a3',
          sender: 'customer',
          senderName: 'Aisha',
          text: 'Do you ship to Bangalore and Delhi locations as well under single billing?',
          time: '10:38 AM'
        }
      ],
      assignedTo: 'Unassigned',
      leadReferenceId: 'lead-pulseworks'
    },

    // 13. John Carter - AI Handling (Vanguard Atelier)
    {
      id: 'convo-john',
      name: 'John Carter',
      company: 'Vanguard Atelier',
      location: 'San Francisco',
      time: '1h',
      channel: 'LinkedIn',
      status: 'ai_handling',
      snippet: 'Thanks, that documentation helps. Let me circle back with our technical lead.',
      stage: 'Contacted',
      score: 84,
      temperature: 'WARM',
      intelPill: 'Requirement · $10k+ indicated',
      whyPoints: ['+ enterprise API inquiry', '+ budget $10k+ indicated', '+ scheduled Q3 review'],
      qualification: {
        requirement: true,
        budget: '₹5-8L',
        timeline: '30 days',
        decisionMaker: true
      },
      nextAction: 'send architecture whitepaper',
      aiAlert: undefined,
      messages: [
        {
          id: 'm-j1',
          sender: 'customer',
          senderName: 'John',
          text: 'Hello, our architecture team is reviewing quiet CRM workflows for our studio.',
          time: '9:45 AM'
        },
        {
          id: 'm-j2',
          sender: 'ai',
          senderName: 'AI',
          text: 'Welcome John! We specialize in low-latency asset syndication and client portal generation.',
          time: '9:47 AM'
        },
        {
          id: 'm-j3',
          sender: 'customer',
          senderName: 'John',
          text: 'Thanks, that documentation helps. Let me circle back with our technical lead.',
          time: '9:50 AM'
        }
      ],
      assignedTo: 'Sarah — Solutions',
      leadReferenceId: 'lead-vanguard'
    }
  ]);

  // Selected conversation
  const [selectedConvoId, setSelectedConvoId] = useState<string>('convo-rahul');

  // Hover and keyboard-focus tracking for revealing lead details on demand
  const [hoveredConvoId, setHoveredConvoId] = useState<string | null>(null);
  const [focusedConvoId, setFocusedConvoId] = useState<string | null>(null);
  // Accessible touch toggle state (Set of conversation IDs with expanded details)
  const [expandedConvoIds, setExpandedConvoIds] = useState<Set<string>>(new Set());

  const toggleRowDetails = (id: string) => {
    setExpandedConvoIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Active reply text
  const [replyInput, setReplyInput] = useState('');

  // Assign dropdown state in middle column
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  // Filtered list taking into account special intent filters from Needs You
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      // Intent filters from Overview Needs You section
      if (specialFilter === 'overdue-followups' && !c.isOverdueFollowUp) return false;
      if (specialFilter === 'asked-pricing' && !c.askedForPricing) return false;
      if (specialFilter === 'ready-to-book' && !c.readyToBookCall) return false;
      if (specialFilter === 'waiting-human' && !c.waitingForHuman) return false;

      // Tab filter (applies when viewing all without special filter)
      if (specialFilter === 'all') {
        if (activeTab === 'needs_you' && c.status !== 'needs_you') return false;
        if (activeTab === 'ai_handling' && c.status !== 'ai_handling') return false;
        if (activeTab === 'closed' && c.status !== 'closed') return false;
      }

      // Channel filter
      if (channelFilter !== 'All' && c.channel !== channelFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCompany = c.company.toLowerCase().includes(q);
        const matchesSnippet = c.snippet.toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesSnippet) return false;
      }

      return true;
    });
  }, [conversations, activeTab, channelFilter, searchQuery, specialFilter]);

  // Selected conversation object - prioritizes currently filtered conversations
  const currentConvo = useMemo(() => {
    return filteredConversations.find(c => c.id === selectedConvoId) || filteredConversations[0] || conversations[0];
  }, [conversations, selectedConvoId, filteredConversations]);

  // Update selected conversation to first match when specialFilter changes
  React.useEffect(() => {
    if (specialFilter !== 'all' && filteredConversations.length > 0) {
      if (!filteredConversations.some(c => c.id === selectedConvoId)) {
        setSelectedConvoId(filteredConversations[0].id);
      }
    }
  }, [specialFilter, filteredConversations, selectedConvoId]);

  // Needs you count
  const needsYouCount = useMemo(() => {
    return conversations.filter(c => c.status === 'needs_you').length;
  }, [conversations]);

  // Message history container ref and scroll position tracking
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevConvoIdRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef<number>(0);

  // Preserve intended scroll-to-bottom behavior when opening conversation or new messages arrive,
  // without forcing user to the bottom if they are reading older messages
  useEffect(() => {
    if (!currentConvo) return;
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNewConversation = prevConvoIdRef.current !== currentConvo.id;
    const currentCount = currentConvo.messages.length;
    const hasNewMessage = currentCount > prevMessageCountRef.current;

    if (isNewConversation) {
      // Switched conversation: scroll to bottom immediately
      container.scrollTop = container.scrollHeight;
      prevConvoIdRef.current = currentConvo.id;
      prevMessageCountRef.current = currentCount;
    } else if (hasNewMessage) {
      // If user is already near bottom (within 180px), scroll smoothly down to new message
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 180;
      if (isNearBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
      prevMessageCountRef.current = currentCount;
    }
  }, [currentConvo?.id, currentConvo?.messages]);

  // Handle Send Reply
  const handleSendReply = (customText?: string) => {
    const textToSend = (customText || replyInput).trim();
    if (!textToSend || !currentConvo) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'agent' as const,
      senderName: 'Agent',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(c => {
      if (c.id === currentConvo.id) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          snippet: textToSend.slice(0, 48) + (textToSend.length > 48 ? '...' : ''),
          time: 'Just now',
          status: 'needs_you'
        };
      }
      return c;
    }));

    setReplyInput('');
    if (onNotify) onNotify('Message Sent', `Dispatched reply to ${currentConvo.name} via ${currentConvo.channel}.`);
    
    // Smooth scroll to bottom for sender's own new message
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 50);
  };

  // Handle Take Over
  const handleTakeOver = () => {
    setConversations(prev => prev.map(c => {
      if (c.id === currentConvo.id) {
        return {
          ...c,
          status: 'needs_you',
          aiAlert: {
            isPaused: true,
            reason: 'Human agent active: AI auto-responder paused.',
            confidence: 'low'
          }
        };
      }
      return c;
    }));
    if (onNotify) onNotify('Conversation Taken Over', 'AI paused. You are now actively handling this prospect.');
  };

  // Handle Hand Back to AI
  const handleHandBack = () => {
    setConversations(prev => prev.map(c => {
      if (c.id === currentConvo.id) {
        return {
          ...c,
          status: 'ai_handling',
          aiAlert: undefined
        };
      }
      return c;
    }));
    if (onNotify) onNotify('Handed to AI', 'AI auto-responder has resumed for this conversation.');
  };

  // Handle Toggle Closed / Resolved
  const handleToggleClosed = () => {
    if (!currentConvo) return;
    const isNowClosed = currentConvo.status !== 'closed';
    setConversations(prev => prev.map(c => {
      if (c.id === currentConvo.id) {
        return {
          ...c,
          status: isNowClosed ? 'closed' : 'needs_you'
        };
      }
      return c;
    }));
    if (onNotify) {
      onNotify(
        isNowClosed ? 'Conversation Resolved' : 'Conversation Reopened',
        `${currentConvo.name} moved to ${isNowClosed ? 'Closed' : 'Needs Attention'}.`
      );
    }
  };

  // Handle Assign
  const handleAssign = (agentName: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === currentConvo.id) {
        return {
          ...c,
          assignedTo: agentName
        };
      }
      return c;
    }));
    setShowAssignMenu(false);
    if (onNotify) onNotify('Assigned', `Conversation assigned to ${agentName}.`);
  };

  // Handle Stage Change
  const handleStageChange = (newStage: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === currentConvo.id) {
        return {
          ...c,
          stage: newStage
        };
      }
      return c;
    }));
    if (onNotify) onNotify('Stage Updated', `${currentConvo.name} moved to ${newStage}.`);
  };

  // Handle Open Lead in workspace drawer
  const handleOpenLead = () => {
    if (!onSelectLead || !currentConvo) return;
    const matchingLead = leads.find(l => 
      (currentConvo.leadReferenceId && l.id === currentConvo.leadReferenceId) ||
      l.name.toLowerCase() === currentConvo.name.toLowerCase() ||
      l.company.toLowerCase() === currentConvo.company.toLowerCase()
    );

    if (matchingLead) {
      onSelectLead(matchingLead);
    } else {
      const dynamicLead: Lead = {
        id: currentConvo.id,
        name: currentConvo.name,
        company: currentConvo.company,
        location: currentConvo.location,
        email: `${currentConvo.name.toLowerCase().replace(' ', '.')}@${currentConvo.company.toLowerCase().replace(' ', '')}.com`,
        phone: '+91 98201 44820',
        title: 'Decision Maker & Operations Lead',
        source: currentConvo.channel,
        score: currentConvo.score,
        temperature: currentConvo.temperature,
        stage: currentConvo.stage as any,
        status: currentConvo.stage === 'Qualified' ? 'Qualified' : 'Engaged',
        value: currentConvo.qualification.budget,
        budget: currentConvo.qualification.budget,
        timeline: currentConvo.qualification.timeline,
        requirement: currentConvo.snippet,
        assignee: { name: currentConvo.assignedTo, role: 'Sales' },
        tag: 'Priority',
        isPriority: currentConvo.temperature === 'HOT',
        decisionMaker: currentConvo.qualification.decisionMaker,
        date: 'Today',
        lastActivity: currentConvo.time
      };
      onSelectLead(dynamicLead);
    }
  };

  // Clean initials helper
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Score badge helper per user request #2 (green >= 90, yellow 80-89, red < 80)
  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
        dot: 'bg-emerald-500'
      };
    }
    if (score >= 80) {
      return {
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
        dot: 'bg-amber-500'
      };
    }
    return {
      text: 'text-rose-700 dark:text-rose-400',
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40',
      dot: 'bg-rose-500'
    };
  };

  const isLight = theme === 'light';

  return (
    <div className={`w-full flex-1 min-h-0 flex flex-col gap-2.5 animate-fadeIn overflow-hidden ${
      isLight ? 'text-slate-900' : 'text-[#E8E9D8]'
    }`}>
      
      {/* ========================================================
          COMPACT, CLEAN TOP TOOLBAR & FILTER BAR (LINEAR / INTERCOM)
         ======================================================== */}
      <div className={`p-2.5 sm:px-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0 transition-colors ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-xs'
          : 'bg-[#051614] border-[rgba(169,191,165,0.18)] shadow-sm'
      }`}>
        
        {/* Left: Title & Calm Segmented Filter Tabs */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-0.5 md:pb-0 scrollbar-none">
          <div className="flex items-center space-x-2 pr-3 border-r border-slate-200 dark:border-slate-800 shrink-0">
            <h1 className={`text-lg font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Inbox
            </h1>
            {needsYouCount > 0 ? (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40 px-2 py-0.5 rounded-full flex items-center space-x-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>{needsYouCount} pending</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-[#A9BFA5]/60 font-medium shrink-0">
                All caught up
              </span>
            )}
          </div>

          {/* Segmented Filter Buttons */}
          <div className={`flex items-center space-x-1 p-0.5 rounded-lg border text-xs font-medium shrink-0 ${
            isLight
              ? 'bg-slate-100/90 border-slate-200/80'
              : 'bg-[#041210] border-[rgba(169,191,165,0.16)]'
          }`}>
            {specialFilter !== 'all' && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800/60">
                <span>
                  {specialFilter === 'overdue-followups' && '⚠️ Overdue Follow-ups'}
                  {specialFilter === 'asked-pricing' && '💰 Asked for Pricing'}
                  {specialFilter === 'ready-to-book' && '📅 Ready to Book Call'}
                  {specialFilter === 'waiting-human' && '🔴 Waiting for Human'}
                </span>
                <button
                  type="button"
                  onClick={() => setSpecialFilter('all')}
                  className="ml-1 text-amber-800 hover:text-red-700 dark:text-amber-300 dark:hover:text-red-400 cursor-pointer font-bold"
                  title="Clear filter"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab('needs_you');
                setSpecialFilter('all');
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 text-xs ${
                activeTab === 'needs_you' && specialFilter === 'all'
                  ? isLight
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'bg-[#0E2C26] text-white font-semibold border border-teal-500/30'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    : 'text-[#A9BFA5] hover:text-white'
              }`}
            >
              <span>Needs Attention</span>
              {needsYouCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'needs_you'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {needsYouCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSpecialFilter('all');
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer text-xs ${
                activeTab === 'all' && specialFilter === 'all'
                  ? isLight
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'bg-[#0E2C26] text-white font-semibold border border-teal-500/30'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    : 'text-[#A9BFA5] hover:text-white'
              }`}
            >
              All ({conversations.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ai_handling');
                setSpecialFilter('all');
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 text-xs ${
                activeTab === 'ai_handling' && specialFilter === 'all'
                  ? isLight
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'bg-[#0E2C26] text-white font-semibold border border-teal-500/30'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    : 'text-[#A9BFA5] hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400" />
              <span>AI Handled</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('closed');
                setSpecialFilter('all');
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 text-xs ${
                activeTab === 'closed' && specialFilter === 'all'
                  ? isLight
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'bg-[#0E2C26] text-white font-semibold border border-teal-500/30'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    : 'text-[#A9BFA5] hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-slate-500" />
              <span>Closed</span>
            </button>
          </div>
        </div>

        {/* Right: Channel Filter, Search, Details Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Channel Selector */}
          <div className="relative">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as ChannelFilter)}
              className={`text-xs px-2.5 py-1.5 pr-7 rounded-lg border focus:outline-none cursor-pointer appearance-none font-medium transition-colors ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 focus:border-teal-600 shadow-xs'
                  : 'bg-[#071F1C] border-[rgba(169,191,165,0.25)] text-[#E8E9D8] focus:border-teal-400'
              }`}
            >
              <option value="All">All Channels</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Website">Website</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`text-xs px-2.5 py-1.5 pl-8 pr-7 rounded-lg border focus:outline-none w-36 sm:w-52 transition-all ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-600 shadow-xs'
                  : 'bg-[#071F1C] border-[rgba(169,191,165,0.25)] text-white placeholder-[#A9BFA5]/50 focus:border-teal-400'
              }`}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Lead Dossier Sidebar (Desktop) */}
          <button
            type="button"
            onClick={() => setShowLeadPanel(!showLeadPanel)}
            title={showLeadPanel ? 'Hide Prospect Details' : 'Show Prospect Details'}
            className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              showLeadPanel
                ? isLight
                  ? 'bg-slate-100 text-slate-900 border-slate-300'
                  : 'bg-[#0B2522] text-white border-teal-500/40'
                : isLight
                  ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  : 'bg-[#071F1C] text-[#A9BFA5] border-[rgba(169,191,165,0.25)] hover:text-white'
            }`}
          >
            {showLeadPanel ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{showLeadPanel ? 'Hide Details' : 'Prospect Details'}</span>
          </button>
        </div>

      </div>

      {/* First-Run Empty State */}
      {isFirstRun && (
        <div className={`p-8 sm:p-12 rounded-xl border text-center space-y-4 max-w-lg mx-auto my-6 animate-fadeIn shadow-sm ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-[#061816] border-emerald-500/30'
        }`}>
          <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/25 flex items-center justify-center mx-auto text-teal-600 dark:text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              No conversations yet
            </h3>
            <p className={`text-xs max-w-sm mx-auto leading-relaxed ${
              isLight ? 'text-slate-500' : 'text-[#A9BFA5]'
            }`}>
              When customers message your connected WhatsApp, Instagram, or Website channels, conversations flow into this unified inbox.
            </p>
          </div>
          <div>
            <button
              type="button"
              id="inbox-connect-channel-btn"
              onClick={() => {
                if (onNavigateSettings) onNavigateSettings();
                else onNavigateSub('conversation');
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <span>Connect Channels in Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          THREE BALANCED AREAS (LINEAR & INTERCOM ARCHITECTURE)
          1. Left: Conversation List (~300px)
          2. Center: Active Conversation (Majority of available space)
          3. Right: Prospect Details (~300px, Collapsible)
         ======================================================== */}
      <div className={`flex flex-col lg:flex-row flex-1 min-h-0 w-full rounded-xl border overflow-hidden transition-colors ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-xs'
          : 'bg-[#071C1A] border-[rgba(169,191,165,0.18)] shadow-md'
      }`}>
        
        {/* ========================================================
            AREA 1: CONVERSATION LIST (~300px WIDE)
           ======================================================== */}
        <div className={`${
          mobileView === 'list' ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-[310px] xl:w-[330px] shrink-0 h-full min-h-0 border-b lg:border-b-0 lg:border-r flex-col overflow-hidden transition-colors ${
          isLight
            ? 'bg-white border-slate-200/90'
            : 'bg-[#051614] border-[rgba(169,191,165,0.18)]'
        }`}>
          
          {/* List Sub-header with Conversation Count */}
          <div className={`px-3.5 py-2 border-b flex items-center justify-between text-xs font-medium shrink-0 ${
            isLight
              ? 'bg-slate-50/70 border-slate-200/80 text-slate-500'
              : 'bg-[#041210] border-[rgba(169,191,165,0.12)] text-[#A9BFA5]/70'
          }`}>
            <span>{filteredConversations.length} conversation{filteredConversations.length === 1 ? '' : 's'}</span>
            {searchQuery && (
              <span className="text-teal-600 dark:text-amber-300 font-normal">"{searchQuery}"</span>
            )}
          </div>

          {/* Active Filter Announcement Banner from Needs You Section */}
          {specialFilter !== 'all' && (
            <div className={`px-3 py-2 border-b flex items-center justify-between text-xs font-medium shrink-0 ${
              isLight
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-[#0C2A26] border-emerald-500/40 text-[#E8E9D8]'
            }`}>
              <div className="flex items-center space-x-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="font-semibold truncate">
                  {specialFilter === 'overdue-followups' && `⚠️ Overdue Follow-ups (${filteredConversations.length})`}
                  {specialFilter === 'asked-pricing' && `💰 Pricing Inquiries (${filteredConversations.length})`}
                  {specialFilter === 'ready-to-book' && `📅 Ready to Book (${filteredConversations.length})`}
                  {specialFilter === 'waiting-human' && `🔴 Waiting for Human (${filteredConversations.length})`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSpecialFilter('all')}
                className="text-[11px] font-semibold text-teal-600 dark:text-emerald-300 hover:underline cursor-pointer shrink-0 ml-2"
              >
                Clear
              </button>
            </div>
          )}

          {/* Scrollable Conversation Items */}
          <div className={`divide-y flex-1 min-h-0 overflow-y-auto ${
            isLight
              ? 'divide-slate-100'
              : 'divide-[rgba(169,191,165,0.08)]'
          }`}>
            {filteredConversations.length > 0 ? (
              filteredConversations.map(convo => {
                const isSelected = convo.id === currentConvo?.id;
                const isNeedsYou = convo.status === 'needs_you';
                const isClosed = convo.status === 'closed';
                const isHovered = hoveredConvoId === convo.id;
                const isFocused = focusedConvoId === convo.id;
                const isTouchExpanded = expandedConvoIds.has(convo.id);
                const isExpanded = isHovered || isFocused || isTouchExpanded;
                const scoreBadge = getScoreBadge(convo.score);

                // Single persistent, subtle urgency or status indicator
                const statusDot = (() => {
                  if (convo.isOverdueFollowUp) {
                    return {
                      className: 'bg-amber-500 ring-2 ring-amber-500/20',
                      title: convo.overdueText || 'Overdue follow-up'
                    };
                  }
                  if (convo.waitingForHuman) {
                    return {
                      className: 'bg-rose-500 ring-2 ring-rose-500/20',
                      title: 'Waiting for human response'
                    };
                  }
                  if (isNeedsYou) {
                    return {
                      className: 'bg-amber-500 ring-2 ring-amber-500/20',
                      title: 'Needs human response'
                    };
                  }
                  if (isClosed) {
                    return {
                      className: 'bg-slate-400',
                      title: 'Resolved'
                    };
                  }
                  return {
                    className: 'bg-emerald-500 ring-2 ring-emerald-500/20',
                    title: 'AI handling'
                  };
                })();

                return (
                  <div
                    key={convo.id}
                    role="button"
                    tabIndex={0}
                    aria-selected={isSelected}
                    aria-label={`Conversation with ${convo.name}`}
                    onMouseEnter={() => setHoveredConvoId(convo.id)}
                    onMouseLeave={() => setHoveredConvoId(null)}
                    onFocus={() => setFocusedConvoId(convo.id)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setFocusedConvoId(null);
                      }
                    }}
                    onClick={() => {
                      setSelectedConvoId(convo.id);
                      setMobileView('chat');
                      if (convo.unread) {
                        setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unread: false } : c));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedConvoId(convo.id);
                        setMobileView('chat');
                        if (convo.unread) {
                          setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unread: false } : c));
                        }
                      }
                    }}
                    className={`group px-3 py-2 transition-colors duration-150 cursor-pointer relative outline-none focus-visible:ring-1 focus-visible:ring-teal-500 ${
                      isSelected
                        ? isLight
                          ? isExpanded ? 'bg-teal-100/60 border-l-[3px] border-l-teal-600' : 'bg-teal-50/70 border-l-[3px] border-l-teal-600'
                          : isExpanded ? 'bg-[#0E2E2A] border-l-[3px] border-l-[#A9BFA5]' : 'bg-[#0B2522] border-l-[3px] border-l-[#A9BFA5]'
                        : isLight
                          ? 'hover:bg-slate-50 focus:bg-slate-50 border-l-[3px] border-l-transparent'
                          : 'hover:bg-[#081F1C] focus:bg-[#081F1C] border-l-[3px] border-l-transparent'
                    } ${isClosed ? 'opacity-85' : ''}`}
                  >
                    {/* First Line: Contact Name + Urgent/Unread Dot + Timestamp */}
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {convo.unread && (
                          <span
                            className="w-2 h-2 rounded-full bg-teal-600 ring-2 ring-teal-500/25 shrink-0"
                            title="Unread message"
                            aria-label="Unread message"
                          />
                        )}
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${statusDot.className}`}
                          title={statusDot.title}
                        />
                        <span className={`text-xs truncate ${
                          convo.unread
                            ? 'text-slate-900 dark:text-white font-bold'
                            : isSelected
                            ? isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'
                            : isLight ? 'text-slate-800 font-semibold' : 'text-[#E8E9D8] font-medium'
                        }`}>
                          {convo.name}
                        </span>
                      </div>

                      {/* Right side: Timestamp & Accessible Mobile/Touch Details Toggle */}
                      <div className="flex items-center space-x-1 shrink-0 ml-2">
                        <span className={`text-[11px] font-mono tabular-nums font-medium ${
                          isLight ? 'text-slate-500' : 'text-[#A9BFA5]'
                        }`}>
                          {convo.time}
                        </span>

                        {/* Accessible touch-device details toggle */}
                        <button
                          type="button"
                          aria-label={isExpanded ? `Hide lead details for ${convo.name}` : `Show lead details for ${convo.name}`}
                          aria-expanded={isExpanded}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowDetails(convo.id);
                          }}
                          title="Toggle lead details"
                          className="sm:hidden p-0.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded focus:outline-none"
                        >
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-teal-600' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Second Line: Latest Message Preview (muted secondary text with clean ellipsis) */}
                    <div className="mt-0.5">
                      <p className={`text-xs truncate leading-snug ${
                        isLight ? 'text-slate-500 font-normal' : 'text-[#A9BFA5]/80 font-light'
                      }`}>
                        {convo.snippet}
                      </p>
                    </div>

                    {/* Lightweight Expanded Lead Details (Revealed on hover, keyboard focus, or touch toggle) */}
                    <div
                      className={`transition-all duration-200 ease-out overflow-hidden ${
                        isExpanded
                          ? 'max-h-40 opacity-100 pt-2 pb-0.5 space-y-1.5'
                          : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      {/* Metadata Row 1: Company · Channel · Connection Status · Temperature */}
                      <div className={`flex items-center space-x-1.5 text-[11px] ${
                        isLight ? 'text-slate-600' : 'text-[#A9BFA5]/90'
                      }`}>
                        <span className="truncate max-w-[125px] font-medium">{convo.company}</span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className={`font-semibold shrink-0 ${
                          convo.channel === 'WhatsApp' ? 'text-emerald-600 dark:text-emerald-400' :
                          convo.channel === 'Instagram' ? 'text-pink-600 dark:text-pink-400' :
                          convo.channel === 'LinkedIn' ? 'text-sky-600 dark:text-sky-400' :
                          'text-teal-600 dark:text-teal-400'
                        }`}>
                          {convo.channel}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-[10px] shrink-0 font-medium text-slate-500 dark:text-[#A9BFA5]/70">
                          {isClosed ? 'Resolved' : isNeedsYou ? 'Needs human' : 'AI active'}
                        </span>
                        {convo.temperature === 'HOT' && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="text-rose-500 dark:text-rose-400 flex items-center space-x-0.5 font-semibold text-[10px] shrink-0">
                              <Flame className="w-2.5 h-2.5" />
                              <span>Hot</span>
                            </span>
                          </>
                        )}
                      </div>

                      {/* Metadata Row 2: Status alerts (Overdue, Pricing, Ready to book, Waiting for human, Resolved) */}
                      {(convo.isOverdueFollowUp || convo.askedForPricing || convo.readyToBookCall || (convo.waitingForHuman && !convo.isOverdueFollowUp && !convo.askedForPricing && !convo.readyToBookCall) || isClosed) && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {convo.isOverdueFollowUp && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 px-1.5 py-0.5 rounded font-medium">
                              ⚠️ {convo.overdueText || 'Overdue Follow-up'}
                            </span>
                          )}
                          {convo.askedForPricing && (
                            <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40 px-1.5 py-0.5 rounded font-medium">
                              💰 Asked for Pricing
                            </span>
                          )}
                          {convo.readyToBookCall && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 px-1.5 py-0.5 rounded font-medium">
                              📅 Ready to Book Call
                            </span>
                          )}
                          {convo.waitingForHuman && !convo.isOverdueFollowUp && !convo.askedForPricing && !convo.readyToBookCall && (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 px-1.5 py-0.5 rounded font-medium">
                              🔴 Waiting for Human
                            </span>
                          )}
                          {isClosed && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded font-medium">
                              ✓ Resolved
                            </span>
                          )}
                        </div>
                      )}

                      {/* Metadata Row 3: Pipeline Stage · Lead Score · Deal Value / Budget */}
                      <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className={`font-medium truncate ${
                            convo.stage.toLowerCase().includes('qualif')
                              ? 'text-teal-600 dark:text-cyan-400'
                              : isLight ? 'text-slate-500' : 'text-[#94A3B8]'
                          }`}>
                            {convo.stage}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className={`font-bold shrink-0 ${scoreBadge.text}`}>
                            Score {convo.score}
                          </span>
                        </div>
                        <span className={`shrink-0 ml-1.5 font-mono tabular-nums text-right font-medium ${
                          isLight ? 'text-slate-700' : 'text-[#94A3B8]'
                        }`}>
                          {convo.qualification.budget}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-slate-400 dark:text-[#A9BFA5]/60">
                  No conversations found.
                </p>
                {(searchQuery || channelFilter !== 'All' || activeTab !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setChannelFilter('All');
                      setActiveTab('all');
                    }}
                    className="text-xs text-teal-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ========================================================
            AREA 2: ACTIVE CONVERSATION (CENTER - VISUAL FOCUS)
            Receives the majority of available space
           ======================================================== */}
        <div className={`${
          mobileView === 'chat' ? 'flex' : 'hidden'
        } lg:flex flex-1 min-w-0 min-h-0 h-full flex-col overflow-hidden transition-colors ${
          isLight
            ? 'bg-slate-50/30'
            : 'bg-[#071C1A]'
        }`}>
          
          {currentConvo ? (
            <>
              {/* Region A: Active Conversation Header (Compact, all aligned, shrink-0) */}
              <div className={`px-4 sm:px-5 py-2.5 border-b flex items-center justify-between shrink-0 transition-colors ${
                isLight
                  ? 'bg-white border-slate-200/90'
                  : 'bg-[#051614] border-[rgba(169,191,165,0.18)]'
              }`}>
                <div className="flex items-center space-x-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer mr-0.5"
                    title="Back to conversations"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/40 flex items-center justify-center text-xs shrink-0">
                    {getInitials(currentConvo.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-sm truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {currentConvo.name}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className={`text-xs truncate ${
                        isLight ? 'text-slate-500 font-medium' : 'text-[#A9BFA5]'
                      }`}>
                        {currentConvo.company}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-[#A9BFA5]/80">
                      <span className="font-semibold text-teal-600 dark:text-teal-400">{currentConvo.channel}</span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Connected</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleClosed}
                    className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                        : 'bg-[#071F1C] border-[rgba(169,191,165,0.25)] text-[#E8E9D8] hover:bg-[#0B2522]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{currentConvo.status === 'closed' ? 'Reopen' : 'Mark Resolved'}</span>
                  </button>

                  {/* Toggle Prospect Details (Desktop toggle + Mobile view) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setMobileView('details');
                      } else {
                        setShowLeadPanel(prev => !prev);
                      }
                    }}
                    title={showLeadPanel ? "Hide Prospect Details" : "Show Prospect Details"}
                    className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer flex items-center justify-center ${
                      showLeadPanel
                        ? isLight
                          ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-xs'
                          : 'bg-[#0B2522] border-[rgba(169,191,165,0.3)] text-white hover:bg-[#0E332E]'
                        : isLight
                          ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs'
                          : 'bg-[#071F1C] border-[rgba(169,191,165,0.25)] text-[#A9BFA5] hover:text-white'
                    }`}
                  >
                    <PanelRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Region A (Cont.): AI Intervention Banner (Anchored at top under header, outside messages scroll) */}
              {currentConvo.aiAlert && currentConvo.aiAlert.isPaused && (
                <div className={`border-b p-2.5 sm:px-4 py-2 space-y-2 text-xs shrink-0 transition-colors animate-fadeIn ${
                  isLight
                    ? 'bg-amber-50/80 border-amber-200/90 text-amber-900'
                    : 'bg-[#1A180E] border-amber-500/40 text-amber-200'
                }`}>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs leading-snug">{currentConvo.aiAlert.reason}</p>
                      <p className={`text-[11px] mt-0.5 leading-normal ${
                        isLight ? 'text-amber-700/90' : 'text-amber-300/80'
                      }`}>
                        Automated replies are paused to prevent AI hallucination on custom scope.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-1.5 pt-1.5 border-t border-amber-200/70 dark:border-amber-800/50">
                    <button
                      type="button"
                      onClick={handleTakeOver}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs cursor-pointer transition-colors shadow-xs"
                    >
                      Take Over Conversation
                    </button>

                    {/* Assign Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAssignMenu(!showAssignMenu)}
                        className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer flex items-center space-x-1 border ${
                          isLight
                            ? 'bg-white border-amber-300 text-amber-900 hover:bg-amber-50'
                            : 'bg-[#0B2522] border-amber-500/50 text-amber-200'
                        }`}
                      >
                        <span>Assign ({currentConvo.assignedTo.split('—')[0].trim()})</span>
                        <ChevronDown className="w-3 h-3 ml-0.5" />
                      </button>

                      {showAssignMenu && (
                        <div className={`absolute left-0 mt-1 w-44 rounded-lg border shadow-lg py-1 z-30 text-xs font-medium ${
                          isLight
                            ? 'bg-white border-slate-200 text-slate-800'
                            : 'bg-[#041210] border-[rgba(169,191,165,0.25)] text-white'
                        }`}>
                          <button
                            type="button"
                            onClick={() => handleAssign('Rahul — Sales')}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#071F1C] transition-colors"
                          >
                            Rahul — Sales
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAssign('Sarah — Solutions')}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#071F1C] transition-colors"
                          >
                            Sarah — Solutions
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAssign('Priya — AE')}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#071F1C] transition-colors"
                          >
                            Priya — AE
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleHandBack}
                      className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-colors border ${
                        isLight
                          ? 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50'
                          : 'bg-[#0B2522] border-amber-500/50 text-amber-200'
                      }`}
                    >
                      Let AI Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Region B: Chat Thread Body (Scrollable, flex-1 min-h-0, anchored with messagesContainerRef) */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 min-h-0 p-3.5 sm:p-5 space-y-2 overflow-y-auto"
              >

                {/* System Event / Date Divider */}
                <div className="flex items-center justify-center py-1">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isLight
                      ? 'text-slate-400 bg-slate-100 border-slate-200/80'
                      : 'text-[#A9BFA5]/40 bg-[#061816] border-[rgba(169,191,165,0.1)]'
                  }`}>
                    Today · Realtime Sync
                  </span>
                </div>

                {/* Messages Thread with consecutive sender grouping */}
                <div className="space-y-1">
                  {currentConvo.messages.map((msg, idx) => {
                    const isCustomer = msg.sender === 'customer';
                    const isAi = msg.sender === 'ai';
                    const prevMsg = idx > 0 ? currentConvo.messages[idx - 1] : null;
                    const isSameSenderAsPrev = prevMsg && prevMsg.sender === msg.sender;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'} text-xs ${
                          isSameSenderAsPrev ? 'mt-1' : 'mt-2.5'
                        }`}
                      >
                        {/* Sender Label (Rendered only on first message of a consecutive sequence) */}
                        {!isSameSenderAsPrev && (
                          <div className={`flex items-center space-x-1.5 text-[11px] mb-1 px-1 ${
                            isLight ? 'text-slate-400' : 'text-[#A9BFA5]/60'
                          }`}>
                            {isCustomer ? (
                              <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-white'}`}>
                                {currentConvo.name}
                              </span>
                            ) : isAi ? (
                              <span className="text-teal-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                                <Bot className="w-3 h-3" />
                                <span>Tecavy AI</span>
                              </span>
                            ) : (
                              <span className="text-sky-600 dark:text-sky-300 font-semibold flex items-center space-x-1">
                                <UserCheck className="w-3 h-3" />
                                <span>You (Agent)</span>
                              </span>
                            )}
                            <span>·</span>
                            <span className="text-[10px] font-mono">{msg.time}</span>
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`p-3 leading-relaxed max-w-[80%] sm:max-w-[72%] text-xs shadow-xs ${
                            isCustomer 
                              ? isLight
                                ? 'bg-slate-100 text-slate-800 border border-slate-200/70 rounded-2xl rounded-tl-sm'
                                : 'bg-[#0B2522] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] rounded-2xl rounded-tl-sm'
                              : isAi 
                              ? isLight
                                ? 'bg-teal-50/90 text-teal-950 border border-teal-200/60 rounded-2xl rounded-tr-sm'
                                : 'bg-[#0E2C26] border border-emerald-500/25 text-emerald-50 rounded-2xl rounded-tr-sm'
                              : isLight
                                ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm shadow-xs'
                                : 'bg-[#0D2D38] border border-sky-500/30 text-sky-50 rounded-2xl rounded-tr-sm'
                          }`}
                        >
                          {msg.text}
                          {isSameSenderAsPrev && (
                            <div className="text-[9px] font-mono text-right opacity-60 mt-0.5">
                              {msg.time}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Suggestions & Reply Composer (Streamlined vertical height) */}
              <div className={`border-t p-2.5 sm:p-3 space-y-2 shrink-0 transition-colors ${
                isLight
                  ? 'bg-white border-slate-200/90'
                  : 'bg-[#051614] border-[rgba(169,191,165,0.18)]'
              }`}>
                
                {/* Compact Suggested Responses */}
                <div className="flex items-center space-x-1.5 text-xs overflow-x-auto pb-0.5 scrollbar-none">
                  <span className={`text-[11px] font-semibold mr-0.5 flex items-center space-x-1 shrink-0 ${
                    isLight ? 'text-slate-500' : 'text-[#A9BFA5]'
                  }`}>
                    <Sparkles className="w-3 h-3 text-teal-600 dark:text-emerald-400" />
                    <span>Suggestions:</span>
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setReplyInput('Here is our enterprise pricing monograph and feature matrix for Aster Labs: [Download PDF]');
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer shrink-0 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        : 'bg-[#071F1C] border-[rgba(169,191,165,0.2)] text-[#E8E9D8] hover:bg-[#0B2522]'
                    }`}
                  >
                    Share Pricing Deck
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyInput('I would be delighted to set up a 20-minute tailored walkthrough. Would tomorrow at 11:30 AM or 3:00 PM IST work for you?');
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer shrink-0 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        : 'bg-[#071F1C] border-[rgba(169,191,165,0.2)] text-[#E8E9D8] hover:bg-[#0B2522]'
                    }`}
                  >
                    Offer Call Slot
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyInput('Thank you! Could you share the name and email of your primary technical lead so we can loop them in?');
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer shrink-0 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        : 'bg-[#071F1C] border-[rgba(169,191,165,0.2)] text-[#E8E9D8] hover:bg-[#0B2522]'
                    }`}
                  >
                    Ask for Tech Lead
                  </button>
                </div>

                {/* Input Composer Box */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      placeholder={`Reply to ${currentConvo.name}... (Press Enter to send)`}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendReply();
                      }}
                      className={`w-full text-xs px-3 py-2 pr-9 rounded-lg border focus:outline-none transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-600 shadow-xs'
                          : 'bg-[#071F1C] border-[rgba(169,191,165,0.25)] text-white placeholder-[#A9BFA5]/50 focus:border-teal-400'
                      }`}
                    />
                    <button
                      type="button"
                      title="Attach file"
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendReply()}
                    disabled={!replyInput.trim()}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40 flex items-center space-x-1.5 shrink-0 shadow-xs"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status Bar */}
                <div className={`flex items-center justify-between text-[11px] font-medium pt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-[#A9BFA5]/70'
                }`}>
                  <span className="flex items-center space-x-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      currentConvo.aiAlert?.isPaused ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span>
                      Direct agent reply · {currentConvo.aiAlert?.isPaused ? 'AI paused' : 'AI ready'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleHandBack}
                    className="text-teal-600 dark:text-emerald-400 hover:underline cursor-pointer font-semibold"
                  >
                    Hand back to AI
                  </button>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400 dark:text-[#A9BFA5]/60">
              Select a conversation to start messaging.
            </div>
          )}

        </div>

        {/* ========================================================
            AREA 3: PROSPECT DETAILS (~300px WIDE, COLLAPSIBLE)
           ======================================================== */}
        {showLeadPanel && currentConvo && (
          <div className={`${
            mobileView === 'details' ? 'flex' : 'hidden lg:flex'
          } w-full lg:w-[300px] xl:w-[320px] shrink-0 h-full min-h-0 border-t lg:border-t-0 lg:border-l flex flex-col overflow-hidden transition-colors ${
            isLight
              ? 'bg-slate-50/50 border-slate-200/90'
              : 'bg-[#051614] border-[rgba(169,191,165,0.18)]'
          }`}>
            
            {/* Scrollable Dossier Content */}
            <div className="p-4 space-y-3.5 flex-1 min-h-0 overflow-y-auto pb-6">
              
              {/* Header with Title and Mobile Back / Desktop Close */}
              <div className={`flex items-center justify-between border-b pb-2.5 shrink-0 ${
                isLight ? 'border-slate-200/80' : 'border-[rgba(169,191,165,0.12)]'
              }`}>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setMobileView('chat')}
                    className="lg:hidden p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer mr-0.5"
                    title="Back to chat"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-slate-700' : 'text-[#A9BFA5]'
                  }`}>
                    Prospect Details
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Synced</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLeadPanel(false)}
                    className="hidden lg:block text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer ml-1"
                    title="Collapse details panel"
                  >
                    <PanelRightClose className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Profile Card */}
              <div className={`p-3 rounded-lg border space-y-2 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#071C1A] border-[rgba(169,191,165,0.12)]'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-sm font-bold leading-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {currentConvo.name}
                    </h3>
                    <p className={`text-xs mt-0.5 ${
                      isLight ? 'text-slate-500' : 'text-[#A9BFA5]'
                    }`}>
                      {currentConvo.company} · {currentConvo.location}
                    </p>
                  </div>
                  {/* Lead Score pill colored green/yellow/red */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border tabular-nums ${getScoreBadge(currentConvo.score).bg}`}>
                    Score {currentConvo.score}
                  </span>
                </div>

                {/* Pipeline Stage Dropdown */}
                <div className={`flex items-center justify-between pt-2 border-t ${
                  isLight ? 'border-slate-100' : 'border-[rgba(169,191,165,0.08)]'
                }`}>
                  <span className={`text-[11px] font-medium ${
                    isLight ? 'text-slate-500' : 'text-[#A9BFA5]/70'
                  }`}>
                    Pipeline Stage:
                  </span>
                  <div className="relative">
                    <select
                      value={currentConvo.stage}
                      onChange={(e) => handleStageChange(e.target.value)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer pr-5 appearance-none font-medium ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-600'
                          : 'bg-[#041210] border-[rgba(169,191,165,0.25)] text-[#E8E9D8]'
                      }`}
                    >
                      <option value="New">New</option>
                      <option value="Engaged">Engaged</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                    <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Deal Signals: Budget & Timeline */}
              <div className={`p-3 rounded-lg border space-y-2 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#071C1A] border-[rgba(169,191,165,0.12)]'
              }`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                  isLight ? 'text-slate-400' : 'text-[#A9BFA5]/60'
                }`}>
                  Deal Parameters
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded-md border ${
                    isLight
                      ? 'bg-slate-50 border-slate-100'
                      : 'bg-[#041210] border-[rgba(169,191,165,0.08)]'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-[#A9BFA5]/60 block font-medium">Budget</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentConvo.qualification.budget}</span>
                  </div>
                  <div className={`p-2 rounded-md border ${
                    isLight
                      ? 'bg-slate-50 border-slate-100'
                      : 'bg-[#041210] border-[rgba(169,191,165,0.08)]'
                  }`}>
                    <span className="text-[10px] text-slate-400 dark:text-[#A9BFA5]/60 block font-medium">Timeline</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentConvo.qualification.timeline}</span>
                  </div>
                </div>
              </div>

              {/* AI Qualification Checklist */}
              <div className={`p-3 rounded-lg border space-y-2 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#071C1A] border-[rgba(169,191,165,0.12)]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                    isLight ? 'text-slate-400' : 'text-[#A9BFA5]/60'
                  }`}>
                    Qualification Criteria
                  </span>
                  <span className={`text-[11px] font-semibold tabular-nums ${
                    [currentConvo.qualification.requirement, Boolean(currentConvo.qualification.budget), Boolean(currentConvo.qualification.timeline), currentConvo.qualification.decisionMaker].filter(Boolean).length === 4
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {[currentConvo.qualification.requirement, Boolean(currentConvo.qualification.budget), Boolean(currentConvo.qualification.timeline), currentConvo.qualification.decisionMaker].filter(Boolean).length}/4 Verified
                  </span>
                </div>
                
                <div className="space-y-1.5 text-xs">
                  <div className={`flex items-center space-x-2 ${
                    currentConvo.qualification.requirement
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-400 dark:text-[#A9BFA5]/60'
                  }`}>
                    {currentConvo.qualification.requirement ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-[rgba(169,191,165,0.3)] inline-block shrink-0" />
                    )}
                    <span>Clear requirement identified</span>
                  </div>

                  <div className={`flex items-center space-x-2 ${
                    currentConvo.qualification.budget
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-400 dark:text-[#A9BFA5]/60'
                  }`}>
                    {currentConvo.qualification.budget ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-[rgba(169,191,165,0.3)] inline-block shrink-0" />
                    )}
                    <span>Budget confirmed ({currentConvo.qualification.budget})</span>
                  </div>

                  <div className={`flex items-center space-x-2 ${
                    currentConvo.qualification.timeline
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-400 dark:text-[#A9BFA5]/60'
                  }`}>
                    {currentConvo.qualification.timeline ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-[rgba(169,191,165,0.3)] inline-block shrink-0" />
                    )}
                    <span>Timeline within {currentConvo.qualification.timeline}</span>
                  </div>

                  <div className={`flex items-center space-x-2 ${
                    currentConvo.qualification.decisionMaker
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-400 dark:text-[#A9BFA5]/60'
                  }`}>
                    {currentConvo.qualification.decisionMaker ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-[rgba(169,191,165,0.3)] inline-block shrink-0" />
                    )}
                    <span>Direct decision maker status</span>
                  </div>
                </div>
              </div>

              {/* Next Recommended Step */}
              <div className={`p-3 rounded-lg border space-y-1 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#071C1A] border-[rgba(169,191,165,0.12)]'
              }`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                  isLight ? 'text-slate-400' : 'text-[#A9BFA5]/60'
                }`}>
                  Recommended Action
                </span>
                <p className={`text-xs font-semibold capitalize ${
                  isLight ? 'text-slate-800' : 'text-[#E8E9D8]'
                }`}>
                  {currentConvo.nextAction}
                </p>
                <p className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-[#A9BFA5]/60'
                }`}>
                  Assigned agent: {currentConvo.assignedTo}
                </p>
              </div>

            </div>

            {/* Action Buttons at bottom of dossier */}
            <div className={`p-3.5 border-t space-y-2 shrink-0 ${
              isLight
                ? 'bg-white border-slate-200/90'
                : 'bg-[#051614] border-[rgba(169,191,165,0.12)]'
            }`}>
              <button
                type="button"
                onClick={handleOpenLead}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5 shadow-xs text-xs"
              >
                <span>Open Lead Profile</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNotify) onNotify('Follow-up Scheduled', `Follow-up task created for ${currentConvo.name}.`);
                }}
                className={`w-full py-2 rounded-lg border font-medium transition-colors cursor-pointer text-center text-xs ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-[#041210] hover:bg-[#071C1A] text-[#A9BFA5] hover:text-[#E8E9D8] border-[rgba(169,191,165,0.2)]'
                }`}
              >
                Schedule Follow-up
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
