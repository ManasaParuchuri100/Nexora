import React, { useMemo, useRef, useState } from 'react';
import { ScheduledPost } from '../../types';
import { formatPostTime, postDate, sameDay, withPostDate } from '../../data/schedule';
import { Field, NxModal } from './followups/FollowUpKit';
import { StatusBadge, Tabs } from '../ui';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PLATFORMS = ['LinkedIn', 'X (Twitter)', 'Instagram', 'Substack', 'Email'];
const MAX_PER_CELL = 3;

type View = 'month' | 'week';

interface Entry {
  post: ScheduledPost;
  at: Date;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const timeLabel = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const CHIP_TONE: Record<string, string> = {
  Queued: 'bg-brand-soft text-brand border-brand/30',
  Scheduled: 'bg-brand-soft text-brand border-brand/30',
  Approved: 'bg-ok-soft text-ok border-ok/30',
  'Draft Review': 'bg-warn-soft text-warn border-warn/30',
  Dispatched: 'bg-surface-raised text-ink-3 border-line',
};

export default function ContentCalendar({
  posts,
  onUpdate,
  onAdd,
  onDelete,
}: {
  posts: ScheduledPost[];
  onUpdate: (post: ScheduledPost) => void;
  onAdd: (post: ScheduledPost) => void;
  onDelete?: (id: string) => void;
}) {
  const today = startOfDay(new Date());
  const [view, setView] = useState<View>('month');
  const [cursor, setCursor] = useState<Date>(today);
  const [platform, setPlatform] = useState('All');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [openPost, setOpenPost] = useState<ScheduledPost | null>(null);
  const [dayList, setDayList] = useState<Date | null>(null);
  const [adding, setAdding] = useState<Date | null>(null);
  const msgTimer = useRef<number | undefined>(undefined);

  const say = (m: string) => {
    setMessage(m);
    window.clearTimeout(msgTimer.current);
    msgTimer.current = window.setTimeout(() => setMessage(''), 4000);
  };

  const platforms = useMemo(() => ['All', ...Array.from(new Set(posts.flatMap(p => p.platforms)))], [posts]);

  const entries = useMemo<Entry[]>(
    () =>
      posts
        .map(post => ({ post, at: postDate(post) }))
        .filter((e): e is Entry => e.at !== null && (platform === 'All' || e.post.platforms.includes(platform)))
        .sort((a, b) => a.at.getTime() - b.at.getTime()),
    [posts, platform],
  );
  const unplaced = posts.length - posts.map(p => postDate(p)).filter(Boolean).length;

  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach(e => {
      const k = dayKey(e.at);
      map.set(k, [...(map.get(k) || []), e]);
    });
    return map;
  }, [entries]);

  // Visible days
  const days = useMemo(() => {
    if (view === 'week') {
      const start = addDays(startOfDay(cursor), -startOfDay(cursor).getDay());
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = addDays(first, -first.getDay());
    const count = Math.ceil((first.getDay() + new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()) / 7) * 7;
    return Array.from({ length: count }, (_, i) => addDays(start, i));
  }, [view, cursor]);

  const title =
    view === 'month'
      ? cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const step = (dir: number) =>
    setCursor(c => (view === 'month' ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : addDays(c, dir * 7)));

  const canMove = (p: ScheduledPost) => p.status !== 'Dispatched';

  const moveTo = (id: string, day: Date) => {
    const entry = entries.find(e => e.post.id === id) || posts.map(p => ({ post: p, at: postDate(p) })).find(e => e.post.id === id);
    if (!entry || !entry.at) return;
    if (!canMove(entry.post)) return say('Published posts cannot be moved.');
    if (sameDay(entry.at, day)) return;
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), entry.at.getHours(), entry.at.getMinutes());
    if (next.getTime() < Date.now()) return say('That time has already passed. Pick today (later) or a future day.');
    onUpdate(withPostDate(entry.post, next));
    say(`Moved “${entry.post.title.slice(0, 40)}” to ${formatPostTime(next)}.`);
  };

  const renderChip = (e: Entry, roomy = false) => {
    const movable = canMove(e.post);
    const tone = CHIP_TONE[e.post.status] || CHIP_TONE.Queued;
    return (
      <button
        key={e.post.id}
        type="button"
        draggable={movable}
        onDragStart={ev => {
          setDragId(e.post.id);
          ev.dataTransfer.setData('text/plain', e.post.id);
          ev.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => { setDragId(null); setOverKey(null); }}
        onClick={() => setOpenPost(e.post)}
        title={`${timeLabel(e.at)} · ${e.post.title}${movable ? ' (drag to reschedule)' : ''}`}
        aria-label={`${e.post.title}, ${formatPostTime(e.at)}, ${e.post.status}`}
        className={`w-full text-left rounded-[6px]! border px-1.5 py-1 min-h-0! text-[12px] leading-tight ${tone} ${
          movable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer opacity-80'
        } ${dragId === e.post.id ? 'opacity-40' : ''}`}
      >
        <span className="font-bold tabular-nums">{timeLabel(e.at)}</span>
        <span className={`block ${roomy ? 'whitespace-normal' : 'truncate'}`}>{e.post.title}</span>
        {roomy && <span className="block text-[11px] opacity-80 truncate">{e.post.platforms.join(' · ')}</span>}
      </button>
    );
  };

  return (
    <section className="nx-panel nx-pad">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button type="button" className="nx-btn sm" onClick={() => step(-1)} aria-label={view === 'month' ? 'Previous month' : 'Previous week'}>‹</button>
          <button type="button" className="nx-btn sm" onClick={() => setCursor(today)}>Today</button>
          <button type="button" className="nx-btn sm" onClick={() => step(1)} aria-label={view === 'month' ? 'Next month' : 'Next week'}>›</button>
          <h2 className="font-display text-[16px] font-semibold text-ink m-0 ml-2 tracking-[-0.3px]" aria-live="polite">{title}</h2>
        </div>
        <Tabs<View>
          idPrefix="cal-view"
          label="Calendar view"
          value={view}
          onChange={setView}
          tabs={[{ id: 'month', label: 'Month' }, { id: 'week', label: 'Week' }]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-[7px] mb-3" role="group" aria-label="Filter by platform">
        {platforms.map(p => (
          <button key={p} type="button" aria-pressed={platform === p} className={`nx-chip ${platform === p ? 'active' : ''}`} onClick={() => setPlatform(p)}>
            {p}
          </button>
        ))}
        <span className="text-[12px] text-ink-3 ml-auto hidden sm:inline">Drag a post to another day to reschedule it. Click a post for details.</span>
      </div>

      <div className="min-h-[20px] text-[13px] text-ok mb-2" role="status">{message}</div>

      {/* Grid (scrolls inside its own container on small screens) */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 border-t border-l border-line rounded-t-[10px] overflow-hidden bg-surface-raised">
            {WEEKDAY_LABELS.map(d => (
              <div key={d} className="px-2 py-2 text-[11px] font-extrabold uppercase tracking-[1px] text-ink-3 border-r border-b border-line">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-line">
            {days.map(day => {
              const k = dayKey(day);
              const list = byDay.get(k) || [];
              const inMonth = view === 'week' || day.getMonth() === cursor.getMonth();
              const isToday = sameDay(day, today);
              const isOver = overKey === k && dragId !== null;
              const limit = view === 'week' ? list.length : MAX_PER_CELL;
              return (
                <div
                  key={k}
                  onDragOver={e => { if (dragId) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverKey(k); } }}
                  onDragLeave={() => setOverKey(prev => (prev === k ? null : prev))}
                  onDrop={e => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData('text/plain') || dragId;
                    setOverKey(null);
                    setDragId(null);
                    if (id) moveTo(id, day);
                  }}
                  className={`group border-r border-b border-line p-1.5 flex flex-col gap-1 ${view === 'week' ? 'min-h-[300px]' : 'min-h-[112px]'} ${
                    inMonth ? 'bg-surface' : 'bg-surface-raised'
                  } ${isOver ? 'bg-brand-soft! outline outline-2 -outline-offset-2 outline-brand' : ''}`}
                  aria-label={`${day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, ${list.length} posts`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setDayList(day)}
                      className={`min-h-0! w-[22px] h-[22px] rounded-full! grid place-items-center text-[12px] font-bold tabular-nums ${
                        isToday ? 'bg-brand text-on-brand' : inMonth ? 'text-ink-2 hover:bg-surface-hover' : 'text-ink-3'
                      }`}
                      aria-label={`Open ${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                    >
                      {day.getDate()}
                    </button>
                    {day.getTime() >= today.getTime() && (
                      <button
                        type="button"
                        onClick={() => setAdding(day)}
                        className="min-h-0! w-[22px] h-[22px] rounded-[6px]! text-ink-3 hover:text-brand hover:bg-brand-soft opacity-0 group-hover:opacity-100 focus-visible:opacity-100 grid place-items-center text-[14px] leading-none"
                        aria-label={`Add a post on ${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                      >
                        +
                      </button>
                    )}
                  </div>
                  {list.slice(0, limit).map(e => renderChip(e, view === 'week'))}
                  {list.length > limit && (
                    <button type="button" onClick={() => setDayList(day)} className="min-h-0! text-left text-[12px] font-bold text-ink-3 hover:text-brand px-1">
                      +{list.length - limit} more
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {entries.length === 0 && (
        <p className="text-[13px] text-ink-3 mt-3 mb-0">No posts match. Click “+” on any upcoming day to schedule one.</p>
      )}
      {unplaced > 0 && (
        <p className="text-[12px] text-ink-3 mt-2 mb-0">{unplaced} post{unplaced > 1 ? 's have' : ' has'} no exact date and only appear in the Queue.</p>
      )}

      {/* Day list */}
      {dayList && (
        <NxModal
          title={dayList.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          onClose={() => setDayList(null)}
          width={520}
          footer={
            <>
              {dayList.getTime() >= today.getTime() && (
                <button type="button" className="nx-btn" onClick={() => { setAdding(dayList); setDayList(null); }}>Add a post</button>
              )}
              <button type="button" className="nx-btn primary" onClick={() => setDayList(null)}>Done</button>
            </>
          }
        >
          {(byDay.get(dayKey(dayList)) || []).length === 0 ? (
            <p className="text-[13px] text-ink-3 m-0 pb-3">Nothing scheduled.</p>
          ) : (
            <div className="grid gap-1.5 pb-3">
              {(byDay.get(dayKey(dayList)) || []).map(e => (
                <div key={e.post.id} onClick={() => { setOpenPost(e.post); setDayList(null); }} className="cursor-pointer">
                  {renderChip(e, true)}
                </div>
              ))}
            </div>
          )}
        </NxModal>
      )}

      {openPost && (
        <PostDialog
          post={openPost}
          onClose={() => setOpenPost(null)}
          onSave={(next, label) => { onUpdate(next); say(`Rescheduled to ${label}.`); setOpenPost(null); }}
          onDelete={onDelete ? () => { onDelete(openPost.id); setOpenPost(null); } : undefined}
        />
      )}

      {adding && (
        <AddDialog
          day={adding}
          onClose={() => setAdding(null)}
          onCreate={post => { onAdd(post); say(`Scheduled for ${formatPostTime(new Date(post.scheduledAt!))}.`); setAdding(null); }}
        />
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- */

function PostDialog({
  post, onClose, onSave, onDelete,
}: {
  post: ScheduledPost;
  onClose: () => void;
  onSave: (post: ScheduledPost, label: string) => void;
  onDelete?: () => void;
}) {
  const at = postDate(post) as Date;
  const locked = post.status === 'Dispatched';
  const [date, setDate] = useState(isoDay(at));
  const [time, setTime] = useState(`${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`);
  const [error, setError] = useState('');

  const save = () => {
    const next = new Date(`${date}T${time}`);
    if (!date || !time || Number.isNaN(next.getTime())) return setError('Choose a date and time.');
    if (next.getTime() < Date.now()) return setError('Pick a time in the future.');
    onSave(withPostDate(post, next), formatPostTime(next));
  };

  return (
    <NxModal
      title={post.title}
      subtitle={<span className="inline-flex items-center gap-2">{post.platforms.join(' · ')} <StatusBadge status={post.status} /></span>}
      onClose={onClose}
      width={540}
      footer={
        <>
          {onDelete && !locked && <button type="button" className="nx-btn mr-auto text-danger" onClick={onDelete}>Remove</button>}
          <button type="button" className="nx-btn" onClick={onClose}>Close</button>
          {!locked && <button type="button" className="nx-btn primary" onClick={save}>Reschedule</button>}
        </>
      }
    >
      <p className="text-[13px] text-ink-2 leading-[1.65] whitespace-pre-wrap m-0 mb-4 max-h-[180px] overflow-y-auto">{post.content}</p>
      {locked ? (
        <p className="text-[13px] text-ink-3 pb-3">Published {formatPostTime(at)}. Published posts cannot be moved.</p>
      ) : (
        <Field label="Date & time">
          <div className="grid grid-cols-2 gap-[10px]">
            <input type="date" value={date} min={isoDay(new Date())} onChange={e => { setDate(e.target.value); setError(''); }} aria-label="Date" />
            <input type="time" value={time} onChange={e => { setTime(e.target.value); setError(''); }} aria-label="Time" />
          </div>
          {error && <div className="text-[13px] text-danger mt-1.5" role="alert">{error}</div>}
        </Field>
      )}
    </NxModal>
  );
}

function AddDialog({ day, onClose, onCreate }: { day: Date; onClose: () => void; onCreate: (post: ScheduledPost) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([PLATFORMS[0]]);
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!content.trim()) return setError('Write the post content.');
    if (platforms.length === 0) return setError('Choose at least one platform.');
    if (!time) return setError('Choose a time.');
    const [h, m] = time.split(':').map(Number);
    const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
    if (at.getTime() < Date.now()) return setError('Pick a time in the future.');
    onCreate({
      id: `post-${Date.now()}`,
      title: title.trim() || `${content.trim().slice(0, 48)}${content.trim().length > 48 ? '…' : ''}`,
      content: content.trim(),
      platforms,
      scheduledAt: at.toISOString(),
      scheduledTime: formatPostTime(at),
      status: 'Scheduled',
      author: 'You',
      createdAt: 'Just now',
    });
  };

  return (
    <NxModal
      title="Schedule a post"
      subtitle={day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      onClose={onClose}
      width={520}
      footer={
        <>
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={submit}>Schedule</button>
        </>
      }
    >
      <Field label="Title" hint="Optional">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Launch announcement" />
      </Field>
      <Field label="Post">
        <textarea rows={4} value={content} onChange={e => { setContent(e.target.value); setError(''); }} placeholder="What should this post say?" />
      </Field>
      <Field label="Publish to">
        <div className="flex flex-wrap gap-[7px]">
          {PLATFORMS.map(p => {
            const on = platforms.includes(p);
            return (
              <button key={p} type="button" aria-pressed={on} className={`nx-chip ${on ? 'active' : ''}`}
                onClick={() => setPlatforms(prev => (on ? prev.filter(x => x !== p) : [...prev, p]))}>
                {p}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Time">
        <input type="time" value={time} onChange={e => { setTime(e.target.value); setError(''); }} aria-label="Time" />
      </Field>
      {error && <p className="text-[13px] text-danger m-0 mb-2" role="alert">{error}</p>}
    </NxModal>
  );
}
