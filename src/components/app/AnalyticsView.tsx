import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { NavCategory, StatMetric, SubCategory } from '../../types';
import { AIInsight, EmptyState, PageHeader, Tabs } from '../ui';
import { AnalyticsData, Point, RANGES, RangeId, getAnalytics, toCsv } from '../../data/analyticsDemo';

interface AnalyticsViewProps {
  activeSubCategory: SubCategory;
  onNavigateSub: (sub: SubCategory) => void;
  metrics?: StatMetric[];
  isFirstRun?: boolean;
  onNavigateTo?: (category: NavCategory, sub?: SubCategory) => void;
  onNotify?: (title: string, desc: string) => void;
}

export type AnalyticsTab = 'overview' | 'leads' | 'channels' | 'activity';

const ACTIVITY_LABEL: Record<string, string> = {
  lead: 'New lead',
  ai: 'AI',
  handoff: 'Handoff',
  followup: 'Follow-up',
  call: 'Call',
  campaign: 'Campaign',
};

/* ---------------------------------------------------------------- */
/*  Charts                                                           */
/* ---------------------------------------------------------------- */
function LineChart({ current, previous }: { current: Point[]; previous: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  // Draw at the real width of the panel so the chart keeps a steady height and readable text.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(720);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setW(Math.max(320, Math.round(el.clientWidth)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 190;
  const pad = { l: 34, r: 28, t: 10, b: 24 };
  const max = Math.max(1, ...current.map(p => p.value), ...previous.map(p => p.value));
  const niceMax = Math.ceil(max / 4) * 4 || 4;
  const x = (i: number) => pad.l + (current.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (current.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - v / niceMax) * (H - pad.t - pad.b);
  const path = (pts: Point[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${path(current)} L${x(current.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(t * niceMax));
  const step = Math.max(1, Math.ceil(current.length / 8));
  const hp = hover !== null ? current[hover] : null;

  return (
    <div className="relative" ref={box}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-label="Leads over time, this period against the previous period"
        onMouseLeave={() => setHover(null)}
        onMouseMove={e => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const rel = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((rel - pad.l) / (W - pad.l - pad.r)) * (current.length - 1));
          setHover(Math.min(current.length - 1, Math.max(0, i)));
        }}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" />
            <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--text-muted)">{t}</text>
          </g>
        ))}
        <path d={area} fill="var(--accent-subtle)" />
        <path d={path(previous)} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d={path(current)} fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinejoin="round" />
        {current.map((p, i) => (current.length - 1 - i) % step === 0 && (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{p.label}</text>
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--border-strong)" />
            <circle cx={x(hover)} cy={y(current[hover].value)} r="4" fill="var(--primary)" />
          </g>
        )}
      </svg>
      {hp && hover !== null && (
        <div className="absolute top-1 right-2 text-[11px] bg-surface border border-line rounded-[8px] px-2.5 py-1.5 shadow-pop pointer-events-none">
          <div className="font-bold text-ink">{hp.label}</div>
          <div className="text-brand">This period: {hp.value}</div>
          <div className="text-ink-3">Previous: {previous[hover]?.value ?? '—'}</div>
        </div>
      )}
    </div>
  );
}

