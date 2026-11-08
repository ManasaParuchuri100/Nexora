import { PageHeader, Tabs } from '../ui';
import React, { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  ChevronDown, 
  Download, 
  Clock, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { SubCategory, StatMetric } from '../../types';

interface AnalyticsViewProps {
  activeSubCategory: SubCategory;
  onNavigateSub: (sub: SubCategory) => void;
  metrics: StatMetric[];
}

export type AnalyticsTab = 'overview' | 'leads' | 'channels' | 'activity';

export default function AnalyticsView({
  activeSubCategory,
  onNavigateSub,
  metrics
}: AnalyticsViewProps) {
  // Active Tab
  const initialTab: AnalyticsTab = 
    activeSubCategory === 'leads' || activeSubCategory === 'lead-analytics' ? 'leads' :
    activeSubCategory === 'channels' || activeSubCategory === 'channel-performance' ? 'channels' :
    activeSubCategory === 'activity-log' || activeSubCategory === 'stats' ? 'activity' : 'overview';

  const [currentTab, setCurrentTab] = useState<AnalyticsTab>(initialTab);
  const [dateRange, setDateRange] = useState('Last 30 days');

  return (
    <div className="space-y-[15px] pb-12 animate-fadeIn text-ink select-text">
      <PageHeader
        eyebrow="Intelligence / Analytics"
        title="Analytics"
        subtitle="See what is producing leads and where they are in the funnel."
        actions={
          <>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                aria-label="Date range"
                className="bg-surface border border-line text-ink px-3 py-1.5 rounded-[9px] focus:outline-none cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="7 days">7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="90 days">90 days</option>
                <option value="This quarter">This quarter</option>
              </select>
            </div>
            <button type="button" onClick={() => alert('Exporting CSV analytics data...')} className="nx-btn inline-flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </>
        }
      />

      <Tabs<AnalyticsTab>
        idPrefix="analytics"
        label="Analytics sections"
        value={currentTab}
        onChange={id => {
          setCurrentTab(id);
          onNavigateSub(id === 'activity' ? 'activity-log' : id);
        }}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'leads', label: 'Leads' },
          { id: 'channels', label: 'Channels' },
          { id: 'activity', label: 'Activity' },
        ]}
      />

      {/* ========================================================
          TAB 1: OVERVIEW (Page 32 spec)
         ======================================================== */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          
          {/* 5 KPI Cards Row (Page 32 spec) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-surface-raised border border-line rounded-[9px]">
              <span className="text-[10px] text-ink-2 uppercase font-semibold block">LEADS</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl text-ink font-light">86</span>
                <span className="text-xs text-ok font-semibold">↑ 18%</span>
              </div>
            </div>

            <div className="p-4 bg-surface-raised border border-line rounded-[9px]">
              <span className="text-[10px] text-ink-2 uppercase font-semibold block">QUALIFIED</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl text-ink font-light">31</span>
                <span className="text-xs text-ink-2">36%</span>
              </div>
            </div>

            <div className="p-4 bg-surface-raised border border-line rounded-[9px]">
              <span className="text-[10px] text-ink-2 uppercase font-semibold block">WON</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl text-ink font-light">9</span>
                <span className="text-xs text-ok font-semibold">10.5%</span>
              </div>
            </div>

            <div className="p-4 bg-surface-raised border border-line rounded-[9px]">
              <span className="text-[10px] text-ink-2 uppercase font-semibold block">REVENUE</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl text-ink font-light">₹8.6L</span>
                <span className="text-xs text-ok font-semibold">↑ 24%</span>
              </div>
            </div>

            <div className="p-4 bg-surface-raised border border-line rounded-[9px] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-ink-2 uppercase font-semibold block">AI HANDLED</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl text-ok font-light">71%</span>
                <span className="text-xs text-ink-2">Auto</span>
              </div>
            </div>
          </div>

          {/* Leads Over Time Chart Box */}
          <div className="p-5 bg-surface-raised border border-line rounded-[9px] space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-line-subtle">
              <span className="uppercase text-ink-2 font-semibold">LEADS OVER TIME</span>
              <div className="flex items-center space-x-4 text-[11px]">
                <span className="flex items-center space-x-1.5 text-ink">
                  <span className="w-3 h-0.5 bg-ok" />
                  <span>This period</span>
                </span>
                <span className="flex items-center space-x-1.5 text-ink-3">
                  <span className="w-3 h-0.5 border-t border-dashed border-line-strong" />
                  <span>Previous</span>
                </span>
              </div>
            </div>

            {/* Sparkline Histogram */}
            <div className="h-32 flex items-end justify-between gap-1.5 pt-4">
              {[22, 34, 45, 68, 52, 78, 86, 74, 62, 88, 92, 104, 96, 112].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div 
                    className="w-full bg-brand/30 group-hover:bg-brand transition-colors rounded-t-[1px]"
                    style={{ height: `${(val / 112) * 100}%` }}
                  />
                  <span className="text-[9px] text-ink-3">{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Column: Funnel & Response */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            <div className="p-5 bg-surface-raised border border-line rounded-[9px] space-y-3">
              <span className="uppercase text-ink-2 font-semibold block pb-2 border-b border-line-subtle">
                FUNNEL CONVERSION
              </span>
              <div className="space-y-2 text-ink">
                <div className="flex justify-between"><span>New (86)</span><span>100%</span></div>
                <div className="flex justify-between"><span>Engaged (54)</span><span>63%</span></div>
                <div className="flex justify-between"><span>Qualified (31)</span><span>36%</span></div>
                <div className="flex justify-between"><span>Contacted (18)</span><span>21%</span></div>
                <div className="flex justify-between text-ok font-semibold"><span>Won (9)</span><span>10.5%</span></div>
              </div>
            </div>

            <div className="p-5 bg-surface-raised border border-line rounded-[9px] space-y-3">
              <span className="uppercase text-ink-2 font-semibold block pb-2 border-b border-line-subtle">
                SPEED & RESPONSE METRICS
              </span>
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-ink-2">Median first reply</span>
                  <span className="text-ok font-bold text-sm">40 s</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-ink-2">Handoffs triggered</span>
                  <span className="text-ink font-bold text-sm">23</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-ink-2">Median human reply</span>
                  <span className="text-warn font-bold text-sm">6 min</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: LEADS (Page 33 spec)
         ======================================================== */}
      {currentTab === 'leads' && (
        <div className="space-y-5 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* By Source */}
            <div className="p-5 bg-surface-raised border border-line rounded space-y-3">
              <span className="uppercase text-ink-2 font-semibold block pb-2 border-b border-line-subtle">
                BY SOURCE
              </span>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="w-24">WhatsApp</span>
                  <div className="flex-1 bg-surface h-2.5 mx-3 rounded"><div className="bg-ok h-full w-[100%]" /></div>
                  <span className="w-8 text-right font-bold">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-24">Instagram</span>
                  <div className="flex-1 bg-surface h-2.5 mx-3 rounded"><div className="bg-pink-400 h-full w-[64%]" /></div>
                  <span className="w-8 text-right font-bold">27</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-24">Website</span>
                  <div className="flex-1 bg-surface h-2.5 mx-3 rounded"><div className="bg-teal-400 h-full w-[43%]" /></div>
                  <span className="w-8 text-right font-bold">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-24">LinkedIn</span>
                  <div className="flex-1 bg-surface h-2.5 mx-3 rounded"><div className="bg-sky-400 h-full w-[26%]" /></div>
                  <span className="w-8 text-right font-bold">11</span>
                </div>
              </div>
            </div>

            {/* By Campaign */}
            <div className="p-5 bg-surface-raised border border-line rounded space-y-3">
              <span className="uppercase text-ink-2 font-semibold block pb-2 border-b border-line-subtle">
                BY CAMPAIGN
              </span>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="w-32 truncate">Diwali offer</span>
                  <div className="flex-1 bg-surface h-2.5 mx-3 rounded"><div className="bg-amber-400 h-full w-[100%]" /></div>
                  <span className="w-8 text-right font-bold">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-32 truncate">Reactivate 2025</span>
                  <div className="flex-1 bg-surface h-2.5 mx-3 rounded"><div className="bg-ok h-full w-[42%]" /></div>
                  <span className="w-8 text-right font-bold">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="w-32 truncate">No campaign</span>
                  <div className="flex-1 bg-surface h-2.5 mx-3 rounded"><div className="bg-brand h-full w-[61%]" /></div>
                  <span className="w-8 text-right font-bold">26</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-5 bg-surface-raised border border-line rounded space-y-2">
              <span className="uppercase text-ink-2 font-semibold block pb-1 border-b border-line-subtle">
                TIME IN STAGE (MEDIAN DAYS)
              </span>
              <p className="text-ink pt-2 leading-relaxed">
                New: 0.5d · Engaged: 1.2d · Qualified: 3.4d · Contacted: 6.0d
              </p>
            </div>

            <div className="p-5 bg-surface-raised border border-line rounded space-y-2">
              <span className="uppercase text-ink-2 font-semibold block pb-1 border-b border-line-subtle">
                LOST REASONS
              </span>
              <p className="text-ink-2 pt-2 leading-relaxed">
                Price: 9 · No reply: 7 · Timing: 4 · Chose competitor: 3
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: CHANNELS (Page 33 spec)
         ======================================================== */}
      {currentTab === 'channels' && (
        <div className="space-y-4 text-xs">
          <div className="border border-line bg-surface-raised rounded overflow-x-auto">
            <div className="min-w-[700px] grid grid-cols-12 px-5 py-3 bg-surface border-b border-line-subtle text-[10px] uppercase font-semibold text-ink-2">
              <div className="col-span-3">Channel</div>
              <div className="col-span-2 text-right">Conversations</div>
              <div className="col-span-2 text-right">Leads</div>
              <div className="col-span-2 text-right">Qualified</div>
              <div className="col-span-1 text-right">Won</div>
              <div className="col-span-1 text-right">Conv. %</div>
              <div className="col-span-1 text-right">Avg reply</div>
            </div>

            <div className="divide-y divide-line-subtle">
              {[
                { name: 'WhatsApp', conv: 120, leads: 42, qual: 18, won: 4, convRate: '43%', reply: '35 s' },
                { name: 'Instagram', conv: 84, leads: 27, qual: 8, won: 2, convRate: '30%', reply: '1m 10s' },
                { name: 'Website', conv: 51, leads: 18, qual: 4, won: 2, convRate: '22%', reply: '50 s' },
                { name: 'LinkedIn', conv: 30, leads: 11, qual: 5, won: 1, convRate: '45%', reply: '4 min' }
              ].map(c => (
                <div key={c.name} className="min-w-[700px] grid grid-cols-12 px-5 py-3 items-center hover:bg-surface-hover">
                  <div className="col-span-3 font-semibold text-ink">{c.name}</div>
                  <div className="col-span-2 text-right text-ink-2">{c.conv}</div>
                  <div className="col-span-2 text-right text-ink font-bold">{c.leads}</div>
                  <div className="col-span-2 text-right text-ok font-bold">{c.qual}</div>
                  <div className="col-span-1 text-right text-ink">{c.won}</div>
                  <div className="col-span-1 text-right text-ok">{c.convRate}</div>
                  <div className="col-span-1 text-right text-ink-2">{c.reply}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-surface-raised border border-emerald-500/30 rounded text-xs text-emerald-200">
            ✦ Insight: WhatsApp brings the most qualified leads; LinkedIn converts best.
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: ACTIVITY (Page 33 spec)
         ======================================================== */}
      {currentTab === 'activity' && (
        <div className="space-y-4 text-xs">
          <div className="p-5 bg-surface-raised border border-line rounded space-y-4">
            <span className="uppercase text-ink-2 font-semibold block pb-2 border-b border-line-subtle">
              TODAY'S ACTIVITY LOG
            </span>

            <div className="divide-y divide-line-subtle">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-ink-2">10:42</span>
                  <span className="text-ok">＋</span>
                  <span className="text-ink">New WhatsApp lead · Rahul Sharma</span>
                </div>
                <span className="text-ok hover:underline cursor-pointer">[Open]</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-ink-2">10:36</span>
                  <span className="text-ok">✦</span>
                  <span className="text-ink">AI qualified Aster Labs as Hot · score 92</span>
                </div>
                <span className="text-ok hover:underline cursor-pointer">[Open]</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-ink-2">10:18</span>
                  <span className="text-warn">👤</span>
                  <span className="text-ink">Handoff requested · John Carter · Instagram</span>
                </div>
                <span className="text-ok hover:underline cursor-pointer">[Open]</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
