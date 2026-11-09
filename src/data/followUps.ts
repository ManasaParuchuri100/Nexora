import { useSyncExternalStore, useState, useEffect } from 'react';

/* ==========================================================================
   FOLLOW-UP ENGINE
   --------------------------------------------------------------------------
   Single source of truth for every follow-up in the workspace (Follow-ups
   page, lead drawer, leads table, sidebar badge, overview).

   Rules (from the Tecavy product brief):
   - Follow-ups live in a scheduled "table" with a due time — never a sleep().
   - The AI only sends *approved* follow-ups. AI drafts need human approval;
     once approved, the engine sends them when they fall due.
   - Every completion records an outcome. "Sent" or "No response" schedules
     the next attempt on a temperature-based cadence (Hot 1d, Warm 3d,
     Cold 7d) up to MAX_ATTEMPTS, then the lead moves to nurture instead of
     being chased every few days.
   - A customer reply ends the sequence — qualification continues.
   - "Don't contact until…" parks a lead in nurture until the date it asked.
   - Follow-ups are always scheduled inside business hours.
   - AI-owned follow-ups pause while a human has taken over the lead.
   Status (bucket) is always computed from data, never stored.
   ========================================================================== */

export type FollowUpKind = 'call' | 'email' | 'message' | 'task';
export type FollowUpSource = 'manual' | 'auto' | 'ai';
export type FollowUpPurpose = 'follow_up' | 'meeting' | 'nurture' | 'appointment_reminder' | 'no_show' | 'reactivation';
export type MeetingPlatform = 'zoom' | 'meet' | 'teams';

export interface MeetingInfo {
  platform: MeetingPlatform;
  link: string;
  durationMins: number;
}
export type FollowUpApproval = 'draft' | 'approved';
export type FollowUpOutcome =
  | 'sent'
  | 'replied'
  | 'no_response'
  | 'call_connected'
  | 'meeting_booked'
  | 'no_show'
  | 'not_interested'
  | 'done'
  | 'cancelled';
export type FollowUpBucket = 'done' | 'overdue' | 'today' | 'upcoming' | 'nurture';
export type Temperature = 'HOT' | 'WARM' | 'COLD';

export interface FollowUp {
  id: string;
  leadId: string;
  title: string;
  kind: FollowUpKind;
  channel?: string;
  owner: string; // 'AI' or a person's name
  dueAt: string; // ISO
  draft?: string;
  note?: string;
  createdAt: string; // ISO
  completedAt?: string; // ISO
  source: FollowUpSource;
  purpose?: FollowUpPurpose;
  /** Only meaningful for AI-owned messages/emails. */
  approval?: FollowUpApproval;
  attempt?: number;
  maxAttempts?: number;
  outcome?: FollowUpOutcome;
  outcomeNote?: string;
  snoozeCount?: number;
  /** Set when the customer replied after this follow-up was scheduled. */
  customerRepliedAt?: string;
  /** Id of the follow-up this one was created from (sequence chain). */
  previousId?: string;
  /** Present on scheduled video calls. */
  meeting?: MeetingInfo;
}

export interface FollowUpCounts {
  overdue: number;
  today: number;
  upcoming: number;
  nurture: number;
  done: number;
  open: number;
  awaitingApproval: number;
  oldestOverdueDays: number;
}

export const MAX_ATTEMPTS = 3;
export const CADENCE_DAYS: Record<Temperature, number> = { HOT: 1, WARM: 3, COLD: 7 };
export const NURTURE_DAYS = 30;
export const BUSINESS_START_HOUR = 9;
export const BUSINESS_END_HOUR = 19;

export const OUTCOME_LABELS: Record<FollowUpOutcome, string> = {
  sent: 'Message sent',
  replied: 'Customer replied',
  no_response: 'No response',
  call_connected: 'Call connected',
  meeting_booked: 'Meeting booked',
  no_show: 'No-show',
  not_interested: 'Not interested',
  done: 'Completed',
  cancelled: 'Cancelled',
};

export const PURPOSE_LABELS: Record<FollowUpPurpose, string> = {
  follow_up: 'Follow-up',
  meeting: 'Scheduled call',
  nurture: 'Nurture',
  appointment_reminder: 'Appointment reminder',
  no_show: 'No-show recovery',
  reactivation: 'Reactivation',
};

