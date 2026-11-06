"use client";

import React, { useEffect } from "react";
import { BranchModel } from "@/Types/branch";
import { useBranchModal } from "./useBranchModal";

export interface BranchModalProps {
  isOpen: boolean;
  branch?: BranchModel | null;
  editingBranch?: BranchModel | null;
  currentScopeContext?: {
    brandName?: string;
    regionName?: string;
    provinceName?: string;
  };
  masterBrands?: string[];
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (branchData: any) => Promise<void> | void;
}

export default function BranchModal({
  isOpen,
  branch,
  editingBranch,
  currentScopeContext,
  onClose,
  onSave,
}: BranchModalProps) {
  const targetBranch = editingBranch ?? branch ?? null;
  const {
    formData,
    isSubmitting,
    errorMessage,
    handleChange,
    handleSubmit,
  } = useBranchModal({
    isOpen,
    branch: targetBranch,
    onSave,
    onClose,
  });

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(branch);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-modal-title"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── MODAL HEADER ─── */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-light)] text-[var(--primary-container)] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h2 id="branch-modal-title" className="text-base font-extrabold text-slate-900 leading-snug">
                {isEditing ? "แก้ไขข้อมูลสาขา (Edit Branch)" : "เพิ่มสาขาใหม่ (Add New Branch)"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                จัดการข้อมูลสาขาและเครือข่าย Co-Location ร้านค้าในเครือ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-2xs"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ─── MODAL BODY & FORM ─── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Branch Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              ชื่อสาขา (Branch Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. KFC เซ็นทรัล เชียงใหม่ แอร์พอร์ต"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]/20 focus:border-[var(--primary-container)] text-slate-800 placeholder-slate-400 transition-all font-semibold"
            />
          </div>

          {/* Branch Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              รหัสสาขา (Branch Code) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="e.g. KFC-CNX-01 หรือ MD-ARI-01"
              className="w-full px-3.5 py-2.5 text-sm font-mono font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]/20 focus:border-[var(--primary-container)] text-slate-700 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Active Context Banner (Auto-derived from Selected Scope) */}
          {(currentScopeContext?.brandName || currentScopeContext?.provinceName || currentScopeContext?.regionName || branch?.brand) && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <svg className="w-4 h-4 text-[var(--primary-container)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>
                  {branch
                    ? `${branch.brand || "-"} • ${branch.province || branch.region || "-"}`
                    : `${currentScopeContext?.brandName || "แบรนด์ที่เลือก"} • ${currentScopeContext?.provinceName || currentScopeContext?.regionName || "พื้นที่ที่เลือก"}`}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[var(--primary-container)] bg-[var(--accent-bg)] px-2 py-0.5 rounded-full border border-[var(--accent-light)]">
                กำหนดจาก Tree อัตโนมัติ
              </span>
            </div>
          )}

          {/* Kiosk Count & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">จำนวนตู้ Kiosk ประจำสาขา</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={formData.kioskCount}
                onChange={(e) => handleChange("kioskCount", parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]/20 focus:border-[var(--primary-container)] text-slate-800 transition-all font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">สถานะสาขา (Status)</label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value as "Active" | "Inactive")}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]/20 focus:border-[var(--primary-container)] text-slate-800 cursor-pointer appearance-none transition-all pr-9 font-bold"
                >
                  <option value="Active">Active (เปิดให้บริการ)</option>
                  <option value="Inactive">Inactive (ปิดปรับปรุง)</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* ─── MODAL FOOTER ─── */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4.5 py-2 text-xs font-semibold text-white bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] active:scale-98 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeLinecap="round" />
                  </svg>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>{isEditing ? "บันทึกการแก้ไขสาขา" : "สร้างสาขาใหม่"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
