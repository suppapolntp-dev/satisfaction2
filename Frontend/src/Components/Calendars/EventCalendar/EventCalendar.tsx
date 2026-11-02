"use client";

import React from "react";
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
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200/80 hover:bg-amber-100",
    dotClass: "bg-amber-500",
  },
  MAINTENANCE: {
    label: "Maintenance",
    badgeClass: "bg-rose-50 text-rose-900 border-rose-200/80 hover:bg-rose-100",
    dotClass: "bg-rose-500",
  },
  FIRMWARE: {
    label: "Firmware",
    badgeClass: "bg-blue-50 text-blue-900 border-blue-200/80 hover:bg-blue-100",
    dotClass: "bg-blue-500",
  },
  CALIBRATION: {
    label: "Calibration",
    badgeClass: "bg-purple-50 text-purple-900 border-purple-200/80 hover:bg-purple-100",
    dotClass: "bg-purple-500",
  },
  AUDIT: {
    label: "Audit",
    badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
};

const DEFAULT_CATEGORY_STYLE = {
  label: "Event",
  badgeClass: "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100",
  dotClass: "bg-slate-400",
};

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
    viewMode,
    setViewMode,
    monthCalendarCells,
    weekCalendarDays,
    dayEvents,
    monthYearLabel,
    handlePrev,
    handleNext,
    handleToday,
  } = useEventCalendar({
    events,
    initialDate,
    onSelectDate,
    onSelectEvent,
  });

  const getCategoryStyle = (category?: string) => {
    if (!category) return DEFAULT_CATEGORY_STYLE;
    return CATEGORY_STYLES[category.toUpperCase()] || DEFAULT_CATEGORY_STYLE;
  };

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
                    onClick={() => onSelectDate && onSelectDate(cell.dateString)}
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
                    onClick={() => onSelectDate && onSelectDate(day.dateString)}
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

          {/* ─── DAY VIEW ─── */}
          {viewMode === "Day" && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Events for {currentDateStr}</span>
                <span className="text-xs font-normal text-slate-500">
                  {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"} recorded
                </span>
              </div>

              {dayEvents.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  No events scheduled for this day
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dayEvents.map((event) => {
                    const style = getCategoryStyle(event.eventCategory);
                    return (
                      <div
                        key={event.eventId}
                        onClick={() => onSelectEvent && onSelectEvent(event)}
                        className={`p-4 rounded-2xl border cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-2 transition-all ${style.badgeClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${style.dotClass}`} />
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">{event.eventName}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {event.eventLocation || "All Branches"} &bull; {event.brandScope}
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-xs text-slate-500 shrink-0">
                          <span className="font-semibold text-slate-700">
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="block text-[11px] text-slate-400 capitalize">
                            {event.eventStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