const STORAGE_KEY = 'nexora_followups_v4';
const LEGACY_KEYS = ['nexora_followups_v3', 'nexora_followups_v2', 'nexora_follow_ups'];

/* --------------------------------------------------------------------------
   Time helpers
   -------------------------------------------------------------------------- */

const DAY = 24 * 60 * 60 * 1000;

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Moves a date into business hours (Mon–Sat, 9:00–19:00). */
export function alignToBusinessHours(input: Date): Date {
  const d = new Date(input);
  if (d.getHours() >= BUSINESS_END_HOUR) {
    d.setDate(d.getDate() + 1);
    d.setHours(BUSINESS_START_HOUR, 0, 0, 0);
  } else if (d.getHours() < BUSINESS_START_HOUR) {
    d.setHours(BUSINESS_START_HOUR, 0, 0, 0);
  }
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
    d.setHours(BUSINESS_START_HOUR, 0, 0, 0);
  }
  return d;
}

export function isOutsideBusinessHours(d: Date): boolean {
  return d.getDay() === 0 || d.getHours() < BUSINESS_START_HOUR || d.getHours() >= BUSINESS_END_HOUR;
}

/** Date `days` from `from` at 10:00, aligned to business hours. */
export function daysFromNowAt(days: number, hour = 10, from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return alignToBusinessHours(d);
}

export function nextAttemptDate(temperature: Temperature = 'WARM', from = new Date()): Date {
  return daysFromNowAt(CADENCE_DAYS[temperature] ?? 3, 10, from);
}

