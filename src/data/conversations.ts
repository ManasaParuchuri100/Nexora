import { useSyncExternalStore } from 'react';

export interface ConversationItem {
  id: string;
  name: string;
  company: string;
  location: string;
  time: string;
  timestampRaw?: number;
  channel: 'WhatsApp' | 'Instagram' | 'LinkedIn' | 'Website';
  status: 'needs_you' | 'ai_handling' | 'waiting_on_customer' | 'closed';
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

export function createInitialConversations(): ConversationItem[] {
  return [
    // 1. Rahul Sharma - Asked for Pricing & Waiting for Human (Aster Labs)
    {
      id: 'convo-rahul',
      name: 'Rahul Sharma',
      company: 'Aster Labs',
      location: 'Pune',
      time: '4m',
      timestampRaw: Date.now() - 4 * 60 * 1000,
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
      timestampRaw: Date.now() - 15 * 60 * 1000,
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
      time: '2h',
      timestampRaw: Date.now() - 120 * 60 * 1000,
      channel: 'WhatsApp',
      status: 'needs_you',
      isOverdueFollowUp: true,
      overdueText: '3 days overdue',
      waitingForHuman: true,
      snippet: 'Proposal sent Friday; overdue follow-up on bespoke studio integration.',
      stage: 'Proposal',
      score: 95,
      temperature: 'HOT',
      intelPill: 'Nordic Design · 3d Overdue Follow-up',
      whyPoints: ['+ 3 days overdue on proposal follow-up', '+ enterprise budget €12k', '+ founder reviewed proposal'],
      qualification: {
        requirement: true,
        budget: '€12,000',
        timeline: '14 days',
        decisionMaker: true
      },
      nextAction: 'ping Elena regarding tailored proposal feedback',
      aiAlert: {
        isPaused: true,
        reason: 'AI paused: overdue follow-up on customized commercial contract.',
        confidence: 'high'
      },
      messages: [
        {
          id: 'm-e1',
          sender: 'agent',
          senderName: 'You',
          text: 'Hi Elena, I sent over the updated Nordic Space workflow proposal on Friday. Did you get a chance to review?',
          time: 'Friday 4:30 PM'
        },
        {
          id: 'm-e2',
          sender: 'customer',
          senderName: 'Elena',
          text: 'Hi! Yes, reviewing with our CFO this afternoon. Can we talk at 3 PM CET?',
          time: '12:05 PM'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-elena'
    },

    // 4. Marcus Vance - Ready to Book Call (Apex Velocity)
    {
      id: 'convo-marcus',
      name: 'Marcus Vance',
      company: 'Apex Velocity',
      location: 'Singapore',
      time: '35m',
      timestampRaw: Date.now() - 35 * 60 * 1000,
      channel: 'LinkedIn',
      status: 'needs_you',
      readyToBookCall: true,
      snippet: 'Ready to book: Requested demo slot for engineering team of 18.',
      stage: 'Engaged',
      score: 87,
      temperature: 'HOT',
      intelPill: 'Apex Velocity · Ready to Book Demo',
      whyPoints: ['+ confirmed engineering budget $10k', '+ ready to schedule walkthrough', '+ 18 engineers'],
      qualification: {
        requirement: true,
        budget: '$10,000/mo',
        timeline: 'Immediate',
        decisionMaker: true
      },
      nextAction: 'send calendar booking link',
      aiAlert: {
        isPaused: true,
        reason: 'Prospect ready to book: clinical lead requested calendar booking.',
        confidence: 'high'
      },
      messages: [
        {
          id: 'm-m1',
          sender: 'customer',
          senderName: 'Marcus',
          text: 'Hi team, our engineering managers checked your system and want a tailored 20-min live demo.',
          time: '1:12 PM'
        },
        {
          id: 'm-m2',
          sender: 'ai',
          senderName: 'AI',
          text: 'Delighted to hear that Marcus! We have slots open today and tomorrow afternoon.',
          time: '1:14 PM'
        },
        {
          id: 'm-m3',
          sender: 'customer',
          senderName: 'Marcus',
          text: 'Great, please drop your calendar link here and I will book 3 PM.',
          time: '1:25 PM'
        }
      ],
      assignedTo: 'Priya — AE',
      leadReferenceId: 'lead-marcus'
    },

    // 5. Dr. Ananya Sen - Overdue Follow-up (Nura Wellness)
    {
      id: 'convo-ananya',
      name: 'Dr. Ananya Sen',
      company: 'Nura Wellness',
      location: 'Bengaluru',
      time: '1d',
      timestampRaw: Date.now() - 24 * 60 * 60 * 1000,
      channel: 'WhatsApp',
      status: 'needs_you',
      isOverdueFollowUp: true,
      overdueText: '2 days overdue',
      snippet: 'Pending HIPAA & Indian DPDP compliance verification check.',
      stage: 'Engaged',
      score: 79,
      temperature: 'WARM',
      intelPill: 'Nura Wellness · 2d Overdue',
      whyPoints: ['+ clinical compliance questions', '+ 2 clinics in Bengaluru', '+ timeline Q4 rollout'],
      qualification: {
        requirement: true,
        budget: '₹3L',
        timeline: '45 days',
        decisionMaker: false
      },
      nextAction: 'share DPDP compliance certificate & security whitepaper',
      aiAlert: {
        isPaused: true,
        reason: 'Compliance qualification requires certified officer sign-off.',
        confidence: 'medium'
      },
      messages: [
        {
          id: 'm-a1',
          sender: 'customer',
          senderName: 'Dr. Ananya',
          text: 'Hello. Does your WhatsApp automation comply with Indian DPDP Act standards for medical clinics?',
          time: 'Yesterday'
        }
      ],
      assignedTo: 'Sarah — Solutions',
      leadReferenceId: 'lead-ananya'
    },

    // 6. Vikram Mehta - AI Handling (Mehta FinTech)
    {
      id: 'convo-vikram',
      name: 'Vikram Mehta',
      company: 'Mehta FinTech',
      location: 'Mumbai',
      time: '1h',
      timestampRaw: Date.now() - 60 * 60 * 1000,
      channel: 'WhatsApp',
      status: 'ai_handling',
      snippet: 'AI qualified prospect: ₹10L budget, 60 days timeline, founder lead.',
      stage: 'Qualified',
      score: 94,
      temperature: 'HOT',
      intelPill: 'Mehta FinTech · AI Automated Qualification',
      whyPoints: ['+ verified founder', '+ ₹10L budget stated', '+ automated qualification complete'],
      qualification: {
        requirement: true,
        budget: '₹10L',
        timeline: '60 days',
        decisionMaker: true
      },
      nextAction: 'prepare executive walkthrough for next week',
      aiAlert: undefined,
      messages: [
        {
          id: 'm-v1',
          sender: 'customer',
          senderName: 'Vikram',
          text: 'Hi, we are building a private wealth advisory and need quiet CRM tools.',
          time: '12:30 PM'
        },
        {
          id: 'm-v2',
          sender: 'ai',
          senderName: 'AI',
          text: 'Welcome Vikram! We serve leading boutique wealth firms. What team size are you planning for?',
          time: '12:31 PM'
        },
        {
          id: 'm-v3',
          sender: 'customer',
          senderName: 'Vikram',
          text: 'Around 25 advisors across Mumbai and Surat.',
          time: '12:35 PM'
        },
        {
          id: 'm-v4',
          sender: 'ai',
          senderName: 'AI',
          text: 'Perfect. Our Enterprise tier includes end-to-end data residency in Mumbai. I have noted this on your file.',
          time: '12:36 PM'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-vikram'
    },

    // 7. Priya Nair - AI Handling (Studio Form & Light)
    {
      id: 'convo-priya',
      name: 'Priya Nair',
      company: 'Studio Form & Light',
      location: 'Kochi',
      time: '3h',
      timestampRaw: Date.now() - 180 * 60 * 1000,
      channel: 'Instagram',
      status: 'ai_handling',
      snippet: 'AI answered portfolio syndication queries; scheduled follow-up for Tuesday.',
      stage: 'Contacted',
      score: 84,
      temperature: 'WARM',
      intelPill: 'Form & Light · Instagram Inquiry',
      whyPoints: ['+ architectural studio lead', '+ interested in asset syndication', '+ responsive to AI'],
      qualification: {
        requirement: true,
        budget: '₹2.5L',
        timeline: '30 days',
        decisionMaker: true
      },
      nextAction: 'automated follow-up Tuesday 10 AM',
      aiAlert: undefined,
      messages: [
        {
          id: 'm-p1',
          sender: 'customer',
          senderName: 'Priya',
          text: 'Hey! Loved your recent post about quiet aesthetics. How does your studio sync work?',
          time: '10:05 AM'
        },
        {
          id: 'm-p2',
          sender: 'ai',
          senderName: 'AI',
          text: 'Hello Priya! We sync your creative assets across Instagram, LinkedIn, and WhatsApp without manual export steps.',
          time: '10:07 AM'
        }
      ],
      assignedTo: 'Sarah — Solutions',
      leadReferenceId: 'lead-priya'
    },

    // 8. Carlos Mendes - Closed / Resolved (Iberia Mobility)
    {
      id: 'convo-carlos',
      name: 'Carlos Mendes',
      company: 'Iberia Mobility',
      location: 'Madrid',
      time: '1d',
      timestampRaw: Date.now() - 26 * 60 * 60 * 1000,
      channel: 'Website',
      status: 'closed',
      snippet: 'Contract executed: Signed 12-month enterprise subscription.',
      stage: 'Won',
      score: 98,
      temperature: 'HOT',
      intelPill: 'Iberia Mobility · Deal Closed',
      whyPoints: ['+ annual contract signed', '+ €18,000 ARR', '+ onboarded via European datacenter'],
      qualification: {
        requirement: true,
        budget: '€18,000/yr',
        timeline: 'Closed',
        decisionMaker: true
      },
      nextAction: 'hand off to Customer Success team',
      aiAlert: undefined,
      messages: [
        {
          id: 'm-c1',
          sender: 'customer',
          senderName: 'Carlos',
          text: 'Docusign completed and countersigned. Looking forward to kick-off!',
          time: 'Yesterday 5:20 PM'
        },
        {
          id: 'm-c2',
          sender: 'agent',
          senderName: 'You',
          text: 'Thank you Carlos! Your onboarding engineer will reach out at 10:00 AM CET.',
          time: 'Yesterday 5:25 PM'
        }
      ],
      assignedTo: 'Rahul — Sales',
      leadReferenceId: 'lead-carlos'
    },

    // 9. Sophie Dubois - Closed / Resolved (Lumière Atelier)
    {
      id: 'convo-sophie',
      name: 'Sophie Dubois',
      company: 'Lumière Atelier',
      location: 'Paris',
      time: '3d',
      timestampRaw: Date.now() - 72 * 60 * 60 * 1000,
      channel: 'Instagram',
      status: 'closed',
      snippet: 'Resolved: Self-served starter plan through web checkout.',
      stage: 'Won',
      score: 82,
      temperature: 'WARM',
      intelPill: 'Lumière Atelier · Starter Checkout',
      whyPoints: ['+ self-serve starter checkout', '+ €450/mo active', '+ automated onboarding email sent'],
      qualification: {
        requirement: true,
        budget: '€450/mo',
        timeline: 'Closed',
        decisionMaker: true
      },
      nextAction: 'monitor 30-day usage health',
      aiAlert: undefined,
      messages: [
        {
          id: 'm-s1',
          sender: 'customer',
          senderName: 'Sophie',
          text: 'Thank you for answering my questions earlier. Upgraded through your link!',
          time: 'Oct 14'
        }
      ],
      assignedTo: 'Priya — AE',
      leadReferenceId: 'lead-sophie'
    },

    // 10. David Chen - AI Handling (Vanguard Architectural Group)
    {
      id: 'convo-david',
      name: 'David Chen',
      company: 'Vanguard Architectural Group',
      location: 'Vancouver',
      time: '4h',
      timestampRaw: Date.now() - 240 * 60 * 1000,
      channel: 'Website',
      status: 'ai_handling',
      snippet: 'AI shared architectural whitepaper and studio case study.',
      stage: 'Qualified',
      score: 91,
      temperature: 'HOT',
      intelPill: 'Vanguard Arch · Whitepaper Shared',
      whyPoints: ['+ downloaded architectural case study', '+ 4 partner studios', '+ budget confirmed $8k/mo'],
      qualification: {
        requirement: true,
        budget: '$8,000/mo',
        timeline: '30 days',
        decisionMaker: true
      },
      nextAction: 'schedule follow-up with partner group',
      aiAlert: undefined,
      messages: [
        {
          id: 'm-j1',
          sender: 'customer',
          senderName: 'David',
          text: 'Hello, our architecture team is reviewing quiet CRM workflows for our studio.',
          time: '9:45 AM'
        },
        {
          id: 'm-j2',
          sender: 'ai',
          senderName: 'AI',
          text: 'Welcome David! We specialize in low-latency asset syndication and client portal generation.',
          time: '9:47 AM'
        },
        {
          id: 'm-j3',
          sender: 'customer',
          senderName: 'David',
          text: 'Thanks, that documentation helps. Let me circle back with our technical lead.',
          time: '9:50 AM'
        }
      ],
      assignedTo: 'Sarah — Solutions',
      leadReferenceId: 'lead-vanguard'
    }
  ];
}

// Global external store
let conversationsStore: ConversationItem[] = createInitialConversations();
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function setGlobalConversations(
  updater: ConversationItem[] | ((prev: ConversationItem[]) => ConversationItem[])
) {
  if (typeof updater === 'function') {
    conversationsStore = updater(conversationsStore);
  } else {
    conversationsStore = updater;
  }
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ConversationItem[] {
  return conversationsStore;
}

export function useConversations(): [
  ConversationItem[],
  (updater: ConversationItem[] | ((prev: ConversationItem[]) => ConversationItem[])) => void
] {
  const conversations = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [conversations, setGlobalConversations];
}

export interface InboxCounts {
  needsYou: number;
  waitingForHuman: number;
  oldestWaitingMinutes: number;
  overdueFollowUps: number;
  oldestOverdueDays: number;
  askedForPricing: number;
  readyToBook: number;
}

export function computeInboxCounts(conversations: ConversationItem[] = conversationsStore): InboxCounts {
  // Closed conversations never count
  const active = conversations.filter(c => c.status !== 'closed');

  const needsYou = active.filter(c => c.status === 'needs_you').length;
  const waitingForHumanList = active.filter(c => Boolean(c.waitingForHuman));
  const waitingForHuman = waitingForHumanList.length;

  let oldestWaitingMinutes = 0;
  if (waitingForHumanList.length > 0) {
    const now = Date.now();
    const timestamps = waitingForHumanList
      .map(c => c.timestampRaw || now)
      .filter(t => t > 0);
    if (timestamps.length > 0) {
      const minTimestamp = Math.min(...timestamps);
      oldestWaitingMinutes = Math.max(1, Math.round((now - minTimestamp) / 60000));
    } else {
      oldestWaitingMinutes = 18;
    }
  }

  const overdueList = active.filter(c => Boolean(c.isOverdueFollowUp));
  const overdueFollowUps = overdueList.length;

  let oldestOverdueDays = 0;
  if (overdueList.length > 0) {
    const days = overdueList.map(c => {
      const match = c.overdueText?.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 1;
    });
    oldestOverdueDays = Math.max(1, ...days);
  }

  const askedForPricing = active.filter(c => Boolean(c.askedForPricing)).length;
  const readyToBook = active.filter(c => Boolean(c.readyToBookCall)).length;

  return {
    needsYou,
    waitingForHuman,
    oldestWaitingMinutes,
    overdueFollowUps,
    oldestOverdueDays,
    askedForPricing,
    readyToBook
  };
}

export function useInboxCounts(): InboxCounts {
  const [conversations] = useConversations();
  return computeInboxCounts(conversations);
}

export function getTopPricingConversation(
  conversations: ConversationItem[] = conversationsStore
): ConversationItem | undefined {
  return conversations
    .filter(c => c.status !== 'closed' && c.askedForPricing)
    .sort((a, b) => b.score - a.score)[0];
}
