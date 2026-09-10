import React, { useState, useEffect } from 'react';
import { 
  NavCategory, 
  SubCategory, 
  Lead, 
  Campaign, 
  TrendingTopic, 
  StatMetric, 
  GeneratedAsset, 
  SocialAccount, 
  SystemNotification 
} from '../types';

import {
  INITIAL_METRICS,
  INITIAL_LEADS,
  INITIAL_TRENDING_TOPICS,
  INITIAL_CAMPAIGNS,
  INITIAL_GENERATED_ASSETS,
  INITIAL_SOCIAL_ACCOUNTS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

import AppSidebar from './app/AppSidebar';
import AppTopBar from './app/AppTopBar';
import InsightsView from './app/InsightsView';
import CampaignsView from './app/CampaignsView';
import CreativeLabView from './app/CreativeLabView';
import SocialHubView from './app/SocialHubView';
import LeadsView from './app/LeadsView';
import AssistantView from './app/AssistantView';
import ActionModals from './app/ActionModals';
import CommandPalette from './app/CommandPalette';

interface NexoraAppProps {
  initialMode: 'login' | 'signup';
  onReturnToLanding: () => void;
}

export default function NexoraApp({ onReturnToLanding }: NexoraAppProps) {
  // Navigation State (Insights -> Live Leads is default per requirements)
  const [activeCategory, setActiveCategory] = useState<NavCategory>('insights');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>('live-leads');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Application Data States
  const [metrics, setMetrics] = useState<StatMetric[]>(INITIAL_METRICS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>(INITIAL_TRENDING_TOPICS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [assets, setAssets] = useState<GeneratedAsset[]>(INITIAL_GENERATED_ASSETS);
  const [accounts, setAccounts] = useState<SocialAccount[]>(INITIAL_SOCIAL_ACCOUNTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // Interactive Modals State
  const [activeModal, setActiveModal] = useState<'campaign' | 'content' | 'lead' | 'schedule' | 'lead-details' | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Keyboard shortcut for command palette
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

  const handleSelectNav = (category: NavCategory, subCategory?: SubCategory) => {
    setActiveCategory(category);
    const resolvedSub = subCategory || (
      category === 'insights' 
        ? 'live-leads' 
        : category === 'campaigns' 
        ? 'campaigns-overview' 
        : category === 'leads'
        ? 'live-leads'
        : 'overview'
    );
    setActiveSubCategory(resolvedSub);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const handleTriggerQuickAction = (action: 'campaign' | 'content' | 'lead' | 'schedule') => {
    setActiveModal(action);
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setActiveModal('lead-details');
  };

  const handleAddLead = (newLead: Lead) => {
    setLeads([newLead, ...leads]);
    // update metric
    setMetrics(metrics.map(m => m.id === 'leads' ? { ...m, value: (parseInt(m.value) + 1).toString() } : m));
  };

  const handleAddCampaign = (newCamp: Campaign) => {
    setCampaigns([newCamp, ...campaigns]);
    // update metric
    setMetrics(metrics.map(m => m.id === 'campaigns' ? { ...m, value: (parseInt(m.value) + 1).toString() } : m));
  };

  const handleAddAsset = (newAsset: GeneratedAsset) => {
    setAssets([newAsset, ...assets]);
    showToast('Asset Saved', `"${newAsset.title}" added to your creative archive.`);
  };

  return (
    <div className="min-h-screen bg-[#071C1A] text-[#E8E9D8] font-sans-body selection:bg-[#A9BFA5]/25 selection:text-[#E8E9D8] relative">
      {/* Background atmosphere subtle ambient lighting */}
      <div 
        className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #A9BFA5 0%, transparent 70%)' }}
      />
      <div 
        className="fixed bottom-0 left-60 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #0D2D2A 0%, transparent 70%)' }}
      />

      {/* Fixed Left Sidebar Navigation */}
      <AppSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        onSelectNav={handleSelectNav}
        onLogout={onReturnToLanding}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace Frame (offset by sidebar width on desktop: md:pl-60) */}
      <div className="md:pl-60 flex flex-col min-h-screen">
        {/* Minimal Top Bar */}
        <AppTopBar
          activeCategory={activeCategory}
          activeSubCategory={activeSubCategory}
          notifications={notifications}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onLogout={onReturnToLanding}
          onOpenQuickSearch={() => setIsSearchOpen(true)}
          onSelectNav={handleSelectNav}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-12 py-8 lg:py-10">
          {activeCategory === 'insights' && (
            <InsightsView
              activeSubCategory={activeSubCategory}
              metrics={metrics}
              leads={leads}
              trendingTopics={trendingTopics}
              onTriggerQuickAction={handleTriggerQuickAction}
              onSelectLead={handleSelectLead}
              onNavigateSub={(sub) => handleSelectNav('insights', sub)}
            />
          )}

          {activeCategory === 'campaigns' && (
            <CampaignsView
              campaigns={campaigns}
              activeSubCategory={activeSubCategory}
              onAddCampaign={handleAddCampaign}
              onUpdateCampaign={(updated) => {
                setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
              }}
              onNavigateToModule={(cat, sub) => handleSelectNav(cat as NavCategory, (sub as SubCategory) || 'overview')}
            />
          )}

          {activeCategory === 'creative-lab' && (
            <CreativeLabView
              activeSubCategory={activeSubCategory}
              assets={assets}
              onNavigateSub={(sub) => handleSelectNav('creative-lab', sub)}
              onGenerateSuccess={handleAddAsset}
            />
          )}

          {activeCategory === 'social-hub' && (
            <SocialHubView
              activeSubCategory={activeSubCategory}
              accounts={accounts}
              onNavigateSub={(sub) => handleSelectNav('social-hub', sub)}
              onSchedulePostSuccess={() => showToast('Post Queued', 'Your broadcast has been added to the release schedule.')}
            />
          )}

          {activeCategory === 'leads' && (
            <LeadsView
              activeSubCategory={activeSubCategory}
              leads={leads}
              onNavigateSub={(sub) => handleSelectNav('leads', sub)}
              onSelectLead={handleSelectLead}
              onAddLeadModal={() => setActiveModal('lead')}
              onUpdateLead={handleUpdateLead}
            />
          )}

          {activeCategory === 'assistant' && (
            <AssistantView
              metrics={metrics}
              leads={leads}
              campaigns={campaigns}
              onTriggerQuickAction={handleTriggerQuickAction}
            />
          )}
        </main>
      </div>

      {/* Interactive Action Modals */}
      <ActionModals
        activeModal={activeModal}
        selectedLead={selectedLead}
        onClose={() => { setActiveModal(null); setSelectedLead(null); }}
        onAddLead={handleAddLead}
        onAddCampaign={handleAddCampaign}
        onNotify={showToast}
      />

      {/* Command Palette (Quick Search ⌘K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNav={handleSelectNav}
        onTriggerQuickAction={handleTriggerQuickAction}
      />

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#061816] border border-[rgba(169,191,165,0.3)] shadow-2xl p-4 max-w-sm text-[#E8E9D8] animate-fadeIn rounded-[2px]">
          <p className="text-xs uppercase tracking-widest text-[#A9BFA5] font-medium mb-1">
            {toastMessage.title}
          </p>
          <p className="text-xs font-light text-[#E8E9D8]/90 leading-relaxed">
            {toastMessage.desc}
          </p>
        </div>
      )}
    </div>
  );
}
