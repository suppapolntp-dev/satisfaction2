"use client";

import React, { useState } from "react";
import { EventItem } from "@/Types/event";
import { useEventTable, EventTableSortField } from "./useEventTable";

// Shared keyboard-focus ring (WCAG 2.4.7) — outline never shifts layout
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]";
const FOCUS_RING_INSET =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--primary-container)]";

export interface EventTableProps {
  events: EventItem[];
  isLoading?: boolean;
  /** Error message from the data layer; renders an error row when set */
  errorMessage?: string | null;
  onRetry?: () => void;
  onEditEvent?: (event: EventItem) => void;
  onDeleteEvent?: (event: EventItem) => void;
  className?: string;
}

const CATEGORY_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  CAMPAIGN: {
    label: "แคมเปญการประเมิน",
    badge: "bg-amber-50 text-amber-800 border-amber-200/80",
    dot: "bg-amber-500",
  },
  AUDIT: {
    label: "ตรวจสอบคุณภาพ CSAT",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  FIRMWARE: {
    label: "อัปเดตระบบ Kiosk",
    badge: "bg-blue-50 text-blue-800 border-blue-200/80",
    dot: "bg-blue-500",
  },
  MAINTENANCE: {
    label: "ซ่อมบำรุงฮาร์ดแวร์",
    badge: "bg-slate-50 text-slate-800 border-slate-200",
    dot: "bg-slate-500",
  },
};

