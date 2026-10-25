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
  PageHeader 
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
  const topPricing = getTopPricingConversation();

  // Date filters: Today, 7 days, 30 days, Custom
  const [datePreset, setDatePreset] = useState<'today' | '7d' | '30d' | 'custom'>('7d');
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
      show: inboxCounts.overdueFollowUps > 0,
      title: `${inboxCounts.overdueFollowUps} follow-up${inboxCounts.overdueFollowUps === 1 ? '' : 's'} overdue`,
      detail: `Oldest is ${inboxCounts.oldestOverdueDays} day${inboxCounts.oldestOverdueDays === 1 ? '' : 's'} overdue`,
      icon: AlertTriangle,
      iconBg: 'bg-warn-soft text-warn',
      onClick: () => onNavigate('inbox', 'overdue-followups')
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

  return (
    <div className="space-y-6 pb-12 select-text text-ink animate-fadeIn">
      
      {/* 1. PAGE HEADER with Dynamic Greeting, Subtitle, and Date Controls */}
      <PageHeader
        title={getGreeting()}
        subtitle={subtitle}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <SegmentedControl
              options={[
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 days' },
                { id: '30d', label: '30 days' },
              ]}
              value={datePreset === 'custom' ? ('' as any) : datePreset}
              onChange={(val) => {
                setDatePreset(val);
                setIsCalendarOpen(false);
              }}
              size="sm"
            />
            <Button
              id="custom-date-btn"
              variant={datePreset === 'custom' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setDatePreset('custom');
                setIsCalendarOpen(prev => !prev);
              }}
              leadingIcon={<CalendarIcon className="w-3.5 h-3.5" />}
            >
              {datePreset === 'custom' 
                ? `Custom (${customRange.startDate.slice(5)} - ${customRange.endDate.slice(5)})` 
                : 'Custom'}
            </Button>
          </div>
        }
      />

      {/* 2. FIRST-RUN MODE: Replace dashboard with 3-step setup checklist */}
      {isFirstRun ? (
        <Card className="max-w-xl mx-auto my-8">
          <CardHeader
            title={`Get started with ${BRAND_NAME}`}
            description="Complete these three quick steps to activate your autonomous sales engine."
          />
          <div className="p-4 sm:p-5 divide-y divide-line-subtle space-y-4">
            
            {/* Step 1: Connect Channel */}
            <div className="flex items-center justify-between gap-4 pt-4 first:pt-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-ink">Connect a channel</h4>
                  <p className="text-xs text-ink-3 truncate">Link WhatsApp or Instagram to capture inquiries.</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onNavigate('settings', 'channels')}
                className="shrink-0"
              >
                Connect channel
              </Button>
            </div>

            {/* Step 2: Add First Lead */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-raised text-ink-2 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-ink">Add your first lead</h4>
                  <p className="text-xs text-ink-3 truncate">Import or create a prospect to verify qualification.</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (onTriggerQuickAction) onTriggerQuickAction('lead');
                  else onNavigate('leads', 'all-leads');
                }}
                className="shrink-0"
              >
                Add lead
              </Button>
            </div>

            {/* Step 3: Invite Teammate */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-raised text-ink-2 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-ink">Invite a teammate</h4>
                  <p className="text-xs text-ink-3 truncate">Collaborate on hot leads and handoffs in the inbox.</p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onNavigate('settings', 'business')}
                className="shrink-0"
              >
                Invite teammate
              </Button>
            </div>

          </div>
        </Card>
      ) : (
        <>
          {/* 3. NEEDS YOU (7/12) & SUGGESTED NEXT STEP (5/12) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Needs You Card */}
            <Card className={isSuggestionVisible ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <CardHeader
                title="Needs you"
                description="Conversations requiring human takeover, follow-ups, or custom responses"
              />
              <div className="p-3 sm:p-4 space-y-1.5">
                {needsYouRows.length > 0 ? (
                  needsYouRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <button
                        key={row.id}
                        id={row.id}
                        type="button"
                        onClick={row.onClick}
                        className="w-full min-h-12! rounded-lg! flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors text-left group cursor-pointer focus-visible:outline-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${row.iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-ink block truncate group-hover:text-brand transition-colors">
                              {row.title}
                            </span>
                            {row.detail && (
                              <span className="text-xs text-ink-3 block truncate">
                                {row.detail}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-brand shrink-0 group-hover:translate-x-0.5 transition-transform ml-2">
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <EmptyState
                    icon={<Check className="w-6 h-6 text-ok" />}
                    title="You're all caught up"
                    description="No conversations currently require human intervention."
                  />
                )}
              </div>
            </Card>

            {/* Suggested Next Step Card */}
            {isSuggestionVisible && topPricing && (
              <Card className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3 border-b border-line-subtle">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                        Suggested next step
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Dismiss recommendation"
                      onClick={() => setShowRecommendation(false)}
                      className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-hover cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 space-y-2">
                    <p className="text-sm font-semibold text-ink leading-snug">
                      {topPricing.company} asked about pricing and wants to start in {topPricing.qualification?.timeline || '30 days'}.
                    </p>
                    <p className="text-xs text-ink-3 leading-relaxed">
                      Next step: {topPricing.nextAction || 'Schedule a discovery call'}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const match = leads.find(l => l.company.toLowerCase().includes(topPricing.company.toLowerCase()) || l.id === topPricing.leadReferenceId) || leads[0];
                      if (match) onSelectLead(match);
                    }}
                  >
                    Review lead
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate('inbox', 'asked-pricing')}
                  >
                    Open conversation
                  </Button>
                </div>
              </Card>
            )}

          </div>

          {/* 4. FOUR STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* New Leads */}
            <StatCard
              label="New leads"
              value={stats.newLeads}
              icon={<Users className="w-4 h-4 text-brand" />}
              delta={stats.newDelta}
              periodText={stats.periodText}
              hint="Total inquiries captured"
              sparklineData={[14, 18, 16, 22, 20, 25, stats.newLeads]}
              onClick={() => onNavigate('leads', 'all-leads')}
            />

            {/* Qualified */}
            <StatCard
              label="Qualified"
              value={stats.qualifiedLeads}
              icon={<CheckCircle2 className="w-4 h-4 text-ok" />}
              delta={stats.qualDelta}
              periodText={stats.periodText}
              hint={`${Math.round((stats.qualifiedLeads / stats.newLeads) * 100)}% qualification rate`}
              sparklineData={[5, 7, 6, 8, 9, 10, stats.qualifiedLeads]}
              onClick={() => onNavigate('leads', 'pipeline')}
            />

            {/* Follow-ups */}
            <StatCard
              label="Follow-ups"
              value={stats.followUps}
              icon={<Clock className="w-4 h-4 text-warn" />}
              delta={stats.followDelta}
              periodText={stats.periodText}
              hint={inboxCounts.overdueFollowUps > 0 ? `${inboxCounts.overdueFollowUps} overdue` : 'All on track'}
              sparklineData={[8, 6, 7, 9, 6, 8, stats.followUps]}
              onClick={() => onNavigate('leads', 'follow-ups')}
            />

            {/* Won Deals */}
            <StatCard
              label="Won deals"
              value={stats.wonLeads}
              icon={<Trophy className="w-4 h-4 text-brand" />}
              delta={stats.wonDelta}
              periodText={stats.periodText}
              hint={`₹${(stats.wonLeads * 1.2).toFixed(1)}L revenue closed`}
              sparklineData={[1, 2, 2, 3, 2, 3, stats.wonLeads]}
              onClick={() => onNavigate('analytics', 'overview')}
            />

          </div>

          {/* 5. LEAD FUNNEL & CHANNELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Lead Funnel (~50%) */}
            <Card className="lg:col-span-6">
              <CardHeader
                title="Lead funnel"
                description={`${Math.round((stats.wonLeads / stats.newLeads) * 100)}% of new leads become customers`}
              />
              <div className="p-4 sm:p-5 space-y-3.5">
                
                {/* Stage 1: New */}
                <div 
                  onClick={() => onNavigate('leads', 'pipeline')}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-ink group-hover:text-brand transition-colors">New</span>
                    <span className="text-ink-3 tabular-nums font-mono">{stats.newLeads} (100%)</span>
                  </div>
                  <ProgressBar value={100} size="sm" tone="brand" />
                </div>

                {/* Stage 2: Engaged */}
                <div 
                  onClick={() => onNavigate('leads', 'pipeline')}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-ink group-hover:text-brand transition-colors">Engaged</span>
                    <span className="text-ink-3 tabular-nums font-mono">
                      {stats.engagedLeads} ({Math.round((stats.engagedLeads / stats.newLeads) * 100)}%)
                    </span>
                  </div>
                  <ProgressBar 
                    value={Math.round((stats.engagedLeads / stats.newLeads) * 100)} 
                    size="sm" 
                    tone="brand" 
                  />
                </div>

                {/* Stage 3: Qualified */}
                <div 
                  onClick={() => onNavigate('leads', 'pipeline')}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-ink group-hover:text-brand transition-colors">Qualified</span>
                    <span className="text-ink-3 tabular-nums font-mono">
                      {stats.qualifiedLeads} ({Math.round((stats.qualifiedLeads / stats.newLeads) * 100)}%)
                    </span>
                  </div>
                  <ProgressBar 
                    value={Math.round((stats.qualifiedLeads / stats.newLeads) * 100)} 
                    size="sm" 
                    tone="brand" 
                  />
                </div>

                {/* Stage 4: Won (reflects REAL ratio, not 25%!) */}
                <div 
                  onClick={() => onNavigate('leads', 'pipeline')}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-ink group-hover:text-brand transition-colors">Won</span>
                    <span className="text-ink-3 tabular-nums font-mono">
                      {stats.wonLeads} ({Math.round((stats.wonLeads / stats.newLeads) * 100)}%)
                    </span>
                  </div>
                  <ProgressBar 
                    value={Math.round((stats.wonLeads / stats.newLeads) * 100)} 
                    size="sm" 
                    tone="ok" 
                  />
                </div>

              </div>
            </Card>

            {/* Channels (~50%) */}
            <Card className="lg:col-span-6">
              <CardHeader
                title="Channels"
                description="Lead volume and qualification rate by source"
              />
              <div className="p-4 sm:p-5 divide-y divide-line-subtle">
                
                {/* WhatsApp */}
                <div 
                  onClick={() => onNavigate('leads', 'all-leads')}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-ok-soft text-ok flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-ink group-hover:text-brand transition-colors">WhatsApp</span>
                        <span className="text-ink-3 tabular-nums">{Math.round(stats.newLeads * 0.48)} leads</span>
                      </div>
                      <ProgressBar value={48} size="sm" tone="ok" />
                    </div>
                  </div>
                  <Badge tone="success" size="sm" className="shrink-0">
                    43% qualified
                  </Badge>
                </div>

                {/* Instagram */}
                <div 
                  onClick={() => onNavigate('leads', 'all-leads')}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-hot-soft text-hot flex items-center justify-center shrink-0">
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-ink group-hover:text-brand transition-colors">Instagram</span>
                        <span className="text-ink-3 tabular-nums">{Math.round(stats.newLeads * 0.31)} leads</span>
                      </div>
                      <ProgressBar value={31} size="sm" tone="hot" />
                    </div>
                  </div>
                  <Badge tone="warning" size="sm" className="shrink-0">
                    30% qualified
                  </Badge>
                </div>

                {/* Website */}
                <div 
                  onClick={() => onNavigate('leads', 'all-leads')}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-info-soft text-info flex items-center justify-center shrink-0">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-ink group-hover:text-brand transition-colors">Website</span>
                        <span className="text-ink-3 tabular-nums">{Math.round(stats.newLeads * 0.14)} leads</span>
                      </div>
                      <ProgressBar value={14} size="sm" tone="info" />
                    </div>
                  </div>
                  <Badge tone="neutral" size="sm" className="shrink-0">
                    22% qualified
                  </Badge>
                </div>

                {/* LinkedIn */}
                <div 
                  onClick={() => onNavigate('leads', 'all-leads')}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-ink group-hover:text-brand transition-colors">LinkedIn</span>
                        <span className="text-ink-3 tabular-nums">{Math.max(1, Math.round(stats.newLeads * 0.07))} leads</span>
                      </div>
                      <ProgressBar value={7} size="sm" tone="brand" />
                    </div>
                  </div>
                  <Badge tone="success" size="sm" className="shrink-0">
                    45% qualified
                  </Badge>
                </div>

              </div>
            </Card>

          </div>

          {/* 6. RECENT ACTIVITY (Grouped by Day, Lucide Icon in Tinted Circle, Score Badge for Leads) */}
          <Card>
            <CardHeader
              title="Recent activity"
              description="Chronological log of customer events, qualification updates, and campaign milestones"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('analytics', 'overview')}
                  trailingIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View all
                </Button>
              }
            />

            <div className="p-4 sm:p-5 space-y-4">
              {groupedActivities.length > 0 ? (
                groupedActivities.map(({ group, items }) => (
                  <div key={group} className="space-y-2">
                    <div className="text-xs font-semibold text-ink-3 uppercase tracking-wider">
                      {group}
                    </div>

                    <div className="divide-y divide-line-subtle border border-line-subtle rounded-xl overflow-hidden bg-surface">
                      {items.map((act) => {
                        const Icon = act.icon;
                        const isLeadEvent = act.category === 'leads' && typeof act.score === 'number';

                        return (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => onNavigate(act.category, act.subCategory)}
                            className="w-full flex items-center justify-between p-3 hover:bg-surface-hover transition-colors text-left group cursor-pointer focus-visible:outline-none min-h-12!"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${act.iconBg}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-medium text-ink group-hover:text-brand transition-colors truncate">
                                {act.description}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 ml-3">
                              {isLeadEvent && (
                                <Badge 
                                  tone={act.score! >= 90 ? 'success' : act.score! >= 80 ? 'warning' : 'danger'} 
                                  size="sm"
                                >
                                  Score {act.score}
                                </Badge>
                              )}
                              <span className="text-xs text-ink-3 tabular-nums">
                                {act.relativeTime}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No activity in this period"
                  description="Try selecting a wider date range to see past customer conversations and events."
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setDatePreset('30d');
                        setIsCalendarOpen(false);
                      }}
                    >
                      Adjust date range
                    </Button>
                  }
                />
              )}
            </div>
          </Card>
        </>
      )}

      {/* Date Range & Calendar Selection Popover Dropdown */}
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
