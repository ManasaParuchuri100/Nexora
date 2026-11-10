import React from 'react';
import { ArrowRight, Clock, Inbox, Sparkles, Users } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
  onLaunch?: () => void;
}

const ROWS = [
  { Icon: Inbox, title: '2 conversations waiting for a person', meta: 'Longest wait: 2 h', tone: 'text-danger bg-danger-soft' },
  { Icon: Clock, title: '2 follow-ups overdue', meta: 'Oldest is 2 days overdue', tone: 'text-warn bg-warn-soft' },
  { Icon: Users, title: '1 lead ready to book a call', meta: 'High intent, asked for a demo', tone: 'text-brand bg-brand-soft' },
];

/** A static preview of the product. Figures are illustrative sample data. */
function ProductPreview() {
  return (
    <div className="relative mx-auto max-w-[980px] rounded-[10px] border border-line-strong bg-surface shadow-pop overflow-hidden" aria-label="Preview of the Nexora workspace (sample data)">
      <div className="flex items-center gap-1.5 px-4 h-10 border-b border-line bg-surface-raised">
        <span className="w-2.5 h-2.5 rounded-full bg-line-strong" /><span className="w-2.5 h-2.5 rounded-full bg-line-strong" /><span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 text-[12px] text-ink-3">Overview</span>
        <span className="ml-auto text-[12px] text-ink-3">Sample data</span>
      </div>
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 p-4 sm:p-6 text-left">
        <div className="rounded-[10px] border border-line p-4">
          <div className="text-[16px] font-semibold text-ink mb-1">Needs your attention</div>
          <div className="text-[12px] text-ink-3 mb-3">Resolve urgent work before reviewing performance.</div>
          {ROWS.map(r => (
            <div key={r.title} className="flex items-center gap-3 py-3 border-t border-line">
              <span className={`w-8 h-8 rounded-[8px] grid place-items-center shrink-0 ${r.tone}`}><r.Icon className="w-4 h-4" /></span>
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-ink truncate">{r.title}</div>
                <div className="text-[12px] text-ink-3">{r.meta}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 content-start">
          <div className="rounded-[10px] border border-line p-4">
            <div className="text-[12px] text-ink-3">New leads, last 7 days</div>
            <div className="text-[28px] font-semibold text-ink tabular-nums leading-tight">28</div>
            <div className="text-[12px] text-ok font-medium">↑ 17% vs previous 7 days</div>
          </div>
          <div className="rounded-[10px] border border-line bg-brand-soft p-4">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-brand"><Sparkles className="w-3.5 h-3.5" /> AI insight</div>
            <div className="text-[13px] text-ink mt-1.5 leading-[1.55]">Aster Labs asked about pricing twice and wants to start in 30 days. Review the draft before it is sent.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ onGetStarted, onLearnMore, onLaunch }: HeroProps) {
  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-24 text-center">
      <span className="inline-flex items-center gap-2 h-8 px-3 rounded-full border border-line bg-surface text-[13px] text-ink-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand" /> AI marketing OS for growing businesses
      </span>
      <h1 className="mt-6 text-[40px] sm:text-[56px] leading-[1.08] font-semibold tracking-[-0.03em] text-ink max-w-[820px] mx-auto">
        Never lose a lead to a slow reply.
      </h1>
      <p className="mt-5 text-[16px] sm:text-[18px] leading-[1.6] text-ink-2 max-w-[640px] mx-auto">
        Nexora answers every enquiry from knowledge you approve, qualifies the lead, and follows up at the right time, so your team only spends time on people who are ready to buy.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onGetStarted} className="nx-btn primary h-12 px-6 text-[15px]">
          Get started <ArrowRight className="w-4 h-4" />
        </button>
        {onLaunch ? (
          <button type="button" onClick={onLaunch} className="nx-btn h-12 px-6 text-[15px]">Open the demo workspace</button>
        ) : (
          <button type="button" onClick={onLearnMore} className="nx-btn h-12 px-6 text-[15px]">Learn more</button>
        )}
      </div>
      <p className="mt-3 text-[13px] text-ink-3">No credit card. Nothing is sent to customers until you activate.</p>
      <div className="mt-14 sm:mt-20"><ProductPreview /></div>
    </section>
  );
}