function BarRow({ label, value, max, suffix = '', tone = 'brand' }: { key?: React.Key; label: string; value: number; max: number; suffix?: string; tone?: 'brand' | 'warn' | 'danger' }) {
  const color = tone === 'warn' ? 'bg-warn' : tone === 'danger' ? 'bg-danger' : 'bg-brand';
  return (
    <div className="flex items-center gap-3 py-[7px] text-[12px]">
      <span className="w-[130px] shrink-0 text-ink-2 truncate">{label}</span>
      <div className="flex-1 h-[7px] rounded-full bg-surface-raised overflow-hidden" aria-hidden="true">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
      </div>
      <span className="w-[56px] text-right font-bold text-ink tabular-nums">{value}{suffix}</span>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="nx-panel nx-pad">
      <div className="nx-sectionhead"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div></div>
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Tabs                                                             */
/* ---------------------------------------------------------------- */
function Overview({ d, onGo }: { d: AnalyticsData; onGo: (cat: NavCategory, sub?: SubCategory) => void }) {
  const total = d.current.reduce((a, p) => a + p.value, 0);
  const prevTotal = d.previous.reduce((a, p) => a + p.value, 0);
  const best = [...d.sources].sort((a, b) => b.conv - a.conv)[0];
  const top = [...d.sources].sort((a, b) => b.leads - a.leads)[0];
  const drop = d.funnel.slice(1).map((f, i) => ({ from: d.funnel[i].stage, to: f.stage, lost: d.funnel[i].count - f.count })).sort((a, b) => b.lost - a.lost)[0];
  const click: Record<string, (() => void) | undefined> = {
    leads: () => onGo('leads', 'all-leads'),
    qualified: () => onGo('leads', 'all-leads'),
    won: () => onGo('leads', 'all-leads'),
    ai: () => onGo('inbox', 'inbox'),
  };

  return (
    <div className="grid gap-[15px]">
      <div className="nx-grid nx-metrics" style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))' }}>
        {d.kpis.map(k => {
          const action = click[k.id];
          const Tag: any = action ? 'button' : 'div';
          return (
            <Tag key={k.id} type={action ? 'button' : undefined} onClick={action} className={`nx-panel nx-metric text-left ${action ? 'cursor-pointer' : ''}`}>
              <div className="nx-label">{k.label}</div>
              <div className="nx-number">{k.value}</div>
              <div className={`nx-delta ${k.delta < 0 ? 'down' : ''}`}>
                {k.delta >= 0 ? '↑' : '↓'} {Math.abs(k.delta)}% <span className="text-ink-3 font-normal">vs previous</span>
              </div>
            </Tag>
          );
        })}
      </div>

      <AIInsight
        observation={`${top.name} brings the most leads (${top.leads}), and ${best.name} converts best (${best.conv}%). The biggest funnel drop is ${drop.from} to ${drop.to}.`}
        recommendation={`Reply faster on ${top.name} and review how leads are handled between ${drop.from} and ${drop.to}.`}
        evidence={`Based on ${total} leads in ${d.range.label.toLowerCase()} (${prevTotal} in the previous period)`}
        freshness="Sample workspace data"
        action={{ label: 'Open leads', onClick: () => onGo('leads', 'all-leads') }}
      />

      <Panel title="Leads over time" sub={`${total} leads · previous period ${prevTotal}`}>
        <div className="flex items-center gap-4 text-[11px] text-ink-3 mb-2">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-[3px] bg-brand rounded" />This period</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 border-t-2 border-dashed border-ink-3" />Previous period</span>
        </div>
        <LineChart current={d.current} previous={d.previous} />
      </Panel>

      <div className="nx-grid nx-two">
        <Panel title="Funnel conversion" sub="Share of new leads reaching each stage.">
          {d.funnel.map(f => (
            <BarRow key={f.stage} label={`${f.stage} (${f.count})`} value={f.rate} max={100} suffix="%" tone={f.stage === 'Won' ? 'brand' : 'brand'} />
          ))}
        </Panel>
        <Panel title="Speed and response" sub="How quickly customers get an answer.">
          <div className="nx-kv"><span>Median first reply</span><strong className="text-ok">{d.speed.firstReply}</strong></div>
          <div className="nx-kv"><span>Handoffs to a person</span><strong className="text-ink">{d.speed.handoffs}</strong></div>
          <div className="nx-kv"><span>Median human reply</span><strong className="text-warn">{d.speed.humanReply}</strong></div>
          <div className="nx-kv"><span>Handled by AI</span><strong className="text-ink">{d.speed.aiShare}%</strong></div>
          <div className="nx-split" />
          <button type="button" className="nx-btn sm" onClick={() => onGo('inbox', 'waiting-human')}>Review handoffs →</button>
        </Panel>
      </div>
    </div>
  );
}

