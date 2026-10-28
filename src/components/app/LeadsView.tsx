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
  RotateCcw,
  MessageSquare,
  Instagram,
  Linkedin,
  Globe,
  Share2,
  Download,
  Edit2,
  MessageCircle
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
import { 
  PIPELINE_STAGES, 
  PipelineStage, 
  getLeadStage, 
  stageTone, 
  formatINR 
} from '../../lib/pipeline';
import { deriveTemperature } from '../../lib/leadIntel';
import { formatRelative } from '../../lib/time';
import { 
  useFollowUps, 
  useFollowUpCounts, 
  getNextFollowUp, 
  getBucket, 
  addFollowUp, 
  FollowUp 
} from '../../data/followUps';

export interface LeadsViewProps {
  activeSubCategory: SubCategory;
  leads: Lead[];
  selectedLead?: Lead | null;
  onNavigateSub: (sub: SubCategory) => void;
  onSelectLead: (lead: Lead) => void;
  onAddLeadModal: () => void;
  onUpdateLead?: (updated: Lead) => void;
  onDeleteLeads?: (ids: string[]) => void;
  onNavigateInbox?: (lead: Lead) => void;
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
  search?: string;
  stageFilter?: string;
  tempFilter?: string;
  ownerFilter?: string;
  channelFilter?: string;
  isCustomDateActive?: boolean;
  customRange?: DateRangeSelection;
  sortColumn?: SortColumn;
  sortDirection?: SortDirection;
}

type SortColumn = 'lead' | 'stage' | 'score' | 'owner' | 'value' | 'activity' | 'followup';
type SortDirection = 'asc' | 'desc';

function getDefaultDateRange(): DateRangeSelection {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const formatDateISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  return {
    startDate: formatDateISO(start),
    endDate: formatDateISO(end),
    sortBasis: 'newest'
  };
}

function renderChannelIcon(channel?: string) {
  const norm = (channel || '').toLowerCase();
  if (norm.includes('whatsapp')) return <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="WhatsApp" />;
  if (norm.includes('instagram')) return <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" title="Instagram" />;
  if (norm.includes('linkedin')) return <Linkedin className="w-3.5 h-3.5 text-blue-500 shrink-0" title="LinkedIn" />;
  if (norm.includes('website')) return <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" title="Website" />;
  return <Share2 className="w-3.5 h-3.5 text-ink-3 shrink-0" title="Referral" />;
}

function parseDealValue(valStr?: string): number {
  if (!valStr) return 0;
  const lMatch = valStr.match(/₹?([\d.]+)L/i);
  if (lMatch) return parseFloat(lMatch[1]) * 100000;
  const kMatch = valStr.match(/₹?([\d.]+)k/i);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const crMatch = valStr.match(/₹?([\d.]+)Cr/i);
  if (crMatch) return parseFloat(crMatch[1]) * 10000000;
  const numMatch = valStr.match(/[\$₹]?([\d,]+)/);
  if (numMatch) return parseFloat(numMatch[1].replace(/,/g, ''));
  return 0;
}

