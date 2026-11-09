import React, { useState } from 'react';
import { NavCategory, SubCategory } from '../../types';
import { AIInsight, Badge, EmptyState, PageHeader, StatusBadge, Tabs } from '../ui';
import {
  COMPETITORS, KEYWORDS, REC_STATE_KEY, RECOMMENDATIONS, RecStatus, SOURCES, SOURCE_STATE_KEY,
} from '../../data/marketIntel';
import { usePersisted } from './settings/store';

type Tab = 'recommendations' | 'competitors' | 'trends' | 'sources';

interface Props {
  activeSubCategory: SubCategory;
  onNavigateSub: (sub: SubCategory) => void;
  onNavigateTo?: (category: NavCategory, sub?: SubCategory) => void;
  onNotify?: (title: string, desc: string) => void;
  isFirstRun?: boolean;
}

const tabFor = (sub: SubCategory): Tab =>
  sub === 'competitors' ? 'competitors' : sub === 'trends' ? 'trends' : sub === 'sources' ? 'sources' : 'recommendations';

function Spark({ data, up }: { data: number[]; up: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${18 - ((v - min) / (max - min || 1)) * 16}`).join(' ');
  return (
    <svg width="64" height="20" viewBox="0 0 64 20" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={up ? 'var(--success)' : 'var(--text-muted)'} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const REC_STAGES: Array<{ id: RecStatus; label: string }> = [
  { id: 'New', label: 'Proposed' },
  { id: 'Approved', label: 'Approved' },
  { id: 'Executed', label: 'Actioned' },
];

/* ---------------------------------------------------------------- */
function Recommendations({ onNavigateTo, onNotify }: Pick<Props, 'onNavigateTo' | 'onNotify'>) {
  const [state, setState] = usePersisted<Record<string, RecStatus>>(REC_STATE_KEY, {});
  const [showDismissed, setShowDismissed] = useState(false);
  const statusOf = (id: string): RecStatus => state[id] ?? 'New';
  const set = (id: string, s: RecStatus) => setState(prev => ({ ...prev, [id]: s }));

  const visible = RECOMMENDATIONS.filter(r => showDismissed || statusOf(r.id) !== 'Dismissed');
  const dismissed = RECOMMENDATIONS.filter(r => statusOf(r.id) === 'Dismissed').length;

  const run = (id: string, kind: string) => {
    set(id, 'Executed');
    onNotify?.('Action started', 'We marked this recommendation as actioned. Check back in about 7 days to see what changed.');
    if (kind === 'content') onNavigateTo?.('content', 'create');
    else if (kind === 'campaign') onNavigateTo?.('campaigns', 'campaign-list');
    else if (kind === 'follow-ups') onNavigateTo?.('leads', 'follow-ups');
  };

  return (
    <div className="grid gap-[15px]">
      <p className="text-[12px] text-ink-3 m-0 max-w-[720px]">
        Nexora watches public sources and your own data, then proposes what to do next. Nothing runs until you approve it.
      </p>
      {visible.length === 0 && (
        <EmptyState title="No open recommendations" description="New ones appear as Nexora spots a change that matters to your business." />
      )}
      {visible.map(r => {
        const st = statusOf(r.id);
        const stageIdx = REC_STAGES.findIndex(x => x.id === st);
        return (
          <section key={r.id} className={`nx-panel nx-pad ${st === 'Dismissed' ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="font-display text-[15px] font-bold text-ink m-0">{r.title}</h2>
                <p className="text-[11px] text-ink-3 mt-1 mb-0">Seen {r.seen} · relevance {r.relevance.toLowerCase()}</p>
              </div>
              {st === 'Dismissed' ? <Badge>Dismissed</Badge> : (
                <ol className="flex items-center gap-1.5 m-0 p-0 list-none" aria-label="Progress">
                  {REC_STAGES.map((s, i) => (
                    <li key={s.id} className={`text-[10px] font-bold px-2 py-1 rounded-[6px] ${i <= stageIdx ? 'bg-brand-soft text-brand' : 'bg-surface-raised text-ink-3'}`}>{s.label}</li>
                  ))}
                </ol>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[1px] text-ink-3 mb-1">Observation</div>
                <p className="text-[12px] text-ink m-0 leading-[1.6]">{r.observation}</p>
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[1px] text-brand mb-1">Recommendation</div>
                <p className="text-[12px] text-ink-2 m-0 leading-[1.6]">{r.recommendation}</p>
              </div>
            </div>
            <details className="mt-3 text-[12px]">
              <summary className="cursor-pointer text-ink-3 font-bold">Evidence ({r.evidence.length})</summary>
              <ul className="m-0 mt-1.5 pl-4 text-ink-2 leading-[1.7]">{r.evidence.map(e => <li key={e}>{e}</li>)}</ul>
            </details>
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-line">
              {st === 'New' && (
                <>
                  <button type="button" className="nx-btn primary sm" onClick={() => { set(r.id, 'Approved'); onNotify?.('Approved', `“${r.title}” is ready to action.`); }}>Approve</button>
                  <button type="button" className="nx-btn sm" onClick={() => set(r.id, 'Dismissed')}>Dismiss</button>
                </>
              )}
              {st === 'Approved' && (
                <>
                  <button type="button" className="nx-btn primary sm" onClick={() => run(r.id, r.action.kind)}>{r.action.label} →</button>
                  <button type="button" className="nx-btn sm" onClick={() => set(r.id, 'New')}>Undo approval</button>
                </>
              )}
              {st === 'Executed' && (
                <>
                  <span className="text-[12px] text-ok font-bold">Actioned · measuring the result</span>
                  <button type="button" className="nx-btn sm ml-auto" onClick={() => run(r.id, r.action.kind)}>{r.action.label} again →</button>
                </>
              )}
              {st === 'Dismissed' && <button type="button" className="nx-btn sm" onClick={() => set(r.id, 'New')}>Restore</button>}
            </div>
          </section>
        );
      })}
      {dismissed > 0 && (
        <button type="button" className="nx-inline-link justify-self-start" onClick={() => setShowDismissed(v => !v)}>
          {showDismissed ? 'Hide' : 'Show'} {dismissed} dismissed
        </button>
      )}
    </div>
  );
}