function LeadsTab({ d, onGo }: { d: AnalyticsData; onGo: (cat: NavCategory, sub?: SubCategory) => void }) {
  const maxSrc = Math.max(...d.sources.map(s => s.leads));
  const maxCamp = Math.max(...d.campaigns.map(c => c.leads));
  const maxLost = Math.max(...d.lost.map(l => l.count));
  const maxTime = Math.max(...d.timeInStage.map(t => t.days));
  const biggestLoss = [...d.lost].sort((a, b) => b.count - a.count)[0];
  const lostTotal = d.lost.reduce((a, l) => a + l.count, 0);
  return (
    <div className="grid gap-[15px]">
      <AIInsight
        observation={`${biggestLoss.reason} is the top reason for lost leads (${biggestLoss.count} of ${lostTotal}).`}
        recommendation={biggestLoss.reason === 'Price' ? 'Share a clear price range earlier in the conversation and review the pricing answers in AI knowledge.' : 'Review the follow-up cadence for these leads.'}
        evidence={`${lostTotal} lost leads in ${d.range.label.toLowerCase()}`}
        freshness="Sample workspace data"
        action={{ label: 'Review follow-ups', onClick: () => onGo('leads', 'follow-ups') }}
      />
      <div className="nx-grid nx-two">
        <Panel title="By source" sub="Where leads come from.">
          {d.sources.map(s => <BarRow key={s.name} label={s.name} value={s.leads} max={maxSrc} />)}
        </Panel>
        <Panel title="By campaign" sub="Leads linked to a campaign. Leads without tracking show as “No campaign”.">
          {d.campaigns.map(c => <BarRow key={c.name} label={c.name} value={c.leads} max={maxCamp} tone={c.name === 'No campaign' ? 'warn' : 'brand'} />)}
        </Panel>
        <Panel title="Time in stage" sub="Median days a lead stays in each stage.">
          {d.timeInStage.map(t => <BarRow key={t.stage} label={t.stage} value={t.days} max={maxTime} suffix="d" />)}
        </Panel>
        <Panel title="Lost reasons" sub="Why leads were closed as lost.">
          {d.lost.map(l => <BarRow key={l.reason} label={l.reason} value={l.count} max={maxLost} tone="danger" />)}
        </Panel>
      </div>
    </div>
  );
}

