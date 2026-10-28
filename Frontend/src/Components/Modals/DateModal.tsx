"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

export interface DateSelectionRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
  viewMode: "day" | "week" | "month";
}

export interface DateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (selection: DateSelectionRange) => void;
  currentRange?: Partial<DateSelectionRange>;
  className?: string;
}

const MONTH_NAMES_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_LABELS = [
  { full: "Monday", short: "Mon", th: "จ." },
  { full: "Tuesday", short: "Tue", th: "อ." },
  { full: "Wednesday", short: "Wed", th: "พ." },
  { full: "Thursday", short: "Thu", th: "พฤ." },
  { full: "Friday", short: "Fri", th: "ศ." },
  { full: "Saturday", short: "Sat", th: "ส." },
  { full: "Sunday", short: "Sun", th: "อา." },
];

function toIsoString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * DateModal Component (Subscriptions Calendar UI Style)
 * 
 * Semi-modal / Dropdown Popover Calendar inspired by Techstack Design's Subscriptions Calendar UI:
 * - Segmented top pill switcher (Week / Month)
 * - Month navigation (< Month Year >)
 * - 7-column calendar grid with squircle day tiles
 * - Highlighted active day-of-week header column in warm terracotta / coral-orange
 * - Event bullet dots on dates with data
 * - Dropdown-anchored popover presentation with outside-click dismissal
 */
interface CalendarCell {
  day: number;
  monthOffset: -1 | 0 | 1; // -1 = prev month, 0 = current, 1 = next
  isoDate: string;
  colIndex: number; // 0 (Mon) to 6 (Sun)
}

