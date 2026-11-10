import { useTheme } from '../../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  Laptop, 
  Check, 
  Sliders, 
  Bell, 
  User, 
  Sparkles,
  ShieldCheck,
  Palette
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (title: string, desc: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onNotify
}: SettingsModalProps) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'workspace' | 'notifications'>('appearance');

  // Additional subtle preferences
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [compactDensity, setCompactDensity] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    if (onNotify) {
      onNotify(
        newTheme === 'light' ? 'Light Mode Enabled' : 'Dark Mode Enabled',
        newTheme === 'light' 
          ? 'Switched the entire application to the Botanical Ivory light palette.' 
          : 'Switched the entire application to the Botanical Noir dark palette.'
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-surface-raised border border-line shadow-2xl rounded-[8px] overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line bg-surface">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-[8px] bg-surface-hover border border-line flex items-center justify-center text-ink-2">
              <Sliders className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display font-semibold text-xl sm:text-2xl font-light tracking-tight text-ink">
                Application Settings
              </h2>
              <p className="text-[12px] text-ink-2 font-light">
                Configure theme appearance, display density, and workspace defaults.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-3 hover:text-ink hover:bg-surface-hover rounded transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex border-b border-line-subtle bg-surface px-6">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3.5 text-xs  uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === 'appearance'
                ? 'border-line-strong text-ink font-semibold bg-surface-hover'
                : 'border-transparent text-ink-3 hover:text-ink'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance & Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`py-3 px-3.5 text-xs  uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === 'workspace'
                ? 'border-line-strong text-ink font-semibold bg-surface-hover'
                : 'border-transparent text-ink-3 hover:text-ink'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3.5 text-xs  uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center space-x-2 ${
              activeTab === 'notifications'
                ? 'border-line-strong text-ink font-semibold bg-surface-hover'
                : 'border-transparent text-ink-3 hover:text-ink'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Mode Picker */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-ink tracking-wide">
                      Theme Mode
                    </h3>
                    <p className="text-xs text-ink-3 font-light">
                      Choose between the high-clarity light theme and the classic botanical dark theme.
                    </p>
                  </div>

                  {/* Quick Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-[8px] border border-line bg-surface text-xs  text-ink-2 hover:text-ink hover:border-line-strong transition-all cursor-pointer"
                  >
                    {theme === 'light' ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-warn" />
                        <span>Light active &mdash; Switch to Dark</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-sky-300" />
                        <span>Dark active &mdash; Switch to Light</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Visual Theme Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  {/* 1. Light Mode Card */}
                  <div
                    onClick={() => handleSelectTheme('light')}
                    className={`border p-4 rounded-[8px] cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                      theme === 'light'
                        ? 'bg-surface-hover border-line-strong ring-2 ring-brand/40 shadow-lg'
                        : 'bg-surface border-line hover:border-line hover:bg-surface-hover'
                    }`}
                  >
                    <div>
                      {/* Mini Mockup Thumbnail */}
                      <div className="w-full h-24 rounded-[8px] bg-surface-raised border border-stone-200 p-2.5 flex flex-col justify-between mb-3 shadow-inner overflow-hidden select-none">
                        {/* Mock topbar */}
                        <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                          <span className="font-display font-semibold text-[12px] font-semibold text-ink lowercase">nexora</span>
                          <div className="flex space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-ink-3" />
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                          </div>
                        </div>
                        {/* Mock cards */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-surface border border-stone-200 p-1.5 rounded-[6px]">
                            <span className="text-[10px] text-ink-3  block">Contacted</span>
                            <span className="font-display font-semibold text-[12px] font-semibold text-ink">16 leads</span>
                          </div>
                          <div className="bg-surface border border-stone-200 p-1.5 rounded-[6px]">
                            <span className="text-[10px] text-ink-3  block">Conversion</span>
                            <span className="font-display font-semibold text-[12px] font-semibold text-ink">64%</span>
                          </div>
                        </div>
                      </div>

                      {/* Header & Badges */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <Sun className="w-4 h-4 text-warn" />
                          <h4 className="font-display font-semibold text-base font-light text-ink">
                            Light Mode
                          </h4>
                        </div>
                        {theme === 'light' && (
                          <span className="w-5 h-5 rounded-full bg-brand text-on-brand flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-ink-3 font-light leading-relaxed">
                        Crisp porcelain palette (<span className=" text-[11px]">#F8F9F5</span>) with clean white cards, deep forest text, and clear contrast.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line-subtle flex items-center justify-between text-[12px] ">
                      <span className="text-ink-3">Botanical Ivory</span>
                      <span className={theme === 'light' ? 'text-ink font-bold' : 'text-ink-3'}>
                        {theme === 'light' ? 'Active' : 'Click to select'}
                      </span>
                    </div>
                  </div>

                  {/* 2. Dark Mode Card */}
                  <div
                    onClick={() => handleSelectTheme('dark')}
                    className={`border p-4 rounded-[8px] cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                      theme === 'dark'
                        ? 'bg-surface-hover border-line-strong ring-2 ring-brand/40 shadow-lg'
                        : 'bg-surface border-line hover:border-line hover:bg-surface-hover'
                    }`}
                  >
                    <div>
                      {/* Mini Mockup Thumbnail */}
                      <div className="w-full h-24 rounded-[8px] bg-surface border border-line p-2.5 flex flex-col justify-between mb-3 shadow-inner overflow-hidden select-none">
                        {/* Mock topbar */}
                        <div className="flex items-center justify-between border-b border-line pb-1.5">
                          <span className="font-display font-semibold text-[12px] font-semibold text-ink lowercase">nexora</span>
                          <div className="flex space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                            <span className="w-1.5 h-1.5 rounded-full bg-surface-hover" />
                          </div>
                        </div>
                        {/* Mock cards */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-surface-raised border border-line p-1.5 rounded-[6px]">
                            <span className="text-[10px] text-ink-2  block">Contacted</span>
                            <span className="font-display font-semibold text-[12px] font-semibold text-ink">16 leads</span>
                          </div>
                          <div className="bg-surface-raised border border-line p-1.5 rounded-[6px]">
                            <span className="text-[10px] text-ink-2  block">Conversion</span>
                            <span className="font-display font-semibold text-[12px] font-semibold text-ink">64%</span>
                          </div>
                        </div>
                      </div>

                      {/* Header & Badges */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <Moon className="w-4 h-4 text-sky-300" />
                          <h4 className="font-display font-semibold text-base font-light text-ink">
                            Dark Mode
                          </h4>
                        </div>
                        {theme === 'dark' && (
                          <span className="w-5 h-5 rounded-full bg-brand text-on-brand flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-ink-3 font-light leading-relaxed">
                        Classic deep botanical teal palette (<span className=" text-[11px]">#071C1A</span>) with warm cream typography and luminous sage telemetry.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line-subtle flex items-center justify-between text-[12px] ">
                      <span className="text-ink-3">Botanical Noir</span>
                      <span className={theme === 'dark' ? 'text-ink font-bold' : 'text-ink-3'}>
                        {theme === 'dark' ? 'Active' : 'Click to select'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Enhancements */}
              <div className="pt-4 border-t border-line-subtle space-y-4">
                <h4 className="text-xs  uppercase tracking-widest text-ink-2">
                  Display Preferences
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border border-line bg-surface rounded-[8px] cursor-pointer hover:border-line transition-colors">
                    <div>
                      <span className="text-xs font-medium text-ink block">High Contrast Accents</span>
                      <span className="text-[12px] text-ink-3 font-light">Enforce AAA ratio on telemetry badges and grid outlines</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                      className="w-4 h-4 accent-brand cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-line bg-surface rounded-[8px] cursor-pointer hover:border-line transition-colors">
                    <div>
                      <span className="text-xs font-medium text-ink block">Compact Table Density</span>
                      <span className="text-[12px] text-ink-3 font-light">Decrease vertical padding in live leads and stats grids</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={compactDensity}
                      onChange={(e) => setCompactDensity(e.target.checked)}
                      className="w-4 h-4 accent-brand cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-ink">Workspace Identity</h3>
              <div className="space-y-3">
                <div className="p-3.5 border border-line bg-surface rounded-[8px] space-y-1">
                  <span className="text-[11px]  text-ink-3 uppercase tracking-wider block">Organization</span>
                  <p className="text-sm text-ink font-medium">Nexora Studios Ltd.</p>
                  <p className="text-xs text-ink-2">Tokyo &bull; London &bull; Zurich</p>
                </div>

                <div className="p-3.5 border border-line bg-surface rounded-[8px] space-y-1">
                  <span className="text-[11px]  text-ink-3 uppercase tracking-wider block">Account Tier</span>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-ok" />
                    <span className="text-sm text-ink font-medium">Pro Enterprise Workspace</span>
                  </div>
                  <p className="text-xs text-ink-2">Unlimited AI campaign roadmaps & 100,000 monthly lead sync credits.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-ink">Notification Routing</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 border border-line bg-surface rounded-[8px] cursor-pointer">
                  <div>
                    <span className="text-xs font-medium text-ink block">Audible Feedback</span>
                    <span className="text-[12px] text-ink-2 font-light">Play quiet chime upon campaign generation or lead qualification</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-brand cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line bg-surface flex items-center justify-between">
          <span className="text-[12px] text-ink-3 ">
            {theme === 'light' ? 'Mode: Light (Botanical Ivory)' : 'Mode: Dark (Botanical Noir)'}
          </span>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-brand text-on-brand px-5 py-2 rounded-[8px] font-semibold text-xs uppercase tracking-wider hover:bg-brand-hover transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
