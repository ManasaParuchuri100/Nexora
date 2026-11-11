import React, { useState } from 'react';
import { Campaign, CampaignBlueprint, GeneratedAsset } from '../../types';
import { AIInsight, PageHeader, StatusBadge, TabPanel, Tabs } from '../ui';
import { ChannelLogo, ChannelBrand } from '../ui/ChannelLogo';

const BRAND_OF: Record<string, ChannelBrand> = {
  instagram: 'instagram', linkedin: 'linkedin', website: 'website', whatsapp: 'whatsapp',
};
function Logo({ name }: { name: string }) {
  const b = BRAND_OF[name.toLowerCase()];
  return b ? <ChannelLogo brand={b} className="w-3 h-3" /> : null;
}

interface CampaignBlueprintViewProps {
  blueprint: CampaignBlueprint;
  onBack: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
  onStartCampaign?: () => void;
  onNavigateToModule?: (module: string, sub?: string) => void;
  /** The campaign record, when known. Adds status and results. */
  campaign?: Campaign;
  /** Library content linked to this campaign. */
  linkedAssets?: GeneratedAsset[];
}

type Tab = 'plan' | 'content' | 'leads' | 'results';
const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'plan', label: 'Plan' },
  { id: 'content', label: 'Content' },
  { id: 'leads', label: 'Leads' },
  { id: 'results', label: 'Results' },
];

const EXEC_GROUPS: Array<{ key: keyof CampaignBlueprint['execution']; label: string }> = [
  { key: 'strategy', label: 'Strategy' },
  { key: 'creative', label: 'Creative' },
  { key: 'social', label: 'Social' },
  { key: 'leadGeneration', label: 'Lead generation' },
  { key: 'launch', label: 'Launch' },
  { key: 'optimization', label: 'Optimization' },
];

const fmtDate = (s: string) => s.replace(/&rarr;/g, '→');

function KV({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="nx-kv">
      <span>{k}</span>
      <strong className="text-ink text-[13px] font-semibold text-right max-w-[62%]">{children}</strong>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="nx-panel nx-pad">
      <div className="nx-sectionhead">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="m-0 p-0 list-none">
      {items.map(i => (
        <li key={i} className="flex gap-2.5 py-[9px] border-t border-line first:border-t-0 text-[13px] text-ink-2 leading-[1.55]">
          <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-brand shrink-0" />
          {i}
        </li>
      ))}
    </ul>
  );
}

