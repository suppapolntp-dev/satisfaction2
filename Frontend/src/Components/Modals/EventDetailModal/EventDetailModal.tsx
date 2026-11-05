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
    progressPercent,
    handleEditClick,
    handleDeleteClick,
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
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dot}`} />
                <span>{categoryStyle.label}</span>
              </span>

              {event.eventStatus && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {event.eventStatus}
                </span>
              )}

              {event.brandScope && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
                  {event.brandScope}
                </span>
              )}
            </div>

            <h2
              id="event-detail-title"
              className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug break-words"
            >
              {event.eventName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างรายละเอียด"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body Info */}
        <div className="py-4 space-y-4 text-xs text-slate-700 flex-1 overflow-y-auto max-h-[60vh]">
          {/* Progress Section */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600">
              <span>ความคืบหน้า</span>
              <span className="font-bold text-slate-900">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--primary-container)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                วันที่จัดกิจกรรม
              </span>
              <p className="font-semibold text-slate-900">{dateRangeFormatted}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                เวลา
              </span>
              <p className="font-semibold text-slate-900">{timeFormatted}</p>
            </div>
          </div>

          {/* Location */}
          {event.eventLocation && (
            <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
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

          {/* Description */}
          {event.description && (
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500">คำอธิบายเพิ่มเติม</span>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {event.description}
              </p>
            </div>
          )}

          {/* Assignees */}
          {event.assignees && event.assignees.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-500">ทีมผู้รับผิดชอบ ({event.assignees.length})</span>
              <div className="flex flex-wrap gap-2">
                {event.assignees.map((assignee) => (
                  <div
                    key={assignee.name}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/60"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-300 text-[10px] font-bold text-slate-800 flex items-center justify-center overflow-hidden">
                      {assignee.avatarUrl ? (
                        <img src={assignee.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        assignee.name.trim().charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{assignee.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>ลบ</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              ปิด
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={handleEditClick}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                <span>แก้ไขกิจกรรม</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
