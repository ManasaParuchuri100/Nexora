import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Sparkles, Plus } from 'lucide-react';
import { SocialAccount, SubCategory, ScheduledPost, MediaAttachment } from '../../types';
import { INITIAL_SCHEDULED_POSTS } from '../../data/mockData';
import Pagination from './Pagination';
import ContentTabs from './ContentTabs';
import ContentCalendar from './ContentCalendar';
import { PageHeader, Tabs } from '../ui';
import MediaAttachmentPicker from './MediaAttachmentPicker';

interface SocialHubViewProps {
  activeSubCategory: SubCategory;
  accounts: SocialAccount[];
  scheduledPosts?: ScheduledPost[];
  libraryCount?: number;
  onNavigateSub: (sub: SubCategory) => void;
  onSchedulePostSuccess: () => void;
  onAddScheduledPost?: (post: ScheduledPost) => void;
  onDeleteScheduledPost?: (id: string) => void;
  onUpdateScheduledPost?: (post: ScheduledPost) => void;
  isFirstRun?: boolean;
}


export default function SocialHubView({
  activeSubCategory,
  accounts,
  scheduledPosts,
  onNavigateSub,
  onSchedulePostSuccess,
  onAddScheduledPost,
  onDeleteScheduledPost,
  onUpdateScheduledPost,
  isFirstRun = false,
  libraryCount
}: SocialHubViewProps) {
  const currentTab = 
    activeSubCategory === 'connect' 
      ? 'connect' 
      : activeSubCategory === 'ai-guided-creation'
      ? 'ai-guided-creation'
      : 'calendar';

  // Fallback local queue if not provided via props
  const [localQueue, setLocalQueue] = useState<ScheduledPost[]>(INITIAL_SCHEDULED_POSTS);
  const queue = scheduledPosts || localQueue;

  // AI Guided state
  const [postPrompt, setPostPrompt] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['LinkedIn', 'X (Twitter)']);
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState('Tomorrow, 9:00 AM');
  const [isScheduled, setIsScheduled] = useState(false);
  const [aiAttachments, setAiAttachments] = useState<MediaAttachment[]>([]);

  // Pagination states
  const [accountsPage, setAccountsPage] = useState<number>(1);
  const accountsPageSize = 3;


  const paginatedAccounts = useMemo(() => {
    const start = (accountsPage - 1) * accountsPageSize;
    return accounts.slice(start, start + accountsPageSize);
  }, [accounts, accountsPage, accountsPageSize]);

  // AI Guided Tab Handlers
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
      const newPost: ScheduledPost = {
        id: `post-${Date.now()}`,
        title: postPrompt.slice(0, 48) || 'AI-Formed Multi-Network Broadcast',
        content: generatedDraft,
        platforms: [...selectedPlatforms],
        scheduledTime: scheduledDate,
        status: 'Queued',
        tags: ['#ai-guided', '#nexora'],
        mediaCount: aiAttachments.length,
        mediaAttachments: [...aiAttachments],
        author: 'Elena Rostova',
        createdAt: 'Just now'
      };
      if (onAddScheduledPost) {
        onAddScheduledPost(newPost);
      } else {
        setLocalQueue(prev => [newPost, ...prev]);
      }
      setPostPrompt('');
      setGeneratedDraft('');
      setAiAttachments([]);
      onSchedulePostSuccess();
      onNavigateSub('calendar');
    }, 1200);
  };

  return (
    <div className="w-full animate-fadeIn space-y-[16px]">
      <PageHeader
        eyebrow="Marketing / Content"
        title="Content"
        subtitle="Create, schedule and reuse your marketing content."
      />
      <ContentTabs active="schedule" onNavigate={onNavigateSub} libraryCount={libraryCount} />

      <Tabs<'calendar' | 'ai-guided-creation' | 'connect'>
        idPrefix="schedule"
        label="Schedule sections"
        value={currentTab}
        onChange={id => onNavigateSub(id)}
        tabs={[
          { id: 'calendar', label: 'Calendar' },
          { id: 'ai-guided-creation', label: 'Write with AI' },
          { id: 'connect', label: 'Connected accounts', count: accounts.length },
        ]}
      />

      {currentTab === 'calendar' && (
        <ContentCalendar
          posts={queue}
          onUpdate={post => (onUpdateScheduledPost ? onUpdateScheduledPost(post) : setLocalQueue(prev => prev.map(x => (x.id === post.id ? post : x))))}
          onAdd={post => (onAddScheduledPost ? onAddScheduledPost(post) : setLocalQueue(prev => [post, ...prev]))}
          onDelete={id => (onDeleteScheduledPost ? onDeleteScheduledPost(id) : setLocalQueue(prev => prev.filter(x => x.id !== id)))}
        />
      )}

      {/* First-Run Empty State (Image 6 spec) */}
      {isFirstRun && (
        <div className="p-8 sm:p-12 rounded-[8px] bg-surface-raised border border-emerald-500/40 text-center space-y-4 max-w-xl mx-auto my-6 animate-fadeIn shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-ok">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display font-semibold text-xl sm:text-2xl font-light text-ink">
              Nothing scheduled.
            </h3>
            <p className="text-xs text-ink-2 font-light max-w-md mx-auto leading-relaxed">
              Plan and automate social publications across connected brand accounts.
            </p>
          </div>
          <div>
            <button
              type="button"
              id="schedule-create-post-btn"
              onClick={() => onNavigateSub('calendar')}
              className="px-6 py-2.5 bg-brand text-on-brand hover:bg-brand-hover text-xs font-mono font-bold uppercase tracking-wider rounded-[8px] transition-colors inline-flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Open the calendar</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Connect Tab */}
      {currentTab === 'connect' && (
        <div className="space-y-6">
          <div className="border border-line divide-y divide-line-subtle bg-surface">
            <div className="grid grid-cols-12 px-6 py-3 text-[11px] uppercase tracking-widest text-ink-3 font-medium bg-surface-raised">
              <div className="col-span-4">Platform / Handle</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Followers</div>
              <div className="col-span-3 text-right">Engagement / Sync</div>
            </div>

            {paginatedAccounts.map(acc => (
              <div key={acc.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-surface-hover transition-colors">
                <div className="col-span-4">
                  <p className="text-xs sm:text-sm font-medium text-ink">{acc.platform}</p>
                  <p className="text-[12px] text-ink-2 font-mono">{acc.handle}</p>
                </div>

                <div className="col-span-3">
                  <span className="inline-flex items-center space-x-1.5 text-[11px] uppercase tracking-wider px-2 py-0.5 border border-emerald-500/30 text-ok bg-emerald-950/20 rounded-[1px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{acc.status}</span>
                  </span>
                </div>

                <div className="col-span-2 text-right font-mono text-xs text-ink">
                  {acc.followers}
                </div>

                <div className="col-span-3 text-right">
                  <p className="text-xs font-mono text-ink">{acc.engagement}</p>
                  <p className="text-[11px] text-ink-3">{acc.lastSync}</p>
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

          <div className="p-4 border border-line bg-surface flex items-center justify-between">
            <span className="text-xs text-ink-2">Connect another channel (Bluesky, Threads, Mastodon)</span>
            <button
              type="button"
              className="text-xs uppercase tracking-widest text-ink border border-line hover:border-brand px-4 py-1.5 transition-colors cursor-pointer"
            >
              + Link Account
            </button>
          </div>
        </div>
      )}

      {/* 2. AI Guided Creation Tab */}
      {currentTab === 'ai-guided-creation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-6 border border-line p-6 sm:p-8 bg-surface">
            <span className="text-[11px] uppercase tracking-widest-plus text-ink-2 block">
              Step 1 // Composition Intent
            </span>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink mb-2 font-medium">
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
                      className={`text-xs uppercase tracking-wider px-3 py-1.5 border rounded-[8px] transition-colors cursor-pointer ${
                        active 
                          ? 'text-ink border-line-strong bg-surface-hover' 
                          : 'text-ink-3 border-line'
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink mb-2 font-medium">
                Core Premise / Update
              </label>
              <textarea
                rows={4}
                value={postPrompt}
                onChange={(e) => setPostPrompt(e.target.value)}
                placeholder="What insight, release, or thought should Nexora translate into an authoritative multi-channel announcement?"
                className="w-full bg-surface-raised border border-line text-ink text-xs p-3 rounded-[8px] focus:outline-none focus:border-line-strong placeholder:text-ink-3 leading-relaxed font-light resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleGeneratePost}
              disabled={!postPrompt.trim()}
              className="w-full bg-brand text-on-brand py-3 rounded-[8px] font-semibold uppercase tracking-widest text-xs hover:bg-brand-hover transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Format Multi-Network Broadcast</span>
            </button>
          </div>

          {/* Draft preview & scheduling */}
          <div className="lg:col-span-6 border border-line p-6 sm:p-8 bg-surface flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between border-b border-line pb-3 mb-4">
                <span className="text-[11px] uppercase tracking-widest text-ink-2">
                  Step 2 // Network Preview
                </span>
                <span className="text-[11px] text-ink-3 font-mono">
                  {selectedPlatforms.join(' · ')}
                </span>
              </div>

              {generatedDraft ? (
                <div className="space-y-4">
                  <div className="p-4 bg-surface-raised border border-line text-xs sm:text-sm text-ink leading-relaxed font-light whitespace-pre-line">
                    {generatedDraft}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-ink-2 mb-1">
                        Release Window
                      </label>
                      <input
                        type="text"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full bg-surface-raised border border-line text-xs text-ink px-2.5 py-1.5 rounded-[8px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-ink-2 mb-1">
                        Tracking Tag
                      </label>
                      <input
                        type="text"
                        defaultValue="#nexora #calmdesign"
                        className="w-full bg-surface-raised border border-line text-xs text-ink px-2.5 py-1.5 rounded-[8px]"
                      />
                    </div>
                  </div>

                  {/* Attached media for AI-generated draft */}
                  <div className="pt-3 border-t border-line-subtle">
                    <MediaAttachmentPicker
                      attachments={aiAttachments}
                      onChange={setAiAttachments}
                      compact={true}
                      label="Attach Media (Optional)"
                      helperText="Attach visuals or editorial documents to accompany this generated post."
                    />
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-ink-3 font-light">
                  Input your premise on the left to review platform-tailored drafts.
                </div>
              )}
            </div>

            {generatedDraft && (
              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="w-full mt-6 bg-brand text-on-brand py-3 rounded-[8px] font-semibold uppercase tracking-widest text-xs hover:bg-brand-hover transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                {isScheduled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" />
                    <span>Added to the calendar</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Confirm and schedule</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

