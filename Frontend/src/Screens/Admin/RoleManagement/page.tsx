"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import RolePermissionTable from "@/Components/Tables/RolePermissionTable";
import RoleModal from "@/Components/Modals/RoleModal";
import ConfirmDialogModal from "@/Components/Modals/ConfirmDialogModal";
import { useRoleManagementScreen } from "./useRoleManagementScreen";
import { useRoleSettings } from "@/Lib/pageHeaderSettings";

// ==========================================================================
// ─── MAIN ROLE MANAGEMENT SCREEN COMPONENT
// ==========================================================================
export default function RoleManagementScreen() {
  const {
    rolesList,
    isLoading,
    isSaving,
    selectedRoleId,
    activeSelectedRole,
    isCurrentRoleSystemDefault,
    filteredRolesList,
    currentRolePermissions,
    searchRoleQuery,
    setSearchRoleQuery,
    isRoleModalOpen,
    editingRole,
    isDeleteConfirmOpen,
    deletingRole,
    isDeleting,
    handleSelectRole,
    handlePermissionFieldToggle,
    handleToggleAllPermissions,
    handleResetToDefaultPermissions,
    handleSavePermissionChanges,
    handleOpenCreateRoleModal,
    handleOpenEditRoleModal,
    handleCloseRoleModal,
    handleSaveRole,
    handleRequestDeleteRole,
    handleCloseDeleteConfirm,
    handleConfirmDeleteRole,
  } = useRoleManagementScreen();

  const { config: roleConfig } = useRoleSettings();

  return (
    <div className="space-y-6">
      {/* ─── 1. MODULAR PAGE HEADER COMPONENT ─── */}
      <PageHeader
        title={roleConfig.pageTitle || "Role & Permission Matrix"}
        description={roleConfig.pageSubtitle || "กำหนดสิทธิ์การเข้าถึงเมนูและการทำงานต่าง ๆ ของระบบแบบแยกรายโมดูล (Granular Access Control)"}
        primaryAction={{
          label: "Create New Role",
          variant: "primary",
          icon: (
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="14" />
              <line x1="9" y1="11" x2="15" y2="11" />
            </svg>
          ),
          onClick: handleOpenCreateRoleModal,
        }}
      />

      {/* ─── 2. SPLIT-PANE WORKSPACE ─── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: System Roles List Selection (Slim Width Sidebar matching Mockup) */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col">
          {/* 1. Header: SYSTEM ROLES (count) & Collapse Chevron */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-slate-700 uppercase">
              SYSTEM ROLES ({filteredRolesList.length})
            </h2>
            <button
              type="button"
              aria-label="Collapse sidebar"
              className="text-[var(--primary-container)] hover:opacity-80 transition-opacity p-0.5 cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* 2. Search Input: Full Pill Shape */}
          <div className="mt-3">
            <input
              type="search"
              value={searchRoleQuery}
              onChange={(e) => setSearchRoleQuery(e.target.value)}
              placeholder="ค้นหาชื่อบทบาท..."
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]/20 focus:border-[var(--primary-container)] bg-white transition-all font-sans"
            />
          </div>

          {/* 3. Roles Cards List (Clean, Minimal, No Clutter) */}
          <div className="mt-4 flex flex-col gap-2.5 max-h-[640px] overflow-y-auto">
            {filteredRolesList.map((roleItem) => {
              const isCurrentRoleActive = roleItem.roleId === selectedRoleId;

              return (
                <div
                  key={roleItem.roleId}
                  onClick={() => handleSelectRole(roleItem.roleId)}
                  className={`w-full text-left rounded-xl p-3.5 transition-all duration-150 cursor-pointer ${
                    isCurrentRoleActive
                      ? "border-2 border-slate-900 bg-blue-50/20 shadow-2xs"
                      : "border border-slate-200/80 bg-white hover:bg-slate-50/70 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {roleItem.roleName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditRoleModal(roleItem);
                      }}
                      aria-label={`แก้ไขบทบาท ${roleItem.roleName}`}
                      className="text-slate-400 hover:text-[var(--primary-container)] transition-colors p-1 cursor-pointer shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>

                  <div className="border-b border-slate-100 my-2" />

                  <p className="text-[11px] text-slate-400">
                    อัปเดต: {roleItem.roleLastModified}
                  </p>
                </div>
              );
            })}

            {filteredRolesList.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                ไม่พบข้อมูลบทบาทที่ค้นหา
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Granular Permission Matrix Container */}
        <div className="flex-1 min-w-0 w-full">
          {activeSelectedRole ? (
            <RolePermissionTable
              permissionData={currentRolePermissions}
              roleName={activeSelectedRole.roleName}
              roleCode={activeSelectedRole.roleCode || activeSelectedRole.roleId}
              isSystemDefault={isCurrentRoleSystemDefault}
              onPermissionChange={handlePermissionFieldToggle}
              onToggleAll={handleToggleAllPermissions}
              onResetDefault={handleResetToDefaultPermissions}
              onSave={handleSavePermissionChanges}
              isLoading={isLoading}
              isSaving={isSaving}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-16 text-center text-xs text-slate-400">
              ยังไม่มีบทบาทที่ถูกเลือก กรุณาเลือกหรือสร้างบทบาทใหม่จากรายการด้านซ้าย
            </div>
          )}
        </div>
      </div>

      {/* ─── 3. CREATE / EDIT ROLE MODAL ─── */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseRoleModal}
        editingRole={editingRole}
        existingRoles={rolesList}
        onSave={handleSaveRole}
      />

      {/* ─── 4. CONFIRM DELETE ROLE DIALOG ─── */}
      <ConfirmDialogModal
        isOpen={isDeleteConfirmOpen}
        title="ยืนยันการลบบทบาทผู้ใช้งาน"
        description={
          deletingRole
            ? `คุณต้องการลบบทบาท "${deletingRole.roleName}" หรือไม่? หากลบแล้วพนักงานในระบบจะไม่สามารถใช้สิทธิ์ของบทบาทนี้ได้อีก`
            : "คุณแน่ใจหรือไม่ว่าต้องการลบบทบาทนี้?"
        }
        confirmLabel="ลบบทบาท"
        cancelLabel="ยกเลิก"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteRole}
        onClose={handleCloseDeleteConfirm}
      />
    </div>
  );
}
