"use client";

import React, { useEffect } from "react";
import { BrandModel } from "@/Types/brand";
import { useBrandModal } from "./useBrandModal";

export interface BrandModalProps {
  isOpen: boolean;
  brand: BrandModel | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<BrandModel>) => Promise<void> | void;
}

export default function BrandModal({
  isOpen,
  brand,
  onClose,
  onSave,
}: BrandModalProps) {
  const {
    formData,
    isSubmitting,
    errorMessage,
    handleChange,
    handleSubmit,
  } = useBrandModal({
    isOpen,
    brand,
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

  if (!isOpen || !brand) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-modal-title"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── MODAL HEADER ─── */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </div>
            <div>
              <h2 id="brand-modal-title" className="text-base font-bold text-slate-900 leading-snug">
                แก้ไขข้อมูลแบรนด์ (Edit Brand)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ปรับปรุงข้อมูลรายละเอียดแบรนด์ โลโก้ และสถานะการดำเนินงาน
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ─── MODAL BODY & FORM ─── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
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

          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              ชื่อแบรนด์ (Brand Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.brandName}
              onChange={(e) => handleChange("brandName", e.target.value)}
              placeholder="e.g. KFC, Mister Donut"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Brand ID & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                รหัสแบรนด์ (Brand ID)
              </label>
              <input
                type="text"
                value={formData.brandId}
                onChange={(e) => handleChange("brandId", e.target.value)}
                placeholder="e.g. BRD_001"
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                สถานะ (Status)
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value as "Active" | "Inactive")}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 cursor-pointer appearance-none transition-all pr-9"
                >
                  <option value="Active">Active (เปิดใช้งาน)</option>
                  <option value="Inactive">Inactive (ปิดใช้งาน)</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Parent Company & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                บริษัทแม่ / กลุ่มธุรกิจ (Parent Company)
              </label>
              <input
                type="text"
                value={formData.parentCompanyName}
                onChange={(e) => handleChange("parentCompanyName", e.target.value)}
                placeholder="e.g. Central Restaurants Group"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                หมวดหมู่ (Category)
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="e.g. Fast Food (QSR), Bakery"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          {/* Logo URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              URL โลโก้แบรนด์ (Logo URL)
            </label>
            <input
              type="url"
              value={formData.brandLogoUrl}
              onChange={(e) => handleChange("brandLogoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
            />
            {formData.brandLogoUrl && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <img
                  src={formData.brandLogoUrl}
                  alt="Preview"
                  className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-0.5"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-xs text-slate-500">พรีวิวโลโก้</span>
              </div>
            )}
          </div>

          {/* ─── MODAL FOOTER ─── */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeLinecap="round" />
                  </svg>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึกการเปลี่ยนแปลง</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
