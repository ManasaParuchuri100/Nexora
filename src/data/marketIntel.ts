/**
 * Demo market intelligence for the sample workspace.
 * Competitor names are made up. Every item says where it comes from and when it was seen,
 * and private competitor results are never shown, because they cannot be observed.
 */

export interface Source {
  id: string;
  name: string;
  detail: string;
  connectable: boolean;
  /** Demo default. Connected sources are saved in this browser. */
  connected: boolean;
}

export const SOURCES: Source[] = [
  { id: 'public-web', name: 'Public competitor pages', detail: 'Pricing, offers and new pages on competitor websites', connectable: false, connected: true },
  { id: 'ad-library', name: 'Meta Ad Library', detail: 'Ads competitors are publicly running', connectable: false, connected: true },
  { id: 'gsc', name: 'Google Search Console', detail: 'Your own search terms, clicks and positions', connectable: true, connected: false },
  { id: 'gbp', name: 'Google Business Profile', detail: 'Search terms, calls and website clicks on your listing', connectable: true, connected: false },
  { id: 'analytics', name: 'Website analytics', detail: 'Visits and conversions on your own website', connectable: true, connected: false },
];

export interface Competitor {
  id: string;
  name: string;
  segment: string;
  changes: Array<{ text: string; source: string; seen: string; relevance: 'High' | 'Medium' | 'Low' }>;
  activeAds: number;
  postsPerWeek: number;
  priceSignal: string;
}

export const COMPETITORS: Competitor[] = [
  {
    id: 'c1', name: 'Studio Verve', segment: 'Residential interiors', activeAds: 14, postsPerWeek: 5, priceSignal: 'From ₹45,000 (public page)',
    changes: [
      { text: 'Launched a “free design consultation” offer on their homepage.', source: 'Public website', seen: '2 days ago', relevance: 'High' },
      { text: 'Started 6 new Instagram ads about festive makeovers.', source: 'Meta Ad Library', seen: '4 days ago', relevance: 'Medium' },
    ],
  },
  {
    id: 'c2', name: 'Casa Lumen', segment: 'Home and office interiors', activeAds: 9, postsPerWeek: 3, priceSignal: 'From ₹60,000 (public page)',
    changes: [
      { text: 'Lowered the starting price on their packages page.', source: 'Public website', seen: '5 days ago', relevance: 'High' },
    ],
  },
  {
    id: 'c3', name: 'Northline Interiors', segment: 'Office fit-outs', activeAds: 3, postsPerWeek: 2, priceSignal: 'Quote only',
    changes: [
      { text: 'Published three case studies on office renovations.', source: 'Public website', seen: '1 week ago', relevance: 'Medium' },
    ],
  },
  {
    id: 'c4', name: 'Arc & Oak', segment: 'Luxury residential', activeAds: 0, postsPerWeek: 1, priceSignal: 'Not published',
    changes: [
      { text: 'No new activity found in the last 30 days.', source: 'Public website', seen: '3 days ago', relevance: 'Low' },
    ],
  },
];

export interface Keyword {
  term: string;
  searches: number;
  change: number; // % vs previous period
  position: number | null; // your rank, null when you do not appear
  intent: 'Buy' | 'Compare' | 'Learn';
  trend: number[];
}

export const KEYWORDS: Keyword[] = [
  { term: 'interior designer near me', searches: 5400, change: 18, position: 7, intent: 'Buy', trend: [40, 44, 43, 50, 55, 58, 62] },
  { term: 'home interior cost per sq ft', searches: 3200, change: 31, position: null, intent: 'Compare', trend: [20, 22, 28, 30, 36, 41, 48] },
  { term: 'office interior design pune', searches: 1900, change: 6, position: 4, intent: 'Buy', trend: [30, 31, 29, 33, 32, 34, 35] },
  { term: 'diwali home makeover ideas', searches: 8800, change: 64, position: null, intent: 'Learn', trend: [10, 12, 18, 30, 52, 70, 88] },
  { term: 'modular kitchen designs', searches: 12100, change: -4, position: 12, intent: 'Learn', trend: [66, 64, 65, 63, 62, 62, 60] },
  { term: 'free interior design consultation', searches: 1300, change: 22, position: null, intent: 'Buy', trend: [8, 9, 10, 11, 12, 14, 16] },
];

export type RecStatus = 'New' | 'Approved' | 'Executed' | 'Dismissed';

export interface Recommendation {
  id: string;
  title: string;
  observation: string;
  recommendation: string;
  evidence: string[];
  seen: string;
  relevance: 'High' | 'Medium' | 'Low';
  action: { kind: 'content' | 'campaign' | 'follow-ups' | 'none'; label: string };
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'r1',
    title: 'Answer the “free consultation” offer',
    observation: 'Studio Verve now advertises a free design consultation, and searches for it rose 22% this month.',
    recommendation: 'Add a free consultation to your next campaign and write a post that explains what the consultation includes.',
    evidence: ['Studio Verve homepage change (public website, 2 days ago)', '“free interior design consultation”: 1,300 searches, up 22%'],
    seen: '2 days ago', relevance: 'High',
    action: { kind: 'campaign', label: 'Plan a campaign' },
  },
  {
    id: 'r2',
    title: 'Write a festive makeover guide',
    observation: '“Diwali home makeover ideas” has 8,800 searches, up 64%, and you do not appear for it.',
    recommendation: 'Publish a short guide and two social posts about festive makeovers before the peak.',
    evidence: ['Keyword demand: 8,800 searches, up 64% (sample data)', 'Your position: not ranking'],
    seen: 'Today', relevance: 'High',
    action: { kind: 'content', label: 'Create content' },
  },
  {
    id: 'r3',
    title: 'Explain your pricing earlier',
    observation: 'Casa Lumen lowered its starting price, and price is the top reason your leads are lost.',
    recommendation: 'Share a clear price range early in conversations, and follow up with leads who stopped replying after a pricing question.',
    evidence: ['Casa Lumen packages page change (public website, 5 days ago)', 'Price is the top lost reason in your Analytics'],
    seen: '5 days ago', relevance: 'Medium',
    action: { kind: 'follow-ups', label: 'Review follow-ups' },
  },
  {
    id: 'r4',
    title: 'Cover renovation costs',
    observation: '“Home interior cost per sq ft” is up 31% and you do not appear in results.',
    recommendation: 'Publish a cost guide with honest ranges. Search engines favour useful, original content.',
    evidence: ['Keyword demand: 3,200 searches, up 31% (sample data)'],
    seen: 'Today', relevance: 'Medium',
    action: { kind: 'content', label: 'Create content' },
  },
];

export const REC_STATE_KEY = 'nexora_market_recs_v1';
export const SOURCE_STATE_KEY = 'nexora_market_sources_v1';
