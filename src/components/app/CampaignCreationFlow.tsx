import React, { useState, useEffect } from 'react';
import { Campaign, CampaignBlueprint } from '../../types';
import { CampaignFormData, generateBlueprintFromForm } from '../../data/campaignBlueprintGenerator';
import { PageHeader } from '../ui';

interface CampaignCreationFlowProps {
  onBack: () => void;
  onBlueprintGenerated: (campaign: Campaign, blueprint: CampaignBlueprint) => void;
}

const TYPES = ['Product Launch', 'Lead Generation', 'Brand Awareness', 'Event', 'Content Campaign'];
const GOALS = ['Generate Leads', 'Increase Sales', 'Increase Brand Awareness', 'Drive Website Traffic', 'Increase Engagement'];
const TARGETS: Record<string, string[]> = {
  'Generate Leads': ['Generate 500 leads', 'Reach 50,000 people', 'Increase conversions by 20%'],
  'Increase Sales': ['Close 50 new deals', 'Increase revenue by 25%', 'Increase conversions by 20%'],
  'Increase Brand Awareness': ['Reach 100,000 people', 'Grow followers by 30%', 'Earn 20 press or partner mentions'],
  'Drive Website Traffic': ['Reach 20,000 site visits', 'Lower bounce rate by 15%', 'Increase conversions by 20%'],
  'Increase Engagement': ['Grow engagement rate to 5%', 'Grow followers by 30%', 'Reach 50,000 people'],
};
const DEFAULT_TARGETS = ['Reach 50,000 people', 'Increase conversions by 20%', 'Grow followers by 30%'];
const OFFERS = ['Discount', 'Free trial', 'Free consultation', 'Limited-time deal', 'Event invite', 'No offer'];
const AGES = ['18–24', '25–34', '25–45', '35–54', '55+'];
const LOCATIONS = ['India', 'North America', 'Europe', 'Asia-Pacific', 'Global'];
const INDUSTRIES = ['Technology & SaaS', 'Retail & E-commerce', 'Education', 'Healthcare', 'Finance', 'Real estate'];
const AUDIENCES = ['Business decision makers', 'Small business owners', 'Consumers', 'Students & early career'];
const BUDGETS: Array<{ label: string; type: CampaignFormData['budgetType']; amount: string }> = [
  { label: 'No fixed budget', type: 'none', amount: '' },
  { label: '$1,000', type: 'total', amount: '1,000' },
  { label: '$5,000', type: 'total', amount: '5,000' },
  { label: '$10,000', type: 'total', amount: '10,000' },
  { label: '$25,000', type: 'total', amount: '25,000' },
];
const START_OPTIONS = [
  { id: 'week', label: 'This week', days: 0 },
  { id: 'next', label: 'Next week', days: 7 },
  { id: 'month', label: 'In a month', days: 30 },
];
const DURATIONS = [
  { id: '2w', label: '2 weeks', days: 14 },
  { id: '1m', label: '1 month', days: 30 },
  { id: '2m', label: '2 months', days: 60 },
  { id: '3m', label: '3 months', days: 90 },
];
const CHANNELS = ['Instagram', 'LinkedIn', 'Facebook', 'X', 'Email', 'Website', 'Google Ads'];
const VOICES = ['Professional', 'Friendly', 'Bold', 'Premium', 'Playful'];
const STYLES = ['Minimal', 'Modern', 'Bold', 'Corporate', 'Creative'];

const LOADING_STEPS = [
  'Analyzing your campaign…',
  'Understanding your audience…',
  'Planning your channels…',
  'Building your roadmap…',
  'Creating your execution strategy…',
];
const STEP_TITLES = ['Basics', 'Audience', 'Budget & timing', 'Channels & style'];

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

function Group({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="nx-field">
      <label>{label}{hint && <span className="font-normal text-ink-3"> · {hint}</span>}</label>
      {children}
    </div>
  );
}

interface CustomEntry {
  placeholder: string;
  type?: 'text' | 'number' | 'date';
  min?: string;
  /** Return the chip label for a valid entry, or an error string prefixed with "!" */
  parse?: (raw: string) => string;
  onAdd: (value: string) => void;
}

