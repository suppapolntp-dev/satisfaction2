"use client";

import React from "react";
import { useEventDetailModal, UseEventDetailModalProps } from "./useEventDetailModal";

export interface EventDetailModalProps extends UseEventDetailModalProps {
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  CAMPAIGN: { bg: "bg-orange-50", text: "text-orange-900 border-orange-200/80", dot: "bg-orange-500", label: "แคมเปญการตลาด" },
  AUDIT: { bg: "bg-emerald-50", text: "text-emerald-900 border-emerald-200/80", dot: "bg-emerald-500", label: "ตรวจมาตรฐานสาขา" },
  FIRMWARE: { bg: "bg-blue-50", text: "text-blue-900 border-blue-200/80", dot: "bg-blue-500", label: "อัปเดตระบบ Kiosk" },
  CALIBRATION: { bg: "bg-purple-50", text: "text-purple-900 border-purple-200/80", dot: "bg-purple-500", label: "คาริเบรตอุปกรณ์" },
  MAINTENANCE: { bg: "bg-slate-50", text: "text-slate-800 border-slate-200", dot: "bg-slate-500", label: "ซ่อมบำรุงประจำรอบ" },
};

// Fallback image url provided by user for brand/profile icon
const DEFAULT_BRAND_LOGO_FALLBACK = "https://cdn-icons-png.flaticon.com/512/456/456283.png";

export default function EventDetailModal({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
  className = "",
}: EventDetailModalProps) {
  const {
    dateRangeFormatted,
    timeFormatted,
  } = useEventDetailModal({ isOpen, event, onClose, onEdit, onDelete });

  if (!isOpen || !event) return null;

  const categoryStyle =
    CATEGORY_COLORS[(event.eventCategory || "").toUpperCase()] || {
      bg: "bg-slate-50",
      text: "text-slate-800 border-slate-200",
      dot: "bg-slate-400",
      label: event.eventCategory || "กิจกรรม",
    };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* ─── MODAL HEADER ─── */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          {/* GREEN: Circular Brand Logo Avatar (Big, like assignees but bigger) */}
          <div className="relative shrink-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full ring-2 ring-slate-100 shadow-sm bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden p-1.5">
              <img
                src={event.brandLogoUrl || DEFAULT_BRAND_LOGO_FALLBACK}
                alt={event.brandScope || "Brand"}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            {event.brandScope && (
              <span className="sr-only">{event.brandScope}</span>
            )}
          </div>

          {/* Title & Metadata (YELLOW: Moved down below title) */}
          <div className="flex-1 min-w-0 space-y-2">
            <h2
              id="event-detail-title"
              className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug break-words"
            >
              {event.eventName}
            </h2>

            {/* YELLOW: Consolidated Metadata Row under Title */}
            <div className="flex items-center gap-2 flex-wrap">
              {event.brandScope && (
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {event.brandScope}
                </span>
              )}

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dot}`} />
                <span>{categoryStyle.label}</span>
              </span>

              {event.eventStatus && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  {event.eventStatus}
                </span>
              )}

              {/* Team Assignees inline avatar stack */}
              {event.assignees && event.assignees.length > 0 && (
                <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                  <div className="flex items-center -space-x-1.5">
                    {event.assignees.map((assignee) => (
                      <span
                        key={assignee.name}
                        title={assignee.name}
                        className="w-5 h-5 rounded-full ring-2 ring-white bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center overflow-hidden"
                      >
                        {assignee.avatarUrl ? (
                          <img src={assignee.avatarUrl} alt={assignee.name} className="w-full h-full object-cover" />
                        ) : (
                          assignee.name.trim().charAt(0).toUpperCase()
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium truncate max-w-[130px]">
                    {event.assignees.map((a) => a.name).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── BODY INFO ─── */}
        <div className="py-4 space-y-4 text-xs text-slate-700 flex-1 overflow-y-auto max-h-[60vh]">
          {/* RED: Remodeled Unified Schedule Card (Single piece, sleek & clear) */}
          <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3.5 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 gap-3 sm:gap-0">
              {/* Date Column */}
              <div className="flex items-center gap-3 sm:pr-4">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-600 shrink-0">
                  <svg aria-hidden="true" className="w-4.5 h-4.5 text-[var(--primary-container)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-slate-500 leading-tight">วันที่จัดกิจกรรม</span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                    {dateRangeFormatted}
                  </span>
                </div>
              </div>

              {/* Time Column */}
              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-600 shrink-0">
                  <svg aria-hidden="true" className="w-4.5 h-4.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-slate-500 leading-tight">เวลาดำเนินงาน</span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                    {timeFormatted}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500">คำอธิบายเพิ่มเติม</span>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                {event.description}
              </p>
            </div>
          )}

          {/* Location */}
          {event.eventLocation && (
            <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                สถานที่
              </span>
              <p className="font-semibold text-slate-900">{event.eventLocation}</p>
            </div>
          )}

          {/* Target Branches */}
          {event.targetBranchNames && event.targetBranchNames.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-500">สาขาที่ร่วมรายการ ({event.targetBranchNames.length})</span>
              <div className="flex flex-wrap gap-1.5">
                {event.targetBranchNames.map((branchName) => (
                  <span
                    key={branchName}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium"
                  >
                    {branchName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── FOOTER ACTIONS ─── */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
