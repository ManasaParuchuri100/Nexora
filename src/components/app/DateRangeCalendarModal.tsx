import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  X, 
  RotateCcw,
  Check
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export type SortBasis = 'newest' | 'oldest' | 'priority' | 'value' | 'alphabetical';

export interface DateRangeSelection {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  sortBasis: SortBasis;
}

interface DateRangeCalendarModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialSortBasis?: SortBasis;
  anchorId?: string;
  anchorRef?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onApply: (selection: DateRangeSelection) => void;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateISO(str: string): Date {
  const parts = str.split('-').map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DateRangeCalendarModal({
  isOpen,
  initialStartDate = '2026-09-01',
  initialEndDate = '2026-10-06',
  initialSortBasis = 'newest',
  anchorId = 'custom-date-btn',
  anchorRef,
  onClose,
  onApply
}: DateRangeCalendarModalProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Range selection states
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [sortBasis, setSortBasis] = useState<SortBasis>(initialSortBasis);

  // Optional visual calendar grid expansion
  const [showCalendarGrid, setShowCalendarGrid] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingStep, setSelectingStep] = useState<'start' | 'end'>('start');

  // Month & Year view state for visual calendar
  const initialDateObj = parseDateISO(initialEndDate || initialStartDate || '2026-10-06');
  const [viewYear, setViewYear] = useState<number>(initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDateObj.getMonth());

  // Fixed anchored position style
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement>(null);

  // Position update function: anchors directly below the Custom button aligned to its right edge
  const updatePosition = () => {
    const targetId = anchorId || 'custom-date-btn';
    let el = anchorRef?.current || (targetId ? document.getElementById(targetId) : null);
    if (!el) {
      el = document.querySelector('button[id*="custom-date-btn"], button[id*="custom-btn"], button[id*="custom-dates-btn"]') as HTMLElement;
    }
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = Math.min(340, viewportWidth - 24);

    if (el) {
      const rect = el.getBoundingClientRect();
      // Align panel's right edge with the right edge of the Custom button
      let right = viewportWidth - rect.right;
      
      // Ensure right margin >= 12px
      if (right < 12) right = 12;
      // Ensure left margin >= 12px
      if (viewportWidth - right - panelWidth < 12) {
        right = Math.max(12, viewportWidth - panelWidth - 12);
      }
      
      let top = rect.bottom + 6;
      const estimatedHeight = showCalendarGrid ? 520 : 340;
      if (top + estimatedHeight > viewportHeight && rect.top > estimatedHeight + 12) {
        top = Math.max(12, rect.top - estimatedHeight - 6);
      }

      setPopoverStyle({
        position: 'fixed',
        top: `${top}px`,
        right: `${right}px`,
        width: `${panelWidth}px`,
        maxWidth: 'calc(100vw - 24px)',
        zIndex: 50,
      });
    } else {
      setPopoverStyle({
        position: 'fixed',
        top: '80px',
        right: '24px',
        width: `${panelWidth}px`,
        maxWidth: 'calc(100vw - 24px)',
        zIndex: 50,
      });
    }
  };

  // Sync state whenever opened
  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setSortBasis(initialSortBasis);
      setSelectingStep('start');
      setHoverDate(null);
      setShowCalendarGrid(false);
      const d = parseDateISO(initialEndDate || initialStartDate || '2026-10-06');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      updatePosition();
    }
  }, [isOpen, initialStartDate, initialEndDate, initialSortBasis]);

  // Handle position re-calculation on resize and scroll
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, showCalendarGrid, anchorId, anchorRef]);

  // Click outside and Escape key listeners
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (popoverRef.current && popoverRef.current.contains(target)) {
        return;
      }
      // If clicking on the trigger button itself, let the button's toggle logic handle it
      const targetId = anchorId || 'custom-date-btn';
      const anchor = anchorRef?.current || (targetId ? document.getElementById(targetId) : null) || document.querySelector('button[id*="custom-date-btn"], button[id*="custom-btn"]');
      if (anchor && anchor.contains(target)) {
        return;
      }
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, anchorId, anchorRef]);

  if (!isOpen) return null;

  // Month navigation for visual calendar
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Day click on visual calendar
  const handleDayClick = (iso: string) => {
    if (selectingStep === 'start') {
      setStartDate(iso);
      setEndDate(iso);
      setSelectingStep('end');
    } else {
      if (iso < startDate) {
        setStartDate(iso);
        setEndDate(startDate);
      } else {
        setEndDate(iso);
      }
      setSelectingStep('start');
      setHoverDate(null);
    }
  };

  // Quick preset helper
  const applyPreset = (preset: 'today' | '7days' | '30days' | 'thisMonth') => {
    const now = new Date(2026, 9, 6); // Anchored to app mock date Oct 6, 2026
    let start = new Date(now);
    let end = new Date(now);

    if (preset === 'today') {
      start = new Date(now);
      end = new Date(now);
    } else if (preset === '7days') {
      start = new Date(now);
      start.setDate(now.getDate() - 6);
    } else if (preset === '30days') {
      start = new Date(now);
      start.setDate(now.getDate() - 29);
    } else if (preset === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    setStartDate(formatDateISO(start));
    setEndDate(formatDateISO(end));
    setSelectingStep('start');
  };

  const isPresetActive = (preset: 'today' | '7days' | '30days' | 'thisMonth'): boolean => {
    const now = new Date(2026, 9, 6);
    if (preset === 'today') {
      const todayStr = formatDateISO(now);
      return startDate === todayStr && endDate === todayStr;
    }
    if (preset === '7days') {
      const s = new Date(now);
      s.setDate(now.getDate() - 6);
      return startDate === formatDateISO(s) && endDate === formatDateISO(now);
    }
    if (preset === '30days') {
      const s = new Date(now);
      s.setDate(now.getDate() - 29);
      return startDate === formatDateISO(s) && endDate === formatDateISO(now);
    }
    if (preset === 'thisMonth') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return startDate === formatDateISO(s) && endDate === formatDateISO(e);
    }
    return false;
  };

  // Selected range day count calculation
  const daysSelectedCount = (() => {
    if (!startDate || !endDate) return null;
    const d1 = parseDateISO(startDate);
    const d2 = parseDateISO(endDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  })();

  const formatFriendlyRange = () => {
    if (!startDate || !endDate) return '';
    const d1 = parseDateISO(startDate);
    const d2 = parseDateISO(endDate);
    const m1 = FULL_MONTH_NAMES[d1.getMonth()].slice(0, 3);
    const m2 = FULL_MONTH_NAMES[d2.getMonth()].slice(0, 3);
    return `${m1} ${String(d1.getDate()).padStart(2, '0')}, ${d1.getFullYear()} – ${m2} ${String(d2.getDate()).padStart(2, '0')}, ${d2.getFullYear()}`;
  };

  // Calendar cells calculation for optional visual grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  interface CalendarCell {
    iso: string;
    dayNumber: number;
    isCurrentMonth: boolean;
  }

  const calendarCells: CalendarCell[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevDate = new Date(viewYear, viewMonth - 1, day);
    calendarCells.push({
      iso: formatDateISO(prevDate),
      dayNumber: day,
      isCurrentMonth: false
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(viewYear, viewMonth, d);
    calendarCells.push({
      iso: formatDateISO(curDate),
      dayNumber: d,
      isCurrentMonth: true
    });
  }

  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(viewYear, viewMonth + 1, d);
    calendarCells.push({
      iso: formatDateISO(nextDate),
      dayNumber: d,
      isCurrentMonth: false
    });
  }

  const isDateSelectedStart = (iso: string) => startDate === iso;
  const isDateSelectedEnd = (iso: string) => endDate === iso;
  const isDateInRange = (iso: string) => {
    if (!startDate) return false;
    const effectiveEnd = (selectingStep === 'end' && hoverDate) ? hoverDate : endDate;
    if (!effectiveEnd) return false;
    const minD = startDate < effectiveEnd ? startDate : effectiveEnd;
    const maxD = startDate < effectiveEnd ? effectiveEnd : startDate;
    return iso >= minD && iso <= maxD;
  };

  const handleReset = () => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setSortBasis(initialSortBasis);
    setShowCalendarGrid(false);
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const finalStart = startDate <= endDate ? startDate : endDate;
      const finalEnd = startDate <= endDate ? endDate : startDate;
      onApply({
        startDate: finalStart,
        endDate: finalEnd,
        sortBasis
      });
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <div
      ref={popoverRef}
      style={popoverStyle}
      role="dialog"
      aria-label="Custom Date Range Dropdown"
      className={`rounded-xl border shadow-xl transition-all duration-150 animate-fadeIn p-3.5 sm:p-4 space-y-3 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/10'
          : 'bg-[#061816] border-[rgba(169,191,165,0.22)] text-[#E8E9D8] shadow-black/70'
      }`}
    >
      {/* 1. HEADER: “Custom Date Range” with small close icon */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-[rgba(169,191,165,0.12)]">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <h3 className={`text-xs sm:text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Custom Date Range
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded-md transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              : 'text-[#A9BFA5]/60 hover:text-white hover:bg-[#0D2D2A]'
          }`}
          aria-label="Close"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. DATE RANGE SELECTOR: Two compact date inputs, “Start date” and “End date” */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-[#A9BFA5]'}`}>
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                const val = e.target.value;
                setStartDate(val);
                if (endDate && val > endDate) {
                  setEndDate(val);
                }
              }}
              className={`w-full text-xs px-2.5 py-1.5 rounded-lg border font-mono focus:outline-none transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-50/80 border-slate-200 text-slate-800 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-500/20'
                  : 'bg-[#041210] border-[rgba(169,191,165,0.22)] text-[#E8E9D8] focus:border-teal-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-[#A9BFA5]'}`}>
              End date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => {
                const val = e.target.value;
                setEndDate(val);
                if (startDate && val < startDate) {
                  setStartDate(val);
                }
              }}
              className={`w-full text-xs px-2.5 py-1.5 rounded-lg border font-mono focus:outline-none transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-50/80 border-slate-200 text-slate-800 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-500/20'
                  : 'bg-[#041210] border-[rgba(169,191,165,0.22)] text-[#E8E9D8] focus:border-teal-400'
              }`}
            />
          </div>
        </div>

        {/* Optional Visual Calendar Toggle */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowCalendarGrid(prev => !prev)}
            className="text-[10px] text-teal-600 dark:text-teal-400 font-medium hover:underline cursor-pointer flex items-center space-x-1"
          >
            <span>{showCalendarGrid ? 'Hide Calendar Grid' : 'Show Calendar Grid'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showCalendarGrid ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Visual Calendar Grid */}
        {showCalendarGrid && (
          <div className={`p-2.5 rounded-lg border space-y-2 mt-1 animate-fadeIn ${
            isLight ? 'bg-slate-50/60 border-slate-200' : 'bg-[#041210] border-[rgba(169,191,165,0.18)]'
          }`}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-semibold">
                {FULL_MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 dark:text-[#A9BFA5]/60">
              {WEEKDAYS.map(w => <span key={w}>{w[0]}</span>)}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-y-0.5 text-center text-xs">
              {calendarCells.map((cell) => {
                const isStart = isDateSelectedStart(cell.iso);
                const isEnd = isDateSelectedEnd(cell.iso);
                const inRange = isDateInRange(cell.iso);
                const isSelected = isStart || isEnd;

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => handleDayClick(cell.iso)}
                    onMouseEnter={() => {
                      if (selectingStep === 'end') setHoverDate(cell.iso);
                    }}
                    className={`h-7 w-7 mx-auto rounded-full text-[11px] font-medium flex items-center justify-center cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white font-bold'
                        : inRange
                        ? isLight ? 'bg-teal-100/80 text-teal-900' : 'bg-teal-950/70 text-teal-200'
                        : cell.isCurrentMonth
                        ? isLight ? 'text-slate-700 hover:bg-slate-200/60' : 'text-[#E8E9D8] hover:bg-[#0D2D2A]'
                        : isLight ? 'text-slate-300' : 'text-[#A9BFA5]/25'
                    }`}
                  >
                    {cell.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. SELECTED RANGE SUMMARY: subtle line displaying selected date range and total days */}
      <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
        isLight
          ? 'bg-teal-50/60 border-teal-200/70 text-teal-900'
          : 'bg-teal-950/30 border-teal-800/40 text-teal-300'
      }`}>
        <div className="flex items-center space-x-1.5 truncate">
          <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
          <span className="truncate text-[11px] sm:text-xs">{formatFriendlyRange()}</span>
        </div>
        {daysSelectedCount !== null && (
          <span className="font-semibold shrink-0 text-[11px] tabular-nums ml-2">
            {daysSelectedCount} {daysSelectedCount === 1 ? 'day' : 'days'}
          </span>
        )}
      </div>

      {/* 4. SORT BASIS: compact dropdown with existing options */}
      <div className="space-y-1">
        <label className={`block text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-[#A9BFA5]'}`}>
          Sort basis
        </label>
        <div className="relative">
          <select
            value={sortBasis}
            onChange={(e) => setSortBasis(e.target.value as SortBasis)}
            className={`w-full text-xs px-2.5 py-1.5 pr-8 rounded-lg border appearance-none focus:outline-none transition-colors cursor-pointer font-medium ${
              isLight
                ? 'bg-slate-50/80 border-slate-200 text-slate-800 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-500/20'
                : 'bg-[#041210] border-[rgba(169,191,165,0.22)] text-[#E8E9D8] focus:border-teal-400'
            }`}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Priority (High to Low)</option>
            <option value="value">Deal Value (High to Low)</option>
            <option value="alphabetical">Alphabetical (A → Z)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
        </div>
      </div>

      {/* 5. QUICK PRESETS: small buttons for Today, Last 7 Days, Last 30 Days, and This Month */}
      <div className="space-y-1.5">
        <span className={`block text-[10px] font-semibold uppercase tracking-wider ${
          isLight ? 'text-slate-400' : 'text-[#A9BFA5]/70'
        }`}>
          Quick Presets
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7D' },
            { id: '30days', label: 'Last 30D' },
            { id: 'thisMonth', label: 'This Month' }
          ].map((p) => {
            const active = isPresetActive(p.id as any);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id as any)}
                className={`py-1 px-1 text-[11px] rounded-md border text-center transition-all cursor-pointer font-medium truncate ${
                  active
                    ? isLight
                      ? 'bg-teal-50 text-teal-700 border-teal-300 font-semibold shadow-2xs'
                      : 'bg-[#0D2D2A] border-teal-500/50 text-teal-200 font-semibold'
                    : isLight
                      ? 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                      : 'bg-[#041210] border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white'
                }`}
                title={p.label === 'Last 7D' ? 'Last 7 Days' : p.label === 'Last 30D' ? 'Last 30 Days' : p.label}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. FOOTER: small Reset action on the left and Cancel and Apply buttons on the right */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-[rgba(169,191,165,0.12)] mt-1">
        <button
          type="button"
          onClick={handleReset}
          className={`flex items-center space-x-1 text-xs transition-colors cursor-pointer px-2 py-1.5 rounded-md ${
            isLight
              ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              : 'text-[#A9BFA5]/70 hover:text-white hover:bg-[#0D2D2A]'
          }`}
          title="Reset date range to default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onClose}
            className={`text-xs font-medium transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg border ${
              isLight
                ? 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                : 'border-[rgba(169,191,165,0.2)] text-[#A9BFA5] hover:text-white hover:bg-[#0D2D2A]'
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            id="calendar-apply-btn"
            onClick={handleApply}
            className={`text-xs font-semibold transition-all cursor-pointer px-3.5 py-1.5 rounded-lg shadow-2xs flex items-center space-x-1.5 ${
              isLight
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
}
