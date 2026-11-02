import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  AlertTriangle, 
  Sparkles, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  X, 
  Phone, 
  Globe, 
  Building2, 
  Share2, 
  CreditCard,
  Check,
  MessageSquare,
  FileText,
  UserCheck,
  Megaphone
} from 'lucide-react';
import { StatMetric, Lead, Campaign, TrendingTopic, NavCategory, SubCategory } from '../../types';
import { useInboxCounts, getTopPricingConversation } from '../../data/conversations';
import { useFollowUpCounts } from '../../data/followUps';
import { BRAND_NAME } from '../../config/brand';
import DateRangeCalendarModal, { DateRangeSelection } from './DateRangeCalendarModal';
import { 
  Button, 
  Card, 
  CardHeader, 
  Badge, 
  SegmentedControl, 
  StatCard, 
  ProgressBar, 
  EmptyState, 
  PageHeader,
  ChannelLogo,
  BRAND_COLORS,
  ChannelBrand
} from '../ui';

interface OverviewViewProps {
  metrics: StatMetric[];
  leads: Lead[];
  campaigns: Campaign[];
  trendingTopics: TrendingTopic[];
  onNavigate: (category: NavCategory, subCategory?: SubCategory) => void;
  onSelectLead: (lead: Lead) => void;
  onTriggerQuickAction?: (action: 'campaign' | 'content' | 'lead' | 'schedule') => void;
  isFirstRun?: boolean;
  userName?: string;
}

