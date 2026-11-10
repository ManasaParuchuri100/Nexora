import React, { useState } from 'react';
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
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaceName);
  const inboxCounts = useInboxCounts();
  const followUpCounts = useFollowUpCounts();

  const workspaces = [
    { id: 'ws-1', name: workspaceName || `${BRAND_NAME} Workspace`, role: userRole || 'Owner' },
    { id: 'ws-2', name: `${BRAND_NAME} Retail Hub`, role: 'Admin' },
    { id: 'ws-3', name: 'Sterling Creative', role: 'Viewer' }
  ];

  const renderNavContent = (rail = false) => (
    <div className="flex flex-col h-full bg-surface select-none text-ink">
      
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
              <span className="text-[9px] leading-none font-extrabold tracking-[3px] text-brand uppercase">
                {BRAND_COMPANY}
              </span>
              <span className="font-display text-[25px] leading-[35px] font-extrabold tracking-[-1.2px] text-ink uppercase mt-1">
                {BRAND_NAME}<span className="text-brand">.</span>
              </span>
              <span className="text-[9px] tracking-[2px] text-ink-3 uppercase">
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
            className={`hidden md:inline-flex p-1.5 min-h-0! rounded-[7px]! text-ink-3 hover:text-ink hover:bg-surface-hover cursor-pointer ${rail ? '' : '-mt-1'}`}
            aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'}
            title={rail ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {rail ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>

      {/* 2. WORKSPACE CARD */}
      <div className={`${rail ? 'px-[14px]' : 'px-[17px]'} pb-5 relative`}>
        <div className={`rounded-[10px] border border-line bg-surface hover:border-line-strong transition-colors ${rail ? 'p-[5px]' : 'p-[11px]'}`}>
          <button
            type="button"
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className={`w-full flex items-center transition-colors cursor-pointer text-left focus-visible:outline-none ${rail ? 'justify-center' : 'justify-between'}`}
            title={rail ? currentWorkspace : undefined}
            aria-label={rail ? `Workspace: ${currentWorkspace}` : undefined}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-[29px] h-[29px] rounded-[9px] grid place-items-center bg-avatar text-avatar-ink text-xs font-extrabold uppercase shrink-0">
                {currentWorkspace[0]}
              </span>
              {!rail && (
                <div className="min-w-0">
                  <span className="text-[13px] font-bold text-ink truncate block leading-tight">
                    {currentWorkspace}
                  </span>
                  <span className="text-[10px] text-ink-3 block leading-tight truncate mt-0.5">
                    {isDemoWorkspace ? 'Demo workspace' : userRole}
                  </span>
                </div>
              )}
            </div>
            {!rail && <ChevronsUpDown className="w-4 h-4 text-ink-3 shrink-0 ml-1" />}
          </button>
        </div>

        {/* Workspace Switcher Dropdown */}
        {isWorkspaceMenuOpen && (
          <div className={`absolute top-full -mt-1 ${rail ? 'left-[10px] w-[230px]' : 'left-[17px] right-[17px]'} bg-surface border border-line rounded-[12px] shadow-pop py-1.5 z-50 text-sm animate-fadeIn`}>
            <div className="px-3 py-1 text-xs font-medium text-ink-3">
              Workspaces
            </div>
            {workspaces.map(ws => (
              <button
                key={ws.id}
                type="button"
                onClick={() => {
                  setCurrentWorkspace(ws.name);
                  setIsWorkspaceMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-surface-hover transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate font-medium">{ws.name}</span>
                  <span className="text-xs text-ink-3">({ws.role})</span>
                </div>
                {currentWorkspace === ws.name && (
                  <Check className="w-4 h-4 text-brand shrink-0" />
                )}
              </button>
            ))}

            <div className="border-t border-line-subtle my-1.5" />

            {/* Demo workspace toggle */}
            <label className="px-3 py-1.5 flex items-center justify-between text-xs text-ink cursor-pointer hover:bg-surface-hover">
              <span className="font-medium">Demo workspace</span>
              <input
                type="checkbox"
                checked={isDemoWorkspace}
                onChange={(e) => {
                  if (onToggleDemoWorkspace) onToggleDemoWorkspace(e.target.checked);
                }}
                className="accent-brand cursor-pointer"
              />
            </label>

            <div className="border-t border-line-subtle my-1.5" />

            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(false)}
              className="w-full px-3 py-1.5 text-left text-xs font-medium text-brand hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN NAVIGATION (Grouped sections) */}
      <nav className="flex-1 pb-3 px-[14px] overflow-y-auto">
        {NAV_SECTIONS.map((section, sIndex) => (
          <div key={section.title}>
            {rail ? (
              sIndex > 0 && <div className="border-t border-line mx-2 my-2" />
            ) : (
              <div className="text-[9px] font-extrabold uppercase tracking-[1.8px] text-muted-decor px-[13px] pt-[14px] pb-[7px]">
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
                    className={`relative w-full flex items-center h-[44px] min-h-[44px]! my-px rounded-[9px]! text-[13px] ${rail ? 'justify-center px-0' : 'justify-between px-[13px] gap-3'}  font-semibold transition-colors cursor-pointer text-left focus-visible:outline-none ${
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
                          : 'bg-brand text-on-brand rounded-[5px] min-w-5 px-1.5 py-px text-[10px] font-bold tabular-nums flex items-center justify-center shrink-0'}
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
                          : 'bg-danger-soft text-danger rounded-[5px] min-w-5 px-1.5 py-px text-[10px] font-bold tabular-nums flex items-center justify-center shrink-0'}
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
          className={`w-full flex items-center ${rail ? 'justify-center' : 'gap-[11px] px-[13px]'} h-[44px] min-h-[44px]! rounded-[9px]! text-[13px] font-semibold transition-colors cursor-pointer text-left focus-visible:outline-none ${
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
          className={`relative w-full flex items-center ${rail ? 'justify-center' : 'justify-between px-[13px]'} h-[44px] min-h-[44px]! rounded-[9px]! text-[13px] font-semibold transition-colors cursor-pointer text-left focus-visible:outline-none ${
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
                : 'bg-warn-soft text-warn rounded-[5px] min-w-5 px-1.5 py-px text-[10px] font-bold tabular-nums flex items-center justify-center shrink-0'}
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
          className={`w-full flex items-center ${rail ? 'justify-center' : 'gap-[11px] px-[13px]'} h-[44px] min-h-[44px]! rounded-[9px]! text-[13px] font-semibold text-ink-2 hover:text-ink hover:bg-surface-hover transition-colors cursor-pointer text-left focus-visible:outline-none`}
        >
          <HelpCircle strokeWidth={1.8} className="w-[17px] h-[17px] shrink-0 text-ink-3" />
          {!rail && <span>Help</span>}
        </button>

        {/* User Card */}
        <div className={`mt-3 flex items-center rounded-[10px] border border-line bg-surface-raised ${rail ? 'flex-col gap-1.5 p-1.5' : 'justify-between px-2.5 py-2'}`}>
          <div className="flex items-center gap-2.5 min-w-0" title={rail ? `${userName} · ${userRole}` : undefined}>
            <Avatar name={userName} size="sm" />
            <div className={`min-w-0 ${rail ? 'hidden' : ''}`}>
              <span className="text-xs font-semibold text-ink truncate block">
                {userName}
              </span>
              <span className="text-[11px] text-ink-3 truncate block leading-tight">
                {userRole}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 min-h-0! rounded-[7px]! text-ink-3 hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer shrink-0"
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
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 border-r border-line bg-surface transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-[232px]'}`}
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
            className="w-72 max-w-[85vw] h-full border-r border-line shadow-pop animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}
