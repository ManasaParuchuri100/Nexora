/**
 * Pure date & time utilities for relative formatting, day grouping, and due date labels.
 */

export function formatRelative(val?: string | number | null): string {
  if (!val) return 'Just now';

  // If already relative-looking like "4m", "18m", "2h", "3d", "Just now", return as is
  if (typeof val === 'string' && /^(just now|\d+\s*(m|h|d|min|mins|hr|hrs|day|days)(\s+ago)?)$/i.test(val.trim())) {
    return val.trim();
  }

  const timestamp = typeof val === 'number' ? val : Date.parse(val);
  if (isNaN(timestamp)) {
    // Return original string if it is a time of day like "10:42 AM"
    return typeof val === 'string' ? val : 'Just now';
  }

  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export function formatDayLabel(val?: string | number | null): string {
  if (!val) return 'Today';

  const timestamp = typeof val === 'number' ? val : Date.parse(val);
  if (isNaN(timestamp)) {
    return 'Today';
  }

  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

export function formatDueLabel(val?: string | null): {
  text: string;
  tone: 'overdue' | 'today' | 'upcoming';
} {
  if (!val) {
    return { text: 'No due date', tone: 'upcoming' };
  }

  // Handle human strings like "Yesterday — 4:30 PM", "Tomorrow — 11:00 AM"
  const lower = val.toLowerCase();
  if (lower.includes('yesterday') || lower.includes('overdue')) {
    const dayMatch = val.match(/(\d+)\s*day/i);
    const days = dayMatch ? dayMatch[1] : '1';
    return { text: `${days} day${days === '1' ? '' : 's'} overdue`, tone: 'overdue' };
  }
  if (lower.includes('today')) {
    return { text: 'Due today', tone: 'today' };
  }
  if (lower.includes('tomorrow')) {
    return { text: 'Due tomorrow', tone: 'upcoming' };
  }

  const timestamp = Date.parse(val);
  if (isNaN(timestamp)) {
    return { text: val, tone: 'upcoming' };
  }

  const targetDate = new Date(timestamp);
  const now = new Date();

  // Reset time to start of day for calendar day comparison
  const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffDays = Math.round((targetDay - todayDay) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      text: overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`,
      tone: 'overdue'
    };
  }
  if (diffDays === 0) {
    return { text: 'Due today', tone: 'today' };
  }
  if (diffDays === 1) {
    return { text: 'Due tomorrow', tone: 'upcoming' };
  }
  return {
    text: `Due in ${diffDays} days`,
    tone: 'upcoming'
  };
}
