import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  CheckSquare,
  Clock,
  Sparkles,
  X,
  MoreHorizontal,
  PauseCircle,
  CornerDownRight,
  AlertTriangle,
} from 'lucide-react';
import { Lead } from '../../../types';
import {
  FollowUp,
  FollowUpKind,
  FollowUpOutcome,
  FollowUpPurpose,
  Temperature,
  OUTCOME_LABELS,
  PURPOSE_LABELS,
  MAX_ATTEMPTS,
  getBucket,
  formatDue,
  needsApproval,
  isPausedByHandoff,
  planNextStep,
  completeFollowUp,
  approveFollowUp,
  snoozeFollowUp,
  snoozeTarget,
  deleteFollowUp,
  restoreFollowUp,
  reopenFollowUp,
  updateFollowUp,
  addFollowUp,
  holdLeadUntil,
  alignToBusinessHours,
  isOutsideBusinessHours,
  daysFromNowAt,
  nextAttemptDate,
  getNextFollowUp,
  getFollowUpsForLead,
} from '../../../data/followUps';

export type Notify = (title: string, desc: string, action?: { label: string; onClick: () => void }) => void;

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

export function leadTemperature(lead?: Lead): Temperature {
  if (!lead) return 'WARM';
  const t = lead.temperatureOverride || lead.temperature;
  if (t) return t;
  if (lead.score >= 80) return 'HOT';
  if (lead.score >= 50) return 'WARM';
  return 'COLD';
}

export const firstName = (lead?: Lead) => (lead?.name || '').replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').split(/\s+/)[0] || undefined;

const KIND_ICON: Record<FollowUpKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  call: Phone,
  email: Mail,
  message: MessageSquare,
  task: CheckSquare,
};

export const KIND_LABEL: Record<FollowUpKind, string> = { call: 'Call', email: 'Email', message: 'Message', task: 'Task' };

const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const shortDate = (d: Date) =>
  d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export function aiDraftFor(lead: Lead | undefined, purpose: FollowUpPurpose, title: string): string {
  const name = firstName(lead);
  const hi = name ? `Hi ${name}` : 'Hi there';
  switch (purpose) {
    case 'nurture':
      return `${hi}, you mentioned you'd revisit this later. We have a couple of options that match what you were looking for${lead?.budget ? ` around ${lead.budget}` : ''}. Would you like me to send them?`;
    case 'appointment_reminder':
      return `${hi}, a quick reminder of our upcoming meeting. Reply here if you need to reschedule.`;
    case 'no_show':
      return `${hi}, sorry we missed you today. Would Tuesday at 4 PM or Wednesday at 11 AM work better to reschedule?`;
    case 'reactivation':
      return `${hi}, it's been a while! Last time you were looking at ${lead?.requirement?.toLowerCase() || 'our services'}. We have something new that may fit — would you like to see it?`;
    default:
      return `${hi}, following up on ${title.toLowerCase()}${lead?.requirement ? ` for ${lead.requirement.toLowerCase().replace(/\.$/, '')}` : ''}. Is there anything I can clarify to help you decide?`;
  }
}

/* --------------------------------------------------------------------------
   Modal shell
   -------------------------------------------------------------------------- */

