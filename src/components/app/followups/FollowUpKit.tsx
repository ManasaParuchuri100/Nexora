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
  Video,
  Copy,
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
  MeetingPlatform,
  scheduleCall,
  rescheduleCall,
  cancelCall,
} from '../../../data/followUps';
import { PlatformLogo, PLATFORM_LABELS, PLATFORM_COLORS } from '../../ui';

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

/* --------------------------------------------------------------------------
   Date & time — always blank, never preset
   -------------------------------------------------------------------------- */

const todayISO = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Combines the date and time boxes; returns null until both are filled. */
function combineDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}`);
  return isNaN(d.getTime()) ? null : d;
}

function DateTimeFields({
  date,
  time,
  onDate,
  onTime,
  label = 'Date & time',
}: {
  date: string;
  time: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
  label?: string;
}) {
  const when = combineDateTime(date, time);
  return (
    <Field
      label={label}
      hint={
        when ? (
          isOutsideBusinessHours(when) ? (
            <span className="text-warn">Outside business hours (Mon–Sat, 9 AM–7 PM)</span>
          ) : (
            shortDate(when)
          )
        ) : undefined
      }
    >
      <div className="grid grid-cols-2 gap-[10px]">
        <input type="date" value={date} min={todayISO()} onChange={e => onDate(e.target.value)} aria-label="Date" />
        <input type="time" value={time} onChange={e => onTime(e.target.value)} aria-label="Time" />
      </div>
    </Field>
  );
}

function PlatformPicker({ value, onChange }: { value: MeetingPlatform | null; onChange: (p: MeetingPlatform) => void }) {
  return (
    <div className="grid grid-cols-3 gap-[9px]" role="radiogroup" aria-label="Call platform">
      {(['zoom', 'meet', 'teams'] as MeetingPlatform[]).map(p => (
        <button
          key={p}
          type="button"
          role="radio"
          aria-checked={value === p}
          onClick={() => onChange(p)}
          className={`nx-platform ${value === p ? 'active' : ''}`}
        >
          <span style={{ color: PLATFORM_COLORS[p] }}>
            <PlatformLogo platform={p} className="w-[22px] h-[22px]" />
          </span>
          <span>{PLATFORM_LABELS[p]}</span>
        </button>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Schedule a call (Zoom / Google Meet / Microsoft Teams)
   -------------------------------------------------------------------------- */

export function ScheduleCallModal({
  leads,
  leadId: fixedLeadId,
  editing,
  previousId,
  currentUserName = 'You',
  onClose,
  onNotify,
}: {
  leads: Lead[];
  leadId?: string;
  editing?: FollowUp;
  previousId?: string;
  currentUserName?: string;
  onClose: () => void;
  onNotify?: Notify;
}) {
  const [leadId, setLeadId] = useState(editing?.leadId || fixedLeadId || '');
  const lead = leads.find(l => l.id === leadId);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [platform, setPlatform] = useState<MeetingPlatform | null>(editing?.meeting?.platform ?? null);
  const [touched, setTouched] = useState(false);
  const when = combineDateTime(date, time);
  const host = editing?.owner || lead?.assignee?.name || currentUserName;

  const errors: string[] = [];
  if (!leadId) errors.push('Choose who the call is with.');
  if (!date) errors.push('Pick a date.');
  else if (!time) errors.push('Pick a time.');
  else if (when && when.getTime() < Date.now()) errors.push('That time has already passed.');
  if (!platform) errors.push('Choose Zoom, Google Meet or Microsoft Teams.');

  const save = () => {
    setTouched(true);
    if (errors.length || !when || !platform) return;
    if (editing) {
      rescheduleCall(editing.id, when, platform, firstName(lead));
      onNotify?.('Call rescheduled', `${PLATFORM_LABELS[platform]} · ${shortDate(when)}. ${lead?.name || 'The lead'} will get an updated reminder.`);
    } else {
      const { reminder } = scheduleCall({
        leadId,
        at: when,
        platform,
        host,
        leadName: lead?.name,
        leadFirstName: firstName(lead),
        previousId,
      });
      onNotify?.(
        'Call scheduled',
        `${PLATFORM_LABELS[platform]} with ${lead?.name || 'the lead'} · ${shortDate(when)}. Visible to the whole team${reminder ? '; a reminder is sent automatically' : ''}.`
      );
    }
    onClose();
  };

  return (
    <NxModal
      title={editing ? 'Reschedule call' : 'Schedule a call'}
      subtitle={lead ? <>With <b className="text-ink">{lead.name}</b>{lead.company ? ` · ${lead.company}` : ''} · Host: {host}</> : 'Pick the lead, time and platform.'}
      onClose={onClose}
      width={480}
      footer={
        <>
          {touched && errors.length > 0 && <span className="text-[11px] text-danger mr-auto">{errors[0]}</span>}
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={save}>{editing ? 'Save new time' : 'Schedule call'}</button>
        </>
      }
    >
      {!fixedLeadId && !editing && (
        <Field label="Lead">
          <select value={leadId} onChange={e => setLeadId(e.target.value)} autoFocus>
            <option value="">Select a lead…</option>
            {[...leads].sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name)).map(l => (
              <option key={l.id} value={l.id}>{l.company || l.name}{l.company && l.name ? ` — ${l.name}` : ''}</option>
            ))}
          </select>
        </Field>
      )}
      {editing && (
        <div className="nx-callout mb-4">
          <Clock className="w-4 h-4 shrink-0 mt-px" />
          <span>Currently {shortDate(new Date(editing.dueAt))} on {editing.meeting ? PLATFORM_LABELS[editing.meeting.platform] : 'a call'}.</span>
        </div>
      )}
      <DateTimeFields date={date} time={time} onDate={setDate} onTime={setTime} />
      <Field label="Platform">
        <PlatformPicker value={platform} onChange={setPlatform} />
      </Field>
    </NxModal>
  );
}

/* --------------------------------------------------------------------------
   Log outcome / complete
   -------------------------------------------------------------------------- */

const OUTCOMES_BY_KIND: Record<FollowUpKind, FollowUpOutcome[]> = {
  call: ['call_connected', 'no_show', 'not_interested'],
  message: ['replied', 'no_response', 'meeting_booked', 'not_interested'],
  email: ['replied', 'no_response', 'meeting_booked', 'not_interested'],
  task: ['done', 'cancelled'],
};

const OUTCOME_HELP: Partial<Record<FollowUpOutcome, string>> = {
  call_connected: 'The call took place.',
  no_show: 'The customer didn’t join.',
  no_response: 'No reply yet.',
  replied: 'The customer responded — qualification continues.',
  meeting_booked: 'The customer agreed to a call.',
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
  currentUserName = 'You',
}: {
  task: FollowUp;
  lead?: Lead;
  onClose: () => void;
  onNotify?: Notify;
  onUpdateLead?: (lead: Lead) => void;
  currentUserName?: string;
}) {
  const options = OUTCOMES_BY_KIND[task.kind];
  const [outcome, setOutcome] = useState<FollowUpOutcome | null>(null);
  const [note, setNote] = useState('');
  const temperature = leadTemperature(lead);
  const plan = outcome ? planNextStep(task, outcome, temperature) : null;
  const [scheduleNext, setScheduleNext] = useState(true);
  const [changeDate, setChangeDate] = useState(false);
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('');
  const [markLost, setMarkLost] = useState(true);
  // inline call booking for "meeting booked" / "call held → book another"
  const [callDate, setCallDate] = useState('');
  const [callTime, setCallTime] = useState('');
  const [platform, setPlatform] = useState<MeetingPlatform | null>(null);
  const [bookAnother, setBookAnother] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setScheduleNext(true);
    setChangeDate(false);
    setTouched(false);
  }, [outcome]);

  const callWhen = combineDateTime(callDate, callTime);
  const needsCall = outcome === 'meeting_booked' || (outcome === 'call_connected' && bookAnother);
  const customNext = changeDate ? combineDateTime(nextDate, nextTime) : null;

  const errors: string[] = [];
  if (!outcome) errors.push('Choose what happened.');
  if (needsCall) {
    if (!callDate || !callTime) errors.push('Pick the call date and time.');
    else if (callWhen && callWhen.getTime() < Date.now()) errors.push('The call time has already passed.');
    if (!platform) errors.push('Choose Zoom, Google Meet or Microsoft Teams.');
  }
  if (changeDate && scheduleNext && plan && plan.kind !== 'none') {
    if (!customNext) errors.push('Pick the new date and time, or keep the suggested one.');
    else if (customNext.getTime() < Date.now()) errors.push('That time has already passed.');
  }

  const submit = () => {
    setTouched(true);
    if (errors.length || !outcome) return;
    const res = completeFollowUp(task.id, {
      outcome,
      note,
      temperature,
      scheduleNext: plan?.kind !== 'none' && scheduleNext,
      nextDueAt: customNext ? customNext.toISOString() : undefined,
      leadFirstName: firstName(lead),
    });
    let callText = '';
    if (needsCall && callWhen && platform) {
      scheduleCall({
        leadId: task.leadId,
        at: callWhen,
        platform,
        host: lead?.assignee?.name || currentUserName,
        leadName: lead?.name,
        leadFirstName: firstName(lead),
        previousId: task.id,
      });
      callText = `${PLATFORM_LABELS[platform]} call scheduled for ${shortDate(callWhen)}.`;
    }
    if (outcome === 'not_interested' && markLost && lead && onUpdateLead) {
      onUpdateLead({ ...lead, stage: 'Lost', status: 'Lost', lostReason: note.trim() || 'Not interested' });
    }
    onNotify?.(
      OUTCOME_LABELS[outcome],
      callText ||
        (res.next
          ? `Next: ${res.next.purpose === 'nurture' ? 'nurture check-in' : res.next.purpose === 'no_show' ? 'rebooking message (needs approval)' : res.next.attempt && res.next.attempt > 1 ? `attempt ${res.next.attempt} of ${res.next.maxAttempts ?? MAX_ATTEMPTS}` : res.next.title} · ${shortDate(new Date(res.next.dueAt))}.`
          : outcome === 'not_interested' && markLost
          ? `${lead?.name || 'Lead'} marked as lost. No further follow-ups.`
          : 'Done. Nothing else is scheduled from this follow-up.')
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
          {touched && errors.length > 0 && <span className="text-[11px] text-danger mr-auto">{errors[0]}</span>}
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={submit}>Save</button>
        </>
      }
    >
      <Field label="What happened?">
        <div className="grid gap-[7px]">
          {options.map(o => (
            <label key={o} className={`nx-option ${outcome === o ? 'active' : ''}`}>
              <input type="radio" name="outcome" checked={outcome === o} onChange={() => setOutcome(o)} />
              <span className="flex-1">
                <b>{o === 'call_connected' ? 'Call held' : OUTCOME_LABELS[o]}</b>
                <span>{OUTCOME_HELP[o]}</span>
              </span>
            </label>
          ))}
        </div>
      </Field>

      {outcome && (
        <>
          {needsCall || outcome === 'call_connected' ? (
            <div className="nx-next mb-4">
              {outcome === 'call_connected' && (
                <label className="flex items-center gap-2.5 text-[12px] text-ink cursor-pointer">
                  <input type="checkbox" checked={bookAnother} onChange={e => setBookAnother(e.target.checked)} />
                  Book a follow-up call
                </label>
              )}
              {needsCall && (
                <div className={outcome === 'call_connected' ? 'mt-3' : ''}>
                  {outcome === 'meeting_booked' && <div className="text-[11px] font-bold text-ink-2 mb-2">Schedule the call</div>}
                  <DateTimeFields date={callDate} time={callTime} onDate={setCallDate} onTime={setCallTime} label="When" />
                  <Field label="Platform">
                    <PlatformPicker value={platform} onChange={setPlatform} />
                  </Field>
                  <div className="text-[11px] text-ink-3 -mt-2">A reminder with the join link is sent automatically.</div>
                </div>
              )}
            </div>
          ) : (
            <div className="nx-next mb-4">
              <div className="text-[11px] font-bold text-ink-2 mb-2">What happens next</div>
              {outcome === 'not_interested' ? (
                <label className="flex items-center gap-2.5 text-[12px] text-ink cursor-pointer">
                  <input type="checkbox" checked={markLost} onChange={e => setMarkLost(e.target.checked)} />
                  Mark {lead?.name || 'this lead'} as Lost and stop follow-ups
                </label>
              ) : plan && plan.kind === 'none' ? (
                <div className="text-[12px] text-ink-2">{plan.label}.</div>
              ) : plan ? (
                <>
                  <label className="flex items-center gap-2.5 text-[12px] text-ink cursor-pointer">
                    <input type="checkbox" checked={scheduleNext} onChange={e => setScheduleNext(e.target.checked)} />
                    {plan.label}
                  </label>
                  {scheduleNext && plan.kind !== 'no_show' && (
                    changeDate ? (
                      <div className="mt-3">
                        <DateTimeFields date={nextDate} time={nextTime} onDate={setNextDate} onTime={setNextTime} label="New date & time" />
                      </div>
                    ) : (
                      <button type="button" className="nx-link text-[11px] mt-2 ml-[25px]" onClick={() => setChangeDate(true)}>
                        Choose a different time
                      </button>
                    )
                  )}
                </>
              ) : null}
            </div>
          )}

          <Field label="Note (optional)">
            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Key points, objections, what the customer asked for…" />
          </Field>
        </>
      )}
    </NxModal>
  );
}

/* --------------------------------------------------------------------------
   Add / edit follow-up
   -------------------------------------------------------------------------- */

const toDateInput = (d: Date) => toLocalInput(d).slice(0, 10);
const toTimeInput = (d: Date) => toLocalInput(d).slice(11, 16);

export function AddFollowUpModal({
  leads,
  initialLeadId,
  editing,
  currentUserName = 'You',
  onClose,
  onNotify,
  onScheduleCall,
}: {
  leads: Lead[];
  initialLeadId?: string;
  editing?: FollowUp;
  currentUserName?: string;
  onClose: () => void;
  onNotify?: Notify;
  onScheduleCall?: (leadId?: string) => void;
}) {
  const sortedLeads = useMemo(() => [...leads].sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name)), [leads]);
  const [leadId, setLeadId] = useState(editing?.leadId || initialLeadId || '');
  const lead = leads.find(l => l.id === leadId);
  const [purpose, setPurpose] = useState<FollowUpPurpose>(editing?.purpose || 'follow_up');
  const [kind, setKind] = useState<FollowUpKind>(editing?.kind || 'message');
  const [title, setTitle] = useState(editing?.title || '');
  const [channel, setChannel] = useState(editing?.channel || '');
  const [owner, setOwner] = useState(editing?.owner || 'AI');
  const [date, setDate] = useState(editing ? toDateInput(new Date(editing.dueAt)) : '');
  const [time, setTime] = useState(editing ? toTimeInput(new Date(editing.dueAt)) : '');
  const [draft, setDraft] = useState(editing?.draft || '');
  const [note, setNote] = useState(editing?.note || '');
  const [autoSend, setAutoSend] = useState(editing?.approval === 'approved');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!lead || editing) return;
    setChannel(lead.preferredChannel || (lead.source === 'Instagram' || lead.source === 'WhatsApp' ? lead.source : 'WhatsApp'));
  }, [leadId]); // eslint-disable-line react-hooks/exhaustive-deps

  const due = combineDateTime(date, time);
  const isMessage = kind === 'message' || kind === 'email';
  const existing = leadId && !editing ? getNextFollowUp(leadId) : undefined;
  const owners = Array.from(new Set(['AI', currentUserName, lead?.assignee?.name].filter(Boolean) as string[]));

  const errors: string[] = [];
  if (!leadId) errors.push('Choose a lead.');
  if (!title.trim()) errors.push('Add a short title.');
  if (!date) errors.push('Pick a date.');
  else if (!time) errors.push('Pick a time.');
  else if (due && due.getTime() < Date.now() - 60 * 1000) errors.push('That time has already passed.');
  if (isMessage && owner === 'AI' && !draft.trim()) errors.push('Messages sent by the AI need a draft.');
  if (kind === 'task' && owner === 'AI') errors.push('Tasks need a person as owner.');

  const save = () => {
    setTouched(true);
    if (errors.length || !due) return;
    const payload = {
      leadId,
      title: title.trim(),
      kind,
      channel: kind === 'task' ? undefined : channel || undefined,
      owner,
      purpose,
      dueAt: due.toISOString(),
      draft: isMessage ? draft.trim() || undefined : undefined,
      note: note.trim() || undefined,
      approval: owner === 'AI' && isMessage ? (autoSend ? ('approved' as const) : ('draft' as const)) : undefined,
    };
    if (editing) {
      updateFollowUp(editing.id, payload);
      onNotify?.('Follow-up updated', `${title.trim()} · ${shortDate(due)}.`);
    } else {
      addFollowUp({
        ...payload,
        source: 'manual',
        attempt: purpose === 'follow_up' ? 1 : undefined,
        maxAttempts: purpose === 'follow_up' ? MAX_ATTEMPTS : undefined,
      });
      onNotify?.(
        'Follow-up scheduled',
        `${lead?.name || 'Lead'} · ${shortDate(alignToBusinessHours(due))}${owner === 'AI' && isMessage ? (autoSend ? ' · the AI will send it automatically' : ' · waiting for your approval') : ''}.`
      );
    }
    onClose();
  };

  return (
    <NxModal
      title={editing ? 'Edit follow-up' : 'New follow-up'}
      onClose={onClose}
      width={580}
      footer={
        <>
          {touched && errors.length > 0 && <span className="text-[11px] text-danger mr-auto">{errors[0]}</span>}
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={save}>{editing ? 'Save changes' : 'Schedule follow-up'}</button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-x-[16px]">
        <Field label="Lead">
          <select value={leadId} onChange={e => setLeadId(e.target.value)} disabled={!!editing}>
            <option value="">Select a lead…</option>
            {sortedLeads.map(l => (
              <option key={l.id} value={l.id}>{l.company || l.name}{l.company && l.name ? ` — ${l.name}` : ''}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select value={purpose} onChange={e => setPurpose(e.target.value as FollowUpPurpose)}>
            {(['follow_up', 'nurture', 'no_show', 'reactivation'] as FollowUpPurpose[]).map(p => (
              <option key={p} value={p}>{PURPOSE_LABELS[p]}</option>
            ))}
          </select>
        </Field>
      </div>

      {existing && (
        <div className="nx-callout mb-4">
          <Clock className="w-4 h-4 shrink-0 mt-px" />
          <span>Already scheduled: <b>{existing.title}</b> ({formatDue(existing)}).</span>
        </div>
      )}

      <Field label="Title">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Send pricing comparison" />
      </Field>

      <Field label="Action">
        <div className="flex flex-wrap gap-[7px] items-center">
          {(['message', 'email', 'task'] as FollowUpKind[]).map(k => (
            <button
              key={k}
              type="button"
              className={`nx-chip ${kind === k ? 'active' : ''}`}
              aria-pressed={kind === k}
              onClick={() => {
                setKind(k);
                if (k === 'task' && owner === 'AI') setOwner(lead?.assignee?.name || currentUserName);
              }}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
          {!editing && onScheduleCall && (
            <button type="button" className="nx-chip inline-flex items-center gap-1.5" onClick={() => onScheduleCall(leadId || undefined)}>
              <Video className="w-3.5 h-3.5" /> Video call…
            </button>
          )}
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-x-[16px]">
        {kind !== 'task' && (
          <Field label="Channel">
            <select value={channel} onChange={e => setChannel(e.target.value)}>
              {['WhatsApp', 'Instagram', 'Email', 'LinkedIn', 'Website'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        )}
        <Field label="Owner">
          <select value={owner} onChange={e => setOwner(e.target.value)}>
            {owners.map(o => (
              <option key={o} value={o} disabled={o === 'AI' && kind === 'task'}>
                {o === 'AI' ? 'Engagement Agent (AI)' : o}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <DateTimeFields date={date} time={time} onDate={setDate} onTime={setTime} label="Due" />

      {isMessage && (
        <Field
          label="Message"
          hint={
            <div className="flex justify-end">
              <button type="button" className="nx-link text-[11px] inline-flex items-center gap-1" onClick={() => setDraft(aiDraftFor(lead, purpose, title || 'our last conversation'))} disabled={!lead}>
                <Sparkles className="w-3.5 h-3.5" /> Draft with AI
              </button>
            </div>
          }
        >
          <textarea rows={3} value={draft} onChange={e => setDraft(e.target.value)} placeholder="What should we send?" />
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
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const until = date ? new Date(`${date}T10:00`) : null;
  const openCount = getFollowUpsForLead(lead.id).filter(t => !t.completedAt).length;
  const error = !date ? 'Pick a date.' : until && until.getTime() < Date.now() ? 'Pick a future date.' : '';

  const save = () => {
    setTouched(true);
    if (error || !until) return;
    holdLeadUntil(lead.id, until, reason.trim() || 'Customer asked to be contacted later', lead.preferredChannel, firstName(lead));
    onNotify?.('Lead moved to nurture', `${lead.name} won't be contacted before ${until.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`);
    onClose();
  };

  return (
    <NxModal
      title="Don't contact until…"
      subtitle={<>Pause follow-ups for <b className="text-ink">{lead.name}</b> until the date they asked.</>}
      onClose={onClose}
      width={460}
      footer={
        <>
          {touched && error && <span className="text-[11px] text-danger mr-auto">{error}</span>}
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={save}>Pause follow-ups</button>
        </>
      }
    >
      <Field label="Check back on" hint={openCount ? `${openCount} open follow-up${openCount === 1 ? '' : 's'} will be closed and replaced by one check-in.` : 'One check-in will be scheduled for that day.'}>
        <input type="date" value={date} min={todayISO()} onChange={e => setDate(e.target.value)} aria-label="Check back date" />
      </Field>
      <Field label="Reason (optional)">
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
  | { type: 'hold'; lead: Lead }
  | { type: 'call'; leadId?: string; editing?: FollowUp };

export type AnyFollowUpModal = RowModal | { type: 'add'; leadId?: string } | null;

function copyText(text: string, onNotify?: Notify) {
  const done = () => onNotify?.('Link copied', text);
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
      return;
    }
  } catch {
    // clipboard unavailable
  }
  done();
}

