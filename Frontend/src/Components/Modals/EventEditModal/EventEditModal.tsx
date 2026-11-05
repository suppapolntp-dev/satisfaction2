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
    branchSearchQuery,
    setBranchSearchQuery,
    branchesByBrand,
    expandedBrands,
    toggleBrandExpand,
    toggleBranch,
    selectAllBranches,
    clearAllBranches,
    handleChange,
    handleSubmit,
  } = useEventEditModal({ isOpen, event, onClose, onSave });

  if (!isOpen) return null;

  const targetBranches = formData.targetBranchNames || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-edit-title"
      className="fixed inset-0 z-[55] flex items-center justify-center p-3 sm:p-5 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-200 select-none"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <form
        onSubmit={handleSubmit}
        className={`relative z-10 w-full max-w-5xl xl:max-w-6xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* ─── 1. MODAL HEADER BAR ─── */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Big Circular Brand Logo Avatar */}
            <div className="w-12 h-12 rounded-full ring-2 ring-slate-100 shadow-sm bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden p-1.5 shrink-0">
              <img
                src={formData.brandLogoUrl || DEFAULT_BRAND_LOGO_FALLBACK}
                alt={formData.brandScope || "Brand"}
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="event-edit-title"
                  className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-snug"
                >
                  {isEditing ? "แก้ไขข้อมูลกิจกรรม (Edit Event Studio)" : "สร้างกิจกรรมใหม่ (Add Event Studio)"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0">
                  เลือกแล้ว {targetBranches.length} สาขา
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-none mt-1 truncate">
                กำหนดขอบเขตสาขาทางซ้ายมือ และกรอกรายละเอียดกำหนดการกิจกรรมทางขวามือ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <svg aria-hidden="true" className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ─── 2. ERROR BANNER ─── */}
        {errorMessage && (
          <div role="alert" className="mx-6 mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 shrink-0">
            {errorMessage}
          </div>
        )}

        {/* ─── 3. SPLIT WORKSPACE BODY (Left: Scope Tree | Right: Event Form) ─── */}
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 flex-1 overflow-hidden min-h-0">
          
          {/* ─── LEFT PANEL: SCOPE HIERARCHY TREEVIEW (ตาม image_2680fd.png) ─── */}
          <aside className="w-full lg:w-80 xl:w-88 shrink-0 flex flex-col bg-slate-50/50 p-4 sm:p-5 overflow-hidden">
            {/* Header + Quick Actions */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  SCOPE HIERARCHY
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={selectAllBranches}
                  className="text-[var(--primary-container)] hover:underline cursor-pointer"
                >
                  เลือกทั้งหมด
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={clearAllBranches}
                  className="text-slate-500 hover:text-rose-600 cursor-pointer"
                >
                  ล้างค่า
                </button>
              </div>
            </div>

            {/* Filter Search Input (image_2680fd.png) */}
            <div className="mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-600 shadow-2xs focus-within:border-[var(--primary-container)]">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={branchSearchQuery}
                  onChange={(e) => setBranchSearchQuery(e.target.value)}
                  placeholder="Filter brand / branch..."
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400"
                />
                {branchSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBranchSearchQuery("")}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Tree Branch Nodes List (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {Object.keys(branchesByBrand).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  ไม่พบสาขาที่ตรงกับการค้นหา
                </div>
              ) : (
                Object.entries(branchesByBrand).map(([brandName, branches]) => {
                  const isExpanded = expandedBrands[brandName] !== false;
                  const selectedInBrandCount = branches.filter((b) =>
                    targetBranches.includes(b.name)
                  ).length;
                  const isAllInBrandSelected = selectedInBrandCount === branches.length;

                  return (
                    <div
                      key={brandName}
                      className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden transition-all"
                    >
                      {/* Brand Group Header Node */}
                      <div className="p-2.5 flex items-center justify-between bg-slate-50/70 border-b border-slate-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleBrandExpand(brandName)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <svg
                              aria-hidden="true"
                              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>

                          <span className="text-xs font-bold text-slate-800 truncate">
                            {brandName}
                          </span>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                          {selectedInBrandCount}/{branches.length}
                        </span>
                      </div>

                      {/* Branch Child Leaf Nodes */}
                      {isExpanded && (
                        <div className="p-1.5 space-y-1 bg-white">
                          {branches.map((branch) => {
                            const isChecked = targetBranches.includes(branch.name);
                            return (
                              <label
                                key={branch.id}
                                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer text-xs transition-colors select-none ${
                                  isChecked
                                    ? "bg-blue-50/80 text-blue-950 font-semibold"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleBranch(branch.name)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 text-[var(--primary-container)] accent-[var(--primary-container)] cursor-pointer"
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="block truncate">{branch.name}</span>
                                  <span className="block text-[10px] text-slate-400 font-normal leading-tight">
                                    {branch.province} • {branch.kioskCount} ตู้ Kiosk
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* ─── RIGHT PANEL: EVENT FORM CONFIGURATION WORKSPACE ─── */}
          <main className="flex-1 flex flex-col p-5 sm:p-6 overflow-y-auto bg-white space-y-4">
            {/* Card 1: ชื่อกิจกรรม & หมวดหมู่ */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="space-y-1.5">
                <label htmlFor="eventName" className="block text-xs font-bold text-slate-800">
                  ชื่อกิจกรรม / แคมเปญ <span className="text-rose-500">*</span>
                </label>
                <input
                  id="eventName"
                  type="text"
                  value={formData.eventName || ""}
                  onChange={(e) => handleChange("eventName", e.target.value)}
                  placeholder="เช่น แคมเปญวันเด็ก แจกโดนัทและของขวัญฟรี"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
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
                            ? "bg-slate-900 text-white shadow-xs font-bold"
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

              {/* Brand & Status Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1.5">
                  <label htmlFor="brandScope" className="block text-xs font-bold text-slate-800">
                    แบรนด์เจ้าภาพ
                  </label>
                  <select
                    id="brandScope"
                    value={formData.brandScope || COMMON_BRANDS[0]}
                    onChange={(e) => handleChange("brandScope", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
                  >
                    {COMMON_BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="eventStatus" className="block text-xs font-bold text-slate-800">
                    สถานะการดำเนินงาน
                  </label>
                  <select
                    id="eventStatus"
                    value={formData.eventStatus || "Active"}
                    onChange={(e) => handleChange("eventStatus", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
                  >
                    <option value="Upcoming">Upcoming (รอเริ่ม)</option>
                    <option value="Active">Active (กำลังดำเนินงาน)</option>
                    <option value="Completed">Completed (เสร็จสิ้น)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: กำหนดการ & เวลา (Unified Schedule Card) */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <svg aria-hidden="true" className="w-4 h-4 text-[var(--primary-container)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-xs font-bold text-slate-800">กำหนดการและเวลา</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="eventDate" className="block text-[11px] font-medium text-slate-600 mb-1">
                    วันที่เริ่มต้น <span className="text-rose-500">*</span>
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
                    วันที่สิ้นสุด (ถ้าจัดงานหลายวัน)
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
                    เวลาเริ่มงาน
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
                    เวลาเลิกงาน
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

            {/* Card 3: สาขาที่ร่วมรายการ (Live Sync จากแถบซ้าย!) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <svg aria-hidden="true" className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-xs font-bold text-slate-800">
                    สาขาเป้าหมายที่เลือก ({targetBranches.length} สาขา)
                  </span>
                </div>
                {targetBranches.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllBranches}
                    className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>

              {targetBranches.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
                  ยังไม่ได้เลือกสาขา (สามารถคลิกติ๊กเลือกสาขาได้จากแถบด้านซ้ายมือ)
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {targetBranches.map((branchName) => (
                    <span
                      key={branchName}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-semibold"
                    >
                      <span className="truncate max-w-[200px]">{branchName}</span>
                      <button
                        type="button"
                        onClick={() => toggleBranch(branchName)}
                        className="hover:text-rose-600 cursor-pointer text-slate-400"
                        title="ลบออก"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card 4: สถานที่ & คำอธิบาย */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="space-y-1.5">
                <label htmlFor="eventLocation" className="block text-xs font-bold text-slate-800">
                  สถานที่หลัก / จุดสังเกต
                </label>
                <input
                  id="eventLocation"
                  type="text"
                  value={formData.eventLocation || ""}
                  onChange={(e) => handleChange("eventLocation", e.target.value)}
                  placeholder="เช่น Central World ชั้น 3 โซน Beacon หรือ ทุกสาขากรุงเทพฯ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="block text-xs font-bold text-slate-800">
                  คำอธิบายรายละเอียด
                </label>
                <textarea
                  id="description"
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="ระบุเป้าหมายของกิจกรรม โปรโมชั่น หรือรายละเอียดงานซ่อมบำรุง..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
                />
              </div>
            </div>
          </main>
        </div>

        {/* ─── 4. MODAL FOOTER BAR ─── */}
        <div className="p-4 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            กำลังจัดกิจกรรมสำหรับ: <strong className="text-slate-800 font-bold">{formData.brandScope || "All Brands"}</strong> ({targetBranches.length} สาขา)
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{isEditing ? "บันทึกการแก้ไข" : "บันทึกและสร้างกิจกรรม"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
