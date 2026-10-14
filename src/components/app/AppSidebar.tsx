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
  ChevronDown,
  Building,
  Check,
  Plus,
  Radio,
  Calendar,
  Layers
} from 'lucide-react';
import { NavCategory, SubCategory } from '../../types';

interface SubItemConfig {
  id: SubCategory;
  label: string;
  isLast?: boolean;
}

interface NavItemConfig {
  id: NavCategory;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isStandalone?: boolean;
  badgeCount?: number;
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
    isStandalone: true,
    badgeCount: 3
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
      { id: 'library', label: 'Library', isLast: true }
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
  onOpenHelp
}: AppSidebarProps) {
  // Workspace Switcher State
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('Acme Studio');

  const workspaces = [
    { id: 'ws-1', name: 'Acme Studio', role: 'Owner' },
    { id: 'ws-2', name: 'Acme Retail Hub', role: 'Admin' },
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
    <div className="flex flex-col h-full bg-[#F1F5F9] select-none text-[#334155]">
      
      {/* 1. BRAND & WORKSPACE SWITCHER */}
      <div className="px-5 py-4 border-b-2 border-[#CBD5E1] bg-[#FFFFFF] shadow-xs">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSelectNav('overview', 'overview')}
            className="group flex items-baseline space-x-2 text-left focus:outline-none cursor-pointer"
          >
            <span className="font-mono text-xl font-black tracking-wider text-black transition-colors uppercase" style={{ color: '#000000' }}>
              TECAVY
            </span>
            <span className="inline-block w-1.5 h-1.5 bg-[#0891B2] rounded-full opacity-100" />
          </button>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden text-black hover:text-black p-1 focus:outline-none cursor-pointer"
            style={{ color: '#000000' }}
            aria-label="Close navigation"
          >
            <X className="w-5 h-5 text-black stroke-[2.5]" style={{ color: '#000000' }} />
          </button>
        </div>

        {/* Workspace Switcher Button */}
        <div className="relative mt-2.5">
          <button
            type="button"
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-[6px] bg-[#FFFFFF] border-2 border-[#CBD5E1] hover:border-[#94A3B8] hover:bg-white text-xs font-mono text-black font-black shadow-xs transition-colors cursor-pointer"
            style={{ color: '#000000' }}
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate font-black text-black" style={{ color: '#000000' }}>{currentWorkspace}</span>
              {isDemoWorkspace && (
                <span className="text-[9px] px-1.5 py-0.2 bg-[#FEF3C7] text-black border border-[#F59E0B] rounded-[2px] font-black" style={{ color: '#000000' }}>
                  Demo
                </span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0 ml-1" style={{ color: '#000000' }} />
          </button>

          {/* Workspace Switcher Dropdown */}
          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-[#FFFFFF] border-2 border-[#CBD5E1] shadow-2xl rounded-[6px] py-1 text-xs font-mono z-50 animate-fadeIn text-[#000000]">
              <div className="px-3 py-1 text-[10px] uppercase text-[#000000] tracking-wider font-black">
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
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#F1F5F9] text-left transition-colors text-[#000000] font-bold"
                >
                  <span className="truncate">{ws.name}</span>
                  {currentWorkspace === ws.name && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  )}
                </button>
              ))}

              <div className="border-t border-[#E2E8F0] my-1" />

              {/* Demo workspace toggle */}
              <div className="px-3 py-1.5 flex items-center justify-between text-[#000000]">
                <span className="text-[11px] font-bold">Demo workspace</span>
                <input
                  type="checkbox"
                  checked={isDemoWorkspace}
                  onChange={(e) => {
                    if (onToggleDemoWorkspace) onToggleDemoWorkspace(e.target.checked);
                  }}
                  className="accent-[#0891B2] cursor-pointer"
                />
              </div>

              <div className="border-t border-[#E2E8F0] my-1" />
              <button
                type="button"
                onClick={() => setIsWorkspaceMenuOpen(false)}
                className="w-full px-3 py-1.5 text-left text-[11px] text-[#0891B2] hover:bg-[#F1F5F9] transition-colors font-black"
              >
                + New workspace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN NAVIGATION (10 Items Spec) */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isCategoryActive = activeCategory === item.id || 
            (item.id === 'inbox' && activeCategory === 'engage') || 
            (item.id === 'engage' && activeCategory === 'inbox');
          const hasSub = !!(item.subItems && item.subItems.length > 0);

          return (
            <div key={item.id} className="relative group">
              {/* Category Header Button */}
              <button
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleCategoryClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer focus:outline-none text-left border ${
                  isCategoryActive
                    ? 'text-[#0F172A] bg-[#FFFFFF] border-[#CBD5E1] border-l-4 border-l-[#0891B2] font-bold shadow-xs'
                    : 'text-[#334155] bg-transparent border-transparent hover:text-[#0F172A] hover:bg-[#FFFFFF] hover:border-[#CBD5E1] font-semibold'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon 
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isCategoryActive ? 'text-[#0891B2]' : 'text-[#475569] group-hover:text-[#0F172A]'
                    }`}
                    strokeWidth={isCategoryActive ? 2 : 1.75}
                  />
                  <span className="font-mono text-[11px] tracking-widest font-bold">
                    {item.label}
                  </span>
                </div>

                {/* Badge count for Inbox (Page 6: Inbox badge shows conversations that need a human) */}
                {item.id === 'inbox' && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]">
                    3
                  </span>
                )}
              </button>

              {/* Sub-Items Tree List (Content is always expanded per Page 6 spec) */}
              {hasSub && (
                <div className="pl-5 pr-1 py-1 space-y-0.5 animate-fadeIn">
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
                        className={`w-full flex items-center px-2.5 py-1.5 rounded-[4px] text-xs font-mono transition-all duration-150 cursor-pointer focus:outline-none text-left border ${
                          isSubActive
                            ? 'text-[#0F172A] font-bold bg-[#FFFFFF] border-[#CBD5E1] border-l-3 border-l-[#0891B2] shadow-2xs'
                            : 'text-[#475569] border-transparent hover:text-[#0F172A] hover:bg-[#FFFFFF] hover:border-[#CBD5E1] font-semibold'
                        }`}
                      >
                        <span className="text-[#94A3B8] mr-2 text-[10px] select-none font-mono">
                          {sub.isLast ? '└' : '├'}
                        </span>
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

      {/* 3. SIDEBAR FOOTER (Settings & Help per Page 6 & 7) */}
      <div className="p-3 border-t-2 border-[#CBD5E1] bg-[#FFFFFF] space-y-2 shadow-xs">
        
        {/* Settings button */}
        <button
          type="button"
          onClick={() => {
            onSelectNav('settings', 'business');
            onCloseMobile();
          }}
          className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-[6px] text-xs uppercase tracking-widest font-mono transition-colors cursor-pointer border-2 ${
            activeCategory === 'settings'
              ? 'text-black bg-[#FFFFFF] border-[#CBD5E1] border-l-4 border-l-[#0891B2] font-black shadow-xs'
              : 'text-black bg-[#FFFFFF] border-[#CBD5E1] hover:text-black hover:bg-white hover:border-[#94A3B8] font-black shadow-xs'
          }`}
          style={{ color: '#000000' }}
        >
          <Settings className="w-4 h-4 text-black stroke-[2.5]" style={{ color: '#000000' }} />
          <span className="font-black text-[11px] text-black" style={{ color: '#000000' }}>Settings</span>
        </button>

        {/* Help button */}
        <button
          type="button"
          onClick={() => {
            if (onOpenHelp) onOpenHelp();
            else onSelectNav('settings', 'business');
            onCloseMobile();
          }}
          className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-[6px] text-xs uppercase tracking-widest font-mono text-black bg-[#FFFFFF] border-2 border-[#CBD5E1] hover:text-black hover:bg-white hover:border-[#94A3B8] font-black shadow-xs transition-colors cursor-pointer"
          style={{ color: '#000000' }}
        >
          <HelpCircle className="w-4 h-4 text-black stroke-[2.5]" style={{ color: '#000000' }} />
          <span className="font-black text-[11px] text-black" style={{ color: '#000000' }}>Help</span>
        </button>

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (w-60 / 240px wide) */}
      <aside 
        id="app-desktop-sidebar"
        className="hidden md:block fixed top-0 left-0 bottom-0 w-60 z-30 border-r border-[#CBD5E1] bg-[#F1F5F9]"
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        >
          <div 
            className="w-72 max-w-[85vw] h-full border-r border-[rgba(169,191,165,0.2)] shadow-2xl animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}