function SortHeaderCell({
  label,
  field,
  activeField,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  field: EventTableSortField;
  activeField: EventTableSortField;
  direction: "asc" | "desc";
  onSort: (field: EventTableSortField) => void;
  align?: "left" | "right" | "center";
}) {
  const isActive = activeField === field;
  const alignmentClass =
    align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";

  return (
    <th
      scope="col"
      aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 select-none ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 px-3 min-h-11 sm:min-h-10 rounded-lg uppercase tracking-wider hover:text-slate-900 cursor-pointer transition-colors motion-reduce:transition-none ${FOCUS_RING_INSET} ${alignmentClass}`}
      >
        <span>{label}</span>
        <span
          aria-hidden="true"
          className={`transition-opacity motion-reduce:transition-none ${
            isActive ? "opacity-100 text-[var(--primary-container)]" : "opacity-50"
          }`}
        >
          {isActive && direction === "desc" ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m18 15-6-6-6 6" />
            </svg>
          )}
        </span>
      </button>
    </th>
  );
}

export default function EventTable({
  events = [],
  isLoading = false,
  errorMessage = null,
  onRetry,
  onEditEvent,
  onDeleteEvent,
  className = "",
}: EventTableProps) {
  const [activeMenuEventId, setActiveMenuEventId] = useState<string | null>(null);

  const {
    searchKeyword,
    selectedCategory,
    selectedStatus,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedEvents,
    handleSort,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
    handlePageChange,
    handleResetFilters,
  } = useEventTable({ events, initialPageSize: 8 });

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {/* ─── 1. TOOLBAR: SEARCH & CATEGORY FILTERS ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ค้นหากิจกรรม, รหัส, แบรนด์ หรือสถานที่..."
              aria-label="ค้นหากิจกรรม รหัส แบรนด์ หรือสถานที่"
              className="w-full pl-9 pr-11 min-h-11 sm:min-h-10 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]/20 focus:border-[var(--primary-container)] placeholder-slate-500 transition-colors motion-reduce:transition-none font-normal"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="ล้างคำค้นหา"
                className={`absolute inset-y-0 right-0 w-11 sm:w-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 cursor-pointer ${FOCUS_RING_INSET}`}
              >
                <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="กรองตามหมวดหมู่"
            className={`text-xs bg-white border border-slate-200 rounded-xl px-3 min-h-11 sm:min-h-10 text-slate-700 cursor-pointer ${FOCUS_RING}`}
          >
            <option value="ALL">ทุกหมวดหมู่</option>
            <option value="CAMPAIGN">แคมเปญการประเมิน</option>
            <option value="AUDIT">ตรวจสอบคุณภาพ CSAT</option>
            <option value="FIRMWARE">อัปเดตระบบ Kiosk</option>
            <option value="MAINTENANCE">ซ่อมบำรุงฮาร์ดแวร์</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="กรองตามสถานะ"
            className={`text-xs bg-white border border-slate-200 rounded-xl px-3 min-h-11 sm:min-h-10 text-slate-700 cursor-pointer ${FOCUS_RING}`}
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="COMPLETED">ทำเสร็จแล้ว</option>
            <option value="UPCOMING">รอถึงวัน</option>
          </select>

          {/* Reset Filters */}
          {(searchKeyword || selectedCategory !== "ALL" || selectedStatus !== "ALL") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className={`text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 min-h-11 sm:min-h-10 rounded-lg hover:bg-slate-200/60 transition-colors motion-reduce:transition-none cursor-pointer ${FOCUS_RING}`}
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Total Count Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span role="status" className="text-xs text-slate-600 font-medium">
            ทั้งหมด <strong className="text-slate-800 font-bold">{totalItems}</strong> รายการ
          </span>
        </div>
      </div>

      {/* ─── 2. TABLE DATA CONTAINER ─── */}
      <div className="overflow-x-auto min-h-[360px] relative">
        <table aria-busy={isLoading} className="w-full min-w-[880px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <SortHeaderCell
                label="ชื่อกิจกรรม / แคมเปญ"
                field="eventName"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="แบรนด์"
                field="brandScope"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="วันที่และเวลา"
                field="eventDate"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                สถานที่จัด / สาขา
              </th>
              <SortHeaderCell
                label="หมวดหมู่"
                field="eventCategory"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="STATUS"
                field="eventStatus"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <th scope="col" className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {isLoading && (
              <tr className="sr-only">
                <td colSpan={7} role="status">กำลังโหลดกิจกรรม...</td>
              </tr>
            )}
            {isLoading ? (
              // Loading Skeleton State
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
                  <td className="px-5 py-4">
                    <div className="h-4 bg-slate-200 rounded w-48 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-32" />
                  </td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-36" /></td>
                  <td className="px-5 py-4"><div className="w-20 h-3 bg-slate-200 rounded" /></td>
                  <td className="px-5 py-4 text-center"><div className="w-16 h-3 bg-slate-200 rounded mx-auto" /></td>
                  <td className="px-5 py-4 text-right"><div className="w-8 h-8 bg-slate-200 rounded-lg ml-auto" /></td>
                </tr>
              ))
            ) : errorMessage ? (
              // Error State
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div role="alert" className="flex flex-col items-center justify-center gap-3">
                    <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className={`px-4 min-h-11 sm:min-h-10 rounded-full bg-white border border-red-200 text-xs font-semibold text-red-800 hover:bg-red-50 cursor-pointer transition-colors motion-reduce:transition-none ${FOCUS_RING}`}
                      >
                        ลองใหม่อีกครั้ง
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : paginatedEvents.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg aria-hidden="true" className="w-10 h-10 text-slate-400 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-600 mt-1">ไม่พบข้อมูลกิจกรรมหรือแคมเปญ</p>
                    <p className="text-xs text-slate-500">ลองปรับเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อค้นหาใหม่</p>
                    {(searchKeyword || selectedCategory !== "ALL" || selectedStatus !== "ALL") && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className={`mt-2 px-4 min-h-11 sm:min-h-10 rounded-full bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold cursor-pointer transition-colors motion-reduce:transition-none ${FOCUS_RING}`}
                      >
                        ล้างตัวกรอง
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              paginatedEvents.map((event) => {
                const categoryConfig =
                  CATEGORY_STYLES[event.eventCategory.toUpperCase()] || CATEGORY_STYLES.MAINTENANCE;
                const isCompleted =
                  (event.eventStatus || "").toUpperCase() === "COMPLETED";

                return (
                  <tr
                    key={event.eventId}
                    className="hover:bg-slate-50/70 transition-colors motion-reduce:transition-none"
                  >
                    {/* Event Name & Description */}
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate leading-snug">
                          {event.eventName}
                        </p>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {event.description || (
                            <span className="font-mono text-slate-500">{event.eventId}</span>
                          )}
                        </p>
                      </div>
                    </td>

                    {/* Brand Scope */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                          {event.brandLogoUrl ? (
                            <img
                              src={event.brandLogoUrl}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span aria-hidden="true" className="text-[11px] font-bold text-slate-600">
                              {(event.brandScope ?? "-").trim().charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs">
                          {event.brandScope || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800 block tabular-nums">
                          {event.eventDate}
                        </span>
                        <span className="text-xs text-slate-600 font-mono tabular-nums">
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                    </td>

                    {/* Location / Branches */}
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <div className="text-xs text-slate-700 truncate">
                        <span className="truncate block font-medium">
                          {event.eventLocation || "ทุกสาขา"}
                        </span>
                        {event.targetBranchNames && event.targetBranchNames.length > 0 && (
                          <span className="text-xs text-slate-500 truncate block">
                            {event.targetBranchNames.join(", ")}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category (Clean dot + text, no AI-slop background badge) */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center text-xs font-medium text-slate-700">
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${categoryConfig.dot}`} />
                        {categoryConfig.label}
                      </span>
                    </td>

                    {/* Status (Clean dot + text, no background badge - matches Image 1) */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center text-xs font-semibold ${
                          isCompleted ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            isCompleted ? "bg-emerald-600" : "bg-amber-500"
                          }`}
                        />
                        {isCompleted ? "ทำเสร็จแล้ว" : "รอถึงวัน"}
                      </span>
                    </td>

                    {/* Actions Menu (3 dots - matches Image 1) */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuEventId(
                              activeMenuEventId === event.eventId ? null : event.eventId
                            )
                          }
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label={`Actions for ${event.eventName}`}
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                          </svg>
                        </button>

                        {activeMenuEventId === event.eventId && (
                          <>
                            {/* Backdrop overlay */}
                            <div
                              className="fixed inset-0 z-20 cursor-default"
                              onClick={() => setActiveMenuEventId(null)}
                            />

                            {/* Dropdown Options */}
                            <div className="absolute right-0 z-30 mt-1 w-36 origin-top-right rounded-xl bg-white border border-slate-200/90 shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100 text-left">
                              {onEditEvent && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuEventId(null);
                                    onEditEvent(event);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[var(--accent-bg)]/60 hover:text-[var(--primary-container)] transition-colors cursor-pointer group"
                                >
                                  <svg
                                    className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-[var(--primary-container)]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                  <span>แก้ไขกิจกรรม</span>
                                </button>
                              )}

                              {onDeleteEvent && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuEventId(null);
                                    onDeleteEvent(event);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group"
                                >
                                  <svg
                                    className="w-3.5 h-3.5 shrink-0 text-rose-400 group-hover:text-rose-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                  <span>ลบกิจกรรม</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── 3. PAGINATION FOOTER ─── */}
      {!isLoading && totalPages > 1 && (
        <nav aria-label="การแบ่งหน้า" className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            แสดงหน้า <strong className="text-slate-800">{currentPage}</strong> จากทั้งหมด{" "}
            <strong className="text-slate-800">{totalPages}</strong> หน้า
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-4 min-h-11 sm:min-h-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors motion-reduce:transition-none cursor-pointer font-medium ${FOCUS_RING}`}
            >
              ก่อนหน้า
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`หน้า ${pageNum}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`w-11 h-11 sm:w-10 sm:h-10 rounded-lg text-xs font-semibold transition-colors motion-reduce:transition-none cursor-pointer ${FOCUS_RING} ${
                    isCurrent
                      ? "bg-[var(--primary-container)] text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-4 min-h-11 sm:min-h-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors motion-reduce:transition-none cursor-pointer font-medium ${FOCUS_RING}`}
            >
              ถัดไป
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
