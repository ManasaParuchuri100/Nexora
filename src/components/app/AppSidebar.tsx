import React, { useEffect, useRef, useState } from 'react';
import { 
  LayoutDashboard,
  Inbox as InboxIcon, 
  Users, 
  Sparkles,
  Wand2,
  Megaphone, 
  BarChart3, 
  Radar,
  Rocket,
  Settings, 
  LogOut, 
  X,
  HelpCircle,
  ChevronsUpDown,
  Check,
  Plus,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { NavCategory, SubCategory } from '../../types';
import { BRAND_NAME, BRAND_COMPANY, BRAND_TAGLINE } from '../../config/brand';
import { useInboxCounts } from '../../data/conversations';
import { useFollowUpCounts } from '../../data/followUps';
import { Avatar } from '../ui';

export interface NavSectionItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  category: NavCategory;
  sub: SubCategory;
  /** Reopen on the local tab last used instead of the default one. */
  remember?: boolean;
  isActive: (activeCategory: NavCategory, activeSubCategory: SubCategory) => boolean;
}

export interface NavSection {
  title: string;
  items: NavSectionItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'General',
    items: [
      { key: 'overview', label: 'Overview', icon: LayoutDashboard, category: 'overview', sub: 'overview', isActive: (cat) => cat === 'overview' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { key: 'inbox', label: 'Inbox', icon: InboxIcon, category: 'inbox', sub: 'inbox', isActive: (cat) => cat === 'inbox' || cat === 'engage' },
      // Leads holds All leads, Pipeline and Follow-ups as local tabs.
      { key: 'leads', label: 'Leads', icon: Users, category: 'leads', sub: 'all-leads', remember: true, isActive: (cat) => cat === 'leads' },
      { key: 'campaigns', label: 'Campaigns', icon: Megaphone, category: 'campaigns', sub: 'campaign-list', isActive: (cat) => cat === 'campaigns' },
      // Content holds Create, Schedule and Library as local tabs.
      { key: 'content', label: 'Content', icon: Wand2, category: 'content', sub: 'create', remember: true, isActive: (cat) => cat === 'content' },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { key: 'agent', label: 'Engagement Agent', icon: Sparkles, category: 'agent', sub: 'default', isActive: (cat) => cat === 'agent' },
      { key: 'market', label: 'Market Intelligence', icon: Radar, category: 'market', sub: 'recommendations', remember: true, isActive: (cat) => cat === 'market' },
      { key: 'analytics', label: 'Analytics', icon: BarChart3, category: 'analytics', sub: 'overview', remember: true, isActive: (cat) => cat === 'analytics' },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

interface AppSidebarProps {
  activeCategory: NavCategory;
  activeSubCategory: SubCategory;
  onSelectNav: (category: NavCategory, subCategory?: SubCategory) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  isDemoWorkspace?: boolean;
  onToggleDemoWorkspace?: (isDemo: boolean) => void;
  onOpenHelp?: () => void;
  userName?: string;
  userRole?: string;
  workspaceName?: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  /** Setup progress, shown on the Onboarding item until setup is complete. */
  setupProgress?: { done: number; total: number };
}

export default function AppSidebar({
  activeCategory,
  activeSubCategory,
  onSelectNav,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  isDemoWorkspace = false,
  onToggleDemoWorkspace,
  onOpenHelp,
  userName = 'Alex Rivera',
  userRole = 'Owner',
  workspaceName = `${BRAND_NAME} Workspace`,
  collapsed = false,
  onToggleCollapsed,
  setupProgress
}: AppSidebarProps) {
  // Mobile drawer: focus moves in, Tab stays inside, Escape closes, and focus returns to the menu button.
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpenMobile) return;
    const opener = document.activeElement as HTMLElement | null;
    drawerRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseMobile(); return; }
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const items = (Array.from(drawerRef.current.querySelectorAll('button, [href], input, select, [tabindex]:not([tabindex="-1"])')) as HTMLElement[]).filter(el => !el.hasAttribute('disabled'));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === drawerRef.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [isOpenMobile]); // eslint-disable-line react-hooks/exhaustive-deps
  const inboxCounts = useInboxCounts();
  const followUpCounts = useFollowUpCounts();

