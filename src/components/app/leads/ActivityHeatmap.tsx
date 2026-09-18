import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const HOURS = ['2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM'];
const DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// 6 rows x 13 columns activity matrix (intensity 0 to 4)
// Accurately inspired by the pattern visible in the screenshot
const ACTIVITY_MATRIX: number[][] = [
  // 2 PM
  [2, 3, 1, 0, 4, 2, 0, 3, 2, 0, 4, 3, 1],
  // 3 PM
  [3, 1, 0, 4, 3, 0, 2, 4, 0, 3, 2, 4, 3],
  // 4 PM (dense active row)
  [4, 3, 4, 2, 4, 3, 4, 2, 4, 3, 4, 3, 4],
  // 5 PM
  [0, 3, 2, 0, 3, 1, 4, 0, 2, 3, 0, 4, 0],
  // 6 PM
  [4, 2, 3, 4, 0, 2, 3, 4, 2, 3, 0, 2, 0],
  // 7 PM
  [2, 3, 0, 4, 2, 3, 0, 3, 2, 0, 4, 3, 2],
];

interface ActivityHeatmapProps {
  onClose?: () => void;
}

export default function ActivityHeatmap({ onClose }: ActivityHeatmapProps = {}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [hoveredCell, setHoveredCell] = useState<{
    hour: string;
    day: number;
    intensity: number;
  } | null>(null);

  // Return color style for activity block in Nexora palette
  const getCellColor = (val: number) => {
    if (isLight) {
      switch (val) {
        case 1:
          return 'bg-[#9FC2B0] border border-[#7FA894]';
        case 2:
          return 'bg-[#3A6B58] border border-[#2B5545] text-white';
        case 3:
          return 'bg-[#0284C7] border border-[#0369A1] text-white';
        case 4:
          return 'bg-[#1D4ED8] border border-[#1E40AF] text-white';
        default:
          return 'bg-[#E5ECE3] border border-[rgba(20,50,40,0.12)]';
      }
    }
    switch (val) {
      case 1:
        return 'bg-[#A9BFA5]/30 border border-[#A9BFA5]/20';
      case 2:
        return 'bg-[#A9BFA5] border border-[#A9BFA5] text-[#071C1A]';
      case 3:
        return 'bg-[#38BDF8] border border-[#38BDF8]';
      case 4:
        return 'bg-[#3B82F6] border border-[#3B82F6]';
      default:
        return 'bg-[#08221F] border border-[rgba(169,191,165,0.08)]';
    }
  };

  return (
    <div className="border border-[rgba(169,191,165,0.2)] bg-[#071C1A] p-5 flex flex-col justify-between h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="serif text-xl sm:text-2xl font-light text-[#E8E9D8] tracking-tight">
            Activity
          </h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Hide activity graph"
              className="text-[#A9BFA5]/60 hover:text-[#E8E9D8] hover:bg-[rgba(169,191,165,0.1)] p-1 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-[#A9BFA5]/70">
          <span>Less</span>
          <span className={`w-2 h-2 rounded-[1px] ${isLight ? 'bg-[#E5ECE3] border border-[rgba(20,50,40,0.15)]' : 'bg-[#08221F] border border-[rgba(169,191,165,0.1)]'}`} />
          <span className={`w-2 h-2 rounded-[1px] ${isLight ? 'bg-[#9FC2B0]' : 'bg-[#A9BFA5]/30'}`} />
          <span className={`w-2 h-2 rounded-[1px] ${isLight ? 'bg-[#3A6B58]' : 'bg-[#A9BFA5]'}`} />
          <span className={`w-2 h-2 rounded-[1px] ${isLight ? 'bg-[#0284C7]' : 'bg-[#38BDF8]'}`} />
          <span className={`w-2 h-2 rounded-[1px] ${isLight ? 'bg-[#1D4ED8]' : 'bg-[#3B82F6]'}`} />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative overflow-x-auto pb-1">
        <div className="min-w-[340px]">
          {/* Rows */}
          <div className="space-y-1.5">
            {HOURS.map((hour, rIdx) => (
              <div key={hour} className="flex items-center space-x-2">
                {/* Y-axis hour label */}
                <span className="w-10 text-[10px] font-mono text-[#A9BFA5]/70 text-right shrink-0 select-none">
                  {hour}
                </span>

                {/* Day cells (13 columns) */}
                <div className="grid grid-cols-13 gap-1.5 flex-1">
                  {DAYS.map((day, cIdx) => {
                    const intensity = ACTIVITY_MATRIX[rIdx]?.[cIdx] ?? 0;
                    return (
                      <div
                        key={day}
                        onMouseEnter={() => setHoveredCell({ hour, day, intensity })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-5 sm:h-6 rounded-[2px] cursor-pointer transition-all hover:scale-110 hover:z-10 ${getCellColor(
                          intensity
                        )}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* X-axis days footer */}
          <div className="flex items-center space-x-2 mt-2 pt-1 border-t border-[rgba(169,191,165,0.1)]">
            <span className="w-10 text-[10px] font-mono text-[#A9BFA5] font-medium text-right shrink-0">
              June
            </span>
            <div className="grid grid-cols-13 gap-1.5 flex-1 text-center">
              {DAYS.map(day => (
                <span
                  key={day}
                  className="text-[10px] font-mono text-[#A9BFA5]/70"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredCell && (
          <div className="absolute top-0 right-0 bg-[#051513] border border-[rgba(169,191,165,0.3)] px-3 py-1.5 rounded-[2px] text-[10px] font-mono text-[#E8E9D8] shadow-lg pointer-events-none z-30">
            <span className="text-[#A9BFA5]">June {hoveredCell.day} at {hoveredCell.hour}: </span>
            <span className="font-semibold text-white">
              {hoveredCell.intensity === 0 
                ? 'No client events' 
                : `${hoveredCell.intensity * 4 + 3} prospect interactions`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
