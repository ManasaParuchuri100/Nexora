import React, { useState } from 'react';
import { 
  LayoutDashboard,
  Inbox as InboxIcon, 
  Users, 
  Clock,
  Sparkles,
  Wand2,
  CalendarDays,
  Library,
  Megaphone, 
  BarChart3, 
  Settings, 
  LogOut, 
  X,
  HelpCircle,
  ChevronsUpDown,
  Check,
  Plus
} from 'lucide-react';
import { NavCategory, SubCategory } from '../../types';
import { BRAND_NAME, BRAND_COMPANY, BRAND_TAGLINE } from '../../config/brand';
import { useInboxCounts } from '../../data/conversations';
import { Avatar } from '../ui';

export interface NavSectionItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  category: NavCategory;
  sub: SubCategory;
  isActive: (activeCategory: NavCategory, activeSubCategory: SubCategory) => boolean;
}

export interface NavSection {
  title: string;
  items: NavSectionItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      {
        key: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
        category: 'overview',
        sub: 'overview',
        isActive: (cat) => cat === 'overview',
      },
      {
        key: 'inbox',
        label: 'Inbox',
        icon: InboxIcon,
        category: 'inbox',
        sub: 'inbox',
        isActive: (cat) => cat === 'inbox' || cat === 'engage',
      },
      {
        key: 'leads',
        label: 'Leads',
        icon: Users,
        category: 'leads',
        sub: 'all-leads',
        isActive: (cat, sub) => cat === 'leads' && sub !== 'follow-ups',
      },
      {
        key: 'follow-ups',
        label: 'Follow-ups',
        icon: Clock,
        category: 'leads',
        sub: 'follow-ups',
        isActive: (cat, sub) => cat === 'leads' && sub === 'follow-ups',
      },
    ],
  },
  {
    title: 'AI & Marketing',
    items: [
      {
        key: 'agent',
        label: 'Engagement Agent',
        icon: Sparkles,
        category: 'agent',
        sub: 'default',
        isActive: (cat) => cat === 'agent',
      },
      {
        key: 'content',
        label: 'Content Studio',
        icon: Wand2,
        category: 'content',
        sub: 'create',
        isActive: (cat, sub) => cat === 'content' && (sub === 'create' || sub === 'ai-content'),
      },
      {
        key: 'schedule',
        label: 'Schedule',
        icon: CalendarDays,
        category: 'content',
        sub: 'schedule',
        isActive: (cat, sub) => cat === 'content' && (sub === 'schedule' || sub === 'social-posts'),
      },
      {
        key: 'library',
        label: 'Library',
        icon: Library,
        category: 'content',
        sub: 'library',
        isActive: (cat, sub) => cat === 'content' && (sub === 'library' || sub === 'content-library' || sub === 'generated-assets'),
      },
      {
        key: 'campaigns',
        label: 'Campaigns',
        icon: Megaphone,
        category: 'campaigns',
        sub: 'campaign-list',
        isActive: (cat) => cat === 'campaigns',
      },
      {
        key: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        category: 'analytics',
        sub: 'overview',
        isActive: (cat) => cat === 'analytics',
      },
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
  workspaceName = `${BRAND_NAME} Workspace`
}: AppSidebarProps) {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaceName);
  const inboxCounts = useInboxCounts();

  const workspaces = [
    { id: 'ws-1', name: workspaceName || `${BRAND_NAME} Workspace`, role: userRole || 'Owner' },
    { id: 'ws-2', name: `${BRAND_NAME} Retail Hub`, role: 'Admin' },
    { id: 'ws-3', name: 'Sterling Creative', role: 'Viewer' }
  ];

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-surface select-none text-ink">
      
      {/* 1. BRAND HEADER (Three lines, no logo square) */}
      <div className="flex items-start justify-between px-4 py-4 border-b border-line-subtle">
        <button
          type="button"
          onClick={() => {
            onSelectNav('overview', 'overview');
            onCloseMobile();
          }}
          className="text-left focus-visible:outline-none cursor-pointer flex flex-col group"
        >
          <span className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
            {BRAND_COMPANY}
          </span>
          <span className="text-3xl font-extrabold tracking-tight text-ink uppercase">
            {BRAND_NAME}<span className="text-brand">.</span>
          </span>
          <span className="text-xs tracking-widest text-ink-3 uppercase">
            {BRAND_TAGLINE}
          </span>
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
      </div>

      {/* 2. WORKSPACE CARD */}
      <div className="p-3 border-b border-line-subtle relative">
        <div className="rounded-xl border border-line bg-surface p-3">
          <button
            type="button"
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between transition-colors cursor-pointer text-left focus-visible:outline-none"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={currentWorkspace} size="md" className="rounded-lg" />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-ink truncate block">
                  {currentWorkspace}
                </span>
                <span className="text-xs text-ink-3 block leading-tight truncate">
                  {isDemoWorkspace ? 'Demo workspace' : userRole}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-ink-3 shrink-0 ml-1" />
          </button>
        </div>

        {/* Workspace Switcher Dropdown */}
        {isWorkspaceMenuOpen && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-surface border border-line rounded-xl shadow-pop py-1.5 z-50 text-sm animate-fadeIn">
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
      <nav className="flex-1 py-2 px-3 overflow-y-auto">
        {NAV_SECTIONS.map((section, sIndex) => (
          <div key={section.title}>
            <div className={`text-xs font-semibold uppercase tracking-wider text-ink-3 px-3 ${sIndex === 0 ? 'mt-2 mb-1' : 'mt-5 mb-1'}`}>
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = item.isActive(activeCategory, activeSubCategory);

                return (
                  <button
                    key={item.key}
                    type="button"
                    id={`sidebar-nav-${item.key}`}
                    onClick={() => {
                      onSelectNav(item.category, item.sub);
                      onCloseMobile();
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center justify-between h-10 rounded-xl px-3 gap-3 text-sm font-medium transition-colors cursor-pointer text-left focus-visible:outline-none ${
                      active
                        ? 'bg-brand-soft text-brand font-semibold'
                        : 'text-ink-2 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon 
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          active ? 'text-brand' : 'text-ink-3'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Inbox badge */}
                    {item.key === 'inbox' && inboxCounts.needsYou > 0 && (
                      <span
                        className="bg-brand text-on-brand rounded-md min-w-5 px-1.5 text-xs font-semibold tabular-nums flex items-center justify-center shrink-0"
                        aria-label={`${inboxCounts.needsYou} conversations need you`}
                      >
                        {inboxCounts.needsYou}
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
      <div className="p-3 border-t border-line-subtle space-y-1">
        
        {/* Settings button */}
        <button
          type="button"
          id="sidebar-nav-settings"
          onClick={() => {
            onSelectNav('settings', 'business');
            onCloseMobile();
          }}
          aria-current={activeCategory === 'settings' ? 'page' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left focus-visible:outline-none ${
            activeCategory === 'settings'
              ? 'bg-brand-soft text-brand font-semibold'
              : 'text-ink-2 hover:text-ink hover:bg-surface-hover'
          }`}
        >
          <Settings className={`w-4 h-4 shrink-0 ${activeCategory === 'settings' ? 'text-brand' : 'text-ink-3'}`} />
          <span>Settings</span>
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
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-ink-2 hover:text-ink hover:bg-surface-hover transition-colors cursor-pointer text-left focus-visible:outline-none"
        >
          <HelpCircle className="w-4 h-4 shrink-0 text-ink-3" />
          <span>Help</span>
        </button>

        {/* User Card */}
        <div className="pt-2 border-t border-line-subtle mt-2 flex items-center justify-between px-2 py-1.5 rounded-lg bg-surface-raised">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={userName} size="sm" />
            <div className="min-w-0">
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
            className="p-1.5 rounded-lg text-ink-3 hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer shrink-0"
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
        className="hidden md:block fixed top-0 left-0 bottom-0 w-60 z-30 border-r border-line bg-surface"
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
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
