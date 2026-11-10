import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

export default function FinalCTA({ onGetStarted }: FinalCTAProps) {
  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
      <div className="rounded-[10px] border border-line-strong bg-surface px-6 py-12 sm:py-16 text-center">
        <h2 className="text-[28px] sm:text-[36px] leading-[1.15] font-semibold tracking-[-0.025em] text-ink max-w-[640px] mx-auto">Give every enquiry a fast, correct answer.</h2>
        <p className="mt-4 text-[16px] text-ink-2 max-w-[520px] mx-auto leading-[1.6]">Set up in minutes. Nothing reaches a customer until you say so.</p>
        <button type="button" onClick={onGetStarted} className="nx-btn primary h-12 px-6 text-[15px] mt-8">
          Get started <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