export function NxModal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 560,
}: {
  title: string;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-overlay backdrop-blur-[2px] animate-fadeIn" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="nx-modal relative w-full max-h-[90vh] flex flex-col animate-fadeIn"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start justify-between gap-4 px-[27px] pt-[24px] pb-4">
          <div className="min-w-0">
            <h2 className="font-display text-[20px] font-bold tracking-[-0.5px] text-ink m-0">{title}</h2>
            {subtitle && <p className="text-[12px] text-ink-3 mt-1 mb-0">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="nx-iconbtn">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-[27px] pb-2 overflow-y-auto">{children}</div>
        <div className="flex items-center justify-end gap-[9px] flex-wrap px-[27px] py-[18px] border-t border-line mt-3">
          {footer}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="nx-field">
      <label>{label}</label>
      {children}
      {hint && <div className="text-[11px] text-ink-3 mt-1.5">{hint}</div>}
    </div>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: string }>;
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[7px]">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`nx-chip ${value === o.id ? 'active' : ''}`}
          aria-pressed={value === o.id}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Review & send / approve
   -------------------------------------------------------------------------- */

export function ReviewSendModal({
  task,
  lead,
  onClose,
  onNotify,
}: {
  task: FollowUp;
  lead?: Lead;
  onClose: () => void;
  onNotify?: Notify;
}) {
  const [draft, setDraft] = useState(task.draft || aiDraftFor(lead, task.purpose || 'follow_up', task.title));
  const temperature = leadTemperature(lead);
  const plan = planNextStep(task, 'sent', temperature);
  const isAiTask = task.owner === 'AI';
  const notDueYet = new Date(task.dueAt).getTime() > Date.now();
  const empty = !draft.trim();

  const sendNow = () => {
    if (empty) return;
    updateFollowUp(task.id, { draft: draft.trim() });
    const res = completeFollowUp(task.id, {
      outcome: 'sent',
      temperature,
      leadFirstName: firstName(lead),
    });
    onNotify?.(
      'Follow-up sent',
      res.next
        ? `Sent to ${lead?.name || 'the lead'} on ${task.channel || 'their channel'}. ${res.movedToNurture ? 'Moved to nurture if there is no reply.' : `If there's no reply, attempt ${(task.attempt ?? 1) + 1} is scheduled for ${shortDate(new Date(res.next.dueAt))}.`}`
        : `Sent to ${lead?.name || 'the lead'} on ${task.channel || 'their channel'}.`
    );
    onClose();
  };

  const approve = () => {
    if (empty) return;
    approveFollowUp(task.id, draft.trim());
    onNotify?.('Approved for auto-send', `The Engagement Agent will send this ${formatDue(task).toLowerCase().startsWith('today') ? 'today' : `on ${shortDate(new Date(task.dueAt))}`}.`);
    onClose();
  };

  return (
    <NxModal
      title={isAiTask && needsApproval(task) ? 'Review AI draft' : 'Review & send'}
      subtitle={
        <>
          To <b className="text-ink">{lead?.name || 'Lead'}</b>
          {lead?.company ? ` · ${lead.company}` : ''} via {task.channel || 'WhatsApp'} · {formatDue(task)}
        </>
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          {isAiTask && notDueYet && (
            <button type="button" className="nx-btn" disabled={empty} onClick={approve}>
              Approve for auto-send
            </button>
          )}
          <button type="button" className="nx-btn primary" disabled={empty} onClick={sendNow}>
            Send now →
          </button>
        </>
      }
    >
      {task.customerRepliedAt && (
        <div className="nx-callout amber mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
          <span>The customer replied after this follow-up was scheduled. Check the conversation before sending.</span>
        </div>
      )}
      <Field
        label="Message"
        hint={
          <div className="flex items-center justify-between gap-3">
            <span>{draft.trim().length} characters</span>
            <button type="button" className="nx-link text-[11px] inline-flex items-center gap-1" onClick={() => setDraft(aiDraftFor(lead, task.purpose || 'follow_up', task.title))}>
              <Sparkles className="w-3.5 h-3.5" /> Redraft with AI
            </button>
          </div>
        }
      >
        <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={6} autoFocus />
      </Field>
      {lead && (
        <div className="nx-kv mt-1"><span>Lead</span><b>{lead.stage || lead.status} · {temperature.charAt(0) + temperature.slice(1).toLowerCase()} · {lead.score}/100</b></div>
      )}
      <div className="nx-kv"><span>If there's no reply</span><b>{plan.label}</b></div>
    </NxModal>
  );
}

/* --------------------------------------------------------------------------
   Log outcome / complete
   -------------------------------------------------------------------------- */

const OUTCOMES_BY_KIND: Record<FollowUpKind, FollowUpOutcome[]> = {
  call: ['call_connected', 'no_response', 'meeting_booked', 'not_interested'],
  message: ['replied', 'no_response', 'meeting_booked', 'not_interested'],
  email: ['replied', 'no_response', 'meeting_booked', 'not_interested'],
  task: ['done', 'cancelled'],
};

const OUTCOME_HELP: Partial<Record<FollowUpOutcome, string>> = {
  call_connected: 'You spoke with the customer.',
  no_response: 'No answer or no reply yet.',
  replied: 'The customer responded — qualification continues.',
  meeting_booked: 'An appointment or demo was scheduled.',
  not_interested: 'The customer declined.',
  done: 'The task is complete.',
  cancelled: 'No longer needed.',
};

export function LogOutcomeModal({
  task,
  lead,
  onClose,
  onNotify,
  onUpdateLead,
}: {
  task: FollowUp;
  lead?: Lead;
  onClose: () => void;
  onNotify?: Notify;
  onUpdateLead?: (lead: Lead) => void;
}) {
  const options = OUTCOMES_BY_KIND[task.kind];
  const [outcome, setOutcome] = useState<FollowUpOutcome>(options[0]);
  const [note, setNote] = useState('');
  const temperature = leadTemperature(lead);
  const plan = planNextStep(task, outcome, temperature);
  const [scheduleNext, setScheduleNext] = useState(true);
  const [customNext, setCustomNext] = useState<string>('');
  const [markLost, setMarkLost] = useState(true);
  const defaultNext = plan.dueAt ?? nextAttemptDate(temperature);

  useEffect(() => {
    setScheduleNext(plan.kind !== 'none' || outcome === 'call_connected');
    setCustomNext('');
  }, [outcome]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    const nextIso = customNext ? new Date(customNext).toISOString() : undefined;
    let res;
    if (plan.kind === 'none' && scheduleNext && (outcome === 'call_connected' || outcome === 'done')) {
      res = completeFollowUp(task.id, { outcome, note, scheduleNext: false });
      const next = addFollowUp({
        leadId: task.leadId,
        title: 'Follow up after conversation',
        kind: task.kind === 'task' ? 'task' : 'message',
        channel: task.channel,
        owner: task.owner,
        purpose: 'follow_up',
        attempt: 1,
        dueAt: nextIso ?? defaultNext.toISOString(),
        source: 'manual',
        draft: task.kind === 'task' ? undefined : aiDraftFor(lead, 'follow_up', 'our conversation'),
        previousId: task.id,
      });
      res = { ...res, next };
    } else {
      res = completeFollowUp(task.id, {
        outcome,
        note,
        temperature,
        scheduleNext: plan.kind !== 'none' && scheduleNext,
        nextDueAt: nextIso,
        leadFirstName: firstName(lead),
      });
    }
    if (outcome === 'not_interested' && markLost && lead && onUpdateLead) {
      onUpdateLead({ ...lead, stage: 'Lost', status: 'Lost', lostReason: note.trim() || 'Not interested' });
    }
    onNotify?.(
      OUTCOME_LABELS[outcome],
      res.next
        ? `Next: ${res.next.purpose === 'nurture' ? 'nurture check-in' : res.next.attempt && res.next.attempt > 1 ? `attempt ${res.next.attempt} of ${res.next.maxAttempts ?? MAX_ATTEMPTS}` : res.next.title} · ${shortDate(new Date(res.next.dueAt))}.`
        : outcome === 'not_interested' && markLost
        ? `${lead?.name || 'Lead'} marked as lost. No further follow-ups.`
        : 'Follow-up completed. Nothing else is scheduled for this lead.'
    );
    onClose();
  };

  return (
    <NxModal
      title={task.kind === 'call' ? 'Log call' : task.kind === 'task' ? 'Complete task' : 'Log outcome'}
      subtitle={<>{task.title} · <b className="text-ink">{lead?.name || 'Lead'}</b>{lead?.company ? ` · ${lead.company}` : ''}</>}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={submit}>Save outcome</button>
        </>
      }
    >
      <Field label="What happened?">
        <div className="grid gap-[7px]">
          {options.map(o => (
            <label key={o} className={`nx-option ${outcome === o ? 'active' : ''}`}>
              <input type="radio" name="outcome" checked={outcome === o} onChange={() => setOutcome(o)} />
              <span className="flex-1">
                <b>{o === 'no_response' && task.kind === 'call' ? 'No answer' : OUTCOME_LABELS[o]}</b>
                <span>{OUTCOME_HELP[o]}</span>
              </span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Note (optional)">
        <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Key points, objections, what the customer asked for…" />
      </Field>

      <div className="nx-next">
        <div className="text-[11px] font-bold text-ink-2 mb-2">What happens next</div>
        {outcome === 'not_interested' ? (
          <label className="flex items-center gap-2.5 text-[12px] text-ink cursor-pointer">
            <input type="checkbox" checked={markLost} onChange={e => setMarkLost(e.target.checked)} />
            Mark {lead?.name || 'this lead'} as Lost and stop follow-ups
          </label>
        ) : plan.kind === 'none' && outcome !== 'call_connected' && outcome !== 'done' ? (
          <div className="text-[12px] text-ink-2">{plan.label}.</div>
        ) : (
          <>
            <label className="flex items-center gap-2.5 text-[12px] text-ink cursor-pointer">
              <input type="checkbox" checked={scheduleNext} onChange={e => setScheduleNext(e.target.checked)} />
              {plan.kind === 'none' ? 'Schedule another follow-up' : plan.label}
            </label>
            {scheduleNext && (
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <input
                  type="datetime-local"
                  className="nx-input max-w-[230px]"
                  value={customNext || toLocalInput(defaultNext)}
                  min={toLocalInput(new Date())}
                  onChange={e => setCustomNext(e.target.value)}
                  aria-label="Next follow-up date"
                />
                <span className="text-[11px] text-ink-3">
                  {plan.kind === 'attempt' ? `${temperature.charAt(0) + temperature.slice(1).toLowerCase()} lead cadence` : 'Adjust if needed'}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </NxModal>
  );
}

/* --------------------------------------------------------------------------
   Add / edit follow-up
   -------------------------------------------------------------------------- */

type DueChip = 'hour' | 'today_pm' | 'tomorrow' | 'in_3' | 'next_week' | 'custom';

function dueFromChip(chip: DueChip): Date {
  const now = new Date();
  switch (chip) {
    case 'hour': return alignToBusinessHours(new Date(now.getTime() + 60 * 60 * 1000));
    case 'today_pm': {
      const d = new Date(now);
      d.setHours(17, 0, 0, 0);
      return d.getTime() > now.getTime() ? d : daysFromNowAt(1, 10);
    }
    case 'tomorrow': return daysFromNowAt(1, 10);
    case 'in_3': return daysFromNowAt(3, 10);
    case 'next_week': return snoozeTarget('next_week');
    default: return daysFromNowAt(1, 10);
  }
}

export function AddFollowUpModal({
  leads,
  initialLeadId,
  editing,
  currentUserName = 'You',
  onClose,
  onNotify,
}: {
  leads: Lead[];
  initialLeadId?: string;
  editing?: FollowUp;
  currentUserName?: string;
  onClose: () => void;
  onNotify?: Notify;
}) {
  const sortedLeads = useMemo(() => [...leads].sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name)), [leads]);
  const [leadId, setLeadId] = useState(editing?.leadId || initialLeadId || '');
  const lead = leads.find(l => l.id === leadId);
  const [purpose, setPurpose] = useState<FollowUpPurpose>(editing?.purpose || 'follow_up');
  const [kind, setKind] = useState<FollowUpKind>(editing?.kind || 'message');
  const [title, setTitle] = useState(editing?.title || '');
  const [channel, setChannel] = useState(editing?.channel || '');
  const [owner, setOwner] = useState(editing?.owner || 'AI');
  const [chip, setChip] = useState<DueChip | null>(editing ? 'custom' : 'tomorrow');
  const [customDue, setCustomDue] = useState(editing ? toLocalInput(new Date(editing.dueAt)) : '');
  const [draft, setDraft] = useState(editing?.draft || '');
  const [note, setNote] = useState(editing?.note || '');
  const [autoSend, setAutoSend] = useState(editing?.approval === 'approved');
  const [touched, setTouched] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!lead || editing) return;
    setChannel(lead.preferredChannel || (lead.source === 'Instagram' || lead.source === 'WhatsApp' || lead.source === 'Website' ? lead.source : 'WhatsApp'));
    if (!title) setTitle(lead.aiRecommendation ? lead.aiRecommendation.replace(/\.$/, '') : 'Check in on next steps');
  }, [leadId]); // eslint-disable-line react-hooks/exhaustive-deps

  const due = chip && chip !== 'custom' ? dueFromChip(chip) : customDue ? new Date(customDue) : null;
  const isMessage = kind === 'message' || kind === 'email';
  const existing = leadId && !editing ? getNextFollowUp(leadId) : undefined;
  const owners = Array.from(new Set(['AI', currentUserName, lead?.assignee?.name].filter(Boolean) as string[]));

  const errors: string[] = [];
  if (!leadId) errors.push('Choose a lead.');
  if (!title.trim()) errors.push('Add a short title.');
  if (!due || isNaN(due.getTime())) errors.push('Pick when it is due.');
  else if (due.getTime() < Date.now() - 60 * 1000) errors.push('The due time is in the past.');
  if (isMessage && owner === 'AI' && !draft.trim()) errors.push('AI-sent messages need a draft.');
  if (kind === 'call' && owner === 'AI') errors.push('Calls need a person as owner.');

  const save = () => {
    setTouched(true);
    if (errors.length || !due) return;
    const aligned = alignToBusinessHours(due);
    const payload = {
      leadId,
      title: title.trim(),
      kind,
      channel: kind === 'task' ? undefined : channel || undefined,
      owner,
      purpose,
      dueAt: aligned.toISOString(),
      draft: isMessage ? draft.trim() || undefined : undefined,
      note: note.trim() || undefined,
      approval: owner === 'AI' && isMessage ? (autoSend ? 'approved' as const : 'draft' as const) : undefined,
    };
    if (editing) {
      updateFollowUp(editing.id, payload);
      onNotify?.('Follow-up updated', `${title.trim()} · ${shortDate(aligned)}.`);
    } else {
      addFollowUp({ ...payload, source: 'manual', attempt: purpose === 'follow_up' ? 1 : undefined, maxAttempts: purpose === 'follow_up' ? MAX_ATTEMPTS : undefined });
      onNotify?.(
        'Follow-up scheduled',
        `${lead?.name || 'Lead'} · ${shortDate(aligned)}${owner === 'AI' && isMessage ? (autoSend ? ' · AI will send automatically' : ' · waiting for your approval') : ''}.`
      );
    }
    onClose();
  };

  return (
    <NxModal
      title={editing ? 'Edit follow-up' : 'New follow-up'}
      subtitle="Scheduled within business hours (Mon–Sat, 9 AM–7 PM)."
      onClose={onClose}
      width={620}
      footer={
        <>
          {touched && errors.length > 0 && <span className="text-[11px] text-danger mr-auto">{errors[0]}</span>}
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={save}>{editing ? 'Save changes' : 'Schedule follow-up'}</button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-x-[18px]">
        <Field label="Lead">
          <select value={leadId} onChange={e => setLeadId(e.target.value)} disabled={!!editing} autoFocus={!initialLeadId && !editing}>
            <option value="">Select a lead…</option>
            {sortedLeads.map(l => (
              <option key={l.id} value={l.id}>{l.company || l.name}{l.company && l.name ? ` — ${l.name}` : ''}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select value={purpose} onChange={e => setPurpose(e.target.value as FollowUpPurpose)}>
            {(Object.keys(PURPOSE_LABELS) as FollowUpPurpose[]).map(p => (
              <option key={p} value={p}>{PURPOSE_LABELS[p]}</option>
            ))}
          </select>
        </Field>
      </div>

      {existing && (
        <div className="nx-callout mb-3">
          <Clock className="w-4 h-4 shrink-0 mt-px" />
          <span>This lead already has an open follow-up: <b>{existing.title}</b> ({formatDue(existing)}).</span>
        </div>
      )}

      <Field label="Title">
        <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Send pricing comparison" />
      </Field>

      <Field label="Action">
        <Chips<FollowUpKind>
          options={(['message', 'email', 'call', 'task'] as FollowUpKind[]).map(k => ({ id: k, label: KIND_LABEL[k] }))}
          value={kind}
          onChange={k => {
            setKind(k);
            if (k === 'call' && owner === 'AI') setOwner(lead?.assignee?.name || currentUserName);
          }}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-x-[18px]">
        {kind !== 'task' && (
          <Field label="Channel">
            <select value={channel} onChange={e => setChannel(e.target.value)}>
              {['WhatsApp', 'Instagram', 'Email', 'LinkedIn', 'Phone', 'Website'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        )}
        <Field label="Owner">
          <select value={owner} onChange={e => setOwner(e.target.value)}>
            {owners.map(o => (
              <option key={o} value={o} disabled={o === 'AI' && (kind === 'call' || kind === 'task')}>
                {o === 'AI' ? 'Engagement Agent (AI)' : o}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Due"
        hint={due && !isNaN(due.getTime()) ? (
          <>
            {shortDate(alignToBusinessHours(due))}
            {isOutsideBusinessHours(due) && ' · moved into business hours'}
          </>
        ) : undefined}
      >
        <Chips<DueChip>
          options={[
            { id: 'hour', label: 'In 1 hour' },
            { id: 'today_pm', label: 'Today 5 PM' },
            { id: 'tomorrow', label: 'Tomorrow 10 AM' },
            { id: 'in_3', label: 'In 3 days' },
            { id: 'next_week', label: 'Next week' },
            { id: 'custom', label: 'Pick date…' },
          ]}
          value={chip}
          onChange={c => {
            setChip(c);
            if (c === 'custom' && !customDue) setCustomDue(toLocalInput(daysFromNowAt(1, 10)));
          }}
        />
        {chip === 'custom' && (
          <input
            type="datetime-local"
            className="mt-2.5 max-w-[240px]"
            value={customDue}
            min={toLocalInput(new Date())}
            onChange={e => setCustomDue(e.target.value)}
            aria-label="Custom due date"
          />
        )}
      </Field>

      {isMessage && (
        <Field
          label="Message draft"
          hint={
            <div className="flex justify-end">
              <button type="button" className="nx-link text-[11px] inline-flex items-center gap-1" onClick={() => setDraft(aiDraftFor(lead, purpose, title || 'our last conversation'))} disabled={!lead}>
                <Sparkles className="w-3.5 h-3.5" /> Draft with AI
              </button>
            </div>
          }
        >
          <textarea rows={4} value={draft} onChange={e => setDraft(e.target.value)} placeholder="What should we send?" />
        </Field>
      )}

      {owner === 'AI' && isMessage && (
        <Field label="Sending">
          <div className="grid gap-[7px]">
            <label className={`nx-option ${!autoSend ? 'active' : ''}`}>
              <input type="radio" name="send" checked={!autoSend} onChange={() => setAutoSend(false)} />
              <span className="flex-1"><b>Ask me to approve first</b><span>The draft waits in “Needs approval”.</span></span>
            </label>
            <label className={`nx-option ${autoSend ? 'active' : ''}`}>
              <input type="radio" name="send" checked={autoSend} onChange={() => setAutoSend(true)} />
              <span className="flex-1"><b>Send automatically when due</b><span>Paused if a person takes over or the customer replies.</span></span>
            </label>
          </div>
        </Field>
      )}

      <Field label="Internal note (optional)">
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Context for the team" />
      </Field>
    </NxModal>
  );
}

/* --------------------------------------------------------------------------
   Don't contact until… (nurture hold)
   -------------------------------------------------------------------------- */

export function HoldModal({ lead, onClose, onNotify }: { lead: Lead; onClose: () => void; onNotify?: Notify }) {
  const [chip, setChip] = useState<'week' | 'month' | 'quarter' | 'custom'>('month');
  const [custom, setCustom] = useState(toLocalInput(daysFromNowAt(30, 10)));
  const [reason, setReason] = useState('Customer asked to be contacted later');
  const until =
    chip === 'week' ? daysFromNowAt(7, 10) : chip === 'month' ? daysFromNowAt(30, 10) : chip === 'quarter' ? daysFromNowAt(90, 10) : new Date(custom);
  const openCount = getFollowUpsForLead(lead.id).filter(t => !t.completedAt).length;

  const save = () => {
    if (isNaN(until.getTime())) return;
    holdLeadUntil(lead.id, until, reason.trim() || 'Customer asked to be contacted later', lead.preferredChannel, firstName(lead));
    onNotify?.('Lead moved to nurture', `${lead.name} won't be contacted before ${until.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`);
    onClose();
  };

  return (
    <NxModal
      title="Don't contact until…"
      subtitle={<>Pause active follow-ups for <b className="text-ink">{lead.name}</b> and check back at the time they asked.</>}
      onClose={onClose}
      width={500}
      footer={
        <>
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={save}>Pause & schedule check-in</button>
        </>
      }
    >
      <Field label="Check back" hint={!isNaN(until.getTime()) ? shortDate(alignToBusinessHours(until)) : undefined}>
        <Chips
          options={[
            { id: 'week' as const, label: 'Next week' },
            { id: 'month' as const, label: 'Next month' },
            { id: 'quarter' as const, label: 'In 3 months' },
            { id: 'custom' as const, label: 'Pick date…' },
          ]}
          value={chip}
          onChange={setChip}
        />
        {chip === 'custom' && (
          <input type="datetime-local" className="mt-2.5 max-w-[240px]" value={custom} min={toLocalInput(new Date())} onChange={e => setCustom(e.target.value)} aria-label="Check back date" />
        )}
      </Field>
      <Field label="Reason" hint={openCount ? `${openCount} open follow-up${openCount === 1 ? '' : 's'} will be closed and replaced by one check-in.` : 'A single check-in will be scheduled.'}>
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder='e.g. "Buying after Diwali"' />
      </Field>
    </NxModal>
  );
}

/* --------------------------------------------------------------------------
   Row
   -------------------------------------------------------------------------- */

export type RowModal =
  | { type: 'review'; task: FollowUp }
  | { type: 'outcome'; task: FollowUp }
  | { type: 'edit'; task: FollowUp }
  | { type: 'hold'; lead: Lead };

export function FollowUpRow({
  task,
  lead,
  now,
  compact = false,
  onOpenModal,
  onOpenLead,
  onOpenConversation,
  onNotify,
}: {
  task: FollowUp;
  lead?: Lead;
  now: Date;
  compact?: boolean;
  onOpenModal: (m: RowModal) => void;
  onOpenLead?: (lead: Lead) => void;
  onOpenConversation?: (lead: Lead) => void;
  onNotify?: Notify;
}) {
  const [menu, setMenu] = useState<null | 'snooze' | 'more'>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menu]);

  const bucket = getBucket(task, now);
  const Icon = KIND_ICON[task.kind];
  const tone = bucket === 'overdue' ? 'red' : bucket === 'today' ? 'amber' : bucket === 'done' ? 'green' : bucket === 'nurture' ? '' : 'muted';
  const paused = isPausedByHandoff(task, lead?.handlingMode);
  const awaiting = needsApproval(task);
  const replied = !!task.customerRepliedAt && !task.completedAt;
  const isMessage = task.kind === 'message' || task.kind === 'email';
  const temperature = leadTemperature(lead);

  const primary = (() => {
    if (task.completedAt) return null;
    if (replied) return { label: 'Open conversation', primary: true, run: () => lead && (onOpenConversation ?? onOpenLead)?.(lead) };
    if (paused) return { label: 'Open lead', primary: false, run: () => lead && onOpenLead?.(lead) };
    if (isMessage && awaiting) return { label: 'Review & approve', primary: bucket !== 'upcoming' && bucket !== 'nurture', run: () => onOpenModal({ type: 'review', task }) };
    if (isMessage && task.owner === 'AI' && (bucket === 'upcoming' || bucket === 'nurture'))
      return { label: 'Edit draft', primary: false, run: () => onOpenModal({ type: 'review', task }) };
    if (isMessage) return { label: 'Review & send', primary: bucket === 'overdue' || bucket === 'today', run: () => onOpenModal({ type: 'review', task }) };
    if (task.kind === 'call') return { label: 'Log call', primary: bucket === 'overdue' || bucket === 'today', run: () => onOpenModal({ type: 'outcome', task }) };
    return { label: 'Mark done', primary: bucket === 'overdue' || bucket === 'today', run: () => onOpenModal({ type: 'outcome', task }) };
  })();

  const doSnooze = (opt: 'later' | 'tomorrow' | 'in_3_days' | 'next_week') => {
    const before = task.dueAt;
    const target = snoozeFollowUp(task.id, opt);
    setMenu(null);
    onNotify?.('Follow-up rescheduled', `${task.title} · ${shortDate(target)}.`, {
      label: 'Undo',
      onClick: () => updateFollowUp(task.id, { dueAt: before, snoozeCount: task.snoozeCount }),
    });
  };

  const doDelete = () => {
    const removed = deleteFollowUp(task.id);
    setMenu(null);
    if (removed) onNotify?.('Follow-up deleted', removed.title, { label: 'Undo', onClick: () => restoreFollowUp(removed) });
  };

  const meta = [
    formatDue(task, now),
    !compact && lead ? lead.name : null,
    task.channel || (task.kind === 'task' ? 'Internal task' : null),
    task.owner === 'AI' ? 'Engagement Agent' : task.owner,
  ].filter(Boolean);

  return (
    <div className={`nx-furow ${compact ? 'compact' : ''} ${task.completedAt ? 'is-done' : ''}`}>
      <div className={`nx-alerticon ${tone}`}>
        <Icon className="w-4 h-4" strokeWidth={1.9} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <strong className="text-[13px] text-ink">
            {task.title}
            {!compact && lead && (
              <>
                {' '}
                <span className="text-ink-3 font-normal">·</span>{' '}
                <button type="button" className="nx-inline-link" onClick={() => onOpenLead?.(lead)}>
                  {lead.company || lead.name}
                </button>
              </>
            )}
          </strong>
        </div>
        <p className="text-[11px] text-ink-3 mt-[3px] mb-0 truncate">
          <span className={bucket === 'overdue' ? 'text-danger font-bold' : bucket === 'today' ? 'text-warn font-bold' : ''}>{meta[0]}</span>
          {meta.slice(1).map((m, i) => (
            <span key={i}> · {m}</span>
          ))}
        </p>

        <div className="flex items-center gap-[6px] flex-wrap mt-2">
          {!compact && lead && (
            <span className={`nx-tag ${temperature === 'HOT' ? 'red' : temperature === 'WARM' ? 'amber' : ''}`}>
              {temperature.charAt(0) + temperature.slice(1).toLowerCase()} · {lead.score}
            </span>
          )}
          {task.purpose && task.purpose !== 'follow_up' && <span className="nx-tag teal">{PURPOSE_LABELS[task.purpose]}</span>}
          {task.attempt && task.purpose === 'follow_up' && !task.completedAt && (
            <span className="nx-tag">Attempt {task.attempt} of {task.maxAttempts ?? MAX_ATTEMPTS}</span>
          )}
          {replied && <span className="nx-tag red">Customer replied — review before sending</span>}
          {paused && (
            <span className="nx-tag amber inline-flex items-center gap-1"><PauseCircle className="w-3 h-3" /> Paused · human handling</span>
          )}
          {!paused && !replied && awaiting && <span className="nx-tag amber">AI draft · needs approval</span>}
          {!paused && !replied && !awaiting && task.owner === 'AI' && isMessage && !task.completedAt && (
            <span className="nx-tag green">Approved · sends automatically</span>
          )}
          {(task.snoozeCount ?? 0) > 0 && !task.completedAt && (
            <span className="nx-tag">Rescheduled {task.snoozeCount}×</span>
          )}
          {task.completedAt && task.outcome && (
            <span className={`nx-tag ${task.outcome === 'replied' || task.outcome === 'meeting_booked' || task.outcome === 'call_connected' ? 'green' : task.outcome === 'not_interested' ? 'red' : ''}`}>
              {OUTCOME_LABELS[task.outcome]}
            </span>
          )}
        </div>

        {(task.note || task.outcomeNote) && !compact && (
          <p className="text-[11px] text-ink-2 mt-2 mb-0 flex items-start gap-1.5">
            <CornerDownRight className="w-3 h-3 mt-[3px] shrink-0 text-ink-3" />
            <span>{task.outcomeNote || task.note}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-[7px] shrink-0 self-center relative" ref={menuRef}>
        {primary && (
          <button type="button" className={`nx-btn sm ${primary.primary ? 'primary' : ''}`} onClick={primary.run}>
            {primary.label}{primary.primary ? ' →' : ''}
          </button>
        )}
        {task.completedAt ? (
          <button
            type="button"
            className="nx-btn sm"
            onClick={() => {
              reopenFollowUp(task.id);
              onNotify?.('Follow-up reopened', task.title);
            }}
          >
            Reopen
          </button>
        ) : (
          <button type="button" className="nx-btn sm" onClick={() => setMenu(menu === 'snooze' ? null : 'snooze')} aria-haspopup="menu" aria-expanded={menu === 'snooze'}>
            <Clock className="w-3.5 h-3.5" /> Snooze
          </button>
        )}
        <button type="button" className="nx-iconbtn sm" aria-label="More actions" aria-haspopup="menu" aria-expanded={menu === 'more'} onClick={() => setMenu(menu === 'more' ? null : 'more')}>
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menu === 'snooze' && (
          <div className="nx-menu" role="menu">
            {([
              ['later', 'In 3 hours'],
              ['tomorrow', 'Tomorrow 10 AM'],
              ['in_3_days', 'In 3 days'],
              ['next_week', 'Next Monday'],
            ] as const).map(([id, label]) => (
              <button key={id} type="button" role="menuitem" onClick={() => doSnooze(id)}>
                <span>{label}</span>
                <span className="text-ink-3">{snoozeTarget(id).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
              </button>
            ))}
            <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenModal({ type: 'edit', task }); }}>
              <span>Pick date & time…</span>
            </button>
          </div>
        )}

        {menu === 'more' && (
          <div className="nx-menu" role="menu">
            {!task.completedAt && (
              <>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenModal({ type: 'edit', task }); }}>Edit follow-up</button>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenModal({ type: 'outcome', task }); }}>Log outcome…</button>
                {task.owner === 'AI' ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      const to = lead?.assignee?.name || 'You';
                      updateFollowUp(task.id, { owner: to, approval: undefined });
                      setMenu(null);
                      onNotify?.('Assigned to a person', `${task.title} → ${to}. The AI won't send it.`);
                    }}
                  >
                    Assign to {lead?.assignee?.name || 'me'}
                  </button>
                ) : task.kind !== 'call' && task.kind !== 'task' ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      updateFollowUp(task.id, { owner: 'AI', approval: 'draft' });
                      setMenu(null);
                      onNotify?.('Handed to the Engagement Agent', 'The draft will wait for your approval before sending.');
                    }}
                  >
                    Hand to Engagement Agent
                  </button>
                ) : null}
                {lead && (
                  <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenModal({ type: 'hold', lead }); }}>
                    Don't contact until…
                  </button>
                )}
              </>
            )}
            {!compact && lead && (
              <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenLead?.(lead); }}>Open lead</button>
            )}
            <button type="button" role="menuitem" className="danger" onClick={doDelete}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Renders whichever follow-up modal is active. */
