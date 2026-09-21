import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Send, 
  SlidersHorizontal, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  LayoutGrid,
  List,
  Calendar,
  Phone,
  Paperclip,
  MessageSquare,
  Activity
} from 'lucide-react';
import { Lead, SubCategory, LeadTag } from '../../types';
import NewCustomersChart from './leads/NewCustomersChart';
import ActivityHeatmap from './leads/ActivityHeatmap';
import LeadSummaryStats from './leads/LeadSummaryStats';
import LeadsKanbanBoard from './leads/LeadsKanbanBoard';
import LeadDetailModal from './leads/LeadDetailModal';
import Pagination from './Pagination';

interface LeadsViewProps {
  activeSubCategory: SubCategory;
  leads: Lead[];
  onNavigateSub: (sub: SubCategory) => void;
  onSelectLead: (lead: Lead) => void;
  onAddLeadModal: () => void;
  onUpdateLead?: (updated: Lead) => void;
}

export default function LeadsView({
  activeSubCategory,
  leads,
  onNavigateSub,
  onSelectLead,
  onAddLeadModal,
  onUpdateLead
}: LeadsViewProps) {
  const currentTab = 
    activeSubCategory === 'lead-automation' 
      ? 'lead-automation' 
      : activeSubCategory === 'generated-responses' 
      ? 'generated-responses' 
      : 'live-leads';

  // Toggle between Kanban Board (matching screenshot) and Data Table
  const [viewLayout, setViewLayout] = useState<'board' | 'table'>('board');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [inspectingLead, setInspectingLead] = useState<Lead | null>(null);

  // Hidden activity graph by default; shown only if requested by the user
  const [showActivityGraph, setShowActivityGraph] = useState<boolean>(false);

  // Pagination states
  const [tablePage, setTablePage] = useState<number>(1);
  const [tablePageSize, setTablePageSize] = useState<number>(5);
  const [automationPage, setAutomationPage] = useState<number>(1);
  const [responsePage, setResponsePage] = useState<number>(1);

  // Reset table page whenever search or tag filter changes
  useEffect(() => {
    setTablePage(1);
  }, [search, tagFilter]);

  const handleUpdate = (updated: Lead) => {
    if (onUpdateLead) {
      onUpdateLead(updated);
    }
    if (inspectingLead && inspectingLead.id === updated.id) {
      setInspectingLead(updated);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        l.name.toLowerCase().includes(search.toLowerCase()) || 
        l.company.toLowerCase().includes(search.toLowerCase()) ||
        (l.description && l.description.toLowerCase().includes(search.toLowerCase())) ||
        (l.assignee && l.assignee.name.toLowerCase().includes(search.toLowerCase())) ||
        l.source.toLowerCase().includes(search.toLowerCase());
      
      const matchesTag = 
        tagFilter === 'All' || 
        l.tag === tagFilter || 
        (tagFilter === 'Priority' && l.isPriority);

      return matchesSearch && matchesTag;
    });
  }, [leads, search, tagFilter]);

  const paginatedLeads = useMemo(() => {
    const start = (tablePage - 1) * tablePageSize;
    return filteredLeads.slice(start, start + tablePageSize);
  }, [filteredLeads, tablePage, tablePageSize]);

  // Lead Automation Rules
  const automationRules = useMemo(() => [
    { name: 'VIP Studio Routing', rule: 'If budget > $15,000, immediately flag as High Priority & notify director via Telegram.', status: 'Active' },
    { name: 'Instant Proposal Dispatch', rule: 'When lead requests API credentials, automatically generate cryptographic sandbox key.', status: 'Active' },
    { name: 'Stale Follow-up Protocol', rule: 'If prospect is in "Contacted" state for > 72 hours, prepare quiet re-engagement note.', status: 'Active' },
    { name: 'Spam & Scraping Neutralizer', rule: 'Filter low-reputation disposable domains and redirect to lightweight verification.', status: 'Active' },
    { name: 'Returning Client Affinity Cadence', rule: 'Automatically assign original account executive and pull past project monographs.', status: 'Active' },
    { name: 'Cross-Border Timezone Alignment', rule: 'Schedule follow-up emails strictly within prospect target working hours (9AM–11AM local).', status: 'Active' }
  ], []);

  const paginatedRules = useMemo(() => {
    const start = (automationPage - 1) * 3;
    return automationRules.slice(start, start + 3);
  }, [automationRules, automationPage]);

  // Generated Responses Letters
  const followUpLetters = useMemo(() => [
    {
      recipient: 'Aster Labs (Mateo Petty)',
      subject: 'Inquiry response regarding healthcare CRM and intake automation',
      snippet: 'Mateo, we evaluated Aster Labs’ patient pipeline workflow. Nexora provides high-security encryption and automated qualifier scoring with zero human delay...',
      ready: true
    },
    {
      recipient: 'BrightPath Legal (Lawrence Patterson)',
      subject: 'Intake automation architecture proposal',
      snippet: 'Lawrence, regarding BrightPath Legal’s client intake overhaul: we can synchronize your retainer document verification and client portal design within 48 hours...',
      ready: true
    },
    {
      recipient: 'PulseWorks (Aysha Hayes)',
      subject: 'Membership booking & platform acceleration tier',
      snippet: 'Aysha, our team is excited to support PulseWorks. The custom booking API and executive member retainer configuration is ready for sandbox validation...',
      ready: true
    },
    {
      recipient: 'Vanguard Atelier (Julian Montgomery)',
      subject: 'Kyoto studio expansion & asset syndication memorandum',
      snippet: 'Julian, we reviewed the architectural rendering scope for Kyoto. Our asset engine can pre-render the 12 social formats and typography system asynchronously...',
      ready: true
    },
    {
      recipient: 'Nordic Space Design (Elena Rostova)',
      subject: 'Quiet computing design toolchain migration blueprint',
      snippet: 'Elena, thank you for sharing your studio manifesto. We have prepared an executive comparison of distraction latency and toolchain footprint...',
      ready: true
    }
  ], []);

  const paginatedLetters = useMemo(() => {
    const start = (responsePage - 1) * 2;
    return followUpLetters.slice(start, start + 2);
  }, [followUpLetters, responsePage]);

  return (
    <div className="space-y-8 py-4 animate-fadeIn text-[#E8E9D8]">
      {/* 1. Module Header */}
      <section className="border-b border-[rgba(169,191,165,0.2)] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest-plus text-[#A9BFA5] font-mono block mb-2">
            CLIENT CAPTURE & RELATIONSHIPS // WORKSPACE
          </span>
          <h1 className="serif text-4xl sm:text-5xl font-light text-[#E8E9D8] tracking-tight">
            Leads
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#A9BFA5]/80 font-light leading-relaxed max-w-xl">
            Track high-intent prospect inquiries, analyze conversion heatmaps, and orchestrate pipeline velocity.
          </p>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center space-x-6 text-xs uppercase tracking-widest border-b border-[rgba(169,191,165,0.2)] pb-1 font-mono">
            <button
              type="button"
              onClick={() => onNavigateSub('live-leads')}
              className={`pb-1 border-b transition-colors cursor-pointer ${
                currentTab === 'live-leads' 
                  ? 'text-[#E8E9D8] border-[#E8E9D8] font-medium' 
                  : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
              }`}
            >
              Pipeline ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => onNavigateSub('lead-automation')}
              className={`pb-1 border-b transition-colors cursor-pointer ${
                currentTab === 'lead-automation' 
                  ? 'text-[#E8E9D8] border-[#E8E9D8] font-medium' 
                  : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
              }`}
            >
              Lead Automation
            </button>
            <button
              type="button"
              onClick={() => onNavigateSub('generated-responses')}
              className={`pb-1 border-b transition-colors cursor-pointer ${
                currentTab === 'generated-responses' 
                  ? 'text-[#E8E9D8] border-[#E8E9D8] font-medium' 
                  : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
              }`}
            >
              Generated Responses
            </button>
          </div>

          <button
            type="button"
            onClick={onAddLeadModal}
            className="bg-[#E8E9D8] text-[#071C1A] px-5 py-2 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer shrink-0"
          >
            + Add Lead
          </button>
        </div>
      </section>

      {/* 2. Primary Tab: Live Leads & Pipeline (matching screenshot layout) */}
      {currentTab === 'live-leads' && (
        <div className="space-y-8">
          {/* Top Analytics & Activity Row:
              Left: New customers clean line graph (expanded when activity graph is hidden)
              Center: Activity matrix (hidden by default, shown only when requested by user)
              Right: Tasks in progress metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* New Customers Line Chart */}
            <div className={`${showActivityGraph ? 'lg:col-span-5' : 'lg:col-span-8 xl:col-span-9'} min-h-[260px] transition-all duration-300`}>
              <NewCustomersChart
                isActivityVisible={showActivityGraph}
                onToggleActivity={() => setShowActivityGraph(prev => !prev)}
              />
            </div>

            {/* Activity Heatmap Grid (Hidden by default; shown only when requested) */}
            {showActivityGraph && (
              <div className="lg:col-span-4 min-h-[260px] transition-all duration-300">
                <ActivityHeatmap onClose={() => setShowActivityGraph(false)} />
              </div>
            )}

            {/* Tasks in progress Summary */}
            <div className={`${showActivityGraph ? 'lg:col-span-3' : 'lg:col-span-4 xl:col-span-3'} min-h-[260px] transition-all duration-300`}>
              <LeadSummaryStats
                tasksInProgress={76}
                tasksChange="+ 6%"
              />
            </div>
          </div>

          {/* Sub-toolbar: Search, Tag Filters, Layout Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-[rgba(169,191,165,0.15)] text-xs">
            {/* Tag Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 font-mono text-[11px]">
              <span className="text-[#A9BFA5]/60 uppercase text-[10px] tracking-widest mr-1">
                Filter:
              </span>
              {['All', 'New lead', 'Returning', 'Priority', 'Follow-up'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagFilter(tag)}
                  className={`px-2.5 py-1 rounded-[2px] border transition-colors cursor-pointer whitespace-nowrap ${
                    tagFilter === tag
                      ? 'bg-[#E8E9D8] text-[#071C1A] border-[#E8E9D8] font-semibold'
                      : 'bg-[#071C1A] text-[#A9BFA5] border-[rgba(169,191,165,0.2)] hover:border-[#A9BFA5]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Search and Layout Toggle */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search company, manager..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-[#071C1A] border border-[rgba(169,191,165,0.2)] text-[#E8E9D8] text-xs px-3 py-1.5 pl-8 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] placeholder-[#A9BFA5]/40 font-light w-48 sm:w-64"
                />
                <Search className="w-3.5 h-3.5 text-[#A9BFA5]/50 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* View Switcher: Board vs Table */}
              <div className="flex items-center border border-[rgba(169,191,165,0.2)] rounded-[2px] bg-[#071C1A] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewLayout('board')}
                  title="Kanban Board View"
                  className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
                    viewLayout === 'board'
                      ? 'bg-[#0D2D2A] text-white'
                      : 'text-[#A9BFA5]/60 hover:text-[#A9BFA5]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('table')}
                  title="Table List View"
                  className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
                    viewLayout === 'table'
                      ? 'bg-[#0D2D2A] text-white'
                      : 'text-[#A9BFA5]/60 hover:text-[#A9BFA5]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Kanban Board Layout (Matching screenshot: Contacted, Negotiation, Offer sent, Deal closed) */}
          {viewLayout === 'board' ? (
            <LeadsKanbanBoard
              leads={filteredLeads}
              onSelectLead={(l) => {
                setInspectingLead(l);
                onSelectLead(l);
              }}
              onUpdateLead={handleUpdate}
              onAddLeadModal={onAddLeadModal}
            />
          ) : (
            /* Table Layout View */
            <div className="border border-[rgba(169,191,165,0.2)] divide-y divide-[rgba(169,191,165,0.15)] bg-[#071C1A] overflow-x-auto">
              <div className="min-w-[800px] grid grid-cols-12 px-6 py-3 text-[10px] uppercase tracking-widest text-[#A9BFA5]/60 font-mono bg-[#061816]">
                <div className="col-span-4">Lead / Company</div>
                <div className="col-span-2">Stage</div>
                <div className="col-span-2">Tag</div>
                <div className="col-span-2">Assignee</div>
                <div className="col-span-2 text-right">Value</div>
              </div>

              {paginatedLeads.map(lead => (
                <div 
                  key={lead.id}
                  onClick={() => {
                    setInspectingLead(lead);
                    onSelectLead(lead);
                  }}
                  className="min-w-[800px] grid grid-cols-12 px-6 py-4 items-center hover:bg-[#0D2D2A]/30 transition-colors cursor-pointer group"
                >
                  <div className="col-span-4">
                    <p className="text-xs sm:text-sm font-medium text-[#E8E9D8] group-hover:text-white transition-colors">
                      {lead.company || lead.name}
                    </p>
                    <p className="text-[11px] text-[#A9BFA5]/70 font-light truncate">
                      {lead.description || lead.email}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 border border-[rgba(169,191,165,0.25)] text-[#E8E9D8]">
                      {lead.stage || lead.status}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className={`text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 border ${
                      lead.tag === 'Priority' ? 'text-white bg-[#061816] border-[#A9BFA5]' :
                      lead.tag === 'Returning' ? 'text-sky-300 bg-sky-950/40 border-sky-500/30' :
                      lead.tag === 'Follow-up' ? 'text-amber-300 bg-amber-950/40 border-amber-500/30' :
                      'text-[#A9BFA5] bg-[#A9BFA5]/15 border-[#A9BFA5]/30'
                    }`}>
                      {lead.tag || 'New lead'}
                    </span>
                  </div>

                  <div className="col-span-2 text-xs text-[#A9BFA5] font-light">
                    {lead.assignee?.name || 'Mateo Petty'}
                  </div>

                  <div className="col-span-2 text-right font-mono text-xs text-white">
                    {lead.value}
                  </div>
                </div>
              ))}

              {/* Table Pagination Footer */}
              {filteredLeads.length > 0 && (
                <Pagination
                  currentPage={tablePage}
                  totalItems={filteredLeads.length}
                  pageSize={tablePageSize}
                  onPageChange={setTablePage}
                  onPageSizeChange={setTablePageSize}
                  pageSizeOptions={[5, 10, 20]}
                  itemName="leads"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Lead Automation Tab */}
      {currentTab === 'lead-automation' && (
        <div className="space-y-6">
          <div className="border border-[rgba(169,191,165,0.2)] p-6 bg-[#071C1A]">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
              <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8]">
                Automated Lead Routing & Triggers
              </h3>
              <span className="text-[11px] font-mono text-[#A9BFA5]/70">
                Active Rules: {automationRules.length}
              </span>
            </div>
            <p className="text-xs text-[#A9BFA5]/80 font-light mb-6">
              Define operational thresholds to immediately qualify incoming studio inquiries without human delay.
            </p>

            <div className="divide-y divide-[rgba(169,191,165,0.15)]">
              {paginatedRules.map((auto, i) => (
                <div key={i} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#E8E9D8]">{auto.name}</h4>
                    <p className="text-[11px] text-[#A9BFA5]/75 font-light mt-0.5">{auto.rule}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 bg-emerald-950/20">
                    {auto.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination for Rules */}
            <div className="mt-4 -mx-6 -mb-6">
              <Pagination
                currentPage={automationPage}
                totalItems={automationRules.length}
                pageSize={3}
                onPageChange={setAutomationPage}
                showPageSize={false}
                itemName="rules"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Generated Responses Tab */}
      {currentTab === 'generated-responses' && (
        <div className="space-y-6">
          <div className="border border-[rgba(169,191,165,0.2)] p-6 bg-[#071C1A]">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
              <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8]">
                AI Prepared Follow-up Letters
              </h3>
              <span className="text-[11px] font-mono text-[#A9BFA5]/70">
                Drafts in Queue: {followUpLetters.length}
              </span>
            </div>
            <p className="text-xs text-[#A9BFA5]/80 font-light mb-6">
              Review and dispatch tailored responses drafted automatically by Nexora based on prospect project parameters.
            </p>

            <div className="space-y-4">
              {paginatedLetters.map((item, idx) => (
                <div key={idx} className="p-4 border border-[rgba(169,191,165,0.2)] bg-[#061816] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#E8E9D8]">{item.recipient}</p>
                    <p className="text-xs text-[#A9BFA5] font-light">{item.subject}</p>
                    <p className="text-[11px] text-[#A9BFA5]/60 italic line-clamp-2 mt-1">{item.snippet}</p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      type="button"
                      className="text-xs uppercase tracking-widest text-[#E8E9D8] border border-[rgba(169,191,165,0.3)] hover:border-[#E8E9D8] px-4 py-1.5 transition-colors cursor-pointer"
                    >
                      Review & Send
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Generated Letters */}
            <div className="mt-6 -mx-6 -mb-6">
              <Pagination
                currentPage={responsePage}
                totalItems={followUpLetters.length}
                pageSize={2}
                onPageChange={setResponsePage}
                showPageSize={false}
                itemName="drafts"
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Lead Detail Inspector Modal */}
      {inspectingLead && (
        <LeadDetailModal
          lead={inspectingLead}
          onClose={() => setInspectingLead(null)}
          onUpdateLead={handleUpdate}
          onDispatchResponse={(name) => {
            // Can show a toast or alert
          }}
        />
      )}
    </div>
  );
}
