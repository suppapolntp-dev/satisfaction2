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
  onEditEvent?: (event: EventItem) => void;
  onDeleteEvent?: (event: EventItem) => void;
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

// Localised short weekday (e.g. "จ.") derived from the date — no hardcoded weekday list
const WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat("th-TH", { weekday: "short" });

// Shared keyboard-focus ring (WCAG 2.4.7) — outline never shifts layout
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]";
const FOCUS_RING_INSET =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--primary-container)]";

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
  onEditEvent,
  onDeleteEvent,
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
    weekSegments,
    weekLaneCount,
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
                            columnSpan={segment.columnSpan}
                            variant={segment.isMultiDay ? "detailed" : "compact"}
                            onClick={onSelectEvent}
                            onEdit={onEditEvent}
                            onDelete={onDeleteEvent}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── WEEK VIEW (7-Day Task Row Schedule Grid with Left Task Gutter) ─── */}
          {viewMode === "Week" && (
            <div className="flex-1 flex flex-col overflow-x-auto bg-white min-w-[760px]">
              {/* Sticky Weekdays Header: Left Gutter Header + 7 Day Headers */}
              <div className="flex border-b border-slate-200/80 bg-white sticky top-0 z-20">
                {/* Left Gutter Header */}
                <div className="w-20 sm:w-24 shrink-0 border-r border-slate-200/80 py-3 px-2 flex flex-col items-center justify-center bg-slate-50/70 select-none">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ลำดับงาน</span>
                  <span className="text-[10px] text-slate-400 font-medium">Task Row</span>
                </div>

                {/* 7 Day Headers with Task Count Badges */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100">
                  {weekCalendarDays.map((day) => {
                    const isToday = day.isToday;
                    const isSelected = day.dateString === currentDateStr;
                    const eventCount = day.events.length;
                    return (
                      <button
                        type="button"
                        key={day.dateString}
                        onClick={() => selectDate(day.dateString)}
                        aria-current={isToday ? "date" : undefined}
                        aria-pressed={isSelected}
                        className={`group py-3 px-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors duration-200 motion-reduce:transition-none hover:bg-slate-50 ${FOCUS_RING_INSET} ${
                          isSelected ? "bg-slate-50/80" : ""
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            isToday ? "text-[var(--primary-container)] font-bold" : "text-slate-500"
                          }`}
                        >
                          {WEEKDAY_SHORT_FORMATTER.format(day.date)}
                        </span>
                        <span
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold tabular-nums transition-colors duration-200 motion-reduce:transition-none ${
                            isToday
                              ? "bg-[var(--primary-container)] text-white shadow-2xs"
                              : isSelected
                              ? "bg-[var(--accent-bg)] text-[var(--primary-container)] ring-2 ring-inset ring-[var(--primary-container)]"
                              : "text-slate-900 group-hover:bg-slate-200/60"
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                            eventCount > 0
                              ? "bg-slate-100 text-slate-700 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {eventCount > 0 ? `${eventCount} งาน` : "ว่าง"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Task Row Canvas: Left Gutter + 7 Columns Grid */}
              <div className="flex flex-1 relative bg-white">
                {/* Left Gutter: Task Order Labels (งานที่ 1, งานที่ 2, งานที่ 3...) เหมือนแกนเวลาเดิม */}
                <div className="w-20 sm:w-24 shrink-0 border-r border-slate-200/80 bg-slate-50/40 select-none flex flex-col">
                  {Array.from({ length: weekLaneCount }, (_, laneIdx) => (
                    <div
                      key={laneIdx}
                      className="h-28 sm:h-32 border-b border-slate-100 flex flex-col items-center justify-center p-2 text-center"
                    >
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-white border border-slate-200/80 text-[11px] font-bold text-slate-700 shadow-2xs">
                        งานที่ {laneIdx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 7 Day Columns Canvas with Horizontal Row Lines and Multi-Day Spanning Cards */}
                <div className="flex-1 relative">
                  {/* Layer 1: Background Day Cell Grid with Row Dividers */}
                  <div className="absolute inset-0 grid grid-cols-7 divide-x divide-slate-100">
                    {weekCalendarDays.map((day) => (
                      <div
                        key={day.dateString}
                        onClick={() => selectDate(day.dateString)}
                        className={`flex flex-col cursor-pointer transition-colors hover:bg-slate-50/40 ${
                          day.dateString === currentDateStr ? "bg-slate-50/30" : ""
                        }`}
                      >
                        {Array.from({ length: weekLaneCount }, (_, laneIdx) => (
                          <div
                            key={laneIdx}
                            className="h-28 sm:h-32 border-b border-slate-100"
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Layer 2: Event Cards Positioned across Rows and Day Columns */}
                  <div
                    className="relative grid grid-cols-7 gap-x-2 pointer-events-none"
                    style={{
                      gridTemplateRows: `repeat(${weekLaneCount}, minmax(7rem, 8rem))`,
                    }}
                  >
                    {weekSegments.map((segment) => (
                      <div
                        key={`${segment.event.eventId}-${segment.startColumn}`}
                        className="pointer-events-auto min-w-0 p-2 flex items-center"
                        style={{
                          gridColumn: `${segment.startColumn} / span ${segment.columnSpan}`,
                          gridRow: segment.laneIndex + 1,
                        }}
                      >
                        <EventCard
                          event={segment.event}
                          columnSpan={segment.columnSpan}
                          variant={segment.isMultiDay ? "detailed" : "compact"}
                          onClick={onSelectEvent}
                          onEdit={onEditEvent}
                          onDelete={onDeleteEvent}
                        />
                      </div>
                    ))}
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
