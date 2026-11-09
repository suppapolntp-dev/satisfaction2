"use client";

import React from "react";
import SearchInput from "@/Components/Inputs/SearchInput";
import RolePermissionTable from "@/Components/Tables/RolePermissionTable";
import RoleModal from "@/Components/Modals/RoleModal";
import ConfirmDialogModal from "@/Components/Modals/ConfirmDialogModal";
import { useRoleManagementScreen } from "./useRoleManagementScreen";

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

  return (
    <div className="space-y-6">
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <span>Role &amp; Permission Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 pl-12.5">
            กำหนดสิทธิ์การเข้าถึงเมนูและการทำงานต่าง ๆ ของระบบแบบแยกรายโมดูล (Granular Access Control)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateRoleModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="14" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
          <span>Create New Role</span>
        </button>
      </div>

      {/* ─── 2. SPLIT-PANE WORKSPACE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: System Roles List Selection */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                System Roles ({filteredRolesList.length})
              </h3>
              <button
                type="button"
                onClick={handleOpenCreateRoleModal}
                className="text-xs font-bold text-blue-900 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                + New
              </button>
            </div>
            <SearchInput
              value={searchRoleQuery}
              onChange={setSearchRoleQuery}
              placeholder="ค้นหาชื่อหรือรหัสบทบาท..."
              className="w-full"
            />
          </div>

          <div className="p-2.5 flex flex-col gap-2 max-h-[580px] overflow-y-auto">
            {filteredRolesList.map((roleItem) => {
              const isCurrentRoleActive = roleItem.roleId === selectedRoleId;

              return (
                <div
                  key={roleItem.roleId}
                  onClick={() => handleSelectRole(roleItem.roleId)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all duration-150 border cursor-pointer group relative ${
                    isCurrentRoleActive
                      ? "bg-blue-50/90 border-blue-900 shadow-xs ring-1 ring-blue-900"
                      : "bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="min-w-0 pr-2">
                      <span
                        className={`font-extrabold text-xs block truncate ${
                          isCurrentRoleActive ? "text-blue-950" : "text-slate-800"
                        }`}
                      >
                        {roleItem.roleName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {roleItem.roleCode || roleItem.roleId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {roleItem.isSystemDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                          Standard
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {roleItem.totalUsersCount || 0} Users
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {roleItem.roleDescription}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>อัปเดต: {roleItem.roleLastModified}</span>

                    {/* Role Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditRoleModal(roleItem);
                        }}
                        title="แก้ไขข้อมูลบทบาท"
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {!roleItem.isSystemDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestDeleteRole(roleItem);
                          }}
                          title="ลบบทบาทนี้"
                          className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded text-slate-400 cursor-pointer transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRolesList.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                ไม่พบข้อมูลบทบาทที่ค้นหา
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Granular Permission Matrix */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden p-6 flex flex-col gap-5">
          {/* Header Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-900 rounded-full inline-block" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  สิทธิ์การใช้งาน:{" "}
                  <span className="text-blue-900">
                    {activeSelectedRole ? activeSelectedRole.roleName : "ยังไม่มีบทบาทที่ถูกเลือก"}
                  </span>
                </h3>
                {isCurrentRoleSystemDefault && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                    System Default
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกทำเครื่องหมายเพื่อเปิดหรือปิดสิทธิ์เฉพาะแต่ละฟังก์ชันของระบบ
              </p>
            </div>

            {/* Matrix Action Buttons */}
            {activeSelectedRole && (
              <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleToggleAllPermissions(true)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  title="เลือกเปิดสิทธิ์ทั้งหมด"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleAllPermissions(false)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  title="ล้างสิทธิ์ทั้งหมด"
                >
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefaultPermissions}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Reset Default
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSavePermissionChanges}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>กำลังบันทึก...</span>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      <span>Save Permissions</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Reusable Permission Table Component */}
          {activeSelectedRole ? (
            <RolePermissionTable
              permissionData={currentRolePermissions}
              onPermissionChange={handlePermissionFieldToggle}
              isLoading={isLoading}
            />
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              ยังไม่มีบทบาทที่ถูกเลือก กรุณาเลือกหรือสร้างบทบาทใหม่จากรายการด้านซ้าย
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. CREATE / EDIT ROLE MODAL ─── */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseRoleModal}
        editingRole={editingRole}
        existingRoles={rolesList}
        onSave={handleSaveRole}
      />

      {/* ─── 5. CONFIRM DELETE ROLE DIALOG ─── */}
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
