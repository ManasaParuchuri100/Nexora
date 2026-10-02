import React, { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  UserPlus, 
  PieChart, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  Radio, 
  Share2, 
  Globe, 
  Mail, 
  Filter 
} from 'lucide-react';
import { SubCategory, StatMetric } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import StatsView from './StatsView';
import NewCustomersChart from './leads/NewCustomersChart';
import ActivityHeatmap from './leads/ActivityHeatmap';

interface AnalyticsViewProps {
  activeSubCategory: SubCategory;
  onNavigateSub: (sub: SubCategory) => void;
  metrics: StatMetric[];
}

const CHANNELS_DATA = [
  {
    name: 'LinkedIn Direct & Sponsored',
    leads: 114,
    conversionRate: '68.4%',
    cac: '$142',
    spend: '$6,400',
    revenue: '$82,000',
    roi: '12.8x',
    status: 'Strongest Enterprise CAC'
  },
  {
    name: 'X (Twitter) Broadcasts',
    leads: 68,
    conversionRate: '42.1%',
    cac: '$86',
    spend: '$3,200',
    revenue: '$34,500',
    roi: '10.7x',
    status: 'High Early Engagement'
  },
  {
    name: 'Substack Thought Leadership',
    leads: 42,
    conversionRate: '74.2%',
    cac: '$48',
    spend: '$1,200',
    revenue: '$46,000',
    roi: '38.3x',
    status: 'Highest Retention'
  },
  {
    name: 'Direct Inbound / Organic Atelier',
    leads: 24,
    conversionRate: '88.0%',
    cac: '$0',
    spend: '$0',
    revenue: '$58,000',
    roi: 'Infinity',
    status: 'Pure Organic Referral'
  }
];

export default function AnalyticsView({
  activeSubCategory,
  onNavigateSub,
  metrics
}: AnalyticsViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  const isOverview = activeSubCategory === 'analytics-overview' || activeSubCategory === 'overview' || !activeSubCategory;
  const isLeadAnalytics = activeSubCategory === 'lead-analytics';
  const isChannelPerformance = activeSubCategory === 'channel-performance';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Analytics Module Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-[rgba(169,191,165,0.2)] gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#A9BFA5] font-medium block mb-1">
            PERFORMANCE & ATTRIBUTION INTELLIGENCE
          </span>
          <h1 className={`serif text-3xl sm:text-4xl font-light tracking-tight ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
            Analytics
          </h1>
          <p className="mt-1 text-xs text-[#A9BFA5]/80 font-light">
            Measure acquisition funnels, conversion velocity, and attribution across syndication channels.
          </p>
        </div>

        {/* Subnav Pills */}
        <div className="inline-flex rounded-[2px] border border-[rgba(169,191,165,0.2)] p-0.5 bg-inherit">
          <button
            type="button"
            onClick={() => onNavigateSub('analytics-overview')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isOverview
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSub('lead-analytics')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isLeadAnalytics
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Lead Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSub('channel-performance')}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              isChannelPerformance
                ? isLight
                  ? 'bg-[#143630] text-white font-medium rounded-[1px]'
                  : 'bg-[#E8E9D8] text-[#071C1A] font-semibold rounded-[1px]'
                : isLight
                  ? 'text-[#3E6A5E] hover:text-[#122420]'
                  : 'text-[#A9BFA5]/70 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Channel Performance</span>
          </button>
        </div>
      </section>

      {/* 1. ANALYTICS OVERVIEW */}
      {isOverview && (
        <div className="space-y-6">
          <StatsView />
        </div>
      )}

      {/* 2. LEAD ANALYTICS */}
      {isLeadAnalytics && (
        <div className="space-y-6">
          <div className="min-h-[300px]">
            {/* New Customers Line Chart */}
            <NewCustomersChart />
          </div>

          {/* Activity Matrix */}
          <div className="border border-[rgba(169,191,165,0.2)] p-5 rounded-[2px] bg-[#071C1A]">
            <h3 className="serif text-xl font-light text-[#E8E9D8] mb-1">
              Lead Activity Heatmap
            </h3>
            <p className="text-xs text-[#A9BFA5]/80 font-mono mb-4">
              Engagement frequency across day of week and operating hours
            </p>
            <ActivityHeatmap />
          </div>
        </div>
      )}

      {/* 3. CHANNEL PERFORMANCE */}
      {isChannelPerformance && (
        <div className="space-y-6">
          <div className="border border-[rgba(169,191,165,0.2)] p-6 rounded-[2px] bg-[#071C1A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(169,191,165,0.15)] gap-3">
              <div>
                <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8]">
                  Channel Attribution & Conversion ROI
                </h3>
                <p className="text-xs text-[#A9BFA5]/70 font-mono">
                  Comparative performance and customer acquisition cost across active release channels
                </p>
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-mono">
                {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-[2px] border transition-colors cursor-pointer ${
                      timeRange === r
                        ? 'bg-[#E8E9D8] text-[#071C1A] border-[#E8E9D8] font-semibold'
                        : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(169,191,165,0.2)] text-[#A9BFA5]/60 text-[10px] uppercase tracking-widest">
                    <th className="py-3 px-3">Channel Source</th>
                    <th className="py-3 px-3">Attributed Leads</th>
                    <th className="py-3 px-3">Conversion</th>
                    <th className="py-3 px-3">Est. CAC</th>
                    <th className="py-3 px-3">Attributed Rev</th>
                    <th className="py-3 px-3">ROI</th>
                    <th className="py-3 px-3">Efficiency Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(169,191,165,0.1)]">
                  {CHANNELS_DATA.map((ch, idx) => (
                    <tr key={idx} className="hover:bg-[#0D2D2A]/30 transition-colors">
                      <td className="py-3 px-3 font-medium text-[#E8E9D8]">{ch.name}</td>
                      <td className="py-3 px-3">{ch.leads}</td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold">{ch.conversionRate}</td>
                      <td className="py-3 px-3">{ch.cac}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">{ch.revenue}</td>
                      <td className="py-3 px-3">{ch.roi}</td>
                      <td className="py-3 px-3 text-[11px] text-[#A9BFA5]/80">{ch.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
