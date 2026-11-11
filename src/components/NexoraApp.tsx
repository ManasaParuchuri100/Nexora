import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { 
  NavCategory, 
  SubCategory, 
  Lead, 
  Campaign, 
  TrendingTopic, 
  StatMetric, 
  GeneratedAsset, 
  SocialAccount, 
  ScheduledPost,
  SystemNotification 
} from '../types';

import { 
  INITIAL_METRICS, 
  INITIAL_LEADS, 
  INITIAL_TRENDING_TOPICS, 
  INITIAL_CAMPAIGNS, 
  INITIAL_GENERATED_ASSETS, 
  INITIAL_SOCIAL_ACCOUNTS, 
  INITIAL_SCHEDULED_POSTS,
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';

import AppSidebar from './app/AppSidebar';
import AppTopBar from './app/AppTopBar';
import OverviewView from './app/OverviewView';
import EngageView from './app/EngageView';
import LeadsView from './app/LeadsView';
import CreativeLabView from './app/CreativeLabView';
import SocialHubView from './app/SocialHubView';
import { contentTabFor } from './app/ContentTabs';
import { postDate } from '../data/schedule';
import CampaignsView from './app/CampaignsView';
import AnalyticsView from './app/AnalyticsView';
import MarketIntelligenceView from './app/MarketIntelligenceView';
import OnboardingView from './app/OnboardingView';
import OnboardingFlow from './OnboardingFlow';
import { getSetupStatus } from '../data/setup';
import SettingsView from './app/SettingsView';
import AssistantView from './app/AssistantView';
import ActionModals from './app/ActionModals';
import CommandPalette from './app/CommandPalette';
import SettingsModal from './app/SettingsModal';
import LeadIntelligenceWorkspace from './app/leads/LeadIntelligenceWorkspace';
import AgentView from './app/AgentView';
import { PageHeader } from './ui';
import { UserSession } from './AuthModal';
import { BRAND_NAME } from '../config/brand';
import { setGlobalConversations, useConversations } from '../data/conversations';
import { getFollowUpsForLead, deleteFollowUp, restoreFollowUp, FollowUp, runFollowUpAutomation } from '../data/followUps';
import { assertDataIntegrity } from '../lib/pipeline';

interface NexoraAppProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  onReturnToLanding: () => void;
  currentUser?: UserSession | null;
  onOpenLogin?: () => void;
  initialFirstRun?: boolean;
}

/** Destinations with local tabs reopen on the tab last used in this session. */
const REMEMBER_TABS: NavCategory[] = ['leads', 'content', 'analytics', 'market', 'settings'];

