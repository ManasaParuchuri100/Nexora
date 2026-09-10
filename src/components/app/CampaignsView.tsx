import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Filter,
  FileText,
  TrendingUp,
  User,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  RotateCcw,
  Activity,
  CalendarRange,
  Clock3
} from 'lucide-react';
import { Campaign, CampaignBlueprint, SubCategory } from '../../types';
import CampaignCreationFlow from './CampaignCreationFlow';
import CampaignBlueprintView from './CampaignBlueprintView';
import Pagination from './Pagination';
import { SAMPLE_BLUEPRINT, generateBlueprintFromForm } from '../../data/campaignBlueprintGenerator';

export type TimelineFilterOption = 'All' | 'Active' | 'Upcoming' | 'Concluded' | 'Q2' | 'Q3' | 'Custom';
export type ProgressFilterOption = 'All' | 'NotStarted' | 'Early' | 'InProgress' | 'Advanced' | 'Completed';
export type SortOption = 'Default' | 'ProgressDesc' | 'ProgressAsc' | 'StartNewest' | 'StartOldest' | 'EndingSoonest' | 'NameAsc';

interface CampaignsViewProps {
  campaigns: Campaign[];
  activeSubCategory?: SubCategory;
  onAddCampaign: (newCamp: Campaign) => void;
  onUpdateCampaign?: (updatedCamp: Campaign) => void;
  onNavigateToModule?: (category: string, subCategory?: string) => void;
}

