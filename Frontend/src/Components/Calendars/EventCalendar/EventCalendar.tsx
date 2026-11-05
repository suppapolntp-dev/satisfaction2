"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { EventItem, EventCategory } from "@/Types/event";
import EventCard from "@/Components/Cards/EventCard";
import {
  useEventCalendar,
  UseEventCalendarProps,
  CALENDAR_WEEK_DAYS,
  CalendarViewMode,
  MINI_WEEKDAYS_TH,
  MONTH_NAMES,
} from "./useEventCalendar";

export interface EventCalendarProps extends UseEventCalendarProps {
  className?: string;
  isLoading?: boolean;
  /** Error message from the data layer; renders an error banner when set */
  errorMessage?: string | null;
  onRetry?: () => void;
  /** Call-to-action shown in the empty state */
  onCreateEvent?: () => void;
}

const CATEGORY_STYLES: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  CAMPAIGN: {
    label: "Campaign",
    badgeClass: "bg-amber-50 text-amber-950 border-amber-300/80 hover:bg-amber-100/90",
    dotClass: "bg-amber-500",
  },
  MAINTENANCE: {
    label: "Maintenance",
    badgeClass: "bg-rose-50 text-rose-950 border-rose-300/80 hover:bg-rose-100/90",
    dotClass: "bg-rose-500",
  },
  FIRMWARE: {
    label: "Firmware",
    badgeClass: "bg-blue-50 text-blue-950 border-blue-300/80 hover:bg-blue-100/90",
    dotClass: "bg-blue-500",
  },
  CALIBRATION: {
    label: "Calibration",
    badgeClass: "bg-purple-50 text-purple-950 border-purple-300/80 hover:bg-purple-100/90",
    dotClass: "bg-purple-500",
  },
  AUDIT: {
    label: "Audit",
    badgeClass: "bg-emerald-50 text-emerald-950 border-emerald-300/80 hover:bg-emerald-100/90",
    dotClass: "bg-emerald-500",
  },
};

const DEFAULT_CATEGORY_STYLE = {
  label: "Event",
  badgeClass: "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100",
  dotClass: "bg-slate-400",
};

// ─── FIREART CALENDAR BOOKING APP DESIGN SYSTEM TOKENS ───
// accent = 4px left bar (Material-style), bg = soft tint, text = AA-contrast title color
const FIREART_CATEGORY_STYLES: Record<
  string,
  { bg: string; accent: string; text: string; hover: string }
> = {
  CAMPAIGN: {
    bg: "bg-orange-50",
    accent: "border-l-orange-500",
    text: "text-orange-900",
    hover: "hover:bg-orange-100/90",
  },
  AUDIT: {
    bg: "bg-emerald-50",
    accent: "border-l-emerald-500",
    text: "text-emerald-900",
    hover: "hover:bg-emerald-100/90",
  },
  FIRMWARE: {
    bg: "bg-blue-50",
    accent: "border-l-blue-600",
    text: "text-blue-900",
    hover: "hover:bg-blue-100/90",
  },
  CALIBRATION: {
    bg: "bg-purple-50",
    accent: "border-l-purple-500",
    text: "text-purple-900",
    hover: "hover:bg-purple-100/90",
  },
  MAINTENANCE: {
    bg: "bg-slate-100",
    accent: "border-l-slate-500",
    text: "text-slate-900",
    hover: "hover:bg-slate-200/90",
  },
};

// Localised short weekday (e.g. "จ.") derived from the date — no hardcoded weekday list
const WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat("th-TH", { weekday: "short" });

// Shared keyboard-focus ring (WCAG 2.4.7) — outline never shifts layout
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]";
const FOCUS_RING_INSET =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--primary-container)]";

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 65; // 65px ต่อชั่วโมงในสเกลสัปดาห์ Fireart Grid

