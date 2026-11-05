import { CategoryType } from '../types';

export type ContentKind = 'social' | 'email' | 'ad' | 'article' | 'video';

export interface KindMeta {
  id: ContentKind;
  label: string;
  hint: string;
  assetType: CategoryType;
  channels: string[];
  schedulable: boolean;
}

export const KINDS: KindMeta[] = [
  { id: 'social', label: 'Social post', hint: 'A post for your feed', assetType: 'Social Post', channels: ['Instagram', 'LinkedIn', 'Facebook', 'X'], schedulable: true },
  { id: 'email', label: 'Email', hint: 'Subject line and body', assetType: 'Email Copy', channels: ['Email'], schedulable: true },
  { id: 'ad', label: 'Ad copy', hint: 'Headlines and description', assetType: 'Headline Set', channels: ['Google Ads', 'Meta Ads', 'LinkedIn Ads'], schedulable: false },
  { id: 'article', label: 'Article', hint: 'Blog or newsletter', assetType: 'Thought Leadership', channels: ['Blog', 'Newsletter', 'LinkedIn'], schedulable: false },
  { id: 'video', label: 'Video script', hint: 'Short-form scenes', assetType: 'Ad Script', channels: ['Reels', 'YouTube', 'Paid social'], schedulable: false },
];

export const GOALS = ['Generate leads', 'Drive sales', 'Build awareness', 'Engage audience', 'Announce news'] as const;
export const TONES = ['Professional', 'Friendly', 'Bold', 'Inspiring'] as const;
export const LENGTHS = ['Short', 'Medium'] as const;
export const CTAS = ['Book a call', 'Visit website', 'Reply to this message', 'Sign up', 'Learn more'] as const;

export type Goal = (typeof GOALS)[number];
export type Tone = (typeof TONES)[number];
export type Length = (typeof LENGTHS)[number];
export type Cta = (typeof CTAS)[number];

export interface Brief {
  kind: ContentKind;
  topic: string;
  goal: Goal;
  channel: string;
  tone: Tone;
  length: Length;
  cta: Cta;
  company: string;
}

export interface Draft {
  id: string;
  label: string;
  text: string;
}

const CTA_LINE: Record<Cta, string> = {
  'Book a call': 'Book a free call with our team.',
  'Visit website': 'Visit our website to see more.',
  'Reply to this message': 'Reply to this message and we will help.',
  'Sign up': 'Sign up today.',
  'Learn more': 'Learn more today.',
};

const PURPOSE: Record<Goal, string> = {
  'Generate leads': 'Tell us what you need and we will get you started.',
  'Drive sales': 'Now is a great time to get the most out of it.',
  'Build awareness': 'Here is what makes it worth knowing about.',
  'Engage audience': 'We would love to hear what you think.',
  'Announce news': 'We have some news to share.',
};

const OPEN: Record<Tone, string> = {
  Professional: 'Introducing',
  Friendly: 'Good news on',
  Bold: 'Stop waiting on',
  Inspiring: 'Imagine more from',
};

const clean = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const hashtags = (topic: string, company: string) => {
  const words = clean(topic)
    .split(' ')
    .map(w => w.replace(/[^a-z0-9]/gi, ''))
    .filter(w => w.length > 3)
    .slice(0, 2);
  return [...words, company.replace(/[^a-z0-9]/gi, '')]
    .filter(Boolean)
    .map(w => `#${cap(w)}`)
    .join(' ');
};

const sign = (tone: Tone) =>
  tone === 'Friendly' ? 'Warmly,' : tone === 'Bold' ? 'Let’s go,' : tone === 'Inspiring' ? 'With belief,' : 'Best regards,';
const hello = (tone: Tone) =>
  tone === 'Friendly' ? 'Hi there,' : tone === 'Bold' ? 'Hello,' : tone === 'Inspiring' ? 'Hello,' : 'Hello,';

function social(b: Brief): string[] {
  const t = clean(b.topic);
  const tags = ['Instagram', 'LinkedIn', 'X'].includes(b.channel) ? `\n\n${hashtags(b.topic, b.company)}` : '';
  const longer = b.length === 'Medium';
  return [
    `${OPEN[b.tone]} ${t}.\n\n${PURPOSE[b.goal]}${longer ? `\n\nWe built it around what our customers ask for most, and it shows.` : ''}\n\n${CTA_LINE[b.cta]}${tags}`,
    `We kept hearing the same question about ${t}.\n\nSo we put the answer in one place.${longer ? ` It is simple, clear and ready when you are.` : ''}\n\n${CTA_LINE[b.cta]}${tags}`,
    `What would ${t} change for you?\n\n${PURPOSE[b.goal]}${longer ? `\n\nShare your thoughts below. We read every one.` : ''}\n\n${CTA_LINE[b.cta]}${tags}`,
  ];
}

function email(b: Brief): string[] {
  const t = clean(b.topic);
  const longer = b.length === 'Medium';
  const body = (lead: string, extra: string) =>
    `${hello(b.tone)}\n\n${lead}\n\n${PURPOSE[b.goal]}${longer ? `\n\n${extra}` : ''}\n\n${CTA_LINE[b.cta]}\n\n${sign(b.tone)}\nThe ${b.company} team`;
  return [
    `Subject: ${cap(t)}, explained\n\n${body(`We wanted to tell you about ${t} and why it matters for you.`, 'It takes only a few minutes to see whether it is a fit.')}`,
    `Subject: A quick question about ${t}\n\n${body(`Are you still looking into ${t}? Many of our customers were, so we put together a short summary.`, 'If anything is unclear, just ask and we will walk you through it.')}`,
    `Subject: ${cap(t)}: don’t miss out\n\n${body(`${cap(t)} is available now, and we would hate for you to miss it.`, 'Spots and timelines can fill up, so acting early helps.')}`,
  ];
}

