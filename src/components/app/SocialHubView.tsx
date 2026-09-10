import React, { useState, useMemo } from 'react';
import { 
  Share2, 
  Send, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { SocialAccount, SubCategory } from '../../types';
import Pagination from './Pagination';

interface SocialHubViewProps {
  activeSubCategory: SubCategory;
  accounts: SocialAccount[];
  onNavigateSub: (sub: SubCategory) => void;
  onSchedulePostSuccess: () => void;
}

export default function SocialHubView({
  activeSubCategory,
  accounts,
  onNavigateSub,
  onSchedulePostSuccess
}: SocialHubViewProps) {
  const currentTab = 
    activeSubCategory === 'connect' 
      ? 'connect' 
      : activeSubCategory === 'manual-scheduling' 
      ? 'manual-scheduling' 
      : 'ai-guided-creation';

  // AI Guided state
  const [postPrompt, setPostPrompt] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['LinkedIn', 'X (Twitter)']);
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState('Tomorrow, 9:00 AM');
  const [isScheduled, setIsScheduled] = useState(false);

  // Pagination states
  const [accountsPage, setAccountsPage] = useState<number>(1);
  const accountsPageSize = 3;

  const [queuePage, setQueuePage] = useState<number>(1);
  const queuePageSize = 3;

  // Upcoming scheduled posts queue
  const queueItems = useMemo(() => [
    { time: 'Today, 4:00 PM', platform: 'LinkedIn', title: 'Why software should speak in hairlines, not badges', status: 'Queued' },
    { time: 'Tomorrow, 9:30 AM', platform: 'X (Twitter)', title: 'Thread: 10 architectural principles for high-output design studios', status: 'Approved' },
    { time: 'Thursday, 11:00 AM', platform: 'Substack', title: 'The Quiet Horizon Vol. 14: Restoring Creative Autonomy', status: 'Draft Review' },
    { time: 'Friday, 2:15 PM', platform: 'Instagram', title: 'Kyoto atelier photo essay & minimal physical workspace gallery', status: 'Queued' },
    { time: 'Saturday, 10:00 AM', platform: 'LinkedIn', title: 'Deep dive into deterministic client qualification models', status: 'Scheduled' },
    { time: 'Next Monday, 8:45 AM', platform: 'X (Twitter)', title: 'Release note: Automated lead qualifier engine v2.4 rollout', status: 'Draft' }
  ], []);

  const paginatedAccounts = useMemo(() => {
    const start = (accountsPage - 1) * accountsPageSize;
    return accounts.slice(start, start + accountsPageSize);
  }, [accounts, accountsPage, accountsPageSize]);

  const paginatedQueue = useMemo(() => {
    const start = (queuePage - 1) * queuePageSize;
    return queueItems.slice(start, start + queuePageSize);
  }, [queueItems, queuePage, queuePageSize]);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const handleGeneratePost = () => {
    if (!postPrompt.trim()) return;
    setGeneratedDraft(
      `We spent two years analyzing how high-growth founders structure their workspaces.\n\nThe findings were startling: 78% of cognitive fatigue comes not from complex problem-solving, but from micro-distractions caused by aggressive dashboard styling.\n\nSimplicity isn't an aesthetic luxury — it is an operating system for deep conviction.`
    );
  };

  const handleConfirmSchedule = () => {
    setIsScheduled(true);
    setTimeout(() => {
      setIsScheduled(false);
      setPostPrompt('');
      setGeneratedDraft('');
      onSchedulePostSuccess();
      onNavigateSub('manual-scheduling');
    }, 1200);
  };

  return (
    <div className="space-y-12 py-4">
      {/* Header */}
      <section className="border-b border-[rgba(169,191,165,0.2)] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest-plus text-[#A9BFA5] font-normal block mb-2">
            BROADCAST & AUDIENCE NETWORK
          </span>
          <h1 className="serif text-4xl sm:text-5xl font-light text-[#E8E9D8] tracking-tight">
            Social Hub
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#A9BFA5]/80 font-light leading-relaxed max-w-xl">
            Synchronize unified messaging across external platforms with AI-assisted formatting, audience tone calibration, and automated release schedules.
          </p>
        </div>

        {/* Subnav switcher */}
        <div className="flex items-center space-x-6 text-xs uppercase tracking-widest border-b border-[rgba(169,191,165,0.2)] pb-1">
          <button
            type="button"
            onClick={() => onNavigateSub('ai-guided-creation')}
            className={`pb-1 border-b transition-colors cursor-pointer ${
              currentTab === 'ai-guided-creation' 
                ? 'text-[#E8E9D8] border-[#E8E9D8] font-medium' 
                : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
            }`}
          >
            AI Guided Creation
          </button>
          <button
            type="button"
            onClick={() => onNavigateSub('manual-scheduling')}
            className={`pb-1 border-b transition-colors cursor-pointer ${
              currentTab === 'manual-scheduling' 
                ? 'text-[#E8E9D8] border-[#E8E9D8] font-medium' 
                : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
            }`}
          >
            Manual Scheduling
          </button>
          <button
            type="button"
            onClick={() => onNavigateSub('connect')}
            className={`pb-1 border-b transition-colors cursor-pointer ${
              currentTab === 'connect' 
                ? 'text-[#E8E9D8] border-[#E8E9D8] font-medium' 
                : 'text-[#A9BFA5]/60 border-transparent hover:text-[#A9BFA5]'
            }`}
          >
            Connect ({accounts.length})
          </button>
        </div>
      </section>

      {/* 1. Connect Tab */}
      {currentTab === 'connect' && (
        <div className="space-y-6">
          <div className="border border-[rgba(169,191,165,0.2)] divide-y divide-[rgba(169,191,165,0.15)] bg-[#071C1A]">
            <div className="grid grid-cols-12 px-6 py-3 text-[10px] uppercase tracking-widest text-[#A9BFA5]/60 font-medium bg-[#061816]">
              <div className="col-span-4">Platform / Handle</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Followers</div>
              <div className="col-span-3 text-right">Engagement / Sync</div>
            </div>

            {paginatedAccounts.map(acc => (
              <div key={acc.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-[#0D2D2A]/30 transition-colors">
                <div className="col-span-4">
                  <p className="text-xs sm:text-sm font-medium text-[#E8E9D8]">{acc.platform}</p>
                  <p className="text-[11px] text-[#A9BFA5]/70 font-mono">{acc.handle}</p>
                </div>

                <div className="col-span-3">
                  <span className="inline-flex items-center space-x-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 border border-emerald-500/30 text-emerald-400 bg-emerald-950/20 rounded-[1px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{acc.status}</span>
                  </span>
                </div>

                <div className="col-span-2 text-right font-mono text-xs text-[#E8E9D8]">
                  {acc.followers}
                </div>

                <div className="col-span-3 text-right">
                  <p className="text-xs font-mono text-[#E8E9D8]">{acc.engagement}</p>
                  <p className="text-[10px] text-[#A9BFA5]/60">{acc.lastSync}</p>
                </div>
              </div>
            ))}

            {/* Pagination for Accounts */}
            {accounts.length > 0 && (
              <Pagination
                currentPage={accountsPage}
                totalItems={accounts.length}
                pageSize={accountsPageSize}
                onPageChange={setAccountsPage}
                showPageSize={false}
                itemName="accounts"
              />
            )}
          </div>

          <div className="p-4 border border-[rgba(169,191,165,0.2)] bg-[#071C1A] flex items-center justify-between">
            <span className="text-xs text-[#A9BFA5]">Connect another channel (Bluesky, Threads, Mastodon)</span>
            <button
              type="button"
              className="text-xs uppercase tracking-widest text-[#E8E9D8] border border-[rgba(169,191,165,0.3)] hover:border-[#E8E9D8] px-4 py-1.5 transition-colors cursor-pointer"
            >
              + Link Account
            </button>
          </div>
        </div>
      )}

      {/* 2. AI Guided Creation Tab */}
      {currentTab === 'ai-guided-creation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-6 border border-[rgba(169,191,165,0.2)] p-6 sm:p-8 bg-[#071C1A]">
            <span className="text-[10px] uppercase tracking-widest-plus text-[#A9BFA5] block">
              Step 1 // Composition Intent
            </span>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#E8E9D8] mb-2 font-medium">
                Target Networks
              </label>
              <div className="flex flex-wrap gap-2">
                {['LinkedIn', 'X (Twitter)', 'Substack', 'Instagram'].map(platform => {
                  const active = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`text-xs uppercase tracking-wider px-3 py-1.5 border rounded-[2px] transition-colors cursor-pointer ${
                        active 
                          ? 'text-[#E8E9D8] border-[#A9BFA5] bg-[#0D2D2A]' 
                          : 'text-[#A9BFA5]/60 border-[rgba(169,191,165,0.2)]'
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#E8E9D8] mb-2 font-medium">
                Core Premise / Update
              </label>
              <textarea
                rows={4}
                value={postPrompt}
                onChange={(e) => setPostPrompt(e.target.value)}
                placeholder="What insight, release, or thought should Nexora translate into an authoritative multi-channel announcement?"
                className="w-full bg-[#061816] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8] text-xs p-3 rounded-[2px] focus:outline-none focus:border-[#A9BFA5] placeholder-[#A9BFA5]/30 leading-relaxed font-light resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleGeneratePost}
              disabled={!postPrompt.trim()}
              className="w-full bg-[#E8E9D8] text-[#071C1A] py-3 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Format Multi-Network Broadcast</span>
            </button>
          </div>

          {/* Draft preview & scheduling */}
          <div className="lg:col-span-6 border border-[rgba(169,191,165,0.2)] p-6 sm:p-8 bg-[#071C1A] flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between border-b border-[rgba(169,191,165,0.2)] pb-3 mb-4">
                <span className="text-[10px] uppercase tracking-widest text-[#A9BFA5]">
                  Step 2 // Network Preview
                </span>
                <span className="text-[10px] text-[#A9BFA5]/60 font-mono">
                  {selectedPlatforms.join(' · ')}
                </span>
              </div>

              {generatedDraft ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#061816] border border-[rgba(169,191,165,0.2)] text-xs sm:text-sm text-[#E8E9D8] leading-relaxed font-light">
                    {generatedDraft}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1">
                        Release Window
                      </label>
                      <input
                        type="text"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full bg-[#061816] border border-[rgba(169,191,165,0.25)] text-xs text-[#E8E9D8] px-2.5 py-1.5 rounded-[2px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#A9BFA5] mb-1">
                        Tracking Tag
                      </label>
                      <input
                        type="text"
                        defaultValue="#nexora #calmdesign"
                        className="w-full bg-[#061816] border border-[rgba(169,191,165,0.25)] text-xs text-[#E8E9D8] px-2.5 py-1.5 rounded-[2px]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-[#A9BFA5]/50 font-light">
                  Input your premise on the left to review platform-tailored drafts.
                </div>
              )}
            </div>

            {generatedDraft && (
              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="w-full mt-6 bg-[#A9BFA5] text-[#071C1A] py-3 rounded-[2px] font-semibold uppercase tracking-widest text-xs hover:bg-[#E8E9D8] transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                {isScheduled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" />
                    <span>Synchronized to Queue</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Confirm & Queue Broadcast</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Manual Scheduling Tab */}
      {currentTab === 'manual-scheduling' && (
        <div className="space-y-6">
          <div className="border border-[rgba(169,191,165,0.2)] p-6 bg-[#071C1A]">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[rgba(169,191,165,0.15)]">
              <span className="text-xs uppercase tracking-widest text-[#E8E9D8] font-medium">
                Upcoming Queue Schedule
              </span>
              <span className="text-[10px] text-[#A9BFA5]/70 font-mono">
                5 slots scheduled this week
              </span>
            </div>

            <div className="divide-y divide-[rgba(169,191,165,0.15)]">
              {paginatedQueue.map((item, idx) => (
                <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#0D2D2A]/20 transition-colors px-2">
                  <div className="flex items-start space-x-4">
                    <span className="text-xs font-mono text-[#A9BFA5] w-36 shrink-0">{item.time}</span>
                    <div>
                      <p className="text-xs sm:text-sm text-[#E8E9D8] font-medium">{item.title}</p>
                      <p className="text-[10px] text-[#A9BFA5]/60 uppercase tracking-widest font-mono mt-0.5">{item.platform}</p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 border border-[rgba(169,191,165,0.25)] text-[#A9BFA5]">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination for Queue */}
            {queueItems.length > 0 && (
              <div className="mt-4 -mx-6 -mb-6">
                <Pagination
                  currentPage={queuePage}
                  totalItems={queueItems.length}
                  pageSize={queuePageSize}
                  onPageChange={setQueuePage}
                  showPageSize={false}
                  itemName="slots"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
