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
    userConfig,
    formData,
    isBranchesLoading,
    branchSearchQuery,
    setBranchSearchQuery,
    branchesByBrand,
    expandedBrands,
    toggleBrandExpand,
    toggleBranch,
    selectAllBranches,
    clearAllBranches,
    isSubmitting,
    errorMessage,
    handleChange,
    handleSubmit,
  } = useCreateUserModal({
    isOpen,
    availableBrands,
    availableBranches,
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

  const targetBranches = formData.assignedBranches || [];
  const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-user-modal-title"
      className="fixed inset-0 z-[55] flex items-center justify-center p-3 sm:p-5 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-200 select-none"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-5xl xl:max-w-6xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* ─── 1. MODAL HEADER BAR ─── */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* User Action Icon Squircle */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <h2
                id="create-user-modal-title"
                className="text-base sm:text-xl font-bold text-slate-950 tracking-tight leading-snug truncate"
              >
                {fullName || "เพิ่มผู้ใช้งานใหม่ (Create New User)"}
              </h2>

              {/* Live Preview Metadata: Tier Badge + Selected Branches Monogram Stack */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                  {formData.tierLevel}
                </span>

                <div
                  className="flex items-center gap-2 pl-2 border-l border-slate-200 min-w-0"
                  title={targetBranches.join(", ")}
                >
                  {targetBranches.length === 0 ? (
                    <span className="text-xs text-slate-400 font-medium">
                      ยังไม่ได้เลือกสาขาที่ดูแล
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center -space-x-1.5 shrink-0 overflow-hidden">
                        {targetBranches.slice(0, 3).map((name) => (
                          <span
                            key={name}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-800 ring-2 ring-white shrink-0"
                          >
                            {name.trim().charAt(0).toUpperCase()}
                          </span>
                        ))}
                        {targetBranches.length > 3 && (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white shrink-0">
                            +{targetBranches.length - 3}
                          </span>
                        )}
                      </div>
                      <span className="truncate text-xs font-medium text-slate-700 max-w-[240px] sm:max-w-[340px]">
                        {targetBranches.length} สาขา ({targetBranches.join(", ")})
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        {/* ─── 3. SPLIT WORKSPACE BODY (Left: Scope Tree | Right: Details Form) ─── */}
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 flex-1 overflow-hidden min-h-0">
          
          {/* ─── LEFT PANEL: BRANCH SELECTION SIDEBAR ─── */}
          <aside className="w-full lg:w-80 xl:w-88 shrink-0 flex flex-col bg-slate-50/50 p-4 sm:p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  BRANCH HIERARCHY
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={selectAllBranches}
                  className="text-blue-600 hover:underline cursor-pointer"
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

            {/* Filter Search Input */}
            <div className="mb-3">
              <div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white border border-slate-200/90 text-slate-600 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={branchSearchQuery}
                  onChange={(e) => setBranchSearchQuery(e.target.value)}
                  placeholder="ค้นหาแบรนด์หรือสาขา..."
                  aria-label="ค้นหาแบรนด์หรือสาขา"
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400"
                />
                {branchSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBranchSearchQuery("")}
                    aria-label="ล้างคำค้นหา"
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Branch Tree List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isBranchesLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  กำลังโหลดข้อมูลสาขา...
                </div>
              ) : Object.keys(branchesByBrand).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  ไม่พบสาขาที่ตรงกับการค้นหา
                </div>
              ) : (
                Object.entries(branchesByBrand).map(([brandName, brandBranches]) => {
                  const isExpanded = expandedBrands[brandName] !== false;
                  const selectedInBrandCount = brandBranches.filter((b) =>
                    targetBranches.includes(b.name)
                  ).length;

                  return (
                    <div
                      key={brandName}
                      className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden transition-all"
                    >
                      {/* Brand Header Accordion */}
                      <div className="p-2.5 flex items-center justify-between bg-slate-50/70 border-b border-slate-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleBrandExpand(brandName)}
                            aria-label={`ย่อหรือขยาย ${brandName}`}
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

                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {selectedInBrandCount}/{brandBranches.length}
                        </span>
                      </div>

                      {/* Branches under Brand */}
                      {isExpanded && (
                        <div className="p-1 space-y-0.5 divide-y divide-slate-50">
                          {brandBranches.map((branch) => {
                            const isChecked = targetBranches.includes(branch.name);

                            return (
                              <div
                                key={branch.id}
                                onClick={() => toggleBranch(branch.name, branch)}
                                className={`flex items-center justify-between gap-2.5 p-2 rounded-xl text-xs transition-colors cursor-pointer select-none ${
                                  isChecked
                                    ? "bg-blue-50 text-blue-900 border border-blue-200/80 font-semibold"
                                    : "hover:bg-slate-50 text-slate-700 border border-transparent"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}} // Handled by row click
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <span className="block truncate">{branch.name}</span>
                                    <span className="block text-[10px] text-slate-400 font-normal leading-tight">
                                      {branch.code} • {branch.province}
                                    </span>
                                  </div>
                                </div>

                                {isChecked && (
                                  <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
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

          {/* ─── RIGHT PANEL: USER FORM & FOCUSED BRANCH DETAILS ─── */}
          <main className="flex-1 flex flex-col p-5 sm:p-6 overflow-y-auto bg-white space-y-5 custom-scrollbar">
            
            {/* 1. ข้อมูลส่วนตัวผู้ใช้งาน */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>ข้อมูลบัญชีผู้ใช้งาน (User Account Details)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* First Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    ชื่อ (First Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="e.g. สมชาย"
                    className="h-9 w-full px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    นามสกุล (Last Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="e.g. เกียรติสกุล"
                    className="h-9 w-full px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    อีเมล (Corporate Email) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="somchai@company.com"
                    className="h-9 w-full px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-mono"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    เบอร์โทรศัพท์ (Phone)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+66 81 234 5678"
                    className="h-9 w-full px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-mono"
                  />
                </div>

                {/* User Code */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    รหัสพนักงาน (User Code)
                  </label>
                  <input
                    type="text"
                    value={formData.userCode}
                    onChange={(e) => handleChange("userCode", e.target.value)}
                    placeholder="EMP-101"
                    className="h-9 w-full px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-mono"
                  />
                </div>

                {/* System Role */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    บทบาทระบบ (System Role) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className="h-9 w-full px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                  >
                    {userConfig.roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. ระดับขอบเขตสิทธิ์องค์กร (Tier Level) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
              <label className="block text-xs font-bold text-slate-900">
                ระดับขอบเขตสิทธิ์องค์กร (Data Access Tier Level) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tierLevel}
                onChange={(e) => handleChange("tierLevel", e.target.value)}
                className="h-9 w-full px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-semibold"
              >
                {userConfig.tiers.map((tier) => (
                  <option key={tier.id} value={tier.nameEn}>
                    {tier.nameTh}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. สรุปขอบเขตสาขาและแบรนด์ที่ผูก (Assigned Scopes Preview) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  สาขาทั้งหมดที่เลือกให้ผู้ใช้งาน ({targetBranches.length} สาขา)
                </span>
                {targetBranches.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllBranches}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    ลบทั้งหมด
                  </button>
                )}
              </div>

              {targetBranches.length === 0 ? (
                <p className="text-xs text-slate-400">ยังไม่มีสาขาที่ได้รับมอบหมาย</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                  {targetBranches.map((branchName) => (
                    <span
                      key={branchName}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 text-slate-800 shadow-2xs"
                    >
                      <span>{branchName}</span>
                      <button
                        type="button"
                        onClick={() => toggleBranch(branchName)}
                        className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                        aria-label={`Remove ${branchName}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Account Status Toggle */}
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
          </main>
        </div>

        {/* ─── 4. MODAL FOOTER ─── */}
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            <span>{isSubmitting ? "Creating User..." : "Save User"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