/** Human-friendly due label, e.g. "2 days overdue", "Today · 2:00 PM", "Tomorrow · 10:00 AM". */
export function formatDue(task: FollowUp, now = new Date()): string {
  const due = new Date(task.dueAt);
  const time = due.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (task.completedAt) {
    const done = new Date(task.completedAt);
    return sameDay(done, now)
      ? `Completed today · ${done.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
      : `Completed ${done.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  const diff = due.getTime() - now.getTime();
  if (diff < 0) {
    const mins = Math.round(-diff / 60000);
    if (mins < 60) return `${mins} min overdue`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} overdue`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} overdue`;
  }
  if (sameDay(due, now)) return `Today · ${time}`;
  const tomorrow = new Date(now.getTime() + DAY);
  if (sameDay(due, tomorrow)) return `Tomorrow · ${time}`;
  const days = Math.ceil(diff / DAY);
  if (days < 7) return `${due.toLocaleDateString('en-US', { weekday: 'long' })} · ${time}`;
  return `${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${time}`;
}

/* --------------------------------------------------------------------------
   Status
   -------------------------------------------------------------------------- */

/** Lifecycle bucket — always computed, never stored. */
export function getBucket(task: FollowUp, now = new Date()): FollowUpBucket {
  if (task.completedAt) return 'done';
  const due = new Date(task.dueAt);
  if (due.getTime() < now.getTime()) return 'overdue';
  if (sameDay(due, now)) return 'today';
  if (task.purpose === 'nurture') return 'nurture';
  return 'upcoming';
}

export function needsApproval(task: FollowUp): boolean {
  return !task.completedAt && task.owner === 'AI' && (task.kind === 'message' || task.kind === 'email') && task.approval !== 'approved';
}

/** AI follow-ups pause while a human owns the conversation. */
export function isPausedByHandoff(task: FollowUp, leadHandlingMode?: 'AI' | 'HUMAN'): boolean {
  return !task.completedAt && task.owner === 'AI' && leadHandlingMode === 'HUMAN';
}

/* --------------------------------------------------------------------------
   Seeds — realistic tasks relative to "now", tied to real seed lead ids
   -------------------------------------------------------------------------- */

export function createSeedFollowUps(): FollowUp[] {
  const now = new Date();
  const at = (days: number, h: number, m = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  return [
    {
      id: 'fu-elena-proposal',
      leadId: 'lead-elena',
      title: 'Follow up on proposal feedback',
      kind: 'message',
      channel: 'WhatsApp',
      owner: 'AI',
      purpose: 'follow_up',
      approval: 'draft',
      attempt: 2,
      maxAttempts: MAX_ATTEMPTS,
      dueAt: at(-2, 10, 30),
      draft: 'Hi Elena, checking in on the Nordic Space proposal we shared on Friday. Were you able to review it with your CFO? Happy to walk through any part of it.',
      note: 'No reply to the first proposal message.',
      createdAt: ago(5 * DAY),
      source: 'ai',
    },
    {
      id: 'fu-ananya-compliance',
      leadId: 'lead-ananya',
      title: 'Send DPDP compliance certificate',
      kind: 'email',
      channel: 'Email',
      owner: 'Sarah — Solutions',
      purpose: 'follow_up',
      attempt: 1,
      maxAttempts: MAX_ATTEMPTS,
      dueAt: at(-1, 15),
      draft: 'Hello Dr. Sen, sharing our DPDP Act compliance certificate and healthcare security whitepaper as promised.',
      note: 'Waiting on compliance clearance before clinical rollout.',
      createdAt: ago(3 * DAY),
      source: 'manual',
    },
    {
      id: 'fu-rahul-discovery',
      leadId: 'lead-rahul-sharma',
      title: 'Discovery call with Rahul Sharma',
      kind: 'call',
      channel: 'Zoom',
      owner: 'Rahul — Sales',
      purpose: 'meeting',
      meeting: { platform: 'zoom', link: 'https://zoom.us/j/84213397520', durationMins: 30 },
      dueAt: at(0, 16),
      note: 'Asked for enterprise pricing for 12 seats. Hot lead — call within the day.',
      createdAt: ago(4 * 60 * 60 * 1000),
      source: 'ai',
    },
    {
      id: 'fu-neha-ratecard',
      leadId: 'lead-neha',
      title: 'Send commercial rate card',
      kind: 'message',
      channel: 'Instagram',
      owner: 'AI',
      purpose: 'follow_up',
      approval: 'approved',
      attempt: 1,
      maxAttempts: MAX_ATTEMPTS,
      dueAt: at(0, 18),
      draft: 'Hi Neha! Here is the commercial pricing for Kavya Luxury Interiors across all 5 stores. Would a quick call tomorrow help?',
      createdAt: ago(6 * 60 * 60 * 1000),
      source: 'ai',
    },
    {
      id: 'fu-priya-replied',
      leadId: 'lead-priya',
      title: 'Check in on studio lighting brief',
      kind: 'message',
      channel: 'WhatsApp',
      owner: 'AI',
      purpose: 'follow_up',
      approval: 'approved',
      attempt: 2,
      maxAttempts: MAX_ATTEMPTS,
      dueAt: at(1, 11),
      draft: 'Hi Priya, just checking whether you had a chance to look at the brief we sent.',
      createdAt: ago(2 * DAY),
      customerRepliedAt: ago(3 * 60 * 60 * 1000),
      source: 'auto',
    },
    {
      id: 'fu-marcus-demo',
      leadId: 'lead-marcus',
      title: 'Share demo calendar link',
      kind: 'message',
      channel: 'LinkedIn',
      owner: 'Priya — AE',
      purpose: 'follow_up',
      attempt: 1,
      maxAttempts: MAX_ATTEMPTS,
      dueAt: at(2, 11, 30),
      draft: 'Hi Marcus, here is a link to book a 20-minute session for your engineering managers: cal.com/tecavy/marcus',
      createdAt: ago(1 * DAY),
      source: 'manual',
    },
    {
      id: 'fu-vanguard-reminder',
      leadId: 'lead-vanguard',
      title: 'Remind David about Thursday walkthrough',
      kind: 'message',
      channel: 'Email',
      owner: 'AI',
      purpose: 'appointment_reminder',
      approval: 'approved',
      dueAt: at(3, 9, 30),
      draft: 'Hi David, a quick reminder of our workflow walkthrough tomorrow at 11:00 AM. Reply here if you need to reschedule.',
      createdAt: ago(2 * DAY),
      source: 'auto',
    },
    {
      id: 'fu-vikram-nurture',
      leadId: 'lead-vikram',
      title: 'Revisit after Diwali, as requested',
      kind: 'message',
      channel: 'WhatsApp',
      owner: 'AI',
      purpose: 'nurture',
      approval: 'draft',
      dueAt: at(21, 10),
      draft: 'Hi Vikram, you mentioned you would revisit this after Diwali. We have two options that match your earlier requirements. Would you like me to send them?',
      note: 'Customer said: "Interested, but buying after Diwali." Do not contact before then.',
      createdAt: ago(4 * DAY),
      source: 'ai',
    },
    {
      id: 'fu-carlos-handoff',
      leadId: 'lead-carlos',
      title: 'Hand signed agreement to Customer Success',
      kind: 'task',
      owner: 'Rahul — Sales',
      purpose: 'follow_up',
      dueAt: at(-2, 12),
      completedAt: ago(1 * DAY),
      outcome: 'done',
      note: 'Contract countersigned. 12-month plan activated.',
      createdAt: ago(7 * DAY),
      source: 'auto',
    },
    {
      id: 'fu-sophie-sent',
      leadId: 'lead-sophie',
      title: 'Send portfolio and pricing',
      kind: 'message',
      channel: 'Instagram',
      owner: 'AI',
      purpose: 'follow_up',
      approval: 'approved',
      attempt: 1,
      maxAttempts: MAX_ATTEMPTS,
      dueAt: at(-1, 11),
      completedAt: ago(1 * DAY - 60 * 60 * 1000),
      outcome: 'replied',
      outcomeNote: 'Asked for a site visit next week.',
      draft: 'Hi Sophie, sharing our portfolio and pricing for boutique fit-outs.',
      createdAt: ago(3 * DAY),
      source: 'ai',
    },
  ];
}

/* --------------------------------------------------------------------------
   Persistence
   -------------------------------------------------------------------------- */

function normalise(task: FollowUp): FollowUp {
  return {
    purpose: 'follow_up',
    ...task,
    approval: task.approval ?? (task.owner === 'AI' && (task.kind === 'message' || task.kind === 'email') ? 'draft' : undefined),
    attempt: task.attempt ?? (task.purpose && task.purpose !== 'follow_up' ? undefined : task.kind === 'call' ? undefined : 1),
    maxAttempts: task.maxAttempts ?? (task.purpose && task.purpose !== 'follow_up' ? undefined : task.kind === 'call' ? undefined : MAX_ATTEMPTS),
    outcome: task.outcome ?? (task.completedAt ? 'done' : undefined),
  };
}

function loadInitialFollowUps(): FollowUp[] {
  if (typeof window === 'undefined') return createSeedFollowUps();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.map(normalise);
    }
    for (const key of LEGACY_KEYS) window.localStorage.removeItem(key);
  } catch {
    // storage unavailable — fall back to seeds
  }
  return createSeedFollowUps();
}

