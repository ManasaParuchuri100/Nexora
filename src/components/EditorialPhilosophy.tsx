import React from 'react';
import { ScrollText, ShieldCheck, UserCheck } from 'lucide-react';

const POINTS = [
  { Icon: ShieldCheck, title: 'Approved knowledge only', body: 'The AI answers from what you approved. When it is not sure, it says so and hands over to a person.' },
  { Icon: UserCheck, title: 'People stay in charge', body: 'A conversation is owned by the AI or by a person, never both. Taking over pauses the AI straight away.' },
  { Icon: ScrollText, title: 'Everything is recorded', body: 'Every reply, follow-up and change is logged, so you can see what happened and why.' },
];

export default function EditorialPhilosophy() {
  return (
    <section id="about" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-line">
      <div className="max-w-[640px]">
        <div className="eyebrow">Trust</div>
        <h2 className="mt-3 text-[32px] sm:text-[36px] leading-[1.15] font-semibold tracking-[-0.025em] text-ink">Automation you can explain to a customer.</h2>
        <p className="mt-4 text-[16px] leading-[1.6] text-ink-2">Speed matters, but so does being right. Nexora is built so you always know what it will say and who is responsible.</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {POINTS.map(p => (
          <div key={p.title} className="rounded-[10px] border border-line bg-surface p-6">
            <p.Icon className="w-5 h-5 text-brand" />
            <h3 className="mt-4 text-[16px] font-semibold text-ink">{p.title}</h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-ink-2">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