export function CallChip({ task, onNotify }: { task: FollowUp; onNotify?: Notify }) {
  if (!task.meeting) return null;
  const p = task.meeting.platform;
  return (
    <span className="nx-callchip">
      <span style={{ color: PLATFORM_COLORS[p] }}><PlatformLogo platform={p} className="w-3.5 h-3.5" /></span>
      {PLATFORM_LABELS[p]} · {task.meeting.durationMins} min
      {!task.completedAt && (
        <button type="button" onClick={() => copyText(task.meeting!.link, onNotify)} aria-label="Copy join link" title={task.meeting.link}>
          <Copy className="w-3 h-3" /> Copy link
        </button>
      )}
    </span>
  );
}

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
  const isCall = task.purpose === 'meeting' && !!task.meeting;
  const Icon = isCall ? Video : KIND_ICON[task.kind];
  const tone = bucket === 'overdue' ? 'red' : bucket === 'today' ? 'amber' : bucket === 'done' ? 'green' : bucket === 'nurture' ? '' : 'muted';
  const paused = isPausedByHandoff(task, lead?.handlingMode);
  const awaiting = needsApproval(task);
  const replied = !!task.customerRepliedAt && !task.completedAt;
  const isMessage = task.kind === 'message' || task.kind === 'email';
  const temperature = leadTemperature(lead);
  const startsSoon = isCall && !task.completedAt && new Date(task.dueAt).getTime() - now.getTime() < 15 * 60 * 1000;

  const primary = (() => {
    if (task.completedAt) return null;
    if (isCall) {
      if (bucket === 'overdue' || startsSoon) return { label: 'Log call', primary: true, run: () => onOpenModal({ type: 'outcome', task }) };
      return { label: 'Reschedule', primary: false, run: () => onOpenModal({ type: 'call', editing: task }) };
    }
    if (replied) return { label: 'Open conversation', primary: true, run: () => lead && (onOpenConversation ?? onOpenLead)?.(lead) };
    if (paused) return { label: 'Open lead', primary: false, run: () => lead && onOpenLead?.(lead) };
    if (isMessage && awaiting) return { label: 'Review & approve', primary: bucket !== 'upcoming' && bucket !== 'nurture', run: () => onOpenModal({ type: 'review', task }) };
    if (isMessage && task.owner === 'AI' && (bucket === 'upcoming' || bucket === 'nurture'))
      return { label: 'Edit draft', primary: false, run: () => onOpenModal({ type: 'review', task }) };
    if (isMessage) return { label: 'Review & send', primary: bucket === 'overdue' || bucket === 'today', run: () => onOpenModal({ type: 'review', task }) };
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
    isCall ? `Host: ${task.owner}` : task.channel || (task.kind === 'task' ? 'Internal task' : null),
    isCall ? null : task.owner === 'AI' ? 'Engagement Agent' : task.owner,
  ].filter(Boolean);

  return (
    <div className={`nx-furow ${compact ? 'compact' : ''} ${task.completedAt ? 'is-done' : ''}`}>
      <div className={`nx-alerticon ${tone}`}>
        <Icon className="w-4 h-4" strokeWidth={1.9} />
      </div>

      <div className="flex-1 min-w-0">
        <strong className="text-[13px] text-ink">
          {task.title}
          {!compact && lead && !(isCall && task.title.includes(lead.name)) && (
            <>
              {' '}
              <span className="text-ink-3 font-normal">·</span>{' '}
              <button type="button" className="nx-inline-link" onClick={() => onOpenLead?.(lead)}>
                {lead.company || lead.name}
              </button>
            </>
          )}
          {!compact && lead && isCall && task.title.includes(lead.name) && (
            <>
              {' '}
              <span className="text-ink-3 font-normal">·</span>{' '}
              <button type="button" className="nx-inline-link" onClick={() => onOpenLead?.(lead)}>
                {lead.company}
              </button>
            </>
          )}
        </strong>
        <p className="text-[11px] text-ink-3 mt-[3px] mb-0 truncate">
          <span className={bucket === 'overdue' ? 'text-danger font-bold' : bucket === 'today' ? 'text-warn font-bold' : ''}>{meta[0]}</span>
          {meta.slice(1).map((m, i) => (
            <span key={i}> · {m}</span>
          ))}
        </p>

        <div className="flex items-center gap-[6px] flex-wrap mt-2">
          {isCall && <CallChip task={task} onNotify={onNotify} />}
          {!compact && lead && (
            <span className={`nx-tag ${temperature === 'HOT' ? 'red' : temperature === 'WARM' ? 'amber' : ''}`}>
              {temperature.charAt(0) + temperature.slice(1).toLowerCase()} · {lead.score}
            </span>
          )}
          {task.purpose && task.purpose !== 'follow_up' && task.purpose !== 'meeting' && <span className="nx-tag teal">{PURPOSE_LABELS[task.purpose]}</span>}
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
            <span className={`nx-tag ${task.outcome === 'replied' || task.outcome === 'meeting_booked' || task.outcome === 'call_connected' ? 'green' : task.outcome === 'not_interested' || task.outcome === 'no_show' ? 'red' : ''}`}>
              {task.outcome === 'call_connected' ? 'Call held' : OUTCOME_LABELS[task.outcome]}
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
        ) : !isCall ? (
          <button type="button" className="nx-btn sm" onClick={() => setMenu(menu === 'snooze' ? null : 'snooze')} aria-haspopup="menu" aria-expanded={menu === 'snooze'}>
            <Clock className="w-3.5 h-3.5" /> Snooze
          </button>
        ) : null}
        <button type="button" className="nx-iconbtn sm" aria-label="More actions" aria-haspopup="menu" aria-expanded={menu === 'more'} onClick={() => setMenu(menu === 'more' ? null : 'more')}>
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menu === 'snooze' && (
          <div className="nx-menu" role="menu">
            {([
              ['later', 'In 3 hours'],
              ['tomorrow', 'Tomorrow morning'],
              ['in_3_days', 'In 3 days'],
              ['next_week', 'Next week'],
            ] as const).map(([id, label]) => (
              <button key={id} type="button" role="menuitem" onClick={() => doSnooze(id)}>
                <span>{label}</span>
                <span className="text-ink-3">{snoozeTarget(id).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
              </button>
            ))}
            <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenModal({ type: 'edit', task }); }}>
              <span>Choose date & time…</span>
            </button>
          </div>
        )}

        {menu === 'more' && (
          <div className="nx-menu" role="menu">
            {!task.completedAt && isCall && (
              <>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenModal({ type: 'outcome', task }); }}>Log call…</button>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenModal({ type: 'call', editing: task }); }}>Reschedule…</button>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); copyText(task.meeting!.link, onNotify); }}>Copy join link</button>
                <button
                  type="button"
                  role="menuitem"
                  className="danger"
                  onClick={() => {
                    setMenu(null);
                    const affected = getFollowUpsForLead(task.leadId).filter(
                      t => !t.completedAt && (t.id === task.id || (t.previousId === task.id && t.purpose === 'appointment_reminder'))
                    );
                    cancelCall(task.id);
                    onNotify?.('Call cancelled', `${task.title} and its reminder were cancelled.`, {
                      label: 'Undo',
                      onClick: () => affected.forEach(t => reopenFollowUp(t.id)),
                    });
                  }}
                >
                  Cancel call
                </button>
              </>
            )}
            {!task.completedAt && !isCall && (
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
                ) : task.kind !== 'task' ? (
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
              </>
            )}
            {!task.completedAt && lead && (
              <>
                {!isCall && (
                  <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenModal({ type: 'call', leadId: lead.id }); }}>
                    Schedule a call…
                  </button>
                )}
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenModal({ type: 'hold', lead }); }}>
                  Don't contact until…
                </button>
              </>
            )}
            {!compact && lead && (
              <button type="button" role="menuitem" onClick={() => { setMenu(null); onOpenLead?.(lead); }}>Open lead</button>
            )}
            {!isCall || task.completedAt ? (
              <button type="button" role="menuitem" className="danger" onClick={doDelete}>Delete</button>
            ) : null}
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
  setModal,
}: {
  modal: AnyFollowUpModal;
  leads: Lead[];
  onClose: () => void;
  onNotify?: Notify;
  onUpdateLead?: (lead: Lead) => void;
  currentUserName?: string;
  setModal?: (m: AnyFollowUpModal) => void;
}) {
  if (!modal) return null;
  const leadOf = (id: string) => leads.find(l => l.id === id);
  switch (modal.type) {
    case 'review':
      return <ReviewSendModal task={modal.task} lead={leadOf(modal.task.leadId)} onClose={onClose} onNotify={onNotify} />;
    case 'outcome':
      return <LogOutcomeModal task={modal.task} lead={leadOf(modal.task.leadId)} onClose={onClose} onNotify={onNotify} onUpdateLead={onUpdateLead} currentUserName={currentUserName} />;
    case 'edit':
      return modal.task.purpose === 'meeting'
        ? <ScheduleCallModal leads={leads} editing={modal.task} onClose={onClose} onNotify={onNotify} currentUserName={currentUserName} />
        : <AddFollowUpModal leads={leads} editing={modal.task} onClose={onClose} onNotify={onNotify} currentUserName={currentUserName} />;
    case 'hold':
      return <HoldModal lead={modal.lead} onClose={onClose} onNotify={onNotify} />;
    case 'call':
      return <ScheduleCallModal leads={leads} leadId={modal.leadId} editing={modal.editing} onClose={onClose} onNotify={onNotify} currentUserName={currentUserName} />;
    case 'add':
      return (
        <AddFollowUpModal
          leads={leads}
          initialLeadId={modal.leadId}
          onClose={onClose}
          onNotify={onNotify}
          currentUserName={currentUserName}
          onScheduleCall={setModal ? leadId => setModal({ type: 'call', leadId }) : undefined}
        />
      );
    default:
      return null;
  }
}
