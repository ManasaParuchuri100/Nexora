import React, { useState } from 'react';
import { Field, NxModal } from '../followups/FollowUpKit';
import { Badge } from '../../ui';
import { usePersisted } from './store';

type Notify = (title: string, desc: string) => void;

const Heading = ({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-line">
    <div>
      <h2 className="font-display text-[14px] font-semibold text-ink m-0">{title}</h2>
      {hint && <p className="text-[13px] text-ink-3 mt-1 mb-0">{hint}</p>}
    </div>
    {action}
  </div>
);

function Chips<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-[7px]">
      {options.map(o => (
        <button key={o} type="button" aria-pressed={value === o} className={`nx-chip ${value === o ? 'active' : ''}`} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} className={`nx-toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />
);

/* ================================================================== */
/*  Team                                                               */
/* ================================================================== */
export interface Member { id: string; name: string; email: string; role: string }
const ROLES = ['Admin', 'Sales', 'Marketing', 'Viewer'] as const;
const DEFAULT_TEAM: Member[] = [
  { id: 't1', name: 'You', email: 'you@acme.com', role: 'Owner' },
  { id: 't2', name: 'Priya Shah', email: 'priya@acme.com', role: 'Sales' },
  { id: 't3', name: 'Aisha Khan', email: 'aisha@acme.com', role: 'Marketing' },
];
export const useTeam = () => usePersisted<Member[]>('nexora_team_v1', DEFAULT_TEAM);

export function TeamSection({ onNotify }: { onNotify?: Notify }) {
  const [team, setTeam] = useTeam();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('Sales');
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const invite = () => {
    const mail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return setError('Enter a valid email address.');
    if (team.some(m => m.email.toLowerCase() === mail)) return setError('That person is already on the team.');
    setTeam(prev => [...prev, { id: `t-${Date.now()}`, name: name.trim() || mail.split('@')[0], email: mail, role }]);
    setName(''); setEmail(''); setError('');
    onNotify?.('Invitation sent', `${mail} was invited as ${role}.`);
  };

  return (
    <div>
      <Heading title="Team members & roles" hint={`${team.length} members. Roles control what each person can see and change.`} />
      <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_140px_auto] mb-1">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name (optional)" aria-label="Name" />
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="Email" aria-label="Email" onKeyDown={e => e.key === 'Enter' && invite()} />
        <select value={role} onChange={e => setRole(e.target.value)} aria-label="Role">
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <button type="button" className="nx-btn primary" onClick={invite}>Invite</button>
      </div>
      {error && <p className="text-[13px] text-danger mt-1.5 mb-0" role="alert">{error}</p>}

      <div className="border-t border-line mt-4">
        {team.map(m => (
          <div key={m.id} className="nx-row">
            <div className="flex-1 min-w-0">
              <strong>{m.name}</strong>
              <p>{m.email}</p>
            </div>
            {m.role === 'Owner' ? (
              <Badge tone="brand">Owner</Badge>
            ) : (
              <>
                <select
                  value={m.role}
                  aria-label={`Role for ${m.name}`}
                  className="w-[130px]"
                  onChange={e => { setTeam(prev => prev.map(x => (x.id === m.id ? { ...x, role: e.target.value } : x))); onNotify?.('Role updated', `${m.name} is now ${e.target.value}.`); }}
                >
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
                {confirmId === m.id ? (
                  <span className="flex gap-1.5">
                    <button type="button" className="nx-btn sm text-danger" onClick={() => { setTeam(prev => prev.filter(x => x.id !== m.id)); setConfirmId(null); onNotify?.('Member removed', `${m.name} no longer has access.`); }}>Confirm</button>
                    <button type="button" className="nx-btn sm" onClick={() => setConfirmId(null)}>Cancel</button>
                  </span>
                ) : (
                  <button type="button" className="nx-btn sm" onClick={() => setConfirmId(m.id)}>Remove</button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Channels                                                           */
/* ================================================================== */
type ChannelStatus = 'Connected' | 'Setup Required' | 'Disconnected';
interface Channel { name: string; handle: string; status: ChannelStatus; owner: string; lastSync: string; placeholder: string }
const DEFAULT_CHANNELS: Channel[] = [
  { name: 'WhatsApp', handle: '+91 98201 44820', status: 'Connected', owner: 'Priya Shah', lastSync: '2 min ago', placeholder: '+91 98765 43210' },
  { name: 'Instagram', handle: '@acmestudio', status: 'Connected', owner: 'Aisha Khan', lastSync: '9 min ago', placeholder: '@yourbusiness' },
  { name: 'Facebook', handle: 'Not connected', status: 'Disconnected', owner: '—', lastSync: '—', placeholder: 'Page name' },
  { name: 'LinkedIn', handle: 'Not connected', status: 'Disconnected', owner: '—', lastSync: '—', placeholder: 'Company page name' },
  { name: 'Email', handle: 'hello@acme.com', status: 'Setup Required', owner: 'Priya Shah', lastSync: '—', placeholder: 'hello@yourbusiness.com' },
];

export function ChannelsSection({ onNotify }: { onNotify?: Notify }) {
  const [channels, setChannels] = usePersisted<Channel[]>('nexora_channels_v1', DEFAULT_CHANNELS);
  const [team] = useTeam();
  const [editing, setEditing] = useState<Channel | null>(null);
  const [handle, setHandle] = useState('');
  const [owner, setOwner] = useState('');
  const [error, setError] = useState('');

  const open = (c: Channel) => {
    setEditing(c);
    setHandle(c.status === 'Disconnected' ? '' : c.handle);
    setOwner(c.owner !== '—' ? c.owner : team[0]?.name || '');
    setError('');
  };
  const save = () => {
    if (!editing) return;
    if (!handle.trim()) return setError('Enter the account to connect.');
    setChannels(prev => prev.map(c => (c.name === editing.name ? { ...c, handle: handle.trim(), owner, status: 'Connected', lastSync: 'Just now' } : c)));
    onNotify?.(editing.status === 'Connected' ? 'Channel updated' : 'Channel connected', `${editing.name} is connected as ${handle.trim()}.`);
    setEditing(null);
  };
  const disconnect = () => {
    if (!editing) return;
    setChannels(prev => prev.map(c => (c.name === editing.name ? { ...c, handle: 'Not connected', owner: '—', status: 'Disconnected', lastSync: '—' } : c)));
    onNotify?.('Channel disconnected', `${editing.name} will no longer send or receive messages.`);
    setEditing(null);
  };
  const tone = (s: ChannelStatus) => (s === 'Connected' ? 'success' : s === 'Setup Required' ? 'warning' : 'neutral');

  return (
    <div>
      <Heading title="Channels" hint="Connect the places customers already contact you. Start with WhatsApp." />
      <div className="border-t border-line">
        {channels.map(c => (
          <div key={c.name} className="nx-row">
            <div className="flex-1 min-w-0">
              <strong>{c.name}</strong>
              <p>{c.handle}{c.status === 'Connected' ? ` · owner ${c.owner} · synced ${c.lastSync}` : ''}</p>
            </div>
            <Badge tone={tone(c.status) as any}>{c.status}</Badge>
            <button type="button" className="nx-btn sm" onClick={() => open(c)}>{c.status === 'Connected' ? 'Manage' : 'Connect'}</button>
          </div>
        ))}
      </div>
      <p className="text-[12px] text-ink-3 mt-3 mb-0">Connections are simulated in this demo. A live channel needs authorization from the provider.</p>

      {editing && (
        <NxModal
          title={`${editing.status === 'Connected' ? 'Manage' : 'Connect'} ${editing.name}`}
          onClose={() => setEditing(null)}
          width={460}
          footer={
            <>
              {editing.status === 'Connected' && <button type="button" className="nx-btn mr-auto text-danger" onClick={disconnect}>Disconnect</button>}
              <button type="button" className="nx-btn" onClick={() => setEditing(null)}>Cancel</button>
              <button type="button" className="nx-btn primary" onClick={save}>{editing.status === 'Connected' ? 'Save' : 'Connect'}</button>
            </>
          }
        >
          <Field label="Account"><input value={handle} onChange={e => { setHandle(e.target.value); setError(''); }} placeholder={editing.placeholder} /></Field>
          <Field label="Owner" hint="This person is responsible for the channel.">
            <select value={owner} onChange={e => setOwner(e.target.value)}>{team.map(m => <option key={m.id}>{m.name}</option>)}</select>
          </Field>
          {error && <p className="text-[13px] text-danger m-0 mb-2" role="alert">{error}</p>}
        </NxModal>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Automation                                                         */
/* ================================================================== */
const TRIGGERS = ['A new enquiry arrives', 'A lead becomes Hot', 'A lead is silent for 2 days', 'A customer asks for a person'] as const;
const ACTIONS = ['Reply with AI', 'Qualify the lead', 'Create a follow-up', 'Notify a salesperson', 'Hand off to a person'] as const;
interface Rule { id: string; trigger: string; action: string; approval: boolean; enabled: boolean; lastFired: string }
const DEFAULT_RULES: Rule[] = [
  { id: 'r1', trigger: 'A new enquiry arrives', action: 'Reply with AI', approval: false, enabled: true, lastFired: '2 min ago' },
  { id: 'r2', trigger: 'A lead becomes Hot', action: 'Notify a salesperson', approval: false, enabled: true, lastFired: '22 min ago' },
  { id: 'r3', trigger: 'A lead is silent for 2 days', action: 'Create a follow-up', approval: true, enabled: true, lastFired: '1 h ago' },
];
interface Handoff { onRequest: boolean; highValue: boolean; lowConfidence: boolean; threshold: string; notify: string }
const DEFAULT_HANDOFF: Handoff = { onRequest: true, highValue: true, lowConfidence: true, threshold: '50000', notify: 'Sales team' };

export function AutomationSection({ onNotify }: { onNotify?: Notify }) {
  const [rules, setRules] = usePersisted<Rule[]>('nexora_rules_v1', DEFAULT_RULES);
  const [handoff, setHandoff] = usePersisted<Handoff>('nexora_handoff_v1', DEFAULT_HANDOFF);
  const [editing, setEditing] = useState<Rule | 'new' | null>(null);
  const [trigger, setTrigger] = useState<string>(TRIGGERS[0]);
  const [action, setAction] = useState<string>(ACTIONS[0]);
  const [approval, setApproval] = useState(false);
  const [error, setError] = useState('');

  const open = (r: Rule | 'new') => {
    setEditing(r);
    setTrigger(r === 'new' ? TRIGGERS[0] : r.trigger);
    setAction(r === 'new' ? ACTIONS[0] : r.action);
    setApproval(r === 'new' ? false : r.approval);
    setError('');
  };
  const save = () => {
    if (rules.some(r => r.trigger === trigger && r.action === action && (editing === 'new' || (editing && r.id !== editing.id)))) {
      return setError('A rule with this trigger and action already exists.');
    }
    if (editing === 'new') setRules(prev => [...prev, { id: `r-${Date.now()}`, trigger, action, approval, enabled: true, lastFired: 'Never' }]);
    else if (editing) setRules(prev => prev.map(r => (r.id === editing.id ? { ...r, trigger, action, approval } : r)));
    onNotify?.(editing === 'new' ? 'Rule added' : 'Rule saved', `${trigger} → ${action}.`);
    setEditing(null);
  };

  return (
    <div>
      <Heading title="Automation" hint="Decide what Nexora may do on its own and what needs your approval."
        action={<button type="button" className="nx-btn sm primary" onClick={() => open('new')}>+ New rule</button>} />
      <div className="border-t border-line">
        {rules.map(r => (
          <div key={r.id} className="nx-row">
            <Toggle on={r.enabled} label={`${r.trigger}, ${r.action}`} onChange={v => setRules(prev => prev.map(x => (x.id === r.id ? { ...x, enabled: v } : x)))} />
            <div className={`flex-1 min-w-0 ${r.enabled ? '' : 'opacity-60'}`}>
              <strong>When {r.trigger.charAt(0).toLowerCase() + r.trigger.slice(1)}, {r.action.charAt(0).toLowerCase() + r.action.slice(1)}</strong>
              <p>{r.approval ? 'Asks for approval first' : 'Runs automatically'} · last run {r.lastFired}</p>
            </div>
            <button type="button" className="nx-btn sm" onClick={() => open(r)}>Edit</button>
          </div>
        ))}
        {rules.length === 0 && <p className="text-[13px] text-ink-3 py-6 text-center m-0">No rules yet. Add one to automate a routine task.</p>}
      </div>

      <div className="nx-callout block! mt-4">
        <div className="font-bold text-ink text-[13px] mb-2">Hand a conversation to a person when…</div>
        <label className="flex items-center gap-2 text-[13px] py-1"><input type="checkbox" checked={handoff.onRequest} onChange={e => setHandoff({ ...handoff, onRequest: e.target.checked })} /> the customer asks for a person</label>
        <label className="flex items-center gap-2 text-[13px] py-1 flex-wrap">
          <input type="checkbox" checked={handoff.highValue} onChange={e => setHandoff({ ...handoff, highValue: e.target.checked })} /> the deal is worth more than ₹
          <input type="number" min={0} value={handoff.threshold} disabled={!handoff.highValue} onChange={e => setHandoff({ ...handoff, threshold: e.target.value })} aria-label="Deal value" className="w-[120px]" />
        </label>
        <label className="flex items-center gap-2 text-[13px] py-1"><input type="checkbox" checked={handoff.lowConfidence} onChange={e => setHandoff({ ...handoff, lowConfidence: e.target.checked })} /> the AI is not sure of the answer</label>
        <div className="flex items-center gap-2 text-[13px] pt-2">Then notify
          <select value={handoff.notify} onChange={e => setHandoff({ ...handoff, notify: e.target.value })} aria-label="Notify" className="w-[150px]">
            {['Sales team', 'Admins', 'Owner'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <p className="text-[12px] text-ink-3 mt-2 mb-0">Changes here are saved as you make them.</p>
      </div>

      {editing && (
        <NxModal
          title={editing === 'new' ? 'New rule' : 'Edit rule'}
          onClose={() => setEditing(null)}
          width={520}
          footer={
            <>
              {editing !== 'new' && <button type="button" className="nx-btn mr-auto text-danger" onClick={() => { setRules(prev => prev.filter(r => r.id !== (editing as Rule).id)); onNotify?.('Rule deleted', 'The rule was removed.'); setEditing(null); }}>Delete</button>}
              <button type="button" className="nx-btn" onClick={() => setEditing(null)}>Cancel</button>
              <button type="button" className="nx-btn primary" onClick={save}>Save rule</button>
            </>
          }
        >
          <Field label="When"><Chips options={TRIGGERS} value={trigger as typeof TRIGGERS[number]} onChange={setTrigger} /></Field>
          <Field label="Then"><Chips options={ACTIONS} value={action as typeof ACTIONS[number]} onChange={setAction} /></Field>
          <Field label="Approval">
            <Chips options={['Run automatically', 'Ask me first'] as const} value={approval ? 'Ask me first' : 'Run automatically'} onChange={v => setApproval(v === 'Ask me first')} />
          </Field>
          {error && <p className="text-[13px] text-danger m-0 mb-2" role="alert">{error}</p>}
        </NxModal>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Billing                                                            */
/* ================================================================== */
const PLANS = [
  { id: 'starter', name: 'Starter', price: 1999, convs: 300, replies: 1500, seats: 2 },
  { id: 'growth', name: 'Growth', price: 4999, convs: 1000, replies: 5000, seats: 5 },
  { id: 'scale', name: 'Scale', price: 9999, convs: 4000, replies: 20000, seats: 15 },
];
const USAGE = { convs: 612, replies: 3140 };
const INVOICES = [
  { id: 'inv-2610', label: 'Oct 2026', date: '01 Oct 2026' },
  { id: 'inv-2609', label: 'Sep 2026', date: '01 Sep 2026' },
  { id: 'inv-2608', label: 'Aug 2026', date: '01 Aug 2026' },
];
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function BillingSection({ onNotify }: { onNotify?: Notify }) {
  const [planId, setPlanId] = usePersisted<string>('nexora_plan_v1', 'growth');
  const [team] = useTeam();
  const [changing, setChanging] = useState(false);
  const [pick, setPick] = useState(planId);
  const plan = PLANS.find(p => p.id === planId) || PLANS[1];
  const rows = [
    { l: 'Conversations', used: USAGE.convs, cap: plan.convs },
    { l: 'AI replies', used: USAGE.replies, cap: plan.replies },
    { l: 'Seats', used: team.length, cap: plan.seats },
  ];

  const download = (inv: (typeof INVOICES)[number]) => {
    const text = `INVOICE ${inv.id.toUpperCase()}\nPeriod: ${inv.label}\nIssued: ${inv.date}\nPlan: ${plan.name}\nAmount: ${inr(plan.price)}\n\nSample invoice for the demo workspace.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${inv.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Heading title="Plan & usage" hint="Sample plans and figures for the demo workspace."
        action={<button type="button" className="nx-btn sm" onClick={() => { setPick(planId); setChanging(true); }}>Change plan</button>} />
      <div className="nx-callout block!">
        <div className="flex items-center justify-between mb-3">
          <strong className="text-ink text-[14px]">{plan.name} plan</strong>
          <strong className="text-ink text-[14px]">{inr(plan.price)} / month</strong>
        </div>
        {rows.map(r => {
          const pct = Math.min(100, Math.round((r.used / r.cap) * 100));
          return (
            <div key={r.l} className="mb-3 last:mb-0">
              <div className="flex justify-between text-[12px] mb-1 text-ink-2"><span>{r.l}: {r.used.toLocaleString('en-IN')} / {r.cap.toLocaleString('en-IN')}</span><span>{pct}%</span></div>
              <div className="nx-progress"><div style={{ width: `${pct}%`, background: pct >= 90 ? 'var(--error)' : pct >= 75 ? 'var(--warning)' : undefined }} /></div>
            </div>
          );
        })}
      </div>

      <div className="eyebrow mt-5 mb-1">Invoices</div>
      <div className="border-t border-line">
        {INVOICES.map(inv => (
          <div key={inv.id} className="nx-row">
            <div className="flex-1"><strong>{inv.label}</strong><p>{inr(plan.price)} · issued {inv.date}</p></div>
            <button type="button" className="nx-btn sm" onClick={() => download(inv)}>Download</button>
          </div>
        ))}
      </div>

      {changing && (
        <NxModal
          title="Change plan"
          subtitle="Sample plans. Prices here are not final."
          onClose={() => setChanging(false)}
          width={520}
          footer={
            <>
              <button type="button" className="nx-btn" onClick={() => setChanging(false)}>Cancel</button>
              <button type="button" className="nx-btn primary" disabled={pick === planId}
                onClick={() => { setPlanId(pick); setChanging(false); onNotify?.('Plan changed', `You are now on the ${PLANS.find(p => p.id === pick)?.name} plan.`); }}>
                Switch plan
              </button>
            </>
          }
        >
          <div className="grid gap-2 pb-2" role="radiogroup" aria-label="Plans">
            {PLANS.map(p => {
              const tooSmall = team.length > p.seats;
              return (
                <button key={p.id} type="button" role="radio" aria-checked={pick === p.id} disabled={tooSmall}
                  className={`nx-option text-left flex! justify-between! items-center! ${pick === p.id ? 'active' : ''} ${tooSmall ? 'opacity-50' : ''}`}
                  onClick={() => setPick(p.id)}>
                  <span><strong className="block text-[14px]">{p.name}{p.id === planId ? ' (current)' : ''}</strong>
                    <span className="text-[12px] text-ink-3 font-normal">{p.convs.toLocaleString('en-IN')} conversations · {p.replies.toLocaleString('en-IN')} AI replies · {p.seats} seats{tooSmall ? ` · you have ${team.length} members` : ''}</span></span>
                  <strong className="text-[14px]">{inr(p.price)}</strong>
                </button>
              );
            })}
          </div>
        </NxModal>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Notifications                                                      */
/* ================================================================== */
interface Prefs {
  matrix: Record<string, { app: boolean; email: boolean; whatsapp: boolean }>;
  quiet: boolean;
  from: string;
  to: string;
}
const EVENTS: Array<[string, string]> = [
  ['needs', 'A conversation needs you'],
  ['hot', 'A new Hot lead'],
  ['followup', 'A follow-up is due'],
  ['handoff', 'The AI hands over a conversation'],
  ['channel', 'A channel connection fails'],
  ['publish', 'A scheduled post fails to publish'],
];
const DEFAULT_PREFS: Prefs = {
  matrix: {
    needs: { app: true, email: true, whatsapp: true },
    hot: { app: true, email: false, whatsapp: true },
    followup: { app: true, email: true, whatsapp: false },
    handoff: { app: true, email: false, whatsapp: false },
    channel: { app: true, email: true, whatsapp: false },
    publish: { app: true, email: true, whatsapp: false },
  },
  quiet: false,
  from: '22:00',
  to: '07:00',
};

export function NotificationsSection({ onNotify }: { onNotify?: Notify }) {
  const [prefs, setPrefs] = usePersisted<Prefs>('nexora_notifications_v1', DEFAULT_PREFS);
  const set = (id: string, ch: 'app' | 'email' | 'whatsapp', v: boolean) =>
    setPrefs(p => ({ ...p, matrix: { ...p.matrix, [id]: { ...p.matrix[id], [ch]: v } } }));

  return (
    <div>
      <Heading title="Notifications" hint="Choose how you hear about what needs attention. Changes are saved as you make them." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px]">
          <thead><tr><th>Event</th><th className="text-center">In-app</th><th className="text-center">Email</th><th className="text-center">WhatsApp</th></tr></thead>
          <tbody>
            {EVENTS.map(([id, label]) => (
              <tr key={id}>
                <td className="text-ink">{label}</td>
                {(['app', 'email', 'whatsapp'] as const).map(ch => (
                  <td key={ch} className="text-center">
                    <input type="checkbox" checked={prefs.matrix[id][ch]} onChange={e => set(id, ch, e.target.checked)} aria-label={`${label} by ${ch === 'app' ? 'in-app' : ch}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="nx-callout block! mt-4">
        <div className="flex items-center justify-between">
          <div><strong className="text-ink text-[13px] block">Quiet hours</strong><span className="text-[12px] text-ink-3">Hold email and WhatsApp alerts during these hours. In-app alerts still appear.</span></div>
          <Toggle on={prefs.quiet} label="Quiet hours" onChange={v => { setPrefs(p => ({ ...p, quiet: v })); onNotify?.(v ? 'Quiet hours on' : 'Quiet hours off', v ? `Alerts held from ${prefs.from} to ${prefs.to}.` : 'Alerts are sent at any time.'); }} />
        </div>
        {prefs.quiet && (
          <div className="flex items-center gap-2 mt-3 text-[13px]">
            From <input type="time" value={prefs.from} onChange={e => setPrefs(p => ({ ...p, from: e.target.value }))} aria-label="Quiet hours start" className="w-[130px]" />
            to <input type="time" value={prefs.to} onChange={e => setPrefs(p => ({ ...p, to: e.target.value }))} aria-label="Quiet hours end" className="w-[130px]" />
          </div>
        )}
      </div>
    </div>
  );
}