function saveFollowUps(tasks: FollowUp[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // quota / sandbox errors — keep in memory
  }
}

let followUpsStore: FollowUp[] = loadInitialFollowUps();
const listeners = new Set<() => void>();

function commit(next: FollowUp[]) {
  followUpsStore = next;
  saveFollowUps(followUpsStore);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): FollowUp[] {
  return followUpsStore;
}

const newId = () => `fu-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/* --------------------------------------------------------------------------
   Actions
   -------------------------------------------------------------------------- */

export function addFollowUp(
  taskData: Omit<FollowUp, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): FollowUp {
  const dueAt = alignToBusinessHours(new Date(taskData.dueAt)).toISOString();
  const task = normalise({
    ...taskData,
    dueAt,
    id: taskData.id || newId(),
    createdAt: taskData.createdAt || new Date().toISOString(),
  });
  commit([task, ...followUpsStore]);
  return task;
}

export function updateFollowUp(id: string, patch: Partial<FollowUp>): void {
  commit(followUpsStore.map(t => (t.id === id ? { ...t, ...patch } : t)));
}

/** Approve an AI draft so the engine can send it when it falls due. */
export function approveFollowUp(id: string, draft?: string): void {
  commit(
    followUpsStore.map(t =>
      t.id === id ? { ...t, approval: 'approved' as const, draft: draft ?? t.draft } : t
    )
  );
}

function followUpDraft(task: FollowUp, leadFirstName?: string): string {
  const name = leadFirstName ? ` ${leadFirstName}` : '';
  return `Hi${name}, just following up on my last message. Is there anything I can clarify or send over to help you decide?`;
}

export interface CompleteOptions {
  outcome: FollowUpOutcome;
  note?: string;
  /** Used for cadence when scheduling the next attempt. */
  temperature?: Temperature;
  /** When false, the engine won't chain a next step. Defaults to true. */
  scheduleNext?: boolean;
  /** Overrides the computed next due date. */
  nextDueAt?: string;
  leadFirstName?: string;
}

export interface CompleteResult {
  completed?: FollowUp;
  next?: FollowUp;
  movedToNurture?: boolean;
}

/** Computes what the engine would schedule next for an outcome (without saving). */
export function planNextStep(
  task: FollowUp,
  outcome: FollowUpOutcome,
  temperature: Temperature = 'WARM',
  now = new Date()
): { kind: 'attempt' | 'nurture' | 'reminder' | 'no_show' | 'none'; dueAt?: Date; label: string } {
  if (outcome === 'no_show') {
    const dueAt = alignToBusinessHours(new Date(now.getTime() + 60 * 60 * 1000));
    return { kind: 'no_show', dueAt, label: 'Send a “sorry we missed you” message to rebook' };
  }
  const attempt = task.attempt ?? 1;
  const max = task.maxAttempts ?? MAX_ATTEMPTS;
  if (outcome === 'sent' || outcome === 'no_response') {
    if (task.purpose === 'nurture' || task.purpose === 'reactivation' || attempt >= max) {
      const dueAt = daysFromNowAt(NURTURE_DAYS, 10, now);
      return { kind: 'nurture', dueAt, label: `Move to nurture · check back ${dueAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` };
    }
    const dueAt = nextAttemptDate(temperature, now);
    return {
      kind: 'attempt',
      dueAt,
      label: `Attempt ${attempt + 1} of ${max} · ${dueAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, 10:00 AM`,
    };
  }
  if (outcome === 'meeting_booked') {
    return { kind: 'none', label: 'Schedule the call below — a reminder is sent automatically' };
  }
  return { kind: 'none', label: outcome === 'replied' ? 'Sequence ends — qualification continues in the conversation' : 'No further follow-up' };
}

export function completeFollowUp(id: string, options?: CompleteOptions): CompleteResult {
  const task = followUpsStore.find(t => t.id === id);
  if (!task || task.completedAt) return {};
  const opts: CompleteOptions = options ?? { outcome: 'done', scheduleNext: false };
  const nowIso = new Date().toISOString();
  const completed: FollowUp = {
    ...task,
    completedAt: nowIso,
    outcome: opts.outcome,
    outcomeNote: opts.note?.trim() || undefined,
  };

  let next: FollowUp | undefined;
  let movedToNurture = false;
  if (opts.scheduleNext !== false) {
    const plan = planNextStep(task, opts.outcome, opts.temperature);
    const dueAt = opts.nextDueAt ? alignToBusinessHours(new Date(opts.nextDueAt)) : plan.dueAt;
    if (plan.kind === 'attempt' && dueAt) {
      next = normalise({
        id: newId(),
        leadId: task.leadId,
        title: task.title,
        kind: task.kind === 'call' ? 'call' : task.kind,
        channel: task.channel,
        owner: task.owner,
        purpose: 'follow_up',
        approval: task.owner === 'AI' ? 'draft' : undefined,
        attempt: (task.attempt ?? 1) + 1,
        maxAttempts: task.maxAttempts ?? MAX_ATTEMPTS,
        dueAt: dueAt.toISOString(),
        draft: task.kind === 'message' || task.kind === 'email' ? followUpDraft(task, opts.leadFirstName) : undefined,
        createdAt: nowIso,
        source: 'auto',
        previousId: task.id,
      });
    } else if (plan.kind === 'nurture' && dueAt) {
      movedToNurture = true;
      next = normalise({
        id: newId(),
        leadId: task.leadId,
        title: 'Nurture check-in with something new',
        kind: 'message',
        channel: task.channel,
        owner: 'AI',
        purpose: 'nurture',
        approval: 'draft',
        dueAt: dueAt.toISOString(),
        draft: `Hi${opts.leadFirstName ? ` ${opts.leadFirstName}` : ''}, it's been a while — we have a few new options that match what you were looking for. Would you like me to share them?`,
        note: `No reply after ${task.attempt ?? MAX_ATTEMPTS} attempts. Paused active follow-ups to avoid over-messaging.`,
        createdAt: nowIso,
        source: 'auto',
        previousId: task.id,
      });
    } else if (plan.kind === 'no_show' && dueAt) {
      next = normalise({
        id: newId(),
        leadId: task.leadId,
        title: 'Rebook after missed call',
        kind: 'message',
        channel: 'WhatsApp',
        owner: 'AI',
        purpose: 'no_show',
        approval: 'draft',
        dueAt: dueAt.toISOString(),
        draft: `Hi${opts.leadFirstName ? ` ${opts.leadFirstName}` : ''}, sorry we missed you on the call today. Would you like to pick another time that suits you?`,
        createdAt: nowIso,
        source: 'auto',
        previousId: task.id,
      });
    } else if (plan.kind === 'reminder' && dueAt) {
      next = normalise({
        id: newId(),
        leadId: task.leadId,
        title: 'Send appointment reminder',
        kind: 'message',
        channel: task.channel,
        owner: 'AI',
        purpose: 'appointment_reminder',
        approval: 'approved',
        dueAt: dueAt.toISOString(),
        draft: `Hi${opts.leadFirstName ? ` ${opts.leadFirstName}` : ''}, a quick reminder of our meeting. Reply here if you need to reschedule.`,
        createdAt: nowIso,
        source: 'auto',
        previousId: task.id,
      });
    }
  }

  const rest = followUpsStore.map(t => (t.id === id ? completed : t));
  commit(next ? [next, ...rest] : rest);
  return { completed, next, movedToNurture };
}

