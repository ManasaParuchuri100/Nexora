import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Users, 
  Megaphone, 
  Sparkles, 
  MessageSquare, 
  Share2, 
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  Send,
  Eye,
  Check,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Phone
} from 'lucide-react';
import { StatMetric, Lead, Campaign, TrendingTopic, NavCategory, SubCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface OverviewViewProps {
  metrics: StatMetric[];
  leads: Lead[];
  campaigns: Campaign[];
  trendingTopics: TrendingTopic[];
  onNavigate: (category: NavCategory, subCategory?: SubCategory) => void;
  onSelectLead: (lead: Lead) => void;
  onTriggerQuickAction: (action: 'campaign' | 'content' | 'lead' | 'schedule') => void;
}

export default function OverviewView({
  metrics,
  leads,
  campaigns,
  trendingTopics,
  onNavigate,
  onSelectLead,
  onTriggerQuickAction
}: OverviewViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Toggle to show full attention queue if user clicks "View all →"
  const [showAllAttention, setShowAllAttention] = useState(false);

  // Time-of-day dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Acme Studio';
    if (hour < 17) return 'Good afternoon, Acme Studio';
    return 'Good evening, Acme Studio';
  };

  // Funnel Data corresponding to wireframe
  const funnelStages = [
    { label: 'New', count: 86, percent: '100%', drop: null },
    { label: 'Engaged', count: 54, percent: '62.8%', drop: '-37.2%' },
    { label: 'Qualified', count: 31, percent: '36.0%', drop: '-42.6%' },
    { label: 'Contacted', count: 18, percent: '20.9%', drop: '-41.9%' }
  ];

  // Channel Performance items from wireframe
  const channelPerformance = [
    { name: 'WhatsApp', count: 42, growth: '↑ 24%', isPositive: true, barPercent: 100, color: 'bg-emerald-500' },
    { name: 'Instagram', count: 27, growth: '↑ 12%', isPositive: true, barPercent: 64, color: 'bg-emerald-400' },
    { name: 'Website', count: 18, growth: '↑ 8%', isPositive: true, barPercent: 43, color: 'bg-teal-400' },
    { name: 'LinkedIn', count: 11, growth: '↑ 4%', isPositive: true, barPercent: 26, color: 'bg-sky-400' }
  ];

  // Recent Activity items from wireframe
  const recentActivities = [
    { time: '10:42', title: 'New lead', detail: 'Marcus Sterling · Sterling Creative via WhatsApp', category: 'leads', sub: 'all-leads' as SubCategory },
    { time: '10:36', title: 'Qualified', detail: 'Clara Chen · Veritas Capital scored 94 intent', category: 'leads', sub: 'pipeline' as SubCategory },
    { time: '10:31', title: 'Follow-up', detail: 'Demo recap cadence dispatched to Julian Thorne', category: 'leads', sub: 'follow-ups' as SubCategory },
    { time: '10:18', title: 'Handoff', detail: 'Dr. Evelyn Vance flagged for human consultation', category: 'engage', sub: 'human-handoff' as SubCategory }
  ];

  return (
    <div className="space-y-7 pb-10 animate-fadeIn text-[#E8E9D8]">
      {/* 1. GREETING HEADER */}
      <section className="border-b border-[rgba(169,191,165,0.15)] pb-5">
        <h1 className={`serif text-3xl sm:text-4xl font-light tracking-tight ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
          {getGreeting()}
        </h1>
        <p className={`mt-1.5 text-xs sm:text-sm font-light ${isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/80'}`}>
          Here's what needs your attention today.
        </p>
      </section>

      {/* 2. STAT CARDS ROW (4 Cards) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: NEW LEADS */}
        <div 
          onClick={() => onNavigate('leads', 'all-leads')}
          className={`p-4 sm:p-5 rounded-[2px] border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 ${
            isLight
              ? 'bg-white border-[#E2ECE0] shadow-sm hover:border-[#143630]/40'
              : 'bg-[#061816] border-[rgba(169,191,165,0.2)] hover:border-[#A9BFA5]/50 hover:bg-[#071C1A]'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9BFA5]/70 block font-semibold mb-1">
            NEW LEADS
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl sm:text-3xl font-light font-mono tracking-tight ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
              28
            </span>
            <span className="text-xs font-mono font-medium text-emerald-400 flex items-center">
              ↑ 18%
            </span>
          </div>
        </div>

        {/* Card 2: QUALIFIED */}
        <div 
          onClick={() => onNavigate('leads', 'pipeline')}
          className={`p-4 sm:p-5 rounded-[2px] border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 ${
            isLight
              ? 'bg-white border-[#E2ECE0] shadow-sm hover:border-[#143630]/40'
              : 'bg-[#061816] border-[rgba(169,191,165,0.2)] hover:border-[#A9BFA5]/50 hover:bg-[#071C1A]'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9BFA5]/70 block font-semibold mb-1">
            QUALIFIED
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl sm:text-3xl font-light font-mono tracking-tight ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
              11
            </span>
            <span className="text-xs font-mono font-medium text-emerald-400 flex items-center">
              ↑ 9%
            </span>
          </div>
        </div>

        {/* Card 3: FOLLOW-UPS */}
        <div 
          onClick={() => onNavigate('leads', 'follow-ups')}
          className={`p-4 sm:p-5 rounded-[2px] border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 ${
            isLight
              ? 'bg-white border-[#E2ECE0] shadow-sm hover:border-[#143630]/40'
              : 'bg-[#061816] border-[rgba(169,191,165,0.2)] hover:border-[#A9BFA5]/50 hover:bg-[#071C1A]'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9BFA5]/70 block font-semibold mb-1">
            FOLLOW-UPS
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl sm:text-3xl font-light font-mono tracking-tight ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
              7
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-[2px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
              3 due
            </span>
          </div>
        </div>

        {/* Card 4: CONVERTED */}
        <div 
          onClick={() => onNavigate('analytics', 'lead-analytics')}
          className={`p-4 sm:p-5 rounded-[2px] border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 ${
            isLight
              ? 'bg-white border-[#E2ECE0] shadow-sm hover:border-[#143630]/40'
              : 'bg-[#061816] border-[rgba(169,191,165,0.2)] hover:border-[#A9BFA5]/50 hover:bg-[#071C1A]'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9BFA5]/70 block font-semibold mb-1">
            CONVERTED
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl sm:text-3xl font-light font-mono tracking-tight ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
              4
            </span>
            <span className="text-xs font-mono font-medium text-emerald-400 flex items-center">
              ↑ 12%
            </span>
          </div>
        </div>
      </section>

      {/* 3. NEEDS YOUR ATTENTION SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#A9BFA5] font-semibold">
            NEEDS YOUR ATTENTION
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('engage', 'human-handoff')}
            className="text-xs font-mono text-[#A9BFA5] hover:text-[#E8E9D8] transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className={`rounded-[2px] border divide-y ${
          isLight 
            ? 'bg-white border-[#E2ECE0] divide-[#E2ECE0]' 
            : 'bg-[#061816] border-[rgba(169,191,165,0.2)] divide-[rgba(169,191,165,0.1)]'
        }`}>
          {/* Item 1: 🔴 3 conversations need a human response */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#0D2D2A]/20 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
              <div>
                <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
                  3 conversations need a human response
                </p>
                <p className="text-[11px] font-mono text-[#A9BFA5]/60 mt-0.5 hidden sm:block">
                  Dr. Evelyn Vance, Marcus Sterling, Clara Chen waiting in escalation queue
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('engage', 'human-handoff')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-[2px] border transition-colors cursor-pointer shrink-0 ${
                isLight
                  ? 'bg-[#143630] border-[#143630] text-white hover:bg-[#1E4D45]'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/40 text-rose-200'
              }`}
            >
              Open
            </button>
          </div>

          {/* Item 2: 🟠 5 qualified leads haven't been followed up */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#0D2D2A]/20 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <div>
                <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
                  5 qualified leads haven't been followed up
                </p>
                <p className="text-[11px] font-mono text-[#A9BFA5]/60 mt-0.5 hidden sm:block">
                  Leads with intent score &gt;80 inactive for more than 48 hours
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('leads', 'follow-ups')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-[2px] border transition-colors cursor-pointer shrink-0 ${
                isLight
                  ? 'border-[#D0DDD0] bg-white text-[#122420] hover:bg-[#F8F9F5]'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-200'
              }`}
            >
              View
            </button>
          </div>

          {/* Item 3: 🟡 2 leads requested pricing */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#0D2D2A]/20 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              <div>
                <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
                  2 leads requested pricing
                </p>
                <p className="text-[11px] font-mono text-[#A9BFA5]/60 mt-0.5 hidden sm:block">
                  Aster Labs ($48,000 deal) and Veritas Capital ($32,000 deal)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('leads', 'all-leads')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-[2px] border transition-colors cursor-pointer shrink-0 ${
                isLight
                  ? 'border-[#D0DDD0] bg-white text-[#122420] hover:bg-[#F8F9F5]'
                  : 'bg-yellow-400/15 hover:bg-yellow-400/25 border-yellow-400/40 text-yellow-200'
              }`}
            >
              Review
            </button>
          </div>

          {/* Item 4: 🟢 4 leads are ready for booking */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#0D2D2A]/20 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <div>
                <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
                  4 leads are ready for booking
                </p>
                <p className="text-[11px] font-mono text-[#A9BFA5]/60 mt-0.5 hidden sm:block">
                  All qualification criteria completed; awaiting discovery call slot
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('leads', 'pipeline')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-[2px] border transition-colors cursor-pointer shrink-0 ${
                isLight
                  ? 'border-[#D0DDD0] bg-white text-[#122420] hover:bg-[#F8F9F5]'
                  : 'bg-emerald-400/15 hover:bg-emerald-400/25 border-emerald-400/40 text-emerald-200'
              }`}
            >
              View
            </button>
          </div>
        </div>
      </section>

      {/* 4. LEAD FUNNEL SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-[#A9BFA5] font-semibold">
          LEAD FUNNEL
        </h2>

        <div className={`p-5 sm:p-6 rounded-[2px] border ${
          isLight
            ? 'bg-white border-[#E2ECE0]'
            : 'bg-[#061816] border-[rgba(169,191,165,0.2)]'
        }`}>
          {/* Top Stages Numbers Grid */}
          <div className="grid grid-cols-4 gap-2 pb-5 border-b border-[rgba(169,191,165,0.15)] text-center sm:text-left">
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#A9BFA5]/70 block">New</span>
              <span className={`text-xl sm:text-2xl font-mono font-medium ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>86</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#A9BFA5]/70 block">Engaged</span>
              <span className={`text-xl sm:text-2xl font-mono font-medium ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>54</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#A9BFA5]/70 block">Qualified</span>
              <span className={`text-xl sm:text-2xl font-mono font-medium ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>31</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#A9BFA5]/70 block">Contacted</span>
              <span className={`text-xl sm:text-2xl font-mono font-medium ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>18</span>
            </div>
          </div>

          {/* Visual Funnel Horizontal Bars */}
          <div className="py-5 space-y-3">
            {funnelStages.map((stage, idx) => {
              // Width calculated relative to 86
              const widthPercent = (stage.count / 86) * 100;
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A9BFA5]/80">
                    <span className="font-semibold uppercase tracking-wider">{stage.label}</span>
                    <span>{stage.count} leads ({stage.percent})</span>
                  </div>
                  <div className="w-full h-4 bg-[#0D2D2A]/40 rounded-[2px] overflow-hidden border border-[rgba(169,191,165,0.15)] flex">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        idx === 0 
                          ? 'bg-[#A9BFA5]' 
                          : idx === 1 
                          ? 'bg-[#8CA888]' 
                          : idx === 2 
                          ? 'bg-[#6F926B]' 
                          : 'bg-[#537D4F]'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Summary Stats */}
          <div className="pt-4 border-t border-[rgba(169,191,165,0.15)] flex items-center justify-between font-mono text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-[#A9BFA5]/70">Won:</span>
              <span className={`font-semibold ${isLight ? 'text-[#122420]' : 'text-emerald-400'}`}>9</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#A9BFA5]/70">Conversion:</span>
              <span className={`font-semibold ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>10.5%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 2-COLUMN ROW: CHANNEL PERFORMANCE & RECENT ACTIVITY */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: CHANNEL PERFORMANCE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#A9BFA5] font-semibold">
              CHANNEL PERFORMANCE
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('analytics', 'channel-performance')}
              className="text-[11px] font-mono text-[#A9BFA5] hover:text-[#E8E9D8] transition-colors"
            >
              View analytics &rarr;
            </button>
          </div>

          <div className={`p-4 sm:p-5 rounded-[2px] border space-y-3.5 ${
            isLight
              ? 'bg-white border-[#E2ECE0]'
              : 'bg-[#061816] border-[rgba(169,191,165,0.2)]'
          }`}>
            {channelPerformance.map((ch) => (
              <div 
                key={ch.name} 
                onClick={() => onNavigate('analytics', 'channel-performance')}
                className="group cursor-pointer space-y-1.5 p-2 rounded-[2px] hover:bg-[#0D2D2A]/30 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-medium tracking-wide ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'} group-hover:text-emerald-300 transition-colors`}>
                    {ch.name}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className={`font-semibold ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
                      {ch.count}
                    </span>
                    <span className="text-emerald-400 font-medium w-12 text-right">
                      {ch.growth}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#0D2D2A]/40 rounded-[1px] overflow-hidden">
                  <div 
                    className={`h-full ${ch.color} rounded-[1px] transition-all duration-500`}
                    style={{ width: `${ch.barPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: RECENT ACTIVITY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#A9BFA5] font-semibold">
              RECENT ACTIVITY
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('leads', 'all-leads')}
              className="text-[11px] font-mono text-[#A9BFA5] hover:text-[#E8E9D8] transition-colors"
            >
              Full log &rarr;
            </button>
          </div>

          <div className={`p-4 sm:p-5 rounded-[2px] border divide-y ${
            isLight
              ? 'bg-white border-[#E2ECE0] divide-[#E2ECE0]'
              : 'bg-[#061816] border-[rgba(169,191,165,0.2)] divide-[rgba(169,191,165,0.1)]'
          }`}>
            {recentActivities.map((act, index) => (
              <div 
                key={index}
                onClick={() => onNavigate(act.category as NavCategory, act.sub)}
                className="py-3 first:pt-0 last:pb-0 flex items-start space-x-3 cursor-pointer group hover:bg-[#0D2D2A]/20 transition-colors p-1.5 rounded-[2px]"
              >
                <span className="font-mono text-xs text-[#A9BFA5]/70 shrink-0 w-12 pt-0.5">
                  {act.time}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'} group-hover:text-emerald-300 transition-colors`}>
                      {act.title}
                    </span>
                    <span className="text-[10px] opacity-40 font-mono">→</span>
                  </div>
                  <p className="text-[11px] font-light text-[#A9BFA5]/80 truncate mt-0.5">
                    {act.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. QUICK ACTIONS SECTION */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-mono uppercase tracking-widest text-[#A9BFA5] font-semibold">
          QUICK ACTIONS
        </h2>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Action 1: + Create Campaign */}
          <button
            type="button"
            onClick={() => onNavigate('campaigns', 'create-campaign')}
            className={`px-4 py-2.5 text-xs font-mono font-medium rounded-[2px] border transition-all duration-150 cursor-pointer flex items-center space-x-2 ${
              isLight
                ? 'bg-[#143630] border-[#143630] text-white hover:bg-[#1E4D45]'
                : 'bg-[#E8E9D8] border-[#E8E9D8] text-[#071C1A] hover:bg-white font-semibold'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Campaign</span>
          </button>

          {/* Action 2: ✦ Create Content */}
          <button
            type="button"
            onClick={() => onNavigate('content', 'ai-content')}
            className={`px-4 py-2.5 text-xs font-mono font-medium rounded-[2px] border transition-all duration-150 cursor-pointer flex items-center space-x-2 ${
              isLight
                ? 'border-[#D0DDD0] bg-white text-[#122420] hover:bg-[#F8F9F5]'
                : 'border-[rgba(169,191,165,0.25)] bg-[#0D2D2A]/40 text-[#E8E9D8] hover:text-white hover:bg-[#0D2D2A]/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A9BFA5]" />
            <span>Create Content</span>
          </button>

          {/* Action 3: View Inbox */}
          <button
            type="button"
            onClick={() => onNavigate('engage', 'inbox')}
            className={`px-4 py-2.5 text-xs font-mono font-medium rounded-[2px] border transition-all duration-150 cursor-pointer flex items-center space-x-2 ${
              isLight
                ? 'border-[#D0DDD0] bg-white text-[#122420] hover:bg-[#F8F9F5]'
                : 'border-[rgba(169,191,165,0.25)] bg-[#0D2D2A]/40 text-[#E8E9D8] hover:text-white hover:bg-[#0D2D2A]/70'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#A9BFA5]" />
            <span>View Inbox</span>
          </button>

          {/* Action 4: + Add Lead */}
          <button
            type="button"
            onClick={() => onTriggerQuickAction('lead')}
            className={`px-4 py-2.5 text-xs font-mono font-medium rounded-[2px] border transition-all duration-150 cursor-pointer flex items-center space-x-2 ${
              isLight
                ? 'border-[#D0DDD0] bg-white text-[#122420] hover:bg-[#F8F9F5]'
                : 'border-[rgba(169,191,165,0.25)] bg-[#0D2D2A]/40 text-[#E8E9D8] hover:text-white hover:bg-[#0D2D2A]/70'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#A9BFA5]" />
            <span>Add Lead</span>
          </button>

          {/* Action 5: Schedule Post */}
          <button
            type="button"
            onClick={() => onTriggerQuickAction('schedule')}
            className={`px-4 py-2.5 text-xs font-mono font-medium rounded-[2px] border transition-all duration-150 cursor-pointer flex items-center space-x-2 ${
              isLight
                ? 'border-[#D0DDD0] bg-white text-[#122420] hover:bg-[#F8F9F5]'
                : 'border-[rgba(169,191,165,0.25)] bg-[#0D2D2A]/40 text-[#E8E9D8] hover:text-white hover:bg-[#0D2D2A]/70'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#A9BFA5]" />
            <span>Schedule Post</span>
          </button>
        </div>
      </section>
    </div>
  );
}
