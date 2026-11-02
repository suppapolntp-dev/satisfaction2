"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { EventItem, EventCategory } from "@/Types/event";
import {
  useEventCalendar,
  UseEventCalendarProps,
  CALENDAR_WEEK_DAYS,
  CalendarViewMode,
  MINI_WEEKDAYS_TH,
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

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // 60px ต่อชั่วโมง (1 นาที = 1px)
const UNIFORM_CARD_HEIGHT = 270; // ขนาดเดียวเท่ากันทุกการ์ด (Uniform Fixed Height)

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

  // Auto-scroll timeline to daytime (~8 AM) when switching into Day view
  useEffect(() => {
    if (viewMode === "Day" && timelineRef.current) {
      timelineRef.current.scrollTop = 8 * HOUR_HEIGHT - 30; // 8:00 AM offset
    }
  }, [viewMode, currentDateStr]);

  const getCategoryStyle = (category?: string) => {
    if (!category) return DEFAULT_CATEGORY_STYLE;
    return CATEGORY_STYLES[category.toUpperCase()] || DEFAULT_CATEGORY_STYLE;
  };

  // แถว/คอลัมน์ประจำแบรนด์สำหรับแสดงกิจกรรมแยกเลน (ตีเส้นแถวแบรนด์)
  const brandLanes = useMemo(() => {
    const fromEvents = dayEvents.map((e) => e.brandScope).filter(Boolean);
    const defaults = ["Mister Donut", "The Coffee Club", "Swensen's"];
    return Array.from(new Set([...defaults, ...fromEvents]));
  }, [dayEvents]);

  // คำนวณตำแหน่งและจัดการการซ้อนทับของอีเวนต์ใน Day View (Google Calendar Style)
  const positionedDayEvents = useMemo(() => {
    if (!dayEvents || dayEvents.length === 0) return [];

    const parsed = dayEvents.map((evt) => {
      const startMin = parseTimeToMinutes(evt.startTime, 540);
      let endMin = parseTimeToMinutes(evt.endTime, startMin + 60);
      if (endMin <= startMin) endMin = startMin + 60;
      return {
        event: evt,
        startMin,
        endMin,
        duration: Math.max(endMin - startMin, 35),
        colIndex: 0,
        totalCols: 1,
      };
    });

    parsed.sort((a, b) => a.startMin - b.startMin);

    for (let i = 0; i < parsed.length; i++) {
      const group = [parsed[i]];
      for (let j = 0; j < parsed.length; j++) {
        if (i !== j) {
          if (parsed[i].startMin < parsed[j].endMin && parsed[i].endMin > parsed[j].startMin) {
            group.push(parsed[j]);
          }
        }
      }
      const totalCols = group.length;
      group.sort(
        (a, b) => a.startMin - b.startMin || a.event.eventId.localeCompare(b.event.eventId)
      );
      group.forEach((item, idx) => {
        item.colIndex = Math.max(item.colIndex, idx);
        item.totalCols = Math.max(item.totalCols, totalCols);
      });
    }

    return parsed;
  }, [dayEvents]);

  const showSidebar = viewMode === "Day" || viewMode === "Week";

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden flex flex-col ${className}`}
    >
      {/* ─── 1. CALENDAR TOOLBAR ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        {/* Navigation & Current Month/Year */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {monthYearLabel}
            </h2>
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

        {/* View Mode Switcher */}
        <div className="inline-flex rounded-full bg-slate-200/60 p-1 border border-slate-200/80 w-full sm:w-auto justify-center">
          {(["Month", "Week", "Day"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === mode
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mode}
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

          {/* ─── WEEK VIEW ─── */}
          {viewMode === "Week" && (
            <div className="flex-1 flex flex-col overflow-x-auto">
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 text-center py-2.5 text-xs font-semibold text-slate-600 min-w-[700px]">
                {weekCalendarDays.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span>{CALENDAR_WEEK_DAYS[idx]}</span>
                    <span
                      className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] mt-0.5 font-semibold ${
                        day.isToday
                          ? "bg-[var(--primary-container)] text-white font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 divide-x divide-slate-100 min-w-[700px] min-h-[420px]">
                {weekCalendarDays.map((day, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectDate(day.dateString)}
                    className="p-2 space-y-1.5 cursor-pointer hover:bg-slate-50/60 transition-colors"
                  >
                    {day.events.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-300 select-none py-12">
                        -
                      </div>
                    ) : (
                      day.events.map((event) => {
                        const style = getCategoryStyle(event.eventCategory);
                        return (
                          <div
                            key={event.eventId}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectEvent) onSelectEvent(event);
                            }}
                            className={`p-2 rounded-xl border text-xs font-medium space-y-1 ${style.badgeClass}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                              <span className="font-semibold truncate">{event.eventName}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex justify-between">
                              <span>{event.startTime || "All-day"}</span>
                              <span className="truncate max-w-[80px]">{event.brandScope || ""}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── DAY VIEW (Google Calendar Multi-Brand Timeline Grid Layout) ─── */}
          {viewMode === "Day" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Day View Sticky Header */}
              <div className="border-b border-slate-200 bg-white sticky top-0 z-20">
                {/* 1. Date Information Row */}
                <div className="flex items-center justify-between py-2.5 px-4 sm:px-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {currentDayInfo.dayOfWeekThShort || currentDayInfo.dayOfWeekEn}
                    </span>
                    <div
                      className={`text-2xl sm:text-3xl font-bold flex items-center justify-center leading-none ${
                        currentDayInfo.isToday
                          ? "w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0b57d0] text-white shadow-xs"
                          : "text-[#1f1f1f]"
                      }`}
                    >
                      {currentDayInfo.dayNumber}
                    </div>
                    <div className="hidden sm:block pl-3 border-l border-slate-200 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{currentDayInfo.dayOfWeekThFull}</span>
                      <span className="mx-2 text-slate-300">&bull;</span>
                      <span>
                        {dayEvents.length === 0
                          ? "ไม่มีกิจกรรมในวันนี้"
                          : `${dayEvents.length} กิจกรรมตามแถวแบรนด์`}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400">
                    ตารางกิจกรรมแบ่งตามแบรนด์
                  </span>
                </div>

                {/* 2. Brand Column Track Headers (ตีเส้นแถวหัวแบรนด์) */}
                <div className="flex border-t border-slate-200/80 bg-slate-50/70 overflow-x-auto [scrollbar-width:none]">
                  <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200/80 py-2 pr-3 text-right">
                    <span className="text-[10px] font-bold text-slate-400 select-none">GMT+7</span>
                  </div>
                  <div className="flex-1 flex divide-x divide-slate-200/80 min-w-[750px]">
                    {brandLanes.map((brandName) => {
                      const count = dayEvents.filter((e) => e.brandScope === brandName).length;
                      return (
                        <div
                          key={brandName}
                          className="flex-1 min-w-[250px] max-w-[320px] px-3.5 py-2 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {brandName}
                            </span>
                          </div>
                          {count > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                              {count} งาน
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Day View Timeline Scroll Area */}
              <div
                ref={timelineRef}
                className="relative flex-1 overflow-y-auto max-h-[640px] bg-white [scrollbar-width:thin]"
              >
                <div className="flex relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                  {/* Left Gutter: Hour Axis */}
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

                  {/* Multi-Brand Column Lanes Container (ตีเส้นแถวคอลัมน์แนวตั้ง divide-x) */}
                  <div className="flex-1 flex divide-x divide-slate-200/80 relative min-w-[750px] overflow-x-auto">
                    {/* Live Current Time Line running across all brand lanes */}
                    {isCurrentDateToday && (
                      <div
                        className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                        style={{ top: `${currentMinutes}px` }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-xs" />
                        <div className="h-[2px] bg-red-500 flex-1" />
                      </div>
                    )}

                    {brandLanes.map((brandName) => {
                      const laneEvents = dayEvents.filter((e) => e.brandScope === brandName);

                      return (
                        <div
                          key={brandName}
                          className="flex-1 min-w-[250px] max-w-[320px] relative"
                        >
                          {/* Hourly Horizontal Rules for each brand lane */}
                          {HOURS_24.map((hour) => (
                            <div
                              key={hour}
                              className="absolute left-0 right-0 border-t border-slate-100 pointer-events-none"
                              style={{ top: `${hour * HOUR_HEIGHT}px` }}
                            />
                          ))}

                          {/* Event Cards placed inside this Brand Lane (แกน Y ยาว 270px เท่าเดิม, แกน X กะทัดรัดพอดีแถว) */}
                          {laneEvents.map((event) => {
                            const startMin = parseTimeToMinutes(event.startTime, 540);
                            const isCompleted =
                              (event.eventStatus || "").toUpperCase() === "COMPLETED";

                            return (
                              <div
                                key={event.eventId}
                                onClick={() => onSelectEvent && onSelectEvent(event)}
                                style={{
                                  top: `${startMin}px`,
                                  height: `${UNIFORM_CARD_HEIGHT}px`,
                                }}
                                className="absolute z-10 left-2 right-2 rounded-[22px] border border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-slate-300/90 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:z-20 active:scale-[0.99] flex flex-col bg-white text-slate-900 group select-none"
                                title={`${event.eventName} (${event.startTime} - ${event.endTime})`}
                              >
                                {/* ─── 1. TOP MEDIA SECTION: Brand Logo Frame ─── */}
                                <div className="relative w-full h-[105px] bg-[#fff6ee] flex items-center justify-center p-3 border-b border-slate-100 overflow-hidden shrink-0">
                                  <img
                                    src={event.brandLogoUrl || "/images/brands/mister-donut.svg"}
                                    alt={event.brandScope || "Brand Logo"}
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md shadow-2xs border border-slate-200/60 text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                                    {event.brandScope || "Brand"}
                                  </div>
                                </div>

                                {/* ─── 2. CONTENT BODY (Flight Destination Card Style) ─── */}
                                <div className="p-3 flex flex-col justify-between flex-1 bg-white">
                                  <div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors">
                                      {event.eventName}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                                      {event.description ||
                                        (event.eventLocation
                                          ? `สถานที่: ${event.eventLocation}`
                                          : "ไม่มีรายละเอียดเพิ่มเติม")}
                                    </p>

                                    {/* Badges Row */}
                                    <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-100">
                                      {isCompleted ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                          <span>ทำเสร็จแล้ว</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                          <span>รอถึงวัน</span>
                                        </span>
                                      )}

                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                                        <svg className="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="12" cy="12" r="10" />
                                          <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span>{event.startTime} - {event.endTime}</span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* ─── 3. BOTTOM ACTIONS ROW ─── */}
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <button
                                      type="button"
                                      className="flex-1 h-9 rounded-full bg-[#111111] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                                    >
                                      {isCompleted ? (
                                        <>
                                          <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                          <span>เสร็จสิ้นกิจกรรม</span>
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                          </svg>
                                          <span>รอจัดกิจกรรม</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      aria-label="Bookmark"
                                      className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-rose-500 shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer"
                                    >
                                      <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
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
