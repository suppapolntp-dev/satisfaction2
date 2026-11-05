"use client";

import React, { useEffect } from "react";
import { CreateUserPayload } from "@/Types/user";
import { useCreateUserModal } from "./useCreateUserModal";

export interface CreateUserModalProps {
  isOpen: boolean;
  availableBrands?: string[];
  availableBranches?: string[];
  onClose: () => void;
  onSave?: (userData: CreateUserPayload) => Promise<void> | void;
}

export default function CreateUserModal({
  isOpen,
  availableBrands = [],
  availableBranches = [],
  onClose,
  onSave,
}: CreateUserModalProps) {
  const {
    formData,
    isSubmitting,
    errorMessage,
    handleChange,
    toggleBrand,
    selectAllBrands,
    clearBrands,
    toggleBranch,
    selectAllBranches,
    clearBranches,
    handleSubmit,
  } = useCreateUserModal({
    isOpen,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-user-modal-title"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── MODAL HEADER ─── */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div>
              <h2 id="create-user-modal-title" className="text-base font-extrabold text-slate-900 leading-snug">
                เพิ่มผู้ใช้งานใหม่ (Create New User)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดข้อมูลส่วนตัว เลือกระดับสิทธิ์องค์กร และขอบเขตสาขา/แบรนด์ที่ดูแล
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto custom-scrollbar flex-1">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 flex items-center gap-2.5">
              <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-xs font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                ชื่อ (First Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="e.g. สมชาย"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all font-medium"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                นามสกุล (Last Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="e.g. เกียรติสกุล"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all font-medium"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                อีเมล (Email Address) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="somchai@company.com"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all font-mono"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                เบอร์โทรศัพท์ (Phone Number)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+66 81 234 5678"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all font-mono"
              />
            </div>

            {/* User Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                รหัสพนักงาน (User Code)
              </label>
              <input
                type="text"
                value={formData.userCode}
                onChange={(e) => handleChange("userCode", e.target.value)}
                placeholder="EMP-101"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all font-mono"
              />
            </div>

            {/* System Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                บทบาทระบบ (System Role) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all font-medium"
              >
                <option value="Administrator">Administrator (ควบคุมระบบ)</option>
                <option value="Manager">Manager (ผู้จัดการระดับเขต/แบรนด์)</option>
                <option value="Agent">Agent (เจ้าหน้าที่ปฏิบัติการ)</option>
                <option value="Auditor">Auditor (ตรวจสอบข้อมูล)</option>
                <option value="Read Only">Read Only (ดูรายงานอย่างเดียว)</option>
              </select>
            </div>
          </div>

          {/* 5-Tier Data Access Level */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              ระดับขอบเขตสิทธิ์องค์กร (Data Access Tier Level) <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tierLevel}
              onChange={(e) => handleChange("tierLevel", e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-semibold transition-all"
            >
              <option value="Super Admin">Super Administrator (ผู้ดูแลระบบระดับองค์กร - Tier 1)</option>
              <option value="Brand Owner">Brand Manager / Owner (ผู้บริหารระดับแบรนด์ - Tier 2)</option>
              <option value="Regional Manager (RM)">Regional Manager / RM (ผู้จัดการระดับภูมิภาค - Tier 3)</option>
              <option value="Area Manager (AM)">Area Manager / AM (ผู้จัดการระดับเขต - Tier 4)</option>
              <option value="Branch Staff">Branch Officer / Staff (เจ้าหน้าที่ประจำสาขา - Tier 5)</option>
              <option value="Custom Scope">Custom Scope (กำหนดขอบเขตเฉพาะบุคคล)</option>
            </select>
          </div>

          {/* Brands Scope Checkboxes */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>แบรนด์ที่ดูแล (Assigned Brands Scope):</span>
              </label>

              {availableBrands.length > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => selectAllBrands(availableBrands)}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={clearBrands}
                    className="text-slate-400 font-semibold hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {availableBrands.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">ไม่มีรายการแบรนด์ในระบบ</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableBrands.map((brandName) => {
                  const isChecked = formData.assignedBrands.includes(brandName);
                  return (
                    <label
                      key={brandName}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-colors ${
                        isChecked
                          ? "bg-blue-50 border-blue-200 text-blue-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBrand(brandName)}
                        className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-xs truncate">{brandName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Branches Scope Checkboxes */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>สาขาที่ดูแล (Assigned Branches Scope):</span>
              </label>

              {availableBranches.length > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => selectAllBranches(availableBranches)}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={clearBranches}
                    className="text-slate-400 font-semibold hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {availableBranches.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">ไม่มีรายการสาขาในระบบ</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                {availableBranches.map((branchName) => {
                  const isChecked = formData.assignedBranches.includes(branchName);
                  return (
                    <label
                      key={branchName}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-colors ${
                        isChecked
                          ? "bg-blue-50 border-blue-200 text-blue-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBranch(branchName)}
                        className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer shrink-0"
                      />
                      <span className="text-xs truncate">{branchName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account Status Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              สถานะบัญชี (Account Status)
            </span>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.status === "Active"}
                onChange={(e) => handleChange("status", e.target.checked ? "Active" : "Inactive")}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
              />
              <span className={`text-xs font-semibold ${formData.status === "Active" ? "text-emerald-700" : "text-slate-500"}`}>
                {formData.status === "Active" ? "Active (เปิดใช้งานทันที)" : "Inactive (ปิดใช้งาน)"}
              </span>
            </label>
          </div>

          {/* ─── MODAL FOOTER ─── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting && (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              <span>{isSubmitting ? "Creating..." : "Save User"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
