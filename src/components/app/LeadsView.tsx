import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  ChevronDown, 
  Plus, 
  Check, 
  X, 
  LayoutGrid, 
  List, 
  Calendar, 
  Bot, 
  Clock, 
  Flame, 
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
  Send,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Lead, SubCategory, LeadStage, LeadTemperature } from '../../types';
import { 
  PageHeader, 
  SegmentedControl, 
  Button, 
  Badge, 
  BadgeTone,
  Avatar, 
  EmptyState 
} from '../ui';
import DateRangeCalendarModal, { DateRangeSelection, SortBasis } from './DateRangeCalendarModal';

export interface LeadsViewProps {
  activeSubCategory: SubCategory;
  leads: Lead[];
  selectedLead?: Lead | null;
  onNavigateSub: (sub: SubCategory) => void;
  onSelectLead: (lead: Lead) => void;
  onAddLeadModal: () => void;
  onUpdateLead?: (updated: Lead) => void;
  onNotify?: (title: string, desc: string) => void;
  isFirstRun?: boolean;
}

export interface FollowUpItem {
  id: string;
  status: 'overdue' | 'today' | 'upcoming' | 'done';
  dueDate: string;
  company: string;
  contactName: string;
  channel: string;
  owner: string;
  task: string;
  draft: string;
}

interface CustomSavedView {
  id: string;
  name: string;
}

type SortColumn = 'lead' | 'stage' | 'score' | 'owner' | 'value' | 'activity';
type SortDirection = 'asc' | 'desc';

function parseDealValue(valStr?: string): number {
  if (!valStr) return 0;
  const lMatch = valStr.match(/₹?([\d.]+)L/i);
  if (lMatch) return parseFloat(lMatch[1]) * 100000;
  const kMatch = valStr.match(/₹?([\d.]+)k/i);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const numMatch = valStr.match(/[\$₹]?([\d,]+)/);
  if (numMatch) return parseFloat(numMatch[1].replace(/,/g, ''));
  return 0;
}

function formatStageValue(total: number): string {
  if (total >= 100000) {
    return `₹${(total / 100000).toFixed(1)}L`;
  }
  if (total >= 1000) {
    return `₹${(total / 1000).toFixed(0)}k`;
  }
  return total > 0 ? `₹${total}` : '₹0';
}

function getStageTone(stage?: string): BadgeTone {
  const norm = (stage || '').toLowerCase();
  if (norm.includes('won') || norm.includes('closed')) return 'success';
  if (norm.includes('lost')) return 'neutral';
  if (norm.includes('qualif')) return 'info';
  if (norm.includes('proposal') || norm.includes('negotiat')) return 'warning';
  if (norm.includes('contact') || norm.includes('engaged')) return 'brand';
  return 'neutral';
}

const INITIAL_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: 'fu-1',
    status: 'overdue',
    dueDate: '2 days overdue',
    company: 'Nova Retail',
    contactName: 'Priya Mehta',
    channel: 'Email',
    owner: 'You',
    task: 'Send revised proposal with updated seat allocation',
    draft: 'Hi Priya, following up on the proposal we shared last Thursday. I have updated the seat allocation and API terms to match your requirements.'
  },
  {
    id: 'fu-2',
    status: 'today',
    dueDate: 'Today at 2:00 PM',
    company: 'Aster Labs',
    contactName: 'Rahul Sharma',
    channel: 'WhatsApp',
    owner: 'You',
    task: 'Book discovery walkthrough call',
    draft: 'Hi Rahul, would tomorrow at 11:30 AM IST work for a 20-minute tailored platform preview with our technical team?'
  },
  {
    id: 'fu-3',
    status: 'upcoming',
    dueDate: 'In 3 days',
    company: 'PulseWorks',
    contactName: 'Aisha Khan',
    channel: 'Instagram',
    owner: 'AI',
    task: 'Check in on multi-store evaluation',
    draft: 'Hello Aisha, checking in to see if your retail steering team reviewed the multi-branch dispatch overview.'
  },
  {
    id: 'fu-4',
    status: 'overdue',
    dueDate: '1 day overdue',
    company: 'FinTrack Systems',
    contactName: 'Karan Patel',
    channel: 'LinkedIn',
    owner: 'You',
    task: 'Share security compliance documentation',
    draft: 'Hi Karan, attached is our SOC 2 Type II report and GDPR compliance addendum for your legal team.'
  }
];

