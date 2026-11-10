import React from 'react';
import { BRAND_COMPANY, BRAND_NAME } from '../config/brand';

interface FooterProps {
  onOpenApp: () => void;
  onContactClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
}

export default function Footer({ onOpenApp, onContactClick, onPrivacyClick, onTermsClick }: FooterProps) {
  const link = 'text-[14px] text-ink-2 hover:text-ink transition-colors bg-transparent border-0 p-0 min-h-0! cursor-pointer text-left';
  return (
    <footer className="border-t border-line bg-sidebar">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row gap-8 md:items-start md:justify-between">
        <div className="flex flex-col leading-none">
          <span className="text-[9px] font-semibold tracking-[3px] text-brand uppercase">{BRAND_COMPANY}</span>
          <span className="text-[20px] font-semibold tracking-[-0.03em] text-ink uppercase mt-1">{BRAND_NAME}<span className="text-brand">.</span></span>
          <span className="text-[12px] text-ink-3 mt-3 max-w-[260px] leading-[1.5] normal-case">AI marketing OS. Capture, qualify and follow up on every lead.</span>
        </div>
        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-2" aria-label="Footer">
          <a href="#features" className={link}>Features</a>
          <a href="#how-it-works" className={link}>How it works</a>
          <a href="#about" className={link}>Trust</a>
          <button type="button" onClick={onOpenApp} className={link}>Get started</button>
          <button type="button" onClick={onContactClick} className={link}>Contact</button>
          <button type="button" onClick={onPrivacyClick} className={link}>Privacy</button>
          <button type="button" onClick={onTermsClick} className={link}>Terms</button>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 text-[12px] text-ink-3">© {new Date().getFullYear()} {BRAND_COMPANY}. All rights reserved.</div>
      </div>
    </footer>
  );
}
