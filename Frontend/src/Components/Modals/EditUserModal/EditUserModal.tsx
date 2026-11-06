"use client";

import React, { useEffect } from "react";
import { UserModel, UpdateUserPayload } from "@/Types/user";
import OrgHierarchyTreeSidebar from "@/Components/Sidebars/OrgHierarchyTreeSidebar";
import { useEditUserModal } from "./useEditUserModal";

export interface EditUserModalProps {
  isOpen: boolean;
  user: UserModel | null;
  availableBrands?: string[];
  availableBranches?: string[];
  onClose: () => void;
  onSave?: (id: string, userData: UpdateUserPayload) => Promise<void> | void;
}

export default function EditUserModal({
  isOpen,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
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
  } = useEditUserModal({
    isOpen,
    user,
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

  if (!isOpen || !user) return null;

  const targetBranches = formData.assignedBranches || [];
  const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-modal-title"
      className="fixed inset-0 z-[55] flex items-center justify-center p-3 sm:p-5 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-200 select-none"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-5xl xl:max-w-6xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* ─── 1. MODAL HEADER BAR ─── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* User Action Icon Squircle */}
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2
                id="edit-user-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug truncate"
              >
                {fullName ? `แก้ไขข้อมูล: ${fullName}` : "แก้ไขข้อมูลผู้ใช้งาน (Edit User Profile)"}
              </h2>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  {formData.tierLevel}
                </span>

                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[320px]"
                  title={formData.dataAccessScope}
                >
                  <svg className="w-3 h-3 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="truncate">{formData.dataAccessScope || "All Organizations"}</span>
                </span>
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

        {/* ─── 3. SPLIT WORKSPACE BODY (Left: Org Hierarchy Tree | Right: Details Form) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] flex-1 overflow-hidden min-h-0">
          
          {/* ─── LEFT PANEL: 5-TIER ORG HIERARCHY TREE SIDEBAR ─── */}
          <aside className="border-r border-slate-100 bg-slate-50/50 flex flex-col overflow-hidden h-full">
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
              className="w-full h-full border-0 rounded-none shadow-none bg-transparent"
            />
          </aside>

          {/* ─── RIGHT PANEL: USER FORM & ASSIGNED SCOPE DETAILS ─── */}
          <main className="p-5 sm:p-6 overflow-y-auto bg-white space-y-5 custom-scrollbar">
            
            {/* 1. ข้อมูลส่วนตัวผู้ใช้งาน */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

                {/* Email Address - LOCKED */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>อีเมล (Corporate Email)</span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      (ล็อกไม่อนุญาตให้แก้ไข)
                    </span>
                  </label>
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={formData.email}
                    title="อีเมลบัญชีผู้ใช้ถูกล็อก ไม่สามารถแก้ไขได้"
                    className="h-9 w-full px-3 text-xs bg-slate-100/90 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed select-none"
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

                {/* User Code - LOCKED */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>รหัสพนักงาน (User ID)</span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      (ล็อกไม่อนุญาตให้แก้ไข)
                    </span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={formData.userCode}
                    title="รหัสพนักงาน / User ID ถูกล็อก ไม่สามารถแก้ไขได้"
                    className="h-9 w-full px-3 text-xs bg-slate-100/90 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed select-none"
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
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>ขอบเขตสิทธิ์องค์กรและการเข้าถึงข้อมูล (Data Access & Scope Permissions)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* ช่อง DataAccess Scope */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    ขอบเขตสิทธิ์การเข้าถึงข้อมูล (DataAccess Scope)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-indigo-600 pointer-events-none">
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
                      className="h-9 w-full pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold truncate cursor-default"
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
            </div>

            {/* 3. สรุปขอบเขตสาขาและแบรนด์ที่ผูก (Assigned Scopes Preview) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  สาขาในขอบเขตการดูแล ({targetBranches.length} สาขา)
                </span>
                <div className="flex items-center gap-2 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={selectAllBranches}
                    className="text-indigo-600 hover:underline cursor-pointer"
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
                <p className="text-xs text-slate-400 py-3 bg-slate-50/50 rounded-xl text-center border border-dashed border-slate-200">
                  ยังไม่มีสาขาที่ได้รับมอบหมายในขอบเขตนี้
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  {targetBranches.map((branchName) => (
                    <span
                      key={branchName}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200/90 text-slate-800 shadow-2xs"
                    >
                      <span>{branchName}</span>
                      <button
                        type="button"
                        onClick={() => toggleBranch(branchName)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        aria-label={`Remove ${branchName}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Account Status Toggle */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
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
                  {formData.status === "Active" ? "Active (เปิดใช้งาน)" : "Inactive (ปิดใช้งาน)"}
                </span>
              </label>
            </div>
          </main>
        </div>

        {/* ─── 4. MODAL FOOTER ─── */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3 shrink-0">
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
            <span>{isSubmitting ? "Updating..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
