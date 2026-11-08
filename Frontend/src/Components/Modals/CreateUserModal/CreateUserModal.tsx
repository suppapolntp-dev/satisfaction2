"use client";

import React, { useEffect } from "react";
import { UserModel, CreateUserPayload, UpdateUserPayload } from "@/Types/user";
import OrgHierarchyTreeSidebar from "@/Components/Sidebars/OrgHierarchyTreeSidebar";
import { useCreateUserModal, DefaultScopeConfig } from "./useCreateUserModal";

export interface CreateUserModalProps {
  isOpen: boolean;
  user?: UserModel | null;
  defaultScope?: DefaultScopeConfig;
  availableBrands?: string[];
  availableBranches?: string[];
  onClose: () => void;
  onSave?: (userData: any) => Promise<void> | void;
}

export default function CreateUserModal({
  isOpen,
  user,
  defaultScope,
  availableBrands = [],
  availableBranches = [],
  onClose,
  onSave,
}: CreateUserModalProps) {
  const {
    userConfig,
    formData,
    isEditMode,
    isPasswordVisible,
    copiedField,
    orgTree,
    handleGenerateCorporateId,
    handleGeneratePassword,
    togglePasswordVisibility,
    handleCopyField,
    toggleBranch,
    selectAllBranches,
    clearAllBranches,
    isSubmitting,
    errorMessage,
    activeTab,
    setActiveTab,
    scopedSql,
    copiedSql,
    handleCopySql,
    handleChange,
    handleSubmit,
  } = useCreateUserModal({
    isOpen,
    user,
    defaultScope,
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
  const currentRole = userConfig.roles.find((r) => r.name === formData.role) || userConfig.roles[0];

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
        className="relative z-10 w-full max-w-6xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] md:h-[680px] animate-in zoom-in-95 duration-200"
      >
        {/* ─── 1. MODAL HEADER BAR (Figma 13-91 Parity) ─── */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* User Action Icon Squircle */}
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2
                id="create-user-modal-title"
                className="text-base font-bold text-slate-900 tracking-tight leading-snug truncate"
              >
                {isEditMode
                  ? (fullName ? `แก้ไขข้อมูล: ${fullName}` : "แก้ไขข้อมูลผู้ใช้งาน (Edit User Profile)")
                  : (fullName || "เพิ่มผู้ใช้งานใหม่ (Create New User)")}
              </h2>
            </div>
          </div>

          {/* Right Header Navigation: Tab Pills + Close Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Segmented Tab Pills Capsule */}
            <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab("account_profile")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  activeTab === "account_profile"
                    ? "bg-white text-blue-600 shadow-2xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Account Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("data_access_scope")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  activeTab === "data_access_scope"
                    ? "bg-white text-blue-600 shadow-2xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>DataAccess</span>
                {targetBranches.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 leading-none">
                    {targetBranches.length}
                  </span>
                )}
              </button>
            </div>

            {/* Circular Close Action */}
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
        </div>

        {/* ─── 2. ERROR BANNER ─── */}
        {errorMessage && (
          <div role="alert" className="mx-6 mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 shrink-0">
            {errorMessage}
          </div>
        )}

        {/* ─── 3. SPLIT WORKSPACE BODY (350px Sidebar | Fluid Form - Figma Parity) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] flex-1 overflow-hidden min-h-0">
          
          {/* ─── LEFT PANEL: 5-TIER ORG HIERARCHY TREE SIDEBAR (Figma W:350px) ─── */}
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
              scopePath={formData.dataAccessScope}
              onSelectAll={selectAllBranches}
              showBreadcrumbs={true}
              collapsible={false}
              className="w-full h-full border-0 rounded-none shadow-none bg-transparent"
            />
          </aside>

          {/* ─── RIGHT PANEL: USER FORM & ASSIGNED SCOPE DETAILS ─── */}
          <main className="p-5 sm:p-6 overflow-y-auto bg-white space-y-4 custom-scrollbar">
            
            {/* ─── TAB 1: ACCOUNT PROFILE (Figma 13-91 Order: ID/Pass -> Name -> Email/Phone -> Role) ─── */}
            {activeTab === "account_profile" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* 1.1 Section Header & Account Status Toggle */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>ข้อมูลบัญชีผู้ใช้งาน (USER ACCOUNT DETAILS)</span>
                  </div>

                  {/* Status Toggle on Right Header */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">สถานะบัญชี</span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.status === "Active"}
                        onChange={(e) => handleChange("status", e.target.checked ? "Active" : "Inactive")}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                      />
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                          formData.status === "Active"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {formData.status === "Active" ? "✓ Active" : "Inactive"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 1.2 Form Fields Grid (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* ROW 1.1: Corporate ID */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        รหัสองค์กร (Corporate ID) <span className="text-red-500">*</span>
                      </label>
                      {isEditMode && (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          (ล็อกไม่อนุญาตให้แก้ไข)
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.userCode || formData.corporateId}
                      onChange={(e) => {
                        handleChange("userCode", e.target.value);
                        handleChange("corporateId", e.target.value);
                      }}
                      placeholder="e.g. SA-169"
                      readOnly={isEditMode}
                      disabled={isEditMode}
                      title={isEditMode ? "รหัสองค์กร / User ID ถูกล็อก ไม่สามารถแก้ไขได้" : undefined}
                      className={`h-8.5 w-full px-3 text-xs rounded-xl font-mono ${
                        isEditMode
                          ? "bg-slate-100/90 border border-slate-200 text-slate-500 cursor-not-allowed select-none"
                          : "bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-bold"
                      }`}
                      required
                    />
                  </div>

                  {/* ROW 1.2: Corporate Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        รหัสผ่านองค์กร (Corporate Password) {!isEditMode && <span className="text-red-500">*</span>}
                      </label>
                      {isEditMode && (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          (คงรหัสผ่านเดิม)
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder={isEditMode ? "••••••••" : "e.g. CRG@1623#"}
                        disabled={isEditMode}
                        className={`h-8.5 w-full pl-3 pr-8 text-xs rounded-xl font-mono font-bold ${
                          isEditMode
                            ? "bg-slate-100/90 border border-slate-200 text-slate-400 cursor-not-allowed select-none"
                            : "bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                        }`}
                        required={!isEditMode}
                      />
                      {!isEditMode && (
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                        >
                          {isPasswordVisible ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="23" x2="23" y2="1" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ROW 2.1: First Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      ชื่อ (First Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="e.g. สมชาย"
                      className="h-8.5 w-full px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium placeholder:text-slate-400"
                      required
                    />
                  </div>

                  {/* ROW 2.2: Last Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      นามสกุล (Last Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="e.g. เกียรติสกุล"
                      className="h-8.5 w-full px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium placeholder:text-slate-400"
                      required
                    />
                  </div>

                  {/* ROW 3.1: Corporate Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>
                        อีเมล (Corporate Email) <span className="text-red-500">*</span>
                      </span>
                      {isEditMode && (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          (ล็อกไม่อนุญาตให้แก้ไข)
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="somchai@company.com"
                      required={!isEditMode}
                      readOnly={isEditMode}
                      disabled={isEditMode}
                      title={isEditMode ? "อีเมลบัญชีผู้ใช้ถูกล็อก ไม่สามารถแก้ไขได้" : undefined}
                      className={`h-8.5 w-full px-3 text-xs rounded-xl font-mono ${
                        isEditMode
                          ? "bg-slate-100/90 border border-slate-200 text-slate-500 cursor-not-allowed select-none"
                          : "bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
                      }`}
                    />
                  </div>

                  {/* ROW 3.2: Phone Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      เบอร์โทรศัพท์ (Phone)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+66 81 234 5678"
                      className="h-8.5 w-full px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-mono placeholder:text-slate-400"
                    />
                  </div>

                  {/* ROW 4: System Role (Full Width col-span-2) */}
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      บทบาทระบบ (System Role) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) => handleChange("role", e.target.value)}
                        className="h-8.5 w-full pl-3 pr-8 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium appearance-none cursor-pointer"
                      >
                        {userConfig.roles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* ROW 5: Role Description & Permissions Card */}
                  {currentRole && (
                    <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-2">
                          <span>{currentRole.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {currentRole.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 2: DATA ACCESS SCOPE ─── */}
            {activeTab === "data_access_scope" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* 1. ขอบเขตสิทธิ์การเข้าถึงข้อมูล (DataAccess Scope) & ระดับขอบเขตสิทธิ์องค์กร (Tier Level) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

                {/* 2. สรุปขอบเขตสาขาและแบรนด์ที่ผูก (Assigned Scopes Preview) */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      สาขาในขอบเขตการดูแล ({targetBranches.length} สาขา)
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

                {/* 3. Real-Time Scoped SQL Query Preview (Row-Level Security) Terminal */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                      <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                      <span>Row-Level Security (RLS) Query Preview</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      title="คัดลอกคำสั่ง SQL"
                    >
                      {copiedSql ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          คัดลอกแล้ว!
                        </span>
                      ) : (
                        <>
                          <svg className="w-3 h-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span>คัดลอก SQL</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-[11px] text-slate-200 overflow-x-auto shadow-inner leading-relaxed select-text">
                    <pre className="whitespace-pre-wrap break-all text-slate-300">
                      {scopedSql}
                    </pre>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    คำสั่ง SQL จำลองการจำกัดขอบเขตข้อมูล (Row-Level Data Isolation) ตาม Tier และ Scopes ที่เลือกจริงใน Backend
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* ─── 4. MODAL FOOTER ─── */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
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
            <span>
              {isSubmitting
                ? (isEditMode ? "Updating..." : "Creating User...")
                : (isEditMode ? "Save Changes" : "Save User")}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