function Competitors() {
  return (
    <div className="grid gap-[15px]">
      <AIInsight
        observation="Two competitors changed their offer or pricing this week."
        recommendation="Review how your consultation offer and starting price compare before your next campaign."
        evidence="From public pages and the Meta Ad Library"
        freshness="Checked 2 days ago · sample data"
      />
      <div className="nx-callout block!">
        <strong className="text-ink text-[12px]">What this shows</strong>
        <p className="text-[12px] text-ink-2 m-0 mt-1">Only public information. Competitors’ private ad results and who searched for them cannot be seen, so they are never estimated here.</p>
      </div>
      <div className="nx-grid nx-two">
        {COMPETITORS.map(c => (
          <section key={c.id} className="nx-panel nx-pad">
            <div className="nx-sectionhead"><div><h2>{c.name}</h2><p>{c.segment}</p></div></div>
            <div className="nx-kv"><span>Active ads</span><strong className="text-ink">{c.activeAds}</strong></div>
            <div className="nx-kv"><span>Posts per week</span><strong className="text-ink">{c.postsPerWeek}</strong></div>
            <div className="nx-kv"><span>Price signal</span><strong className="text-ink text-right">{c.priceSignal}</strong></div>
            <div className="nx-split" />
            <div className="eyebrow mb-1">Recent changes</div>
            {c.changes.map(ch => (
              <div key={ch.text} className="py-2 border-t border-line first:border-t-0">
                <p className="text-[12px] text-ink m-0 leading-[1.55]">{ch.text}</p>
                <p className="text-[11px] text-ink-3 mt-1 mb-0">{ch.source} · {ch.seen} · relevance {ch.relevance.toLowerCase()}</p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function Trends({ onNavigateTo }: Pick<Props, 'onNavigateTo'>) {
  const [sources] = usePersisted<Record<string, boolean>>(SOURCE_STATE_KEY, {});
  const gsc = sources['gsc'] ?? false;
  const gaps = KEYWORDS.filter(k => k.position === null && k.change > 20);
  return (
    <div className="grid gap-[15px]">
      <AIInsight
        observation={`${gaps.length} rising searches have no page of yours in the results: ${gaps.map(g => `“${g.term}”`).join(', ')}.`}
        recommendation="Create one useful page or post for each. We can't promise a ranking, but covering what people ask is the reliable way to appear."
        evidence="Search demand, sample data"
        freshness={gsc ? 'Your Search Console positions' : 'Connect Search Console to see your real positions'}
        action={{ label: 'Create content', onClick: () => onNavigateTo?.('content', 'create') }}
      />
      <section className="nx-panel overflow-x-auto">
        <table className="w-full min-w-[640px] [&_th]:px-5 [&_td]:px-5 [&_th:first-child]:text-left">
          <thead><tr><th>Keyword</th><th className="text-right">Searches / month</th><th className="text-right">Change</th><th>Trend</th><th className="text-right">Your position</th><th>Intent</th></tr></thead>
          <tbody>
            {KEYWORDS.map(k => (
              <tr key={k.term}>
                <td className="font-semibold text-ink">{k.term}</td>
                <td className="text-right tabular-nums">{k.searches.toLocaleString('en-IN')}</td>
                <td className={`text-right tabular-nums ${k.change >= 0 ? 'text-ok' : 'text-danger'}`}>{k.change >= 0 ? '+' : ''}{k.change}%</td>
                <td><Spark data={k.trend} up={k.change >= 0} /></td>
                <td className="text-right tabular-nums">{k.position ?? <span className="text-ink-3">Not ranking</span>}</td>
                <td><span className="nx-tag">{k.intent}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="text-[11px] text-ink-3 m-0">Search demand is sample data. Positions are real only after Google Search Console is connected.</p>
    </div>
  );
}

function Sources({ onNotify }: Pick<Props, 'onNotify'>) {
  const [state, setState] = usePersisted<Record<string, boolean>>(SOURCE_STATE_KEY, {});
  return (
    <section className="nx-panel nx-pad">
      <div className="nx-sectionhead"><div><h2>Data sources</h2><p>Only sources you connect, and public pages, are used.</p></div></div>
      <div className="border-t border-line">
        {SOURCES.map(s => {
          const connected = s.connectable ? state[s.id] ?? s.connected : s.connected;
          return (
            <div key={s.id} className="nx-row">
              <div className="flex-1 min-w-0"><strong>{s.name}</strong><p>{s.detail}</p></div>
              <StatusBadge status={connected ? 'Connected' : 'Disconnected'} label={connected ? (s.connectable ? 'Connected' : 'Public, always on') : 'Not connected'} />
              {s.connectable && (
                <button type="button" className="nx-btn sm" onClick={() => { setState(p => ({ ...p, [s.id]: !connected })); onNotify?.(connected ? 'Disconnected' : 'Connected (demo)', `${s.name} ${connected ? 'was disconnected' : 'is now connected in this demo'}.`); }}>
                  {connected ? 'Disconnect' : 'Connect'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-ink-3 mt-3 mb-0">Connecting is simulated here. A live connection needs authorization from Google.</p>
    </section>
  );
}

export default function MarketIntelligenceView({ activeSubCategory, onNavigateSub, onNavigateTo, onNotify, isFirstRun }: Props) {
  const [tab, setTab] = useState<Tab>(tabFor(activeSubCategory));
  return (
    <div className="space-y-[15px] pb-12 animate-fadeIn text-ink">
      <PageHeader
        eyebrow="Intelligence / Market Intelligence"
        title="Market Intelligence"
        subtitle="What is changing in your market, and what to do about it."
      />
      <Tabs<Tab>
        idPrefix="market"
        label="Market intelligence sections"
        value={tab}
        onChange={id => { setTab(id); onNavigateSub(id as SubCategory); }}
        tabs={[
          { id: 'recommendations', label: 'Recommendations' },
          { id: 'competitors', label: 'Competitors' },
          { id: 'trends', label: 'Trends & SEO' },
          { id: 'sources', label: 'Sources' },
        ]}
      />
      {isFirstRun && tab !== 'sources' ? (
        <EmptyState
          title="Nothing to show yet"
          description="Connect a data source and tell Nexora who your competitors are. Insights appear as soon as there is something to compare."
          action={<button type="button" className="nx-btn primary" onClick={() => { setTab('sources'); onNavigateSub('sources' as SubCategory); }}>Open sources</button>}
        />
      ) : (
        <div role="tabpanel" id={`market-panel-${tab}`} aria-labelledby={`market-tab-${tab}`}>
          {tab === 'recommendations' && <Recommendations onNavigateTo={onNavigateTo} onNotify={onNotify} />}
          {tab === 'competitors' && <Competitors />}
          {tab === 'trends' && <Trends onNavigateTo={onNavigateTo} />}
          {tab === 'sources' && <Sources onNotify={onNotify} />}
        </div>
      )}
    </div>
  );
}