function parseTimeToMinutes(timeStr?: string, defaultMinutes = 540): number {
  if (!timeStr) return defaultMinutes;
  const parts = timeStr.split(":");
  if (parts.length < 2) return defaultMinutes;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return defaultMinutes;
  return h * 60 + m;
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

// ponytail: greedy lane assignment for overlapping events in a day column; upgrade to interval-graph coloring if >4 concurrent lanes need dynamic cascade
function layoutDayEvents(events: EventItem[]) {
  const sorted = [...events]
    .map((event) => {
      const startMin = parseTimeToMinutes(event.startTime, 540);
      const endMin = parseTimeToMinutes(event.endTime, startMin + 60);
      const durationMin = Math.max(endMin - startMin, 45);
      return { event, startMin, endMin: startMin + durationMin, durationMin };
    })
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  const clusters: (typeof sorted)[] = [];
  let currentCluster: typeof sorted = [];
  let clusterEnd = -1;

  for (const item of sorted) {
    if (currentCluster.length > 0 && item.startMin >= clusterEnd) {
      clusters.push(currentCluster);
      currentCluster = [];
      clusterEnd = -1;
    }
    currentCluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.endMin);
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  return clusters.flatMap((cluster) => {
    const laneEnds: number[] = [];
    const placed = cluster.map((item, orderIndex) => {
      let laneIndex = laneEnds.findIndex((end) => end <= item.startMin);
      if (laneIndex === -1) {
        laneIndex = laneEnds.length;
        laneEnds.push(item.endMin);
      } else {
        laneEnds[laneIndex] = item.endMin;
      }
      return { ...item, laneIndex, orderIndex };
    });
    const totalLanes = Math.max(laneEnds.length, 1);
    const hasTightStartCollision = cluster.some((a, i) =>
      cluster.some((b, j) => i !== j && Math.abs(a.startMin - b.startMin) < 45)
    );
    return placed.map((item) => ({
      ...item,
      totalLanes,
      hasTightStartCollision,
    }));
  });
}

export default function EventCalendar({
  events = [],
  initialDate,
  onSelectDate,
  onSelectEvent,
  className = "",
  isLoading = false,
  errorMessage = null,
  onRetry,
  onCreateEvent,
}: EventCalendarProps) {
  const {
    currentDate,
    currentDateStr,
    isCurrentDateToday,
    currentDayInfo,
    viewMode,
    setViewMode,
    miniMonthYearThLabel,
    miniCalendarCells,
    handlePrevMiniMonth,
    handleNextMiniMonth,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    monthWeeks,
    weekCalendarDays,
    weekRangeLabel,
    dayEvents,
    monthYearLabel,
    handlePrev,
    handleNext,
    handleToday,
    selectDate,
    currentMinutes,
    currentTimeFormatted,
  } = useEventCalendar({
    events,
    initialDate,
    onSelectDate,
    onSelectEvent,
  });

  const timelineRef = useRef<HTMLDivElement>(null);

  // Hover state for current time line tooltip
  const [isTimeLineHovered, setIsTimeLineHovered] = useState(false);
  const [timeLineTooltipX, setTimeLineTooltipX] = useState<number | null>(null);

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    // Keep tooltip comfortably inside boundaries (min 60px, max rect.width - 60px)
    const clampedX = Math.max(60, Math.min(rawX, rect.width - 60));
    setTimeLineTooltipX(clampedX);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Pass clicks through seamlessly to any event card or cell underneath the line hitbox
    const lineEl = e.currentTarget;
    lineEl.style.pointerEvents = "none";
    const underlyingEl = document.elementFromPoint(e.clientX, e.clientY);
    lineEl.style.pointerEvents = "";
    if (underlyingEl && underlyingEl !== lineEl) {
      (underlyingEl as HTMLElement).click();
    }
  };

  // Auto-scroll timeline to daytime (~8 AM) in Week view
  useEffect(() => {
    if (viewMode === "Week" && timelineRef.current) {
      timelineRef.current.scrollTop = 8 * HOUR_HEIGHT - 20; // 8:00 AM offset
    }
  }, [viewMode]);

  const getCategoryStyle = (category?: string) => {
    if (!category) return DEFAULT_CATEGORY_STYLE;
    return CATEGORY_STYLES[category.toUpperCase()] || DEFAULT_CATEGORY_STYLE;
  };

  const showSidebar = viewMode === "Week";

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden flex flex-col ${className}`}
    >
      {/* ─── 1. CALENDAR TOOLBAR (Fireart Schedule Control Bar Style) ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        {/* Navigation & Date Display (Fireart Tear-Sheet Badge) */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            {/* Tear-sheet Calendar Icon */}
            <div className="w-10 h-11 rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col shrink-0 select-none">
              <div className="bg-red-600 text-white text-[10px] font-bold tracking-wider text-center py-0.5 uppercase">
                {MONTH_NAMES[currentDate.getMonth()].slice(0, 3)}
              </div>
              <div className="bg-white flex-1 flex items-center justify-center font-bold text-slate-900 text-sm leading-none">
                {currentDate.getDate()}
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-snug">
                {viewMode === "Week" ? weekRangeLabel : monthYearLabel}
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-none mt-0.5">
                {viewMode === "Week" ? "ตารางนัดหมายและกิจกรรมประจำสัปดาห์" : "ปฏิทินกิจกรรมประจำเดือน"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToday}
              className={`px-4 min-h-11 sm:min-h-10 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 shadow-2xs cursor-pointer transition-all duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS_RING}`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Period"
              className={`inline-flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200/80 cursor-pointer transition-all duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS_RING}`}
            >
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Period"
              className={`inline-flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200/80 cursor-pointer transition-all duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS_RING}`}
            >
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* View Mode Switcher: Week | Month */}
        <div role="group" aria-label="โหมดมุมมองปฏิทิน" className="inline-flex rounded-full bg-slate-200/60 p-1 border border-slate-200/80 w-full sm:w-auto justify-center">
          {(["Week", "Month"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              aria-pressed={viewMode === mode}
              className={`flex-1 sm:flex-none px-4 min-h-10 sm:min-h-8 rounded-full text-xs font-semibold transition-colors duration-200 motion-reduce:transition-none cursor-pointer ${FOCUS_RING} ${
                viewMode === mode
                  ? "bg-white text-slate-950 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mode === "Week" ? "Weekly View" : "Monthly View"}
            </button>
          ))}
        </div>
      </div>

      {/* ─── LOADING INDICATOR ─── */}
      {isLoading && (
        <div role="status" aria-live="polite" className="p-4 sm:p-5 grid gap-3 min-h-[640px] content-start">
          <span className="sr-only">กำลังโหลดกิจกรรม...</span>
          {Array.from({ length: 6 }, (_, skeletonIndex) => (
            <div
              key={skeletonIndex}
              aria-hidden="true"
              className="h-16 rounded-2xl bg-slate-100 animate-pulse motion-reduce:animate-none"
            />
          ))}
        </div>
      )}

      {/* ─── ERROR STATE ─── */}
      {!isLoading && errorMessage && (
        <div
          role="alert"
          className="m-4 sm:mx-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <p className="text-sm font-medium">{errorMessage}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`px-4 min-h-11 sm:min-h-10 rounded-full bg-white border border-red-200 text-xs font-semibold text-red-800 hover:bg-red-100 cursor-pointer transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`}
            >
              ลองใหม่อีกครั้ง
            </button>
          )}
        </div>
      )}

      {/* ─── EMPTY STATE ─── */}
      {!isLoading && !errorMessage && (events?.length ?? 0) === 0 && (
        <div
          role="status"
          className="m-4 sm:mx-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <p className="text-sm font-medium">ยังไม่มีกิจกรรมในปฏิทิน</p>
          {onCreateEvent && (
            <button
              type="button"
              onClick={onCreateEvent}
              className={`px-4 min-h-11 sm:min-h-10 rounded-full bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold cursor-pointer transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`}
            >
              เพิ่มกิจกรรมแรก
            </button>
          )}
        </div>
      )}

      {/* ─── 2. CALENDAR LAYOUT (SIDEBAR FOR DAY & WEEK VIEWS) ─── */}
      {!isLoading && (
        <div
          className={`flex flex-col ${
            showSidebar
              ? "lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80"
              : ""
          } flex-1 min-h-[640px] bg-white`}
        >
            {/* ─── LEFT SIDEBAR: MINI CALENDAR & SEARCH (ONLY FOR DAY & WEEK) ─── */}
            {showSidebar && (
              <aside className="w-full lg:w-64 xl:w-72 p-4 sm:p-5 flex flex-col gap-4 bg-white shrink-0 select-none">
                {/* 1. Mini Datepicker Header & Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-sm font-bold text-slate-800">
                      {miniMonthYearThLabel}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={handlePrevMiniMonth}
                        className={`inline-flex items-center justify-center w-10 h-10 lg:w-8 lg:h-8 rounded-full hover:bg-slate-100 text-slate-600 transition-colors motion-reduce:transition-none cursor-pointer ${FOCUS_RING}`}
                        aria-label="Previous Month"
                      >
                        <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMiniMonth}
                        className={`inline-flex items-center justify-center w-10 h-10 lg:w-8 lg:h-8 rounded-full hover:bg-slate-100 text-slate-600 transition-colors motion-reduce:transition-none cursor-pointer ${FOCUS_RING}`}
                        aria-label="Next Month"
                      >
                        <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Weekday Abbreviations (อา - ส) */}
                  <div className="grid grid-cols-7 text-center mb-1 text-[11px] font-semibold text-slate-500">
                    {MINI_WEEKDAYS_TH.map((dayName, idx) => (
                      <div key={idx} className="h-6 flex items-center justify-center">
                        {dayName}
                      </div>
                    ))}
                  </div>

                  {/* Days Matrix */}
                  <div className="grid grid-cols-7 text-center gap-y-1 text-xs">
                    {miniCalendarCells.map((cell, idx) => {
                      const isSel = cell.isSelected;
                      const isTod = cell.isToday;
                      let cellBtnStyle = "text-slate-700 hover:bg-slate-100";

                      if (!cell.isCurrentMonth) {
                        cellBtnStyle = "text-slate-500 hover:bg-slate-100";
                      }
                      if (isTod && !isSel) {
                        cellBtnStyle = "bg-[var(--primary-container)] text-white font-bold";
                      }
                      if (isSel) {
                        cellBtnStyle = "bg-[var(--accent-bg)] text-[var(--primary-container)] ring-2 ring-inset ring-[var(--primary-container)] font-bold";
                      }

                      return (
                        <div key={idx} className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => selectDate(cell.dateString)}
                            aria-label={cell.dateString}
                            aria-pressed={cell.isSelected}
                            aria-current={cell.isToday ? "date" : undefined}
                            className={`w-10 h-10 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs transition-colors motion-reduce:transition-none cursor-pointer ${FOCUS_RING} ${cellBtnStyle}`}
                          >
                            {cell.dayNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Search Pill ("ค้นหาผู้คน" -> "ค้นหากิจกรรม") */}
                <div>
                  <div className="flex items-center gap-2.5 px-4 min-h-11 lg:min-h-10 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-600 transition-colors motion-reduce:transition-none border border-transparent focus-within:border-[var(--primary-container)] focus-within:bg-white">
                    <svg aria-hidden="true" className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหากิจกรรม หรือ สาขา..."
                      aria-label="ค้นหากิจกรรม หรือ สาขา"
                      className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder-slate-500 font-normal"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="ล้างคำค้นหา"
                        className={`inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-full text-slate-500 hover:text-slate-800 cursor-pointer ${FOCUS_RING}`}
                      >
                        <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </aside>
            )}

            {/* ─── RIGHT CANVAS: Main Calendar Views ─── */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* ─── MONTH VIEW ─── */}
            {viewMode === "Month" && (
              <div className="flex-1 flex flex-col overflow-x-auto">
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-2.5 text-xs font-semibold text-slate-600 min-w-[680px]">
                {CALENDAR_WEEK_DAYS.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="flex flex-col divide-y divide-slate-100 text-xs min-w-[680px]">
                {monthWeeks.map((week) => (
                  <div key={week.cells[0].dateString} className="relative">
                    {/* Layer 1: day cells (date number, click to select) */}
                    <div className="absolute inset-0 grid grid-cols-7 divide-x divide-slate-100">
                      {week.cells.map((cell) => (
                        <div
                          key={cell.dateString}
                          onClick={() => selectDate(cell.dateString)}
                          className={`p-2 transition-colors motion-reduce:transition-none cursor-pointer hover:bg-slate-50/60 ${
                            cell.isCurrentMonth ? "bg-white" : "bg-slate-50/30 text-slate-500"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectDate(cell.dateString);
                            }}
                            aria-label={cell.dateString}
                            aria-current={cell.isToday ? "date" : undefined}
                            className={`inline-flex items-center justify-center w-8 h-8 -m-1 rounded-full text-xs font-semibold cursor-pointer ${FOCUS_RING} ${
                              cell.isToday
                                ? "bg-[var(--primary-container)] text-white font-bold"
                                : cell.isCurrentMonth
                                ? "text-slate-800 hover:bg-slate-100"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {cell.dayNumber}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Layer 2: event cards spanning day columns (pointer-events pass through gaps) */}
                    <div className="relative grid grid-cols-7 gap-y-2 px-1 pt-11 pb-2 min-h-[136px] pointer-events-none">
                      {week.segments.map((segment) => (
                        <div
                          key={`${segment.event.eventId}-${segment.startColumn}`}
                          className="pointer-events-auto min-w-0 px-1"
                          style={{
                            gridColumn: `${segment.startColumn} / span ${segment.columnSpan}`,
                            gridRow: segment.laneIndex + 1,
                          }}
                        >
                          <EventCard
                            event={segment.event}
                            variant={segment.isMultiDay ? "detailed" : "compact"}
                            onClick={onSelectEvent}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── WEEK VIEW (Fireart Calendar Booking App 7-Day Time Grid) ─── */}
          {viewMode === "Week" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Sticky Weekdays Header (7 Day Columns) */}
              <div className="flex border-b border-slate-200 bg-white sticky top-0 z-20">
                {/* Time Axis Gutter Header */}
                <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200/80 py-3 pr-3 text-right flex items-center justify-end bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase select-none">GMT+7</span>
                </div>

                {/* 7 Day Column Headers */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 min-w-[700px]">
                  {weekCalendarDays.map((day) => {
                    const isToday = day.isToday;
                    const isSelected = day.dateString === currentDateStr;
                    return (
                      <button
                        type="button"
                        key={day.dateString}
                        onClick={() => selectDate(day.dateString)}
                        aria-current={isToday ? "date" : undefined}
                        aria-pressed={isSelected}
                        className={`group py-2 px-2 min-h-[72px] flex flex-col items-center justify-center gap-1 cursor-pointer ${FOCUS_RING_INSET}`}
                      >
                        <span
                          className={`text-xs font-medium ${
                            isToday ? "text-[var(--primary-container)]" : "text-slate-600"
                          }`}
                        >
                          {WEEKDAY_SHORT_FORMATTER.format(day.date)}
                        </span>
                        <span
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold tabular-nums transition-colors duration-200 motion-reduce:transition-none ${
                            isToday
                              ? "bg-[var(--primary-container)] text-white"
                              : isSelected
                              ? "bg-[var(--accent-bg)] text-[var(--primary-container)] ring-2 ring-inset ring-[var(--primary-container)]"
                              : "text-slate-900 group-hover:bg-slate-100"
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Time Grid Canvas */}
              <div
                ref={timelineRef}
                className="relative flex-1 overflow-y-auto max-h-[660px] bg-white [scrollbar-width:thin]"
              >
                <div className="flex relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                  {/* Left Gutter: Hour Axis (10 AM, 11 AM, 12 PM...) */}
                  <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200/80 select-none relative bg-slate-50/20">
                    {HOURS_24.map((hour) => (
                      <div
                        key={hour}
                        className="absolute right-3 -translate-y-1/2 text-[11px] font-medium text-slate-500 select-none pointer-events-none"
                        style={{ top: `${hour * HOUR_HEIGHT}px` }}
                      >
                        {hour !== 0 && formatHourLabel(hour)}
                      </div>
                    ))}
                  </div>

                  {/* 7 Days Columns Grid */}
                  <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 min-w-[700px] relative">
                    {/* Live Current Time Line running across all 7 days with interactive hover tooltip */}
                    <div
                      role="region"
                      aria-label={`เส้นระบุเวลาปัจจุบัน: ${currentTimeFormatted}`}
                      tabIndex={0}
                      onClick={handleTimelineClick}
                      onMouseEnter={(e) => {
                        setIsTimeLineHovered(true);
                        handleTimelineMouseMove(e);
                      }}
                      onMouseMove={handleTimelineMouseMove}
                      onMouseLeave={() => setIsTimeLineHovered(false)}
                      onFocus={() => {
                        setIsTimeLineHovered(true);
                        setTimeLineTooltipX(80);
                      }}
                      onBlur={() => setIsTimeLineHovered(false)}
                      className="absolute left-0 right-0 z-20 group cursor-pointer flex items-center h-4 -mt-2 transition-all outline-none"
                      style={{ top: `${(currentMinutes / 60) * HOUR_HEIGHT}px` }}
                      title={`เวลาปัจจุบัน ${currentTimeFormatted}`}
                    >
                      {/* Left Dot with hover scale & accent */}
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-950 -ml-1.5 shadow-xs group-hover:scale-125 group-hover:bg-[var(--primary-container)] transition-all shrink-0" />

                      {/* Horizontal Line with subtle accent on hover */}
                      <div className="h-[2px] bg-slate-950 group-hover:bg-[var(--primary-container)] group-hover:h-[3px] flex-1 transition-all" />

                      {/* Floating Tooltip Pill showing live current time */}
                      {isTimeLineHovered && (
                        <div
                          role="tooltip"
                          className="absolute -top-9 -translate-x-1/2 pointer-events-none z-30 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg tabular-nums whitespace-nowrap flex items-center gap-1.5 transition-transform animate-in fade-in zoom-in-95"
                          style={{
                            left: `${timeLineTooltipX ?? 60}px`,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>เวลาปัจจุบัน {currentTimeFormatted}</span>
                          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rotate-45" />
                        </div>
                      )}
                    </div>

                    {weekCalendarDays.map((day) => {
                      return (
                        <div key={day.dateString} className="relative h-full">
                          {/* Hourly Horizontal Rules for each column */}
                          {HOURS_24.map((hour) => (
                            <div
                              key={hour}
                              className="absolute left-0 right-0 border-t border-slate-100 pointer-events-none"
                              style={{ top: `${hour * HOUR_HEIGHT}px` }}
                            />
                          ))}

                          {/* Events placed inside this Day Column */}
                          {layoutDayEvents(day.events).map(
                            ({
                              event,
                              startMin,
                              durationMin,
                              laneIndex,
                              orderIndex,
                              totalLanes,
                              hasTightStartCollision,
                            }) => {
                              const style =
                                FIREART_CATEGORY_STYLES[event.eventCategory.toUpperCase()] ||
                                FIREART_CATEGORY_STYLES.MAINTENANCE;

                              // When overlapping events start >=45m apart, cascade lanes (88-92% width)
                              // so titles, times, and brand pills never squish into 45px slivers.
                              const isCascaded = totalLanes > 1 && !hasTightStartCollision;
                              const stepPct = isCascaded
                                ? Math.min(12, Math.floor(36 / Math.max(totalLanes - 1, 1)))
                                : 100 / totalLanes;
                              const leftPct = isCascaded ? laneIndex * stepPct : laneIndex * (100 / totalLanes);
                              const widthPct = isCascaded
                                ? laneIndex === 0 && totalLanes > 1
                                  ? 92
                                  : 100 - leftPct
                                : 100 / totalLanes;

                              return (
                                <button
                                  type="button"
                                  key={event.eventId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectEvent) onSelectEvent(event);
                                  }}
                                  aria-label={`${event.eventName} ${event.startTime} - ${event.endTime}`}
                                  style={{
                                    top: `${(startMin / 60) * HOUR_HEIGHT}px`,
                                    height: `${Math.max((durationMin / 60) * HOUR_HEIGHT, 44)}px`,
                                    left: `calc(${leftPct}% + 2px)`,
                                    width: `calc(${widthPct}% - 4px)`,
                                    zIndex: 10 + orderIndex,
                                  }}
                                  className={`absolute rounded-xl border-l-4 p-2 text-left flex flex-col justify-start items-start gap-1 shadow-xs ring-1 ${
                                    totalLanes > 1 ? "ring-white/90 shadow-sm" : "ring-black/5"
                                  } transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none hover:shadow-md hover:!z-40 focus-visible:!z-40 cursor-pointer overflow-hidden ${FOCUS_RING_INSET} ${style.bg} ${style.accent} ${style.hover}`}
                                  title={`${event.eventName} (${event.startTime} - ${event.endTime})${
                                    event.brandScope ? ` • ${event.brandScope}` : ""
                                  }`}
                                >
                                  {/* 1. Compact Time Range Header (never wraps) */}
                                  <span className="block w-full text-[11px] font-semibold text-slate-600 leading-none tabular-nums whitespace-nowrap truncate">
                                    {event.startTime}–{event.endTime}
                                  </span>

                                  {/* 2. Event Title (top-aligned right under time) */}
                                  <span
                                    className={`block w-full text-xs font-bold leading-snug break-words ${
                                      durationMin >= 120 ? "line-clamp-3" : "line-clamp-2"
                                    } ${style.text}`}
                                  >
                                    {event.eventName}
                                  </span>

                                  {/* 3. Brand Pill Badge (top-aligned, no bottom gap or clipping) */}
                                  {durationMin >= 60 && event.brandScope && (
                                    <span className="mt-0.5 inline-flex items-center max-w-full min-w-0 rounded-md bg-white/85 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-black/5 shadow-2xs">
                                      <span className="min-w-0 whitespace-nowrap truncate">
                                        {event.brandScope}
                                      </span>
                                    </span>
                                  )}
                                </button>
                              );
                            }
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
