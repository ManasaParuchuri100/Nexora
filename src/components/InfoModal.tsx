import React from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  type: 'contact' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export default function InfoModal({ type, onClose }: InfoModalProps) {
  if (!type) return null;

  const content = {
    contact: {
      title: 'Inquiries & Dialogue',
      subtitle: 'Reach the team behind nexora',
      body: 'For thoughtful partnerships, architecture discussions, or private enterprise deployments, write to us directly at studio@nexora.space. We read every correspondence within one business day.'
    },
    privacy: {
      title: 'Privacy by Subtraction',
      subtitle: 'Your data is yours alone',
      body: 'Nexora is architected around end-to-end user privacy. We do not sell telemetry, monetize user attention, or train public models on your private tasks and schedules. Your thoughts remain entirely confidential.'
    },
    terms: {
      title: 'Terms of Purpose',
      subtitle: 'Mutual respect and calm reliability',
      body: 'By using Nexora, you enter a platform built for peaceful, reliable productivity. We pledge 99.9% uptime, zero dark patterns, and absolute respect for your digital sovereignty.'
    }
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface border border-line p-8 sm:p-10 shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[11px] uppercase tracking-widest-plus text-ink-2 font-normal block mb-1">
              nexora documentation
            </span>
            <h3 className="font-display font-bold text-3xl font-light text-ink">
              {content.title}
            </h3>
            <p className="text-xs text-ink-2 font-light mt-1">
              {content.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink transition-colors p-1 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="w-full h-px bg-line my-6" />

        <p className="text-xs sm:text-sm text-ink-2 font-light leading-relaxed mb-8">
          {content.body}
        </p>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-brand text-on-brand px-6 py-2.5 rounded-[9px] font-semibold uppercase tracking-widest text-xs hover:bg-brand-hover transition-colors cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