  const renderNavContent = (rail = false) => (
    <div className="flex flex-col h-full bg-sidebar select-none text-ink">
      
      {/* 1. BRAND HEADER (Three lines, no logo square) */}
      <div className={`flex items-start justify-between ${rail ? 'flex-col items-center gap-3 px-2 pt-[22px] pb-[18px]' : 'px-[27px] pt-[26px] pb-[27px]'}`}>
        <button
          type="button"
          onClick={() => {
            onSelectNav('overview', 'overview');
            onCloseMobile();
          }}
          className="text-left focus-visible:outline-none cursor-pointer flex flex-col group"
        >
          {rail ? (
            <span className="font-display text-[25px] leading-[35px] font-extrabold tracking-[-1.2px] text-ink uppercase" aria-label={BRAND_NAME}>
              {BRAND_NAME[0]}<span className="text-brand">.</span>
            </span>
          ) : (
            <>
              <span className="text-[10px] leading-none font-extrabold tracking-[3px] text-brand uppercase">
                {BRAND_COMPANY}
              </span>
              <span className="font-display text-[25px] leading-[35px] font-extrabold tracking-[-1.2px] text-ink uppercase mt-1">
                {BRAND_NAME}<span className="text-brand">.</span>
              </span>
              <span className="text-[10px] tracking-[2px] text-ink-3 uppercase">
                {BRAND_TAGLINE}
              </span>
            </>
          )}
        </button>

        {/* Close button on mobile */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-hover cursor-pointer"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>

        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={`hidden md:inline-flex p-1.5 min-h-0! rounded-[6px]! text-ink-3 hover:text-ink hover:bg-surface-hover cursor-pointer ${rail ? '' : '-mt-1'}`}
            aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'}
            title={rail ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {rail ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>

      {/* 3. MAIN NAVIGATION (Grouped sections) */}
      <nav className="flex-1 pb-3 px-[14px] overflow-y-auto">
        {NAV_SECTIONS.map((section, sIndex) => (
          <div key={section.title}>
            {rail ? (
              sIndex > 0 && <div className="border-t border-line mx-2 my-2" />
            ) : (
              <div className="text-[10px] font-extrabold uppercase tracking-[1.8px] text-muted-decor px-[13px] pt-[14px] pb-[7px]">
                {section.title}
              </div>
            )}
            <div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = item.isActive(activeCategory, activeSubCategory);

                return (
                  <button
                    key={item.key}
                    type="button"
                    id={`sidebar-nav-${item.key}`}
                    onClick={() => {
                      onSelectNav(item.category, item.remember ? undefined : item.sub);
                      onCloseMobile();
                    }}
                    aria-current={active ? 'page' : undefined}
                    aria-label={rail ? item.label : undefined}
                    title={rail ? item.label : undefined}
                    className={`relative w-full flex items-center h-[44px] md:h-[40px] min-h-[44px]! md:min-h-[40px]! my-px rounded-[8px]! text-[14px] ${rail ? 'justify-center px-0' : 'justify-between px-[13px] gap-3'}  font-semibold transition-colors cursor-pointer text-left focus-visible:outline-none ${
                      active
                        ? 'bg-brand-soft text-brand'
                        : 'text-ink-2 hover:bg-surface-hover hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-[11px] truncate">
                      <Icon
                        strokeWidth={1.8}
                        className={`w-[17px] h-[17px] shrink-0 transition-colors ${
                          active ? 'text-brand' : 'text-ink-3'
                        }`}
                      />
                      {!rail && <span className="truncate">{item.label}</span>}
                    </div>

                    {/* Inbox badge */}
                    {item.key === 'inbox' && inboxCounts.needsYou > 0 && (
                      <span
                        className={rail
                          ? 'absolute top-[7px] right-[9px] w-2 h-2 rounded-full bg-brand'
                          : 'bg-brand text-on-brand rounded-[5px] min-w-5 px-1.5 py-px text-[11px] font-bold tabular-nums flex items-center justify-center shrink-0'}
                        aria-label={`${inboxCounts.needsYou} conversations need you`}
                      >
                        {!rail && inboxCounts.needsYou}
                      </span>
                    )}

                    {/* Follow-ups overdue badge */}
                    {item.key === 'leads' && followUpCounts.overdue > 0 && (
                      <span
                        className={rail
                          ? 'absolute top-[7px] right-[9px] w-2 h-2 rounded-full bg-danger'
                          : 'bg-danger-soft text-danger rounded-[5px] min-w-5 px-1.5 py-px text-[11px] font-bold tabular-nums flex items-center justify-center shrink-0'}
                        aria-label={`${followUpCounts.overdue} overdue follow-ups`}
                      >
                        {!rail && followUpCounts.overdue}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 4. SIDEBAR FOOTER (Settings, Help, User Card) */}
      <div className={`${rail ? 'mx-[10px]' : 'mx-[14px]'} pt-3 pb-[18px] border-t border-line space-y-px`}>
        
        {/* Settings button */}
        <button
          type="button"
          id="sidebar-nav-settings"
          onClick={() => {
            onSelectNav('settings', 'business');
            onCloseMobile();
          }}
          aria-current={activeCategory === 'settings' ? 'page' : undefined}
          aria-label={rail ? 'Settings' : undefined}
          title={rail ? 'Settings' : undefined}
          className={`w-full flex items-center ${rail ? 'justify-center' : 'gap-[11px] px-[13px]'} h-[44px] md:h-[40px] min-h-[44px]! md:min-h-[40px]! rounded-[8px]! text-[14px] font-semibold transition-colors cursor-pointer text-left focus-visible:outline-none ${
            activeCategory === 'settings'
              ? 'bg-brand-soft text-brand'
              : 'text-ink-2 hover:text-ink hover:bg-surface-hover'
          }`}
        >
          <Settings strokeWidth={1.8} className={`w-[17px] h-[17px] shrink-0 ${activeCategory === 'settings' ? 'text-brand' : 'text-ink-3'}`} />
          {!rail && <span>Settings</span>}
        </button>

        {/* Onboarding button (setup progress shows until setup is complete) */}
        <button
          type="button"
          id="sidebar-nav-onboarding"
          onClick={() => {
            onSelectNav('onboarding', 'default');
            onCloseMobile();
          }}
          aria-current={activeCategory === 'onboarding' ? 'page' : undefined}
          aria-label={rail ? 'Onboarding' : undefined}
          title={rail ? 'Onboarding' : undefined}
          className={`relative w-full flex items-center ${rail ? 'justify-center' : 'justify-between px-[13px]'} h-[44px] md:h-[40px] min-h-[44px]! md:min-h-[40px]! rounded-[8px]! text-[14px] font-semibold transition-colors cursor-pointer text-left focus-visible:outline-none ${
            activeCategory === 'onboarding'
              ? 'bg-brand-soft text-brand'
              : 'text-ink-2 hover:text-ink hover:bg-surface-hover'
          }`}
        >
          <span className={`flex items-center ${rail ? '' : 'gap-[11px]'}`}>
            <Rocket strokeWidth={1.8} className={`w-[17px] h-[17px] shrink-0 ${activeCategory === 'onboarding' ? 'text-brand' : 'text-ink-3'}`} />
            {!rail && <span>Onboarding</span>}
          </span>
          {setupProgress && setupProgress.done < setupProgress.total && (
            <span
              className={rail
                ? 'absolute top-[7px] right-[9px] w-2 h-2 rounded-full bg-warn'
                : 'bg-warn-soft text-warn rounded-[5px] min-w-5 px-1.5 py-px text-[11px] font-bold tabular-nums flex items-center justify-center shrink-0'}
              aria-label={`Setup ${setupProgress.done} of ${setupProgress.total} done`}
            >
              {!rail && `${setupProgress.done}/${setupProgress.total}`}
            </span>
          )}
        </button>

        {/* Help button */}
        <button
          type="button"
          id="sidebar-nav-help"
          onClick={() => {
            if (onOpenHelp) onOpenHelp();
            else onSelectNav('settings', 'business');
            onCloseMobile();
          }}
          aria-label={rail ? 'Help' : undefined}
          title={rail ? 'Help' : undefined}
          className={`w-full flex items-center ${rail ? 'justify-center' : 'gap-[11px] px-[13px]'} h-[44px] md:h-[40px] min-h-[44px]! md:min-h-[40px]! rounded-[8px]! text-[14px] font-semibold text-ink-2 hover:text-ink hover:bg-surface-hover transition-colors cursor-pointer text-left focus-visible:outline-none`}
        >
          <HelpCircle strokeWidth={1.8} className="w-[17px] h-[17px] shrink-0 text-ink-3" />
          {!rail && <span>Help</span>}
        </button>

        {/* Current workspace (read-only; switch it from the top bar) */}
        {!rail && (
          <div className="mt-3 px-[13px] text-[12px] text-ink-3 truncate" title="Switch workspace from the top bar">
            Workspace: <span className="text-ink-2 font-medium">{workspaceName}</span>{isDemoWorkspace ? ' · Demo' : ''}
          </div>
        )}

        {/* User Card */}
        <div className={`mt-3 flex items-center rounded-[10px] border border-line bg-surface-raised ${rail ? 'flex-col gap-1.5 p-1.5' : 'justify-between px-2.5 py-2'}`}>
          <div className="flex items-center gap-2.5 min-w-0" title={rail ? `${userName} · ${userRole}` : undefined}>
            <Avatar name={userName} size="sm" />
            <div className={`min-w-0 ${rail ? 'hidden' : ''}`}>
              <span className="text-xs font-semibold text-ink truncate block">
                {userName}
              </span>
              <span className="text-[12px] text-ink-3 truncate block leading-tight">
                {userRole}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 min-h-0! rounded-[6px]! text-ink-3 hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer shrink-0"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (w-60 / 240px wide) */}
      <aside 
        id="app-desktop-sidebar"
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 border-r border-line bg-sidebar transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}
      >
        {renderNavContent(collapsed)}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-overlay backdrop-blur-[2px] transition-opacity"
          onClick={onCloseMobile}
        >
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            tabIndex={-1}
            className="w-72 max-w-[85vw] h-full border-r border-line shadow-pop animate-slideRight focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}