function Options({
  options,
  isOn,
  onPick,
  custom,
}: {
  options: string[];
  isOn: (o: string) => boolean;
  onPick: (o: string) => void;
  custom?: CustomEntry;
}) {
  const [adding, setAdding] = useState(false);
  const [raw, setRaw] = useState('');
  const [err, setErr] = useState('');

  const commit = () => {
    if (!custom) return;
    const v = raw.trim();
    if (!v) return setErr('Enter a value.');
    const out = custom.parse ? custom.parse(v) : v;
    if (out.startsWith('!')) return setErr(out.slice(1));
    custom.onAdd(out);
    setRaw('');
    setErr('');
    setAdding(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-[7px]">
        {options.map(o => (
          <button
            key={o}
            type="button"
            className={`nx-chip ${isOn(o) ? 'active' : ''}`}
            aria-pressed={isOn(o)}
            onClick={() => onPick(o)}
          >
            {o}
          </button>
        ))}
        {custom && !adding && (
          <button type="button" className="nx-chip border-dashed!" onClick={() => setAdding(true)}>
            + Custom
          </button>
        )}
      </div>
      {custom && adding && (
        <div className="flex items-center gap-2 mt-2.5">
          <input
            autoFocus
            type={custom.type || 'text'}
            min={custom.min}
            value={raw}
            placeholder={custom.placeholder}
            aria-label={custom.placeholder}
            onChange={e => { setRaw(e.target.value); setErr(''); }}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commit(); }
              if (e.key === 'Escape') { setAdding(false); setRaw(''); setErr(''); }
            }}
            className="max-w-[260px]"
          />
          <button type="button" className="nx-btn sm primary" onClick={commit}>Add</button>
          <button type="button" className="nx-btn sm" onClick={() => { setAdding(false); setRaw(''); setErr(''); }}>Cancel</button>
        </div>
      )}
      {err && <p className="text-[12px] text-danger mt-1.5 mb-0" role="alert">{err}</p>}
    </div>
  );
}

