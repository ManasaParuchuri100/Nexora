import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { Input } from './ui';
import { BRAND_COMPANY, BRAND_NAME, BRAND_TAGLINE } from '../config/brand';
import { readSaved, writeSaved } from './app/settings/store';
import { SAMPLE_BUSINESS, SAMPLE_CHANNELS, SAMPLE_FAQ, markAiTested, setActivated } from '../data/setup';

export interface OnboardingData {
  name: string;
  email: string;
  password?: string;
  businessName: string;
  website: string;
  industry: string;
  location: string;
  whatYouSell: string;
  companyDocuments?: { id: string; name: string; size: string }[];
  connectedChannels: {
    whatsapp: boolean;
    instagram: boolean;
    facebook: boolean;
    webchat?: boolean;
    email: boolean;
  };
  aiTone: 'Professional' | 'Friendly' | 'Premium' | 'Conversational';
  faqs: { id: string; question: string; answer: string }[];
  handoffRules: {
    customerAsksPerson: boolean;
    aiNotSure: boolean;
    dealValueAbove: boolean;
    dealValueThreshold: string;
  };
}

interface OnboardingFlowProps {
  isOpen: boolean;
  initialStep?: 'signup' | 'business' | 'channels' | 'ai-basics';
  onClose: () => void;
  onOpenLogin: () => void;
  onComplete: (data: OnboardingData) => void;
  /** "signup" starts with creating an account. "setup" is used inside the app and skips it. */
  mode?: 'signup' | 'setup';
  userName?: string;
  userEmail?: string;
  /** In setup mode, fill the sample business details when nothing has been saved yet. */
  prefillSample?: boolean;
}

type Step = 'account' | 'business' | 'knowledge' | 'channels' | 'test' | 'activate';
const STEPS: Array<{ id: Step; label: string }> = [
  { id: 'account', label: 'Account' },
  { id: 'business', label: 'Business' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'channels', label: 'Channels' },
  { id: 'test', label: 'Test the AI' },
  { id: 'activate', label: 'Activate' },
];

const INDUSTRIES = ['Interior design', 'Real estate', 'Education', 'Healthcare', 'Retail', 'Professional services'];
const TONES: OnboardingData['aiTone'][] = ['Professional', 'Friendly', 'Premium', 'Conversational'];
const CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp', placeholder: '+91 98765 43210' },
  { id: 'instagram', name: 'Instagram', placeholder: '@yourbusiness' },
  { id: 'facebook', name: 'Facebook', placeholder: 'Page name' },
  { id: 'email', name: 'Email', placeholder: 'hello@yourbusiness.com' },
  { id: 'webchat', name: 'Website chat', placeholder: 'yourbusiness.com' },
] as const;

interface Faq { id: string; question: string; answer: string; status: 'draft' | 'approved' }

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3);

const CHANNEL_ID_BY_NAME: Record<string, string> = { WhatsApp: 'whatsapp', Instagram: 'instagram', Facebook: 'facebook', Email: 'email' };

