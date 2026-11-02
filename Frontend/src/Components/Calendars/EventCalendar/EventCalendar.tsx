"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { EventItem, EventCategory } from "@/Types/event";
import {
  useEventCalendar,
  UseEventCalendarProps,
  CALENDAR_WEEK_DAYS,
  CalendarViewMode,
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

      {/* ─── 2. CALENDAR VIEWS ─── */}
      {!isLoading && (
        <>
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

          {/* ─── DAY VIEW (Google Calendar Time Grid Layout) ─── */}
          {viewMode === "Day" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Day View Sticky Header */}
              <div className="flex border-b border-slate-200 bg-white sticky top-0 z-20">
                {/* Left Timezone Label */}
                <div className="w-16 sm:w-20 shrink-0 flex items-end justify-end pb-2 pr-3 border-r border-slate-200/80">
                  <span className="text-[11px] font-medium text-slate-400 select-none">
                    GMT+7
                  </span>
                </div>

                {/* Day of Week & Date Number (Google Calendar Day Header) */}
                <div className="flex-1 py-2.5 px-4 flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {currentDayInfo.dayOfWeekThShort || currentDayInfo.dayOfWeekEn}
                    </span>
                    <div
                      className={`mt-0.5 text-2xl sm:text-3xl font-bold flex items-center justify-center leading-none ${
                        currentDayInfo.isToday
                          ? "w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0b57d0] text-white shadow-xs"
                          : "text-[#1f1f1f]"
                      }`}
                    >
                      {currentDayInfo.dayNumber}
                    </div>
                  </div>

                  <div className="hidden sm:block pl-3 border-l border-slate-200 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{currentDayInfo.dayOfWeekThFull}</span>
                    <span className="mx-2 text-slate-300">&bull;</span>
                    <span>
                      {dayEvents.length === 0
                        ? "ไม่มีกิจกรรมในวันนี้"
                        : `${dayEvents.length} กิจกรรม`}
                    </span>
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

                  {/* Right Column: Timeline Grid Lines & Events Canvas */}
                  <div className="flex-1 relative">
                    {/* Hourly Horizontal Rules */}
                    {HOURS_24.map((hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 border-t border-slate-100 pointer-events-none"
                        style={{ top: `${hour * HOUR_HEIGHT}px` }}
                      />
                    ))}

                    {/* Live Current Time Line (Google Calendar style red marker) */}
                    {isCurrentDateToday && (
                      <div
                        className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                        style={{ top: `${currentMinutes}px` }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-xs" />
                        <div className="h-[2px] bg-red-500 flex-1" />
                      </div>
                    )}

                    {/* Event Blocks Placed on Grid */}
                    {positionedDayEvents.map((item) => {
                      const { event, startMin, duration, colIndex, totalCols } = item;
                      const style = getCategoryStyle(event.eventCategory);
                      const colWidthPercent = 100 / totalCols;
                      const leftPercent = colIndex * colWidthPercent;

                      return (
                        <div
                          key={event.eventId}
                          onClick={() => onSelectEvent && onSelectEvent(event)}
                          style={{
                            top: `${startMin}px`,
                            height: `${duration}px`,
                            left: `calc(${leftPercent}% + 6px)`,
                            width: `calc(${colWidthPercent}% - 12px)`,
                          }}
                          className={`absolute z-10 p-2 sm:p-2.5 rounded-xl border shadow-xs cursor-pointer overflow-hidden transition-all hover:shadow-md hover:z-20 active:scale-[0.99] flex flex-col justify-between ${style.badgeClass}`}
                          title={`${event.eventName} (${event.startTime} - ${event.endTime})`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${style.dotClass}`} />
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {event.eventName}
                              </h4>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>

                          {duration >= 50 && (
                            <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-black/5 mt-1">
                              <span>{event.eventLocation || "ทุกสาขา"}</span>
                              {event.brandScope && (
                                <span className="ml-1 opacity-80">&bull; {event.brandScope}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
