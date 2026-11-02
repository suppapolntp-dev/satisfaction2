"use client";

import React, { useState } from "react";
import { EventItem } from "@/Types/event";
import { useEventTable, EventTableSortField } from "./useEventTable";

export interface EventTableProps {
  events: EventItem[];
  isLoading?: boolean;
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
      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 select-none cursor-pointer hover:text-slate-800 transition-colors ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      }`}
      onClick={() => onSort(field)}
    >
      <div className={`inline-flex items-center gap-1.5 ${alignmentClass}`}>
        <span>{label}</span>
        <span
          className={`transition-opacity ${
            isActive ? "opacity-100 text-[var(--primary-container)]" : "opacity-30"
          }`}
        >
          {isActive && direction === "desc" ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m18 15-6-6-6 6" />
            </svg>
          )}
        </span>
      </div>
    </th>
  );
}

export default function EventTable({
  events = [],
  isLoading = false,
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
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]/20 focus:border-[var(--primary-container)] placeholder-slate-400 transition-all font-normal"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
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
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
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
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Total Count Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">
            ทั้งหมด <strong className="text-slate-800 font-bold">{totalItems}</strong> รายการ
          </span>
        </div>
      </div>

      {/* ─── 2. TABLE DATA CONTAINER ─── */}
      <div className="overflow-x-auto min-h-[360px] relative">
        <table className="w-full text-left border-collapse">
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
              <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                label="สถานะ"
                field="eventStatus"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                จัดการ
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {isLoading ? (
              // Loading Skeleton State
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="h-4 bg-slate-200 rounded w-48 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-32" />
                  </td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-36" /></td>
                  <td className="px-5 py-4"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                  <td className="px-5 py-4 text-center"><div className="h-5 bg-slate-200 rounded-full w-16 mx-auto" /></td>
                  <td className="px-5 py-4 text-right"><div className="h-7 bg-slate-200 rounded w-14 ml-auto" /></td>
                </tr>
              ))
            ) : paginatedEvents.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-10 h-10 text-slate-300 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-600 mt-1">ไม่พบข้อมูลกิจกรรมหรือแคมเปญ</p>
                    <p className="text-xs text-slate-400">ลองปรับเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อค้นหาใหม่</p>
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
                    className="hover:bg-slate-50/70 transition-colors group cursor-default"
                  >
                    {/* Event Name & Description */}
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate leading-snug">
                          {event.eventName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {event.description || (
                            <span className="font-mono text-slate-400">{event.eventId}</span>
                          )}
                        </p>
                      </div>
                    </td>

                    {/* Brand Scope */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                          <img
                            src={event.brandLogoUrl || "/images/brands/mister-donut.svg"}
                            alt={event.brandScope || "Brand"}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="font-semibold text-slate-800 text-xs">
                          {event.brandScope || "Mister Donut"}
                        </span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800 block">
                          {event.eventDate}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
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
                          <span className="text-[10px] text-slate-400 truncate block">
                            {event.targetBranchNames.join(", ")}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${categoryConfig.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${categoryConfig.dot}`} />
                        <span>{categoryConfig.label}</span>
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>ทำเสร็จแล้ว</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>รอถึงวัน</span>
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        {onEditEvent && (
                          <button
                            type="button"
                            onClick={() => onEditEvent(event)}
                            aria-label={`แก้ไขกิจกรรม ${event.eventName}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                          </button>
                        )}
                        {onDeleteEvent && (
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(event)}
                            aria-label={`ลบกิจกรรม ${event.eventName}`}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            แสดงหน้า <strong className="text-slate-800">{currentPage}</strong> จากทั้งหมด{" "}
            <strong className="text-slate-800">{totalPages}</strong> หน้า
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer font-medium"
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
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer font-medium"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
