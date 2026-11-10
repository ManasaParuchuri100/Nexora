import React, { useState } from 'react';
import { NavCategory, SubCategory } from '../../types';
import { useConversations } from '../../data/conversations';
import { PageHeader } from '../ui';

interface AgentViewProps {
  onNavigate: (category: NavCategory, subCategory?: SubCategory) => void;
}

const RESPONSIBILITIES: Array<{ title: string; detail: string; status: 'Enabled' | 'Review required' }> = [
  { title: 'Respond to incoming enquiries', detail: 'Use approved answers from business knowledge', status: 'Enabled' },
  { title: 'Qualify and score leads', detail: 'Capture requirements, budget, timeline and intent', status: 'Enabled' },
  { title: 'Follow up with consent', detail: 'Use configured cadence and channel permissions', status: 'Review required' },
  { title: 'Hand off to a person', detail: 'Pause for pricing exceptions, uncertainty or request', status: 'Enabled' },
];

export default function AgentView({ onNavigate }: AgentViewProps) {
  const [conversations] = useConversations();
  const [isAgentOn, setIsAgentOn] = useState(true);
  const [safeguards, setSafeguards] = useState([
    { id: 'faq', label: 'AI can answer approved FAQs', on: true },
    { id: 'qualify', label: 'AI can qualify leads', on: true },
    { id: 'publish', label: 'AI can publish marketing posts', on: false },
    { id: 'budget', label: 'AI can change advertising budgets', on: false },
  ]);

  const total = Math.max(1, conversations.length);
  const aiHandlingCount = conversations.filter(c => c.status === 'ai_handling').length;
  const needsYouCount = conversations.filter(c => c.status === 'needs_you').length;
  const pausedCount = conversations.filter(c => Boolean(c.aiAlert?.isPaused)).length;
  const aiShare = Math.round(((total - needsYouCount) / total) * 100);

  const metrics = [
    {
      label: 'Agent state',
      value: isAgentOn ? 'Active' : 'Paused',
      delta: isAgentOn ? 'Approved knowledge only' : 'New messages wait for you',
      tone: isAgentOn ? '' : 'neutral',
      onClick: () => setIsAgentOn(v => !v),
    },
    {
      label: 'AI-handled conversations',
      value: `${aiShare}%`,
      delta: `${aiHandlingCount} in autopilot right now`,
      tone: '',
      onClick: () => onNavigate('inbox', 'inbox'),
    },
    {
      label: 'Human handoffs',
      value: String(needsYouCount),
      delta: `${pausedCount} paused by AI · every handoff is logged`,
      tone: '',
      onClick: () => onNavigate('inbox', 'waiting-human'),
    },
  ];

  return (
    <div className="w-full animate-fadeIn">
      <PageHeader
        eyebrow="Intelligence / Engagement Agent"
        title="Engagement Agent"
        subtitle="Understand exactly what the agent knows, does and escalates."
        actions={
          <button type="button" className="nx-btn primary" onClick={() => onNavigate('inbox', 'inbox')}>
            Test the agent →
          </button>
        }
      />

      <div className="nx-grid nx-thirds">
        {metrics.map(m => (
          <button
            key={m.label}
            type="button"
            onClick={m.onClick}
            className="nx-panel nx-metric min-h-[121px]! rounded-[10px]!"
          >
            <div className="nx-label">{m.label}</div>
            <div className="nx-number">{m.value}</div>
            <div className={`nx-delta ${m.tone}`}>{m.delta}</div>
          </button>
        ))}
      </div>

      <div className="nx-grid nx-two mt-[16px]">
        <section className="nx-panel nx-pad">
          <div className="nx-sectionhead">
            <div>
              <h2>Agent responsibilities</h2>
              <p>The agent focuses on reliable lead engagement.</p>
            </div>
          </div>
          <div className="border-t border-line">
            {RESPONSIBILITIES.map((r, i) => (
              <div key={r.title} className="nx-row">
                <div className="nx-alerticon text-[16px]">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <strong>{r.title}</strong>
                  <p>{r.detail}</p>
                </div>
                <span className={`nx-tag ${r.status === 'Enabled' ? 'green' : 'amber'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="nx-panel nx-pad">
          <div className="nx-sectionhead">
            <div>
              <h2>Human control & safeguards</h2>
              <p>Automation must be observable and reversible.</p>
            </div>
          </div>
          {safeguards.map(s => (
            <div key={s.id} className="nx-kv">
              <span>{s.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={s.on}
                aria-label={s.label}
                className={`nx-toggle ${s.on ? 'on' : ''}`}
                onClick={() => setSafeguards(prev => prev.map(x => (x.id === s.id ? { ...x, on: !x.on } : x)))}
              />
            </div>
          ))}
          <div className="nx-split" />
          <h3 className="font-display text-[14px] font-semibold text-ink m-0">Escalation conditions</h3>
          <p className="text-[12px] text-ink-3 my-3">
            Customer asks for a human · AI is uncertain · pricing exception · sensitive request
          </p>
          <button type="button" className="nx-btn sm" onClick={() => onNavigate('settings', 'ai-automation')}>
            Edit rules →
          </button>
        </section>
      </div>
    </div>
  );
}
