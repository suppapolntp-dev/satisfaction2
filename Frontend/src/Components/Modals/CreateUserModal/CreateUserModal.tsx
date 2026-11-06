"use client";

import React, { useEffect } from "react";
import { CreateUserPayload } from "@/Types/user";
import OrgHierarchyTreeSidebar from "@/Components/Sidebars/OrgHierarchyTreeSidebar";
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
    orgTree,
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

              {/* Live Preview Metadata: Tier Badge + Scope Path + Monogram Stack */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                  {formData.tierLevel}
                </span>

                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[280px] sm:max-w-[360px]"
                  title={formData.dataAccessScope}
                >
                  <svg className="w-3 h-3 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="truncate">{formData.dataAccessScope || "All Organizations"}</span>
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
                      <span className="truncate text-xs font-medium text-slate-700 max-w-[200px] sm:max-w-[260px]">
                        {targetBranches.length} สาขา
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
          
          {/* ─── LEFT PANEL: 5-TIER ORG HIERARCHY TREE SIDEBAR (Identical to Dashboard Analyses) ─── */}
          <aside className="w-full lg:w-80 xl:w-84 shrink-0 flex flex-col bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden">
            <OrgHierarchyTreeSidebar
              brandHierarchy={orgTree.brandHierarchy}
              searchQuery={orgTree.searchQuery}
              onSearchChange={orgTree.setSearchQuery}
              selectedScopeLevel={orgTree.selectedScopeLevel}
              selectedBrand={orgTree.selectedBrand}
              selectedRegion={orgTree.selectedRegion}
              selectedProvince={orgTree.selectedProvince}
              selectedBranch={orgTree.selectedBranch}
              expandedNodes={orgTree.expandedNodes}
              onToggleNode={orgTree.toggleNode}
              onSelectSuperAdmin={orgTree.selectSuperAdmin}
              onSelectBrand={orgTree.selectBrand}
              onSelectRegion={orgTree.selectRegion}
              onSelectProvince={orgTree.selectProvince}
              onSelectBranch={orgTree.selectBranch}
              collapsible={false}
              className="w-full border-0 rounded-none shadow-none bg-transparent"
            />
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

            {/* 2. ขอบเขตสิทธิ์การเข้าถึงข้อมูล (DataAccess Scope) & ระดับขอบเขตสิทธิ์องค์กร (Tier Level) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              {/* ช่อง DataAccess Scope */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  ขอบเขตสิทธิ์การเข้าถึงข้อมูล (DataAccess Scope) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-blue-600 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={formData.dataAccessScope || "All Organizations (สำนักงานใหญ่)"}
                    title={formData.dataAccessScope}
                    placeholder="เลือกจาก Tree ด้านซ้าย"
                    className="h-9 w-full pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold truncate cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  ระดับ: {orgTree.activeScopeInfo.tier} ({orgTree.activeScopeInfo.title})
                </span>
              </div>

              {/* ระดับขอบเขตสิทธิ์องค์กร (Data Access Tier Level) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  ระดับขอบเขตสิทธิ์องค์กร (Tier Level) <span className="text-red-500">*</span>
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
                <span className="text-[10px] text-slate-400 block truncate">
                  ปรับอัตโนมัติตาม Node ที่เลือก หรือกำหนดเองได้
                </span>
              </div>
            </div>

            {/* 3. สรุปขอบเขตสาขาและแบรนด์ที่ผูก (Assigned Scopes Preview) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  สาขาทั้งหมดในขอบเขต ({targetBranches.length} สาขา)
                </span>
                <div className="flex items-center gap-2 text-[10px] font-semibold">
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
                    ลบทั้งหมด
                  </button>
                </div>
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