export default function CampaignCreationFlow({ onBack, onBlueprintGenerated }: CampaignCreationFlowProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [startId, setStartId] = useState('next');
  const [durationId, setDurationId] = useState('1m');
  const [budgetLabel, setBudgetLabel] = useState('$5,000');
  const [customStart, setCustomStart] = useState('');
  const [customDays, setCustomDays] = useState(0);
  const [extras, setExtras] = useState<Record<string, string[]>>({});
  const withExtra = (g: string, base: string[]) => [...base, ...(extras[g] || []).filter(x => !base.includes(x))];
  const addExtra = (g: string, v: string) =>
    setExtras(e => (e[g]?.includes(v) ? e : { ...e, [g]: [...(e[g] || []), v] }));
  const text = (g: string, placeholder: string, pick: (v: string) => void): CustomEntry => ({
    placeholder,
    onAdd: v => { addExtra(g, v); pick(v); },
  });
  const [error, setError] = useState('');

  const [form, setForm] = useState<CampaignFormData>({
    name: '',
    type: 'Lead Generation',
    description: '',
    primaryGoal: 'Generate Leads',
    measurableGoals: [TARGETS['Generate Leads'][0]],
    ageRange: '25–45',
    location: 'Global',
    industry: 'Technology & SaaS',
    interests: '',
    occupation: '',
    audienceType: 'Business decision makers',
    audienceDescription: '',
    budgetType: 'total',
    budgetAmount: '5,000',
    resources: [],
    startDate: '',
    endDate: '',
    milestones: [],
    channels: ['LinkedIn', 'Email'],
    autoRecommendChannels: false,
    brandVoice: 'Professional',
    visualStyle: 'Modern',
    additionalInstructions: '',
    offer: 'No offer',
  });
  const set = (patch: Partial<CampaignFormData>) => setForm(prev => ({ ...prev, ...patch }));
  const toggle = (key: 'channels' | 'measurableGoals', v: string) =>
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(v) ? prev[key].filter(x => x !== v) : [...prev[key], v],
    }));

  const fmtShort = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const startCustomLabel = customStart ? fmtShort(customStart) : '';
  const durCustomLabel = customDays ? `${customDays} days` : '';
  const durDays = durationId === 'custom' ? customDays : DURATIONS.find(d => d.id === durationId)!.days;
  const durLabel = durationId === 'custom' ? durCustomLabel : DURATIONS.find(d => d.id === durationId)!.label;
  const startDate = startId === 'custom' ? customStart : iso(START_OPTIONS.find(s => s.id === startId)!.days);
  const endDate = (() => {
    const d = new Date(`${startDate}T00:00:00`);
    d.setDate(d.getDate() + durDays);
    return d.toISOString().slice(0, 10);
  })();

  useEffect(() => {
    if (!isGenerating) return;
    const last = loadingStepIndex >= LOADING_STEPS.length - 1;
    const timer = setTimeout(() => {
      if (!last) {
        setLoadingStepIndex(i => i + 1);
        return;
      }
      const data: CampaignFormData = {
        ...form,
        startDate,
        endDate,
        description: form.description || `${form.type} campaign for ${form.audienceType.toLowerCase()} in ${form.industry}.`,
      };
      const blueprint = generateBlueprintFromForm(data);
      const campaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: data.name.trim(),
        objective: data.primaryGoal,
        channel: data.channels.join(', ') || 'Multichannel',
        status: 'Planning',
        impressions: '0',
        leads: 0,
        conversion: '0.0%',
        budget: data.budgetType === 'none' ? 'Discretionary' : `$${data.budgetAmount}`,
        startDate,
        endDate,
        progress: 5,
        owner: 'You',
        blueprint,
      };
      setIsGenerating(false);
      onBlueprintGenerated(campaign, blueprint);
    }, last ? 900 : 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating, loadingStepIndex]);

  const next = () => {
    if (step === 1 && !form.name.trim()) {
      setError('Give your campaign a name to continue.');
      return;
    }
    if (step === 4 && form.channels.length === 0) {
      setError('Pick at least one channel.');
      return;
    }
    setError('');
    if (step < 4) setStep(step + 1);
    else {
      setLoadingStepIndex(0);
      setIsGenerating(true);
    }
  };

  if (isGenerating) {
    return (
      <div className="py-24 max-w-xl mx-auto text-center animate-fadeIn">
        <div className="eyebrow">Nexora campaign strategist</div>
        <h2 className="font-display text-[26px] font-semibold text-ink mt-3 mb-5">{LOADING_STEPS[loadingStepIndex]}</h2>
        <div className="nx-progress max-w-[220px] mx-auto">
          <div style={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fadeIn">
      <PageHeader
        eyebrow={`New campaign · Step ${step} of 4`}
        title="Create a campaign"
        subtitle="Choose from the options — Nexora builds the plan."
        actions={
          <button type="button" className="nx-btn" onClick={onBack}>
            ← Back to campaigns
          </button>
        }
      />

      <ol className="flex items-center gap-0 mb-[22px] p-0 list-none flex-wrap">
        {STEP_TITLES.map((t, i) => {
          const n = i + 1;
          const done = step > n;
          const cur = step === n;
          return (
            <li key={t} className="flex items-center">
              <button
                type="button"
                onClick={() => (n < step || form.name.trim() ? setStep(n) : next())}
                className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 min-h-0!"
              >
                <span
                  className={`w-[26px] h-[26px] rounded-full grid place-items-center text-[12px] font-bold border ${
                    cur ? 'bg-brand text-white border-brand' : done ? 'bg-brand-soft text-brand border-brand-soft' : 'bg-surface text-ink-3 border-line'
                  }`}
                >
                  {done ? '✓' : n}
                </span>
                <span className={`text-[13px] font-semibold ${cur ? 'text-ink' : 'text-ink-3'}`}>{t}</span>
              </button>
              {n < STEP_TITLES.length && <span className="w-8 h-px bg-line mx-3" />}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-[16px] lg:grid-cols-[minmax(0,1fr)_300px] items-start">
      <section className="nx-panel nx-pad">
        {step === 1 && (
          <>
            <Group label="Campaign name">
              <input
                value={form.name}
                onChange={e => set({ name: e.target.value })}
                placeholder="e.g. Autumn launch"
                autoFocus
              />
            </Group>
            <Group label="Type of campaign">
              <Options
                options={withExtra('type', TYPES)}
                isOn={o => form.type === o}
                onPick={o => set({ type: o })}
                custom={text('type', 'Type of campaign', o => set({ type: o }))}
              />
            </Group>
            <Group label="Main goal">
              <Options
                options={withExtra('goal', GOALS)}
                isOn={o => form.primaryGoal === o}
                onPick={o => set({ primaryGoal: o, measurableGoals: TARGETS[o] ? [TARGETS[o][0]] : [] })}
                custom={text('goal', 'Your goal', o => set({ primaryGoal: o, measurableGoals: [] }))}
              />
            </Group>
            <Group label="Offer" hint="what customers get">
              <Options
                options={withExtra('offer', OFFERS)}
                isOn={o => form.offer === o}
                onPick={o => set({ offer: o })}
                custom={text('offer', 'e.g. 10% off the first order', o => set({ offer: o }))}
              />
            </Group>
            <Group label="Targets" hint="pick any">
              <Options
                options={withExtra('targets', TARGETS[form.primaryGoal] || DEFAULT_TARGETS)}
                isOn={o => form.measurableGoals.includes(o)}
                onPick={o => toggle('measurableGoals', o)}
                custom={text('targets', 'e.g. 200 demo bookings', o =>
                  setForm(prev => (prev.measurableGoals.includes(o) ? prev : { ...prev, measurableGoals: [...prev.measurableGoals, o] })),
                )}
              />
            </Group>
          </>
        )}

        {step === 2 && (
          <>
            <Group label="Who are you reaching?">
              <Options
                options={withExtra('audience', AUDIENCES)}
                isOn={o => form.audienceType === o}
                onPick={o => set({ audienceType: o })}
                custom={text('audience', 'Your audience', o => set({ audienceType: o }))}
              />
            </Group>
            <Group label="Age range">
              <Options
                options={withExtra('age', AGES)}
                isOn={o => form.ageRange === o}
                onPick={o => set({ ageRange: o })}
                custom={text('age', 'e.g. 30–40', o => set({ ageRange: o }))}
              />
            </Group>
            <Group label="Location">
              <Options
                options={withExtra('location', LOCATIONS)}
                isOn={o => form.location === o}
                onPick={o => set({ location: o })}
                custom={text('location', 'e.g. Mumbai', o => set({ location: o }))}
              />
            </Group>
            <Group label="Industry">
              <Options
                options={withExtra('industry', INDUSTRIES)}
                isOn={o => form.industry === o}
                onPick={o => set({ industry: o })}
                custom={text('industry', 'Your industry', o => set({ industry: o }))}
              />
            </Group>
          </>
        )}

        {step === 3 && (
          <>
            <Group label="Budget">
              <Options
                options={withExtra('budget', BUDGETS.map(b => b.label))}
                isOn={o => budgetLabel === o}
                onPick={o => {
                  const known = BUDGETS.find(x => x.label === o);
                  setBudgetLabel(o);
                  set(known ? { budgetType: known.type, budgetAmount: known.amount } : { budgetType: 'total', budgetAmount: o.replace(/[^0-9,]/g, '') });
                }}
                custom={{
                  placeholder: 'Amount in $',
                  type: 'number',
                  parse: raw => {
                    const n = Math.round(Number(raw));
                    return n > 0 ? `$${n.toLocaleString('en-US')}` : '!Enter an amount above 0.';
                  },
                  onAdd: label => {
                    addExtra('budget', label);
                    setBudgetLabel(label);
                    set({ budgetType: 'total', budgetAmount: label.replace(/[^0-9,]/g, '') });
                  },
                }}
              />
            </Group>
            <Group label="Starts">
              <Options
                options={[...START_OPTIONS.map(s => s.label), ...(startCustomLabel ? [startCustomLabel] : [])]}
                isOn={o => (startId === 'custom' ? o === startCustomLabel : START_OPTIONS.find(s => s.id === startId)!.label === o)}
                onPick={o => (o === startCustomLabel ? setStartId('custom') : setStartId(START_OPTIONS.find(s => s.label === o)!.id))}
                custom={{
                  placeholder: 'Pick a start date',
                  type: 'date',
                  min: iso(0),
                  parse: raw => (raw < iso(0) ? '!Choose today or a later date.' : raw),
                  onAdd: d => { setCustomStart(d); setStartId('custom'); },
                }}
              />
            </Group>
            <Group label="Runs for">
              <Options
                options={[...DURATIONS.map(d => d.label), ...(durCustomLabel ? [durCustomLabel] : [])]}
                isOn={o => (durationId === 'custom' ? o === durCustomLabel : DURATIONS.find(d => d.id === durationId)!.label === o)}
                onPick={o => (o === durCustomLabel ? setDurationId('custom') : setDurationId(DURATIONS.find(d => d.label === o)!.id))}
                custom={{
                  placeholder: 'Number of days',
                  type: 'number',
                  parse: raw => {
                    const n = Math.round(Number(raw));
                    return n >= 1 && n <= 365 ? String(n) : '!Enter 1 to 365 days.';
                  },
                  onAdd: n => { setCustomDays(Number(n)); setDurationId('custom'); },
                }}
              />
            </Group>
            <div className="nx-callout">
              {startDate} → {endDate}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <Group label="Channels" hint="pick any">
              <Options
                options={withExtra('channels', CHANNELS)}
                isOn={o => form.channels.includes(o)}
                onPick={o => toggle('channels', o)}
                custom={text('channels', 'e.g. WhatsApp', o =>
                  setForm(prev => (prev.channels.includes(o) ? prev : { ...prev, channels: [...prev.channels, o] })),
                )}
              />
            </Group>
            <Group label="Brand voice">
              <Options
                options={withExtra('voice', VOICES)}
                isOn={o => form.brandVoice === o}
                onPick={o => set({ brandVoice: o })}
                custom={text('voice', 'e.g. Reassuring', o => set({ brandVoice: o }))}
              />
            </Group>
            <Group label="Visual style">
              <Options
                options={withExtra('style', STYLES)}
                isOn={o => form.visualStyle === o}
                onPick={o => set({ visualStyle: o })}
                custom={text('style', 'e.g. Warm and natural', o => set({ visualStyle: o }))}
              />
            </Group>
          </>
        )}

        {error && <p className="text-[13px] text-danger m-0 mb-3">{error}</p>}

        <div className="flex justify-between gap-2 pt-2">
          <button type="button" className="nx-btn" disabled={step === 1} onClick={() => setStep(step - 1)}>
            Back
          </button>
          <button type="button" className="nx-btn primary" onClick={next}>
            {step === 4 ? 'Generate plan →' : 'Continue →'}
          </button>
        </div>
      </section>

        <aside className="nx-panel nx-pad lg:sticky lg:top-[88px]">
          <div className="eyebrow mb-1">Your campaign</div>
          <h3 className="font-display text-[18px] font-semibold text-ink m-0 mb-3 tracking-[-0.4px]">
            {form.name.trim() || 'Untitled campaign'}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="nx-tag teal">{form.type}</span>
            <span className="nx-tag">{form.primaryGoal}</span>
          </div>
          <div className="nx-split" />
          <div className="nx-kv"><span>Offer</span><strong className="text-ink text-[13px] text-right">{form.offer}</strong></div>
          <div className="nx-kv"><span>Audience</span><strong className="text-ink text-[13px] text-right">{form.audienceType}</strong></div>
          <div className="nx-kv"><span>Reach</span><strong className="text-ink text-[13px] text-right">{form.location}, {form.ageRange}</strong></div>
          <div className="nx-kv"><span>Budget</span><strong className="text-ink text-[13px]">{budgetLabel}</strong></div>
          <div className="nx-kv"><span>Runs</span><strong className="text-ink text-[13px]">{durLabel}</strong></div>
          <div className="nx-kv"><span>Channels</span><strong className="text-ink text-[13px] text-right">{form.channels.join(', ') || '—'}</strong></div>
          <div className="nx-kv"><span>Tone</span><strong className="text-ink text-[13px]">{form.brandVoice} · {form.visualStyle}</strong></div>
        </aside>
      </div>
    </div>
  );
}
