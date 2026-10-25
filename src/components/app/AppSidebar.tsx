import React, { useState } from 'react';
import { 
  Compass, 
  Inbox as InboxIcon, 
  Users, 
  Megaphone, 
  BarChart3, 
  Settings, 
  LogOut, 
  Wand2, 
  X,
  HelpCircle,
  ChevronsUpDown,
  Check,
  Plus
} from 'lucide-react';
import { NavCategory, SubCategory } from '../../types';
import { BRAND_NAME } from '../../config/brand';
import { useInboxCounts } from '../../data/conversations';
import { Avatar, Badge } from '../ui';

interface SubItemConfig {
  id: SubCategory;
  label: string;
}

interface NavItemConfig {
  id: NavCategory;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isStandalone?: boolean;
  subItems?: SubItemConfig[];
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Compass,
    isStandalone: true
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: InboxIcon,
    isStandalone: true
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: Users,
    isStandalone: true
  },
  {
    id: 'content',
    label: 'Content',
    icon: Wand2,
    subItems: [
      { id: 'create', label: 'Create' },
      { id: 'schedule', label: 'Schedule' },
      { id: 'library', label: 'Library' }
    ]
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: Megaphone,
    isStandalone: true
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    isStandalone: true
  }
];

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

  const handleCategoryClick = (item: NavItemConfig) => {
    if (item.isStandalone) {
      const targetSub = 
        item.id === 'overview' ? 'overview' :
        item.id === 'inbox' ? 'inbox' :
        item.id === 'leads' ? 'all-leads' :
        item.id === 'campaigns' ? 'campaign-list' :
        item.id === 'analytics' ? 'overview' : 'default';
      
      onSelectNav(item.id, targetSub as SubCategory);
      onCloseMobile();
      return;
    }

    if (item.subItems && item.subItems.length > 0) {
      onSelectNav(item.id, item.subItems[0].id);
      onCloseMobile();
    }
  };

  const handleSubItemClick = (category: NavCategory, subCategory: SubCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNav(category, subCategory);
    onCloseMobile();
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-surface select-none text-ink">
      
      {/* 1. BRAND HEADER */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-line-subtle">
        <button
          type="button"
          onClick={() => onSelectNav('overview', 'overview')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-brand text-on-brand flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {BRAND_NAME.charAt(0)}
          </div>
          <span className="font-semibold text-base tracking-tight text-ink group-hover:text-brand transition-colors">
            {BRAND_NAME}
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

      {/* 2. WORKSPACE SWITCHER */}
      <div className="px-3 py-2.5 border-b border-line-subtle relative">
        <button
          type="button"
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer text-left focus-visible:outline-none"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={currentWorkspace} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-ink truncate">
                  {currentWorkspace}
                </span>
                {isDemoWorkspace && (
                  <Badge tone="warning" size="sm">Demo</Badge>
                )}
              </div>
              <span className="text-xs text-ink-3 block leading-tight truncate">
                {userRole}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-ink-3 shrink-0 ml-1" />
        </button>

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

      {/* 3. MAIN NAVIGATION */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isCategoryActive = activeCategory === item.id || 
            (item.id === 'inbox' && activeCategory === 'engage') || 
            (item.id === 'engage' && activeCategory === 'inbox');
          const hasSub = !!(item.subItems && item.subItems.length > 0);

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleCategoryClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left focus-visible:outline-none ${
                  isCategoryActive
                    ? 'bg-brand-soft text-brand font-semibold'
                    : 'text-ink-2 hover:text-ink hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon 
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isCategoryActive ? 'text-brand' : 'text-ink-3'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {/* Inbox badge showing live needsYou count from store; hidden when 0 */}
                {item.id === 'inbox' && inboxCounts.needsYou > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warn-soft text-warn tabular-nums shrink-0">
                    {inboxCounts.needsYou}
                  </span>
                )}
              </button>

              {/* Sub-Items List */}
              {hasSub && (
                <div className="ml-4 pl-3 border-l border-line-subtle space-y-0.5 py-0.5">
                  {item.subItems?.map((sub) => {
                    const isSubActive = isCategoryActive && (
                      activeSubCategory === sub.id ||
                      (sub.id === 'create' && activeSubCategory === 'ai-content') ||
                      (sub.id === 'schedule' && activeSubCategory === 'social-posts') ||
                      (sub.id === 'library' && (activeSubCategory === 'content-library' || activeSubCategory === 'generated-assets'))
                    );

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        id={`sidebar-subnav-${item.id}-${sub.id}`}
                        onClick={(e) => handleSubItemClick(item.id, sub.id, e)}
                        className={`w-full flex items-center px-2.5 py-1.5 rounded-lg text-sm transition-colors cursor-pointer text-left focus-visible:outline-none ${
                          isSubActive
                            ? 'bg-brand-soft text-brand font-medium'
                            : 'text-ink-3 hover:text-ink hover:bg-surface-hover'
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