function parseCampaignDate(dateStr?: string): Date | null {
  if (!dateStr || dateStr.trim().toLowerCase() === 'ongoing') return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function getCampaignTimelineState(campaign: Campaign): 'active' | 'upcoming' | 'concluded' {
  if (campaign.status === 'Completed' || campaign.progress === 100) {
    return 'concluded';
  }
  if (campaign.status === 'Active') {
    return 'active';
  }
  if (campaign.status === 'Planning' || campaign.status === 'Draft') {
    return 'upcoming';
  }
  
  const now = new Date('2026-06-15');
  const start = parseCampaignDate(campaign.startDate);
  const end = parseCampaignDate(campaign.endDate);
  
  if (start && start > now) return 'upcoming';
  if (end && end < now) return 'concluded';
  return 'active';
}

export default function CampaignsView({
  campaigns,
  activeSubCategory,
  onAddCampaign,
  onUpdateCampaign,
  onNavigateToModule
}: CampaignsViewProps) {
  // Navigation mode within Campaigns: 'landing' | 'create' | 'blueprint'
  const [viewMode, setViewMode] = useState<'landing' | 'create' | 'blueprint'>('landing');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Planning' | 'Active' | 'Completed'>('All');
  
  // Timeline Filter
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilterOption>('All');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2026-05-01');
  const [customEndDate, setCustomEndDate] = useState('2026-08-31');
  const [pendingStartDate, setPendingStartDate] = useState('2026-05-01');
  const [pendingEndDate, setPendingEndDate] = useState('2026-08-31');

  // Progress Filter
  const [progressFilter, setProgressFilter] = useState<ProgressFilterOption>('All');
  const [minProgress, setMinProgress] = useState<number>(0);

  // Search & Sorting
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('Default');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Sync with activeSubCategory from sidebar if provided
  useEffect(() => {
    if (activeSubCategory === 'create-campaign') {
      setViewMode('create');
    } else if (activeSubCategory === 'campaigns-overview') {
      setViewMode('landing');
    }
  }, [activeSubCategory]);

  const handleOpenCreate = () => {
    setViewMode('create');
  };

  const handleBlueprintGenerated = (newCampaign: Campaign, blueprint: CampaignBlueprint) => {
    onAddCampaign(newCampaign);
    setSelectedCampaign(newCampaign);
    setViewMode('blueprint');
  };

  const handleSelectCampaignForBlueprint = (campaign: Campaign) => {
    let campaignWithBp = campaign;
    if (!campaign.blueprint) {
      campaignWithBp = {
        ...campaign,
        blueprint: generateBlueprintFromForm({
          name: campaign.name,
          type: 'Product Launch',
          description: campaign.objective,
          primaryGoal: campaign.objective,
          measurableGoals: ['Acquire qualified accounts', 'Achieve >60% conversion velocity'],
          ageRange: '25–45',
          location: 'Global',
          industry: 'Technology & SaaS',
          interests: 'Growth, Automation, Minimal Operations',
          occupation: 'Founders, Product Leaders',
          audienceType: 'Decision Makers',
          audienceDescription: 'Discerning operators looking for calm execution.',
          budgetType: 'total',
          budgetAmount: campaign.budget.replace(/[^0-9]/g, '') || '3,000',
          resources: ['Website', 'Email list', 'Design assets', 'Sales team'],
          startDate: campaign.startDate,
          endDate: campaign.endDate || '2026-07-31',
          milestones: ['Campaign kickoff', 'Mid-flight review', 'Final synthesis'],
          channels: campaign.channel.split(',').map(c => c.trim()),
          autoRecommendChannels: false,
          brandVoice: 'Premium',
          visualStyle: 'Minimal',
          additionalInstructions: 'Refined editorial tone and high-contrast execution.'
        })
      };
    }
    setSelectedCampaign(campaignWithBp);
    setViewMode('blueprint');
  };

  const handleStartCampaign = () => {
    if (selectedCampaign) {
      const updated: Campaign = {
        ...selectedCampaign,
        status: 'Active',
        progress: selectedCampaign.progress < 20 ? 25 : selectedCampaign.progress
      };
      setSelectedCampaign(updated);
      onUpdateCampaign?.(updated);
    }
  };

  // Reset all applied filters
  const handleResetFilters = () => {
    setStatusFilter('All');
    setTimelineFilter('All');
    setProgressFilter('All');
    setMinProgress(0);
    setSearch('');
    setSortBy('Default');
    setIsCustomDateOpen(false);
    setCurrentPage(1);
  };

  // Reset to page 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, timelineFilter, progressFilter, minProgress, search, sortBy, customStartDate, customEndDate]);

  // Check if any non-default filter is currently active
  const isAnyFilterActive = 
    statusFilter !== 'All' || 
    timelineFilter !== 'All' || 
    progressFilter !== 'All' || 
    minProgress > 0 || 
    search.trim() !== '' ||
    sortBy !== 'Default';

  // Memoized Filtered and Sorted Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      // 1. Status Filter
      if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false;
      }

      // 2. Search Filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesSearch = 
          c.name.toLowerCase().includes(query) || 
          c.objective.toLowerCase().includes(query) ||
          c.owner.toLowerCase().includes(query) ||
          c.channel.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // 3. Timeline Filter
      const timelineState = getCampaignTimelineState(c);
      const parsedStart = parseCampaignDate(c.startDate);
      const parsedEnd = parseCampaignDate(c.endDate);

      if (timelineFilter === 'Active' && timelineState !== 'active') {
        return false;
      }
      if (timelineFilter === 'Upcoming' && timelineState !== 'upcoming') {
        return false;
      }
      if (timelineFilter === 'Concluded' && timelineState !== 'concluded') {
        return false;
      }
      if (timelineFilter === 'Q2') {
        // Q2 2026: Apr 01 to Jun 30, 2026
        const qStart = new Date('2026-04-01');
        const qEnd = new Date('2026-06-30');
        const overlaps = (!parsedStart || parsedStart <= qEnd) && (!parsedEnd || parsedEnd >= qStart);
        if (!overlaps) return false;
      }
      if (timelineFilter === 'Q3') {
        // Q3 2026: Jul 01 to Sep 30, 2026
        const qStart = new Date('2026-07-01');
        const qEnd = new Date('2026-09-30');
        const overlaps = (!parsedStart || parsedStart <= qEnd) && (!parsedEnd || parsedEnd >= qStart);
        if (!overlaps) return false;
      }
      if (timelineFilter === 'Custom') {
        const fStart = new Date(customStartDate);
        const fEnd = new Date(customEndDate);
        const overlaps = (!parsedStart || parsedStart <= fEnd) && (!parsedEnd || parsedEnd >= fStart);
        if (!overlaps) return false;
      }

      // 4. Progress Filter (Bracket)
      if (progressFilter === 'NotStarted' && c.progress !== 0) {
        return false;
      }
      if (progressFilter === 'Early' && (c.progress <= 0 || c.progress > 25)) {
        return false;
      }
      if (progressFilter === 'InProgress' && (c.progress < 26 || c.progress > 74)) {
        return false;
      }
      if (progressFilter === 'Advanced' && (c.progress < 75 || c.progress > 99)) {
        return false;
      }
      if (progressFilter === 'Completed' && c.progress !== 100) {
        return false;
      }

      // 5. Min Progress Threshold
      if (minProgress > 0 && c.progress < minProgress) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      switch (sortBy) {
        case 'ProgressDesc':
          return b.progress - a.progress;
        case 'ProgressAsc':
          return a.progress - b.progress;
        case 'StartNewest': {
          const tA = parseCampaignDate(a.startDate)?.getTime() || 0;
          const tB = parseCampaignDate(b.startDate)?.getTime() || 0;
          return tB - tA;
        }
        case 'StartOldest': {
          const tA = parseCampaignDate(a.startDate)?.getTime() || 0;
          const tB = parseCampaignDate(b.startDate)?.getTime() || 0;
          return tA - tB;
        }
        case 'EndingSoonest': {
          const tA = parseCampaignDate(a.endDate)?.getTime() || 9999999999999;
          const tB = parseCampaignDate(b.endDate)?.getTime() || 9999999999999;
          return tA - tB;
        }
        case 'NameAsc':
          return a.name.localeCompare(b.name);
        case 'Default':
        default:
          return 0;
      }
    });
  }, [campaigns, statusFilter, search, timelineFilter, customStartDate, customEndDate, progressFilter, minProgress, sortBy]);

  // Paginated campaigns slice for table display
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCampaigns.slice(startIndex, startIndex + pageSize);
  }, [filteredCampaigns, currentPage, pageSize]);

  // Statistics counters for the current dataset
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter(c => getCampaignTimelineState(c) === 'active').length;
    const upcoming = campaigns.filter(c => getCampaignTimelineState(c) === 'upcoming').length;
    const concluded = campaigns.filter(c => getCampaignTimelineState(c) === 'concluded').length;
    const avgProgress = total > 0 ? Math.round(campaigns.reduce((acc, c) => acc + c.progress, 0) / total) : 0;
    return { total, active, upcoming, concluded, avgProgress };
  }, [campaigns]);

  // Table header sort handlers
  const handleToggleSortTimeline = () => {
    if (sortBy === 'StartNewest') setSortBy('StartOldest');
    else if (sortBy === 'StartOldest') setSortBy('EndingSoonest');
    else if (sortBy === 'EndingSoonest') setSortBy('Default');
    else setSortBy('StartNewest');
  };

  const handleToggleSortProgress = () => {
    if (sortBy === 'ProgressDesc') setSortBy('ProgressAsc');
    else if (sortBy === 'ProgressAsc') setSortBy('Default');
    else setSortBy('ProgressDesc');
  };

  const handleToggleSortName = () => {
    if (sortBy === 'NameAsc') setSortBy('Default');
    else setSortBy('NameAsc');
  };

  /* =========================================================================
     VIEW ROUTE: CREATE NEW CAMPAIGN
     ========================================================================= */
  if (viewMode === 'create') {
    return (
      <CampaignCreationFlow
        onBack={() => setViewMode('landing')}
        onBlueprintGenerated={handleBlueprintGenerated}
      />
    );
  }

  /* =========================================================================
     VIEW ROUTE: AI CAMPAIGN BLUEPRINT
     ========================================================================= */
  if (viewMode === 'blueprint' && selectedCampaign?.blueprint) {
    return (
      <CampaignBlueprintView
        blueprint={selectedCampaign.blueprint}
        onBack={() => setViewMode('landing')}
        onEdit={() => setViewMode('create')}
        onRegenerate={() => {
          if (selectedCampaign?.blueprint) {
            handleSelectCampaignForBlueprint(selectedCampaign);
          }
        }}
        onStartCampaign={handleStartCampaign}
        onNavigateToModule={onNavigateToModule}
      />
    );
  }

  /* =========================================================================
     VIEW ROUTE: 1. CAMPAIGNS LANDING VIEW
     ========================================================================= */
  return (
    <div className="space-y-12 py-4 animate-fadeIn text-[#E8E9D8]">
      {/* 1. Header */}
      <section className="border-b border-[rgba(169,191,165,0.2)] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest-plus text-[#A9BFA5] font-mono block mb-2">
            WORKSPACE // STRATEGY & ORCHESTRATION
          </span>
          <h1 className="serif text-4xl sm:text-5xl font-light text-[#E8E9D8] tracking-tight">
            Campaigns
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#A9BFA5]/80 font-light leading-relaxed max-w-xl">
            Plan, launch, and manage campaigns from one place.
          </p>
        </div>

        {/* Primary Action Button */}
        <div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-[#E8E9D8] text-[#071C1A] px-6 py-2.5 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer focus:outline-none flex items-center space-x-2"
          >
            <Plus className="w-3.5 h-3.5 text-[#071C1A]" />
            <span>Create New Campaign</span>
          </button>
        </div>
      </section>

      {/* 2. Top Filter and Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(169,191,165,0.15)] text-xs">
        <div className="flex items-center space-x-5 uppercase tracking-widest font-mono text-[11px] overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Active', 'Planning', 'Draft', 'Completed'] as const).map(tab => {
            const count = tab === 'All' 
              ? campaigns.length 
              : campaigns.filter(c => c.status === tab).length;
            const isSelected = statusFilter === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`pb-1 border-b transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  isSelected 
                    ? 'text-[#E8E9D8] border-[#A9BFA5] font-medium' 
                    : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-[#0D2D2A] text-[#A9BFA5]' : 'text-[#A9BFA5]/40'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search campaigns, objectives, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#071C1A] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] text-xs px-3 py-1.5 pl-8 pr-7 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] placeholder-[#A9BFA5]/40 font-light w-full sm:w-72"
          />
          <Search className="w-3.5 h-3.5 text-[#A9BFA5]/50 absolute left-2.5 top-2.5 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-2 text-[#A9BFA5]/50 hover:text-[#E8E9D8] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Timeline & Progress Filter Toolbar */}
      <div className="space-y-4 bg-[#061816]/70 border border-[rgba(169,191,165,0.18)] p-4 rounded-[2px]">
        {/* Row A: Timeline Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-mono uppercase tracking-wider text-[#A9BFA5] mr-1 shrink-0">
              <CalendarRange className="w-3.5 h-3.5 text-[#A9BFA5]" />
              <span>Timeline:</span>
            </div>

            {(
              [
                { id: 'All', label: 'All Timelines' },
                { id: 'Active', label: 'Active Now' },
                { id: 'Upcoming', label: 'Upcoming' },
                { id: 'Concluded', label: 'Concluded' },
                { id: 'Q2', label: 'Q2 2026' },
                { id: 'Q3', label: 'Q3 2026' },
              ] as const
            ).map((opt) => {
              const isSelected = timelineFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTimelineFilter(opt.id);
                    if (isCustomDateOpen) setIsCustomDateOpen(false);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] border transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0D2D2A] text-[#E8E9D8] border-[#A9BFA5] font-medium shadow-sm'
                      : 'bg-[#071C1A] text-[#A9BFA5]/70 border-[rgba(169,191,165,0.2)] hover:border-[#A9BFA5]/50 hover:text-[#E8E9D8]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}

            {/* Custom Dates Trigger */}
            <button
              type="button"
              onClick={() => {
                if (timelineFilter !== 'Custom') {
                  setTimelineFilter('Custom');
                  setIsCustomDateOpen(true);
                } else {
                  setIsCustomDateOpen(!isCustomDateOpen);
                }
              }}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] border transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                timelineFilter === 'Custom'
                  ? 'bg-[#0D2D2A] text-[#E8E9D8] border-[#A9BFA5] font-medium'
                  : 'bg-[#071C1A] text-[#A9BFA5]/70 border-[rgba(169,191,165,0.2)] hover:border-[#A9BFA5]/50 hover:text-[#E8E9D8]'
              }`}
            >
              <Calendar className="w-3 h-3 text-[#A9BFA5]" />
              <span>
                {timelineFilter === 'Custom' 
                  ? `${customStartDate} → ${customEndDate}`
                  : 'Custom Dates...'}
              </span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center space-x-3 text-[10px] font-mono text-[#A9BFA5]/70 shrink-0">
            <span>Avg Progress: <strong className="text-[#E8E9D8]">{stats.avgProgress}%</strong></span>
            <span>•</span>
            <span>Active: <strong className="text-emerald-400">{stats.active}</strong></span>
            <span>•</span>
            <span>Upcoming: <strong className="text-sky-400">{stats.upcoming}</strong></span>
            <span>•</span>
            <span>Concluded: <strong className="text-[#A9BFA5]">{stats.concluded}</strong></span>
          </div>
        </div>

        {/* Expandable Custom Date Range Drawer */}
        {(timelineFilter === 'Custom' || isCustomDateOpen) && (
          <div className="p-3.5 bg-[#071C1A] border border-[rgba(169,191,165,0.25)] rounded-[2px] space-y-3 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center flex-wrap gap-4 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[#A9BFA5]/80 text-[11px] uppercase">From:</span>
                  <input
                    type="date"
                    value={pendingStartDate}
                    onChange={(e) => setPendingStartDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="bg-[#061816] border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] text-xs px-2.5 py-1 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] font-mono cursor-pointer"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[#A9BFA5]/80 text-[11px] uppercase">To:</span>
                  <input
                    type="date"
                    value={pendingEndDate}
                    onChange={(e) => setPendingEndDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="bg-[#061816] border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] text-xs px-2.5 py-1 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] font-mono cursor-pointer"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStartDate(pendingStartDate);
                      setCustomEndDate(pendingEndDate);
                      setTimelineFilter('Custom');
                      setIsCustomDateOpen(false);
                    }}
                    className="bg-[#E8E9D8] text-[#071C1A] px-3 py-1 rounded-[2px] text-[11px] font-mono font-semibold uppercase hover:bg-white transition-colors cursor-pointer"
                  >
                    Apply Window
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingStartDate('2026-05-01');
                      setPendingEndDate('2026-08-31');
                      setCustomStartDate('2026-05-01');
                      setCustomEndDate('2026-08-31');
                      setTimelineFilter('All');
                      setIsCustomDateOpen(false);
                    }}
                    className="border border-[rgba(169,191,165,0.3)] text-[#A9BFA5] hover:text-[#E8E9D8] px-2.5 py-1 rounded-[2px] text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="text-[#A9BFA5]/60 mr-1">Quick:</span>
                {[
                  { label: 'May–Jul 2026', start: '2026-05-01', end: '2026-07-31' },
                  { label: 'Jun–Aug 2026', start: '2026-06-01', end: '2026-08-31' },
                  { label: 'Q2 2026', start: '2026-04-01', end: '2026-06-30' },
                  { label: 'Q3 2026', start: '2026-07-01', end: '2026-09-30' },
                  { label: 'Full Year', start: '2026-01-01', end: '2026-12-31' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setPendingStartDate(preset.start);
                      setPendingEndDate(preset.end);
                      setCustomStartDate(preset.start);
                      setCustomEndDate(preset.end);
                      setTimelineFilter('Custom');
                    }}
                    className="px-2 py-0.5 border border-[rgba(169,191,165,0.2)] bg-[#0D2D2A]/40 text-[#A9BFA5] hover:text-[#E8E9D8] hover:border-[#A9BFA5]/50 transition-colors rounded-[2px] cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Row B: Progress Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-[rgba(169,191,165,0.12)] text-xs">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-mono uppercase tracking-wider text-[#A9BFA5] mr-1 shrink-0">
              <Activity className="w-3.5 h-3.5 text-[#A9BFA5]" />
              <span>Progress:</span>
            </div>

            {(
              [
                { id: 'All', label: 'All Progress' },
                { id: 'NotStarted', label: '0% (Draft)' },
                { id: 'Early', label: '1–25% (Early)' },
                { id: 'InProgress', label: '26–74% (In Flight)' },
                { id: 'Advanced', label: '75–99% (Advanced)' },
                { id: 'Completed', label: '100% (Complete)' },
              ] as const
            ).map((opt) => {
              const isSelected = progressFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProgressFilter(opt.id)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] border transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0D2D2A] text-[#E8E9D8] border-[#A9BFA5] font-medium shadow-sm'
                      : 'bg-[#071C1A] text-[#A9BFA5]/70 border-[rgba(169,191,165,0.2)] hover:border-[#A9BFA5]/50 hover:text-[#E8E9D8]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Minimum Progress Threshold Quick Buttons */}
          <div className="flex items-center space-x-2 text-[11px] font-mono shrink-0">
            <span className="text-[#A9BFA5]/70 text-[10px] uppercase">Min Threshold:</span>
            {[0, 25, 50, 75].map((val) => {
              const isSelected = minProgress === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMinProgress(isSelected && val !== 0 ? 0 : val)}
                  className={`px-2 py-0.5 rounded-[2px] border text-[10px] transition-colors cursor-pointer ${
                    isSelected && val > 0
                      ? 'bg-[#0D2D2A] text-[#E8E9D8] border-[#A9BFA5] font-semibold'
                      : isSelected && val === 0
                      ? 'bg-[#071C1A] text-[#A9BFA5] border-[rgba(169,191,165,0.3)]'
                      : 'bg-[#071C1A] text-[#A9BFA5]/60 border-[rgba(169,191,165,0.15)] hover:text-[#E8E9D8]'
                  }`}
                >
                  {val === 0 ? 'Any' : `≥${val}%`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row C: Sorting Selector & Active Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[rgba(169,191,165,0.12)] text-xs">
          {/* Active Filter Chips */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[10px] font-mono uppercase text-[#A9BFA5]/60 tracking-wider">
              Filters:
            </span>

            {!isAnyFilterActive ? (
              <span className="text-[11px] font-mono text-[#A9BFA5]/50 italic">
                Showing all campaigns (no active filters)
              </span>
            ) : (
              <>
                {statusFilter !== 'All' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#0D2D2A] border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] text-[10px] font-mono rounded-[2px]">
                    <span>Status: {statusFilter}</span>
                    <button 
                      type="button" 
                      onClick={() => setStatusFilter('All')} 
                      className="text-[#A9BFA5] hover:text-white cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                {timelineFilter !== 'All' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#0D2D2A] border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] text-[10px] font-mono rounded-[2px]">
                    <span>
                      Timeline: {timelineFilter === 'Custom' ? `${customStartDate} → ${customEndDate}` : timelineFilter}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setTimelineFilter('All')} 
                      className="text-[#A9BFA5] hover:text-white cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                {progressFilter !== 'All' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#0D2D2A] border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] text-[10px] font-mono rounded-[2px]">
                    <span>Progress: {progressFilter}</span>
                    <button 
                      type="button" 
                      onClick={() => setProgressFilter('All')} 
                      className="text-[#A9BFA5] hover:text-white cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                {minProgress > 0 && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#0D2D2A] border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] text-[10px] font-mono rounded-[2px]">
                    <span>Min: ≥{minProgress}%</span>
                    <button 
                      type="button" 
                      onClick={() => setMinProgress(0)} 
                      className="text-[#A9BFA5] hover:text-white cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                {search && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#0D2D2A] border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] text-[10px] font-mono rounded-[2px]">
                    <span>Search: "{search}"</span>
                    <button 
                      type="button" 
                      onClick={() => setSearch('')} 
                      className="text-[#A9BFA5] hover:text-white cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[10px] font-mono text-[#A9BFA5] hover:text-white underline underline-offset-2 cursor-pointer flex items-center space-x-1 ml-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset All</span>
                </button>
              </>
            )}
          </div>

          {/* Right: Sort Dropdown & Result Count */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5 text-xs font-mono">
              <span className="text-[#A9BFA5]/60 text-[10px] uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#071C1A] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] text-xs px-2.5 py-1 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] cursor-pointer"
              >
                <option value="Default">Default Order</option>
                <option value="ProgressDesc">Progress: High → Low</option>
                <option value="ProgressAsc">Progress: Low → High</option>
                <option value="StartNewest">Timeline: Start (Newest)</option>
                <option value="StartOldest">Timeline: Start (Oldest)</option>
                <option value="EndingSoonest">Timeline: Ending Soonest</option>
                <option value="NameAsc">Campaign Name (A–Z)</option>
              </select>
            </div>

            <div className="text-[11px] font-mono text-[#A9BFA5]">
              Showing <strong className="text-[#E8E9D8]">{filteredCampaigns.length}</strong> of {campaigns.length}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Campaigns Table */}
      <div className="border border-[rgba(169,191,165,0.2)] divide-y divide-[rgba(169,191,165,0.15)] bg-[#071C1A] overflow-x-auto">
        {/* Table Header with interactive sort triggers */}
        <div className="min-w-[900px] grid grid-cols-12 px-6 py-3 text-[10px] uppercase tracking-widest text-[#A9BFA5]/60 font-mono bg-[#061816]">
          <div 
            onClick={handleToggleSortName}
            className="col-span-4 flex items-center space-x-1.5 cursor-pointer hover:text-[#E8E9D8] transition-colors select-none"
          >
            <span>Campaign Name & Objective</span>
            {sortBy === 'NameAsc' && <span className="text-[#A9BFA5]">↑</span>}
          </div>

          <div className="col-span-2">
            Status
          </div>

          <div 
            onClick={handleToggleSortTimeline}
            className="col-span-2 flex items-center space-x-1.5 cursor-pointer hover:text-[#E8E9D8] transition-colors select-none"
          >
            <span>Timeline</span>
            {sortBy === 'StartNewest' && <span className="text-[#A9BFA5]">↓ Start</span>}
            {sortBy === 'StartOldest' && <span className="text-[#A9BFA5]">↑ Start</span>}
            {sortBy === 'EndingSoonest' && <span className="text-[#A9BFA5]">→ Ending</span>}
            {sortBy !== 'StartNewest' && sortBy !== 'StartOldest' && sortBy !== 'EndingSoonest' && (
              <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
            )}
          </div>

          <div 
            onClick={handleToggleSortProgress}
            className="col-span-2 flex items-center space-x-1.5 cursor-pointer hover:text-[#E8E9D8] transition-colors select-none pr-6"
          >
            <span>Progress</span>
            {sortBy === 'ProgressDesc' && <span className="text-[#A9BFA5]">↓ High</span>}
            {sortBy === 'ProgressAsc' && <span className="text-[#A9BFA5]">↑ Low</span>}
            {sortBy !== 'ProgressDesc' && sortBy !== 'ProgressAsc' && (
              <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
            )}
          </div>

          <div className="col-span-2 text-right">
            Owner & Blueprint
          </div>
        </div>

        {/* Campaign Rows */}
        {filteredCampaigns.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#A9BFA5]/70 font-light space-y-3">
            <div className="serif text-lg text-[#E8E9D8]">No campaigns match the current criteria</div>
            <p className="max-w-md mx-auto text-[11px] font-mono text-[#A9BFA5]/60">
              Try adjusting your timeline window, progress threshold, or status filter to reveal campaigns.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 border border-[rgba(169,191,165,0.3)] text-[#E8E9D8] hover:bg-[#0D2D2A] text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          paginatedCampaigns.map(campaign => {
            const timelineState = getCampaignTimelineState(campaign);
            
            // Progress stage label
            let progressStage = 'Kickoff';
            if (campaign.progress === 100) progressStage = 'Complete';
            else if (campaign.progress >= 75) progressStage = 'Advanced';
            else if (campaign.progress >= 26) progressStage = 'In Flight';
            else if (campaign.progress > 0) progressStage = 'Early';

            return (
              <div 
                key={campaign.id}
                onClick={() => handleSelectCampaignForBlueprint(campaign)}
                className="min-w-[900px] grid grid-cols-12 px-6 py-4 items-center transition-colors hover:bg-[#0D2D2A]/30 group cursor-pointer"
              >
                {/* Campaign Name & Objective */}
                <div className="col-span-4 pr-4">
                  <h4 className="text-xs sm:text-sm font-medium text-[#E8E9D8] group-hover:text-white transition-colors">
                    {campaign.name}
                  </h4>
                  <p className="text-[11px] text-[#A9BFA5]/70 font-light mt-0.5 line-clamp-1">
                    {campaign.objective}
                  </p>
                  <span className="text-[10px] font-mono text-[#A9BFA5]/50 block mt-1">
                    {campaign.channel}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-block text-[10px] uppercase tracking-widest px-2.5 py-0.5 border font-mono ${
                    campaign.status === 'Active' 
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30'
                      : campaign.status === 'Planning'
                      ? 'text-sky-400 border-sky-500/30 bg-sky-950/30'
                      : campaign.status === 'Completed'
                      ? 'text-[#E8E9D8] border-[#A9BFA5]/40 bg-[#0D2D2A]/60'
                      : 'text-[#A9BFA5] border-[rgba(169,191,165,0.2)] bg-[#071C1A]'
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                {/* Timeline Column with Status Chip */}
                <div className="col-span-2 text-xs font-mono text-[#A9BFA5]/90">
                  <div className="flex items-center space-x-1.5">
                    {timelineState === 'active' && (
                      <span className="inline-flex items-center space-x-1 text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Active</span>
                      </span>
                    )}
                    {timelineState === 'upcoming' && (
                      <span className="inline-flex items-center space-x-1 text-[9px] uppercase px-1.5 py-0.2 rounded bg-sky-950/50 border border-sky-500/30 text-sky-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>Upcoming</span>
                      </span>
                    )}
                    {timelineState === 'concluded' && (
                      <span className="inline-flex items-center space-x-1 text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#0D2D2A]/60 border border-[#A9BFA5]/30 text-[#A9BFA5]">
                        <span>Concluded</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[#E8E9D8]">{campaign.startDate}</div>
                  <div className="text-[10px] text-[#A9BFA5]/50 mt-0.5">
                    to {campaign.endDate || 'Ongoing'}
                  </div>
                </div>

                {/* Progress Column with Dynamic Bar and Stage */}
                <div className="col-span-2 pr-6">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#E8E9D8] mb-1.5">
                    <span className="text-[10px] text-[#A9BFA5]/70">{progressStage}</span>
                    <span className="font-semibold">{campaign.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#061816] border border-[rgba(169,191,165,0.2)] overflow-hidden rounded-[1px]">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        campaign.progress === 100
                          ? 'bg-emerald-400'
                          : campaign.progress >= 75
                          ? 'bg-[#E8E9D8]'
                          : campaign.progress >= 25
                          ? 'bg-[#A9BFA5]'
                          : 'bg-[#A9BFA5]/50'
                      }`}
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                </div>

                {/* Owner & Action */}
                <div className="col-span-2 flex items-center justify-end space-x-4">
                  <div className="text-right">
                    <span className="text-xs text-[#E8E9D8] font-light block">
                      {campaign.owner}
                    </span>
                    <span className="text-[10px] text-[#A9BFA5]/60 font-mono">
                      Owner
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCampaignForBlueprint(campaign);
                    }}
                    className="px-3 py-1.5 border border-[rgba(169,191,165,0.3)] text-[10px] uppercase font-mono tracking-wider text-[#E8E9D8] hover:bg-[#0D2D2A] transition-colors cursor-pointer shrink-0"
                  >
                    Blueprint &rarr;
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Footer */}
        {filteredCampaigns.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCampaigns.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[3, 5, 10, 20]}
            itemName="campaigns"
          />
        )}
      </div>
    </div>
  );
}
