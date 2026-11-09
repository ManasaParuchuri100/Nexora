import React, { useMemo, useState } from 'react';
import { Search, Flame, Inbox, CheckCircle2 } from 'lucide-react';
import { Lead } from '../../../types';
import {
  FollowUp,
  FollowUpBucket,
  useFollowUps,
  useNow,
  getBucket,
  computeFollowUpCounts,
  needsApproval,
  getUpcomingCalls,
} from '../../../data/followUps';
import { FollowUpRow, FollowUpModals, AnyFollowUpModal, Notify, leadTemperature } from './FollowUpKit';

type Tab = Exclude<FollowUpBucket, never>;
type OwnerFilter = 'all' | 'ai' | 'people';

const TABS: Array<{ id: Tab; label: string; empty: string }> = [
  { id: 'overdue', label: 'Overdue', empty: 'Nothing overdue. Every lead has been followed up on time.' },
  { id: 'today', label: 'Today', empty: 'No follow-ups due today.' },
  { id: 'upcoming', label: 'Upcoming', empty: 'Nothing scheduled yet. Add a follow-up from any lead.' },
  { id: 'nurture', label: 'Nurture', empty: 'No leads are paused for later. Use “Don’t contact until…” when a customer asks for time.' },
  { id: 'done', label: 'Done', empty: 'Completed follow-ups will appear here with their outcome.' },
];

const TEMP_RANK = { HOT: 0, WARM: 1, COLD: 2 } as const;