function ChannelsTab({ d }: { d: AnalyticsData }) {
  const best = [...d.sources].sort((a, b) => b.conv - a.conv)[0];
  const most = [...d.sources].sort((a, b) => b.leads - a.leads)[0];
  return (
    <div className="grid gap-[15px]">
      <AIInsight
        observation={`${most.name} brings the most qualified leads (${[...d.sources].sort((a, b) => b.qualified - a.qualified)[0].qualified}); ${best.name} converts best at ${best.conv}%.`}
        recommendation={`Keep investing in ${most.name} and test what ${best.name} does differently.`}
        evidence={`${d.sources.reduce((a, s) => a + s.leads, 0)} leads across ${d.sources.length} channels`}
        freshness="Sample workspace data"
      />
      <section className="nx-panel overflow-x-auto">
        <table className="w-full min-w-[640px] [&_th]:px-5 [&_td]:px-5 [&_th:first-child]:text-left">
          <thead>
            <tr><th>Channel</th><th className="text-right">Conversations</th><th className="text-right">Leads</th><th className="text-right">Qualified</th><th className="text-right">Won</th><th className="text-right">Conv. %</th><th className="text-right">Avg first reply</th></tr>
          </thead>
          <tbody>
            {d.sources.map(s => (
              <tr key={s.name}>
                <td className="font-semibold text-ink">{s.name}</td>
                <td className="text-right tabular-nums">{s.conversations}</td>
                <td className="text-right tabular-nums font-bold text-ink">{s.leads}</td>
                <td className="text-right tabular-nums text-brand">{s.qualified}</td>
                <td className="text-right tabular-nums">{s.won}</td>
                <td className="text-right tabular-nums text-ok">{s.conv}%</td>
                <td className="text-right tabular-nums">{s.reply}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ActivityTab({ d, onGo }: { d: AnalyticsData; onGo: (cat: NavCategory, sub?: SubCategory) => void }) {
  const [filter, setFilter] = useState('All');
  const types = ['All', ...Array.from(new Set(d.activity.map(a => a.type)))];
  const rows = d.activity.filter(a => filter === 'All' || a.type === filter);
  return (
    <section className="nx-panel nx-pad">
      <div className="nx-sectionhead"><div><h2>Activity log</h2><p>What your team and the AI did, newest first.</p></div></div>
      <div className="flex flex-wrap gap-[7px] mb-3" role="group" aria-label="Filter activity">
        {types.map(t => (
          <button key={t} type="button" aria-pressed={filter === t} className={`nx-chip ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'All' ? 'All' : ACTIVITY_LABEL[t] || t}
          </button>
        ))}
      </div>
      <div className="border-t border-line">
        {rows.map(a => (
          <div key={a.id} className="nx-row">
            <span className="text-[11px] text-ink-3 w-[70px] shrink-0 tabular-nums">{a.when}</span>
            <span className="nx-tag shrink-0">{ACTIVITY_LABEL[a.type] || a.type}</span>
            <div className="flex-1 min-w-0 text-[12px] text-ink">{a.text}</div>
            <button type="button" className="nx-inline-link shrink-0" onClick={() => onGo(a.go.category as NavCategory, a.go.sub as SubCategory)}>Open →</button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-[12px] text-ink-3 py-6 text-center m-0">No activity of this type.</p>}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

export default function AnalyticsView({
  activeSubCategory,
  onNavigateSub,
  isFirstRun = false,
  onNavigateTo,
  onNotify,
}: AnalyticsViewProps) {
  const initialTab: AnalyticsTab =
    activeSubCategory === 'leads' || activeSubCategory === 'lead-analytics' ? 'leads' :
    activeSubCategory === 'channels' || activeSubCategory === 'channel-performance' ? 'channels' :
    activeSubCategory === 'activity-log' || activeSubCategory === 'stats' ? 'activity' : 'overview';

  const [tab, setTab] = useState<AnalyticsTab>(initialTab);
  const [rangeId, setRangeId] = useState<RangeId>('30d');
  const data = useMemo(() => getAnalytics(rangeId), [rangeId]);
  const go = (cat: NavCategory, sub?: SubCategory) => onNavigateTo?.(cat, sub);

  const exportCsv = () => {
    const { name, rows } = toCsv(data, tab);
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = rows.map(r => r.map(esc).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.('Export ready', `${name}.csv was downloaded.`);
  };

  return (
    <div className="space-y-[15px] pb-12 animate-fadeIn text-ink select-text">
      <PageHeader
        eyebrow="Intelligence / Analytics"
        title="Analytics"
        subtitle="See what is producing leads and where they are in the funnel."
        actions={
          <>
            <select value={rangeId} onChange={e => setRangeId(e.target.value as RangeId)} aria-label="Date range" className="bg-surface border border-line text-ink px-3 py-1.5 rounded-[9px] cursor-pointer">
              {RANGES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <button type="button" onClick={exportCsv} disabled={isFirstRun} className="nx-btn inline-flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      <Tabs<AnalyticsTab>
        idPrefix="analytics"
        label="Analytics sections"
        value={tab}
        onChange={id => { setTab(id); onNavigateSub(id === 'activity' ? 'activity-log' : id); }}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'leads', label: 'Leads' },
          { id: 'channels', label: 'Channels' },
          { id: 'activity', label: 'Activity' },
        ]}
      />

      {isFirstRun ? (
        <EmptyState
          title="No analytics yet"
          description="Numbers appear here once leads start coming in from your connected channels."
          action={<button type="button" className="nx-btn primary" onClick={() => go('settings', 'channels' as SubCategory)}>Connect a channel</button>}
        />
      ) : (
        <div role="tabpanel" id={`analytics-panel-${tab}`} aria-labelledby={`analytics-tab-${tab}`}>
          {tab === 'overview' && <Overview d={data} onGo={go} />}
          {tab === 'leads' && <LeadsTab d={data} onGo={go} />}
          {tab === 'channels' && <ChannelsTab d={data} />}
          {tab === 'activity' && <ActivityTab d={data} onGo={go} />}
        </div>
      )}
    </div>
  );
}