export default function LeadsView({
  activeSubCategory,
  leads,
  selectedLead,
  onNavigateSub,
  onSelectLead,
  onAddLeadModal,
  onUpdateLead,
  onNotify,
  isFirstRun = false
}: LeadsViewProps) {
  // Top Tabs: 'leads' vs 'follow-ups'
  const [topTab, setTopTab] = useState<'leads' | 'follow-ups'>(
    activeSubCategory === 'follow-ups' ? 'follow-ups' : 'leads'
  );

  useEffect(() => {
    if (activeSubCategory === 'follow-ups') {
      setTopTab('follow-ups');
    } else {
      setTopTab('leads');
    }
  }, [activeSubCategory]);

  // Layout switcher: 'table' vs 'board'
  const [viewLayout, setViewLayout] = useState<'table' | 'board'>(
    activeSubCategory === 'pipeline' ? 'board' : 'table'
  );

  useEffect(() => {
    if (activeSubCategory === 'pipeline') {
      setViewLayout('board');
    }
  }, [activeSubCategory]);

  // Saved Views: Built-in + Custom Views stored in localStorage
  const [savedViews, setSavedViews] = useState<CustomSavedView[]>(() => {
    try {
      const stored = localStorage.getItem('nexora_saved_lead_views');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });
  const [activeViewChip, setActiveViewChip] = useState<string>('All');
  const [isAddingView, setIsAddingView] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // Search & Filter Dropdown Popover
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [tempFilter, setTempFilter] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);

  // Custom Date Range & Calendar
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isCustomDateActive, setIsCustomDateActive] = useState(false);
  const [customRange, setCustomRange] = useState<DateRangeSelection>({
    startDate: '2026-05-01',
    endDate: '2026-10-06',
    sortBasis: 'newest'
  });

  // Sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>('lead');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Selected Row IDs for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Follow-ups state
  const [followUpItems, setFollowUpItems] = useState<FollowUpItem[]>(() => {
    try {
      const stored = localStorage.getItem('nexora_follow_ups');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_FOLLOW_UPS;
  });
  const [followUpTab, setFollowUpTab] = useState<'overdue' | 'today' | 'upcoming' | 'done'>('overdue');
  const [snoozeMenuId, setSnoozeMenuId] = useState<string | null>(null);

  // Review & Send Draft Modal state
  const [reviewingFollowUp, setReviewingFollowUp] = useState<FollowUpItem | null>(null);
  const [editedDraft, setEditedDraft] = useState('');

  // Board collapsible columns: Won & Lost
  const [isWonExpanded, setIsWonExpanded] = useState(false);
  const [isLostExpanded, setIsLostExpanded] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Persist follow ups
  useEffect(() => {
    try {
      localStorage.setItem('nexora_follow_ups', JSON.stringify(followUpItems));
    } catch {
      // ignore
    }
  }, [followUpItems]);

  // Click outside to close filter popover and snooze menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterPopoverRef.current && 
        !filterPopoverRef.current.contains(e.target as Node) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target as Node)
      ) {
        setIsFilterPopoverOpen(false);
      }
      setSnoozeMenuId(null);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsFilterPopoverOpen(false);
        setSnoozeMenuId(null);
        setReviewingFollowUp(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (stageFilter !== 'All') count++;
    if (tempFilter !== 'All') count++;
    if (ownerFilter !== 'All') count++;
    if (channelFilter !== 'All') count++;
    return count;
  }, [stageFilter, tempFilter, ownerFilter, channelFilter]);

  // Calculate counts for Follow-up tabs
  const followUpCounts = useMemo(() => {
    return {
      overdue: followUpItems.filter(f => f.status === 'overdue').length,
      today: followUpItems.filter(f => f.status === 'today').length,
      upcoming: followUpItems.filter(f => f.status === 'upcoming').length,
      done: followUpItems.filter(f => f.status === 'done').length,
      active: followUpItems.filter(f => f.status !== 'done').length,
    };
  }, [followUpItems]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    let list = leads.filter(l => {
      // Saved views filter
      if (activeViewChip === 'Hot' && l.score < 80 && l.temperature !== 'HOT') {
        return false;
      }
      if (activeViewChip === 'Needs follow-up' && !l.isPriority && l.tag !== 'Follow-up' && !l.humanAttentionRequired) {
        return false;
      }

      // Dropdown filters
      if (stageFilter !== 'All') {
        const leadStage = (l.stage || l.status || '').toLowerCase();
        if (!leadStage.includes(stageFilter.toLowerCase())) return false;
      }

      if (tempFilter !== 'All') {
        if (l.temperature !== tempFilter) return false;
      }

      if (ownerFilter !== 'All') {
        if (ownerFilter === 'AI' && l.handlingMode === 'HUMAN') return false;
        if (ownerFilter === 'Human' && l.handlingMode !== 'HUMAN' && !l.assignee?.name) return false;
      }

      if (channelFilter !== 'All') {
        if (l.source !== channelFilter) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = l.name.toLowerCase().includes(q);
        const matchesCompany = (l.company || '').toLowerCase().includes(q);
        const matchesEmail = (l.email || '').toLowerCase().includes(q);
        const matchesSource = (l.source || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesEmail && !matchesSource) return false;
      }

      return true;
    });

    // Custom range sorting if calendar filter active
    if (isCustomDateActive) {
      list = [...list].sort((a, b) => {
        if (customRange.sortBasis === 'priority') {
          return b.score - a.score;
        } else if (customRange.sortBasis === 'value') {
          return parseDealValue(b.value) - parseDealValue(a.value);
        } else if (customRange.sortBasis === 'alphabetical') {
          return (a.company || a.name).localeCompare(b.company || b.name);
        } else if (customRange.sortBasis === 'oldest') {
          return a.id.localeCompare(b.id);
        } else {
          return b.id.localeCompare(a.id);
        }
      });
    } else {
      // Column-based sorting
      list = [...list].sort((a, b) => {
        let cmp = 0;
        if (sortColumn === 'lead') {
          cmp = (a.company || a.name).localeCompare(b.company || b.name);
        } else if (sortColumn === 'stage') {
          cmp = (a.stage || a.status || '').localeCompare(b.stage || b.status || '');
        } else if (sortColumn === 'score') {
          cmp = a.score - b.score;
        } else if (sortColumn === 'owner') {
          const ownerA = a.assignee?.name || (a.handlingMode === 'HUMAN' ? 'You' : 'AI');
          const ownerB = b.assignee?.name || (b.handlingMode === 'HUMAN' ? 'You' : 'AI');
          cmp = ownerA.localeCompare(ownerB);
        } else if (sortColumn === 'value') {
          cmp = parseDealValue(a.value) - parseDealValue(b.value);
        } else if (sortColumn === 'activity') {
          cmp = (a.lastActivity || '').localeCompare(b.lastActivity || '');
        }
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return list;
  }, [
    leads, 
    activeViewChip, 
    stageFilter, 
    tempFilter, 
    ownerFilter, 
    channelFilter, 
    search, 
    isCustomDateActive, 
    customRange, 
    sortColumn, 
    sortDirection
  ]);

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));

  // Reset pagination when filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter, tempFilter, ownerFilter, channelFilter, activeViewChip]);

  // Selection handlers
  const allSelected = paginatedLeads.length > 0 && paginatedLeads.every(l => selectedIds.includes(l.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedLeads.map(l => l.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkChangeStage = (newStage: LeadStage) => {
    if (onUpdateLead) {
      selectedIds.forEach(id => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
          onUpdateLead({ ...lead, stage: newStage });
        }
      });
    }
    if (onNotify) onNotify('Bulk Action', `Updated stage to ${newStage} for ${selectedIds.length} leads.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (onNotify) onNotify('Leads Deleted', `Removed ${selectedIds.length} selected leads.`);
    setSelectedIds([]);
    setIsConfirmingDelete(false);
  };

  // Custom saved view creation
  const handleSaveCustomView = () => {
    const trimmed = newViewName.trim();
    if (!trimmed) return;
    const newView: CustomSavedView = {
      id: `view-${Date.now()}`,
      name: trimmed
    };
    const updated = [...savedViews, newView];
    setSavedViews(updated);
    try {
      localStorage.setItem('nexora_saved_lead_views', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setActiveViewChip(trimmed);
    setNewViewName('');
    setIsAddingView(false);
    if (onNotify) onNotify('View Saved', `Created custom view "${trimmed}".`);
  };

  const handleClearFilters = () => {
    setStageFilter('All');
    setTempFilter('All');
    setOwnerFilter('All');
    setChannelFilter('All');
    setSearch('');
    setIsCustomDateActive(false);
  };

  // Table column sorting handler
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getAriaSort = (column: SortColumn): 'ascending' | 'descending' | 'none' => {
    if (sortColumn !== column) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-ink-3 opacity-60" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-brand" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-brand" />
    );
  };

  // Drag and drop for Kanban Board
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnStage = (e: React.DragEvent<HTMLDivElement>, targetStage: LeadStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (lead.stage === targetStage) return;

    const updatedLead: Lead = {
      ...lead,
      stage: targetStage,
      status: targetStage === 'Won' ? 'Won' : targetStage === 'Lost' ? 'Lost' : lead.status
    };

    if (onUpdateLead) {
      onUpdateLead(updatedLead);
    }
    if (onNotify) {
      onNotify('Stage Updated', `Moved ${lead.company || lead.name} to ${targetStage}.`);
    }
  };

  // Follow-up actions
  const handleSnooze = (id: string, option: 'later' | 'tomorrow' | 'next_week') => {
    setFollowUpItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (option === 'later') {
        return { ...item, status: 'today', dueDate: 'Today at 5:00 PM' };
      }
      if (option === 'tomorrow') {
        return { ...item, status: 'upcoming', dueDate: 'Tomorrow at 9:00 AM' };
      }
      return { ...item, status: 'upcoming', dueDate: 'Next week (in 7 days)' };
    }));
    setSnoozeMenuId(null);
    if (onNotify) onNotify('Follow-up Snoozed', 'Reminder has been rescheduled.');
  };

  const handleMarkDone = (id: string) => {
    setFollowUpItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'done' };
      }
      return item;
    }));
    if (onNotify) onNotify('Follow-up Completed', 'Task marked as done.');
  };

  const handleOpenReviewModal = (item: FollowUpItem) => {
    setReviewingFollowUp(item);
    setEditedDraft(item.draft);
  };

  const handleSendDraft = () => {
    if (!reviewingFollowUp) return;
    handleMarkDone(reviewingFollowUp.id);
    if (onNotify) {
      onNotify(
        'Message Dispatched', 
        `Sent reply to ${reviewingFollowUp.contactName} on ${reviewingFollowUp.channel}.`
      );
    }
    setReviewingFollowUp(null);
  };

  // Board stages: 5 active stages
  const activeBoardStages: Array<{ id: LeadStage; label: string }> = [
    { id: 'New', label: 'New' },
    { id: 'Engaged', label: 'Engaged' },
    { id: 'Qualified', label: 'Qualified' },
    { id: 'Contacted', label: 'Contacted' },
    { id: 'Proposal', label: 'Proposal' }
  ];

  // Helper for computing stage values & leads
  const getStageStats = (stageId: string) => {
    const stageLeads = filteredLeads.filter(l => (l.stage || l.status) === stageId);
    const count = stageLeads.length;
    const totalVal = stageLeads.reduce((sum, l) => sum + parseDealValue(l.value), 0);
    return {
      leads: stageLeads,
      count,
      valueText: formatStageValue(totalVal)
    };
  };

  const wonStats = getStageStats('Won');
  const lostStats = getStageStats('Lost');

  return (
    <div className="space-y-6 pb-12 select-text font-sans">
      
      {/* ========================================================
          1. PAGE HEADER
          PageHeader "Leads" with SegmentedControl [Leads] [Follow-ups] and "Add lead" button
         ======================================================== */}
      <PageHeader
        title="Leads"
        subtitle="Manage prospects, pipeline velocity, and follow-up activities."
        actions={
          <div className="flex items-center gap-3">
            <SegmentedControl<'leads' | 'follow-ups'>
              options={[
                { id: 'leads', label: 'Leads', count: leads.length },
                { id: 'follow-ups', label: 'Follow-ups', count: followUpCounts.active }
              ]}
              value={topTab}
              onChange={(val) => {
                setTopTab(val);
                onNavigateSub(val === 'follow-ups' ? 'follow-ups' : 'all-leads');
              }}
            />

            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
              onClick={onAddLeadModal}
            >
              Add lead
            </Button>
          </div>
        }
      />

      {/* First-Run Empty State */}
      {isFirstRun && (
        <EmptyState
          icon={<Users className="w-6 h-6 text-brand" />}
          title="No leads yet."
          description="Leads are created automatically from conversations across your channels, or you can register a new prospect manually."
          action={
            <Button
              variant="primary"
              leadingIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
              onClick={onAddLeadModal}
            >
              Add lead
            </Button>
          }
        />
      )}

      {/* ========================================================
          TAB 1: LEADS (Table / Board View)
         ======================================================== */}
      {topTab === 'leads' && !isFirstRun && (
        <div className="space-y-4">
          
          {/* Row 2: Saved Views Underline Tabs & Table/Board Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line-subtle pb-1">
            
            {/* Saved Views as Underline Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Views:
              </span>

              {/* Built-in Views */}
              {[
                { 
                  id: 'All', 
                  label: 'All', 
                  count: leads.length 
                },
                { 
                  id: 'Hot', 
                  label: (
                    <span className="inline-flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-hot" />
                      Hot
                    </span>
                  ), 
                  count: leads.filter(l => l.score >= 80 || l.temperature === 'HOT').length 
                },
                { 
                  id: 'Needs follow-up', 
                  label: (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-warn" />
                      Needs follow-up
                    </span>
                  ), 
                  count: leads.filter(l => l.isPriority || l.tag === 'Follow-up' || l.humanAttentionRequired).length 
                },
                ...savedViews.map(sv => ({
                  id: sv.name,
                  label: sv.name,
                  count: leads.filter(l => (l.company || l.name).toLowerCase().includes(sv.name.toLowerCase())).length
                }))
              ].map(tab => {
                const isActive = activeViewChip === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveViewChip(tab.id)}
                    className={`pb-2.5 pt-1 text-xs font-medium cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none ${
                      isActive
                        ? 'border-brand text-brand font-semibold'
                        : 'border-transparent text-ink-3 hover:text-ink'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-xs tabular-nums px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? 'bg-brand-soft text-brand' : 'bg-surface-raised text-ink-3'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}

              {/* "+ Save view" / inline input */}
              {isAddingView ? (
                <div className="flex items-center gap-1.5 pb-2">
                  <input
                    type="text"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveCustomView();
                      if (e.key === 'Escape') setIsAddingView(false);
                    }}
                    placeholder="View name..."
                    autoFocus
                    className="text-xs px-2 py-1 rounded-md border border-line bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-brand w-28"
                  />
                  <Button size="sm" variant="primary" onClick={handleSaveCustomView}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingView(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingView(true)}
                  className="text-xs text-brand hover:underline font-medium pb-2.5 pt-1 cursor-pointer whitespace-nowrap"
                >
                  + Save view
                </button>
              )}
            </div>

            {/* View Switcher: Table / Board SegmentedControl */}
            <div className="shrink-0 self-start sm:self-auto pb-1">
              <SegmentedControl<'table' | 'board'>
                options={[
                  { 
                    id: 'table', 
                    label: (
                      <span className="flex items-center gap-1.5">
                        <List className="w-3.5 h-3.5" />
                        Table
                      </span>
                    ) 
                  },
                  { 
                    id: 'board', 
                    label: (
                      <span className="flex items-center gap-1.5">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Board
                      </span>
                    ) 
                  }
                ]}
                value={viewLayout}
                onChange={setViewLayout}
              />
            </div>
          </div>

          {/* Row 3: Filter Bar (Search, Filter Popover, Custom Date, Active Chips) */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl border border-line-subtle bg-surface shadow-xs">
              
              <div className="flex flex-wrap items-center gap-2 relative">
                
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    aria-label="Search leads"
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="text-xs px-2.5 py-1.5 pl-8 pr-7 rounded-lg border border-line bg-surface text-ink placeholder-ink-3 focus:outline-none focus:ring-2 focus:ring-brand w-48 sm:w-60 transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-2.5 pointer-events-none" />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-2 text-ink-3 hover:text-ink cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* "+ Filter" Popover Trigger */}
                <div className="relative">
                  <button
                    ref={filterBtnRef}
                    type="button"
                    onClick={() => setIsFilterPopoverOpen(prev => !prev)}
                    className={`min-h-8! h-8 px-2.5 text-xs font-medium rounded-lg border cursor-pointer inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      activeFilterCount > 0
                        ? 'bg-brand-soft text-brand border-brand/30 font-semibold'
                        : 'bg-surface text-ink border-line hover:bg-surface-hover'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="text-xs tabular-nums px-1.5 py-0.2 rounded-full bg-brand text-on-brand font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                    <ChevronDown className="w-3 h-3 text-ink-3" />
                  </button>

                  {/* Filter Popover Dropdown */}
                  {isFilterPopoverOpen && (
                    <div
                      ref={filterPopoverRef}
                      className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-line bg-surface p-3.5 shadow-pop z-30 space-y-3 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between border-b border-line-subtle pb-2">
                        <span className="text-xs font-semibold text-ink">Filter Leads</span>
                        {activeFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-xs text-brand hover:underline font-medium cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Stage Select */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-ink-2">Stage</label>
                        <select
                          value={stageFilter}
                          onChange={(e) => setStageFilter(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-line bg-surface-raised text-ink focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                        >
                          <option value="All">All Stages</option>
                          <option value="New">New</option>
                          <option value="Engaged">Engaged</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>

                      {/* Temperature Select */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-ink-2">Temperature</label>
                        <select
                          value={tempFilter}
                          onChange={(e) => setTempFilter(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-line bg-surface-raised text-ink focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                        >
                          <option value="All">All Temperatures</option>
                          <option value="HOT">Hot</option>
                          <option value="WARM">Warm</option>
                          <option value="COLD">Cold</option>
                        </select>
                      </div>

                      {/* Owner Select */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-ink-2">Owner</label>
                        <select
                          value={ownerFilter}
                          onChange={(e) => setOwnerFilter(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-line bg-surface-raised text-ink focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                        >
                          <option value="All">All Owners</option>
                          <option value="AI">AI Handled</option>
                          <option value="Human">Human Assigned</option>
                        </select>
                      </div>

                      {/* Channel Select */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-ink-2">Channel</label>
                        <select
                          value={channelFilter}
                          onChange={(e) => setChannelFilter(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-line bg-surface-raised text-ink focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                        >
                          <option value="All">All Channels</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Instagram">Instagram</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Website">Website</option>
                          <option value="Referral">Referral</option>
                        </select>
                      </div>

                      <div className="pt-2 border-t border-line-subtle flex justify-end">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setIsFilterPopoverOpen(false)}
                        >
                          Apply filters
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Date Range Filter Button */}
                <button
                  type="button"
                  id="leads-custom-date-btn"
                  onClick={() => setIsCalendarModalOpen(prev => !prev)}
                  className={`min-h-8! h-8 px-2.5 text-xs font-medium rounded-lg border cursor-pointer inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    isCustomDateActive
                      ? 'bg-brand-soft text-brand border-brand/30 font-semibold'
                      : 'bg-surface text-ink border-line hover:bg-surface-hover'
                  }`}
                  title="Select start and end date on calendar and sort leads"
                >
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                  <span>Custom Date</span>
                  {isCustomDateActive && (
                    <span className="text-xs font-mono text-brand font-semibold">
                      ({customRange.startDate.slice(5)} → {customRange.endDate.slice(5)})
                    </span>
                  )}
                </button>

                {isCustomDateActive && (
                  <button
                    type="button"
                    onClick={() => setIsCustomDateActive(false)}
                    className="text-xs text-ink-3 hover:text-ink underline cursor-pointer"
                    title="Clear custom date filter"
                  >
                    Clear date
                  </button>
                )}
              </div>

              {/* Total matching leads indicator */}
              <div className="text-xs text-ink-3 tabular-nums">
                {filteredLeads.length} lead{filteredLeads.length === 1 ? '' : 's'}
              </div>
            </div>

            {/* Active Filter Chips */}
            {(activeFilterCount > 0 || search || isCustomDateActive) && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-xs font-semibold text-ink-3 mr-1">
                  Active Filters:
                </span>
                
                {search && (
                  <Badge tone="brand" className="gap-1.5">
                    <span>Search: "{search}"</span>
                    <button type="button" onClick={() => setSearch('')} className="hover:text-danger cursor-pointer">×</button>
                  </Badge>
                )}
                {stageFilter !== 'All' && (
                  <Badge tone="brand" className="gap-1.5">
                    <span>Stage: {stageFilter}</span>
                    <button type="button" onClick={() => setStageFilter('All')} className="hover:text-danger cursor-pointer">×</button>
                  </Badge>
                )}
                {tempFilter !== 'All' && (
                  <Badge tone="brand" className="gap-1.5">
                    <span>Temp: {tempFilter}</span>
                    <button type="button" onClick={() => setTempFilter('All')} className="hover:text-danger cursor-pointer">×</button>
                  </Badge>
                )}
                {ownerFilter !== 'All' && (
                  <Badge tone="brand" className="gap-1.5">
                    <span>Owner: {ownerFilter}</span>
                    <button type="button" onClick={() => setOwnerFilter('All')} className="hover:text-danger cursor-pointer">×</button>
                  </Badge>
                )}
                {channelFilter !== 'All' && (
                  <Badge tone="brand" className="gap-1.5">
                    <span>Channel: {channelFilter}</span>
                    <button type="button" onClick={() => setChannelFilter('All')} className="hover:text-danger cursor-pointer">×</button>
                  </Badge>
                )}
                {isCustomDateActive && (
                  <Badge tone="brand" className="gap-1.5">
                    <span>Date: {customRange.startDate} - {customRange.endDate}</span>
                    <button type="button" onClick={() => setIsCustomDateActive(false)} className="hover:text-danger cursor-pointer">×</button>
                  </Badge>
                )}

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-brand hover:underline font-medium cursor-pointer ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Bulk Selection Bar (Shown when rows are selected) */}
          {selectedIds.length > 0 && (
            <div className="p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs bg-surface-raised border border-line text-ink shadow-card animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand shadow-xs shrink-0" />
                <span className="font-semibold text-ink text-xs">
                  {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selected
                </span>
              </div>

              {isConfirmingDelete ? (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <span className="text-xs font-medium text-danger">
                    Delete {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''}?
                  </span>
                  <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                    Confirm Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsConfirmingDelete(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleBulkChangeStage('Qualified')}
                  >
                    Change stage
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (onNotify) onNotify('Follow-up Queued', `Created follow-up tasks for ${selectedIds.length} leads.`);
                      setSelectedIds([]);
                    }}
                  >
                    Add follow-up
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    leadingIcon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => setIsConfirmingDelete(true)}
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedIds([])}
                  >
                    Deselect all
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              LAYOUT A: TABLE VIEW
              Real <table> with sticky header, sortable columns, accessibility
             ======================================================== */}
          {viewLayout === 'table' ? (
            <div className="border border-line rounded-xl overflow-hidden bg-surface shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-surface-raised border-b border-line z-10 text-ink-3 uppercase text-xs font-semibold tracking-wider">
                    <tr>
                      {/* Selection checkbox header */}
                      <th scope="col" className="p-3.5 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          aria-label={allSelected ? "Deselect all leads" : "Select all leads"}
                          className="inline-flex items-center justify-center cursor-pointer text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          {allSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>

                      {/* Lead (Avatar + company, name below) */}
                      <th scope="col" aria-sort={getAriaSort('lead')} className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleSort('lead')}
                          className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer font-semibold uppercase text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          <span>Lead</span>
                          {renderSortIcon('lead')}
                        </button>
                      </th>

                      {/* Stage (Badge) */}
                      <th scope="col" aria-sort={getAriaSort('stage')} className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleSort('stage')}
                          className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer font-semibold uppercase text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          <span>Stage</span>
                          {renderSortIcon('stage')}
                        </button>
                      </th>

                      {/* Score (Badge + temperature icon) */}
                      <th scope="col" aria-sort={getAriaSort('score')} className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleSort('score')}
                          className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer font-semibold uppercase text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          <span>Score</span>
                          {renderSortIcon('score')}
                        </button>
                      </th>

                      {/* Owner */}
                      <th scope="col" aria-sort={getAriaSort('owner')} className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleSort('owner')}
                          className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer font-semibold uppercase text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          <span>Owner</span>
                          {renderSortIcon('owner')}
                        </button>
                      </th>

                      {/* Deal value (Right-aligned) */}
                      <th scope="col" aria-sort={getAriaSort('value')} className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleSort('value')}
                          className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer font-semibold uppercase text-xs ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          <span>Deal value</span>
                          {renderSortIcon('value')}
                        </button>
                      </th>

                      {/* Last activity */}
                      <th scope="col" aria-sort={getAriaSort('activity')} className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleSort('activity')}
                          className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer font-semibold uppercase text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          <span>Last activity</span>
                          {renderSortIcon('activity')}
                        </button>
                      </th>

                      {/* Action hover slot */}
                      <th scope="col" className="p-3.5 text-right w-24">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line-subtle">
                    {paginatedLeads.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-ink-3">
                          <EmptyState
                            icon={<Search className="w-6 h-6 text-ink-3" />}
                            title="No matching leads"
                            description="Try clearing search filters or adjusting your date range."
                            action={
                              <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                                Clear all filters
                              </Button>
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      paginatedLeads.map(lead => {
                        const isSelected = selectedIds.includes(lead.id);
                        const isHot = lead.temperature === 'HOT' || lead.score >= 90;
                        const isWarm = lead.temperature === 'WARM' || (lead.score >= 80 && lead.score < 90);
                        const stageTone = getStageTone(lead.stage || lead.status);

                        // Owner resolution: lead's real assignee or Bot icon for AI
                        const assigneeName = lead.assignee?.name;
                        const isHuman = lead.handlingMode === 'HUMAN' || Boolean(assigneeName);

                        return (
                          <tr
                            key={lead.id}
                            tabIndex={0}
                            onClick={() => onSelectLead(lead)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') onSelectLead(lead);
                            }}
                            className={`group cursor-pointer transition-colors focus-visible:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                              isSelected
                                ? 'bg-brand-soft/40 hover:bg-brand-soft/60'
                                : 'hover:bg-surface-hover'
                            }`}
                          >
                            {/* Checkbox */}
                            <td 
                              className="p-3.5 text-center" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                aria-label={`Select ${lead.name}`}
                                onClick={() => toggleSelectRow(lead.id)}
                                className="inline-flex items-center justify-center cursor-pointer text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-brand" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            {/* Lead: Avatar + Company, Name below */}
                            <td className="p-3.5 max-w-[220px]">
                              <div className="flex items-center gap-3">
                                <Avatar name={lead.company || lead.name} size="md" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-ink truncate text-sm">
                                    {lead.company || lead.name}
                                  </p>
                                  <p className="text-xs text-ink-3 truncate">
                                    {lead.name}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Stage: Badge */}
                            <td className="p-3.5">
                              <Badge tone={stageTone}>
                                {lead.stage || lead.status}
                              </Badge>
                            </td>

                            {/* Score: Badge + Temperature icon */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  tone={isHot ? 'hot' : isWarm ? 'warning' : 'neutral'}
                                  className="font-mono font-bold"
                                >
                                  {lead.score}
                                </Badge>
                                {isHot && (
                                  <span className="inline-flex items-center gap-1 text-hot font-medium text-xs">
                                    <Flame className="w-3.5 h-3.5" />
                                    <span>Hot</span>
                                  </span>
                                )}
                                {isWarm && (
                                  <span className="inline-flex items-center gap-1 text-warn font-medium text-xs">
                                    <span>Warm</span>
                                  </span>
                                )}
                                {!isHot && !isWarm && (
                                  <span className="text-ink-3 text-xs">
                                    Cold
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Owner: Real assignee name + Avatar or Bot icon */}
                            <td className="p-3.5">
                              {isHuman ? (
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Avatar name={assigneeName || 'You'} size="sm" />
                                  <span className="text-xs font-medium text-ink truncate">
                                    {assigneeName || 'You'}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-ink-2">
                                  <span className="w-6 h-6 rounded-lg bg-surface-raised border border-line-subtle flex items-center justify-center text-ink-3">
                                    <Bot className="w-3.5 h-3.5" />
                                  </span>
                                  <span className="text-xs font-medium text-ink">
                                    AI
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Deal Value: Right-aligned */}
                            <td className="p-3.5 text-right font-medium text-ink tabular-nums">
                              {lead.value || '—'}
                            </td>

                            {/* Last Activity */}
                            <td className="p-3.5 text-xs text-ink-2">
                              <span className="font-medium text-ink">
                                {lead.source}
                              </span>
                              <span className="mx-1 text-ink-3">·</span>
                              <span>{lead.lastActivity || 'Today'}</span>
                            </td>

                            {/* Action: Hover "Open" button */}
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectLead(lead);
                                }}
                                className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer focus-visible:opacity-100 focus-visible:outline-none"
                              >
                                <span>Open</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination controls using Button */}
              <div className="p-3.5 border-t border-line-subtle bg-surface-raised flex items-center justify-between text-xs text-ink-3">
                <span>
                  Showing {filteredLeads.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
                </span>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="font-semibold text-ink px-2 tabular-nums">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
                LAYOUT B: KANBAN BOARD VIEW
                HTML5 drag-and-drop, computed counts & totals, collapsible Won/Lost
               ======================================================== */
            <div className="flex items-start gap-3.5 overflow-x-auto pb-4 scrollbar-thin">
              {/* Active Stages */}
              {activeBoardStages.map(stage => {
                const stats = getStageStats(stage.id);

                return (
                  <div
                    key={stage.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnStage(e, stage.id)}
                    className="w-72 shrink-0 rounded-xl border border-line-subtle bg-surface-raised p-3.5 space-y-3 transition-colors"
                  >
                    {/* Column Header */}
                    <div className="flex items-baseline justify-between border-b border-line-subtle pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs tracking-tight text-ink">
                          {stage.label}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface text-ink-2 tabular-nums">
                          {stats.count}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-ink-3 tabular-nums">
                        {stats.valueText}
                      </span>
                    </div>

                    {/* Stage Cards */}
                    <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                      {stats.leads.length === 0 ? (
                        <div className="p-6 text-center rounded-lg border border-dashed border-line text-xs text-ink-3">
                          No leads in this stage
                        </div>
                      ) : (
                        stats.leads.map(lead => {
                          const isHot = lead.temperature === 'HOT' || lead.score >= 90;
                          const isWarm = lead.temperature === 'WARM' || (lead.score >= 80 && lead.score < 90);
                          const assigneeName = lead.assignee?.name;
                          const isHuman = lead.handlingMode === 'HUMAN' || Boolean(assigneeName);
                          const needsHuman = lead.handlingMode === 'HUMAN' || lead.humanAttentionRequired || lead.isPriority;

                          return (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead.id)}
                              onClick={() => onSelectLead(lead)}
                              className="p-3.5 rounded-lg border border-line bg-surface hover:border-brand/50 hover:shadow-card transition-all cursor-grab active:cursor-grabbing space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-xs text-ink truncate max-w-[150px]">
                                  {lead.company || lead.name}
                                </span>
                                <Badge 
                                  tone={isHot ? 'hot' : isWarm ? 'warning' : 'neutral'}
                                  size="sm"
                                  className="font-mono font-bold"
                                >
                                  {lead.score}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between text-xs text-ink-3">
                                <span className="truncate">{lead.name}</span>
                                <span className="font-semibold text-ink tabular-nums">
                                  {lead.value || '—'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-line-subtle text-ink-3">
                                {/* Owner */}
                                <div className="flex items-center gap-1.5">
                                  {isHuman ? (
                                    <>
                                      <Avatar name={assigneeName || 'You'} size="sm" />
                                      <span className="text-ink truncate max-w-[70px]">
                                        {assigneeName || 'You'}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Bot className="w-3.5 h-3.5 text-brand" />
                                      <span>AI</span>
                                    </>
                                  )}
                                </div>

                                {/* Temperature or Needs human */}
                                {needsHuman ? (
                                  <Badge tone="warning" size="sm" className="gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Needs human</span>
                                  </Badge>
                                ) : isHot ? (
                                  <span className="inline-flex items-center gap-1 text-hot font-medium">
                                    <Flame className="w-3 h-3" />
                                    <span>Hot</span>
                                  </span>
                                ) : (
                                  <span>{lead.lastActivity || 'Today'}</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}

              {/* WON Column: Expandable / Collapsible */}
              {isWonExpanded ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnStage(e, 'Won')}
                  className="w-72 shrink-0 rounded-xl border border-ok/30 bg-ok-soft/30 p-3.5 space-y-3 transition-colors"
                >
                  <div className="flex items-baseline justify-between border-b border-line-subtle pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs tracking-tight text-ok">
                        Won
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface text-ink tabular-nums">
                        {wonStats.count}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ok tabular-nums">
                        {wonStats.valueText}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsWonExpanded(false)}
                        className="text-ink-3 hover:text-ink text-xs cursor-pointer p-1 rounded hover:bg-surface"
                        title="Collapse Won column"
                        aria-label="Collapse Won column"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                    {wonStats.leads.length === 0 ? (
                      <div className="p-6 text-center rounded-lg border border-dashed border-line text-xs text-ink-3">
                        No leads in Won stage
                      </div>
                    ) : (
                      wonStats.leads.map(lead => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => onSelectLead(lead)}
                          className="p-3.5 rounded-lg border border-line bg-surface hover:shadow-card transition-all cursor-grab active:cursor-grabbing space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-ink truncate">
                              {lead.company || lead.name}
                            </span>
                            <Badge tone="success" size="sm">Won</Badge>
                          </div>
                          <p className="text-xs text-ink-3">{lead.value || '—'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsWonExpanded(true)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnStage(e, 'Won')}
                  className="w-14 shrink-0 rounded-xl border border-line-subtle bg-surface hover:bg-surface-hover cursor-pointer p-3 text-center flex flex-col items-center justify-between min-h-[360px] transition-colors"
                  title="Click to expand Won column (drag cards here to mark Won)"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-ok" />
                  <span className="text-xs uppercase font-bold text-ok block tracking-wider [writing-mode:vertical-rl] rotate-180">
                    Won ({wonStats.count}) ▸
                  </span>
                  <span className="text-xs text-ink-3 tabular-nums font-semibold">
                    {wonStats.valueText}
                  </span>
                </div>
              )}

              {/* LOST Column: Expandable / Collapsible */}
              {isLostExpanded ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnStage(e, 'Lost')}
                  className="w-72 shrink-0 rounded-xl border border-line bg-surface-raised p-3.5 space-y-3 transition-colors"
                >
                  <div className="flex items-baseline justify-between border-b border-line-subtle pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs tracking-tight text-ink-3">
                        Lost
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface text-ink tabular-nums">
                        {lostStats.count}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink-3 tabular-nums">
                        {lostStats.valueText}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLostExpanded(false)}
                        className="text-ink-3 hover:text-ink text-xs cursor-pointer p-1 rounded hover:bg-surface"
                        title="Collapse Lost column"
                        aria-label="Collapse Lost column"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                    {lostStats.leads.length === 0 ? (
                      <div className="p-6 text-center rounded-lg border border-dashed border-line text-xs text-ink-3">
                        No leads in Lost stage
                      </div>
                    ) : (
                      lostStats.leads.map(lead => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => onSelectLead(lead)}
                          className="p-3.5 rounded-lg border border-line bg-surface hover:shadow-card transition-all cursor-grab active:cursor-grabbing space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-ink truncate">
                              {lead.company || lead.name}
                            </span>
                            <Badge tone="neutral" size="sm">Lost</Badge>
                          </div>
                          <p className="text-xs text-ink-3">{lead.value || '—'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsLostExpanded(true)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnStage(e, 'Lost')}
                  className="w-14 shrink-0 rounded-xl border border-line-subtle bg-surface hover:bg-surface-hover cursor-pointer p-3 text-center flex flex-col items-center justify-between min-h-[360px] transition-colors"
                  title="Click to expand Lost column (drag cards here to mark Lost)"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-ink-3" />
                  <span className="text-xs uppercase font-bold text-ink-3 block tracking-wider [writing-mode:vertical-rl] rotate-180">
                    Lost ({lostStats.count}) ▸
                  </span>
                  <span className="text-xs text-ink-3 tabular-nums font-semibold">
                    {lostStats.valueText}
                  </span>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================
          TAB 2: FOLLOW-UPS VIEW
          Filtered by sub-tab (Overdue, Today, Upcoming, Done), real Snooze,
          Mark Done, and Review & Send draft modal
         ======================================================== */}
      {topTab === 'follow-ups' && (
        <div className="space-y-4">
          
          {/* Sub-tabs bar: Segmented control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line-subtle pb-3">
            <SegmentedControl<'overdue' | 'today' | 'upcoming' | 'done'>
              options={[
                { id: 'overdue', label: 'Overdue', count: followUpCounts.overdue },
                { id: 'today', label: 'Today', count: followUpCounts.today },
                { id: 'upcoming', label: 'Upcoming', count: followUpCounts.upcoming },
                { id: 'done', label: 'Done', count: followUpCounts.done }
              ]}
              value={followUpTab}
              onChange={setFollowUpTab}
            />
            
            <span className="text-xs text-ink-3">
              {followUpCounts.overdue > 0 
                ? `${followUpCounts.overdue} urgent follow-up${followUpCounts.overdue > 1 ? 's' : ''} pending review`
                : 'All overdue items cleared'
              }
            </span>
          </div>

          {/* Follow-up Cards filtered by active sub-tab */}
          <div className="space-y-3.5">
            {followUpItems.filter(f => f.status === followUpTab).length === 0 ? (
              <EmptyState
                icon={<Clock className="w-6 h-6 text-ink-3" />}
                title={`No ${followUpTab} follow-ups`}
                description={
                  followUpTab === 'done' 
                    ? 'Completed follow-up items will appear here.'
                    : `You are completely caught up on ${followUpTab} follow-ups.`
                }
              />
            ) : (
              followUpItems.filter(f => f.status === followUpTab).map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border border-line-subtle bg-surface space-y-3.5 shadow-card transition-colors relative"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {item.status === 'overdue' && (
                        <Badge tone="danger">
                          Overdue · {item.dueDate}
                        </Badge>
                      )}
                      {item.status === 'today' && (
                        <Badge tone="warning">
                          {item.dueDate}
                        </Badge>
                      )}
                      {item.status === 'upcoming' && (
                        <Badge tone="neutral">
                          {item.dueDate}
                        </Badge>
                      )}
                      {item.status === 'done' && (
                        <Badge tone="success">
                          Completed
                        </Badge>
                      )}

                      <span className="font-semibold text-ink">
                        {item.company}
                      </span>
                      <span className="text-ink-3">·</span>
                      <span className="text-ink-2">
                        {item.contactName} ({item.channel})
                      </span>
                    </div>

                    <span className="text-xs font-medium text-ink-3">
                      Assigned: {item.owner}
                    </span>
                  </div>

                  {/* Task Name */}
                  <h4 className="text-sm font-semibold tracking-tight text-ink">
                    "{item.task}"
                  </h4>

                  {/* AI Draft Box */}
                  <div className="p-3.5 rounded-lg border border-line-subtle bg-surface-raised text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Draft Ready</span>
                    </div>
                    <p className="italic leading-relaxed text-ink-2">
                      "{item.draft}"
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {item.status !== 'done' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          leadingIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenReviewModal(item)}
                        >
                          Review & send
                        </Button>

                        {/* Snooze Popover */}
                        <div className="relative">
                          <Button
                            variant="secondary"
                            size="sm"
                            leadingIcon={<Clock className="w-3.5 h-3.5" />}
                            trailingIcon={<ChevronDown className="w-3 h-3 text-ink-3" />}
                            onClick={() => setSnoozeMenuId(prev => prev === item.id ? null : item.id)}
                          >
                            Snooze
                          </Button>

                          {snoozeMenuId === item.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 bottom-full mb-1.5 w-44 rounded-xl border border-line bg-surface p-1 shadow-pop z-30 space-y-0.5 animate-fadeIn"
                            >
                              <button
                                type="button"
                                onClick={() => handleSnooze(item.id, 'later')}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-ink hover:bg-surface-hover cursor-pointer"
                              >
                                Later today (5:00 PM)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSnooze(item.id, 'tomorrow')}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-ink hover:bg-surface-hover cursor-pointer"
                              >
                                Tomorrow (9:00 AM)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSnooze(item.id, 'next_week')}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-ink hover:bg-surface-hover cursor-pointer"
                              >
                                Next week (+7 days)
                              </button>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          leadingIcon={<Check className="w-3.5 h-3.5" />}
                          onClick={() => handleMarkDone(item.id)}
                        >
                          Mark done
                        </Button>
                      </>
                    )}

                    {item.status === 'done' && (
                      <Badge tone="success" className="gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </Badge>
                    )}

                    {/* Open lead link */}
                    <button
                      type="button"
                      onClick={() => {
                        const matched = leads.find(l => (l.company || '').toLowerCase().includes(item.company.toLowerCase())) || leads[0];
                        if (matched) onSelectLead(matched);
                      }}
                      className="px-3 py-1.5 text-brand font-semibold hover:underline cursor-pointer ml-auto inline-flex items-center gap-1"
                    >
                      <span>Open lead</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* Review & Send Follow-up Modal */}
      {reviewingFollowUp && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-draft-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-5 shadow-pop space-y-4">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div className="space-y-0.5">
                <h3 id="review-draft-title" className="text-base font-semibold text-ink">
                  Review & Send Follow-up
                </h3>
                <p className="text-xs text-ink-3">
                  To {reviewingFollowUp.contactName} ({reviewingFollowUp.company}) via {reviewingFollowUp.channel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewingFollowUp(null)}
                aria-label="Close modal"
                className="p-1 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-hover cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink">
                Draft Message:
              </label>
              <textarea
                rows={5}
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                className="w-full p-3 rounded-lg border border-line bg-surface-raised text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand resize-y leading-relaxed"
                placeholder="Write your follow-up message..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-subtle">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setReviewingFollowUp(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                leadingIcon={<Send className="w-3.5 h-3.5" />}
                onClick={handleSendDraft}
              >
                Send message
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range & Sort Calendar Popover Dropdown */}
      <DateRangeCalendarModal
        isOpen={isCalendarModalOpen}
        anchorId="leads-custom-date-btn"
        title="Decide Leads Date Window & Sorting"
        subtitle="Click on the calendar to pick start and end dates. Leads will be filtered and sorted on that basis."
        initialStartDate={customRange.startDate}
        initialEndDate={customRange.endDate}
        initialSortBasis={customRange.sortBasis}
        onClose={() => setIsCalendarModalOpen(false)}
        onApply={(selection) => {
          setCustomRange(selection);
          setIsCustomDateActive(true);
          setIsCalendarModalOpen(false);
        }}
      />
    </div>
  );
}
