"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { EventItem, EventCategory } from "@/Types/event";
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
const FIREART_CATEGORY_STYLES: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  CAMPAIGN: {
    bg: "bg-[#FFF7ED]",
    border: "border-[#F97316]/50",
    text: "text-[#C2410C]",
    dot: "bg-[#F97316]",
  },
  AUDIT: {
    bg: "bg-[#F0FDF4]",
    border: "border-[#10B981]/50",
    text: "text-[#047857]",
    dot: "bg-[#10B981]",
  },
  FIRMWARE: {
    bg: "bg-[#EEF2FF]",
    border: "border-[#6366F1]/50",
    text: "text-[#4338CA]",
    dot: "bg-[#6366F1]",
  },
  MAINTENANCE: {
    bg: "bg-[#F8FAFC]",
    border: "border-[#1F2937]/30",
    text: "text-[#0F0F0E]",
    dot: "bg-[#334155]",
  },
};

const WEEKDAY_NAMES_EN = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

export default function EventCalendar({
  events = [],
  initialDate,
  onSelectDate,
  onSelectEvent,
  className = "",
  isLoading = false,
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
    monthCalendarCells,
    weekCalendarDays,
    weekRangeLabel,
    dayEvents,
    monthYearLabel,
    handlePrev,
    handleNext,
    handleToday,
    selectDate,
  } = useEventCalendar({
    events,
    initialDate,
    onSelectDate,
    onSelectEvent,
  });

  const timelineRef = useRef<HTMLDivElement>(null);

  // Live minute marker for current time
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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
              <div className="bg-[#EA3323] text-white text-[9px] font-bold tracking-wider text-center py-0.5 uppercase">
                {MONTH_NAMES[currentDate.getMonth()].slice(0, 3)}
              </div>
              <div className="bg-white flex-1 flex items-center justify-center font-bold text-slate-900 text-sm leading-none">
                {currentDate.getDate()}
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F0F0E] tracking-tight leading-snug">
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
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 shadow-2xs cursor-pointer transition-all active:scale-95"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Period"
              className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200/80 cursor-pointer transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Period"
              className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200/80 cursor-pointer transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* View Mode Switcher: Week | Month */}
        <div className="inline-flex rounded-full bg-slate-200/60 p-1 border border-slate-200/80 w-full sm:w-auto justify-center">
          {(["Week", "Month"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === mode
                  ? "bg-white text-[#0F0F0E] shadow-xs font-bold"
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
        <div className="p-8 text-center text-xs text-slate-400">
          Loading calendar events...
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
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        aria-label="Previous Month"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMiniMonth}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        aria-label="Next Month"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                        cellBtnStyle = "text-slate-400 hover:bg-slate-50";
                      }
                      if (isTod && !isSel) {
                        cellBtnStyle = "bg-[#0b57d0] text-white font-bold";
                      }
                      if (isSel) {
                        cellBtnStyle = "bg-[#c2e7ff] text-[#001d35] font-bold shadow-xs";
                      }

                      return (
                        <div key={idx} className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => selectDate(cell.dateString)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] transition-all cursor-pointer ${cellBtnStyle}`}
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
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#edf2fa] hover:bg-[#e4ebf7] text-slate-600 transition-colors border border-transparent focus-within:border-blue-400 focus-within:bg-white">
                    <svg className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหากิจกรรม หรือ สาขา..."
                      className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder-slate-400 font-normal"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      >
                        ×
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

              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs min-w-[680px]">
                {monthCalendarCells.map((cell, idx) => (
                  <div
                    key={`${cell.dateString}-${idx}`}
                    onClick={() => selectDate(cell.dateString)}
                    className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors cursor-pointer hover:bg-slate-50/60 ${
                      cell.isCurrentMonth ? "bg-white" : "bg-slate-50/30 text-slate-400"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold ${
                          cell.isToday
                            ? "bg-[var(--primary-container)] text-white font-bold"
                            : cell.isCurrentMonth
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {cell.events.length > 0 && (
                        <span className="text-[10px] font-medium text-slate-400">
                          {cell.events.length} {cell.events.length === 1 ? "event" : "events"}
                        </span>
                      )}
                    </div>

                    {/* Events chip list */}
                    <div className="space-y-1 flex-1 overflow-y-auto max-h-[70px] [scrollbar-width:none]">
                      {cell.events.map((event) => {
                        const style = getCategoryStyle(event.eventCategory);
                        return (
                          <div
                            key={event.eventId}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectEvent) onSelectEvent(event);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[11px] border font-medium truncate flex items-center gap-1.5 transition-all ${style.badgeClass}`}
                            title={`${event.eventName} (${event.startTime || ""}-${event.endTime || ""})`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotClass}`} />
                            <span className="truncate">{event.eventName}</span>
                          </div>
                        );
                      })}
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase select-none">GMT+7</span>
                </div>

                {/* 7 Day Column Headers */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 min-w-[700px]">
                  {weekCalendarDays.map((day, idx) => {
                    const isToday = day.isToday;
                    return (
                      <div
                        key={day.dateString}
                        onClick={() => selectDate(day.dateString)}
                        className={`py-3 px-2 sm:px-3 flex flex-col items-center justify-center transition-colors cursor-pointer hover:bg-slate-50/80 ${
                          isToday ? "bg-slate-50/60" : ""
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            isToday ? "text-[#0F0F0E] font-bold" : "text-slate-500"
                          }`}
                        >
                          {WEEKDAY_NAMES_EN[idx]}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isToday
                                ? "bg-[#0F0F0E] text-white shadow-xs"
                                : "text-slate-800"
                            }`}
                          >
                            {day.dayNumber}
                          </span>
                        </div>
                      </div>
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
                        className="absolute right-3 -translate-y-1/2 text-[11px] font-medium text-slate-400 select-none pointer-events-none"
                        style={{ top: `${hour * HOUR_HEIGHT}px` }}
                      >
                        {hour !== 0 && formatHourLabel(hour)}
                      </div>
                    ))}
                  </div>

                  {/* 7 Days Columns Grid */}
                  <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 min-w-[700px] relative">
                    {/* Live Current Time Line running across all 7 days */}
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                      style={{ top: `${(currentMinutes / 60) * HOUR_HEIGHT}px` }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0F0F0E] -ml-1.5 shadow-xs" />
                      <div className="h-[2px] bg-[#0F0F0E] flex-1" />
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
                          {day.events.map((event) => {
                            const startMin = parseTimeToMinutes(event.startTime, 540);
                            const endMin = parseTimeToMinutes(event.endTime, startMin + 60);
                            const durationMin = Math.max(endMin - startMin, 45);
                            const style =
                              FIREART_CATEGORY_STYLES[event.eventCategory.toUpperCase()] ||
                              FIREART_CATEGORY_STYLES.MAINTENANCE;

                            return (
                              <div
                                key={event.eventId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onSelectEvent) onSelectEvent(event);
                                }}
                                style={{
                                  top: `${(startMin / 60) * HOUR_HEIGHT}px`,
                                  height: `${Math.max((durationMin / 60) * HOUR_HEIGHT, 44)}px`,
                                }}
                                className={`absolute z-10 left-1 right-1 rounded-xl border p-2 text-xs flex flex-col justify-between shadow-2xs transition-all hover:shadow-md hover:scale-[1.01] hover:z-30 cursor-pointer overflow-hidden ${style.bg} ${style.border}`}
                                title={`${event.eventName} (${event.startTime} - ${event.endTime})`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                                    <h4 className={`font-bold text-[11px] sm:text-xs truncate ${style.text}`}>
                                      {event.eventName}
                                    </h4>
                                  </div>
                                  <p className="text-[10px] font-medium opacity-80 mt-0.5 truncate">
                                    {event.startTime} - {event.endTime}
                                  </p>
                                </div>

                                {durationMin >= 60 && (
                                  <div className="flex items-center justify-between text-[9px] pt-1 border-t border-black/5 mt-1">
                                    <span className="font-semibold truncate opacity-85">
                                      {event.brandScope}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
