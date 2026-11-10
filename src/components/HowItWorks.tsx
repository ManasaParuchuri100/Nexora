import React from 'react';

interface HowItWorksProps {
  onOpenApp: () => void;
}

const STEPS = [
  { n: '01', title: 'Tell us about your business', body: 'Your name, what you sell and where you are. It takes about two minutes.' },
  { n: '02', title: 'Approve what the AI may say', body: 'Nexora drafts answers from your details. Nothing is used until you approve it.' },
  { n: '03', title: 'Connect a channel and test', body: 'Start with WhatsApp or email. Ask the AI a few questions before customers do.' },
  { n: '04', title: 'Activate and stay in control', body: 'Turn it on when you are ready. Pause it any time, and take over any conversation.' },
];

export default function HowItWorks({ onOpenApp }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-line">
      <div className="max-w-[640px]">
        <div className="eyebrow">How it works</div>
        <h2 className="mt-3 text-[32px] sm:text-[36px] leading-[1.15] font-semibold tracking-[-0.025em] text-ink">Ready in four steps, on your terms.</h2>
      </div>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-0 list-none">
        {STEPS.map(s => (
          <li key={s.n} className="rounded-[10px] border border-line bg-surface p-6">
            <span className="text-[13px] font-semibold text-brand tabular-nums">{s.n}</span>
            <h3 className="mt-3 text-[16px] font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <button type="button" onClick={onOpenApp} className="nx-btn primary">Get started</button>
      </div>
    </section>
  );
}
