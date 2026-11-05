"use client";

import React from "react";
import {
  useEventEditModal,
  UseEventEditModalProps,
  EVENT_CATEGORIES,
  COMMON_BRANDS,
} from "./useEventEditModal";
import { DEFAULT_BRAND_LOGO_FALLBACK } from "@/Components/Cards/EventCard";

export interface EventEditModalProps extends UseEventEditModalProps {
  className?: string;
}

export default function EventEditModal({
  isOpen,
  event,
  onClose,
  onSave,
  className = "",
}: EventEditModalProps) {
  const {
    formData,
    isEditing,
    isSubmitting,
    errorMessage,
    handleChange,
    handleSubmit,
  } = useEventEditModal({ isOpen, event, onClose, onSave });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-edit-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <form
        onSubmit={handleSubmit}
        className={`relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* ─── MODAL HEADER (Styled like EventDetailModal) ─── */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full ring-2 ring-slate-100 shadow-sm bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden p-1">
              <img
                src={formData.brandLogoUrl || DEFAULT_BRAND_LOGO_FALLBACK}
                alt={formData.brandScope || "Brand"}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2
              id="event-edit-title"
              className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug"
            >
              {isEditing ? "แก้ไขข้อมูลกิจกรรม" : "สร้างกิจกรรมใหม่"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              กำหนดรายละเอียด แบรนด์ วันที่ และทีมผู้รับผิดชอบ
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <svg aria-hidden="true" className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ─── ERROR BANNER ─── */}
        {errorMessage && (
          <div role="alert" className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* ─── FORM BODY ─── */}
        <div className="py-4 space-y-4 text-xs text-slate-700 flex-1 overflow-y-auto max-h-[60vh] pr-1">
          {/* Event Name */}
          <div className="space-y-1.5">
            <label htmlFor="eventName" className="block text-xs font-bold text-slate-800">
              ชื่อกิจกรรม <span className="text-rose-500">*</span>
            </label>
            <input
              id="eventName"
              type="text"
              value={formData.eventName || ""}
              onChange={(e) => handleChange("eventName", e.target.value)}
              placeholder="เช่น แคมเปญวันเด็ก แจกโดนัทและของขวัญ"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
            />
          </div>

          {/* Category Selector Pills */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-800">หมวดหมู่กิจกรรม</span>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_CATEGORIES.map((cat) => {
                const isSelected = (formData.eventCategory || "").toUpperCase() === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleChange("eventCategory", cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand Scope & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="brandScope" className="block text-xs font-bold text-slate-800">
                แบรนด์ที่จัดกิจกรรม
              </label>
              <select
                id="brandScope"
                value={formData.brandScope || COMMON_BRANDS[0]}
                onChange={(e) => handleChange("brandScope", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
              >
                {COMMON_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="eventStatus" className="block text-xs font-bold text-slate-800">
                สถานะ
              </label>
              <select
                id="eventStatus"
                value={formData.eventStatus || "Active"}
                onChange={(e) => handleChange("eventStatus", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
              >
                <option value="Upcoming">Upcoming (รอเริ่ม)</option>
                <option value="Active">Active (กำลังดำเนินงาน)</option>
                <option value="Completed">Completed (เสร็จสิ้น)</option>
              </select>
            </div>
          </div>

          {/* Date & Time Grid (Unified Schedule Box) */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <span className="block text-xs font-bold text-slate-800">กำหนดการ & เวลา</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="eventDate" className="block text-[11px] font-medium text-slate-600 mb-1">
                  วันที่เริ่ม <span className="text-rose-500">*</span>
                </label>
                <input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate || ""}
                  onChange={(e) => handleChange("eventDate", e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
                />
              </div>

              <div>
                <label htmlFor="eventEndDate" className="block text-[11px] font-medium text-slate-600 mb-1">
                  วันที่สิ้นสุด (ถ้าจัดหลายวัน)
                </label>
                <input
                  id="eventEndDate"
                  type="date"
                  value={formData.eventEndDate || ""}
                  onChange={(e) => handleChange("eventEndDate", e.target.value || null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-[11px] font-medium text-slate-600 mb-1">
                  เวลาเริ่ม
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={formData.startTime || "09:00"}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-[11px] font-medium text-slate-600 mb-1">
                  เวลาสิ้นสุด
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={formData.endTime || "17:00"}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label htmlFor="eventLocation" className="block text-xs font-bold text-slate-800">
              สถานที่จัดกิจกรรม
            </label>
            <input
              id="eventLocation"
              type="text"
              value={formData.eventLocation || ""}
              onChange={(e) => handleChange("eventLocation", e.target.value)}
              placeholder="เช่น Central World ชั้น 3, ทุกสาขากรุงเทพฯ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-bold text-slate-800">
              คำอธิบายเพิ่มเติม
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="ระบุรายละเอียดของกิจกรรม เป้าหมาย หรือข้อความแจ้งเตือน..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
            />
          </div>
        </div>

        {/* ─── FOOTER ACTIONS ─── */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>กำลังบันทึก...</span>
            ) : (
              <>
                <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>บันทึกข้อมูล</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
