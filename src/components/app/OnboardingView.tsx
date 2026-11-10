import React, { useState } from 'react';
import { NavCategory, SubCategory } from '../../types';
import { Badge, PageHeader } from '../ui';
import { SetupItem, SetupStatus, getSetupStatus, setActivated } from '../../data/setup';

interface Props {
  isFirstRun?: boolean;
  onNavigateTo: (category: NavCategory, sub?: SubCategory) => void;
  onStartSetup: () => void;
  onNotify?: (title: string, desc: string) => void;
}

const ACTION: Record<SetupItem['id'], { label: string; go?: [NavCategory, SubCategory] }> = {
  business: { label: 'Edit details', go: ['settings', 'business'] },
  knowledge: { label: 'Review knowledge', go: ['settings', 'ai-automation'] },
  channels: { label: 'Manage channels', go: ['settings', 'channels'] },
  test: { label: 'Test the AI', go: ['settings', 'ai-automation'] },
  ready: { label: 'Activate' },
};

export default function OnboardingView({ isFirstRun = false, onNavigateTo, onStartSetup, onNotify }: Props) {
  // Read fresh on every render: it is cheap, and it picks up changes made in guided setup or Settings.
  const [, setVersion] = useState(0);
  const status: SetupStatus = getSetupStatus(isFirstRun);
  const allReady = status.items.slice(0, 4).every(i => i.done);
  const pct = Math.round((status.done / status.total) * 100);

  const activate = () => {
    setActivated(true);
    setVersion(v => v + 1);
    onNotify?.('Nexora is active', 'The AI can now reply to customers on your connected channels.');
  };
  const pause = () => {
    setActivated(false);
    setVersion(v => v + 1);
    onNotify?.('Nexora paused', 'The AI stopped replying. Customers wait for a person.');
  };

  return (
    <div className="w-full animate-fadeIn space-y-[16px] pb-12">
      <PageHeader
        eyebrow="General / Onboarding"
        title="Onboarding"
        subtitle="Get Nexora ready to talk to your customers. The AI stays off until every step is done."
        actions={
          <button type="button" className="nx-btn primary" onClick={onStartSetup}>
            {status.done === 0 ? 'Start guided setup' : 'Open guided setup'}
          </button>
        }
      />

      <div className="grid gap-[16px] lg:grid-cols-[minmax(0,1fr)_300px] items-start">
        <section className="nx-panel nx-pad">
          <div className="nx-sectionhead">
            <div>
              <h2>Setup checklist</h2>
              <p>{status.done} of {status.total} done</p>
            </div>
            {status.activated ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Not active</Badge>}
          </div>
          <div className="nx-progress mb-3"><div style={{ width: `${pct}%` }} /></div>

          <div className="border-t border-line">
            {status.items.map((item, i) => {
              const action = ACTION[item.id];
              const isReady = item.id === 'ready';
              return (
                <div key={item.id} className="nx-row">
                  <span className={`nx-alerticon ${item.done ? 'green' : 'muted'}`} aria-hidden="true">{item.done ? '✓' : i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                  {isReady ? (
                    status.activated ? (
                      <button type="button" className="nx-btn sm" onClick={pause}>Pause AI</button>
                    ) : (
                      <button type="button" className="nx-btn sm primary" onClick={activate} disabled={!allReady}>Activate</button>
                    )
                  ) : (
                    <button
                      type="button"
                      className={`nx-btn sm ${!item.done ? 'primary' : ''}`}
                      onClick={() => (!item.done && (item.id === 'business' || item.id === 'knowledge' || item.id === 'test') ? onStartSetup() : action.go && onNavigateTo(action.go[0], action.go[1]))}
                    >
                      {item.done ? action.label : item.id === 'channels' ? 'Connect' : 'Do this now'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="nx-panel nx-pad" aria-label="How setup works">
          <div className="eyebrow mb-1">How it works</div>
          <h2 className="font-display text-[16px] font-semibold m-0 mb-3">Four steps, then you decide</h2>
          <ol className="m-0 pl-5 list-decimal text-[13px] text-ink-2 leading-[1.8]">
            <li>Tell Nexora about your business.</li>
            <li>Approve the answers the AI may give.</li>
            <li>Connect where customers reach you.</li>
            <li>Test the AI, then activate it.</li>
          </ol>
          <div className="nx-split" />
          <p className="text-[12px] text-ink-3 m-0 leading-[1.6]">
            Nothing is sent to customers until you activate. You can pause the AI at any time, and you can change any answer later in Settings.
          </p>
        </aside>
      </div>
    </div>
  );
}
