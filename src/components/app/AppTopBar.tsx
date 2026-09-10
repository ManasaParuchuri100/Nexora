import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Menu,
  CheckCircle2,
  Sparkles,
  Command,
  X
} from 'lucide-react';
import { NavCategory, SubCategory, SystemNotification } from '../../types';

interface AppTopBarProps {
  activeCategory: NavCategory;
  activeSubCategory: SubCategory;
  notifications: SystemNotification[];
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  onOpenQuickSearch: () => void;
  onSelectNav: (category: NavCategory, subCategory?: SubCategory) => void;
}

export default function AppTopBar({
  activeCategory,
  activeSubCategory,
  notifications,
  onOpenMobileMenu,
  onLogout,
  onOpenQuickSearch,
  onSelectNav
}: AppTopBarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = localNotifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setLocalNotifications(localNotifications.map(n => ({ ...n, unread: false })));
  };

  const formatCategoryTitle = (cat: NavCategory) => {
    switch (cat) {
      case 'insights': return 'Insights';
      case 'campaigns': return 'Campaigns';
      case 'creative-lab': return 'Creative Lab';
      case 'social-hub': return 'Social Hub';
      case 'leads': return 'Leads';
      case 'assistant': return 'Assistant';
      default: return cat;
    }
  };

  const formatSubCategoryTitle = (sub: SubCategory) => {
    switch (sub) {
      case 'live-leads': return 'Live Leads';
      case 'stats': return 'Stats';
      case 'trending-topics': return 'Trending Topics';
      case 'quick-actions': return 'Quick Actions';
      case 'campaigns-overview': return 'All Campaigns';
      case 'create-campaign': return 'Create New Campaign';
      case 'create': return 'Create Studio';
      case 'generated-assets': return 'Generated Assets';
      case 'connect': return 'Connect Accounts';
      case 'ai-guided-creation': return 'AI Guided Creation';
      case 'manual-scheduling': return 'Manual Scheduling';
      case 'lead-automation': return 'Lead Automation';
      case 'generated-responses': return 'Generated Responses';
      case 'overview': return 'Overview';
      default: return sub;
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full h-16 border-b border-[rgba(169,191,165,0.2)] bg-[#071C1A]/90 backdrop-blur-md transition-colors">
      <div className="h-full px-6 sm:px-10 flex items-center justify-between">
        {/* Left: Mobile hamburger & Breadcrumb */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden text-[#A9BFA5] hover:text-[#E8E9D8] p-1.5 focus:outline-none cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#A9BFA5]" aria-label="Breadcrumb">
            <span className="opacity-60 hidden sm:inline">nexora</span>
            <span className="opacity-40 hidden sm:inline">/</span>
            <span className="text-[#E8E9D8] font-medium">{formatCategoryTitle(activeCategory)}</span>
            {activeSubCategory && activeSubCategory !== 'overview' && (
              <>
                <span className="opacity-40">/</span>
                <span className="text-[#A9BFA5]/80 font-normal">{formatSubCategoryTitle(activeSubCategory)}</span>
              </>
            )}
          </nav>
        </div>

        {/* Right: Quick Search, Notifications, User Menu */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Quick Search trigger */}
          <button
            type="button"
            id="topbar-search-button"
            onClick={onOpenQuickSearch}
            className="group flex items-center space-x-2 text-xs text-[#A9BFA5]/75 hover:text-[#E8E9D8] px-2.5 py-1.5 rounded-[2px] hover:bg-[#0D2D2A]/40 transition-colors focus:outline-none cursor-pointer"
            title="Quick search (Ctrl+K or ⌘K)"
          >
            <Search className="w-4 h-4 text-[#A9BFA5] group-hover:text-[#E8E9D8]" strokeWidth={1.5} />
            <span className="hidden lg:inline text-[11px] font-light tracking-wide">Search workspace...</span>
            <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 border border-[rgba(169,191,165,0.25)] rounded-[2px] text-[#A9BFA5]/60 font-mono">⌘K</kbd>
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifMenuRef}>
            <button
              type="button"
              id="topbar-notifications-button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative text-[#A9BFA5] hover:text-[#E8E9D8] p-1.5 focus:outline-none cursor-pointer transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#E8E9D8] rounded-full ring-2 ring-[#071C1A]" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#071C1A] border border-[rgba(169,191,165,0.2)] shadow-2xl z-50 animate-fadeIn">
                <div className="p-4 border-b border-[rgba(169,191,165,0.15)] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-widest text-[#E8E9D8] font-medium">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#0D2D2A] text-[#A9BFA5] rounded-[2px] font-mono">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[11px] text-[#A9BFA5] hover:text-white transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[rgba(169,191,165,0.1)]">
                  {localNotifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-4 transition-colors hover:bg-[#0D2D2A]/30 ${
                        notif.unread ? 'bg-[#0D2D2A]/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-medium text-[#E8E9D8]">{notif.title}</h4>
                        <span className="text-[10px] text-[#A9BFA5]/60 font-mono whitespace-nowrap">{notif.time}</span>
                      </div>
                      <p className="text-xs text-[#A9BFA5]/80 font-light mt-1 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-[rgba(169,191,165,0.15)] text-center bg-[#061816]">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      onSelectNav('insights', 'live-leads');
                    }}
                    className="text-[11px] uppercase tracking-widest text-[#A9BFA5] hover:text-[#E8E9D8] transition-colors cursor-pointer"
                  >
                    View activity history &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[rgba(169,191,165,0.2)]" />

          {/* User Avatar + Dropdown Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              id="topbar-user-menu-button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 group focus:outline-none cursor-pointer py-1 px-1.5 rounded-[2px] hover:bg-[#0D2D2A]/30 transition-colors"
            >
              {/* Sharp, minimal avatar */}
              <div className="w-7 h-7 bg-[#0D2D2A] border border-[rgba(169,191,165,0.3)] flex items-center justify-center text-[11px] serif font-medium text-[#E8E9D8] group-hover:border-[#A9BFA5] transition-colors">
                EV
              </div>
              <span className="hidden sm:inline text-xs font-light text-[#E8E9D8] tracking-wide">
                Evelyn Vance
              </span>
              <ChevronDown 
                className={`w-3.5 h-3.5 text-[#A9BFA5]/60 transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180 text-[#E8E9D8]' : 'group-hover:text-[#E8E9D8]'
                }`} 
                strokeWidth={1.5} 
              />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div 
                id="topbar-user-dropdown"
                className="absolute right-0 mt-2 w-56 bg-[#071C1A] border border-[rgba(169,191,165,0.2)] shadow-2xl z-50 animate-fadeIn"
              >
                <div className="p-3.5 border-b border-[rgba(169,191,165,0.15)]">
                  <p className="text-xs font-medium text-[#E8E9D8]">Evelyn Vance</p>
                  <p className="text-[11px] text-[#A9BFA5]/70 font-light truncate">evelyn@nexora.studio</p>
                  <span className="inline-block mt-1.5 text-[9px] uppercase tracking-widest text-[#A9BFA5] bg-[#0D2D2A] px-1.5 py-0.5 border border-[rgba(169,191,165,0.2)] font-mono">
                    Pro Workspace
                  </span>
                </div>

                <div className="py-1 text-xs text-[#A9BFA5]">
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:text-[#E8E9D8] hover:bg-[#0D2D2A]/30 transition-colors text-left cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:text-[#E8E9D8] hover:bg-[#0D2D2A]/30 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:text-[#E8E9D8] hover:bg-[#0D2D2A]/30 transition-colors text-left cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Help</span>
                  </button>
                </div>

                <div className="p-1 border-t border-[rgba(169,191,165,0.15)]">
                  <button
                    type="button"
                    id="topbar-user-logout"
                    onClick={() => { setUserMenuOpen(false); onLogout(); }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-[#A9BFA5] hover:text-[#E8E9D8] hover:bg-[#0D2D2A]/40 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
