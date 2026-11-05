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
  THAI_MONTH_NAMES,
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

const DEFAULT_BRAND_LOGO_FALLBACK = "https://cdn-icons-png.flaticon.com/512/456/456283.png";

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
    selectedBrands,
    availableBrands,
    toggleBrandFilter,
    selectAllBrands,
    selectedCategories,
    toggleCategoryFilter,
    selectAllCategories,
    resetFilters,
    isFiltered,
    monthWeeks,
    weekCalendarDays,
    weekSegments,
    weekLaneCount,
    weekRangeLabel,
    dayEvents,
    dayTitleLabel,
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

  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);



  const getCategoryStyle = (category?: string) => {
    if (!category) return DEFAULT_CATEGORY_STYLE;
    return CATEGORY_STYLES[category.toUpperCase()] || DEFAULT_CATEGORY_STYLE;
  };

  const showSidebar = viewMode === "Day" || viewMode === "Week";

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden flex flex-col ${className}`}
    >
      {/* ─── 1. CALENDAR TOOLBAR (Fireart Schedule Control Bar Style) ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        {/* Navigation & Date Display (Fireart Tear-Sheet Badge) */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            {/* Modern Thai Calendar Date Badge (ข้อ 10 Remodeled) */}
            <div className="flex h-11 w-11 flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white shadow-2xs shrink-0 select-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 leading-none">
                {THAI_MONTH_NAMES[currentDate.getMonth()].slice(0, 3)}
              </span>
              <span className="text-base font-black text-slate-900 leading-none mt-1 tabular-nums">
                {currentDate.getDate()}
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-snug">
                {viewMode === "Day" ? dayTitleLabel : viewMode === "Week" ? weekRangeLabel : monthYearLabel}
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-none mt-0.5">
                {viewMode === "Day" ? "กิจกรรมและกำหนดการประจำวัน" : viewMode === "Week" ? "ตารางงานประจำสัปดาห์" : "ปฏิทินกิจกรรมประจำเดือน"}
              </p>
            </div>
          </div>

          {/* Unified Segmented Navigation Controls (วันนี้ / < / >) */}
          <div className="inline-flex items-center rounded-full bg-white p-1 border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={handleToday}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 ${FOCUS_RING}`}
            >
              วันนี้
            </button>
            <div className="h-3.5 w-px bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={handlePrev}
              aria-label="ย้อนกลับ"
              className={`w-7 h-7 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer active:scale-90 ${FOCUS_RING}`}
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="ถัดไป"
              className={`w-7 h-7 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer active:scale-90 ${FOCUS_RING}`}
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* View Mode Switcher: Day | Week | Month */}
        <div role="group" aria-label="โหมดมุมมองปฏิทิน" className="inline-flex rounded-full bg-slate-200/60 p-1 border border-slate-200/80 w-full sm:w-auto justify-center">
          {(["Day", "Week", "Month"] as const).map((mode) => (
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
              {mode === "Day" ? "Daily View" : mode === "Week" ? "Weekly View" : "Monthly View"}
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

                {/* 3. Filter Section Header */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    ตัวกรองกิจกรรม
                  </span>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>

                {/* 4. Brand Filter Dropdown / Collapsible */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setIsBrandOpen((prev) => !prev)}
                    className="w-full p-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <svg aria-hidden="true" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">แบรนด์</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                        {selectedBrands.length === 0 ? "ทั้งหมด" : `${selectedBrands.length} แบรนด์`}
                      </span>
                      <svg
                        aria-hidden="true"
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isBrandOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {isBrandOpen && (
                    <div className="p-2.5 pt-0 border-t border-slate-200/60 space-y-1 bg-white">
                      <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={selectedBrands.length === 0}
                          onChange={selectAllBrands}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[var(--primary-container)] accent-[var(--primary-container)] cursor-pointer"
                        />
                        <span>เลือกทุกแบรนด์</span>
                      </label>

                      {availableBrands.map((brand) => {
                        const isChecked = selectedBrands.includes(brand);
                        return (
                          <label
                            key={brand}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleBrandFilter(brand)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[var(--primary-container)] accent-[var(--primary-container)] cursor-pointer"
                            />
                            <span className="truncate">{brand}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 5. Category Filter Dropdown / Collapsible */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen((prev) => !prev)}
                    className="w-full p-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <svg aria-hidden="true" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">หมวดหมู่</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                        {selectedCategories.length === 0 ? "ทั้งหมด" : `${selectedCategories.length} หมวด`}
                      </span>
                      <svg
                        aria-hidden="true"
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {isCategoryOpen && (
                    <div className="p-2.5 pt-0 border-t border-slate-200/60 space-y-1 bg-white">
                      <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={selectedCategories.length === 0}
                          onChange={selectAllCategories}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[var(--primary-container)] accent-[var(--primary-container)] cursor-pointer"
                        />
                        <span>เลือกทุกหมวดหมู่</span>
                      </label>

                      {Object.entries(CATEGORY_STYLES).map(([key, cat]) => {
                        const isChecked = selectedCategories.includes(key);
                        return (
                          <label
                            key={key}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategoryFilter(key)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[var(--primary-container)] accent-[var(--primary-container)] cursor-pointer"
                            />
                            <span className={`w-2 h-2 rounded-full shrink-0 ${cat.dotClass}`} />
                            <span className="truncate">{cat.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
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

          {/* ─── DAY VIEW (Focused Single-Day Schedule & Activity Detail) ─── */}
          {viewMode === "Day" && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto bg-slate-50/30 space-y-4">
              {/* Day Header Summary (ข้อ 7: ลบปุ่มซ้ำซ้อนออกแล้ว) */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {dayTitleLabel}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {dayEvents.length > 0
                      ? `มี ${dayEvents.length} กิจกรรมที่บันทึกไว้ในวันนี้`
                      : "ไม่มีกิจกรรมหรือกำหนดการในวันนี้"}
                  </p>
                </div>
              </div>

              {/* Day Events List */}
              {dayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-dashed border-slate-200/90 min-h-[300px]">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">ไม่มีกิจกรรมสำหรับวันนี้</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    ยังไม่มีแคมเปญ งานซ่อมบำรุง หรือกิจกรรมตรวจมาตรฐานที่บันทึกไว้ในวันนี้
                  </p>
                  {onCreateEvent && (
                    <button
                      type="button"
                      onClick={onCreateEvent}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--primary-container)] bg-[var(--accent-bg)] hover:bg-[var(--primary-container)] hover:text-white transition-colors cursor-pointer"
                    >
                      + สร้างกิจกรรมแรกของวันนี้
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayEvents.map((event) => {
                    const style = getCategoryStyle(event.eventCategory);
                    const brandLogo = event.brandLogoUrl || DEFAULT_BRAND_LOGO_FALLBACK;
                    return (
                      <div
                        key={event.eventId}
                        onClick={() => onSelectEvent?.(event)}
                        className="group relative p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3"
                      >
                        {/* Top: Brand Logo + Badges + Actions */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full ring-2 ring-slate-100 bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1 shrink-0">
                              <img
                                src={brandLogo}
                                alt={event.brandScope || "Brand"}
                                className="w-full h-full object-contain rounded-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {event.brandScope && (
                                  <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {event.brandScope}
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${style.badgeClass}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                                  <span>{style.label}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Edit/Delete buttons (ข้อ 8 & ข้อ 9: กดเพื่อเปิด Edit/Delete Modal) */}
                          <div
                            className="flex items-center gap-1.5 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                          >
                            {onEditEvent && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onEditEvent(event);
                                }}
                                title="แก้ไขกิจกรรม"
                                aria-label={`แก้ไข ${event.eventName}`}
                                className="w-8 h-8 rounded-full border border-slate-200/90 bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                              >
                                <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                </svg>
                              </button>
                            )}
                            {onDeleteEvent && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onDeleteEvent(event);
                                }}
                                title="ลบกิจกรรม"
                                aria-label={`ลบ ${event.eventName}`}
                                className="w-8 h-8 rounded-full border border-slate-200/90 bg-white text-rose-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                              >
                                <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[var(--primary-container)] transition-colors line-clamp-2">
                            {event.eventName}
                          </h4>
                          {event.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                        </div>

                        {/* Metadata Footer: Time + Location + Assignees */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
                          <div className="flex items-center gap-3 truncate">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <svg aria-hidden="true" className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <span>{event.startTime ? `${event.startTime} - ${event.endTime || ""}` : "All-day"}</span>
                            </span>
                            {event.eventLocation && (
                              <span className="truncate max-w-[130px] hidden sm:inline">
                                • {event.eventLocation}
                              </span>
                            )}
                          </div>

                          {event.assignees && event.assignees.length > 0 && (
                            <div className="flex items-center -space-x-1.5 shrink-0" aria-label="ผู้รับผิดชอบ">
                              {event.assignees.slice(0, 3).map((a) => (
                                <span
                                  key={a.name}
                                  title={a.name}
                                  className="w-5 h-5 rounded-full ring-2 ring-white bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center overflow-hidden"
                                >
                                  {a.avatarUrl ? (
                                    <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover" />
                                  ) : (
                                    a.name.trim().charAt(0).toUpperCase()
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
