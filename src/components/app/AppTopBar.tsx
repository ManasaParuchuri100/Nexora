import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  LogOut, 
  Menu,
  Sparkles,
  X,
  Sun,
  Moon,
  Plus,
  Calendar,
  Megaphone,
} from 'lucide-react';
import { NavCategory, SubCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_NAME, BRAND_COMPANY } from '../../config/brand';

interface AppTopBarProps {
  activeCategory: NavCategory;
  activeSubCategory: SubCategory;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  onOpenQuickSearch: () => void;
  onSelectNav: (category: NavCategory, subCategory?: SubCategory) => void;
  onTriggerNew: (type: 'lead' | 'post' | 'content' | 'campaign') => void;
  onOpenProfileDrawer?: () => void;
  onOpenLogin?: () => void;
  currentUser?: { name: string; email: string; workspace: string; role?: string } | null;
  currentRecordTitle?: string;
}

export default function AppTopBar({
  activeCategory,
  activeSubCategory,
  onOpenMobileMenu,
  onLogout,
  onOpenQuickSearch,
  onSelectNav,
  onTriggerNew,
  onOpenProfileDrawer,
  onOpenLogin,
  currentUser,
  currentRecordTitle
}: AppTopBarProps) {
  const { theme, setTheme } = useTheme();

  // Menus state
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const newMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(event.target as Node)) {
        setNewMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listeners for + New
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        onTriggerNew('lead');
      } else if (e.key === 'p' || e.key === 'P') {
        onTriggerNew('post');
      } else if (e.key === 'c' || e.key === 'C') {
        onTriggerNew('content');
      } else if (e.key === 'm' || e.key === 'M') {
        onTriggerNew('campaign');
      } else if (e.key === '?') {
        setShowShortcutsModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTriggerNew]);

  // Notifications State (Page 9 spec)
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      group: 'TODAY',
      unread: true,
      title: 'Rahul Sharma needs a human',
      time: '4m',
      detail: 'WhatsApp · asked for custom pricing',
      category: 'inbox' as NavCategory,
      sub: 'inbox' as SubCategory
    },
    {
      id: 'n-2',
      group: 'TODAY',
      unread: true,
      title: 'Aster Labs qualified as Hot',
      time: '22m',
      detail: 'Score 92 · budget & timeline verified',
      category: 'leads' as NavCategory,
      sub: 'all-leads' as SubCategory
    },
    {
      id: 'n-3',
      group: 'TODAY',
      unread: true,
      title: 'Follow-up due: Nova Retail',
      time: '1h',
      detail: 'Priya Mehta · Email revised proposal',
      category: 'leads' as NavCategory,
      sub: 'follow-ups' as SubCategory
    },
    {
      id: 'n-4',
      group: 'EARLIER',
      unread: false,
      title: '"Diwali offer" post published',
      time: 'Yest.',
      detail: 'Scheduled broadcast live on Instagram',
      category: 'content' as NavCategory,
      sub: 'schedule' as SubCategory
    },
    {
      id: 'n-5',
      group: 'EARLIER',
      unread: false,
      title: 'Aisha joined the workspace',
      time: 'Mon',
      detail: 'Role: Marketing · Invited by Owner',
      category: 'settings' as NavCategory,
      sub: 'team' as SubCategory
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const formatCategoryTitle = (cat: NavCategory, sub?: SubCategory) => {
    if (cat === 'leads' && sub === 'follow-ups') return 'Follow-ups';
    switch (cat) {
      case 'overview': return 'Overview';
      case 'inbox': return 'Inbox';
      case 'leads': return 'Leads';
      case 'agent': return 'Engagement Agent';
      case 'content': return 'Content';
      case 'campaigns': return 'Campaigns';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return cat;
    }
  };

  const iconBtn =
    'inline-flex items-center justify-center w-[35px] h-[35px] min-h-[35px]! rounded-[9px]! border border-line bg-surface text-ink-2 hover:bg-surface-hover hover:text-ink transition-colors cursor-pointer focus-visible:outline-none';
  const menuPanel =
    'absolute right-0 mt-2 bg-surface border border-line rounded-[13px] shadow-pop z-50 animate-fadeIn text-sm text-ink overflow-hidden';
  const menuItem =
    'w-full flex items-center justify-between gap-3 px-3.5 py-2 min-h-0! rounded-none! text-left text-ink hover:bg-surface-hover transition-colors cursor-pointer';
  const kbd = 'text-[10px] px-1.5 py-px border border-line rounded-[4px] text-ink-3 bg-surface-raised font-sans';

  return (
    <header className="sticky top-0 z-20 w-full h-14 sm:h-[67px] shrink-0 border-b border-line bg-surface/95 backdrop-blur-md select-none">
      <div className="h-full px-3 sm:px-6 lg:px-[39px] flex items-center justify-between gap-3 sm:gap-4">

        {/* Left: Mobile menu + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 min-h-0! text-ink-2 hover:text-ink cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden sm:flex items-center text-[12px] text-[#8391A3] min-w-0" aria-label="Breadcrumb">
            <span>{BRAND_COMPANY} workspace</span>
            <span className="mx-2.5">/</span>
            <button
              type="button"
              onClick={() => onSelectNav(activeCategory, activeSubCategory)}
              className="min-h-0! font-bold text-ink hover:text-brand transition-colors cursor-pointer truncate"
            >
              {formatCategoryTitle(activeCategory, activeSubCategory)}
            </button>
            {currentRecordTitle && (
              <>
                <span className="mx-2.5">/</span>
                <span className="font-semibold text-ink truncate max-w-[140px] sm:max-w-[260px]">
                  {currentRecordTitle}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-[11px]">

          <button
            type="button"
            id="topbar-search-button"
            onClick={onOpenQuickSearch}
            className="flex items-center gap-2 h-[35px] min-h-[35px]! rounded-[9px]! border border-line bg-surface-raised text-[#8592A4] hover:border-line-strong transition-colors px-2.5 sm:px-[15px] sm:min-w-[215px] cursor-pointer"
            title="Search workspace (⌘K or Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[13px] flex-1 text-left">Search</span>
            <kbd className={`hidden sm:inline ${kbd}`}>⌘K</kbd>
          </button>

          {/* + New */}
          <div className="relative" ref={newMenuRef}>
            <button
              type="button"
              id="topbar-new-button"
              onClick={() => setNewMenuOpen(!newMenuOpen)}
              className="nx-btn primary sm h-[35px] sm:h-auto"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">New</span>
            </button>

            {newMenuOpen && (
              <div className={`${menuPanel} w-52 py-1.5`}>
                {([
                  ['lead', 'Lead', User, 'L'],
                  ['post', 'Post', Calendar, 'P'],
                  ['content', 'Content', Sparkles, 'C'],
                  ['campaign', 'Campaign', Megaphone, 'M'],
                ] as const).map(([type, label, Icon, key]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setNewMenuOpen(false);
                      onTriggerNew(type);
                    }}
                    className={menuItem}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-ink-3" />
                      <span>{label}</span>
                    </span>
                    <kbd className={kbd}>{key}</kbd>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifMenuRef}>
            <button
              type="button"
              id="topbar-notifications-button"
              onClick={() => setNotifMenuOpen(!notifMenuOpen)}
              className={`${iconBtn} relative`}
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-brand text-on-brand text-[10px] font-semibold leading-4 text-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifMenuOpen && (
              <div className={`${menuPanel} w-80 sm:w-96`}>
                <div className="px-4 py-3 border-b border-line-subtle flex items-center justify-between">
                  <span className="font-display font-bold text-ink text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="min-h-0! text-xs font-semibold text-brand hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {(['TODAY', 'EARLIER'] as const).map(group => (
                    <div key={group}>
                      <div className="px-4 pt-3 pb-1 eyebrow text-ink-3!">
                        {group === 'TODAY' ? 'Today' : 'Earlier'}
                      </div>
                      {notifications.filter(n => n.group === group).map(notif => (
                        <button
                          key={notif.id}
                          type="button"
                          onClick={() => {
                            setNotifMenuOpen(false);
                            onSelectNav(notif.category, notif.sub);
                          }}
                          className="w-full min-h-0! rounded-none! text-left px-4 py-2.5 hover:bg-surface-hover transition-colors cursor-pointer border-b border-line-subtle last:border-b-0"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 min-w-0">
                              {notif.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
                              <span className={`text-[13px] truncate ${notif.unread ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                                {notif.title}
                              </span>
                            </span>
                            <span className="text-[11px] text-ink-3 shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-xs text-ink-3 mt-0.5 pl-3.5">{notif.detail}</p>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2.5 border-t border-line-subtle bg-surface-raised">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifMenuOpen(false);
                      onSelectNav('settings', 'notifications');
                    }}
                    className="min-h-0! text-xs font-semibold text-brand hover:underline cursor-pointer"
                  >
                    Notification settings →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            id="topbar-theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`${iconBtn} hidden sm:inline-flex`}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label="Toggle theme mode"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Account */}
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              id="topbar-user-menu"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-1.5 h-[35px] min-h-[35px]! rounded-[9px]! pl-0.5 pr-1.5 hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Account menu"
            >
              <span className="w-[29px] h-[29px] rounded-[9px] grid place-items-center bg-avatar text-avatar-ink text-[13px] font-extrabold uppercase">
                {(currentUser?.name || currentUser?.workspace || BRAND_NAME).split(/\s+/).map(w => w[0]).slice(0, 2).join('')}
              </span>
                            <ChevronDown className="w-3.5 h-3.5 text-ink-3" />
            </button>

            {accountMenuOpen && (
              <div className={`${menuPanel} w-60 py-1.5`}>
                <div className="px-3.5 py-2.5 border-b border-line-subtle mb-1">
                  <p className="font-semibold text-ink text-[13px] truncate">
                    {currentUser?.workspace || currentUser?.name || `${BRAND_NAME} Workspace`}
                  </p>
                  <p className="text-xs text-ink-3 truncate">
                    {currentUser?.email || `alex@${BRAND_NAME.toLowerCase()}.com`} · {currentUser?.role || 'Owner'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    if (onOpenProfileDrawer) onOpenProfileDrawer();
                    else onSelectNav('settings', 'business');
                  }}
                  className={menuItem}
                >
                  Your profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    if (onOpenLogin) onOpenLogin();
                    else onLogout();
                  }}
                  className={menuItem}
                >
                  Switch account
                </button>

                <div className="px-3.5 py-2 flex items-center justify-between text-ink-2">
                  <span>Theme</span>
                  <div className="flex items-center gap-1 p-0.5 rounded-[8px] bg-surface-raised border border-line-subtle">
                    {(['light', 'dark'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTheme(mode)}
                        className={`min-h-0! px-2.5 py-0.5 rounded-[6px]! text-xs capitalize cursor-pointer transition-colors ${
                          theme === mode ? 'bg-surface text-brand font-semibold shadow-card' : 'text-ink-3 hover:text-ink'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setShowShortcutsModal(true);
                  }}
                  className={menuItem}
                >
                  <span>Keyboard shortcuts</span>
                  <kbd className={kbd}>?</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    onSelectNav('settings', 'billing');
                  }}
                  className={menuItem}
                >
                  Billing
                </button>

                <div className="border-t border-line-subtle my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    onLogout();
                  }}
                  className={`${menuItem} text-danger!`}
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Log out
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts dialog */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-[2px] p-4 animate-fadeIn"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface border border-line rounded-[16px] shadow-modal p-7 text-sm text-ink"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">Keyboard shortcuts</h2>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className={iconBtn}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-line-subtle">
              {[
                ['Open command palette', '⌘K / Ctrl+K'],
                ['Create new lead', 'L'],
                ['Create new post', 'P'],
                ['Create content', 'C'],
                ['Create campaign', 'M'],
                ['Inbox navigation', 'J / K'],
                ['Take over conversation', 'T'],
              ].map(([label, key]) => (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <span className="text-ink-2">{label}</span>
                  <kbd className={kbd}>{key}</kbd>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="h-9 min-h-9! px-4 rounded-[9px]! bg-brand text-on-brand font-semibold hover:bg-brand-hover cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