function formatStageValue(total: number): string {
  if (total >= 10000000) {
    return `₹${(total / 10000000).toFixed(1)}Cr`;
  }
  if (total >= 100000) {
    return `₹${(total / 100000).toFixed(1)}L`;
  }
  if (total >= 1000) {
    return `₹${(total / 1000).toFixed(0)}k`;
  }
  return total > 0 ? `₹${total}` : '₹0';
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
  onDeleteLeads,
  onNavigateInbox,
  onNotify,
  isFirstRun = false
}: LeadsViewProps) {
  // Skeleton loading for 400ms on first render
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

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

  // Follow-ups store integration
  const followUpTasks = useFollowUps();
  const followUpStoreCounts = useFollowUpCounts();

  // Saved Views: Built-in + Custom Views stored in localStorage
  const [savedViews, setSavedViews] = useState<CustomSavedView[]>(() => {
    try {
      const stored = localStorage.getItem('nexora_saved_lead_views_v2');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });
  const [activeViewChip, setActiveViewChip] = useState<string>('All');
  const [isAddingView, setIsAddingView] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingViewName, setEditingViewName] = useState('');

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
  const [customRange, setCustomRange] = useState<DateRangeSelection>(getDefaultDateRange);

  // Sorting: Default = Last activity, newest first
  const [sortColumn, setSortColumn] = useState<SortColumn>('activity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Selected Row IDs for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isStageMenuOpen, setIsStageMenuOpen] = useState(false);
  const [isConfirmingWon, setIsConfirmingWon] = useState(false);
  const [isChoosingLostReason, setIsChoosingLostReason] = useState(false);
  const [lostReasonChoice, setLostReasonChoice] = useState<string>('Budget');

  // Follow-ups local card state (for legacy board/tab view)
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

  // Pagination with page size selector
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Persist custom saved views
  const persistSavedViews = (updated: CustomSavedView[]) => {
    setSavedViews(updated);
    try {
      localStorage.setItem('nexora_saved_lead_views_v2', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Click outside to close popovers
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
        setIsStageMenuOpen(false);
        setIsConfirmingWon(false);
        setIsChoosingLostReason(false);
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

  // Combined Follow-up counts
  const followUpCounts = useMemo(() => {
    return {
      overdue: followUpStoreCounts.overdue,
      today: followUpStoreCounts.today,
      upcoming: followUpStoreCounts.upcoming,
      done: followUpStoreCounts.done,
      open: followUpStoreCounts.open,
      active: followUpStoreCounts.open
    };
  }, [followUpStoreCounts]);

  // Filtered and Sorted Leads
  const filteredLeads = useMemo(() => {
    let list = leads.filter(l => {
      const stage = getLeadStage(l);
      const temp = deriveTemperature(l.score, l.temperatureOverride);

      // Saved views filter
      if (activeViewChip === 'Hot' && temp !== 'HOT') {
        return false;
      }
      if (activeViewChip === 'Needs follow-up') {
        const nextTask = getNextFollowUp(l.id);
        if (!nextTask) return false;
        const bucket = getBucket(nextTask);
        if (bucket !== 'overdue' && bucket !== 'today') return false;
      }

      // Dropdown filters
      if (stageFilter !== 'All') {
        if (stage !== stageFilter) return false;
      }

      if (tempFilter !== 'All') {
        if (temp !== tempFilter) return false;
      }

      if (ownerFilter !== 'All') {
        if (ownerFilter === 'AI' && l.handlingMode !== 'AI') return false;
        if (ownerFilter === 'Human' && !l.assignee?.name) return false;
        if (ownerFilter === 'Unassigned' && l.assignee?.name) return false;
      }

      if (channelFilter !== 'All') {
        if (l.source !== channelFilter) return false;
      }

      // Custom date range: createdAt between start and end (inclusive)
      if (isCustomDateActive) {
        const leadDate = (l.createdAt || l.lastActivityAt || '').slice(0, 10);
        if (leadDate) {
          if (leadDate < customRange.startDate || leadDate > customRange.endDate) {
            return false;
          }
        }
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (l.name || '').toLowerCase().includes(q);
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
          const valA = a.amount ?? parseDealValue(a.value);
          const valB = b.amount ?? parseDealValue(b.value);
          return valB - valA;
        } else if (customRange.sortBasis === 'alphabetical') {
          return (a.company || a.name).localeCompare(b.company || b.name);
        } else if (customRange.sortBasis === 'oldest') {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tA - tB;
        } else {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        }
      });
    } else {
      // Column-based sorting
      list = [...list].sort((a, b) => {
        let cmp = 0;
        if (sortColumn === 'activity') {
          const timeA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          cmp = timeA - timeB;
        } else if (sortColumn === 'value') {
          const valA = a.amount ?? parseDealValue(a.value);
          const valB = b.amount ?? parseDealValue(b.value);
          cmp = valA - valB;
        } else if (sortColumn === 'lead') {
          cmp = (a.company || a.name).localeCompare(b.company || b.name);
        } else if (sortColumn === 'stage') {
          cmp = getLeadStage(a).localeCompare(getLeadStage(b));
        } else if (sortColumn === 'score') {
          cmp = a.score - b.score;
        } else if (sortColumn === 'owner') {
          const ownerA = a.assignee?.name || (a.handlingMode === 'AI' ? 'AI' : 'Unassigned');
          const ownerB = b.assignee?.name || (b.handlingMode === 'AI' ? 'AI' : 'Unassigned');
          cmp = ownerA.localeCompare(ownerB);
        } else if (sortColumn === 'followup') {
          const fA = getNextFollowUp(a.id);
          const fB = getNextFollowUp(b.id);
          const tA = fA ? new Date(fA.dueAt).getTime() : Infinity;
          const tB = fB ? new Date(fB.dueAt).getTime() : Infinity;
          cmp = tA - tB;
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
    sortDirection,
    followUpTasks
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));

  // Clamp page when filtered count shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Reset pagination when filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter, tempFilter, ownerFilter, channelFilter, activeViewChip, pageSize, isCustomDateActive]);

  // Clear selection when filters, view, sort, or page change
  useEffect(() => {
    setSelectedIds([]);
  }, [search, stageFilter, tempFilter, ownerFilter, channelFilter, activeViewChip, sortColumn, sortDirection, currentPage, pageSize, isCustomDateActive]);

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Selection handlers
  const allPageSelected = paginatedLeads.length > 0 && paginatedLeads.every(l => selectedIds.includes(l.id));
  const allMatchingSelected = filteredLeads.length > 0 && selectedIds.length === filteredLeads.length;

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedLeads.map(l => l.id));
    }
  };

  const handleSelectAllMatching = () => {
    setSelectedIds(filteredLeads.map(l => l.id));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const applyBulkStage = (stage: PipelineStage, lostReason?: string) => {
    if (onUpdateLead) {
      selectedIds.forEach(id => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
          onUpdateLead({
            ...lead,
            stage: stage as LeadStage,
            status: stage === 'Won' ? 'Won' : stage === 'Lost' ? 'Lost' : lead.status,
            lostReason: lostReason || lead.lostReason
          });
        }
      });
    }
    if (onNotify) {
      onNotify('Stage Updated', `Moved ${selectedIds.length} lead${selectedIds.length > 1 ? 's' : ''} to ${stage}.`);
    }
    setSelectedIds([]);
    setIsStageMenuOpen(false);
    setIsConfirmingWon(false);
    setIsChoosingLostReason(false);
  };

  const handleBulkAddFollowUp = () => {
    selectedIds.forEach(id => {
      const lead = leads.find(l => l.id === id);
      addFollowUp({
        leadId: id,
        title: `Follow up with ${lead?.company || lead?.name || 'prospect'}`,
        kind: 'task',
        owner: lead?.assignee?.name || 'You',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        source: 'manual'
      });
    });
    if (onNotify) {
      onNotify('Follow-ups Added', `Created follow-up tasks for ${selectedIds.length} lead${selectedIds.length > 1 ? 's' : ''}.`);
    }
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (onDeleteLeads) {
      onDeleteLeads(selectedIds);
    } else if (onNotify) {
      onNotify('Leads Deleted', `Removed ${selectedIds.length} selected leads.`);
    }
    setSelectedIds([]);
    setIsConfirmingDelete(false);
  };

  // Custom saved views operations
  const handleSaveCustomView = () => {
    const trimmed = newViewName.trim();
    if (!trimmed) return;
    const newView: CustomSavedView = {
      id: `view-${Date.now()}`,
      name: trimmed,
      search,
      stageFilter,
      tempFilter,
      ownerFilter,
      channelFilter,
      isCustomDateActive,
      customRange,
      sortColumn,
      sortDirection
    };
    const updated = [...savedViews, newView];
    persistSavedViews(updated);
    setActiveViewChip(trimmed);
    setNewViewName('');
    setIsAddingView(false);
    if (onNotify) onNotify('View Saved', `Created custom view "${trimmed}".`);
  };

  const handleDeleteSavedView = (id: string, name: string) => {
    const updated = savedViews.filter(v => v.id !== id);
    persistSavedViews(updated);
    if (activeViewChip === name) {
      setActiveViewChip('All');
      handleClearFilters();
    }
    if (onNotify) onNotify('View Removed', `Deleted custom view "${name}".`);
  };

  const handleRenameSavedView = (id: string) => {
    const trimmed = editingViewName.trim();
    if (!trimmed) {
      setEditingViewId(null);
      return;
    }
    const updated = savedViews.map(v => v.id === id ? { ...v, name: trimmed } : v);
    persistSavedViews(updated);
    setActiveViewChip(trimmed);
    setEditingViewId(null);
    setEditingViewName('');
    if (onNotify) onNotify('View Renamed', `Renamed view to "${trimmed}".`);
  };

  const handleSelectView = (tabId: string) => {
    setActiveViewChip(tabId);
    if (tabId === 'All') {
      handleClearFilters();
      return;
    }
    if (tabId === 'Hot') {
      setTempFilter('HOT');
      setStageFilter('All');
      setOwnerFilter('All');
      setChannelFilter('All');
      setSearch('');
      setIsCustomDateActive(false);
      return;
    }
    if (tabId === 'Needs follow-up') {
      setTempFilter('All');
      setStageFilter('All');
      setOwnerFilter('All');
      setChannelFilter('All');
      setSearch('');
      setIsCustomDateActive(false);
      return;
    }

    // Custom view selection
    const custom = savedViews.find(v => v.name === tabId || v.id === tabId);
    if (custom) {
      setSearch(custom.search || '');
      setStageFilter(custom.stageFilter || 'All');
      setTempFilter(custom.tempFilter || 'All');
      setOwnerFilter(custom.ownerFilter || 'All');
      setChannelFilter(custom.channelFilter || 'All');
      setIsCustomDateActive(Boolean(custom.isCustomDateActive));
      if (custom.customRange) setCustomRange(custom.customRange);
      if (custom.sortColumn) setSortColumn(custom.sortColumn);
      if (custom.sortDirection) setSortDirection(custom.sortDirection);
    }
  };

  const handleClearFilters = () => {
    setStageFilter('All');
    setTempFilter('All');
    setOwnerFilter('All');
    setChannelFilter('All');
    setSearch('');
    setIsCustomDateActive(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const escapeCSV = (val?: string | number | null) => {
      if (val === undefined || val === null) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const headers = [
      '"Name"',
      '"Company"',
      '"Email"',
      '"Stage"',
      '"Temperature"',
      '"Value"',
      '"Owner"',
      '"Next Follow-up"',
      '"Last Activity"'
    ];

    const rows = filteredLeads.map(l => {
      const nextTask = getNextFollowUp(l.id);
      const nextTaskStr = nextTask ? `${nextTask.title} (${nextTask.dueAt.slice(0, 10)})` : 'None';
      const ownerStr = l.assignee?.name || (l.handlingMode === 'AI' ? 'AI' : 'Unassigned');
      const valStr = l.amount ? formatINR(l.amount) : (l.value || '—');
      const actStr = formatRelative(l.lastActivityAt || l.createdAt);
      const tempStr = deriveTemperature(l.score, l.temperatureOverride);
      const stageStr = getLeadStage(l);

      return [
        escapeCSV(l.name),
        escapeCSV(l.company),
        escapeCSV(l.email),
        escapeCSV(stageStr),
        escapeCSV(tempStr),
        escapeCSV(valStr),
        escapeCSV(ownerStr),
        escapeCSV(nextTaskStr),
        escapeCSV(actStr)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onNotify) onNotify('CSV Exported', `Exported ${filteredLeads.length} leads.`);
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
      {/* ========================================================
          1. PAGE HEADER
          PageHeader with dynamic title/subtitle and primary action based on topTab
         ======================================================== */}
      <PageHeader
        title={topTab === 'leads' ? "Leads" : "Follow-ups"}
        subtitle={topTab === 'leads' ? "Every prospect across your channels" : "Tasks that keep deals moving"}
        actions={
          <div className="flex items-center gap-3">
            <SegmentedControl<'leads' | 'follow-ups'>
              options={[
                { id: 'leads', label: 'Leads', count: leads.length },
                { id: 'follow-ups', label: 'Follow-ups', count: followUpCounts.open }
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
              onClick={topTab === 'leads' ? onAddLeadModal : undefined}
              disabled={topTab === 'follow-ups'}
            >
              {topTab === 'leads' ? "Add lead" : "Add follow-up"}
            </Button>
          </div>
        }
      />

      {/* Date Range Modal */}
      <DateRangeCalendarModal
        isOpen={isCalendarModalOpen}
        initialStartDate={customRange.startDate}
        initialEndDate={customRange.endDate}
        initialSortBasis={customRange.sortBasis}
        onClose={() => setIsCalendarModalOpen(false)}
        onApply={(sel) => {
          setCustomRange(sel);
          setIsCustomDateActive(true);
          setIsCalendarModalOpen(false);
          if (onNotify) {
            onNotify('Date Filter Applied', `${sel.startDate} to ${sel.endDate}`);
          }
        }}
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
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none text-xs">
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
                  count: leads.filter(l => deriveTemperature(l.score, l.temperatureOverride) === 'HOT').length 
                },
                { 
                  id: 'Needs follow-up', 
                  label: (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-warn" />
                      Needs follow-up
                    </span>
                  ), 
                  count: leads.filter(l => {
                    const task = getNextFollowUp(l.id);
                    if (!task) return false;
                    const bucket = getBucket(task);
                    return bucket === 'overdue' || bucket === 'today';
                  }).length 
                }
              ].map(tab => {
                const isActive = activeViewChip === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectView(tab.id)}
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

              {/* Custom Saved Views */}
              {savedViews.map(sv => {
                const isActive = activeViewChip === sv.name;
                const count = leads.filter(l => (l.company || l.name).toLowerCase().includes(sv.name.toLowerCase())).length;
                const isEditing = editingViewId === sv.id;

                if (isEditing) {
                  return (
                    <div key={sv.id} className="flex items-center gap-1 pb-1.5">
                      <input
                        type="text"
                        value={editingViewName}
                        onChange={(e) => setEditingViewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSavedView(sv.id);
                          if (e.key === 'Escape') setEditingViewId(null);
                        }}
                        autoFocus
                        className="text-xs px-2 py-0.5 rounded border border-line bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-brand w-24"
                      />
                      <button
                        type="button"
                        onClick={() => handleRenameSavedView(sv.id)}
                        className="p-1 text-brand hover:text-brand-strong cursor-pointer"
                        title="Save rename"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingViewId(null)}
                        className="p-1 text-ink-3 hover:text-ink cursor-pointer"
                        title="Cancel rename"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={sv.id}
                    className={`group/view flex items-center gap-1 pb-2.5 pt-1 border-b-2 transition-colors ${
                      isActive ? 'border-brand text-brand font-semibold' : 'border-transparent text-ink-3 hover:text-ink'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectView(sv.name)}
                      className="text-xs font-medium cursor-pointer flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none"
                    >
                      <span>{sv.name}</span>
                      <span className={`text-xs tabular-nums px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive ? 'bg-brand-soft text-brand' : 'bg-surface-raised text-ink-3'
                      }`}>
                        {count}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingViewId(sv.id);
                        setEditingViewName(sv.name);
                      }}
                      className="opacity-0 group-hover/view:opacity-100 p-0.5 hover:text-ink cursor-pointer text-ink-3 transition-opacity"
                      title="Rename view"
                      aria-label={`Rename ${sv.name} view`}
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedView(sv.id, sv.name)}
                      className="opacity-0 group-hover/view:opacity-100 p-0.5 hover:text-danger cursor-pointer text-ink-3 transition-opacity"
                      title="Delete view"
                      aria-label={`Delete ${sv.name} view`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
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

          {/* Row 3: Filter Bar (Search, Filter Popover, Custom Date, Active Chips, Export CSV) */}
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

                      {/* Stage Select using PIPELINE_STAGES */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-ink-2">Stage</label>
                        <select
                          value={stageFilter}
                          onChange={(e) => setStageFilter(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-line bg-surface-raised text-ink focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                        >
                          <option value="All">All Stages</option>
                          {PIPELINE_STAGES.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
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

                      {/* Owner Select matching requirement 5 */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-ink-2">Owner</label>
                        <select
                          value={ownerFilter}
                          onChange={(e) => setOwnerFilter(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-line bg-surface-raised text-ink focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                        >
                          <option value="All">All Owners</option>
                          <option value="AI">AI Handled</option>
                          <option value="Human">Assigned</option>
                          <option value="Unassigned">Unassigned</option>
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
                          Done
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

              {/* Right side: Export CSV button & leads indicator */}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleExportCSV}
                  title="Export filtered leads to CSV"
                >
                  Export CSV
                </Button>
                <div className="text-xs text-ink-3 tabular-nums">
                  {filteredLeads.length} lead{filteredLeads.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            {/* Active Filter Chips: Sentence-case */}
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
                    <span>Temperature: {tempFilter === 'HOT' ? 'Hot' : tempFilter === 'WARM' ? 'Warm' : 'Cold'}</span>
                    <button type="button" onClick={() => setTempFilter('All')} className="hover:text-danger cursor-pointer">×</button>
                  </Badge>
                )}
                {ownerFilter !== 'All' && (
                  <Badge tone="brand" className="gap-1.5">
                    <span>Owner: {ownerFilter === 'AI' ? 'AI' : ownerFilter === 'Human' ? 'Assigned' : 'Unassigned'}</span>
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
                    <span>Date: {customRange.startDate} → {customRange.endDate}</span>
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
                    Delete {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''}? This can be undone.
                  </span>
                  <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                    Confirm Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsConfirmingDelete(false)}>
                    Cancel
                  </Button>
                </div>
              ) : isConfirmingWon ? (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <span className="text-xs font-medium text-ink">
                    Mark {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} as Won?
                  </span>
                  <Button size="sm" variant="primary" onClick={() => applyBulkStage('Won')}>
                    Confirm Won
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsConfirmingWon(false)}>
                    Cancel
                  </Button>
                </div>
              ) : isChoosingLostReason ? (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <span className="text-xs font-medium text-ink">Reason:</span>
                  <select
                    value={lostReasonChoice}
                    onChange={(e) => setLostReasonChoice(e.target.value)}
                    className="text-xs px-2 py-1 rounded border border-line bg-surface text-ink"
                  >
                    <option value="Budget">Budget</option>
                    <option value="Timing">Timing</option>
                    <option value="Chose competitor">Chose competitor</option>
                    <option value="No response">No response</option>
                    <option value="Not a fit">Not a fit</option>
                  </select>
                  <Button size="sm" variant="danger" onClick={() => applyBulkStage('Lost', lostReasonChoice)}>
                    Mark Lost
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsChoosingLostReason(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 relative">
                  {/* Stage Menu Trigger */}
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setIsStageMenuOpen(prev => !prev)}
                    >
                      Change stage ▾
                    </Button>
                    {isStageMenuOpen && (
                      <div className="absolute left-0 bottom-full mb-1.5 w-36 rounded-lg border border-line bg-surface shadow-pop p-1 z-30 space-y-0.5 animate-fadeIn">
                        {PIPELINE_STAGES.map(stage => (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => {
                              if (stage === 'Won') {
                                setIsConfirmingWon(true);
                                setIsStageMenuOpen(false);
                              } else if (stage === 'Lost') {
                                setIsChoosingLostReason(true);
                                setIsStageMenuOpen(false);
                              } else {
                                applyBulkStage(stage);
                              }
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-xs rounded hover:bg-surface-hover text-ink cursor-pointer font-medium"
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleBulkAddFollowUp}
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

          {/* Select all matching banner when all page rows are selected */}
          {allPageSelected && selectedIds.length < filteredLeads.length && (
            <div className="p-2.5 rounded-lg bg-surface-raised border border-line text-xs flex items-center justify-between text-ink-2 animate-fadeIn">
              <span>All {paginatedLeads.length} leads on this page are selected.</span>
              <button
                type="button"
                onClick={handleSelectAllMatching}
                className="text-brand font-semibold hover:underline cursor-pointer ml-2"
              >
                Select all {filteredLeads.length} matching leads
              </button>
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
                          onClick={toggleSelectAllPage}
                          aria-label={allPageSelected ? "Deselect all leads on page" : "Select all leads on page"}
                          className="inline-flex items-center justify-center cursor-pointer text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          {allPageSelected ? (
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

                      {/* Score & Temperature */}
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

                      {/* Next follow-up column */}
                      <th scope="col" aria-sort={getAriaSort('followup')} className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleSort('followup')}
                          className="inline-flex items-center gap-1.5 hover:text-ink cursor-pointer font-semibold uppercase text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          <span>Next follow-up</span>
                          {renderSortIcon('followup')}
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

                      {/* Action slot */}
                      <th scope="col" className="p-3.5 text-right w-44">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line-subtle">
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={`skel-${idx}`} className="animate-pulse">
                          <td className="p-3.5 text-center"><div className="w-4 h-4 bg-surface-raised rounded mx-auto" /></td>
                          <td className="p-3.5"><div className="h-4 w-32 bg-surface-raised rounded mb-1" /><div className="h-3 w-20 bg-surface-raised rounded" /></td>
                          <td className="p-3.5"><div className="h-5 w-16 bg-surface-raised rounded-full" /></td>
                          <td className="p-3.5"><div className="h-5 w-16 bg-surface-raised rounded" /></td>
                          <td className="p-3.5"><div className="h-5 w-24 bg-surface-raised rounded-full" /></td>
                          <td className="p-3.5 text-right"><div className="h-4 w-16 bg-surface-raised rounded ml-auto" /></td>
                          <td className="p-3.5"><div className="h-4 w-20 bg-surface-raised rounded" /></td>
                          <td className="p-3.5"><div className="h-4 w-24 bg-surface-raised rounded" /></td>
                          <td className="p-3.5 text-right"><div className="h-4 w-12 bg-surface-raised rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : paginatedLeads.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-ink-3">
                          {leads.length === 0 ? (
                            <EmptyState
                              icon={<Users className="w-6 h-6 text-brand" />}
                              title="No leads yet"
                              description="Create your first lead to start tracking deals across your channels."
                              action={
                                <Button variant="primary" size="sm" onClick={onAddLeadModal}>
                                  Add lead
                                </Button>
                              }
                            />
                          ) : (
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
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedLeads.map(lead => {
                        const isSelected = selectedIds.includes(lead.id);
                        const leadStage = getLeadStage(lead);
                        const leadTemp = deriveTemperature(lead.score, lead.temperatureOverride);
                        const tone = stageTone(leadStage);

                        const hasSeparateContactName = lead.name && lead.name.trim().toLowerCase() !== (lead.company || '').trim().toLowerCase();
                        const nextTask = getNextFollowUp(lead.id);

                        return (
                          <tr
                            key={lead.id}
                            tabIndex={0}
                            role="row"
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
                                aria-label={`Select ${lead.name || lead.company}`}
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

                            {/* Lead: Avatar + Company, Name below (No contact name fallback) */}
                            <td className="p-3.5 max-w-[220px]">
                              <div className="flex items-center gap-3">
                                <Avatar name={lead.company || lead.name} size="md" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-ink truncate text-sm">
                                    {lead.company || lead.name}
                                  </p>
                                  {hasSeparateContactName ? (
                                    <p className="text-xs text-ink-3 truncate">
                                      {lead.name}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-ink-3 italic">
                                      No contact name
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Stage: Badge */}
                            <td className="p-3.5">
                              <Badge tone={tone}>
                                {leadStage}
                              </Badge>
                            </td>

                            {/* Score & Temperature */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  tone={leadTemp === 'HOT' ? 'hot' : leadTemp === 'WARM' ? 'warning' : 'neutral'}
                                  className="font-mono font-bold"
                                >
                                  {lead.score}
                                </Badge>
                                {leadTemp === 'HOT' && (
                                  <span className="inline-flex items-center gap-1 text-hot font-medium text-xs">
                                    <Flame className="w-3.5 h-3.5" />
                                    <span>Hot</span>
                                  </span>
                                )}
                                {leadTemp === 'WARM' && (
                                  <span className="inline-flex items-center gap-1 text-warn font-medium text-xs">
                                    <span>Warm</span>
                                  </span>
                                )}
                                {leadTemp === 'COLD' && (
                                  <span className="text-ink-3 text-xs">
                                    Cold
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Next follow-up */}
                            <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                              {nextTask ? (
                                (() => {
                                  const bucket = getBucket(nextTask);
                                  const chipTone = bucket === 'overdue' ? 'danger' : bucket === 'today' ? 'warning' : 'neutral';
                                  const chipLabel = bucket === 'overdue' 
                                    ? `Overdue · ${formatRelative(nextTask.dueAt)}`
                                    : bucket === 'today'
                                    ? `Today · ${new Date(nextTask.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : formatRelative(nextTask.dueAt);
                                  return (
                                    <span title={nextTask.title}>
                                      <Badge tone={chipTone}>
                                        {chipLabel}
                                      </Badge>
                                    </span>
                                  );
                                })()
                              ) : (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-ink-3">None</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addFollowUp({
                                        leadId: lead.id,
                                        title: `Follow up with ${lead.name || lead.company}`,
                                        kind: 'task',
                                        owner: lead.assignee?.name || 'You',
                                        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                                        source: 'manual'
                                      });
                                      if (onNotify) onNotify('Follow-up Added', `Scheduled follow-up for ${lead.company || lead.name}.`);
                                    }}
                                    className="text-brand hover:underline font-medium cursor-pointer"
                                  >
                                    + Add
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Deal Value: Right-aligned formatINR */}
                            <td className="p-3.5 text-right font-medium text-ink tabular-nums">
                              {lead.amount ? formatINR(lead.amount) : (lead.value || '—')}
                            </td>

                            {/* Owner: Assignee name + Avatar or Unassigned, Bot badge when handlingMode === 'AI' */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {lead.assignee?.name ? (
                                  <>
                                    <Avatar name={lead.assignee.name} size="sm" />
                                    <span className="text-xs font-medium text-ink truncate">
                                      {lead.assignee.name}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs text-ink-3 italic">
                                    Unassigned
                                  </span>
                                )}
                                {lead.handlingMode === 'AI' && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-surface-raised border border-line-subtle text-ink-3 text-[10px] font-semibold" title="AI handling active">
                                    <Bot className="w-3 h-3 text-brand" />
                                    <span>AI</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Last Activity: channel icon + relative time */}
                            <td className="p-3.5 text-xs text-ink-2">
                              <div className="flex items-center gap-1.5">
                                {renderChannelIcon(lead.source)}
                                <span>{formatRelative(lead.lastActivityAt || lead.createdAt)}</span>
                              </div>
                            </td>

                            {/* Actions on hover & focus: Reply, Follow-up, Open */}
                            <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onNavigateInbox) onNavigateInbox(lead);
                                    else onNavigateSub('inbox');
                                  }}
                                  className="text-xs text-ink-2 hover:text-brand font-medium inline-flex items-center gap-1 cursor-pointer focus-visible:opacity-100 focus-visible:outline-none"
                                  title="Reply in Inbox"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>Reply</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    addFollowUp({
                                      leadId: lead.id,
                                      title: `Follow up with ${lead.name || lead.company}`,
                                      kind: 'task',
                                      owner: lead.assignee?.name || 'You',
                                      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                                      source: 'manual'
                                    });
                                    if (onNotify) onNotify('Follow-up Added', `Scheduled follow-up for ${lead.company || lead.name}.`);
                                  }}
                                  className="text-xs text-ink-2 hover:text-brand font-medium inline-flex items-center gap-1 cursor-pointer focus-visible:opacity-100 focus-visible:outline-none"
                                  title="Add follow-up task"
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>Follow-up</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onSelectLead(lead)}
                                  className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer focus-visible:opacity-100 focus-visible:outline-none"
                                >
                                  <span>Open</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination controls with rows per page selector */}
              <div className="p-3.5 border-t border-line-subtle bg-surface-raised flex flex-wrap items-center justify-between gap-3 text-xs text-ink-3">
                <div className="flex items-center gap-3">
                  <span>
                    Showing {filteredLeads.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-ink-3">Rows:</span>
                    <select
                      value={pageSize}
                      aria-label="Rows per page"
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-0.5 text-xs rounded border border-line bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                
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
