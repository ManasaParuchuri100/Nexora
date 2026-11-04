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

function Options({
  options,
  isOn,
  onPick,
}: {
  options: string[];
  isOn: (o: string) => boolean;
  onPick: (o: string) => void;
}) {
  return (
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
  });
  const set = (patch: Partial<CampaignFormData>) => setForm(prev => ({ ...prev, ...patch }));
  const toggle = (key: 'channels' | 'measurableGoals', v: string) =>
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(v) ? prev[key].filter(x => x !== v) : [...prev[key], v],
    }));

  const startDays = START_OPTIONS.find(s => s.id === startId)!.days;
  const durDays = DURATIONS.find(d => d.id === durationId)!.days;
  const startDate = iso(startDays);
  const endDate = iso(startDays + durDays);

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
        <h2 className="font-display text-[26px] font-bold text-ink mt-3 mb-5">{LOADING_STEPS[loadingStepIndex]}</h2>
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

      <div className="flex gap-2 mb-[15px] flex-wrap">
        {STEP_TITLES.map((t, i) => (
          <button
            key={t}
            type="button"
            className={`nx-tab ${step === i + 1 ? 'active' : ''}`}
            onClick={() => (i + 1 < step || form.name.trim() ? setStep(i + 1) : next())}
          >
            {i + 1}. {t}
          </button>
        ))}
      </div>

      <section className="nx-panel nx-pad max-w-[760px]">
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
              <Options options={TYPES} isOn={o => form.type === o} onPick={o => set({ type: o })} />
            </Group>
            <Group label="Main goal">
              <Options
                options={GOALS}
                isOn={o => form.primaryGoal === o}
                onPick={o => set({ primaryGoal: o, measurableGoals: [TARGETS[o][0]] })}
              />
            </Group>
            <Group label="Targets" hint="pick any">
              <Options
                options={TARGETS[form.primaryGoal] || []}
                isOn={o => form.measurableGoals.includes(o)}
                onPick={o => toggle('measurableGoals', o)}
              />
            </Group>
          </>
        )}

        {step === 2 && (
          <>
            <Group label="Who are you reaching?">
              <Options options={AUDIENCES} isOn={o => form.audienceType === o} onPick={o => set({ audienceType: o })} />
            </Group>
            <Group label="Age range">
              <Options options={AGES} isOn={o => form.ageRange === o} onPick={o => set({ ageRange: o })} />
            </Group>
            <Group label="Location">
              <Options options={LOCATIONS} isOn={o => form.location === o} onPick={o => set({ location: o })} />
            </Group>
            <Group label="Industry">
              <Options options={INDUSTRIES} isOn={o => form.industry === o} onPick={o => set({ industry: o })} />
            </Group>
          </>
        )}

        {step === 3 && (
          <>
            <Group label="Budget">
              <Options
                options={BUDGETS.map(b => b.label)}
                isOn={o => budgetLabel === o}
                onPick={o => {
                  const b = BUDGETS.find(x => x.label === o)!;
                  setBudgetLabel(o);
                  set({ budgetType: b.type, budgetAmount: b.amount });
                }}
              />
            </Group>
            <Group label="Starts">
              <Options
                options={START_OPTIONS.map(s => s.label)}
                isOn={o => START_OPTIONS.find(s => s.id === startId)!.label === o}
                onPick={o => setStartId(START_OPTIONS.find(s => s.label === o)!.id)}
              />
            </Group>
            <Group label="Runs for">
              <Options
                options={DURATIONS.map(d => d.label)}
                isOn={o => DURATIONS.find(d => d.id === durationId)!.label === o}
                onPick={o => setDurationId(DURATIONS.find(d => d.label === o)!.id)}
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
              <Options options={CHANNELS} isOn={o => form.channels.includes(o)} onPick={o => toggle('channels', o)} />
            </Group>
            <Group label="Brand voice">
              <Options options={VOICES} isOn={o => form.brandVoice === o} onPick={o => set({ brandVoice: o })} />
            </Group>
            <Group label="Visual style">
              <Options options={STYLES} isOn={o => form.visualStyle === o} onPick={o => set({ visualStyle: o })} />
            </Group>
          </>
        )}

        {error && <p className="text-[12px] text-danger m-0 mb-3">{error}</p>}

        <div className="flex justify-between gap-2 pt-2">
          <button type="button" className="nx-btn" disabled={step === 1} onClick={() => setStep(step - 1)}>
            Back
          </button>
          <button type="button" className="nx-btn primary" onClick={next}>
            {step === 4 ? 'Generate plan →' : 'Continue →'}
          </button>
        </div>
      </section>
    </div>
  );
}