export default function NexoraApp({
  onReturnToLanding,
  currentUser,
  onOpenLogin,
  initialFirstRun = false
}: NexoraAppProps) {
  // Navigation State (Overview is the top-level default)
  const [activeCategory, setActiveCategory] = useState<NavCategory>('overview');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>('default');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(initialFirstRun);

  // Application Data States
  const [metrics, setMetrics] = useState<StatMetric[]>(INITIAL_METRICS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>(INITIAL_TRENDING_TOPICS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [assets, setAssets] = useState<GeneratedAsset[]>(INITIAL_GENERATED_ASSETS);
  const [accounts, setAccounts] = useState<SocialAccount[]>(INITIAL_SOCIAL_ACCOUNTS);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(INITIAL_SCHEDULED_POSTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // Interactive Modals State
  const [activeModal, setActiveModal] = useState<'campaign' | 'content' | 'lead' | 'schedule' | 'lead-details' | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDemoWorkspace, setIsDemoWorkspace] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Toast Notification with optional undo action
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    desc: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (
    title: string,
    desc: string,
    action?: { label: string; onClick: () => void },
    duration = 4000
  ) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ title, desc, action });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, duration);
  };

  // Live conversations store for cross-tab sync and integrity checks
  const [conversations] = useConversations();

  useEffect(() => {
    if (import.meta.env.DEV) {
      assertDataIntegrity(leads, conversations);
    }
  }, []);

  // Keyboard shortcut for command palette (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync browser URL with view state (Rule 1: Every page has a URL)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const parts = path.split('/');
      const cat = (parts[0] === 'setup' ? 'onboarding' : parts[0] || 'overview') as NavCategory;
      const sub = (parts[1] || (cat === 'overview' ? 'overview' : 'default')) as SubCategory;
      setActiveCategory(cat);
      setActiveSubCategory(sub);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sidebar: 232px, or a 72px rail. Narrow desktops and tablets start collapsed until a choice is saved.
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexora_sidebar_collapsed');
      if (saved === '1' || saved === '0') return saved === '1';
    } catch { /* storage unavailable */ }
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  });
  const toggleSidebar = () =>
    setSidebarCollapsed(prev => {
      try { localStorage.setItem('nexora_sidebar_collapsed', prev ? '0' : '1'); } catch { /* storage unavailable */ }
      return !prev;
    });
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const workspaceBase = currentUser?.workspace || `${BRAND_NAME} Workspace`;
  const [workspaceChoice, setWorkspaceChoice] = useState<string | null>(null);
  const currentWorkspaceName = workspaceChoice ?? workspaceBase;
  const toggleDemoWorkspace = (val: boolean) => {
    setIsDemoWorkspace(val);
    showToast(val ? 'Demo Workspace Active' : 'Live Workspace', val ? 'Showing simulated sample data.' : 'Switched to live production workspace.');
  };
  // Recomputed on every render, so the sidebar badge follows changes made in Settings or onboarding.
  const setupProgress = getSetupStatus(isFirstRun);
  const lastTab = useRef<Partial<Record<NavCategory, SubCategory>>>({});
  const handleSelectNav = (category: NavCategory, subCategory?: SubCategory) => {
    if (activeModal === 'lead-details') setActiveModal(null);

    // Normalization for routes
    let targetCategory: NavCategory = category;
    let targetSub: SubCategory | undefined = subCategory;

    if (category === 'engage') {
      targetCategory = 'inbox';
    } else if (category === 'insights') {
      targetCategory = 'overview';
      targetSub = 'dashboard';
    } else if (category === 'creative-lab') {
      targetCategory = 'content';
      targetSub = subCategory === 'generated-assets' ? 'library' : 'create';
    } else if (category === 'social-hub') {
      targetCategory = 'content';
      targetSub = 'schedule';
    }

    // Default subcategory per main tab. Destinations with local tabs reopen on the last tab used.
    const resolvedSub: SubCategory = targetSub || (REMEMBER_TABS.includes(targetCategory) ? lastTab.current[targetCategory] : undefined) || (
      targetCategory === 'overview'
        ? 'overview'
        : targetCategory === 'inbox'
        ? 'inbox'
        : targetCategory === 'leads'
        ? 'all-leads'
        : targetCategory === 'agent'
        ? 'default'
        : targetCategory === 'content'
        ? 'create'
        : targetCategory === 'campaigns'
        ? 'campaign-list'
        : targetCategory === 'analytics'
        ? 'overview'
        : targetCategory === 'market'
        ? 'recommendations'
        : targetCategory === 'settings'
        ? 'business'
        : 'default'
    );

    // If navigating to lead drawer / page, ensure a lead is selected
    if (resolvedSub === 'lead-page' || resolvedSub === 'lead-details') {
      if (!selectedLead && leads.length > 0) {
        setSelectedLead(leads[0]);
      }
    } else if (targetCategory !== 'leads') {
      setSelectedLead(null);
    }

    if (REMEMBER_TABS.includes(targetCategory) && resolvedSub !== 'lead-page' && resolvedSub !== 'lead-details') {
      lastTab.current[targetCategory] = resolvedSub;
    }
    setActiveCategory(targetCategory);
    setActiveSubCategory(resolvedSub);

    // Sync browser URL history (Rule 1) with safe sandboxed iframe fallback
    try {
      // /onboarding is the standalone sign-up route, so the in-app Onboarding page uses /setup.
      const newPath = `/${targetCategory === 'onboarding' ? 'setup' : targetCategory}${resolvedSub && resolvedSub !== 'default' && resolvedSub !== targetCategory && resolvedSub !== 'overview' ? `/${resolvedSub}` : ''}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    } catch {
      // Sandboxed iframes may block history.pushState; state update still succeeds
    }

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Ignore scroll errors in headless/iframe test runners
    }
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => {
      if (!prev.some(l => l.id === updatedLead.id)) {
        return [updatedLead, ...prev];
      }
      return prev.map(l => l.id === updatedLead.id ? updatedLead : l);
    });
  };

  const handleTriggerQuickAction = (action: 'campaign' | 'content' | 'lead' | 'schedule') => {
    setActiveModal(action);
  };

  const handleSelectLead = (lead: Lead) => {
    setLeads(prev => {
      if (!prev.some(l => l.id === lead.id)) {
        return [lead, ...prev];
      }
      return prev;
    });
    setSelectedLead(lead);
    setActiveModal('lead-details');
  };

  const handleDeleteLeads = (ids: string[]) => {
    if (!ids.length) return;
    const deletedLeadsList = leads.filter(l => ids.includes(l.id));
    const deletedConvosList = conversations.filter(c => ids.includes(c.id) || (c.leadReferenceId && ids.includes(c.leadReferenceId)));
    const deletedTasksList = ids.flatMap(id => getFollowUpsForLead(id));

    // Remove leads
    setLeads(prev => prev.filter(l => !ids.includes(l.id)));
    // Remove linked conversations
    setGlobalConversations(prev => prev.filter(c => !ids.includes(c.id) && (!c.leadReferenceId || !ids.includes(c.leadReferenceId))));
    // Delete follow-up tasks
    ids.forEach(id => {
      getFollowUpsForLead(id).forEach(task => deleteFollowUp(task.id));
    });

    // 8-second Undo toast
    showToast(
      'Leads Deleted',
      `Removed ${ids.length} lead${ids.length > 1 ? 's' : ''}.`,
      {
        label: 'Undo',
        onClick: () => {
          setLeads(prev => [...deletedLeadsList, ...prev]);
          setGlobalConversations(prev => [...deletedConvosList, ...prev]);
          deletedTasksList.forEach(t => restoreFollowUp(t));
          showToast('Restored', `Restored ${ids.length} lead${ids.length > 1 ? 's' : ''}.`);
        }
      },
      8000
    );
  };

  const handleNavigateInbox = (lead: Lead) => {
    handleSelectNav('inbox', 'inbox');
  };

  const handleAddLead = (newLead: Lead) => {
    setLeads([newLead, ...leads]);
    setMetrics(metrics.map(m => m.id === 'leads' ? { ...m, value: (parseInt(m.value) + 1).toString() } : m));
    showToast('Lead Created', `Added ${newLead.name} (${newLead.company}) to pipeline.`);
  };

  const handleAddCampaign = (newCamp: Campaign) => {
    setCampaigns([newCamp, ...campaigns]);
    setMetrics(metrics.map(m => m.id === 'campaigns' ? { ...m, value: (parseInt(m.value) + 1).toString() } : m));
    showToast('Campaign Launched', `"${newCamp.name}" has been created.`);
  };

  const handleAddAsset = (newAsset: GeneratedAsset) => {
    setAssets([newAsset, ...assets]);
    showToast('Asset Saved', `"${newAsset.title}" added to your content library.`);
  };

  const handleAddScheduledPost = (newPost: ScheduledPost) => {
    const at = newPost.scheduledAt ? undefined : postDate(newPost);
    setScheduledPosts(prev => [at ? { ...newPost, scheduledAt: at.toISOString() } : newPost, ...prev]);
    showToast('Broadcast Scheduled', `Queued for release across ${newPost.platforms.join(', ')} at ${newPost.scheduledTime}.`);
  };

  const handleDeleteScheduledPost = (id: string) => {
    setScheduledPosts(prev => prev.filter(p => p.id !== id));
    showToast('Broadcast Removed', 'The scheduled broadcast has been canceled and removed from the calendar.');
  };

  const handleUpdateScheduledPost = (updated: ScheduledPost) => {
    setScheduledPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  // Follow-up engine tick: sends approved AI follow-ups that have fallen due
  // (skipping human-handled leads) and chains the next attempt.
  const leadsRef = useRef(leads);
  leadsRef.current = leads;
  useEffect(() => {
    const tick = () => {
      const sent = runFollowUpAutomation(id => {
        const l = leadsRef.current.find(x => x.id === id);
        if (!l) return undefined;
        const temp = l.temperatureOverride || l.temperature || (l.score >= 80 ? 'HOT' : l.score >= 50 ? 'WARM' : 'COLD');
        return {
          handlingMode: l.handlingMode,
          temperature: temp,
          firstName: l.name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').split(/\s+/)[0],
        };
      });
      if (sent.length) {
        showToast(
          'Engagement Agent sent follow-ups',
          sent.length === 1
            ? `"${sent[0].title}" was sent. The next attempt is scheduled if there's no reply.`
            : `${sent.length} approved follow-ups were sent. Next attempts are scheduled if there's no reply.`
        );
      }
    };
    const first = setTimeout(tick, 1500);
    const timer = setInterval(tick, 30000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isInbox = activeCategory === 'inbox' || activeCategory === 'engage';

  return (
    <div className={`bg-canvas text-ink font-sans relative ${
      isInbox ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen'
    }`}>
      {/* Fixed Left Sidebar Navigation (10-item spec) */}
      <AppSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        onSelectNav={handleSelectNav}
        onLogout={onReturnToLanding}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isDemoWorkspace={isDemoWorkspace}
        onOpenHelp={() => setIsHelpOpen(true)}
        userName={currentUser?.name || 'Alex'}
        userRole={currentUser?.role || 'Owner'}
        workspaceName={currentWorkspaceName}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
        setupProgress={setupProgress}
      />

      {/* Main Workspace Frame */}
      {(() => {
        return (
          <div className={`${sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-[248px]'} transition-[padding] duration-200 flex flex-col ${isInbox ? 'h-full flex-1 min-h-0 overflow-hidden' : 'min-h-screen'}`}>
            {/* Top Navigation Bar with Dynamic Breadcrumb */}
            <AppTopBar
              workspaceName={currentWorkspaceName}
              workspaceBaseName={workspaceBase}
              onSelectWorkspace={name => { setWorkspaceChoice(name); showToast('Workspace switched', `Now viewing ${name}.`); }}
              isDemoWorkspace={isDemoWorkspace}
              onToggleDemoWorkspace={toggleDemoWorkspace}
              activeCategory={activeCategory}
              activeSubCategory={activeSubCategory}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              onLogout={onReturnToLanding}
              onOpenQuickSearch={() => setIsSearchOpen(true)}
              onSelectNav={handleSelectNav}
              onOpenProfileDrawer={() => setIsProfileOpen(true)}
              onOpenLogin={onOpenLogin}
              currentUser={currentUser}
              currentRecordTitle={selectedLead ? selectedLead.company || selectedLead.name : undefined}
              onTriggerNew={(type) => {
                if (type === 'lead') setActiveModal('lead');
                else if (type === 'post') setActiveModal('schedule');
                else if (type === 'content') handleSelectNav('content', 'create');
                else if (type === 'campaign') handleSelectNav('campaigns', 'create-campaign');
              }}
            />

            {/* Dynamic Main Workspace Content (Constant navigation & page views) */}
            <main className={`flex-1 w-full flex flex-col relative ${isInbox ? 'min-h-0 overflow-hidden' : 'min-h-[calc(100vh-65px)]'}`}>
              
              <div className={
                isInbox
                  ? "max-w-[1430px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-6 lg:pb-8 flex-1 min-h-0 flex flex-col overflow-y-auto"
                  : "max-w-[1430px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24"
              }>
            {/* 1. OVERVIEW */}
            {activeCategory === 'overview' && (
              <OverviewView
                metrics={metrics}
                leads={leads}
                campaigns={campaigns}
                trendingTopics={trendingTopics}
                onNavigate={handleSelectNav}
                onSelectLead={handleSelectLead}
                onTriggerQuickAction={handleTriggerQuickAction}
                isFirstRun={isFirstRun}
                userName={currentUser?.name}
                onNotify={showToast}
              />
            )}

            {/* 2. INBOX (Views, Conversation) */}
            {(activeCategory === 'inbox' || activeCategory === 'engage') && (
              <>
              <PageHeader
                eyebrow="Workspace / Inbox"
                title="Inbox"
                subtitle="One conversation, one lead record, one clear owner."
                className="shrink-0 mb-[18px]!"
                actions={
                  <button type="button" className="nx-btn" onClick={() => handleSelectNav('settings', 'channels')}>
                    Manage channels
                  </button>
                }
              />
              <EngageView
                activeSubCategory={activeSubCategory}
                leads={leads}
                onNavigateSub={(sub) => handleSelectNav('inbox', sub)}
                onSelectLead={handleSelectLead}
                onNotify={showToast}
                isFirstRun={isFirstRun}
                onNavigateSettings={() => handleSelectNav('settings', 'channels')}
              />
              </>
            )}

            {/* 3. LEADS (All Leads table, Pipeline board, Follow-ups) */}
            {activeCategory === 'leads' && (
              <LeadsView
                activeSubCategory={activeSubCategory}
                leads={leads}
                selectedLead={selectedLead}
                onNavigateSub={(sub) => handleSelectNav('leads', sub)}
                onSelectLead={handleSelectLead}
                onAddLeadModal={() => setActiveModal('lead')}
                onUpdateLead={handleUpdateLead}
                onDeleteLeads={handleDeleteLeads}
                onNavigateInbox={handleNavigateInbox}
                onNotify={showToast}
                isFirstRun={isFirstRun}
              />
            )}

            {/* Engagement Agent */}
            {activeCategory === 'agent' && (
              <AgentView onNavigate={handleSelectNav} />
            )}

            {/* 4. CONTENT (Create, Schedule, Library) */}
            {activeCategory === 'content' && (
              <>
                {(activeSubCategory === 'create' || activeSubCategory === 'ai-content') && (
                  <CreativeLabView
                    activeSubCategory="create"
                    assets={assets}
                    onNavigateSub={(sub) => handleSelectNav('content', sub)}
                    onGenerateSuccess={handleAddAsset}
                    campaigns={campaigns}
                    onSchedulePost={handleAddScheduledPost}
                    onUpdateAsset={(id, patch) => setAssets(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)))}
                  />
                )}

                {contentTabFor(activeSubCategory) === 'schedule' && (
                  <SocialHubView
                    activeSubCategory={
                      activeSubCategory === 'connect' || activeSubCategory === 'ai-guided-creation'
                        ? activeSubCategory
                        : 'calendar'
                    }
                    accounts={accounts}
                    scheduledPosts={scheduledPosts}
                    onNavigateSub={(sub) => handleSelectNav('content', sub)}
                    onSchedulePostSuccess={() => showToast('Broadcast Queued', 'Queued for release.')}
                    onAddScheduledPost={handleAddScheduledPost}
                    onDeleteScheduledPost={handleDeleteScheduledPost}
                    onUpdateScheduledPost={handleUpdateScheduledPost}
                    isFirstRun={isFirstRun}
                    libraryCount={assets.length}
                  />
                )}

                {(activeSubCategory === 'library' || activeSubCategory === 'content-library' || activeSubCategory === 'generated-assets') && (
                  <CreativeLabView
                    activeSubCategory="generated-assets"
                    assets={assets}
                    onNavigateSub={(sub) => handleSelectNav('content', sub)}
                    onGenerateSuccess={handleAddAsset}
                    campaigns={campaigns}
                    onSchedulePost={handleAddScheduledPost}
                    onUpdateAsset={(id, patch) => setAssets(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)))}
                  />
                )}
              </>
            )}

            {/* 5. CAMPAIGNS (Campaigns, Create Campaign, Campaign Performance) */}
            {activeCategory === 'campaigns' && (
              <CampaignsView
                campaigns={campaigns}
                activeSubCategory={activeSubCategory}
                onAddCampaign={handleAddCampaign}
                onUpdateCampaign={(updated) => {
                  setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
                }}
                onNavigateToModule={(cat, sub) => handleSelectNav(cat as NavCategory, (sub as SubCategory) || 'overview')}
                isFirstRun={isFirstRun}
                assets={assets}
              />
            )}

            {/* 6. ANALYTICS (Overview, Lead Analytics, Channel Performance) */}
            {activeCategory === 'analytics' && (
              <AnalyticsView
                activeSubCategory={activeSubCategory}
                onNavigateSub={(sub) => handleSelectNav('analytics', sub)}
                metrics={metrics}
                isFirstRun={isFirstRun}
                onNavigateTo={handleSelectNav}
                onNotify={showToast}
              />
            )}

            {activeCategory === 'onboarding' && (
              <OnboardingView
                isFirstRun={isFirstRun}
                onNavigateTo={handleSelectNav}
                onStartSetup={() => setIsSetupOpen(true)}
                onNotify={showToast}
              />
            )}

            {activeCategory === 'market' && (
              <MarketIntelligenceView
                activeSubCategory={activeSubCategory}
                onNavigateSub={(sub) => handleSelectNav('market', sub)}
                onNavigateTo={handleSelectNav}
                onNotify={showToast}
                isFirstRun={isFirstRun}
              />
            )}

            {/* 7. SETTINGS (Business Profile, Channels, AI & Automation, Team & Access) */}
            {activeCategory === 'settings' && (
              <SettingsView
                activeSubCategory={activeSubCategory}
                onNavigateSub={(sub) => handleSelectNav('settings', sub)}
                onNotify={showToast}
              />
            )}

            {/* Legacy Assistant View if selected */}
            {activeCategory === 'assistant' && (
              <AssistantView
                metrics={metrics}
                leads={leads}
                campaigns={campaigns}
                onTriggerQuickAction={handleTriggerQuickAction}
              />
            )}

            {!isInbox && (
              <div className="nx-footerhint flex items-center gap-2 flex-wrap">
                <span>{`TECAVY ${BRAND_NAME.toUpperCase()}`} · {isFirstRun ? 'First-run workspace' : 'Sample workspace data'}</span>
                {import.meta.env.DEV && (
                  <>
                    <span>·</span>
                    <button
                      type="button"
                      id="toggle-first-run-mode-btn"
                      onClick={() => {
                        const nextState = !isFirstRun;
                        setIsFirstRun(nextState);
                        showToast(
                          nextState ? 'First-run mode' : 'Demo mode',
                          nextState ? 'Displaying initial empty state views.' : 'Loaded sample leads, metrics, and conversations.'
                        );
                      }}
                      className="min-h-0! underline underline-offset-2 hover:text-brand cursor-pointer"
                    >
                      {isFirstRun ? 'Show demo data' : 'View empty states'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Lead Intelligence Workspace Drawer (Slide-over keeps main view & navigation constant!) */}
          {selectedLead && (
            <LeadIntelligenceWorkspace
              key={selectedLead.id}
              lead={selectedLead}
              onClose={() => {
                setSelectedLead(null);
                if (activeModal === 'lead-details') setActiveModal(null);
              }}
              onUpdateLead={(updated) => {
                handleUpdateLead(updated);
                setSelectedLead(updated);
              }}
              onNavigate={(category, sub) => {
                setSelectedLead(null);
                handleSelectNav(category, sub);
              }}
              onNotify={showToast}
            />
          )}
        </main>
      </div>
        );
      })()}

      {/* Interactive Action Modals */}
      <ActionModals
        activeModal={activeModal === 'lead-details' ? null : activeModal}
        selectedLead={selectedLead}
        onClose={() => { setActiveModal(null); setSelectedLead(null); }}
        onAddLead={handleAddLead}
        onAddCampaign={handleAddCampaign}
        onNotify={showToast}
        onAddScheduledPost={handleAddScheduledPost}
      />

      {/* Command Palette (Quick Search ⌘K) */}
      {isSetupOpen && (
        <OnboardingFlow
          isOpen
          mode="setup"
          prefillSample={!isFirstRun}
          userName={currentUser?.name}
          userEmail={currentUser?.email}
          onClose={() => setIsSetupOpen(false)}
          onOpenLogin={() => setIsSetupOpen(false)}
          onComplete={() => {
            setIsSetupOpen(false);
            showToast('Setup saved', 'Nexora is active. You can change any answer later in Settings.');
          }}
        />
      )}

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNav={handleSelectNav}
        onTriggerQuickAction={handleTriggerQuickAction}
      />

      {/* Workspace Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onNotify={showToast}
      />

      {/* Help Panel Drawer */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="fixed inset-0 bg-overlay backdrop-blur-[2px] animate-fadeIn" onClick={() => setIsHelpOpen(false)} />
          <div className="relative w-full max-w-[500px] bg-surface border-l border-line h-full p-7 shadow-modal z-10 flex flex-col justify-between text-ink animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow">Support</div>
                  <h2 className="text-[22px] font-extrabold tracking-tight mt-1.5">Help & documentation</h2>
                </div>
                <button type="button" onClick={() => setIsHelpOpen(false)} aria-label="Close help" className="w-9 h-9 min-h-9! grid place-items-center rounded-[8px]! border border-line text-ink-2 hover:bg-surface-hover cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-line">
                {[
                  [`${BRAND_NAME} architecture`, 'Learn how WhatsApp qualifiers and human escalation work together in one loop.'],
                  ['Keyboard shortcuts', 'Press ⌘K for search, L for a new lead, P for a post, C for content, M for a campaign.'],
                  ['Support', 'Email support@tecavy.io · WhatsApp +91 98201 44820'],
                ].map(([title, desc]) => (
                  <div key={title} className="py-4 first:pt-0">
                    <h3 className="text-[14px] font-bold text-ink">{title}</h3>
                    <p className="text-xs text-ink-3 mt-1 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="w-full h-10 min-h-10! rounded-[8px]! border border-line bg-surface text-ink-2 font-semibold hover:bg-surface-hover cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Profile Drawer */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="fixed inset-0 bg-overlay backdrop-blur-[2px] animate-fadeIn" onClick={() => setIsProfileOpen(false)} />
          <div className="relative w-full max-w-[500px] bg-surface border-l border-line h-full p-7 shadow-modal z-10 flex flex-col justify-between text-ink animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow">Account</div>
                  <h2 className="text-[22px] font-extrabold tracking-tight mt-1.5">Your profile</h2>
                </div>
                <button type="button" onClick={() => setIsProfileOpen(false)} aria-label="Close profile" className="w-9 h-9 min-h-9! grid place-items-center rounded-[8px]! border border-line text-ink-2 hover:bg-surface-hover cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-bold text-ink-3 block mb-1.5">Name</label>
                  <input type="text" defaultValue="Aryan Mehta" className="w-full px-3 py-2.5 text-ink" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-ink-3 block mb-1.5">Email</label>
                  <input type="email" defaultValue="you@acme.com" className="w-full px-3 py-2.5 text-ink" />
                </div>
                <div className="flex items-center justify-between py-3 border-t border-line">
                  <span className="text-xs text-ink-3">Role</span>
                  <span className="text-xs font-bold text-ink">Workspace owner</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-line">
                  <span className="text-xs text-ink-3">Notifications</span>
                  <span className="text-xs font-bold text-ink">Instant alerts for human handoffs</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="h-10 min-h-10! px-4 rounded-[8px]! border border-line bg-surface text-ink-2 font-semibold hover:bg-surface-hover cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  showToast('Profile saved', 'Account details updated successfully.');
                }}
                className="h-10 min-h-10! px-4 rounded-[8px]! bg-brand text-on-brand font-semibold hover:bg-brand-hover cursor-pointer"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating System Toast (positioned top-right to avoid covering bottom-right action buttons) */}
      {toastMessage && (
        <div className="nx-toast fixed top-5 right-5 sm:right-6 z-[80] shadow-pop px-[18px] py-3.5 max-w-sm animate-fadeIn rounded-[10px] flex items-start justify-between gap-3" role="status">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold mb-0.5 nx-toast-title">
              {toastMessage.title}
            </p>
            <p className="text-xs leading-relaxed nx-toast-desc">
              {toastMessage.desc}
            </p>
            {toastMessage.action && (
              <button
                type="button"
                onClick={() => {
                  toastMessage.action?.onClick();
                  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                  setToastMessage(null);
                }}
                className="mt-2 min-h-0! text-xs font-semibold nx-toast-action hover:underline cursor-pointer"
              >
                {toastMessage.action.label}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
              setToastMessage(null);
            }}
            className="min-h-0! nx-toast-desc hover:opacity-100 opacity-70 transition-opacity cursor-pointer p-0.5 shrink-0"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