export function reopenFollowUp(id: string): void {
  commit(
    followUpsStore.map(t =>
      t.id === id ? { ...t, completedAt: undefined, outcome: undefined, outcomeNote: undefined } : t
    )
  );
}

export type SnoozeOption = 'later' | 'tomorrow' | 'in_3_days' | 'next_week' | string;

export function snoozeTarget(option: SnoozeOption, now = new Date()): Date {
  if (option === 'later') {
    const d = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    return alignToBusinessHours(d);
  }
  if (option === 'tomorrow') return daysFromNowAt(1, 10, now);
  if (option === 'in_3_days') return daysFromNowAt(3, 10, now);
  if (option === 'next_week') {
    const d = new Date(now);
    const daysUntilMonday = ((1 - d.getDay() + 7) % 7) || 7;
    return daysFromNowAt(daysUntilMonday, 10, now);
  }
  const parsed = new Date(option);
  return alignToBusinessHours(isNaN(parsed.getTime()) ? new Date(now.getTime() + DAY) : parsed);
}

export function snoozeFollowUp(id: string, option: SnoozeOption): Date {
  const target = snoozeTarget(option);
  commit(
    followUpsStore.map(t =>
      t.id === id
        ? { ...t, dueAt: target.toISOString(), completedAt: undefined, snoozeCount: (t.snoozeCount ?? 0) + 1 }
        : t
    )
  );
  return target;
}

