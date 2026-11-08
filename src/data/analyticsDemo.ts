/**
 * Demo analytics for the sample workspace.
 * Everything is generated from the selected date range with a fixed seed, so the numbers
 * are stable between renders, change with the range and always add up.
 */

export type RangeId = 'today' | '7d' | '30d' | '90d' | 'quarter';

export const RANGES: Array<{ id: RangeId; label: string; days: number }> = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: '90d', label: 'Last 90 days', days: 90 },
  { id: 'quarter', label: 'This quarter', days: 92 },
];

export const AVG_DEAL_VALUE = 96000; // INR

const SOURCES = [
  { name: 'WhatsApp', share: 0.42, qual: 0.43, won: 0.1, reply: '35 s', convs: 2.9 },
  { name: 'Instagram', share: 0.28, qual: 0.3, won: 0.07, reply: '1m 10s', convs: 3.1 },
  { name: 'Website', share: 0.18, qual: 0.22, won: 0.1, reply: '50 s', convs: 2.8 },
  { name: 'LinkedIn', share: 0.12, qual: 0.45, won: 0.09, reply: '4 min', convs: 2.7 },
];

const CAMPAIGNS = [
  { name: 'Diwali offer', share: 0.34 },
  { name: 'Reactivate 2025', share: 0.16 },
  { name: 'Quiet Horizon / Q2 Narrative', share: 0.12 },
  { name: 'No campaign', share: 0.38 },
];

const STAGES = ['New', 'Engaged', 'Qualified', 'Contacted', 'Proposal', 'Won'] as const;
const STAGE_KEEP = [1, 0.63, 0.36, 0.21, 0.14, 0.105];

const LOST_REASONS = [
  { reason: 'Price', share: 0.31 },
  { reason: 'No reply', share: 0.24 },
  { reason: 'Timing', share: 0.2 },
  { reason: 'Chose a competitor', share: 0.1 },
  { reason: 'Not a fit', share: 0.15 },
];

/** Small deterministic pseudo-random number in [0, 1). */
function rand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export interface Point {
  label: string;
  value: number;
}

function series(days: number, seed: number, level: number): number[] {
  if (days === 1) {
    // One day: spread a day's worth of leads over the working hours.
    const weights = Array.from({ length: 24 }, (_, h) => (h >= 8 && h <= 21 ? 0.4 + Math.sin(((h - 8) / 13) * Math.PI) + rand(seed + h) * 0.3 : 0.03));
    const sum = weights.reduce((a, b) => a + b, 0);
    return split(Math.max(1, Math.round(level * 1.2)), weights.map(w => w / sum));
  }
  const buckets = days > 31 ? Math.ceil(days / 7) : days;
  const per = days > 31 ? 7 : 1;
  return Array.from({ length: buckets }, (_, i) => {
    const weekly = 0.85 + 0.3 * Math.sin((i * per * Math.PI * 2) / 7 + 1);
    const trend = 1 + (i / buckets) * 0.25;
    const noise = 0.85 + rand(seed + i) * 0.3;
    return Math.max(0, Math.round(level * per * weekly * trend * noise));
  });
}

function labels(days: number): string[] {
  const hourly = days === 1;
  const n = hourly ? 24 : days > 31 ? Math.ceil(days / 7) : days;
  const end = new Date();
  return Array.from({ length: n }, (_, i) => {
    if (hourly) return `${i}:00`;
    const d = new Date(end);
    const back = days > 31 ? (n - 1 - i) * 7 : n - 1 - i;
    d.setDate(d.getDate() - back);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
}

/** Split `total` across weights so the parts add up exactly. */
function split(total: number, weights: number[]): number[] {
  const raw = weights.map(w => w * total);
  const out = raw.map(Math.floor);
  let rest = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, f: r - Math.floor(r) })).sort((a, b) => b.f - a.f);
  for (let k = 0; rest > 0; k = (k + 1) % order.length, rest--) out[order[k].i]++;
  return out;
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const delta = (cur: number, prev: number) => (prev ? Math.round(((cur - prev) / prev) * 1000) / 10 : 0);

