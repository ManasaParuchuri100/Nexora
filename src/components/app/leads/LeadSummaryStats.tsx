import React from 'react';
import { TrendingUp, ListChecks } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface LeadSummaryStatsProps {
  tasksInProgress?: number;
  tasksChange?: string;
}

export default function LeadSummaryStats({
  tasksInProgress = 76,
  tasksChange = '+ 6%'
}: LeadSummaryStatsProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="h-full flex flex-col">
      {/* Tasks in progress card */}
      <div className={`border ${
        isLight 
          ? 'border-[#E2ECE0] bg-white hover:border-[#D0DDD0]' 
          : 'border-[rgba(169,191,165,0.2)] bg-[#071C1A] hover:border-[rgba(169,191,165,0.35)]'
      } p-5 sm:p-6 flex-1 flex flex-col justify-between rounded-[2px] transition-colors shadow-sm`}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>
              Tasks in progress
            </span>
            <span className={`p-1.5 rounded-[2px] ${
              isLight ? 'bg-[#EDF3EA] text-[#244B40]' : 'bg-[#0D2D2A] text-[#A9BFA5]'
            }`}>
              <ListChecks className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className={`serif text-4xl sm:text-5xl font-light tracking-tight ${
              isLight ? 'text-[#122420]' : 'text-white'
            }`}>
              {tasksInProgress}
            </span>
            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-medium rounded-full ${
              isLight 
                ? 'text-[#15803D] bg-[#F0FDF4] border border-[#86EFAC]' 
                : 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/30'
            }`}>
              <TrendingUp className="w-3 h-3 mr-0.5" />
              <span>{tasksChange}</span>
            </span>
          </div>
        </div>

        {/* Task Velocity & Breakdown */}
        <div className={`mt-6 pt-5 border-t ${isLight ? 'border-[#E2ECE0]' : 'border-[rgba(169,191,165,0.15)]'} space-y-2`}>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className={isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/70'}>Active Velocity</span>
            <span className={`font-semibold ${isLight ? 'text-[#122420]' : 'text-[#E8E9D8]'}`}>92% on schedule</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-[#EDF3EA]' : 'bg-[#061816]'}`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isLight ? 'bg-[#244B40]' : 'bg-[#A9BFA5]'}`} 
              style={{ width: '92%' }} 
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono pt-1">
            <span className={isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'}>54 assigned</span>
            <span className={isLight ? 'text-[#3E6A5E]' : 'text-[#A9BFA5]/60'}>22 in review</span>
          </div>
        </div>
      </div>
    </div>
  );
}
