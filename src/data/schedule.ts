import { ScheduledPost } from '../types';

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function parseClock(text: string): { h: number; m: number } | null {
  const t = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!t) return null;
  let h = Number(t[1]);
  const m = Number(t[2]);
  const ap = t[3]?.toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return { h, m };
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Turn a free-text label such as "Tomorrow, 9:30 AM" into a date. Returns null when it cannot be understood. */
export function parseScheduleLabel(label: string, now = new Date()): Date | null {
  const text = label.trim();
  const clock = parseClock(text) ?? { h: 9, m: 0 };
  const lower = text.toLowerCase();

  let day: Date | null = null;
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) day = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  else if (lower.startsWith('today')) day = startOfDay(now);
  else if (lower.startsWith('tomorrow')) day = new Date(startOfDay(now).getTime() + 86400000);
  else {
    const next = lower.startsWith('next ');
    const wd = WEEKDAYS.findIndex(w => lower.replace(/^next /, '').startsWith(w));
    if (wd >= 0) {
      const base = startOfDay(now);
      let add = (wd - base.getDay() + 7) % 7;
      if (next && add === 0) add = 7;
      day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + add);
    } else {
      // "Sat, Nov 7, 10:30 AM"
      const md = text.match(/([A-Za-z]{3,9})\s+(\d{1,2})/);
      if (md) {
        const parsed = new Date(`${md[1]} ${md[2]}, ${now.getFullYear()}`);
        if (!Number.isNaN(parsed.getTime())) {
          if (parsed.getTime() < now.getTime() - 120 * 86400000) parsed.setFullYear(now.getFullYear() + 1);
          day = parsed;
        }
      }
    }
  }
  if (!day) return null;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), clock.h, clock.m);
}

/** The exact time a post is scheduled for. */
export function postDate(post: ScheduledPost, now = new Date()): Date | null {
  if (post.scheduledAt) {
    const d = new Date(post.scheduledAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return parseScheduleLabel(post.scheduledTime, now);
}

/** Display label used across the queue, for example "Sat, Nov 7, 10:30 AM". */
export function formatPostTime(d: Date): string {
  return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** A copy of the post moved to a new time. */
export function withPostDate(post: ScheduledPost, d: Date): ScheduledPost {
  return { ...post, scheduledAt: d.toISOString(), scheduledTime: formatPostTime(d) };
}

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