export interface Kpi {
  id: 'leads' | 'qualified' | 'won' | 'revenue' | 'ai';
  label: string;
  value: string;
  raw: number;
  delta: number; // % vs previous period
  note: string;
}

export interface ActivityItem {
  id: string;
  type: 'lead' | 'ai' | 'handoff' | 'followup' | 'campaign' | 'call';
  text: string;
  when: string;
  go: { category: 'leads' | 'inbox' | 'campaigns' | 'content'; sub: string };
}

export interface AnalyticsData {
  range: (typeof RANGES)[number];
  kpis: Kpi[];
  current: Point[];
  previous: Point[];
  funnel: Array<{ stage: string; count: number; rate: number }>;
  sources: Array<{ name: string; conversations: number; leads: number; qualified: number; won: number; conv: number; reply: string }>;
  campaigns: Array<{ name: string; leads: number; qualified: number; won: number }>;
  lost: Array<{ reason: string; count: number }>;
  timeInStage: Array<{ stage: string; days: number }>;
  speed: { firstReply: string; handoffs: number; humanReply: string; aiShare: number };
  activity: ActivityItem[];
}

const inr = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`);

export function getAnalytics(rangeId: RangeId): AnalyticsData {
  const range = RANGES.find(r => r.id === rangeId) ?? RANGES[2];
  const level = 4.0;
  const cur = series(range.days, 11, level);
  const prev = series(range.days, 77, level * 0.85);
  const lab = labels(range.days);

  const leads = cur.reduce((a, b) => a + b, 0);
  const prevLeads = prev.reduce((a, b) => a + b, 0);
  const funnelCounts = STAGE_KEEP.map(k => Math.round(k * leads));
  funnelCounts[0] = leads;
  const qualified = funnelCounts[2];
  const won = funnelCounts[5];
  const prevQualified = Math.round(prevLeads * 0.33);
  const prevWon = Math.round(prevLeads * 0.095);
  const revenue = won * AVG_DEAL_VALUE;
  const prevRevenue = prevWon * AVG_DEAL_VALUE;
  const aiShare = 71;

  const srcLeads = split(leads, SOURCES.map(s => s.share));
  const sources = SOURCES.map((s, i) => {
    const q = Math.round(srcLeads[i] * s.qual);
    const w = Math.min(q, Math.round(srcLeads[i] * s.won));
    return { name: s.name, conversations: Math.round(srcLeads[i] * s.convs), leads: srcLeads[i], qualified: q, won: w, conv: pct(w, srcLeads[i]), reply: s.reply };
  });

  const campLeads = split(leads, CAMPAIGNS.map(c => c.share));
  const campaigns = CAMPAIGNS.map((c, i) => ({
    name: c.name,
    leads: campLeads[i],
    qualified: Math.round(campLeads[i] * 0.34),
    won: Math.round(campLeads[i] * 0.1),
  }));

  const lostTotal = Math.round(leads * 0.18);
  const lostCounts = split(lostTotal, LOST_REASONS.map(r => r.share));

  const activity: ActivityItem[] = [
    { id: 'a1', type: 'lead', text: 'New WhatsApp lead · Rahul Sharma', when: '10:42', go: { category: 'leads', sub: 'all-leads' } },
    { id: 'a2', type: 'ai', text: 'AI qualified Aster Labs as Hot · score 92', when: '10:36', go: { category: 'leads', sub: 'all-leads' } },
    { id: 'a3', type: 'handoff', text: 'Handoff requested · John Carter · Instagram', when: '10:18', go: { category: 'inbox', sub: 'waiting-human' } },
    { id: 'a4', type: 'followup', text: 'Follow-up sent to Neha Gupta (approved draft)', when: '09:55', go: { category: 'leads', sub: 'follow-ups' } },
    { id: 'a5', type: 'call', text: 'Zoom call booked with Rahul Sharma for 4:00 PM', when: '09:41', go: { category: 'leads', sub: 'follow-ups' } },
    { id: 'a6', type: 'campaign', text: 'Diwali offer reached 40 leads this week', when: '09:12', go: { category: 'campaigns', sub: 'campaign-list' } },
    { id: 'a7', type: 'lead', text: 'New website enquiry · Priya Menon', when: 'Yesterday', go: { category: 'leads', sub: 'all-leads' } },
    { id: 'a8', type: 'ai', text: 'AI answered 14 pricing questions from approved knowledge', when: 'Yesterday', go: { category: 'inbox', sub: 'inbox' } },
    { id: 'a9', type: 'followup', text: '2 follow-ups became overdue', when: 'Yesterday', go: { category: 'leads', sub: 'follow-ups' } },
  ];

  return {
    range,
    kpis: [
      { id: 'leads', label: 'Leads', value: String(leads), raw: leads, delta: delta(leads, prevLeads), note: 'new enquiries' },
      { id: 'qualified', label: 'Qualified', value: String(qualified), raw: qualified, delta: delta(qualified, prevQualified), note: `${pct(qualified, leads)}% of leads` },
      { id: 'won', label: 'Won', value: String(won), raw: won, delta: delta(won, prevWon), note: `${pct(won, leads)}% of leads` },
      { id: 'revenue', label: 'Revenue', value: inr(revenue), raw: revenue, delta: delta(revenue, prevRevenue), note: 'from won deals' },
      { id: 'ai', label: 'AI handled', value: `${aiShare}%`, raw: aiShare, delta: 4, note: 'conversations without a person' },
    ],
    current: cur.map((v, i) => ({ label: lab[i], value: v })),
    previous: prev.map((v, i) => ({ label: lab[i], value: v })),
    funnel: STAGES.map((stage, i) => ({ stage, count: funnelCounts[i], rate: pct(funnelCounts[i], leads) })),
    sources,
    campaigns,
    lost: LOST_REASONS.map((r, i) => ({ reason: r.reason, count: lostCounts[i] })),
    timeInStage: [
      { stage: 'New', days: 0.5 },
      { stage: 'Engaged', days: 1.2 },
      { stage: 'Qualified', days: 3.4 },
      { stage: 'Contacted', days: 6 },
      { stage: 'Proposal', days: 8.5 },
    ],
    speed: { firstReply: '40 s', handoffs: Math.max(1, Math.round(leads * 0.27)), humanReply: '6 min', aiShare },
    activity,
  };
}

/** Rows for a CSV download of one tab. */
export function toCsv(data: AnalyticsData, tab: 'overview' | 'leads' | 'channels' | 'activity'): { name: string; rows: Array<Array<string | number>> } {
  const base = `analytics-${data.range.id}-${tab}`;
  if (tab === 'overview') {
    return {
      name: base,
      rows: [
        ['Metric', 'Value', 'Change vs previous period (%)'],
        ...data.kpis.map(k => [k.label, k.value, k.delta]),
        [],
        ['Period', 'Leads', 'Previous period leads'],
        ...data.current.map((p, i) => [p.label, p.value, data.previous[i]?.value ?? '']),
      ],
    };
  }
  if (tab === 'leads') {
    return {
      name: base,
      rows: [
        ['Source', 'Leads', 'Qualified', 'Won'],
        ...data.sources.map(s => [s.name, s.leads, s.qualified, s.won]),
        [],
        ['Campaign', 'Leads', 'Qualified', 'Won'],
        ...data.campaigns.map(c => [c.name, c.leads, c.qualified, c.won]),
        [],
        ['Lost reason', 'Count'],
        ...data.lost.map(l => [l.reason, l.count]),
      ],
    };
  }
  if (tab === 'channels') {
    return {
      name: base,
      rows: [
        ['Channel', 'Conversations', 'Leads', 'Qualified', 'Won', 'Conversion (%)', 'Avg first reply'],
        ...data.sources.map(s => [s.name, s.conversations, s.leads, s.qualified, s.won, s.conv, s.reply]),
      ],
    };
  }
  return { name: base, rows: [['When', 'Type', 'Event'], ...data.activity.map(a => [a.when, a.type, a.text])] };
}