export default function DateModal({
  isOpen,
  onClose,
  onApply,
  currentRange,
  className = "",
}: DateModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Active view mode: "week" | "month"
  const [viewMode, setViewMode] = useState<"week" | "month">("month");

  // Current calendar navigation view
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toIsoString(today), [today]);
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth()); // 0-11

  // Range Selection States
  const [selectedStartDate, setSelectedStartDate] = useState<string>(() =>
    currentRange?.startDate || todayIso
  );
  const [selectedEndDate, setSelectedEndDate] = useState<string>(() =>
    currentRange?.endDate || todayIso
  );

  // Range marking state machine
  const [pickingStart, setPickingStart] = useState<string | null>(null); // first clicked date waiting for 2nd
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<"last7" | "thisMonth" | "thisYear" | null>(null);

  // Outside click listener for semi-modal / dropdown behavior
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Global window mouseup to finalize drag cleanly anywhere
  useEffect(() => {
    function handleGlobalMouseUp() {
      setIsMouseDown(false);
    }

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      if (currentRange?.startDate) {
        setSelectedStartDate(currentRange.startDate);
        setSelectedEndDate(currentRange.endDate || currentRange.startDate);
        const parsed = new Date(currentRange.startDate);
        if (!isNaN(parsed.getTime())) {
          setViewYear(parsed.getFullYear());
          setViewMonth(parsed.getMonth());
        }
      }
      setPickingStart(null);
      setHoverDate(null);
      setIsMouseDown(false);
    }
  }, [isOpen, currentRange]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Complete, seamless Calendar Grid Calculation (Monday-first, 35 or 42 cells)
  const calendarCells = useMemo<CalendarCell[]>(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
    const mondayOffset = (firstDayOfWeek + 6) % 7; // 0 for Mon, 6 for Sun

    const cells: CalendarCell[] = [];

    // 1. Previous month trailing days
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, d);
      cells.push({
        day: d,
        monthOffset: -1,
        isoDate: toIsoString(prevDate),
        colIndex: cells.length % 7,
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(viewYear, viewMonth, d);
      cells.push({
        day: d,
        monthOffset: 0,
        isoDate: toIsoString(currDate),
        colIndex: cells.length % 7,
      });
    }

    // 3. Next month leading days to complete full 7-day rows (always 35 or 42 cells)
    const totalRows = Math.ceil(cells.length / 7);
    const targetTotalCells = totalRows * 7;
    let nextDay = 1;
    while (cells.length < targetTotalCells) {
      const nextDate = new Date(viewYear, viewMonth + 1, nextDay);
      cells.push({
        day: nextDay,
        monthOffset: 1,
        isoDate: toIsoString(nextDate),
        colIndex: cells.length % 7,
      });
      nextDay++;
    }

    return cells;
  }, [viewYear, viewMonth]);

  // Compute Active Display Range (accounting for in-progress drag or 2nd click hover)
  const activeRange = useMemo(() => {
    if (pickingStart && hoverDate) {
      const start = pickingStart < hoverDate ? pickingStart : hoverDate;
      const end = pickingStart < hoverDate ? hoverDate : pickingStart;
      return { start, end };
    }
    const start = selectedStartDate < selectedEndDate ? selectedStartDate : selectedEndDate;
    const end = selectedStartDate < selectedEndDate ? selectedEndDate : selectedStartDate;
    return { start, end };
  }, [pickingStart, hoverDate, selectedStartDate, selectedEndDate]);

  // Determine active day-of-week column indices for header highlight
  const activeDayIndices = useMemo(() => {
    const set = new Set<number>();
    const start = new Date(activeRange.start);
    const end = new Date(activeRange.end);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const curr = new Date(start);
      let count = 0;
      while (curr <= end && count < 7) {
        set.add((curr.getDay() + 6) % 7);
        curr.setDate(curr.getDate() + 1);
        count++;
      }
    }
    return set;
  }, [activeRange]);

  // ─── INTERACTION HANDLERS (CLICK-TO-MARK & DRAG-TO-SELECT) ───
  const handleCellMouseDown = (cell: CalendarCell, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent native text/image drag
    const iso = cell.isoDate;

    if (viewMode === "week") {
      // Week mode: Select whole Monday - Sunday week
      const targetDate = new Date(iso);
      const dayOfWeek = (targetDate.getDay() + 6) % 7;
      const monday = new Date(targetDate);
      monday.setDate(targetDate.getDate() - dayOfWeek);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setSelectedStartDate(toIsoString(monday));
      setSelectedEndDate(toIsoString(sunday));
      setPickingStart(null);
      setHoverDate(null);
      return;
    }

    // Month mode: Dual Click-to-Mark & Drag
    setIsMouseDown(true);
    setActivePreset(null);

    if (!pickingStart) {
      // First click: mark start of range (e.g. click 3)
      setPickingStart(iso);
      setHoverDate(iso);
      setSelectedStartDate(iso);
      setSelectedEndDate(iso);
    } else {
      // Second click: lock range (e.g. click 8)
      const start = pickingStart < iso ? pickingStart : iso;
      const end = pickingStart < iso ? iso : pickingStart;
      setSelectedStartDate(start);
      setSelectedEndDate(end);
      setPickingStart(null);
      setHoverDate(null);
    }
  };

  const handleCellMouseEnter = (cell: CalendarCell) => {
    if (viewMode === "week") return;
    const iso = cell.isoDate;

    if (pickingStart) {
      setHoverDate(iso);
      if (isMouseDown) {
        // While dragging: continuously update range
        const start = pickingStart < iso ? pickingStart : iso;
        const end = pickingStart < iso ? iso : pickingStart;
        setSelectedStartDate(start);
        setSelectedEndDate(end);
      }
    }
  };

  const handleCellMouseUp = (cell: CalendarCell) => {
    if (viewMode === "week") return;
    const iso = cell.isoDate;

    if (isMouseDown && pickingStart) {
      if (iso !== pickingStart) {
        // Dragged to a different date and released: finalize range immediately!
        const start = pickingStart < iso ? pickingStart : iso;
        const end = pickingStart < iso ? iso : pickingStart;
        setSelectedStartDate(start);
        setSelectedEndDate(end);
        setPickingStart(null);
        setHoverDate(null);
      }
      // If released on the same date, keep pickingStart active so user can click 2nd date
    }
    setIsMouseDown(false);
  };

  // Quick Preset Handlers (Matching Image 1: 7 วัน / เดือนนี้ / ปีนี้)
  const handleSelectPreset = (preset: "last7" | "thisMonth" | "thisYear") => {
    setPickingStart(null);
    setHoverDate(null);
    setIsMouseDown(false);
    setActivePreset(preset);

    if (preset === "last7") {
      const d7 = new Date(today);
      d7.setDate(d7.getDate() - 6);
      setSelectedStartDate(toIsoString(d7));
      setSelectedEndDate(todayIso);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    } else if (preset === "thisMonth") {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      setSelectedStartDate(toIsoString(first));
      setSelectedEndDate(todayIso);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    } else if (preset === "thisYear") {
      const firstOfYear = new Date(today.getFullYear(), 0, 1);
      setSelectedStartDate(toIsoString(firstOfYear));
      setSelectedEndDate(todayIso);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
  };

  // Reset back to normal day (Today default / clear filter)
  const handleReset = () => {
    setPickingStart(null);
    setHoverDate(null);
    setIsMouseDown(false);
    setActivePreset(null);
    setSelectedStartDate(todayIso);
    setSelectedEndDate(todayIso);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onApply({
      startDate: todayIso,
      endDate: todayIso,
      label: "fillter",
      viewMode: "day",
    });
    onClose();
  };

  // Range Day Count
  const rangeDaysCount = useMemo(() => {
    const start = new Date(activeRange.start);
    const end = new Date(activeRange.end);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 1;
  }, [activeRange]);

  // Formatted Label Builder
  const handleApply = () => {
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    let label = `${selectedStartDate}`;

    if (selectedStartDate === selectedEndDate) {
      if (selectedStartDate === todayIso) {
        label = "วันนี้ (Today)";
      } else {
        label = `${start.getDate()} ${MONTH_NAMES_TH[start.getMonth()]}`;
      }
    } else {
      label = `${start.getDate()} ${MONTH_NAMES_TH[start.getMonth()]} – ${end.getDate()} ${MONTH_NAMES_TH[end.getMonth()]}`;
    }

    onApply({
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      label,
      viewMode: viewMode === "week" ? "week" : "day",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Subtle Transparent / Light Backdrop for Dismissal */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Floating Dropdown / Semi-Modal Card Container */}
      <div
        ref={modalRef}
        className={`fixed sm:absolute z-50 top-20 right-4 sm:right-6 md:right-8 max-w-[390px] sm:max-w-[440px] w-full max-h-[calc(100vh-5rem)] overflow-y-auto bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 select-none ${className}`}
      >
        {/* ─── 1. HEADER: MONTH & YEAR DIRECT SELECTORS WITH CHEVRONS (SWAPPED TO TOP) ─── */}
        <div className="flex items-center justify-between pt-0.5">
          {/* Month / Year with Chevrons and Quick Selectors */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-1.5 px-1">
              <div className="relative">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl pl-2.5 pr-6 py-1 text-sm font-extrabold text-slate-900 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)]"
                >
                  {MONTH_NAMES_EN.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[14px] text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Direct Year Selector */}
              <div className="relative">
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl pl-2.5 pr-6 py-1 text-sm font-bold text-slate-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)]"
                >
                  {[2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[14px] text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Mode helper text */}
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            {pickingStart ? "คลิกวันสิ้นสุด" : "ลากช่วงวันได้"}
          </span>
        </div>

        {/* ─── 2. PRESET PILLS (Auto-Flex Layout: 7 วัน / เดือนนี้ / ปีนี้) ─── */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset("last7")}
            className={`flex-1 min-w-[80px] py-1.5 px-3 rounded-full text-xs font-semibold text-center transition-all cursor-pointer border select-none ${
              activePreset === "last7"
                ? "bg-[var(--primary-container)] text-white border-[var(--primary-container)] shadow-2xs font-bold"
                : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            7 วัน
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset("thisMonth")}
            className={`flex-1 min-w-[80px] py-1.5 px-3 rounded-full text-xs font-semibold text-center transition-all cursor-pointer border select-none ${
              activePreset === "thisMonth"
                ? "bg-[var(--primary-container)] text-white border-[var(--primary-container)] shadow-2xs font-bold"
                : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            เดือนนี้
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset("thisYear")}
            className={`flex-1 min-w-[80px] py-1.5 px-3 rounded-full text-xs font-semibold text-center transition-all cursor-pointer border select-none ${
              activePreset === "thisYear"
                ? "bg-[var(--primary-container)] text-white border-[var(--primary-container)] shadow-2xs font-bold"
                : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            ปีนี้
          </button>
        </div>

        {/* ─── 3. DAYS OF THE WEEK HEADER ─── */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold pt-1">
          {DAY_LABELS.map((day, idx) => {
            const isHighlightedColumn = activeDayIndices.has(idx);
            return (
              <span
                key={day.short}
                className={`transition-colors uppercase tracking-wider text-[11px] ${
                  isHighlightedColumn
                    ? "text-[var(--primary-container)] font-black"
                    : "text-slate-400 font-medium"
                }`}
              >
                {day.short}
              </span>
            );
          })}
        </div>

        {/* ─── 4. COMPLETE CALENDAR MATRIX (CLICK-TO-MARK & DRAG SUPPORT) ─── */}
        <div className="grid grid-cols-7 gap-y-1.5">
          {calendarCells.map((cell, idx) => {
            const { day, monthOffset, isoDate, colIndex } = cell;

            const isInRange = isoDate >= activeRange.start && isoDate <= activeRange.end;
            const isStart = isoDate === activeRange.start;
            const isEnd = isoDate === activeRange.end;
            const isSingle = isStart && isEnd;
            const isMiddle = isInRange && !isStart && !isEnd;
            const isToday = isoDate === todayIso;
            const isOtherMonth = monthOffset !== 0;

            // Row edge checks for clean capsule borders
            const isRowStart = colIndex === 0;
            const isRowEnd = colIndex === 6;

            // Connected ribbon styling
            const getRangeClasses = () => {
              if (isSingle) {
                return "rounded-2xl border-2 border-[var(--primary-container)] text-[var(--primary-container)] bg-[var(--accent-bg)]/50 font-black shadow-xs z-20 scale-102";
              }
              if (isStart) {
                const rightRound = isRowEnd ? "rounded-r-2xl border-r-2" : "rounded-r-none border-r-0";
                return `rounded-l-2xl ${rightRound} border-2 border-[var(--primary-container)] bg-[var(--accent-bg)] text-[var(--primary-container)] font-black z-20`;
              }
              if (isEnd) {
                const leftRound = isRowStart ? "rounded-l-2xl border-l-2" : "rounded-l-none border-l-0";
                return `rounded-r-2xl ${leftRound} border-2 border-[var(--primary-container)] bg-[var(--accent-bg)] text-[var(--primary-container)] font-black z-20`;
              }
              if (isMiddle) {
                const leftRound = isRowStart ? "rounded-l-2xl border-l-2 border-l-[var(--primary-container)]/50" : "rounded-l-none border-l-0";
                const rightRound = isRowEnd ? "rounded-r-2xl border-r-2 border-r-[var(--primary-container)]/50" : "rounded-r-none border-r-0";
                return `${leftRound} ${rightRound} border-y-2 border-[var(--primary-container)]/40 bg-[var(--accent-bg)]/60 text-[var(--primary-container)] font-bold z-10`;
              }

              if (isOtherMonth) {
                return "rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-300 hover:text-slate-600 hover:bg-slate-100";
              }

              return "rounded-2xl border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300";
            };

            return (
              <div
                key={`cell-${isoDate}-${idx}`}
                onMouseDown={(e) => handleCellMouseDown(cell, e)}
                onMouseEnter={() => handleCellMouseEnter(cell)}
                onMouseUp={() => handleCellMouseUp(cell)}
                className={`relative h-10 sm:h-11 flex flex-col items-center justify-center transition-all cursor-pointer select-none ${getRangeClasses()}`}
                title={`วันที่ ${day} ${MONTH_NAMES_TH[new Date(isoDate).getMonth()]}`}
              >
                {/* Date Number */}
                <span className="text-xs sm:text-[13px] leading-none">{day}</span>

                {/* Subscriptions / Event Indicator Bullet Dot */}
                {isToday ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-container)] mt-1 shrink-0" />
                ) : !isOtherMonth && day % 3 === 0 ? (
                  <span className="w-1 h-1 rounded-full bg-slate-800 mt-1 shrink-0 opacity-50" />
                ) : (
                  <span className="w-1 h-1 mt-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* ─── 5. SUMMARY CALLOUT & ACTIONS (Auto-Flex Layout) ─── */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-slate-400 block font-medium">
              {pickingStart ? "กำลังเลือกช่วงวัน (คลิกหรือปล่อยวันสิ้นสุด):" : "ช่วงเวลาที่เลือก:"}
            </span>
            <span className="font-extrabold text-slate-900 text-xs">
              {activeRange.start === activeRange.end ? (
                activeRange.start
              ) : (
                <>
                  {activeRange.start} ถึง {activeRange.end}{" "}
                  <span className="text-[var(--primary-container)] font-bold">({rangeDaysCount} วัน)</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              ล้าง
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              ปิด
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-full bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              ตกลง
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
