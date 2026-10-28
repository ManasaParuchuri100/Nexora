import { useSyncExternalStore, useState, useEffect } from 'react';

export type FollowUpKind = 'call' | 'email' | 'message' | 'task';
export type FollowUpSource = 'manual' | 'auto' | 'ai';
export type FollowUpBucket = 'done' | 'overdue' | 'today' | 'upcoming';

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
}

export interface FollowUpCounts {
  overdue: number;
  today: number;
  upcoming: number;
  done: number;
  open: number;
  oldestOverdueDays: number;
}

const STORAGE_KEY = 'nexora_followups_v2';
const OLD_STORAGE_KEY = 'nexora_follow_ups';

/**
 * Computes the lifecycle bucket for a follow-up task.
 * Status is always computed dynamically, never stored.
 */
export function getBucket(task: FollowUp, now = new Date()): FollowUpBucket {
  if (task.completedAt) return 'done';
  const dueDate = new Date(task.dueAt);
  if (dueDate.getTime() < now.getTime()) {
    return 'overdue';
  }
  const isSameDay =
    dueDate.getFullYear() === now.getFullYear() &&
    dueDate.getMonth() === now.getMonth() &&
    dueDate.getDate() === now.getDate();
  if (isSameDay) {
    return 'today';
  }
  return 'upcoming';
}

/**
 * Seeds 8 realistic tasks relative to Date.now(), using real lead IDs from seed leads:
 * - 2 overdue (2 days and 1 day)
 * - 2 due today (one is Rahul's "Book discovery walkthrough call" at 2 pm)
 * - 3 upcoming
 * - 1 done
 * Includes draft text on message/email tasks.
 */