/**
 * "Don't contact until…" — closes the lead's open follow-ups and parks the
 * lead in nurture until the requested date.
 */
export function holdLeadUntil(
  leadId: string,
  until: Date,
  reason: string,
  channel?: string,
  leadFirstName?: string
): FollowUp {
  const nowIso = new Date().toISOString();
  const closed = followUpsStore.map(t =>
    t.leadId === leadId && !t.completedAt
      ? { ...t, completedAt: nowIso, outcome: 'cancelled' as const, outcomeNote: `Paused: ${reason}` }
      : t
  );
  const nurture = normalise({
    id: newId(),
    leadId,
    title: 'Revisit as the customer requested',
    kind: 'message',
    channel,
    owner: 'AI',
    purpose: 'nurture',
    approval: 'draft',
    dueAt: alignToBusinessHours(until).toISOString(),
    draft: `Hi${leadFirstName ? ` ${leadFirstName}` : ''}, you asked us to get back in touch around now. Are you still looking for something similar?`,
    note: `Do not contact before this date. Reason: ${reason}`,
    createdAt: nowIso,
    source: 'manual',
  });
  commit([nurture, ...closed]);
  return nurture;
}

/* --------------------------------------------------------------------------
   Scheduled calls (Zoom / Google Meet / Microsoft Teams)
   Calls are follow-ups with purpose "meeting", so they appear everywhere
   follow-ups do: the Follow-ups queue, the lead panel, the Inbox lead panel
   and the team's Upcoming calls on Overview.
   -------------------------------------------------------------------------- */

