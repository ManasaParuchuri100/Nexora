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
  X,
  Sun,
  Moon
} from 'lucide-react';
import { NavCategory, SubCategory, SystemNotification } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AppTopBarProps {
  activeCategory: NavCategory;
  activeSubCategory: SubCategory;
  notifications: SystemNotification[];
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  onOpenQuickSearch: () => void;
  onSelectNav: (category: NavCategory, subCategory?: SubCategory) => void;
  onOpenSettings?: () => void;
}

export default function AppTopBar({
  activeCategory,
  activeSubCategory,
  notifications,
  onOpenMobileMenu,
  onLogout,
  onOpenQuickSearch,
  onSelectNav,
  onOpenSettings
}: AppTopBarProps) {
  const { theme, toggleTheme } = useTheme();
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
      case 'overview': return 'Overview';
      case 'engage': return 'Engage';
      case 'leads': return 'Leads';
      case 'content': return 'Content';
      case 'campaigns': return 'Campaigns';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      // Legacy
      case 'insights': return 'Insights';
      case 'creative-lab': return 'Content';
      case 'social-hub': return 'Social';
      case 'assistant': return 'Assistant';
      default: return cat;
    }
  };

  const formatSubCategoryTitle = (sub: SubCategory) => {
    switch (sub) {
      // Engage
      case 'inbox': return 'Inbox';
      case 'conversations': return 'Conversations';
      case 'human-handoff': return 'Human Handoff';
      // Leads
      case 'all-leads': return 'All Leads';
      case 'pipeline': return 'Pipeline';
      case 'follow-ups': return 'Follow-ups';
      // Content
      case 'ai-content': return 'AI Content';
      case 'social-posts': return 'Social Posts';
      case 'content-library': return 'Content Library';
      // Campaigns
      case 'campaigns-list': return 'Campaigns';
      case 'create-campaign': return 'Create Campaign';
      case 'campaign-performance': return 'Campaign Performance';
      // Analytics
      case 'analytics-overview': return 'Overview';
      case 'lead-analytics': return 'Lead Analytics';
      case 'channel-performance': return 'Channel Performance';
      // Settings
      case 'business-profile': return 'Business Profile';
      case 'channels': return 'Channels';
      case 'ai-automation': return 'AI & Automation';
      case 'team-access': return 'Team & Access';
      // Legacy
      case 'live-leads': return 'Live Leads';
      case 'stats': return 'Stats';
      case 'trending-topics': return 'Trending Topics';
      case 'quick-actions': return 'Quick Actions';
      case 'campaigns-overview': return 'Campaigns';
      case 'create': return 'Create Studio';
      case 'generated-assets': return 'Content Library';
      case 'connect': return 'Channels';
      case 'ai-guided-creation': return 'Creation';
      case 'manual-scheduling': return 'Scheduling';
      case 'lead-automation': return 'Automation';
      case 'generated-responses': return 'Responses';
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

          {/* Breadcrumb / Brand */}
          <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#A9BFA5]" aria-label="Breadcrumb">
            <span className="font-mono font-bold tracking-wider text-[#E8E9D8] hidden sm:inline">TECAVY</span>
            <span className="opacity-40 hidden sm:inline">/</span>
            <span className="text-[#E8E9D8] font-medium">{formatCategoryTitle(activeCategory)}</span>
            {activeSubCategory && activeSubCategory !== 'overview' && activeSubCategory !== 'default' && (
              <>
                <span className="opacity-40">/</span>
                <span className="text-[#A9BFA5]/80 font-normal">{formatSubCategoryTitle(activeSubCategory)}</span>
              </>
            )}
          </nav>
        </div>

        {/* Right: Quick Search, Notifications, User Menu */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Quick Search trigger */}
          <button
            type="button"
            id="topbar-search-button"
            onClick={onOpenQuickSearch}
            className="group flex items-center space-x-2 text-xs text-[#A9BFA5] hover:text-[#E8E9D8] px-2.5 py-1.5 rounded-[2px] bg-[#0D2D2A]/30 hover:bg-[#0D2D2A]/60 border border-[rgba(169,191,165,0.2)] transition-colors focus:outline-none cursor-pointer"
            title="Search workspace (Ctrl+K or ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#A9BFA5] group-hover:text-[#E8E9D8]" strokeWidth={1.75} />
            <span className="font-mono text-xs text-[#E8E9D8]">Search</span>
            <kbd className="hidden sm:inline text-[9px] px-1 py-0.2 border border-[rgba(169,191,165,0.25)] rounded-[2px] text-[#A9BFA5]/60 font-mono">⌘K</kbd>
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifMenuRef}>
            <button
              type="button"
              id="topbar-notifications-button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="flex items-center space-x-1.5 text-xs text-[#A9BFA5] hover:text-[#E8E9D8] px-2 py-1.5 rounded-[2px] hover:bg-[#0D2D2A]/40 focus:outline-none cursor-pointer transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 text-[#A9BFA5]" strokeWidth={1.5} />
              <span className="font-mono text-xs font-semibold px-1.5 py-0.2 bg-[#0D2D2A] border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] rounded-[2px]">
                {unreadCount > 0 ? unreadCount : 3}
              </span>
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

          {/* Theme Quick Toggle */}
          <button
            type="button"
            id="topbar-theme-toggle"
            onClick={toggleTheme}
            className="text-[#A9BFA5] hover:text-[#E8E9D8] p-1.5 focus:outline-none cursor-pointer transition-colors rounded-[2px] hover:bg-[#0D2D2A]/40 flex items-center justify-center"
            title={theme === 'light' ? 'Switch to Dark Mode (Botanical Noir)' : 'Switch to Light Mode (Botanical Ivory)'}
            aria-label="Toggle light or dark theme"
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            ) : (
              <Moon className="w-4 h-4 text-sky-300" strokeWidth={1.5} />
            )}
          </button>

          {/* Settings Trigger Icon */}
          {onOpenSettings && (
            <button
              type="button"
              id="topbar-settings-trigger"
              onClick={onOpenSettings}
              className="text-[#A9BFA5] hover:text-[#E8E9D8] p-1.5 focus:outline-none cursor-pointer transition-colors rounded-[2px] hover:bg-[#0D2D2A]/40"
              title="Workspace Settings"
              aria-label="Open workspace settings"
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}

          <div className="h-4 w-px bg-[rgba(169,191,165,0.2)]" />

          {/* User Avatar + Dropdown Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              id="topbar-user-menu-button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 group focus:outline-none cursor-pointer py-1.5 px-2.5 rounded-[2px] bg-[#0D2D2A]/30 hover:bg-[#0D2D2A]/60 border border-[rgba(169,191,165,0.2)] transition-colors"
            >
              {/* Sharp, minimal avatar indicator */}
              <div className="w-4 h-4 rounded-full border border-[#A9BFA5] flex items-center justify-center text-[9px] font-mono text-[#E8E9D8]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-mono font-medium text-[#E8E9D8] tracking-wide">
                Business
              </span>
              <ChevronDown 
                className={`w-3.5 h-3.5 text-[#A9BFA5] transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180 text-[#E8E9D8]' : 'group-hover:text-[#E8E9D8]'
                }`} 
                strokeWidth={1.5} 
              />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div 
                id="topbar-user-dropdown"
                className="absolute right-0 mt-2 w-60 bg-[#071C1A] border border-[rgba(169,191,165,0.2)] shadow-2xl z-50 animate-fadeIn"
              >
                <div className="p-3.5 border-b border-[rgba(169,191,165,0.15)]">
                  <p className="text-xs font-semibold text-[#E8E9D8]">Acme Studio</p>
                  <p className="text-[11px] text-[#A9BFA5]/70 font-light truncate">acme@tecavy.studio</p>
                  <span className="inline-block mt-1.5 text-[9px] uppercase tracking-widest text-[#A9BFA5] bg-[#0D2D2A] px-1.5 py-0.5 border border-[rgba(169,191,165,0.2)] font-mono">
                    Business Tier · Active
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
                    id="topbar-menu-settings-btn"
                    onClick={() => { 
                      setUserMenuOpen(false); 
                      if (onOpenSettings) onOpenSettings(); 
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:text-[#E8E9D8] hover:bg-[#0D2D2A]/30 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span className="flex-1">Settings</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[rgba(169,191,165,0.15)] text-[#A9BFA5]">
                      {theme === 'light' ? 'Light' : 'Dark'}
                    </span>
                  </button>

                  {/* Direct Theme Toggle option inside Settings dropdown */}
                  <button
                    type="button"
                    id="topbar-menu-theme-btn"
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:text-[#E8E9D8] hover:bg-[#0D2D2A]/30 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      {theme === 'light' ? (
                        <Moon className="w-3.5 h-3.5 text-sky-400" strokeWidth={1.5} />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
                      )}
                      <span>{theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span>
                    </div>
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