function ad(b: Brief): string[] {
  const t = clean(b.topic);
  const btn = b.cta === 'Reply to this message' ? 'Contact us' : b.cta;
  const make = (h: string[], d: string) =>
    `Headlines\n${h.map(x => `• ${x}`).join('\n')}\n\nDescription\n${d}\n\nButton\n${btn}`;
  return [
    make([cap(t), `${b.company}: made simple`, 'See how it works'], `${PURPOSE[b.goal]} ${CTA_LINE[b.cta]}`),
    make([`${cap(t)} starts here`, 'Get started today', `Why choose ${b.company}`], `A clear, simple way to get ${t}. ${CTA_LINE[b.cta]}`),
    make([`Trusted for ${t}`, 'Talk to an expert', 'No pressure, just answers'], `Join customers who chose ${b.company}. ${CTA_LINE[b.cta]}`),
  ];
}

function article(b: Brief): string[] {
  const t = clean(b.topic);
  const longer = b.length === 'Medium';
  const section = (h: string, p: string) => `${h}\n${p}${longer ? ' We cover the details and common questions below.' : ''}`;
  const end = `${PURPOSE[b.goal]} ${CTA_LINE[b.cta]}`;
  return [
    `How to get started with ${t}\n\nIf you have been wondering about ${t}, this short guide covers the essentials.\n\n${section('1. Know what you need', 'Start by listing your goals and what success looks like.')}\n\n${section('2. Compare your options', 'Look at cost, effort and the results you can expect.')}\n\n${section('3. Take the first step', 'Start small, measure the result and build from there.')}\n\n${end}`,
    `${cap(t)}: what to know first\n\nBefore you decide, here are the points we are asked about most.\n\n${section('What it is', `A plain-language explanation of ${t}.`)}\n\n${section('Who it is for', 'The people and teams who get the most value from it.')}\n\n${section('What it costs', 'What to budget for, and where the value comes from.')}\n\n${end}`,
    `3 myths about ${t}\n\nThere is plenty of confusing advice out there. Let us clear a few things up.\n\n${section('Myth 1: it is too complicated', 'It is easier than most people expect when you start in the right place.')}\n\n${section('Myth 2: it takes too long', 'Most people see early results within weeks, not months.')}\n\n${section('Myth 3: it is only for big companies', 'It works at any size when it is matched to your goals.')}\n\n${end}`,
  ];
}

function video(b: Brief): string[] {
  const t = clean(b.topic);
  const secs = b.length === 'Short' ? '15 seconds' : '30 seconds';
  const scenes = (rows: Array<[string, string]>) =>
    `Length: ${secs} · ${b.channel}\n\n${rows.map(([s, l]) => `${s}\n${l}`).join('\n\n')}`;
  const close: [string, string] = ['Call to action', `${CTA_LINE[b.cta]} ${b.company}.`];
  return [
    scenes([['Hook', `Struggling with ${t}?`], ['Problem', 'Show the everyday frustration in one quick shot.'], ['Solution', `${b.company} makes ${t} simple.`], close]),
    scenes([['Hook', `“I did not expect ${t} to be this easy.”`], ['Story', 'A customer shares what changed for them.'], ['Result', 'Show the outcome on screen.'], close]),
    scenes([['Hook', `3 quick tips on ${t}`], ['Tips', 'One tip per beat, with a short on-screen caption.'], ['Recap', 'Repeat the main point in one line.'], close]),
  ];
}

const BUILDERS: Record<ContentKind, (b: Brief) => string[]> = { social, email, ad, article, video };
const LABELS: Record<ContentKind, string[]> = {
  social: ['Direct', 'Story', 'Question'],
  email: ['Benefit-led', 'Question-led', 'Urgency'],
  ad: ['Benefit-led', 'Offer-led', 'Proof-led'],
  article: ['How-to guide', 'Explainer', 'Myth-busting'],
  video: ['Problem and solution', 'Customer story', 'Quick tips'],
};

export function generateDrafts(b: Brief): Draft[] {
  const stamp = Date.now();
  return BUILDERS[b.kind](b).map((text, i) => ({ id: `d-${stamp}-${i}`, label: LABELS[b.kind][i], text }));
}

export const REFINEMENTS = ['Shorter', 'Friendlier', 'More formal', 'Add urgency'] as const;
export type Refinement = (typeof REFINEMENTS)[number];

export function refine(text: string, how: Refinement): string {
  switch (how) {
    case 'Shorter': {
      const parts = text.split(/\n{2,}/);
      if (parts.length <= 3) return text;
      const keep = Math.ceil(parts.length / 2);
      return [...parts.slice(0, keep), parts[parts.length - 1]].join('\n\n');
    }
    case 'Friendlier':
      return text.replace(/^Hello,/m, 'Hi there,').replace(/Best regards,/g, 'Warmly,') + (/Warmly|Hi there/.test(text) ? '' : '\n\nWe are always happy to help.');
    case 'More formal':
      return text.replace(/Hi there,/g, 'Hello,').replace(/Warmly,/g, 'Best regards,').replace(/We would love to/g, 'We would be glad to');
    case 'Add urgency':
      return /Limited time/.test(text) ? text : `${text}\n\nLimited time. Don’t wait.`;
  }
}
