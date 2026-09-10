import React, { useState } from 'react';
import { 
  Activity, 
  Megaphone, 
  Wand2, 
  Share2, 
  Users, 
  Sparkles,
  ChevronRight,
  LogOut,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { NavCategory, SubCategory } from '../../types';

interface AppSidebarProps {
  activeCategory: NavCategory;
  activeSubCategory: SubCategory;
  onSelectNav: (category: NavCategory, subCategory?: SubCategory) => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: NavCategory;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  subItems?: { id: SubCategory; label: string }[];
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'insights',
    label: 'Insights',
    icon: Activity,
    subItems: [
      { id: 'live-leads', label: 'Live Leads' },
      { id: 'stats', label: 'Stats' },
      { id: 'trending-topics', label: 'Trending Topics' },
      { id: 'quick-actions', label: 'Quick Actions' }
    ]
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: Megaphone,
    subItems: [
      { id: 'campaigns-overview', label: 'All Campaigns' },
      { id: 'create-campaign', label: 'Create New Campaign' }
    ]
  },
  {
    id: 'creative-lab',
    label: 'Creative Lab',
    icon: Wand2,
    subItems: [
      { id: 'create', label: 'Create' },
      { id: 'generated-assets', label: 'Generated Assets' }
    ]
  },
  {
    id: 'social-hub',
    label: 'Social Hub',
    icon: Share2,
    subItems: [
      { id: 'connect', label: 'Connect' },
      { id: 'ai-guided-creation', label: 'AI Guided Creation' },
      { id: 'manual-scheduling', label: 'Manual Scheduling' }
    ]
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: Users,
    subItems: [
      { id: 'live-leads', label: 'Pipeline Board' },
      { id: 'lead-automation', label: 'Lead Automation' },
      { id: 'generated-responses', label: 'Generated Responses' }
    ]
  },
  {
    id: 'assistant',
    label: 'Assistant',
    icon: Sparkles
  }
];

export default function AppSidebar({
  activeCategory,
  activeSubCategory,
  onSelectNav,
  onLogout,
  isOpenMobile,
  onCloseMobile
}: AppSidebarProps) {
  // Track hovered category for smooth submenu display
  const [hoveredCategory, setHoveredCategory] = useState<NavCategory | null>(null);

  // For mobile/touch support, also allow explicit tap toggle
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<NavCategory | null>('insights');

  const handleCategoryClick = (category: NavCategory, hasSubItems: boolean) => {
    if (hasSubItems) {
      // If clicking category directly, default to first subitem or toggle for mobile
      setMobileExpandedCategory(prev => (prev === category ? null : category));
      const config = NAV_ITEMS.find(n => n.id === category);
      if (config?.subItems && config.subItems.length > 0) {
        onSelectNav(category, config.subItems[0].id);
      } else {
        onSelectNav(category, 'overview');
      }
    } else {
      onSelectNav(category, 'overview');
      onCloseMobile();
    }
  };

  const handleSubItemClick = (category: NavCategory, subCategory: SubCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNav(category, subCategory);
    onCloseMobile();
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-[#071C1A] select-none text-[#A9BFA5]">
      {/* Sidebar Header / Brand */}
      <div className="px-6 py-7 border-b border-[rgba(169,191,165,0.2)] flex items-center justify-between">
        <button
          type="button"
          onClick={() => onSelectNav('insights', 'live-leads')}
          className="group flex items-baseline space-x-2 text-left focus:outline-none cursor-pointer"
        >
          <span className="serif text-2xl font-medium tracking-tight text-[#E8E9D8] group-hover:text-white transition-colors lowercase">
            nexora
          </span>
          <span className="inline-block w-1.5 h-1.5 bg-[#A9BFA5] rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Close button on mobile */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden text-[#A9BFA5] hover:text-[#E8E9D8] p-1.5 focus:outline-none"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-3 text-[10px] uppercase tracking-widest-plus text-[#A9BFA5]/50 font-medium">
          Command
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isCategoryActive = activeCategory === item.id;
          const hasSub = !!(item.subItems && item.subItems.length > 0);
          
          // Revealed when hovered on desktop or expanded on mobile or active
          const isHovered = hoveredCategory === item.id;
          const isMobileExpanded = mobileExpandedCategory === item.id;
          const showSubmenu = hasSub && (isHovered || isMobileExpanded || isCategoryActive);

          return (
            <div
              key={item.id}
              className="relative group"
              onMouseEnter={() => setHoveredCategory(item.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Category button */}
              <button
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleCategoryClick(item.id, hasSub)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[2px] text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer focus:outline-none text-left ${
                  isCategoryActive
                    ? 'text-[#E8E9D8] bg-[#0D2D2A]/50 border-l-2 border-[#A9BFA5] pl-2.5'
                    : 'text-[#A9BFA5] hover:text-[#E8E9D8] hover:bg-[#0D2D2A]/30 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon 
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isCategoryActive ? 'text-[#E8E9D8]' : 'text-[#A9BFA5]/80 group-hover:text-[#E8E9D8]'
                    }`}
                    strokeWidth={1.5}
                  />
                  <span className="font-normal truncate">{item.label}</span>
                </div>

                {hasSub && (
                  <span 
                    className={`text-[9px] text-[#A9BFA5]/60 transition-transform duration-200 ${
                      showSubmenu ? 'rotate-90 text-[#E8E9D8]' : ''
                    }`}
                  >
                    <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
                  </span>
                )}
              </button>

              {/* Submenu: smoothly reveals underneath with subtle tree/bracket lines */}
              {hasSub && (
                <div
                  className={`overflow-hidden transition-all duration-200 ease-out ${
                    showSubmenu ? 'max-h-56 opacity-100 mt-1 mb-1.5' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="pl-7 pr-2 py-1 space-y-0.5 border-l border-[rgba(169,191,165,0.15)] ml-5">
                    {item.subItems?.map((sub) => {
                      const isSubActive = isCategoryActive && activeSubCategory === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          id={`sidebar-subnav-${item.id}-${sub.id}`}
                          onClick={(e) => handleSubItemClick(item.id, sub.id, e)}
                          className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-[2px] text-[11px] font-light tracking-wide transition-all duration-150 cursor-pointer focus:outline-none text-left ${
                            isSubActive
                              ? 'text-[#E8E9D8] font-normal bg-[#0D2D2A]/60 text-shadow-sm border-l border-[#A9BFA5]'
                              : 'text-[#A9BFA5]/75 hover:text-[#E8E9D8] hover:bg-[#0D2D2A]/20'
                          }`}
                        >
                          <span className="w-1 h-px bg-[rgba(169,191,165,0.3)]" />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer: System Status & User Action */}
      <div className="p-4 border-t border-[rgba(169,191,165,0.2)] bg-[#071C1A]/60">
        <div className="px-2 py-2 mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#A9BFA5]/60">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            <span>Workspace Sync</span>
          </span>
          <span className="font-mono text-[9px] text-[#A9BFA5]/50">v2.4</span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          id="sidebar-logout-button"
          className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-widest text-[#A9BFA5]/75 hover:text-[#E8E9D8] hover:bg-[#0D2D2A]/40 rounded-[2px] transition-colors cursor-pointer focus:outline-none"
        >
          <span className="flex items-center space-x-2.5">
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Log out</span>
          </span>
          <span className="text-[10px] opacity-40">&rarr;</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (w-60 or 240px wide) */}
      <aside 
        id="app-desktop-sidebar"
        className="hidden md:block fixed top-0 left-0 bottom-0 w-60 z-30 border-r border-[rgba(169,191,165,0.2)] bg-[#071C1A]"
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Backdrop & Drawer */}
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
