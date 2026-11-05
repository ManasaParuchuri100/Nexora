import React, { useMemo, useState } from 'react';
import { Campaign, GeneratedAsset, ScheduledPost, SubCategory } from '../../types';
import { BRAND_COMPANY } from '../../config/brand';
import { PageHeader } from '../ui';
import { Field, NxModal } from './followups/FollowUpKit';
import {
  Brief, Cta, CTAS, ContentKind, Draft, GOALS, Goal, KINDS, LENGTHS, Length, REFINEMENTS, Refinement, TONES, Tone,
  generateDrafts, refine,
} from '../../data/contentGenerator';

interface CreativeLabViewProps {
  activeSubCategory: SubCategory;
  assets: GeneratedAsset[];
  onNavigateSub: (sub: SubCategory) => void;
  onGenerateSuccess: (newAsset: GeneratedAsset) => void;
  campaigns?: Campaign[];
  onSchedulePost?: (post: ScheduledPost) => void;
}

const TYPE_LABEL: Record<string, string> = {
  'Social Post': 'Social post',
  'Email Copy': 'Email',
  'Headline Set': 'Ad copy',
  'Thought Leadership': 'Article',
  'Ad Script': 'Video script',
};
const typeLabel = (t: string) => TYPE_LABEL[t] || t;
const kindOf = (id: ContentKind) => KINDS.find(k => k.id === id)!;

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

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/*  Schedule dialog: blank date and time, pick where it goes          */
/* ------------------------------------------------------------------ */
function ScheduleDialog({
  title, channels, defaultChannel, onClose, onConfirm,
}: {
  title: string; channels: string[]; defaultChannel: string; onClose: () => void;
  onConfirm: (channel: string, when: Date) => void;
}) {
  const [channel, setChannel] = useState(channels.includes(defaultChannel) ? defaultChannel : channels[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!date) return setError('Choose a date.');
    if (!time) return setError('Choose a time.');
    const when = new Date(`${date}T${time}`);
    if (Number.isNaN(when.getTime()) || when.getTime() < Date.now()) return setError('Pick a time in the future.');
    onConfirm(channel, when);
  };

  return (
    <NxModal
      title="Schedule post"
      subtitle={title}
      onClose={onClose}
      width={460}
      footer={
        <>
          <button type="button" className="nx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="nx-btn primary" onClick={submit}>Schedule</button>
        </>
      }
    >
      {channels.length > 1 && (
        <Field label="Publish to">
          <Chips options={channels} value={channel} onChange={setChannel} />
        </Field>
      )}
      <Field label="Date & time">
        <div className="grid grid-cols-2 gap-[10px]">
          <input type="date" value={date} min={todayISO()} onChange={e => { setDate(e.target.value); setError(''); }} aria-label="Date" />
          <input type="time" value={time} onChange={e => { setTime(e.target.value); setError(''); }} aria-label="Time" />
        </div>
      </Field>
      {error && <p className="text-[12px] text-danger m-0 mb-2" role="alert">{error}</p>}
    </NxModal>
  );
}