function meetingLink(platform: MeetingPlatform): string {
  const r = (n: number) => Array.from({ length: n }, () => 'abcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 25)]).join('');
  const digits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
  if (platform === 'zoom') return `https://zoom.us/j/${digits(11)}`;
  if (platform === 'meet') return `https://meet.google.com/${r(3)}-${r(4)}-${r(3)}`;
  return `https://teams.microsoft.com/l/meetup-join/${digits(6)}${r(6)}`;
}

const PLATFORM_NAME: Record<MeetingPlatform, string> = { zoom: 'Zoom', meet: 'Google Meet', teams: 'Microsoft Teams' };

/** When the automatic reminder goes out: the day before, or 2 hours before for short notice. */
function reminderTime(callAt: Date, now = new Date()): Date | null {
  const dayBefore = new Date(callAt.getTime() - DAY);
  if (dayBefore.getTime() > now.getTime() + 60 * 60 * 1000) return dayBefore;
  const twoHours = new Date(callAt.getTime() - 2 * 60 * 60 * 1000);
  return twoHours.getTime() > now.getTime() ? twoHours : null;
}

export interface ScheduleCallInput {
  leadId: string;
  at: Date;
  platform: MeetingPlatform;
  host: string;
  leadName?: string;
  leadFirstName?: string;
  /** Optional meeting title. A default such as "Zoom call with Priya" is used when empty. */
  title?: string;
  previousId?: string;
}

export function scheduleCall(input: ScheduleCallInput): { call: FollowUp; reminder?: FollowUp } {
  const nowIso = new Date().toISOString();
  const call = normalise({
    id: newId(),
    leadId: input.leadId,
    title: input.title?.trim() || `${PLATFORM_NAME[input.platform]} call${input.leadName ? ` with ${input.leadName}` : ''}`,
    kind: 'call',
    channel: PLATFORM_NAME[input.platform],
    owner: input.host,
    purpose: 'meeting',
    meeting: { platform: input.platform, link: meetingLink(input.platform), durationMins: 30 },
    dueAt: input.at.toISOString(),
    createdAt: nowIso,
    source: 'manual',
    previousId: input.previousId,
  });
  const when = reminderTime(input.at);
  const timeText = input.at.toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' });
  const reminder = when
    ? normalise({
        id: newId(),
        leadId: input.leadId,
        title: 'Call reminder',
        kind: 'message',
        channel: 'WhatsApp',
        owner: 'AI',
        purpose: 'appointment_reminder',
        approval: 'approved',
        dueAt: when.toISOString(),
        draft: `Hi${input.leadFirstName ? ` ${input.leadFirstName}` : ''}, a quick reminder of ${input.title?.trim() ? `“${input.title.trim()}”` : `our ${PLATFORM_NAME[input.platform]} call`} on ${timeText}. Join here: ${call.meeting!.link}`,
        createdAt: nowIso,
        source: 'auto',
        previousId: call.id,
      })
    : undefined;
  commit(reminder ? [call, reminder, ...followUpsStore] : [call, ...followUpsStore]);
  return { call, reminder };
}

export function rescheduleCall(id: string, at: Date, platform: MeetingPlatform, leadFirstName?: string, title?: string): void {
  const call = followUpsStore.find(t => t.id === id);
  if (!call || !call.meeting) return;
  const samePlatform = call.meeting.platform === platform;
  const meeting: MeetingInfo = samePlatform ? call.meeting : { platform, link: meetingLink(platform), durationMins: call.meeting.durationMins };
  const when = reminderTime(at);
  const timeText = at.toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' });
  let next = followUpsStore.map(t => {
    if (t.id === id) {
      return {
        ...t,
        dueAt: at.toISOString(),
        channel: PLATFORM_NAME[platform],
        title: title?.trim() || t.title.replace(/^(Zoom|Google Meet|Microsoft Teams) call/, `${PLATFORM_NAME[platform]} call`),
        meeting,
        snoozeCount: (t.snoozeCount ?? 0) + 1,
      };
    }
    // keep the linked reminder in step with the call
    if (t.previousId === id && t.purpose === 'appointment_reminder' && !t.completedAt) {
      return when
        ? {
            ...t,
            dueAt: when.toISOString(),
            draft: `Hi${leadFirstName ? ` ${leadFirstName}` : ''}, a quick reminder of ${title?.trim() && !/^(Zoom|Google Meet|Microsoft Teams) call/.test(title) ? `“${title.trim()}”` : `our ${PLATFORM_NAME[platform]} call`} on ${timeText}. Join here: ${meeting.link}`,
          }
        : { ...t, completedAt: new Date().toISOString(), outcome: 'cancelled' as const, outcomeNote: 'Call moved too close for a reminder.' };
    }
    return t;
  });
  commit(next);
}

/** Cancels a scheduled call and its pending reminder. */
export function cancelCall(id: string, reason = 'Call cancelled'): void {
  const nowIso = new Date().toISOString();
  commit(
    followUpsStore.map(t =>
      (t.id === id || (t.previousId === id && t.purpose === 'appointment_reminder')) && !t.completedAt
        ? { ...t, completedAt: nowIso, outcome: 'cancelled' as const, outcomeNote: reason }
        : t
    )
  );
}

export function getUpcomingCalls(tasks: FollowUp[] = followUpsStore, now = new Date()): FollowUp[] {
  return tasks
    .filter(t => t.purpose === 'meeting' && !t.completedAt && new Date(t.dueAt).getTime() > now.getTime() - 60 * 60 * 1000)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export function deleteFollowUp(id: string): FollowUp | undefined {
  const found = followUpsStore.find(t => t.id === id);
  if (found) commit(followUpsStore.filter(t => t.id !== id));
  return found;
}

export function restoreFollowUp(task: FollowUp): void {
  if (!followUpsStore.some(t => t.id === task.id)) commit([task, ...followUpsStore]);
}

/**
 * Engine tick: sends approved AI follow-ups that have fallen due (unless the
 * lead is human-handled or the customer already replied) and chains the next
 * attempt. Returns the follow-ups it sent.
 */
export function runFollowUpAutomation(
  leadInfo: (leadId: string) => { handlingMode?: 'AI' | 'HUMAN'; temperature?: Temperature; firstName?: string } | undefined,
  now = new Date()
): FollowUp[] {
  const due = followUpsStore.filter(
    t =>
      !t.completedAt &&
      t.owner === 'AI' &&
      t.approval === 'approved' &&
      !t.customerRepliedAt &&
      new Date(t.dueAt).getTime() <= now.getTime()
  );
  const sent: FollowUp[] = [];
  for (const task of due) {
    const info = leadInfo(task.leadId);
    if (info?.handlingMode === 'HUMAN') continue;
    completeFollowUp(task.id, {
      outcome: 'sent',
      note: 'Sent automatically by the Engagement Agent.',
      temperature: info?.temperature,
      leadFirstName: info?.firstName,
    });
    sent.push(task);
  }
  return sent;
}

/* --------------------------------------------------------------------------
   Selectors
   -------------------------------------------------------------------------- */

export function computeFollowUpCounts(tasks: FollowUp[] = followUpsStore, now = new Date()): FollowUpCounts {
  const c: FollowUpCounts = { overdue: 0, today: 0, upcoming: 0, nurture: 0, done: 0, open: 0, awaitingApproval: 0, oldestOverdueDays: 0 };
  for (const task of tasks) {
    const bucket = getBucket(task, now);
    c[bucket]++;
    if (needsApproval(task)) c.awaitingApproval++;
    if (bucket === 'overdue') {
      const days = Math.max(1, Math.floor((now.getTime() - new Date(task.dueAt).getTime()) / DAY));
      c.oldestOverdueDays = Math.max(c.oldestOverdueDays, days);
    }
  }
  c.open = c.overdue + c.today + c.upcoming + c.nurture;
  return c;
}

export function getFollowUpsForLead(leadId: string): FollowUp[] {
  return followUpsStore.filter(t => t.leadId === leadId);
}

export function getNextFollowUp(leadId: string): FollowUp | undefined {
  return followUpsStore
    .filter(t => t.leadId === leadId && !t.completedAt)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
}

export function isLeadFollowUpOverdue(leadId: string, now = new Date()): boolean {
  return followUpsStore.some(t => t.leadId === leadId && getBucket(t, now) === 'overdue');
}

export function getOverdueLeadIdSet(now = new Date()): Set<string> {
  const set = new Set<string>();
  for (const task of followUpsStore) if (getBucket(task, now) === 'overdue') set.add(task.leadId);
  return set;
}

/* --------------------------------------------------------------------------
   Hooks
   -------------------------------------------------------------------------- */

export function useFollowUps(): FollowUp[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useFollowUpCounts(): FollowUpCounts {
  const tasks = useFollowUps();
  const now = useNow(60000);
  return computeFollowUpCounts(tasks, now);
}

export function useNow(intervalMs = 60000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** The meeting title when the person typed one. Auto-made titles such as "Zoom call with Priya" return undefined. */
export function customCallTitle(task: Pick<FollowUp, 'title' | 'purpose'>): string | undefined {
  if (task.purpose !== 'meeting') return undefined;
  return /^(Zoom|Google Meet|Microsoft Teams) call/.test(task.title) ? undefined : task.title;
}
