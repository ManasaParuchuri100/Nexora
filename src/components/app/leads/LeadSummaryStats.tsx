import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

interface LeadSummaryStatsProps {
  tasksInProgress?: number;
  tasksChange?: string;
  prepayments?: string;
  prepaymentsChange?: string;
}

export default function LeadSummaryStats({
  tasksInProgress = 76,
  tasksChange = '+ 6%',
  prepayments = '$12,076',
  prepaymentsChange = '+ 12%'
}: LeadSummaryStatsProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. Tasks in progress */}
      <div className="border border-[rgba(169,191,165,0.2)] bg-[#071C1A] p-5 flex-1 flex flex-col justify-between hover:border-[rgba(169,191,165,0.35)] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm font-light text-[#E8E9D8]">
            Tasks in progress
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3">
          <span className="serif text-4xl sm:text-5xl font-light text-white tracking-tight">
            {tasksInProgress}
          </span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-medium rounded-full text-emerald-300 bg-emerald-950/60 border border-emerald-500/30">
            <span>{tasksChange}</span>
          </span>
        </div>
      </div>

      {/* 2. Prepayments */}
      <div className="border border-[rgba(169,191,165,0.2)] bg-[#071C1A] p-5 flex-1 flex flex-col justify-between hover:border-[rgba(169,191,165,0.35)] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm font-light text-[#E8E9D8]">
            Prepayments
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3">
          <span className="serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
            {prepayments}
          </span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-medium rounded-full text-emerald-300 bg-emerald-950/60 border border-emerald-500/30">
            <span>{prepaymentsChange}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