export function FollowUpModals({
  modal,
  leads,
  onClose,
  onNotify,
  onUpdateLead,
  currentUserName,
}: {
  modal: RowModal | { type: 'add'; leadId?: string } | null;
  leads: Lead[];
  onClose: () => void;
  onNotify?: Notify;
  onUpdateLead?: (lead: Lead) => void;
  currentUserName?: string;
}) {
  if (!modal) return null;
  const leadOf = (id: string) => leads.find(l => l.id === id);
  switch (modal.type) {
    case 'review':
      return <ReviewSendModal task={modal.task} lead={leadOf(modal.task.leadId)} onClose={onClose} onNotify={onNotify} />;
    case 'outcome':
      return <LogOutcomeModal task={modal.task} lead={leadOf(modal.task.leadId)} onClose={onClose} onNotify={onNotify} onUpdateLead={onUpdateLead} />;
    case 'edit':
      return <AddFollowUpModal leads={leads} editing={modal.task} onClose={onClose} onNotify={onNotify} currentUserName={currentUserName} />;
    case 'hold':
      return <HoldModal lead={modal.lead} onClose={onClose} onNotify={onNotify} />;
    case 'add':
      return <AddFollowUpModal leads={leads} initialLeadId={modal.leadId} onClose={onClose} onNotify={onNotify} currentUserName={currentUserName} />;
    default:
      return null;
  }
}
