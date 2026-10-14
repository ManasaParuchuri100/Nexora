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

function formatMMDDYYYY(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function DateRangeCalendarModal({
  isOpen,
  title = 'Date Range & Filter',
  subtitle = 'Select date range and sorting basis to filter workspace records.',
  initialStartDate = '2026-09-01',
  initialEndDate = '2026-10-06',
  initialSortBasis = 'newest',
  onClose,
  onApply
}: DateRangeCalendarModalProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Range selection states
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingStep, setSelectingStep] = useState<'start' | 'end'>('start');
  const [sortBasis, setSortBasis] = useState<SortBasis>(initialSortBasis);

  // Month & Year view state
  const initialDateObj = parseDateISO(initialEndDate || initialStartDate || '2026-10-06');
  const [viewYear, setViewYear] = useState<number>(initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDateObj.getMonth());

  // Dropdown menus for Month and Year
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);

  const monthMenuRef = useRef<HTMLDivElement>(null);
  const yearMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthMenuRef.current && !monthMenuRef.current.contains(event.target as Node)) {
        setIsMonthMenuOpen(false);
      }
      if (yearMenuRef.current && !yearMenuRef.current.contains(event.target as Node)) {
        setIsYearMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync on modal open
  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setSortBasis(initialSortBasis);
      setSelectingStep('start');
      const d = parseDateISO(initialEndDate || initialStartDate || '2026-10-06');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [isOpen, initialStartDate, initialEndDate, initialSortBasis]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleApply();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, startDate, endDate, sortBasis]);

  if (!isOpen) return null;

  // Month navigation
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

  // Year navigation
  const handlePrevYear = () => {
    setViewYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setViewYear(prev => prev + 1);
  };

  // Day click logic
  const handleDayClick = (dayISO: string) => {
    if (selectingStep === 'start') {
      setStartDate(dayISO);
      setEndDate('');
      setSelectingStep('end');
    } else {
      if (dayISO < startDate) {
        setStartDate(dayISO);
        setEndDate(startDate);
      } else {
        setEndDate(dayISO);
      }
      setSelectingStep('start');
    }
  };

  // Build complete 35/42-cell calendar matrix with overflow days
  const calendarCells = (() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { dayNumber: number; iso: string; isCurrentMonth: boolean }[] = [];

    // Preceding month trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, d);
      cells.push({
        dayNumber: d,
        iso: formatDateISO(prevDate),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const currDate = new Date(viewYear, viewMonth, d);
      cells.push({
        dayNumber: d,
        iso: formatDateISO(currDate),
        isCurrentMonth: true
      });
    }

    // Following month leading days to complete full weeks
    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d);
      cells.push({
        dayNumber: d,
        iso: formatDateISO(nextDate),
        isCurrentMonth: false
      });
    }

    return cells;
  })();

  // Range and selection checks
  const isDateSelectedStart = (iso: string) => startDate === iso;
  const isDateSelectedEnd = (iso: string) => endDate === iso;
  const isDateInRange = (iso: string) => {
    if (startDate && endDate) {
      const s = startDate < endDate ? startDate : endDate;
      const e = startDate < endDate ? endDate : startDate;
      return iso >= s && iso <= e;
    }
    if (startDate && !endDate && hoverDate) {
      const min = startDate < hoverDate ? startDate : hoverDate;
      const max = startDate < hoverDate ? hoverDate : startDate;
      return iso >= min && iso <= max;
    }
    return false;
  };

  // Preset shortcuts
  const applyPreset = (preset: 'today' | '7days' | '30days' | 'thisMonth') => {
    const ref = new Date('2026-10-06');
    let start = new Date(ref);
    let end = new Date(ref);

    switch (preset) {
      case 'today':
        break;
      case '7days':
        start.setDate(ref.getDate() - 6);
        break;
      case '30days':
        start.setDate(ref.getDate() - 29);
        break;
      case 'thisMonth':
        start = new Date(ref.getFullYear(), ref.getMonth(), 1);
        break;
    }

    const sISO = formatDateISO(start);
    const eISO = formatDateISO(end);
    setStartDate(sISO);
    setEndDate(eISO);
    setSelectingStep('start');
    setViewYear(end.getFullYear());
    setViewMonth(end.getMonth());
  };

  // Submit / Apply
  const handleApply = () => {
    const finalStart = startDate || '2026-09-01';
    const finalEnd = endDate || startDate || '2026-10-06';
    onApply({
      startDate: finalStart <= finalEnd ? finalStart : finalEnd,
      endDate: finalStart <= finalEnd ? finalEnd : finalStart,
      sortBasis
    });
    onClose();
  };

  // Generate list of available years
  const availableYears = [2023, 2024, 2025, 2026, 2027, 2028];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-4xl p-6 sm:p-8 rounded-2xl shadow-2xl transition-colors duration-150 max-h-[92vh] overflow-y-auto ${
          isLight 
            ? 'bg-[#FFFFFF] border border-[#CBD5E1] text-[#0F172A]' 
            : 'bg-[#071C1A] border border-[rgba(169,191,165,0.25)] text-[#E8E9D8]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 right-5 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isLight 
              ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]' 
              : 'text-[#A9BFA5]/60 hover:text-white hover:bg-[#0D2D2A]'
          }`}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Layout: Left Notched Inputs + Right Modern Material Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================
              LEFT COLUMN: NOTCHED DATE INPUTS (From Reference Image)
             ======================================================== */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className={`text-[11px] font-mono uppercase tracking-widest block font-bold ${
                isLight ? 'text-[#0891B2]' : 'text-emerald-400'
              }`}>
                Date Window Selection
              </span>
              <h2 className={`text-xl sm:text-2xl font-sans font-light tracking-tight mt-0.5 ${
                isLight ? 'text-[#0F172A]' : 'text-white'
              }`}>
                {title}
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-[#64748B]' : 'text-[#A9BFA5]'}`}>
                {subtitle}
              </p>
            </div>

            {/* Notched Date Field 1: Start Date */}
            <div className="relative pt-2">
              <div 
                onClick={() => setSelectingStep('start')}
                className={`relative flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectingStep === 'start'
                    ? (isLight ? 'border-[#0891B2] ring-2 ring-[#0891B2]/20' : 'border-emerald-400 ring-2 ring-emerald-400/20')
                    : (isLight ? 'border-[#CBD5E1] hover:border-[#94A3B8]' : 'border-[rgba(169,191,165,0.3)] hover:border-[#A9BFA5]')
                } ${isLight ? 'bg-[#FFFFFF]' : 'bg-[#061816]'}`}
              >
                {/* Floating notched label */}
                <span className={`absolute -top-2.5 left-3 px-1.5 text-[11px] font-mono uppercase font-bold tracking-wider ${
                  selectingStep === 'start'
                    ? (isLight ? 'text-[#0891B2]' : 'text-emerald-400')
                    : (isLight ? 'text-[#64748B]' : 'text-[#A9BFA5]')
                } ${isLight ? 'bg-[#FFFFFF]' : 'bg-[#061816]'}`}>
                  Date (Start)
                </span>

                <div className="font-mono text-sm sm:text-base">
                  {startDate ? (
                    <span className={`font-semibold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                      {formatMMDDYYYY(startDate)}
                    </span>
                  ) : (
                    <span className={isLight ? 'text-[#94A3B8]' : 'text-[#A9BFA5]/40'}>
                      MM/DD/YYYY
                    </span>
                  )}
                </div>

                <div className={`p-1.5 rounded-md ${
                  isLight ? 'bg-[#F1F5F9] text-[#475569]' : 'bg-[#0D2D2A] text-[#A9BFA5]'
                }`}>
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Notched Date Field 2: End Date */}
            <div className="relative pt-2">
              <div 
                onClick={() => setSelectingStep('end')}
                className={`relative flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectingStep === 'end'
                    ? (isLight ? 'border-[#0891B2] ring-2 ring-[#0891B2]/20' : 'border-emerald-400 ring-2 ring-emerald-400/20')
                    : (isLight ? 'border-[#CBD5E1] hover:border-[#94A3B8]' : 'border-[rgba(169,191,165,0.3)] hover:border-[#A9BFA5]')
                } ${isLight ? 'bg-[#FFFFFF]' : 'bg-[#061816]'}`}
              >
                {/* Floating notched label */}
                <span className={`absolute -top-2.5 left-3 px-1.5 text-[11px] font-mono uppercase font-bold tracking-wider ${
                  selectingStep === 'end'
                    ? (isLight ? 'text-[#0891B2]' : 'text-emerald-400')
                    : (isLight ? 'text-[#64748B]' : 'text-[#A9BFA5]')
                } ${isLight ? 'bg-[#FFFFFF]' : 'bg-[#061816]'}`}>
                  Date (End)
                </span>

                <div className="font-mono text-sm sm:text-base">
                  {endDate ? (
                    <span className={`font-semibold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                      {formatMMDDYYYY(endDate)}
                    </span>
                  ) : (
                    <span className={isLight ? 'text-[#94A3B8]' : 'text-[#A9BFA5]/40'}>
                      MM/DD/YYYY
                    </span>
                  )}
                </div>

                <div className={`p-1.5 rounded-md ${
                  isLight ? 'bg-[#F1F5F9] text-[#475569]' : 'bg-[#0D2D2A] text-[#A9BFA5]'
                }`}>
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Sorting Basis Notched Select */}
            <div className="relative pt-2">
              <div className={`relative flex items-center justify-between px-4 py-2.5 rounded-lg border-2 ${
                isLight ? 'border-[#CBD5E1] bg-[#FFFFFF]' : 'border-[rgba(169,191,165,0.3)] bg-[#061816]'
              }`}>
                <span className={`absolute -top-2.5 left-3 px-1.5 text-[11px] font-mono uppercase font-bold tracking-wider ${
                  isLight ? 'text-[#64748B] bg-[#FFFFFF]' : 'text-[#A9BFA5] bg-[#061816]'
                }`}>
                  Sort Basis
                </span>

                <select
                  value={sortBasis}
                  onChange={(e) => setSortBasis(e.target.value as SortBasis)}
                  className={`w-full bg-transparent font-mono text-xs focus:outline-none cursor-pointer pr-6 appearance-none font-semibold ${
                    isLight ? 'text-[#0F172A]' : 'text-[#E8E9D8]'
                  }`}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="priority">Priority (High to Low)</option>
                  <option value="value">Deal Value (High to Low)</option>
                  <option value="alphabetical">Alphabetical (A → Z)</option>
                </select>

                <ChevronDown className={`w-3.5 h-3.5 absolute right-3 pointer-events-none ${
                  isLight ? 'text-[#64748B]' : 'text-[#A9BFA5]'
                }`} />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2">
              <span className={`text-[10px] font-mono uppercase tracking-wider block mb-2 font-bold ${
                isLight ? 'text-[#64748B]' : 'text-[#A9BFA5]/70'
              }`}>
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'today', label: 'Today' },
                  { id: '7days', label: 'Last 7 Days' },
                  { id: '30days', label: 'Last 30 Days' },
                  { id: 'thisMonth', label: 'This Month' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id as any)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all cursor-pointer font-medium ${
                      isLight
                        ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9] hover:border-[#94A3B8]'
                        : 'bg-[#051513] border-[rgba(169,191,165,0.25)] text-[#A9BFA5] hover:text-white hover:bg-[#0D2D2A]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: CALENDAR CARD (Exact Visual Style of Image)
             ======================================================== */}
          <div className="lg:col-span-7">
            <div className={`p-6 sm:p-7 rounded-2xl border transition-colors ${
              isLight 
                ? 'bg-[#F8FAFC] border-[#E2E8F0] shadow-sm' 
                : 'bg-[#061816] border-[rgba(169,191,165,0.2)]'
            }`}>
              
              {/* Calendar Header with < Month ▾ > and < Year ▾ > */}
              <div className="flex items-center justify-between pb-4">
                
                {/* Month Selector Group: < Aug ▾ > */}
                <div className="relative flex items-center space-x-1" ref={monthMenuRef}>
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-[#E2E8F0] text-[#334155]' : 'hover:bg-[#0D2D2A] text-[#A9BFA5]'
                    }`}
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMonthMenuOpen(!isMonthMenuOpen)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                      isLight 
                        ? 'hover:bg-[#E2E8F0] text-[#0F172A]' 
                        : 'hover:bg-[#0D2D2A] text-white'
                    }`}
                  >
                    <span>{SHORT_MONTH_NAMES[viewMonth]}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-[#E2E8F0] text-[#334155]' : 'hover:bg-[#0D2D2A] text-[#A9BFA5]'
                    }`}
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Month Dropdown Menu */}
                  {isMonthMenuOpen && (
                    <div className={`absolute left-0 top-full mt-1.5 w-36 rounded-xl border p-1 shadow-2xl z-30 grid grid-cols-2 gap-1 animate-fadeIn ${
                      isLight ? 'bg-[#FFFFFF] border-[#CBD5E1]' : 'bg-[#071C1A] border-[rgba(169,191,165,0.3)]'
                    }`}>
                      {SHORT_MONTH_NAMES.map((mName, mIdx) => (
                        <button
                          key={mName}
                          type="button"
                          onClick={() => {
                            setViewMonth(mIdx);
                            setIsMonthMenuOpen(false);
                          }}
                          className={`px-2 py-1.5 text-xs rounded-md text-left font-medium transition-colors cursor-pointer ${
                            viewMonth === mIdx
                              ? (isLight ? 'bg-[#0891B2] text-white font-bold' : 'bg-emerald-500 text-[#071C1A] font-bold')
                              : (isLight ? 'hover:bg-[#F1F5F9] text-[#334155]' : 'hover:bg-[#0D2D2A] text-[#E8E9D8]')
                          }`}
                        >
                          {mName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year Selector Group: < 2023 ▾ > */}
                <div className="relative flex items-center space-x-1" ref={yearMenuRef}>
                  <button
                    type="button"
                    onClick={handlePrevYear}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-[#E2E8F0] text-[#334155]' : 'hover:bg-[#0D2D2A] text-[#A9BFA5]'
                    }`}
                    aria-label="Previous year"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsYearMenuOpen(!isYearMenuOpen)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                      isLight 
                        ? 'hover:bg-[#E2E8F0] text-[#0F172A]' 
                        : 'hover:bg-[#0D2D2A] text-white'
                    }`}
                  >
                    <span>{viewYear}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextYear}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-[#E2E8F0] text-[#334155]' : 'hover:bg-[#0D2D2A] text-[#A9BFA5]'
                    }`}
                    aria-label="Next year"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Year Dropdown Menu */}
                  {isYearMenuOpen && (
                    <div className={`absolute right-0 top-full mt-1.5 w-28 rounded-xl border p-1 shadow-2xl z-30 grid grid-cols-1 gap-1 animate-fadeIn ${
                      isLight ? 'bg-[#FFFFFF] border-[#CBD5E1]' : 'bg-[#071C1A] border-[rgba(169,191,165,0.3)]'
                    }`}>
                      {availableYears.map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => {
                            setViewYear(yr);
                            setIsYearMenuOpen(false);
                          }}
                          className={`px-3 py-1.5 text-xs rounded-md text-left font-medium transition-colors cursor-pointer ${
                            viewYear === yr
                              ? (isLight ? 'bg-[#0891B2] text-white font-bold' : 'bg-emerald-500 text-[#071C1A] font-bold')
                              : (isLight ? 'hover:bg-[#F1F5F9] text-[#334155]' : 'hover:bg-[#0D2D2A] text-[#E8E9D8]')
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Day of Week Headers: S M T W T F S */}
              <div className="grid grid-cols-7 text-center py-2 mb-1">
                {WEEKDAYS.map((w, idx) => (
                  <span
                    key={`${w}-${idx}`}
                    className={`text-xs font-semibold ${
                      isLight ? 'text-[#334155]' : 'text-[#E8E9D8]/90'
                    }`}
                  >
                    {w}
                  </span>
                ))}
              </div>

              {/* 7-Column Calendar Day Grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {calendarCells.map((cell) => {
                  const isStart = isDateSelectedStart(cell.iso);
                  const isEnd = isDateSelectedEnd(cell.iso);
                  const inRange = isDateInRange(cell.iso);
                  const isSelected = isStart || isEnd;

                  return (
                    <div
                      key={cell.iso}
                      className={`h-9 flex items-center justify-center relative ${
                        inRange && !isSelected
                          ? (isLight ? 'bg-[#E0F2FE]' : 'bg-[#0D2D2A]/80')
                          : ''
                      } ${
                        isStart && endDate && endDate > startDate
                          ? 'rounded-l-full'
                          : ''
                      } ${
                        isEnd && startDate && startDate < endDate
                          ? 'rounded-r-full'
                          : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleDayClick(cell.iso)}
                        onMouseEnter={() => {
                          if (selectingStep === 'end') setHoverDate(cell.iso);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer relative z-10 ${
                          isSelected
                            ? (isLight
                                ? 'bg-[#0891B2] text-white font-bold shadow-md ring-2 ring-[#0891B2]/30 scale-105'
                                : 'bg-emerald-500 text-[#071C1A] font-black shadow-md ring-2 ring-emerald-400/40 scale-105')
                            : inRange
                            ? (isLight ? 'text-[#0369A1] font-semibold' : 'text-emerald-300 font-semibold')
                            : cell.isCurrentMonth
                            ? (isLight
                                ? 'text-[#0F172A] hover:bg-[#E2E8F0] font-medium'
                                : 'text-[#E8E9D8] hover:bg-[#0D2D2A] font-medium')
                            : (isLight
                                ? 'text-[#94A3B8] hover:bg-[#F1F5F9]'
                                : 'text-[#A9BFA5]/30 hover:bg-[#0D2D2A]/30')
                        }`}
                      >
                        {cell.dayNumber}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer Actions: Cancel & OK (Matching Reference Image) */}
              <div className="flex items-center justify-end space-x-5 pt-6 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`text-sm font-semibold transition-colors cursor-pointer px-3 py-1.5 rounded-lg ${
                    isLight 
                      ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]' 
                      : 'text-[#A9BFA5] hover:text-white hover:bg-[#0D2D2A]'
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  id="calendar-ok-btn"
                  onClick={handleApply}
                  className={`text-sm font-bold transition-all cursor-pointer px-4 py-1.5 rounded-lg shadow-sm ${
                    isLight
                      ? 'bg-[#0891B2] hover:bg-[#0E7490] text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-[#071C1A]'
                  }`}
                >
                  OK
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
