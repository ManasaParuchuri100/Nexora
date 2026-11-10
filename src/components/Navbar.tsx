import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BRAND_COMPANY, BRAND_NAME } from '../config/brand';

interface NavbarProps {
  onOpenApp: (mode: 'login' | 'signup') => void;
  /** Opens the sample workspace without signing in. */
  onLaunch?: () => void;
}

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#about', label: 'Trust' },
];

export default function Navbar({ onOpenApp, onLaunch }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-line bg-canvas">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#" id="navbar-brand" className="flex flex-col leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-[6px]">
          <span className="text-[9px] font-semibold tracking-[3px] text-brand uppercase">{BRAND_COMPANY}</span>
          <span className="text-[22px] font-semibold tracking-[-0.03em] text-ink uppercase mt-1">
            {BRAND_NAME}<span className="text-brand">.</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-[14px] text-ink-2" aria-label="Primary">
          {LINKS.map(l => (
            <a key={l.href} href={l.href} className="hover:text-ink transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="nx-iconbtn"
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          {onLaunch && (
            <button type="button" className="hidden lg:inline-flex nx-btn ghost" onClick={onLaunch}>Open demo</button>
          )}
          <button type="button" className="hidden sm:inline-flex nx-btn" onClick={() => onOpenApp('login')}>Log in</button>
          <button type="button" className="nx-btn primary" onClick={() => onOpenApp('signup')}>Get started</button>
          <button type="button" className="md:hidden! nx-iconbtn" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-surface px-4 py-3 grid gap-1">
          {LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2.5 text-[14px] text-ink-2 hover:text-ink">{l.label}</a>
          ))}
          <button type="button" className="py-2.5 text-left text-[14px] text-ink-2 hover:text-ink min-h-0!" onClick={() => { setOpen(false); onOpenApp('login'); }}>Log in</button>
          {onLaunch && <button type="button" className="py-2.5 text-left text-[14px] text-ink-2 hover:text-ink min-h-0!" onClick={() => { setOpen(false); onLaunch(); }}>Open demo</button>}
        </div>
      )}
    </header>
  );
}