function dayGroup(task: FollowUp, now: Date): string {
  const due = new Date(task.dueAt);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((due.getTime() - start.getTime()) / 86400000);
  if (diffDays <= 1) return 'Tomorrow';
  if (diffDays < 7) return due.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  if (diffDays < 14) return 'Next week';
  return due.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function FollowUpsView({
  leads,
  onOpenLead,
  onOpenConversation,
  onUpdateLead,
  onNotify,
  modal,
  setModal,
}: {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onOpenConversation?: (lead: Lead) => void;
  onUpdateLead?: (lead: Lead) => void;
  onNotify?: Notify;
  modal: AnyFollowUpModal;
  setModal: (m: AnyFollowUpModal) => void;
}) {
  const tasks = useFollowUps();
  const now = useNow(30000);
  const leadMap = useMemo(() => new Map(leads.map(l => [l.id, l])), [leads]);
  // Only follow-ups whose lead still exists
  const live = useMemo(() => tasks.filter(t => leadMap.has(t.leadId)), [tasks, leadMap]);
  const counts = computeFollowUpCounts(live, now);

  const [tab, setTab] = useState<Tab>(() => (counts.overdue > 0 ? 'overdue' : 'today'));
  const [special, setSpecial] = useState<null | 'approval' | 'calls'>(null);
  const approvalOnly = special === 'approval';
  const callsOnly = special === 'calls';
  const setApprovalOnly = (v: boolean | ((x: boolean) => boolean)) => setSpecial(prev => ((typeof v === 'function' ? v(prev === 'approval') : v) ? 'approval' : null));
  const queueRef = React.useRef<HTMLElement>(null);
  const [owner, setOwner] = useState<OwnerFilter>('all');
  const [channel, setChannel] = useState('all');
  const [query, setQuery] = useState('');

  const channels = useMemo(
    () => Array.from(new Set(live.map(t => t.channel).filter(Boolean) as string[])).sort(),
    [live]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return live
      .filter(t => (approvalOnly ? needsApproval(t) : callsOnly ? t.purpose === 'meeting' && !t.completedAt : getBucket(t, now) === tab))
      .filter(t => owner === 'all' || (owner === 'ai' ? t.owner === 'AI' : t.owner !== 'AI'))
      .filter(t => channel === 'all' || t.channel === channel)
      .filter(t => {
        if (!q) return true;
        const l = leadMap.get(t.leadId);
        return [t.title, t.note, t.draft, l?.name, l?.company].some(v => v?.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        if (!approvalOnly && !callsOnly && tab === 'done') {
          return new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime();
        }
        if (!approvalOnly && !callsOnly && (tab === 'overdue' || tab === 'today')) {
          // Lead Recovery: hot leads first, then oldest due
          const ta = TEMP_RANK[leadTemperature(leadMap.get(a.leadId))];
          const tb = TEMP_RANK[leadTemperature(leadMap.get(b.leadId))];
          if (ta !== tb) return ta - tb;
        }
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      });
  }, [live, tab, approvalOnly, callsOnly, owner, channel, query, now, leadMap]);

  // Lead Recovery triage — open, actionable follow-ups by temperature
  const triage = useMemo(() => {
    const actionable = live.filter(t => {
      const b = getBucket(t, now);
      return b === 'overdue' || b === 'today';
    });
    const byTemp = { HOT: new Set<string>(), WARM: new Set<string>(), COLD: new Set<string>() };
    actionable.forEach(t => byTemp[leadTemperature(leadMap.get(t.leadId))].add(t.leadId));
    return { total: new Set(actionable.map(t => t.leadId)).size, hot: byTemp.HOT.size, warm: byTemp.WARM.size, cold: byTemp.COLD.size };
  }, [live, now, leadMap]);

  const showGroups = callsOnly || (!approvalOnly && (tab === 'upcoming' || tab === 'nurture'));
  const callCount = getUpcomingCalls(live, now).length;
  let lastGroup = '';

  const metrics = [
    {
      id: 'overdue',
      label: 'Overdue',
      value: counts.overdue,
      delta: counts.overdue ? `Oldest ${counts.oldestOverdueDays} day${counts.oldestOverdueDays === 1 ? '' : 's'} late` : 'All on time',
      tone: counts.overdue ? 'down' : '',
      go: () => { setSpecial(null); setTab('overdue'); },
    },
    {
      id: 'today',
      label: 'Due today',
      value: counts.today,
      delta: counts.today ? 'Inside business hours' : 'Nothing else today',
      tone: 'neutral',
      go: () => { setSpecial(null); setTab('today'); },
    },
    {
      id: 'approval',
      label: 'Awaiting your approval',
      value: counts.awaitingApproval,
      delta: 'AI drafts are never sent unapproved',
      tone: counts.awaitingApproval ? 'warn' : 'neutral',
      go: () => setApprovalOnly(true),
    },
    {
      id: 'nurture',
      label: 'In nurture',
      value: counts.nurture,
      delta: 'Paused until the time they asked',
      tone: 'neutral',
      go: () => { setSpecial(null); setTab('nurture'); },
    },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Lead Recovery triage */}
      {triage.total > 0 && (
        <div className="nx-insight mb-[18px]">
          <div className="nx-spark"><Flame className="w-[18px] h-[18px]" /></div>
          <div className="flex-1 min-w-0">
            <span className="eyebrow">Lead recovery · today</span>
            <h3>{triage.total} lead{triage.total === 1 ? '' : 's'} need{triage.total === 1 ? 's' : ''} a follow-up now</h3>
            <p>
              {[
                triage.hot ? `${triage.hot} hot — follow up immediately` : null,
                triage.warm ? `${triage.warm} warm — send relevant information` : null,
                triage.cold ? `${triage.cold} cold — start a nurture sequence` : null,
              ].filter(Boolean).join(' · ')}
            </p>
            <div className="flex gap-[9px] mt-[13px] flex-wrap">
              <button type="button" className="nx-btn sm primary" onClick={() => { setSpecial(null); setTab(counts.overdue ? 'overdue' : 'today'); setOwner('all'); setChannel('all'); setQuery(''); queueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                Start with hot leads →
              </button>
              {counts.awaitingApproval > 0 && (
                <button type="button" className="nx-btn sm" onClick={() => setApprovalOnly(true)}>
                  Review {counts.awaitingApproval} AI draft{counts.awaitingApproval === 1 ? '' : 's'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="nx-grid nx-metrics nx-metrics-2up mt-0!">
        {metrics.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={m.go}
            className={`nx-panel nx-metric min-h-[112px]! rounded-[15px]! ${(m.id === 'approval' ? approvalOnly : !special && tab === m.id) ? 'is-active' : ''}`}
          >
            <div className="nx-label">{m.label}</div>
            <div className="nx-number tabular-nums">{m.value}</div>
            <div className={`nx-delta ${m.tone}`}>{m.delta}</div>
          </button>
        ))}
      </div>

      <section ref={queueRef} className="nx-panel nx-pad scroll-mt-20">
        <div className="nx-sectionhead">
          <div>
            <h2>Follow-up queue</h2>
            <p>Tasks stay here until they're completed or rescheduled. Hot leads are listed first.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-line pb-3 mb-1">
          <div className="flex items-center gap-[5px] flex-wrap" role="tablist" aria-label="Follow-up status">
            {TABS.map(t => {
              const active = !special && tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setSpecial(null); setTab(t.id); }}
                  className={`nx-tab ${active ? 'active' : ''}`}
                >
                  {t.label}
                  <span className="nx-tab-count">{counts[t.id]}</span>
                </button>
              );
            })}
            <span className="w-px h-5 bg-line mx-1.5 hidden sm:block" />
            <button
              type="button"
              role="tab"
              aria-selected={approvalOnly}
              onClick={() => setSpecial(approvalOnly ? null : 'approval')}
              className={`nx-tab ${approvalOnly ? 'active' : ''}`}
            >
              Needs approval
              <span className="nx-tab-count">{counts.awaitingApproval}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={callsOnly}
              onClick={() => setSpecial(callsOnly ? null : 'calls')}
              className={`nx-tab ${callsOnly ? 'active' : ''}`}
            >
              Calls
              <span className="nx-tab-count">{callCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
              <input
                className="nx-input pl-8! w-[190px]"
                placeholder="Search follow-ups"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search follow-ups"
              />
            </div>
            <select className="nx-input w-auto!" value={owner} onChange={e => setOwner(e.target.value as OwnerFilter)} aria-label="Owner">
              <option value="all">All owners</option>
              <option value="ai">Engagement Agent</option>
              <option value="people">People</option>
            </select>
            <select className="nx-input w-auto!" value={channel} onChange={e => setChannel(e.target.value)} aria-label="Channel">
              <option value="all">All channels</option>
              {channels.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="nx-alerticon green mx-auto mb-3">
              {approvalOnly || tab === 'done' ? <Inbox className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div className="font-display text-[14px] font-bold text-ink">
              {query || owner !== 'all' || channel !== 'all' ? 'No follow-ups match these filters' : approvalOnly ? 'No drafts waiting for approval' : callsOnly ? 'No calls scheduled' : `You're all caught up`}
            </div>
            <p className="text-[12px] text-ink-3 mt-1 mb-0 max-w-[420px] mx-auto">
              {query || owner !== 'all' || channel !== 'all'
                ? 'Try clearing the search or filters.'
                : approvalOnly
                ? 'Every AI-drafted follow-up has been reviewed.'
                : callsOnly
                ? 'Scheduled Zoom, Google Meet and Teams calls appear here for the whole team.'
                : TABS.find(t => t.id === tab)?.empty}
            </p>
            {!approvalOnly && tab !== 'done' && !query && (
              <button type="button" className="nx-btn sm mt-4" onClick={() => setModal({ type: 'new' })}>
                + Add
              </button>
            )}
          </div>
        ) : (
          <div>
            {filtered.map(task => {
              const group = showGroups ? dayGroup(task, now) : '';
              const header = showGroups && group !== lastGroup;
              lastGroup = group;
              return (
                <React.Fragment key={task.id}>
                  {header && <div className="nx-groupHead">{group}</div>}
                  <FollowUpRow
                    task={task}
                    lead={leadMap.get(task.leadId)}
                    now={now}
                    onOpenModal={setModal}
                    onOpenLead={onOpenLead}
                    onOpenConversation={onOpenConversation}
                    onNotify={onNotify}
                  />
                </React.Fragment>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-[11px] text-ink-3 mt-4">
        Follow-ups are scheduled Mon–Sat, 9 AM–7 PM. No reply → next attempt (hot 1 day, warm 3 days, cold 7 days), up to 3 attempts, then nurture.
      </p>

      <FollowUpModals modal={modal} leads={leads} onClose={() => setModal(null)} onNotify={onNotify} onUpdateLead={onUpdateLead} setModal={setModal} />
    </div>
  );
}
