import React from 'react';
import { BarChart3, Clock, Inbox, Megaphone, Radar, Wand2 } from 'lucide-react';

interface FeaturesProps {
  onOpenApp: () => void;
}

const FEATURES = [
  { Icon: Inbox, title: 'Answer instantly', body: 'Reply to enquiries on WhatsApp, Instagram, email and your website using only the answers you approved. Hand over to a person when it matters.' },
  { Icon: Clock, title: 'Follow up on time', body: 'Overdue, today and upcoming follow-ups in one queue, with AI drafts that wait for your approval and calls booked on Zoom, Meet or Teams.' },
  { Icon: Wand2, title: 'Create and schedule', body: 'Turn a short brief into drafts, edit and approve them, then drag them across a calendar to publish at the right time.' },
  { Icon: Megaphone, title: 'Plan campaigns', body: 'Choose the goal, audience, offer and channels. Get a roadmap, a content plan and clear next steps in one place.' },
  { Icon: BarChart3, title: 'See what works', body: 'Leads, channels and funnel in one view, with insights that show their evidence instead of just a score.' },
  { Icon: Radar, title: 'Stay ahead of the market', body: 'Public competitor changes and rising searches become recommendations you can approve, act on and measure.' },
];

export default function Features({ onOpenApp }: FeaturesProps) {
  return (
    <section id="features" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-line">
      <div className="max-w-[640px]">
        <div className="eyebrow">Features</div>
        <h2 className="mt-3 text-[32px] sm:text-[36px] leading-[1.15] font-semibold tracking-[-0.025em] text-ink">One workspace from first message to won deal.</h2>
        <p className="mt-4 text-[16px] leading-[1.6] text-ink-2">Everything a small team needs to capture, qualify and convert, without stitching tools together.</p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(f => (
          <div key={f.title} className="rounded-[10px] border border-line bg-surface p-6 hover:border-line-strong transition-colors">
            <span className="w-10 h-10 rounded-[8px] grid place-items-center bg-brand-soft text-brand"><f.Icon className="w-5 h-5" /></span>
            <h3 className="mt-5 text-[16px] font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-ink-2">{f.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <button type="button" onClick={onOpenApp} className="nx-btn primary">Start setting up</button>
      </div>
    </section>
  );
}