interface ActivityItem {
  id: string;
  timestamp: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  description: string;
  relativeTime: string;
  score?: number;
  category: NavCategory;
  subCategory?: SubCategory;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const getDefaultCustomRange = (): DateRangeSelection => {
  const now = new Date();
  const past5Weeks = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
  return {
    startDate: formatDateISO(past5Weeks),
    endDate: formatDateISO(now),
    sortBasis: 'newest'
  };
};

function getDayGroup(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  
  if (d.toDateString() === now.toDateString()) return 'Today';
  
  const yesterday = new Date(now.getTime() - 86400 * 1000);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function OverviewView({
  leads,
  onNavigate,
  onSelectLead,
  onTriggerQuickAction,
  isFirstRun = false,
  userName = 'Alex'
}: OverviewViewProps) {
  const inboxCounts = useInboxCounts();
  const followUpCounts = useFollowUpCounts();
  const topPricing = getTopPricingConversation();

  // Date filters: Today, 7 days, 30 days, Custom
  const [datePreset, setDatePreset] = useState<'today' | '7d' | '30d' | 'custom'>('7d');
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DateRangeSelection>(getDefaultCustomRange);

  // First name greeting
  const firstName = userName ? userName.trim().split(/\s+/)[0] : 'there';
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${firstName}`;
    if (hour < 17) return `Good afternoon, ${firstName}`;
    return `Good evening, ${firstName}`;
  };

  // Header Subtitle derived from inbox counts
  const subtitle = inboxCounts.needsYou > 0
    ? `${inboxCounts.needsYou} conversation${inboxCounts.needsYou === 1 ? '' : 's'} need you today.`
    : "You're all caught up.";

  const handleApplyCalendarSelection = (selection: DateRangeSelection) => {
    setCustomRange(selection);
    setDatePreset('custom');
  };

  // Demo activities relative to Date.now()
  const demoActivities = useMemo<ActivityItem[]>(() => {
    const now = Date.now();
    return [
      {
        id: 'act-1',
        timestamp: now - 3 * 60 * 1000,
        icon: UserCheck,
        iconBg: 'bg-ok-soft text-ok',
        description: 'New WhatsApp lead · Rahul Sharma',
        relativeTime: '3m ago',
        score: 92,
        category: 'leads',
        subCategory: 'all-leads'
      },
      {
        id: 'act-2',
        timestamp: now - 18 * 60 * 1000,
        icon: Sparkles,
        iconBg: 'bg-brand-soft text-brand',
        description: 'Qualified as Hot · Aster Labs',
        relativeTime: '18m ago',
        score: 92,
        category: 'leads',
        subCategory: 'all-leads'
      },
      {
        id: 'act-3',
        timestamp: now - 42 * 60 * 1000,
        icon: MessageSquare,
        iconBg: 'bg-warn-soft text-warn',
        description: 'Handoff requested · John Carter · Instagram',
        relativeTime: '42m ago',
        category: 'inbox',
        subCategory: 'inbox'
      },
      {
        id: 'act-4',
        timestamp: now - 3 * 3600 * 1000,
        icon: CalendarIcon,
        iconBg: 'bg-info-soft text-info',
        description: 'Demo call scheduled · Marcus Vance',
        relativeTime: '3h ago',
        score: 87,
        category: 'leads',
        subCategory: 'pipeline'
      },
      {
        id: 'act-5',
        timestamp: now - 22 * 3600 * 1000,
        icon: FileText,
        iconBg: 'bg-brand-soft text-brand',
        description: 'Proposal Dispatched · Meridian Health · ₹6.5L',
        relativeTime: 'Yesterday',
        score: 88,
        category: 'leads',
        subCategory: 'pipeline'
      },
      {
        id: 'act-6',
        timestamp: now - 28 * 3600 * 1000,
        icon: MessageSquare,
        iconBg: 'bg-danger-soft text-danger',
        description: 'Low-intent inquiry disqualified · Inactive profile',
        relativeTime: 'Yesterday',
        category: 'inbox',
        subCategory: 'inbox'
      },
      {
        id: 'act-7',
        timestamp: now - 3 * 86400 * 1000,
        icon: Megaphone,
        iconBg: 'bg-brand-soft text-brand',
        description: 'Multichannel campaign launched · Autumn Studio Push',
        relativeTime: '3d ago',
        category: 'campaigns',
        subCategory: 'campaign-list'
      },
      {
        id: 'act-8',
        timestamp: now - 5 * 86400 * 1000,
        icon: CheckCircle2,
        iconBg: 'bg-ok-soft text-ok',
        description: 'Deal Closed & Won · Apex Architectures (₹4.8L)',
        relativeTime: '5d ago',
        score: 100,
        category: 'leads',
        subCategory: 'pipeline'
      },
      {
        id: 'act-9',
        timestamp: now - 8 * 86400 * 1000,
        icon: AlertTriangle,
        iconBg: 'bg-warn-soft text-warn',
        description: 'Cold lead flagged · Budget below threshold',
        relativeTime: '8d ago',
        score: 35,
        category: 'leads',
        subCategory: 'all-leads'
      },
      {
        id: 'act-10',
        timestamp: now - 14 * 86400 * 1000,
        icon: Phone,
        iconBg: 'bg-info-soft text-info',
        description: 'Discovery Call completed · BlueSky Design Studio',
        relativeTime: '14d ago',
        score: 75,
        category: 'leads',
        subCategory: 'pipeline'
      },
      {
        id: 'act-11',
        timestamp: now - 22 * 86400 * 1000,
        icon: Sparkles,
        iconBg: 'bg-brand-soft text-brand',
        description: 'Instagram ad campaign generated 24 new qualified leads',
        relativeTime: '22d ago',
        category: 'analytics',
        subCategory: 'overview'
      },
      {
        id: 'act-12',
        timestamp: now - 29 * 86400 * 1000,
        icon: CheckCircle2,
        iconBg: 'bg-ok-soft text-ok',
        description: 'Contract signed · UrbanLiving Studio ($18,500)',
        relativeTime: '29d ago',
        score: 95,
        category: 'leads',
        subCategory: 'pipeline'
      }
    ];
  }, []);

  // Filter activities based on datePreset
  const filteredActivities = useMemo(() => {
    const now = Date.now();
    return demoActivities.filter((act) => {
      if (datePreset === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        return act.timestamp >= startOfDay.getTime();
      }
      if (datePreset === '7d') {
        return act.timestamp >= now - 7 * 86400 * 1000;
      }
      if (datePreset === '30d') {
        return act.timestamp >= now - 30 * 86400 * 1000;
      }
      if (datePreset === 'custom') {
        const startMs = new Date(`${customRange.startDate}T00:00:00`).getTime();
        const endMs = new Date(`${customRange.endDate}T23:59:59`).getTime();
        return act.timestamp >= startMs && act.timestamp <= endMs;
      }
      return true;
    });
  }, [demoActivities, datePreset, customRange]);

  // Group filtered activities by day
  const groupedActivities = useMemo(() => {
    const map = new Map<string, ActivityItem[]>();
    for (const act of filteredActivities) {
      const group = getDayGroup(act.timestamp);
      const list = map.get(group) || [];
      list.push(act);
      map.set(group, list);
    }
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
  }, [filteredActivities]);

  // Dynamic KPI stats scaled by date window
  const stats = useMemo(() => {
    let periodText = 'vs previous 7 days';
    let newCurrent = 28;
    let newPrev = 24;
    let qualCurrent = 11;
    let qualPrev = 9;
    let followCurrent = 7;
    let followPrev = 8;
    let wonCurrent = 4;
    let wonPrev = 3;

    if (datePreset === 'today') {
      periodText = 'vs yesterday';
      newCurrent = 4;
      newPrev = 3;
      qualCurrent = 2;
      qualPrev = 1;
      followCurrent = 2;
      followPrev = 2;
      wonCurrent = 1;
      wonPrev = 0;
    } else if (datePreset === '7d') {
      periodText = 'vs previous 7 days';
      newCurrent = 28;
      newPrev = 24;
      qualCurrent = 11;
      qualPrev = 9;
      followCurrent = 7;
      followPrev = 8;
      wonCurrent = 4;
      wonPrev = 3;
    } else if (datePreset === '30d') {
      periodText = 'vs previous 30 days';
      newCurrent = 114;
      newPrev = 92;
      qualCurrent = 48;
      qualPrev = 40;
      followCurrent = 19;
      followPrev = 22;
      wonCurrent = 16;
      wonPrev = 12;
    } else if (datePreset === 'custom') {
      periodText = 'vs previous period';
      const s = new Date(customRange.startDate).getTime();
      const e = new Date(customRange.endDate).getTime();
      const days = Math.max(1, Math.round((e - s) / (86400 * 1000)) + 1);
      newCurrent = Math.max(2, Math.round(days * 3.7));
      newPrev = Math.max(1, Math.round(days * 3.1));
      qualCurrent = Math.max(1, Math.round(newCurrent * 0.41));
      qualPrev = Math.max(1, Math.round(newPrev * 0.38));
      followCurrent = Math.max(1, Math.round(newCurrent * 0.22));
      followPrev = Math.max(1, Math.round(newPrev * 0.25));
      wonCurrent = Math.max(1, Math.round(newCurrent * 0.14));
      wonPrev = Math.max(1, Math.round(newPrev * 0.12));
    }

    const calcDelta = (curr: number, prev: number) => {
      if (prev === 0) {
        return { value: '100%', trend: 'up' as const };
      }
      const pct = Math.round(((curr - prev) / prev) * 100);
      return {
        value: `${Math.abs(pct)}%`,
        trend: pct >= 0 ? ('up' as const) : ('down' as const)
      };
    };

    const engagedLeads = Math.max(1, Math.round(newCurrent * 0.63));

    return {
      periodText,
      newLeads: newCurrent,
      newDelta: calcDelta(newCurrent, newPrev),
      qualifiedLeads: qualCurrent,
      qualDelta: calcDelta(qualCurrent, qualPrev),
      followUps: followCurrent,
      followDelta: calcDelta(followCurrent, followPrev),
      wonLeads: wonCurrent,
      wonDelta: calcDelta(wonCurrent, wonPrev),
      engagedLeads
    };
  }, [datePreset, customRange]);

  // Needs you rows configuration
  const needsYouRows = [
    {
      id: 'needs-you-row-1',
      show: inboxCounts.waitingForHuman > 0,
      title: `${inboxCounts.waitingForHuman} conversation${inboxCounts.waitingForHuman === 1 ? '' : 's'} waiting for a person`,
      detail: `Longest wait: ${inboxCounts.oldestWaitingMinutes >= 60 ? `${Math.floor(inboxCounts.oldestWaitingMinutes / 60)} h` : `${inboxCounts.oldestWaitingMinutes}m`}`,
      icon: Clock,
      iconBg: 'bg-danger-soft text-danger',
      onClick: () => onNavigate('inbox', 'waiting-human')
    },
    {
      id: 'needs-you-row-2',
      show: followUpCounts.overdue > 0,
      title: `${followUpCounts.overdue} follow-up${followUpCounts.overdue === 1 ? '' : 's'} overdue`,
      detail: `Oldest is ${followUpCounts.oldestOverdueDays} day${followUpCounts.oldestOverdueDays === 1 ? '' : 's'} overdue`,
      icon: AlertTriangle,
      iconBg: 'bg-warn-soft text-warn',
      onClick: () => onNavigate('leads', 'follow-ups')
    },
    {
      id: 'needs-you-row-3',
      show: inboxCounts.askedForPricing > 0,
      title: `${inboxCounts.askedForPricing} lead${inboxCounts.askedForPricing === 1 ? '' : 's'} asked about pricing`,
      detail: 'Awaiting commercial rate card or custom quote',
      icon: CreditCard,
      iconBg: 'bg-brand-soft text-brand',
      onClick: () => onNavigate('inbox', 'asked-pricing')
    },
    {
      id: 'needs-you-row-4',
      show: inboxCounts.readyToBook > 0,
      title: `${inboxCounts.readyToBook} lead${inboxCounts.readyToBook === 1 ? '' : 's'} ready to book a call`,
      detail: 'High intent prospect requested live demo calendar link',
      icon: CalendarIcon,
      iconBg: 'bg-ok-soft text-ok',
      onClick: () => onNavigate('inbox', 'ready-to-book')
    }
  ].filter(r => r.show);

  const isSuggestionVisible = Boolean(topPricing && showRecommendation);

  const rangeLabel =
    datePreset === 'today'
      ? 'Today'
      : datePreset === '7d'
      ? 'Last 7 days'
      : datePreset === '30d'
      ? 'Last 30 days'
      : `${customRange.startDate.slice(5)} – ${customRange.endDate.slice(5)}`;

  const contacted = Math.max(stats.wonLeads + 1, Math.round(stats.qualifiedLeads * 0.62));
  const journey: Array<[string, number]> = [
    ['New', stats.newLeads],
    ['Engaged', stats.engagedLeads],
    ['Qualified', stats.qualifiedLeads],
    ['Contacted', contacted],
    ['Won', stats.wonLeads],
  ];

  // Lead volume and qualification rate by source
  const channels: Array<{ brand: ChannelBrand; name: string; share: number; qualified: number }> = [
    { brand: 'whatsapp', name: 'WhatsApp', share: 48, qualified: 43 },
    { brand: 'instagram', name: 'Instagram', share: 31, qualified: 30 },
    { brand: 'website', name: 'Website', share: 14, qualified: 22 },
    { brand: 'linkedin', name: 'LinkedIn', share: 7, qualified: 45 },
  ];
  const maxShare = Math.max(...channels.map(c => c.share));

  const deltaText = (d: { value: string; trend: 'up' | 'down' }) =>
    `${d.trend === 'up' ? '↑' : '↓'} ${d.value} ${stats.periodText}`;

  const metricCards = [
    {
      id: 'metric-new-leads',
      label: 'New leads',
      value: stats.newLeads,
      delta: deltaText(stats.newDelta),
      tone: stats.newDelta.trend === 'up' ? '' : 'down',
      onClick: () => onNavigate('leads', 'all-leads'),
    },
    {
      id: 'metric-qualified',
      label: 'Newly qualified',
      value: stats.qualifiedLeads,
      delta: deltaText(stats.qualDelta),
      tone: stats.qualDelta.trend === 'up' ? '' : 'down',
      onClick: () => onNavigate('leads', 'pipeline'),
    },
    {
      id: 'metric-won',
      label: 'Won deals',
      value: stats.wonLeads,
      delta: deltaText(stats.wonDelta),
      tone: stats.wonDelta.trend === 'up' ? '' : 'down',
      onClick: () => onNavigate('analytics', 'overview'),
    },
    {
      id: 'metric-follow-ups',
      label: 'Follow-ups due',
      value: followUpCounts.open,
      delta: followUpCounts.overdue > 0 ? `${followUpCounts.overdue} overdue` : 'All on track',
      tone: '',
      onClick: () => onNavigate('leads', 'follow-ups'),
    },
  ];

  const rowActionLabels = ['Review conversations', 'Review follow-ups', 'Send pricing', 'Book the call'];
  const rowTone = (iconBg: string) =>
    iconBg.includes('danger') ? 'red' : iconBg.includes('warn') ? 'amber' : iconBg.includes('ok') ? 'green' : '';


  return (
    <div className="select-text text-ink animate-fadeIn">

      {/* Page header */}
      <PageHeader
        eyebrow="Workspace / Overview"
        title={`${getGreeting()}.`}
        subtitle="A clear view of what needs attention and what is driving growth."
        actions={
          <div className="relative flex items-center gap-[9px]">
            {!isFirstRun && <span className="nx-demo">Demo data</span>}
            <button
              type="button"
              id="custom-date-btn"
              className="nx-btn"
              onClick={() => setIsRangeMenuOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={isRangeMenuOpen}
            >
              {rangeLabel} ▾
            </button>
            {isRangeMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-48 bg-surface border border-line rounded-[12px] shadow-pop py-1.5 z-40 animate-fadeIn"
              >
                {([
                  ['today', 'Today'],
                  ['7d', 'Last 7 days'],
                  ['30d', 'Last 30 days'],
                  ['custom', 'Custom range…'],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsRangeMenuOpen(false);
                      if (id === 'custom') {
                        setDatePreset('custom');
                        setIsCalendarOpen(true);
                      } else {
                        setDatePreset(id);
                        setIsCalendarOpen(false);
                      }
                    }}
                    className={`w-full min-h-0! rounded-none! text-left px-3.5 py-2 text-[13px] hover:bg-surface-hover cursor-pointer ${
                      datePreset === id ? 'text-brand font-bold' : 'text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {isFirstRun ? (
        /* First-run: setup checklist */
        <section className="nx-panel nx-pad max-w-[860px]">
          <div className="nx-sectionhead">
            <div>
              <h2>Get started with {BRAND_NAME}</h2>
              <p>Three quick steps to a useful, controlled Engagement Agent.</p>
            </div>
          </div>
          {[
            ['1', 'Connect a channel', 'Link WhatsApp or Instagram to capture enquiries.', 'Connect channel', true, () => onNavigate('settings', 'channels')],
            ['2', 'Add your first lead', 'Import or create a prospect to verify qualification.', 'Add lead', false, () => (onTriggerQuickAction ? onTriggerQuickAction('lead') : onNavigate('leads', 'all-leads'))],
            ['3', 'Invite a teammate', 'Collaborate on hot leads and handoffs in the inbox.', 'Invite teammate', false, () => onNavigate('settings', 'team')],
          ].map(([n, title, desc, cta, primary, go]) => (
            <div key={n as string} className="nx-row">
              <div className="nx-alerticon font-bold">{n as string}</div>
              <div className="flex-1 min-w-0">
                <strong>{title as string}</strong>
                <p>{desc as string}</p>
              </div>
              <button type="button" className={`nx-btn sm ${primary ? 'primary' : ''}`} onClick={go as () => void}>
                {cta as string} →
              </button>
            </div>
          ))}
        </section>
      ) : (
        <div className="grid gap-[17px]">

          {/* Needs your attention */}
          <section className="nx-panel nx-pad">
            <div className="nx-sectionhead">
              <div>
                <h2>Needs your attention</h2>
                <p>Resolve urgent work before reviewing performance.</p>
              </div>
            </div>
            {needsYouRows.length > 0 ? (
              <div className="border-t border-line">
                {needsYouRows.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.id} id={row.id} className="nx-row">
                      <div className={`nx-alerticon ${rowTone(row.iconBg)}`}>
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong>{row.title}</strong>
                        <p className="truncate">{row.detail}</p>
                      </div>
                      <button
                        type="button"
                        className={`nx-btn sm ${i === 0 ? 'primary' : ''}`}
                        onClick={row.onClick}
                      >
                        {rowActionLabels[Number(row.id.slice(-1)) - 1] || 'Review'} →
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="nx-row border-t border-line">
                <div className="nx-alerticon green"><Check className="w-4 h-4" /></div>
                <div className="flex-1">
                  <strong>You're all caught up</strong>
                  <p>No conversations currently need a person.</p>
                </div>
              </div>
            )}
          </section>

          {/* Recommendation */}
          {isSuggestionVisible && topPricing && (
            <div className="nx-insight">
              <div className="nx-spark"><Sparkles className="w-[18px] h-[18px]" /></div>
              <div className="flex-1 min-w-0">
                <span className="eyebrow">{BRAND_NAME} recommends · Needs approval</span>
                <h3>
                  {topPricing.company} asked about pricing and wants to start in {topPricing.qualification?.timeline || '30 days'}
                </h3>
                <p>
                  Next step: {topPricing.nextAction || 'Schedule a discovery call'}. Review the lead and draft before sending anything.
                </p>
                <div className="flex gap-[9px] mt-[13px] flex-wrap">
                  <button
                    type="button"
                    className="nx-btn sm primary"
                    onClick={() => {
                      const match = leads.find(l => l.company.toLowerCase().includes(topPricing.company.toLowerCase()) || l.id === topPricing.leadReferenceId) || leads[0];
                      if (match) onSelectLead(match);
                    }}
                  >
                    Review lead →
                  </button>
                  <button type="button" className="nx-btn sm" onClick={() => onNavigate('inbox', 'asked-pricing')}>
                    Open conversation
                  </button>
                  <button type="button" className="nx-btn sm ghost" onClick={() => setShowRecommendation(false)}>
                    Not now
                  </button>
                </div>
              </div>
              <span className="nx-tag amber hidden sm:inline-flex">High intent</span>
            </div>
          )}

          {/* Metrics */}
          <div className="nx-grid nx-metrics">
            {metricCards.map(m => (
              <button key={m.id} id={m.id} type="button" onClick={m.onClick} className="nx-panel nx-metric min-h-[121px]! rounded-[15px]!">
                <div className="nx-label">{m.label}</div>
                <div className="nx-number tabular-nums">{m.value}</div>
                <div className={`nx-delta ${m.tone}`}>{m.delta}</div>
              </button>
            ))}
          </div>

          {/* Lead journey + channels */}
          <div className="nx-grid grid-cols-1 lg:grid-cols-2">
            <section className="nx-panel nx-pad">
              <div className="nx-sectionhead">
                <div>
                  <h2>Lead journey</h2>
                  <p>Click a stage to explore its leads.</p>
                </div>
              </div>
              <div className="nx-funnel">
                {journey.map(([name, value]) => (
                  <div
                    key={name}
                    className="nx-funnelrow"
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigate('leads', 'pipeline')}
                    onKeyDown={e => { if (e.key === 'Enter') onNavigate('leads', 'pipeline'); }}
                  >
                    <span>{name}</span>
                    <div className="nx-track">
                      <div className="nx-fill" style={{ width: `${Math.max(4, Math.round((value / stats.newLeads) * 100))}%` }} />
                    </div>
                    <b className="tabular-nums">{value}</b>
                  </div>
                ))}
              </div>
            </section>

            <section className="nx-panel nx-pad">
              <div className="nx-sectionhead">
                <div>
                  <h2>Channels</h2>
                  <p>Lead volume and qualification rate by source.</p>
                </div>
              </div>
              <div className="grid gap-[14px]">
                {channels.map(c => {
                  const count = Math.max(1, Math.round((stats.newLeads * c.share) / 100));
                  return (
                    <button
                      key={c.brand}
                      type="button"
                      onClick={() => onNavigate('leads', 'all-leads')}
                      className="nx-channelrow group"
                    >
                      <span
                        className="nx-channel-logo"
                        style={{ color: BRAND_COLORS[c.brand], backgroundColor: `${BRAND_COLORS[c.brand]}14` }}
                      >
                        <ChannelLogo brand={c.brand} className="w-[15px] h-[15px]" />
                      </span>
                      <span className="nx-channel-name group-hover:text-brand">{c.name}</span>
                      <span className="nx-track">
                        <span
                          className="block h-full rounded-[10px]"
                          style={{ width: `${Math.round((c.share / maxShare) * 100)}%`, backgroundColor: BRAND_COLORS[c.brand] }}
                        />
                      </span>
                      <b className="tabular-nums text-right">{count}</b>
                      <span className={`nx-tag justify-center ${c.qualified >= 40 ? 'green' : c.qualified >= 28 ? 'amber' : ''}`}>
                        {c.qualified}% qualified
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Next best actions */}
          <section className="nx-panel nx-pad">
            <div className="nx-sectionhead">
              <div>
                <h2>Next best actions</h2>
                <p>Recommended tasks, not automatic changes.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-line md:divide-x divide-line">
              <div className="nx-actioncard md:pr-6! md:border-t-0!">
                <span className="eyebrow">Lead recovery</span>
                <h3>Reconnect with dormant leads</h3>
                <p>{Math.max(3, Math.round(stats.newLeads / 2))} previous enquiries may be ready for a follow-up.</p>
                <button type="button" className="nx-link" onClick={() => onNavigate('leads', 'follow-ups')}>Review opportunity →</button>
              </div>
              <div className="nx-actioncard md:px-6! md:border-t-0!">
                <span className="eyebrow">Pricing</span>
                <h3>Answer pricing questions</h3>
                <p>{inboxCounts.askedForPricing} lead{inboxCounts.askedForPricing === 1 ? '' : 's'} asked about pricing and are waiting for a quote.</p>
                <button type="button" className="nx-link" onClick={() => onNavigate('inbox', 'asked-pricing')}>Open conversations →</button>
              </div>
              <div className="nx-actioncard md:pl-6! md:border-t-0!">
                <span className="eyebrow">Campaigns</span>
                <h3>Plan your next campaign</h3>
                <p>Turn this week's qualified demand into a re-engagement campaign.</p>
                <button type="button" className="nx-link" onClick={() => onNavigate('campaigns', 'campaign-list')}>Open campaigns →</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Custom date range popover */}
      <DateRangeCalendarModal
        isOpen={isCalendarOpen}
        anchorId="custom-date-btn"
        initialStartDate={customRange.startDate}
        initialEndDate={customRange.endDate}
        initialSortBasis={customRange.sortBasis}
        onClose={() => setIsCalendarOpen(false)}
        onApply={handleApplyCalendarSelection}
      />
    </div>
  );
}