/* ------------------------------------------------------------------ */
/*  Create                                                            */
/* ------------------------------------------------------------------ */
function CreateStudio({
  campaigns, onSave, onSchedule,
}: {
  campaigns: Campaign[];
  onSave: (a: GeneratedAsset) => void;
  onSchedule?: (p: ScheduledPost) => void;
}) {
  const [kind, setKind] = useState<ContentKind>('social');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState<Goal>('Generate leads');
  const [channel, setChannel] = useState(kindOf('social').channels[0]);
  const [tone, setTone] = useState<Tone>('Professional');
  const [length, setLength] = useState<Length>('Short');
  const [cta, setCta] = useState<Cta>('Learn more');
  const [campaignId, setCampaignId] = useState('');
  const [error, setError] = useState('');

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [active, setActive] = useState(0);
  const [briefOf, setBriefOf] = useState<Brief | null>(null);
  const [savedText, setSavedText] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [note, setNote] = useState('');

  const meta = kindOf(kind);
  const draft = drafts[active];
  const campaign = campaigns.find(c => c.id === campaignId);

  const pickKind = (k: ContentKind) => {
    setKind(k);
    setChannel(kindOf(k).channels[0]);
  };

  const flash = (m: string) => {
    setNote(m);
    window.setTimeout(() => setNote(''), 2600);
  };

  const generate = () => {
    if (!topic.trim()) return setError('Tell us what this is about.');
    setError('');
    const brief: Brief = { kind, topic, goal, channel, tone, length, cta, company: BRAND_COMPANY };
    setBriefOf(brief);
    setDrafts(generateDrafts(brief));
    setActive(0);
    setSavedText({});
  };

  const setText = (text: string) => setDrafts(d => d.map((x, i) => (i === active ? { ...x, text } : x)));

  const isSaved = draft ? savedText[draft.id] === draft.text : false;
  const wasSaved = draft ? draft.id in savedText : false;

  const save = (): string | null => {
    if (!draft || !briefOf || isSaved) return null;
    const label = kindOf(briefOf.kind);
    const title = briefOf.topic.trim().replace(/\s+/g, ' ');
    onSave({
      id: `asset-${Date.now()}`,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      type: label.assetType,
      platform: briefOf.channel,
      preview: draft.text,
      createdAt: 'Just now',
      tags: [label.label, briefOf.goal, ...(campaign ? [campaign.name] : [])],
    });
    setSavedText(s => ({ ...s, [draft.id]: draft.text }));
    return title;
  };

  const copy = async () => {
    if (!draft) return;
    try { await navigator.clipboard.writeText(draft.text); } catch { /* clipboard unavailable */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const confirmSchedule = (ch: string, when: Date) => {
    if (!draft || !briefOf || !onSchedule) return;
    save();
    const title = briefOf.topic.trim();
    onSchedule({
      id: `post-${Date.now()}`,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      content: draft.text,
      platforms: [ch],
      scheduledTime: when.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      status: 'Scheduled',
      tags: campaign ? [campaign.name] : undefined,
      author: 'You',
      createdAt: 'Just now',
    });
    setScheduling(false);
  };

  return (
    <div className="grid gap-[15px] lg:grid-cols-[400px_minmax(0,1fr)] items-start">
      {/* Brief */}
      <section className="nx-panel nx-pad">
        <div className="nx-sectionhead"><div><h2>Brief</h2><p>Pick the options, then generate.</p></div></div>

        <Field label="What are you creating?">
          <div className="grid grid-cols-2 gap-[7px]">
            {KINDS.map(k => (
              <button
                key={k.id}
                type="button"
                aria-pressed={kind === k.id}
                onClick={() => pickKind(k.id)}
                className={`nx-option text-left flex! flex-col! items-start! justify-center gap-0.5 ${kind === k.id ? 'active' : ''} ${k.id === 'video' ? 'col-span-2' : ''}`}
              >
                <strong className="block text-[12px]">{k.label}</strong>
                <span className="block text-[11px] text-ink-3 font-normal">{k.hint}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="What is it about?">
          <textarea
            rows={2}
            value={topic}
            onChange={e => { setTopic(e.target.value); setError(''); }}
            placeholder="e.g. our new festive offer on home loans"
            maxLength={140}
          />
        </Field>

        <Field label="Goal"><Chips options={GOALS} value={goal} onChange={setGoal} /></Field>
        {meta.channels.length > 1 && (
          <Field label={kind === 'social' ? 'Platform' : 'Channel'}><Chips options={meta.channels} value={channel} onChange={setChannel} /></Field>
        )}
        <Field label="Tone"><Chips options={TONES} value={tone} onChange={setTone} /></Field>
        <Field label="Length"><Chips options={LENGTHS} value={length} onChange={setLength} /></Field>
        <Field label="Call to action"><Chips options={CTAS} value={cta} onChange={setCta} /></Field>

        {campaigns.length > 0 && (
          <Field label="Campaign" hint="Optional. Tags the content so you can find it later.">
            <select value={campaignId} onChange={e => setCampaignId(e.target.value)}>
              <option value="">None</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        )}

        {error && <p className="text-[12px] text-danger m-0 mb-3" role="alert">{error}</p>}
        <button type="button" className="nx-btn primary w-full justify-center" onClick={generate}>
          {drafts.length ? 'Regenerate drafts' : 'Generate drafts'}
        </button>
      </section>

      {/* Result */}
      <section className="nx-panel nx-pad min-h-[420px] lg:sticky lg:top-[88px]">
        {!draft ? (
          <div className="grid place-items-center text-center min-h-[360px]">
            <div className="max-w-[300px]">
              <div className="nx-alerticon muted mx-auto mb-3">✎</div>
              <h2 className="font-display text-[15px] font-bold text-ink m-0 mb-1.5">Your drafts appear here</h2>
              <p className="text-[12px] text-ink-3 leading-[1.6] m-0">
                You will get three versions to compare. Edit, refine, save or schedule the one you like.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="nx-sectionhead">
              <div>
                <h2>{meta.label} drafts</h2>
                <p>{briefOf?.channel} · {briefOf?.tone.toLowerCase()} · {briefOf?.goal.toLowerCase()}</p>
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap mb-3" role="tablist">
              {drafts.map((d, i) => (
                <button key={d.id} type="button" role="tab" aria-selected={active === i}
                  className={`nx-tab ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>
                  {i + 1}. {d.label}
                </button>
              ))}
            </div>

            <textarea
              value={draft.text}
              onChange={e => setText(e.target.value)}
              rows={11}
              aria-label="Draft text"
              className="w-full leading-[1.65]"
            />
            <div className="text-[11px] text-ink-3 mt-1.5 mb-3">{draft.text.length} characters · you can edit the text above</div>

            <div className="flex flex-wrap items-center gap-[7px] mb-4">
              <span className="text-[11px] font-bold text-ink-3 mr-1">Refine</span>
              {REFINEMENTS.map((r: Refinement) => (
                <button key={r} type="button" className="nx-chip" onClick={() => setText(refine(draft.text, r))}>{r}</button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-line">
              <div className="text-[12px] text-ok" role="status">{note}</div>
              <div className="flex flex-wrap gap-[9px]">
                <button type="button" className="nx-btn" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
                <button type="button" className="nx-btn" disabled={isSaved} onClick={() => { const t = save(); if (t) flash('Saved to your library.'); }}>
                  {isSaved ? 'Saved' : wasSaved ? 'Save as new copy' : 'Save to library'}
                </button>
                {meta.schedulable && onSchedule && (
                  <button type="button" className="nx-btn primary" onClick={() => setScheduling(true)}>Schedule…</button>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      {scheduling && briefOf && (
        <ScheduleDialog
          title={briefOf.topic.trim()}
          channels={kindOf(briefOf.kind).channels}
          defaultChannel={briefOf.channel}
          onClose={() => setScheduling(false)}
          onConfirm={confirmSchedule}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Library                                                           */
/* ------------------------------------------------------------------ */
function Library({
  assets, onCreate, onSchedule,
}: {
  assets: GeneratedAsset[];
  onCreate: () => void;
  onSchedule?: (p: ScheduledPost) => void;
}) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<GeneratedAsset | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [copied, setCopied] = useState(false);

  const types = useMemo(() => ['All', ...Array.from(new Set(assets.map(a => a.type)))], [assets]);
  const shown = useMemo(
    () =>
      assets.filter(a =>
        (filter === 'All' || a.type === filter) &&
        (!query.trim() || `${a.title} ${a.preview} ${a.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [assets, filter, query],
  );

  const canSchedule = (a: GeneratedAsset) => !!onSchedule && !a.imageUrl && (a.type === 'Social Post' || a.type === 'Email Copy');
  const channelsFor = (a: GeneratedAsset) => (a.type === 'Email Copy' ? ['Email'] : KINDS[0].channels);

  const copyOpen = async () => {
    if (!open) return;
    try { await navigator.clipboard.writeText(open.preview); } catch { /* clipboard unavailable */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (assets.length === 0) {
    return (
      <section className="nx-panel nx-pad grid place-items-center text-center min-h-[320px]">
        <div className="max-w-[320px]">
          <h2 className="font-display text-[15px] font-bold text-ink m-0 mb-1.5">Nothing saved yet</h2>
          <p className="text-[12px] text-ink-3 leading-[1.6] mb-4">Drafts you save in the Studio show up here.</p>
          <button type="button" className="nx-btn primary" onClick={onCreate}>Create content</button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-[15px]">
        <div className="flex gap-1.5 flex-wrap">
          {types.map(t => (
            <button key={t} type="button" className={`nx-tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
              {t === 'All' ? 'All' : typeLabel(t)}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search library"
          aria-label="Search library"
          className="nx-input w-[220px]"
        />
      </div>

      <section className="nx-panel">
        {shown.length === 0 ? (
          <p className="text-[12px] text-ink-3 text-center py-10 m-0">No content matches.</p>
        ) : (
          shown.map(a => (
            <button key={a.id} type="button" onClick={() => setOpen(a)}
              className="nx-row w-full text-left bg-transparent border-0 border-b border-line last:border-b-0 cursor-pointer min-h-0! px-[22px]">
              {a.imageUrl ? (
                <img src={a.imageUrl} alt="" className="w-[52px] h-[52px] rounded-[9px] object-cover shrink-0" />
              ) : (
                <div className="nx-alerticon muted">✎</div>
              )}
              <div className="flex-1 min-w-0">
                <strong>{a.title}</strong>
                <p className="line-clamp-1">{a.preview.replace(/\s+/g, ' ')}</p>
              </div>
              <span className="nx-tag hidden sm:inline-flex">{typeLabel(a.type)}</span>
              <span className="text-[11px] text-ink-3 w-[84px] text-right shrink-0 hidden md:block">{a.createdAt}</span>
            </button>
          ))
        )}
      </section>

      {open && !scheduling && (
        <NxModal
          title={open.title}
          subtitle={`${typeLabel(open.type)} · ${open.platform} · ${open.createdAt}`}
          onClose={() => setOpen(null)}
          width={620}
          footer={
            <>
              <button type="button" className="nx-btn" onClick={() => setOpen(null)}>Close</button>
              <button type="button" className="nx-btn" onClick={copyOpen}>{copied ? 'Copied' : 'Copy'}</button>
              {canSchedule(open) && <button type="button" className="nx-btn primary" onClick={() => setScheduling(true)}>Schedule…</button>}
            </>
          }
        >
          {open.imageUrl && <img src={open.imageUrl} alt="" className="w-full rounded-[11px] mb-3 object-cover max-h-[260px]" />}
          <p className="text-[13px] text-ink-2 leading-[1.7] whitespace-pre-wrap m-0 mb-3">{open.preview}</p>
          <div className="flex gap-1.5 flex-wrap">{open.tags.map(t => <span key={t} className="nx-tag">{t}</span>)}</div>
        </NxModal>
      )}

      {open && scheduling && (
        <ScheduleDialog
          title={open.title}
          channels={channelsFor(open)}
          defaultChannel={open.platform}
          onClose={() => setScheduling(false)}
          onConfirm={(ch, when) => {
            onSchedule?.({
              id: `post-${Date.now()}`,
              title: open.title,
              content: open.preview,
              platforms: [ch],
              scheduledTime: when.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
              status: 'Scheduled',
              author: 'You',
              createdAt: 'Just now',
            });
            setScheduling(false);
            setOpen(null);
          }}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell                                                             */
/* ------------------------------------------------------------------ */
export default function CreativeLabView({
  activeSubCategory, assets, onNavigateSub, onGenerateSuccess, campaigns = [], onSchedulePost,
}: CreativeLabViewProps) {
  const isLibrary = activeSubCategory === 'generated-assets' || activeSubCategory === 'content-library';

  return (
    <div className="w-full animate-fadeIn">
      <PageHeader
        eyebrow={`AI & Marketing / ${isLibrary ? 'Library' : 'Content Studio'}`}
        title={isLibrary ? 'Library' : 'Content Studio'}
        subtitle={isLibrary ? 'Everything you have saved, ready to reuse or schedule.' : 'Create on-brand content in a few clicks.'}
        actions={
          <div className="flex gap-1.5">
            <button type="button" className={`nx-tab ${!isLibrary ? 'active' : ''}`} onClick={() => onNavigateSub('create')}>Create</button>
            <button type="button" className={`nx-tab ${isLibrary ? 'active' : ''}`} onClick={() => onNavigateSub('generated-assets')}>
              Library <span className="nx-tab-count">{assets.length}</span>
            </button>
          </div>
        }
      />
      {isLibrary ? (
        <Library assets={assets} onCreate={() => onNavigateSub('create')} onSchedule={onSchedulePost} />
      ) : (
        <CreateStudio campaigns={campaigns} onSave={onGenerateSuccess} onSchedule={onSchedulePost} />
      )}
    </div>
  );
}
