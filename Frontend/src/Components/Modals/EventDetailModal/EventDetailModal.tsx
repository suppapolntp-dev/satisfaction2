"use client";

import React from "react";
import { useEventDetailModal, UseEventDetailModalProps } from "./useEventDetailModal";
import { computeEventStatus } from "@/Components/Modals/EventEditModal/useEventEditModal";

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
  const { dateRangeFormatted } = useEventDetailModal({
    isOpen,
    event,
    onClose,
    onEdit,
    onDelete,
  });

  if (!isOpen || !event) return null;

  const categoryStyle =
    CATEGORY_COLORS[(event.eventCategory || "").toUpperCase()] || {
      bg: "bg-slate-50",
      text: "text-slate-800 border-slate-200",
      dot: "bg-slate-400",
      label: event.eventCategory || "กิจกรรม",
    };

  // คำนวณ 2 สถานะอัตโนมัติ (รอวันมาถึง / จบแล้ว) จากวันที่
  const computedStatus = computeEventStatus(event.eventDate, event.eventEndDate);
  const branches = event.targetBranchNames || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={`relative z-10 w-full max-w-lg rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* ─── MODAL HEADER ─── */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          {/* Circular Brand Logo Avatar (48-56px) */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full ring-2 ring-slate-100 shadow-sm bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden p-1.5">
              <img
                src={event.brandLogoUrl || DEFAULT_BRAND_LOGO_FALLBACK}
                alt={event.brandScope || "Brand"}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>

          {/* Title & Consolidated Metadata Row */}
          <div className="flex-1 min-w-0 space-y-2">
            <h2
              id="event-detail-title"
              className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug break-words"
            >
              {event.eventName}
            </h2>

            {/* Metadata Row: Category + 2-State Computed Status + Inline Branch Monogram Stack (image_3971f6.png) */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dot}`} />
                <span>{categoryStyle.label}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${computedStatus.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${computedStatus.dotClass}`} />
                <span>{computedStatus.label}</span>
              </span>

              {/* สาขาที่เลือก: Monogram Circle Stack + Comma-Separated Names (image_3971f6.png) */}
              {branches.length > 0 && (
                <div
                  className="flex items-center gap-2 pl-2 border-l border-slate-200 min-w-0"
                  title={branches.join(", ")}
                >
                  <div className="flex items-center -space-x-1.5 shrink-0 overflow-hidden">
                    {branches.slice(0, 3).map((branchName) => (
                      <span
                        key={branchName}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-800 ring-2 ring-white shrink-0"
                      >
                        {branchName.trim().charAt(0).toUpperCase()}
                      </span>
                    ))}
                    {branches.length > 3 && (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white shrink-0">
                        +{branches.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-xs font-medium text-slate-700 max-w-[160px]">
                    {branches.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── BODY INFO (Hierarchy: Description FIRST -> Date Schedule SECOND) ─── */}
        <div className="py-4 space-y-4 text-xs text-slate-700 flex-1 overflow-y-auto max-h-[60vh]">
          {/* 1. คำอธิบายรายละเอียดกิจกรรม */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              คำอธิบายรายละเอียด
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
              {event.description || "ไม่มีคำอธิบายเพิ่มเติม"}
            </p>
          </div>

          {/* 2. กำหนดการวันที่จัดกิจกรรม (Date-Only Unified Card) */}
          <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3.5 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 text-[var(--primary-container)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-medium text-slate-500 leading-tight">
                  วันที่จัดกิจกรรม
                </span>
                <span className="block text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate mt-0.5">
                  {dateRangeFormatted}
                </span>
              </div>
            </div>

            {event.brandScope && (
              <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-bold text-slate-700 shadow-2xs shrink-0">
                {event.brandScope}
              </span>
            )}
          </div>
        </div>

        {/* ─── FOOTER ACTIONS (Single Dismiss Button) ─── */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer focus:ring-2 focus:ring-[var(--primary-container)]"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