export function createSeedFollowUps(): FollowUp[] {
  const now = new Date();

  // 1. Overdue: 2 days ago
  const overdue2Days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  overdue2Days.setHours(10, 30, 0, 0);

  // 2. Overdue: 1 day ago
  const overdue1Day = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  overdue1Day.setHours(15, 0, 0, 0);

  // 3. Due today: Rahul's "Book discovery walkthrough call" at 2:00 PM local
  const today2pm = new Date(now);
  today2pm.setHours(14, 0, 0, 0);

  // 4. Due today: Neha at 4:30 PM local
  const today430pm = new Date(now);
  today430pm.setHours(16, 30, 0, 0);

  // 5. Upcoming 1: tomorrow at 10:00 AM local
  const tomorrow10am = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  tomorrow10am.setHours(10, 0, 0, 0);

  // 6. Upcoming 2: in 2 days at 11:30 AM local
  const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  in2Days.setHours(11, 30, 0, 0);

  // 7. Upcoming 3: in 4 days at 3:00 PM local
  const in4Days = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  in4Days.setHours(15, 0, 0, 0);

  // 8. Done: completed 1 day ago
  const doneDue = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const doneCompleted = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'task-1',
      leadId: 'lead-elena',
      title: 'Follow-up on tailored proposal feedback',
      kind: 'email',
      channel: 'WhatsApp',
      owner: 'Rahul — Sales',
      dueAt: overdue2Days.toISOString(),
      draft: 'Hi Elena, checking in regarding the Nordic Space proposal we sent on Friday. Were you able to review it with your CFO?',
      note: 'High-value European deal (€12k ARR equivalent).',
      createdAt: new Date(overdue2Days.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'auto'
    },
    {
      id: 'task-2',
      leadId: 'lead-ananya',
      title: 'Send DPDP compliance certificate & whitepaper',
      kind: 'message',
      channel: 'WhatsApp',
      owner: 'Sarah — Solutions',
      dueAt: overdue1Day.toISOString(),
      draft: 'Hello Dr. Sen, sharing our DPDP Act compliance certificate and healthcare security architecture whitepaper.',
      note: 'Waiting on compliance clearance before clinical rollout.',
      createdAt: new Date(overdue1Day.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'manual'
    },
    {
      id: 'task-3',
      leadId: 'lead-rahul-sharma',
      title: 'Book discovery walkthrough call',
      kind: 'call',
      channel: 'WhatsApp',
      owner: 'Rahul — Sales',
      dueAt: today2pm.toISOString(),
      draft: 'Hi Rahul, would 2:00 PM today work for a brief 15-minute walkthrough of Aster Labs WhatsApp routing?',
      note: 'Prospect asked for enterprise tier pricing for 12 seats.',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      source: 'ai'
    },
    {
      id: 'task-4',
      leadId: 'lead-neha',
      title: 'Send commercial showroom rate card',
      kind: 'message',
      channel: 'Instagram',
      owner: 'Sarah — Solutions',
      dueAt: today430pm.toISOString(),
      draft: 'Hi Neha! Here is our commercial tier breakdown tailored for Kavya Luxury Interiors 5 store locations.',
      note: 'Requested full pricing breakdown for multi-store deployment.',
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      source: 'auto'
    },
    {
      id: 'task-5',
      leadId: 'lead-marcus',
      title: 'Share engineering demo calendar link',
      kind: 'message',
      channel: 'LinkedIn',
      owner: 'Priya — AE',
      dueAt: tomorrow10am.toISOString(),
      draft: 'Hi Marcus, here is our team live calendar link to book a 20-min session for your 18 engineering managers: cal.com/tecavy/marcus',
      note: 'Confirmed engineering budget $10k/mo.',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'ai'
    },
    {
      id: 'task-6',
      leadId: 'lead-vikram',
      title: 'Prepare private wealth CRM executive briefing',
      kind: 'task',
      owner: 'Rahul — Sales',
      dueAt: in2Days.toISOString(),
      note: 'Highlight Mumbai cloud data residency & Surat advisor access controls.',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'manual'
    },
    {
      id: 'task-7',
      leadId: 'lead-vanguard',
      title: 'Review architectural workflow documentation with partners',
      kind: 'call',
      channel: 'Website',
      owner: 'Sarah — Solutions',
      dueAt: in4Days.toISOString(),
      draft: 'Hello David, following up on our documentation review session for Vanguard partner group.',
      note: 'Technical evaluation of client portal generation.',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'manual'
    },
    {
      id: 'task-8',
      leadId: 'lead-carlos',
      title: 'Hand off executed agreement to Customer Success',
      kind: 'task',
      owner: 'Rahul — Sales',
      dueAt: doneDue.toISOString(),
      completedAt: doneCompleted.toISOString(),
      note: 'DocuSign countersigned. 12-month enterprise contract activated.',
      createdAt: new Date(doneDue.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'auto'
    }
  ];
}

function loadInitialFollowUps(): FollowUp[] {
  if (typeof window === 'undefined') {
    return createSeedFollowUps();
  }
  try {
    // Clean up old storage key and ignore contents
    window.localStorage.removeItem(OLD_STORAGE_KEY);

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fall back to seed data if localStorage is inaccessible
  }
  return createSeedFollowUps();
}

function saveFollowUps(tasks: FollowUp[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore localStorage quota / sandbox errors
  }
}

// Module store instance
let followUpsStore: FollowUp[] = loadInitialFollowUps();
const listeners = new Set<() => void>();

function emitChange() {
  saveFollowUps(followUpsStore);
  for (const listener of listeners) {
    listener();
  }
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

// Actions
export function addFollowUp(taskData: Omit<FollowUp, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): FollowUp {
  const newTask: FollowUp = {
    ...taskData,
    id: taskData.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: taskData.createdAt || new Date().toISOString()
  };
  followUpsStore = [newTask, ...followUpsStore];
  emitChange();
  return newTask;
}

export function updateFollowUp(id: string, patch: Partial<FollowUp>): void {
  followUpsStore = followUpsStore.map((t) => (t.id === id ? { ...t, ...patch } : t));
  emitChange();
}

export function completeFollowUp(id: string): void {
  const now = new Date().toISOString();
  followUpsStore = followUpsStore.map((t) =>
    t.id === id ? { ...t, completedAt: now } : t
  );
  emitChange();
}

export function reopenFollowUp(id: string): void {
  followUpsStore = followUpsStore.map((t) =>
    t.id === id ? { ...t, completedAt: undefined } : t
  );
  emitChange();
}

export function snoozeFollowUp(
  id: string,
  option: 'later' | 'tomorrow' | 'next_week' | string
): void {
  const now = new Date();
  let targetDate: Date;

  if (option === 'later') {
    // Today 5:00 PM, or +3 hours if that has passed
    targetDate = new Date(now);
    targetDate.setHours(17, 0, 0, 0);
    if (targetDate.getTime() <= now.getTime()) {
      targetDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    }
  } else if (option === 'tomorrow') {
    // Tomorrow 9:00 AM
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(9, 0, 0, 0);
  } else if (option === 'next_week') {
    // Next Monday 9:00 AM
    targetDate = new Date(now);
    const day = targetDate.getDay();
    const daysUntilNextMonday = ((1 - day + 7) % 7) || 7;
    targetDate.setDate(targetDate.getDate() + daysUntilNextMonday);
    targetDate.setHours(9, 0, 0, 0);
  } else {
    const parsed = new Date(option);
    targetDate = !isNaN(parsed.getTime()) ? parsed : new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  followUpsStore = followUpsStore.map((t) =>
    t.id === id ? { ...t, dueAt: targetDate.toISOString(), completedAt: undefined } : t
  );
  emitChange();
}

export function deleteFollowUp(id: string): FollowUp | undefined {
  const found = followUpsStore.find((t) => t.id === id);
  if (found) {
    followUpsStore = followUpsStore.filter((t) => t.id !== id);
    emitChange();
  }
  return found;
}

export function restoreFollowUp(task: FollowUp): void {
  if (!followUpsStore.some((t) => t.id === task.id)) {
    followUpsStore = [task, ...followUpsStore];
    emitChange();
  }
}

// Selectors
export function computeFollowUpCounts(
  tasks: FollowUp[] = followUpsStore,
  now = new Date()
): FollowUpCounts {
  let overdue = 0;
  let today = 0;
  let upcoming = 0;
  let done = 0;
  let oldestOverdueDays = 0;

  for (const task of tasks) {
    const bucket = getBucket(task, now);
    if (bucket === 'done') {
      done++;
    } else if (bucket === 'overdue') {
      overdue++;
      const dueTime = new Date(task.dueAt).getTime();
      const diffMs = now.getTime() - dueTime;
      const days = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      if (days > oldestOverdueDays) {
        oldestOverdueDays = days;
      }
    } else if (bucket === 'today') {
      today++;
    } else if (bucket === 'upcoming') {
      upcoming++;
    }
  }

  const open = overdue + today + upcoming;
  return { overdue, today, upcoming, done, open, oldestOverdueDays };
}

export function getFollowUpsForLead(leadId: string): FollowUp[] {
  return followUpsStore.filter((t) => t.leadId === leadId);
}

export function getNextFollowUp(leadId: string): FollowUp | undefined {
  const openTasks = followUpsStore
    .filter((t) => t.leadId === leadId && !t.completedAt)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  return openTasks[0];
}

export function isLeadFollowUpOverdue(leadId: string, now = new Date()): boolean {
  return followUpsStore.some(
    (t) => t.leadId === leadId && getBucket(t, now) === 'overdue'
  );
}

export function getOverdueLeadIdSet(now = new Date()): Set<string> {
  const set = new Set<string>();
  for (const task of followUpsStore) {
    if (getBucket(task, now) === 'overdue') {
      set.add(task.leadId);
    }
  }
  return set;
}

// Hooks
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
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
