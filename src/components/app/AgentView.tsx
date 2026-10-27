import React, { useState } from 'react';
import { NavCategory, SubCategory } from '../../types';
import { useConversations } from '../../data/conversations';
import { PageHeader, Card, StatCard, Button } from '../ui';

interface AgentViewProps {
  onNavigate: (category: NavCategory, subCategory?: SubCategory) => void;
}

export default function AgentView({ onNavigate }: AgentViewProps) {
  const [conversations] = useConversations();
  const [isAgentOn, setIsAgentOn] = useState(true);

  const aiHandlingCount = conversations.filter(c => c.status === 'ai_handling').length;
  const needsYouCount = conversations.filter(c => c.status === 'needs_you').length;
  const pausedCount = conversations.filter(c => Boolean(c.aiAlert?.isPaused)).length;

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Engagement agent"
        subtitle="Your AI replies to leads on WhatsApp, Instagram, LinkedIn and your website, and hands over to you when it needs a person."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('settings', 'ai-automation')}
          >
            Edit AI rules
          </Button>
        }
      />

      {/* Agent Status Toggle Card */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              role="switch"
              aria-checked={isAgentOn}
              onClick={() => setIsAgentOn(prev => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                isAgentOn ? 'bg-brand' : 'bg-surface-raised border border-line'
              }`}
            >
              <span className="sr-only">Toggle engagement agent</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out ${
                  isAgentOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-ink">
                {isAgentOn
                  ? 'The agent is on and replying to new messages'
                  : 'The agent is paused. New messages wait for you.'}
              </p>
              <p className="text-xs text-ink-3">
                {isAgentOn
                  ? 'Auto-qualification and proactive lead outreach are currently active.'
                  : 'All incoming customer messages will queue for human response.'}
              </p>
            </div>
          </div>
          <div className="shrink-0 sm:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('settings', 'ai-automation')}
            >
              Edit AI rules
            </Button>
          </div>
        </div>
      </Card>

      {/* Real-time Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="AI is handling"
          value={aiHandlingCount}
          hint="Conversations currently in autopilot"
        />
        <StatCard
          label="Needs you"
          value={needsYouCount}
          hint="Click to open Inbox"
          onClick={() => onNavigate('inbox', 'inbox')}
        />
        <StatCard
          label="Paused by AI"
          value={pausedCount}
          hint="Awaiting human confirmation"
        />
      </div>
    </div>
  );
}
