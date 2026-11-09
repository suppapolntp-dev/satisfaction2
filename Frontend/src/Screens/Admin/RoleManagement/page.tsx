"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
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
      {/* ─── 1. MODULAR PAGE HEADER COMPONENT ─── */}
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <span>Role &amp; Permission Matrix</span>
          </span>
        }
        description="กำหนดสิทธิ์การเข้าถึงเมนูและการทำงานต่าง ๆ ของระบบแบบแยกรายโมดูล (Granular Access Control)"
        primaryAction={{
          label: "Create New Role",
          variant: "dark",
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: System Roles List Selection */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
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

          <div className="p-2.5 flex flex-col gap-2 max-h-[640px] overflow-y-auto">
            {filteredRolesList.map((roleItem) => {
              const isCurrentRoleActive = roleItem.roleId === selectedRoleId;

              return (
                <div
                  key={roleItem.roleId}
                  onClick={() => handleSelectRole(roleItem.roleId)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-150 border cursor-pointer group relative ${
                    isCurrentRoleActive
                      ? "bg-blue-50/90 border-blue-600 shadow-xs ring-1 ring-blue-600"
                      : "bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="min-w-0 pr-2">
                      <span
                        className={`font-bold text-xs block truncate ${
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

        {/* Right Side: Granular Permission Matrix Container */}
        <div className="lg:col-span-8">
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