export default function OnboardingFlow({ isOpen, onClose, onOpenLogin, onComplete, mode = 'signup', userName = '', userEmail = '', prefillSample = false }: OnboardingFlowProps) {
  const setup = mode === 'setup';
  const steps = setup ? STEPS.slice(1) : STEPS;
  // In setup mode, start from what is already saved so nothing is lost.
  const saved = React.useMemo(() => {
    if (!setup) return {};
    const stored = readSaved<{ businessName: string; website: string; industry: string; location: string; whatYouSell: string; workingHours: string; toneOfVoice: string }>('nexora_settings_v1');
    return stored.businessName ? stored : prefillSample ? { ...SAMPLE_BUSINESS } : {};
  }, [setup, prefillSample]);
  const [step, setStep] = useState<Step>(setup ? 'business' : 'account');

  // Account
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [accountErr, setAccountErr] = useState<{ name?: string; email?: string; password?: string }>({});
  const [creating, setCreating] = useState(false);

  // Business
  const savedIndustry = (saved as { industry?: string }).industry ?? '';
  const knownIndustry = [...INDUSTRIES].includes(savedIndustry);
  const [businessName, setBusinessName] = useState((saved as { businessName?: string }).businessName ?? '');
  const [website, setWebsite] = useState((saved as { website?: string }).website ?? '');
  const [industry, setIndustry] = useState(savedIndustry ? (knownIndustry ? savedIndustry : 'Other') : '');
  const [customIndustry, setCustomIndustry] = useState(savedIndustry && !knownIndustry ? savedIndustry : '');
  const [location, setLocation] = useState((saved as { location?: string }).location ?? '');
  const [whatYouSell, setWhatYouSell] = useState((saved as { whatYouSell?: string }).whatYouSell ?? '');
  const [workingHours, setWorkingHours] = useState((saved as { workingHours?: string }).workingHours ?? 'Mon–Sat 10:00–19:00');
  const [bizTried, setBizTried] = useState(false);

  // Knowledge
  const [faqs, setFaqs] = useState<Faq[]>(() => {
    if (!setup) return [];
    try {
      const raw = localStorage.getItem('nexora_knowledge_v1');
      const list = raw ? (JSON.parse(raw) as Array<{ id: string; question: string; answer: string }>) : prefillSample ? [SAMPLE_FAQ] : [];
      return list.map(f => ({ ...f, status: 'approved' as const }));
    } catch { return []; }
  });
  const [tone, setTone] = useState<OnboardingData['aiTone']>(((saved as { toneOfVoice?: string }).toneOfVoice as OnboardingData['aiTone']) ?? 'Friendly');
  const [drafting, setDrafting] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [handoff, setHandoff] = useState({ customerAsksPerson: true, aiNotSure: true, dealValueAbove: true, dealValueThreshold: '50000' });

  // Channels
  const [channels, setChannels] = useState<Record<string, string>>(() => {
    if (!setup) return {};
    try {
      const raw = localStorage.getItem('nexora_channels_v1');
      if (!raw && prefillSample) return { ...SAMPLE_CHANNELS };
      const list = raw ? (JSON.parse(raw) as Array<{ name: string; handle: string; status: string }>) : [];
      return Object.fromEntries(list.filter(c => c.status === 'Connected' && CHANNEL_ID_BY_NAME[c.name]).map(c => [CHANNEL_ID_BY_NAME[c.name], c.handle]));
    } catch { return {}; }
  });
  const [openChannel, setOpenChannel] = useState<string | null>(null);
  const [channelInput, setChannelInput] = useState('');

  // Test
  const [question, setQuestion] = useState('');
  const [tests, setTests] = useState<Array<{ q: string; a: string; source: string | null }>>([]);

  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => { topRef.current?.scrollIntoView({ block: 'start' }); }, [step]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const industryValue = industry === 'Other' ? customIndustry.trim() : industry;
  const businessDone = !!(businessName.trim() && industryValue && location.trim() && whatYouSell.trim());
  const approved = faqs.filter(f => f.status === 'approved');
  const pending = faqs.filter(f => f.status === 'draft');
  const knowledgeDone = approved.length >= 1 && pending.length === 0;
  const channelsDone = Object.keys(channels).length >= 1;
  const testedDone = tests.length >= 1;
  const readiness = [
    { id: 'business', label: 'Business information complete', done: businessDone },
    { id: 'knowledge', label: 'Knowledge verified', done: knowledgeDone },
    { id: 'channels', label: 'Channel connected', done: channelsDone },
    { id: 'test', label: 'AI tested', done: testedDone },
    { id: 'ready', label: 'Ready to activate', done: businessDone && knowledgeDone && channelsDone && testedDone },
  ];
  const doneCount = readiness.filter(r => r.done).length;
  const stepIdx = steps.findIndex(s => s.id === step);

  const go = (id: Step) => setStep(id);
  const next = () => setStep(steps[Math.min(steps.length - 1, stepIdx + 1)].id);
  const back = () => setStep(steps[Math.max(0, stepIdx - 1)].id);

  /* ---- actions ---- */
  const createAccount = () => {
    const err: typeof accountErr = {};
    if (!name.trim()) err.name = 'Enter your name.';
    if (!emailOk(email)) err.email = 'Enter a valid work email.';
    if (password.length < 8) err.password = 'Use at least 8 characters.';
    setAccountErr(err);
    if (Object.keys(err).length) return;
    setCreating(true);
    window.setTimeout(() => { setCreating(false); next(); }, 700);
  };

  const draftFaqs = () => {
    if (!businessDone) return;
    setDrafting(true);
    window.setTimeout(() => {
      const biz = businessName.trim();
      const stamp = Date.now();
      const drafts: Faq[] = [
        { id: `f${stamp}1`, question: `What does ${biz} do?`, answer: `${biz} offers ${whatYouSell.trim().replace(/[.…]+$/, '')}.`, status: 'draft' },
        { id: `f${stamp}2`, question: 'Where are you located?', answer: `We are based in ${location.trim()}.`, status: 'draft' },
        { id: `f${stamp}3`, question: 'What are your working hours?', answer: `Our team is available ${workingHours.trim()}.`, status: 'draft' },
      ];
      setFaqs(prev => [...prev, ...drafts.filter(d => !prev.some(p => p.question === d.question))]);
      setDrafting(false);
    }, 900);
  };

  const addFaq = () => {
    if (!newQ.trim() || !newA.trim()) return;
    setFaqs(prev => [...prev, { id: `f${Date.now()}`, question: newQ.trim(), answer: newA.trim(), status: 'approved' }]);
    setNewQ(''); setNewA('');
  };

  const connect = (id: string) => {
    if (!channelInput.trim()) return;
    setChannels(prev => ({ ...prev, [id]: channelInput.trim() }));
    setOpenChannel(null); setChannelInput('');
  };

  const ask = (q: string) => {
    if (!q.trim()) return;
    markAiTested();
    const qt = tokens(q);
    let best: Faq | null = null; let bestScore = 0;
    approved.forEach(f => {
      const ft = tokens(`${f.question} ${f.answer}`);
      const score = qt.filter(t => ft.includes(t)).length;
      if (score > bestScore) { best = f; bestScore = score; }
    });
    const hit = bestScore >= 1 ? (best as Faq | null) : null;
    setTests(prev => [{
      q: q.trim(),
      a: hit ? hit.answer : `I am not sure about that, so I would hand this conversation to a person${handoff.aiNotSure ? '' : ' (this handoff rule is off, so I would keep answering carefully)'}.`,
      source: hit ? hit.question : null,
    }, ...prev]);
    setQuestion('');
  };

  const activate = () => {
    writeSaved('nexora_settings_v1', { businessName: businessName.trim(), website: website.trim(), industry: industryValue, location: location.trim(), whatYouSell: whatYouSell.trim(), workingHours, outsideHoursPolicy: 'ai', toneOfVoice: tone });
    try {
      localStorage.setItem('nexora_knowledge_v1', JSON.stringify(approved.map(f => ({ id: f.id, question: f.question, answer: f.answer }))));
      const known = ['WhatsApp', 'Instagram', 'Facebook', 'LinkedIn', 'Email'];
      const list = known.map(n => {
        const id = CHANNELS.find(c => c.name === n)?.id;
        const handle = id ? channels[id] : undefined;
        return { name: n, handle: handle ?? 'Not connected', status: handle ? 'Connected' : 'Disconnected', owner: handle ? name.trim() : '—', lastSync: handle ? 'Just now' : '—', placeholder: CHANNELS.find(c => c.name === n)?.placeholder ?? '' };
      });
      localStorage.setItem('nexora_channels_v1', JSON.stringify(list));
      if (!setup) localStorage.setItem('nexora_team_v1', JSON.stringify([{ id: 't1', name: name.trim(), email: email.trim().toLowerCase(), role: 'Owner' }]));
    } catch { /* storage unavailable */ }
    setActivated(true);
    onComplete({
      name: name.trim(), email: email.trim().toLowerCase(), password,
      businessName: businessName.trim(), website: website.trim(), industry: industryValue, location: location.trim(), whatYouSell: whatYouSell.trim(),
      connectedChannels: { whatsapp: !!channels.whatsapp, instagram: !!channels.instagram, facebook: !!channels.facebook, webchat: !!channels.webchat, email: !!channels.email },
      aiTone: tone,
      faqs: approved.map(f => ({ id: f.id, question: f.question, answer: f.answer })),
      handoffRules: handoff,
    });
  };

  const suggestions = useMemo(() => [...approved.slice(0, 2).map(f => f.question), 'Do you offer discounts?'], [approved]);

  if (!isOpen) return null;

  const Nav = ({ canNext, nextLabel = 'Continue', onNext }: { canNext: boolean; nextLabel?: string; onNext?: () => void }) => (
    <div className="flex justify-between gap-2 pt-4 mt-2 border-t border-line">
      <button type="button" className="nx-btn" onClick={back} disabled={stepIdx === 0}>Back</button>
      <button type="button" className="nx-btn primary" onClick={onNext ?? next} disabled={!canNext}>{nextLabel} →</button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-canvas text-ink font-sans" role="dialog" aria-modal="true" aria-label="Set up your workspace">
      <div ref={topRef} />
      <header className="max-w-[1080px] mx-auto px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-extrabold tracking-[3px] text-brand uppercase">{BRAND_COMPANY}</span>
          <span className="font-display text-[22px] font-extrabold tracking-[-1px] uppercase mt-1">{BRAND_NAME}<span className="text-brand">.</span></span>
          <span className="text-[10px] tracking-[2px] text-ink-3 uppercase mt-0.5">{BRAND_TAGLINE}</span>
        </div>
        <div className="flex items-center gap-3">
          {!setup && <button type="button" className="nx-inline-link" onClick={onOpenLogin}>Already have an account? Log in</button>}
          <button type="button" className="nx-iconbtn" onClick={onClose} aria-label="Close setup"><X className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="max-w-[1080px] mx-auto px-5 pb-16 grid gap-[16px] lg:grid-cols-[minmax(0,1fr)_300px] items-start">
        <main>
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 mb-[18px] p-0 list-none" aria-label="Setup steps">
            {steps.map((s, i) => (
              <li key={s.id} className="flex items-center">
                <span className={`w-[24px] h-[24px] rounded-full grid place-items-center text-[12px] font-bold border mr-2 ${i === stepIdx ? 'bg-brand text-on-brand border-brand' : i < stepIdx ? 'bg-brand-soft text-brand border-brand-soft' : 'bg-surface text-ink-3 border-line'}`}>{i < stepIdx ? '✓' : i + 1}</span>
                <span className={`text-[13px] font-semibold ${i === stepIdx ? 'text-ink' : 'text-ink-3'}`}>{s.label}</span>
                {i < steps.length - 1 && <span className="w-5 h-px bg-line mx-2" />}
              </li>
            ))}
          </ol>

          <section className="nx-panel nx-pad">
            {/* ---------- Account ---------- */}
            {step === 'account' && (
              <>
                <div className="nx-sectionhead"><div><h1 className="font-display text-[22px] font-semibold m-0">Create your private workspace</h1><p>This is a workspace for your business, not just a chatbot. Only your team can see it.</p></div></div>
                <Input label="Your name" value={name} onChange={e => { setName(e.target.value); setAccountErr(a => ({ ...a, name: undefined })); }} error={accountErr.name} autoComplete="name" />
                <Input label="Work email" type="email" value={email} onChange={e => { setEmail(e.target.value); setAccountErr(a => ({ ...a, email: undefined })); }} error={accountErr.email} autoComplete="email" />
                <div className="nx-field">
                  <label htmlFor="ob-pw">Password</label>
                  <div className="relative">
                    <input id="ob-pw" type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setAccountErr(a => ({ ...a, password: undefined })); }} autoComplete="new-password" aria-invalid={accountErr.password ? true : undefined} onKeyDown={e => e.key === 'Enter' && createAccount()} />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 min-h-0! text-ink-3 hover:text-ink" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  {accountErr.password ? <div role="alert" className="text-[12px] text-danger mt-1.5">{accountErr.password}</div> : <div className="text-[12px] text-ink-3 mt-1.5">At least 8 characters.</div>}
                </div>
                <button type="button" className="nx-btn primary w-full justify-center" onClick={createAccount} disabled={creating}>
                  {creating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating workspace…</> : 'Create account'}
                </button>
                <p className="text-[12px] text-ink-3 mt-3 mb-0">Demo: no account is created on a server. We confirm your email in a real product.</p>
              </>
            )}

            {/* ---------- Business ---------- */}
            {step === 'business' && (
              <>
                <div className="nx-sectionhead"><div><h1 className="font-display text-[20px] font-semibold m-0">Tell us about your business</h1><p>Nexora uses this to answer customers correctly.</p></div></div>
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <Input label="Business name" value={businessName} onChange={e => setBusinessName(e.target.value)} error={bizTried && !businessName.trim() ? 'Enter your business name.' : undefined} />
                  <Input label="Website" hint="Optional" value={website} onChange={e => setWebsite(e.target.value)} placeholder="yourbusiness.com" />
                </div>
                <div className="nx-field">
                  <label>Industry</label>
                  <div className="flex flex-wrap gap-[7px]">
                    {[...INDUSTRIES, 'Other'].map(i => <button key={i} type="button" aria-pressed={industry === i} className={`nx-chip ${industry === i ? 'active' : ''}`} onClick={() => setIndustry(i)}>{i}</button>)}
                  </div>
                  {industry === 'Other' && <input className="mt-2 max-w-[280px]" value={customIndustry} onChange={e => setCustomIndustry(e.target.value)} placeholder="Your industry" aria-label="Your industry" />}
                  {bizTried && !industryValue && <div role="alert" className="text-[12px] text-danger mt-1.5">Choose an industry.</div>}
                </div>
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <Input label="City" value={location} onChange={e => setLocation(e.target.value)} error={bizTried && !location.trim() ? 'Enter your city.' : undefined} />
                  <Input label="Working hours" value={workingHours} onChange={e => setWorkingHours(e.target.value)} />
                </div>
                <div className="nx-field">
                  <label htmlFor="ob-sell">What do you sell?</label>
                  <textarea id="ob-sell" rows={3} value={whatYouSell} onChange={e => setWhatYouSell(e.target.value)} placeholder="e.g. residential and office interiors" />
                  {bizTried && !whatYouSell.trim() && <div role="alert" className="text-[12px] text-danger mt-1.5">Describe what you sell.</div>}
                </div>
                <Nav canNext onNext={() => { setBizTried(true); if (businessDone) next(); }} />
              </>
            )}

            {/* ---------- Knowledge ---------- */}
            {step === 'knowledge' && (
              <>
                <div className="nx-sectionhead"><div><h1 className="font-display text-[20px] font-semibold m-0">Teach the AI what it may say</h1><p>The AI only answers from knowledge you approve. Drafts are never used until you approve them.</p></div></div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <button type="button" className="nx-btn" onClick={draftFaqs} disabled={drafting}>{drafting ? 'Drafting…' : 'Draft answers from my business details'}</button>
                  <span className="text-[12px] text-ink-3">Check every draft. Prices and policies are never filled in for you.</span>
                </div>
                <div className="border-t border-line">
                  {faqs.length === 0 && <p className="text-[13px] text-ink-3 py-5 m-0">No knowledge yet. Draft answers above or add your own below.</p>}
                  {faqs.map(f => (
                    <div key={f.id} className="py-3 border-b border-line">
                      {editing === f.id ? (
                        <div className="grid gap-2">
                          <input value={f.question} aria-label="Question" onChange={e => setFaqs(p => p.map(x => (x.id === f.id ? { ...x, question: e.target.value } : x)))} />
                          <textarea rows={2} value={f.answer} aria-label="Answer" onChange={e => setFaqs(p => p.map(x => (x.id === f.id ? { ...x, answer: e.target.value } : x)))} />
                          <div><button type="button" className="nx-btn sm primary" onClick={() => setEditing(null)}>Done</button></div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <strong className="text-[14px] text-ink block">{f.question}</strong>
                            <p className="text-[13px] text-ink-2 m-0 mt-0.5 leading-[1.55]">{f.answer}</p>
                          </div>
                          <span className={`nx-tag ${f.status === 'approved' ? 'green' : 'amber'}`}>{f.status === 'approved' ? 'Approved' : 'Needs review'}</span>
                          <div className="flex gap-1.5 shrink-0">
                            {f.status === 'draft' && <button type="button" className="nx-btn sm primary" onClick={() => setFaqs(p => p.map(x => (x.id === f.id ? { ...x, status: 'approved' } : x)))}>Approve</button>}
                            <button type="button" className="nx-btn sm" onClick={() => setEditing(f.id)}>Edit</button>
                            <button type="button" className="nx-btn sm" onClick={() => setFaqs(p => p.filter(x => x.id !== f.id))} aria-label={`Remove ${f.question}`}>Remove</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="nx-callout block! mt-4">
                  <div className="text-[13px] font-bold text-ink mb-2">Add your own answer</div>
                  <input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Question customers ask" aria-label="New question" className="mb-2 w-full" />
                  <textarea rows={2} value={newA} onChange={e => setNewA(e.target.value)} placeholder="The answer you approve" aria-label="New answer" className="mb-2 w-full" />
                  <button type="button" className="nx-btn sm" onClick={addFaq} disabled={!newQ.trim() || !newA.trim()}>Add as approved</button>
                </div>
                <div className="nx-field mt-4">
                  <label>Tone of voice</label>
                  <div className="flex flex-wrap gap-[7px]">{TONES.map(t => <button key={t} type="button" aria-pressed={tone === t} className={`nx-chip ${tone === t ? 'active' : ''}`} onClick={() => setTone(t)}>{t}</button>)}</div>
                </div>
                <div className="nx-field">
                  <label>Hand a conversation to a person when</label>
                  <label className="flex items-center gap-2 text-[13px] py-1"><input type="checkbox" checked={handoff.customerAsksPerson} onChange={e => setHandoff({ ...handoff, customerAsksPerson: e.target.checked })} /> the customer asks for a person</label>
                  <label className="flex items-center gap-2 text-[13px] py-1"><input type="checkbox" checked={handoff.aiNotSure} onChange={e => setHandoff({ ...handoff, aiNotSure: e.target.checked })} /> the AI is not sure of the answer</label>
                  <label className="flex items-center gap-2 text-[13px] py-1 flex-wrap"><input type="checkbox" checked={handoff.dealValueAbove} onChange={e => setHandoff({ ...handoff, dealValueAbove: e.target.checked })} /> the deal is worth more than ₹ <input type="number" min={0} value={handoff.dealValueThreshold} disabled={!handoff.dealValueAbove} onChange={e => setHandoff({ ...handoff, dealValueThreshold: e.target.value })} aria-label="Deal value" className="w-[120px]!" /></label>
                </div>
                {pending.length > 0 && <p className="text-[13px] text-warn m-0" role="status">{pending.length} draft{pending.length > 1 ? 's' : ''} still need review before the knowledge counts as verified.</p>}
                <Nav canNext />
              </>
            )}

            {/* ---------- Channels ---------- */}
            {step === 'channels' && (
              <>
                <div className="nx-sectionhead"><div><h1 className="font-display text-[20px] font-semibold m-0">Connect where customers reach you</h1><p>Start with one channel. WhatsApp is the most common first choice.</p></div></div>
                <div className="border-t border-line">
                  {CHANNELS.map(c => {
                    const handle = channels[c.id];
                    return (
                      <div key={c.id} className="nx-row flex-wrap">
                        <div className="flex-1 min-w-0"><strong>{c.name}</strong><p>{handle ?? 'Not connected'}</p></div>
                        {handle ? (
                          <>
                            <span className="nx-tag green">Connected</span>
                            <button type="button" className="nx-btn sm" onClick={() => setChannels(p => { const n = { ...p }; delete n[c.id]; return n; })}>Disconnect</button>
                          </>
                        ) : openChannel === c.id ? (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input autoFocus value={channelInput} onChange={e => setChannelInput(e.target.value)} placeholder={c.placeholder} aria-label={`${c.name} account`} onKeyDown={e => e.key === 'Enter' && connect(c.id)} className="sm:w-[220px]" />
                            <button type="button" className="nx-btn sm primary" onClick={() => connect(c.id)}>Connect</button>
                            <button type="button" className="nx-btn sm" onClick={() => { setOpenChannel(null); setChannelInput(''); }}>Cancel</button>
                          </div>
                        ) : (
                          <button type="button" className="nx-btn sm" onClick={() => { setOpenChannel(c.id); setChannelInput(''); }}>Connect</button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[12px] text-ink-3 mt-3 mb-0">Connections are simulated in this demo. A live channel needs authorization from the provider.</p>
                <Nav canNext />
              </>
            )}

            {/* ---------- Test ---------- */}
            {step === 'test' && (
              <>
                <div className="nx-sectionhead"><div><h1 className="font-display text-[20px] font-semibold m-0">Test the AI before customers do</h1><p>Ask a question. The answer comes only from the knowledge you approved.</p></div></div>
                {approved.length === 0 && <p className="text-[13px] text-warn mt-0" role="status">You have not approved any knowledge yet, so the AI will hand every question to a person.</p>}
                <div className="flex gap-2 mb-2">
                  <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask(question)} placeholder="Ask like a customer would" aria-label="Test question" className="flex-1" />
                  <button type="button" className="nx-btn primary" onClick={() => ask(question)} disabled={!question.trim()}>Ask</button>
                </div>
                <div className="flex flex-wrap gap-[7px] mb-3">
                  {suggestions.map(s => <button key={s} type="button" className="nx-chip" onClick={() => ask(s)}>{s}</button>)}
                </div>
                <div className="border-t border-line">
                  {tests.length === 0 && <p className="text-[13px] text-ink-3 py-5 m-0">Your test conversation appears here.</p>}
                  {tests.map((t, i) => (
                    <div key={i} className="py-3 border-b border-line">
                      <p className="text-[13px] font-bold text-ink m-0">Customer: {t.q}</p>
                      <p className="text-[13px] text-ink-2 m-0 mt-1 leading-[1.6]">AI: {t.a}</p>
                      <p className="text-[12px] text-ink-3 m-0 mt-1">{t.source ? `Answered from approved knowledge: “${t.source}”` : 'Not covered by approved knowledge. Handed to a person.'}</p>
                    </div>
                  ))}
                </div>
                <Nav canNext />
              </>
            )}

            {/* ---------- Activate ---------- */}
            {step === 'activate' && (
              <>
                <div className="nx-sectionhead"><div><h1 className="font-display text-[20px] font-semibold m-0">Review and activate</h1><p>Everything below must be done before the AI starts replying.</p></div></div>
                <div className="border-t border-line">
                  {readiness.slice(0, 4).map(r => (
                    <div key={r.id} className="nx-row">
                      <span className={`nx-alerticon ${r.done ? 'green' : 'amber'}`}>{r.done ? '✓' : '!'}</span>
                      <div className="flex-1"><strong>{r.label}</strong><p>{r.done ? 'Done' : 'Not done yet'}</p></div>
                      {!r.done && <button type="button" className="nx-btn sm" onClick={() => go(r.id === 'business' ? 'business' : r.id === 'knowledge' ? 'knowledge' : r.id === 'channels' ? 'channels' : 'test')}>Fix this</button>}
                    </div>
                  ))}
                </div>
                <div className="nx-callout block! mt-4 text-[13px] text-ink-2">
                  <strong className="text-ink">{businessName || 'Your business'}</strong> · {industryValue || '—'} · {location || '—'}<br />
                  {approved.length} approved answer{approved.length === 1 ? '' : 's'} · tone {tone.toLowerCase()} · {Object.keys(channels).length} channel{Object.keys(channels).length === 1 ? '' : 's'} connected
                </div>
                <div className="flex justify-between gap-2 pt-4 mt-4 border-t border-line">
                  <button type="button" className="nx-btn" onClick={back}>Back</button>
                  <button type="button" className="nx-btn primary" onClick={activate} disabled={!readiness[4].done}>Activate Nexora →</button>
                </div>
                {!readiness[4].done && <p className="text-[13px] text-ink-3 mt-2 mb-0" role="status">Finish the open items to activate.</p>}
              </>
            )}
          </section>
        </main>

        <aside className="nx-panel nx-pad lg:sticky lg:top-6" aria-label="Setup progress">
          <div className="eyebrow mb-1">Setup progress</div>
          <div className="font-display text-[24px] font-semibold tracking-[-0.6px] mb-2">{doneCount} of {readiness.length}</div>
          <div className="nx-progress mb-4"><div style={{ width: `${(doneCount / readiness.length) * 100}%` }} /></div>
          <ul className="m-0 p-0 list-none">
            {readiness.map(r => (
              <li key={r.id} className="flex items-center gap-2.5 py-2 border-t border-line first:border-t-0 text-[13px]">
                <span className={`w-[18px] h-[18px] rounded-full grid place-items-center shrink-0 ${r.done ? 'bg-ok text-white' : 'bg-surface-raised text-ink-3 border border-line'}`}>{r.done ? <Check className="w-3 h-3" /> : null}</span>
                <span className={r.done ? 'text-ink' : 'text-ink-3'}>{r.label}</span>
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-ink-3 mt-3 mb-0">The AI is not active until every step is done.</p>
        </aside>
      </div>
    </div>
  );
}