export default function CampaignBlueprintView({
  blueprint,
  onBack,
  onEdit,
  onRegenerate,
  onStartCampaign,
  onNavigateToModule,
  campaign,
  linkedAssets = [],
}: CampaignBlueprintViewProps) {
  const [tab, setTab] = useState<Tab>('plan');
  const [openPhase, setOpenPhase] = useState<string | null>(blueprint.roadmap[0]?.id ?? null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState('');

  const flash = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(''), 2600);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprint.campaignName.toLowerCase().replace(/\s+/g, '-')}-plan.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('Plan exported');
  };

  const o = blueprint.overview;
  const s = blueprint.strategy;
  const execTotal = EXEC_GROUPS.reduce((n, g) => n + blueprint.execution[g.key].length, 0);
  const execDone = Object.values(done).filter(Boolean).length;

  const go = (key: string) => {
    if (key === 'content') onNavigateToModule?.('creative-lab', 'create');
    else if (key === 'leads') onNavigateToModule?.('leads', 'lead-automation');
    else if (key === 'social') onNavigateToModule?.('social-hub', 'connect');
    else if (key === 'schedule') onNavigateToModule?.('social-hub', 'calendar');
    else if (key === 'launch') onStartCampaign?.();
  };

  return (
    <div className="w-full animate-fadeIn">
      <PageHeader
        eyebrow="Campaigns / Plan"
        title={<>{blueprint.campaignName}{campaign && <span className="ml-3 align-middle"><StatusBadge status={campaign.status} /></span>}</>}
        subtitle={`Plan generated ${blueprint.createdAt} from your goals, audience, budget and timeline.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="nx-btn" onClick={onBack}>← Campaigns</button>
            <button type="button" className="nx-btn" onClick={onEdit}>Edit</button>
            <button type="button" className="nx-btn" onClick={onRegenerate}>Regenerate</button>
            <button type="button" className="nx-btn" onClick={exportJson}>Export</button>
            <button type="button" className="nx-btn primary" onClick={onStartCampaign}>Start campaign</button>
          </div>
        }
      />

      {notice && <div className="nx-toast" role="status">{notice}</div>}

      <div className="nx-grid nx-thirds mb-[16px]">
        {[
          { l: '1. Plan', v: 'Created by Nexora', d: 'Objective, audience, offer and roadmap are set.' },
          { l: '2. Content', v: `${linkedAssets.length} linked`, d: `${linkedAssets.filter(a => a.status === 'Scheduled' || a.status === 'Published').length} scheduled or published through Nexora.` },
          { l: '3. Ad platforms', v: 'Not connected', d: 'Nexora plans and publishes content. It does not run Google or Meta ads yet.' },
        ].map(m => (
          <div key={m.l} className="nx-panel nx-metric">
            <div className="nx-label">{m.l}</div>
            <div className="nx-number text-[18px]!">{m.v}</div>
            <div className="nx-delta neutral">{m.d}</div>
          </div>
        ))}
      </div>

      <div className="nx-grid nx-metrics mb-[16px]">
        {[
          { l: 'Objective', v: o.objective, d: 'Main goal' },
          { l: 'Budget', v: o.budget.replace('Total: ', '').replace('Daily: ', ''), d: o.budget.startsWith('Daily') ? 'per day' : 'total' },
          { l: 'Channels', v: String(o.primaryChannels.length), d: o.primaryChannels.join(' · ') },
          { l: 'Phases', v: String(blueprint.roadmap.length), d: `${execTotal} execution tasks` },
        ].map(m => (
          <div key={m.l} className="nx-panel nx-metric">
            <div className="nx-label">{m.l}</div>
            <div className="nx-number text-[22px]! leading-tight">{m.v}</div>
            <div className="nx-delta neutral">{m.d}</div>
          </div>
        ))}
      </div>

      <Tabs<Tab> idPrefix="campaign" label="Campaign sections" tabs={TABS.map(t => t.id === 'content' && linkedAssets.length ? { ...t, count: linkedAssets.length } : t)} value={tab} onChange={setTab} className="mb-[16px]" />

      <TabPanel idPrefix="campaign" id={tab}>
      <div className="grid gap-[16px]">
      {tab === 'plan' && (
        <div className="nx-grid nx-two">
          <Panel title="Campaign overview" sub="The essentials at a glance.">
            <KV k="Objective">{o.objective}</KV>
            {o.offer && o.offer !== 'No offer' && <KV k="Offer">{o.offer}</KV>}
            <KV k="Audience">{o.targetAudience}</KV>
            <KV k="Timeline">{fmtDate(o.timeline)}</KV>
            <KV k="Budget">{o.budget}</KV>
            <div className="nx-kv">
              <span>Channels</span>
              <span className="flex gap-1.5 flex-wrap justify-end">
                {o.primaryChannels.map(c => (
                  <span key={c} className="nx-tag teal inline-flex items-center gap-1.5">
                    <Logo name={c} />{c}
                  </span>
                ))}
              </span>
            </div>
            <div className="nx-split" />
            <h3 className="font-display text-[14px] font-semibold text-ink m-0 mb-2">Success looks like</h3>
            <Bullets items={o.successMetrics} />
          </Panel>

          <Panel title="Strategy" sub="How Nexora recommends winning.">
            <KV k="Positioning">{s.positioning}</KV>
            <KV k="Key message">{s.keyMessage}</KV>
            <KV k="Campaign angle">{s.campaignAngle}</KV>
            <div className="nx-split" />
            <p className="text-[13px] text-ink-2 leading-[1.65] m-0">{s.recommendedApproach}</p>
          </Panel>

        </div>
      )}

      {tab === 'plan' && (
        <section className="nx-panel nx-pad">
          <div className="nx-sectionhead"><div><h2>Roadmap</h2><p>{blueprint.roadmap.length} phases from discovery to analysis.</p></div></div>
          <div className="border-t border-line">
            {blueprint.roadmap.map((p, i) => {
              const open = openPhase === p.id;
              return (
                <div key={p.id} className="border-b border-line">
                  <button type="button" onClick={() => setOpenPhase(open ? null : p.id)}
                    aria-expanded={open}
                    className="w-full flex items-center gap-3 py-[14px] bg-transparent border-0 cursor-pointer text-left min-h-0!">
                    <span className="nx-alerticon muted">{i + 1}</span>
                    <span className="flex-1 min-w-0">
                      <strong className="block text-[14px] text-ink capitalize">{p.name.toLowerCase()}</strong>
                      <span className="block text-[12px] text-ink-3">{p.suggestedTimeline} · {p.responsible}</span>
                    </span>
                    <span className="text-ink-3 text-[13px]">{open ? '−' : '+'}</span>
                  </button>
                  {open && (
                    <div className="pb-4 pl-[42px] grid gap-4 md:grid-cols-2 animate-fadeIn">
                      <div className="md:col-span-2 text-[13px] text-ink-2">{p.objective}</div>
                      <div><div className="eyebrow mb-1.5">Tasks</div><Bullets items={p.tasks} /></div>
                      <div><div className="eyebrow mb-1.5">Deliverables</div><Bullets items={p.deliverables} /></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'content' && (
        <div className="grid gap-[16px]">
          <section className="nx-panel nx-pad">
            <div className="nx-sectionhead">
              <div><h2>Content in your library</h2><p>Drafts linked to this campaign.</p></div>
              <button type="button" className="nx-btn sm" onClick={() => onNavigateToModule?.('content', 'create')}>Create content →</button>
            </div>
            {linkedAssets.length === 0 ? (
              <p className="text-[13px] text-ink-3 m-0">Nothing linked yet. Choose this campaign when you create content and it will appear here.</p>
            ) : (
              <div className="border-t border-line">
                {linkedAssets.map(a => (
                  <div key={a.id} className="nx-row">
                    <div className="flex-1 min-w-0">
                      <strong>{a.title}</strong>
                      <p>{a.type} · {a.platform} · {a.createdAt}</p>
                    </div>
                    {a.status && <StatusBadge status={a.status} />}
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="nx-panel nx-pad">
            <div className="nx-sectionhead"><div><h2>Content plan</h2><p>What to publish, where and when.</p></div>
              <button type="button" className="nx-btn sm" onClick={() => onNavigateToModule?.('creative-lab', 'create')}>Create content →</button></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr><th>Content</th><th>Platform</th><th>Purpose</th><th>Timing</th><th>CTA</th></tr></thead>
                <tbody>
                  {blueprint.contentPlan.map(c => (
                    <tr key={c.id}>
                      <td className="font-semibold text-ink">{c.contentType}</td>
                      <td><span className="inline-flex items-center gap-1.5"><Logo name={c.platform} />{c.platform}</span></td>
                      <td>{c.purpose}</td><td>{c.timing}</td><td><span className="nx-tag">{c.cta}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div className="nx-grid nx-two">
            <Panel title="Social plan" sub={blueprint.socialPlan.postingFrequency}>
              <div className="eyebrow mb-1.5">Themes</div>
              <div className="flex flex-wrap gap-1.5 mb-4">{blueprint.socialPlan.contentThemes.map(t => <span key={t} className="nx-chip">{t}</span>)}</div>
              <div className="eyebrow mb-1.5">Best formats</div>
              <div className="flex flex-wrap gap-1.5 mb-4">{blueprint.socialPlan.bestFormats.map(t => <span key={t} className="nx-chip">{t}</span>)}</div>
              <p className="text-[13px] text-ink-2 leading-[1.6] m-0">{blueprint.socialPlan.engagementStrategy}</p>
            </Panel>
            <Panel title="Post ideas" sub="Ready to turn into drafts.">
              <Bullets items={blueprint.socialPlan.postIdeas} />
            </Panel>
          </div>
        </div>
      )}

      {tab === 'plan' && (
        <section className="nx-panel nx-pad">
          <div className="nx-sectionhead">
            <div><h2>Execution checklist</h2><p>{execDone} of {execTotal} done.</p></div>
          </div>
          <div className="nx-progress mb-5"><div style={{ width: `${execTotal ? (execDone / execTotal) * 100 : 0}%` }} /></div>
          <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            {EXEC_GROUPS.map(g => (
              <div key={g.key}>
                <div className="eyebrow mb-1">{g.label}</div>
                {blueprint.execution[g.key].map((item, i) => {
                  const k = `${g.key}-${i}`;
                  return (
                    <label key={k} className="flex gap-2.5 py-2 border-t border-line text-[13px] text-ink-2 cursor-pointer">
                      <input type="checkbox" className="mt-[3px]" checked={!!done[k]}
                        onChange={() => setDone(d => ({ ...d, [k]: !d[k] }))} />
                      <span className={done[k] ? 'line-through text-ink-3' : ''}>{item}</span>
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'plan' && (
            <Panel title="Next steps" sub="Start with the first one.">
              <div className="border-t border-line">
                {blueprint.nextSteps.map(st => (
                  <button key={st.number} type="button" onClick={() => go(st.actionKey)}
                    className="nx-row w-full text-left bg-transparent border-0 border-b border-line cursor-pointer min-h-0!">
                    <div className="nx-alerticon">{st.number}</div>
                    <div className="flex-1 min-w-0">
                      <strong>{st.title}</strong>
                      <p>{st.description}</p>
                    </div>
                    <span className="nx-inline-link">Open →</span>
                  </button>
                ))}
              </div>
            </Panel>
      )}

      {tab === 'leads' && (
        <div className="nx-grid nx-two">
          <div className="col-span-full">
            <AIInsight
              observation={`${campaign?.leads ?? 0} leads are recorded against this campaign.`}
              recommendation="Count a lead for this campaign only when a tracked form, link or conversation shows where it came from. A lead from WhatsApp should not be credited to an ad without that evidence."
              evidence="Source: campaign records"
            />
          </div>
          <Panel title="Lead strategy" sub="From first touch to qualified lead.">
            <KV k="Capture">{blueprint.leadStrategy.captureStrategy}</KV>
            <KV k="Qualification">{blueprint.leadStrategy.qualification}</KV>
            <KV k="Follow-up">{blueprint.leadStrategy.followUp}</KV>
            <KV k="Response">{blueprint.leadStrategy.responseStrategy}</KV>
          </Panel>
          <Panel title="Automation opportunities" sub="Nexora can run these for you.">
            <Bullets items={blueprint.leadStrategy.automationOpportunities} />
            <div className="nx-split" />
            <button type="button" className="nx-btn sm" onClick={() => onNavigateToModule?.('leads', 'lead-automation')}>Set up automation →</button>
          </Panel>
        </div>
      )}

      {tab === 'results' && (
        <div className="nx-grid nx-metrics">
          {[
            { l: 'Impressions', v: campaign?.impressions ?? '—' },
            { l: 'Leads', v: campaign ? String(campaign.leads) : '—' },
            { l: 'Conversion', v: campaign?.conversion ?? '—' },
            { l: 'Budget', v: campaign?.budget ?? o.budget },
          ].map(m => (
            <div key={m.l} className="nx-panel nx-metric">
              <div className="nx-label">{m.l}</div>
              <div className="nx-number">{m.v}</div>
              <div className="nx-delta neutral">From campaign records</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'results' && (
        <div className="nx-grid nx-two">
          <Panel title="KPIs" sub="Targets to track from day one.">
            {blueprint.kpis.map(k => (
              <div key={k.id} className="nx-kv">
                <span>{k.name}</span>
                <span className="text-right"><strong className="text-ink">{k.current}</strong> <span className="text-ink-3">/ {k.target}{k.unit ? ` ${k.unit}` : ''}</span></span>
              </div>
            ))}
          </Panel>
          <Panel title="Risks & recommendations" sub="What could go wrong, and the fix.">
            {blueprint.risks.map(r => (
              <div key={r.id} className="py-3 border-t border-line first:border-t-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`nx-tag ${r.severity === 'High' ? 'red' : r.severity === 'Medium' ? 'amber' : 'green'}`}>{r.severity}</span>
                  <strong className="text-[13px] text-ink">{r.risk}</strong>
                </div>
                <p className="text-[13px] text-ink-2 leading-[1.6] m-0">{r.recommendation}</p>
              </div>
            ))}
          </Panel>
        </div>
      )}
      </div>
      </TabPanel>
    </div>
  );
}
