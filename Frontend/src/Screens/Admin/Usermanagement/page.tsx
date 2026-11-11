"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import UserMetricCards from "@/Components/Cards/UserMetricCards";
import UserTable from "@/Components/Tables/UserTable";
import CreateUserModal from "@/Components/Modals/CreateUserModal";
import EditUserModal from "@/Components/Modals/EditUserModal";
import ConfirmDialogModal from "@/Components/Modals/ConfirmDialogModal";
import DataAccessManagementScreen from "@/Screens/Admin/DataAccessManagement/page";
import { useUsermanagementScreen } from "./useUsermanagementScreen";

export default function UsermanagementScreen() {
  const {
    userConfig,
    activeTab,
    userManagementTabs,
    handleTabChange,
    users,
    availableBrands,
    availableBranches,
    isLoading,
    isCreateModalOpen,
    isEditModalOpen,
    editingUser,
    isDeleteConfirmOpen,
    deletingUser,
    isDeleting,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleSaveCreateUser,
    handleOpenEditModal,
    handleCloseEditModal,
    handleSaveEditUser,
    handleToggleStatus,
    handleRequestDelete,
    handleCloseDeleteConfirm,
    handleConfirmDelete,
  } = useUsermanagementScreen();

  return (
    <div className="space-y-6">
      {/* ─── 1. MODULAR PAGE HEADER (Dynamically bound to reactive userConfig & Tabs) ─── */}
      <PageHeader
        title={userConfig.pageTitle}
        description={userConfig.pageDescription}
        tabs={userManagementTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryAction={
          activeTab === "users"
            ? {
                label: "+ เพิ่มผู้ใช้งานใหม่ (Add User)",
                icon: <span className="material-symbols-outlined text-[18px]">person_add</span>,
                onClick: handleOpenCreateModal,
              }
            : undefined
        }
      />

      {/* ─── 2. TAB CONTENT: USER ACCOUNTS vs DATA ACCESS SCOPE ─── */}
      {activeTab === "users" && (
        <>
          {/* USER METRIC KPI CARDS */}
          <UserMetricCards users={users} isLoading={isLoading} />

          {/* USER ACCOUNTS DATA TABLE */}
          <UserTable
            users={users}
            isLoading={isLoading}
            onAddUser={handleOpenCreateModal}
            onEditUser={handleOpenEditModal}
            onToggleStatus={handleToggleStatus}
            onDeleteUser={handleRequestDelete}
          />
        </>
      )}

      {activeTab === "dataaccess" && (
        <DataAccessManagementScreen hideHeader />
      )}

      {/* ─── 4. CREATE USER MODAL ─── */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        availableBrands={availableBrands}
        availableBranches={availableBranches}
        onClose={handleCloseCreateModal}
        onSave={handleSaveCreateUser}
      />

      {/* ─── 5. EDIT USER MODAL ─── */}
      <EditUserModal
        isOpen={isEditModalOpen}
        user={editingUser}
        availableBrands={availableBrands}
        availableBranches={availableBranches}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditUser}
      />

      {/* ─── 6. DELETE CONFIRMATION DIALOG ─── */}
      <ConfirmDialogModal
        isOpen={isDeleteConfirmOpen}
        title="ยืนยันการลบบัญชีผู้ใช้งาน"
        description={
          deletingUser
            ? `คุณต้องการลบบัญชีผู้ใช้งาน "${deletingUser.firstName} ${deletingUser.lastName}" (${deletingUser.email}) หรือไม่? การกระทำนี้จะเพิกถอนสิทธิ์การเข้าใช้งานระบบทันที`
            : "คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้งานนี้?"
        }
        confirmLabel="ลบบัญชีผู้ใช้"
        cancelLabel="ยกเลิก"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteConfirm}
      />
    </div>
  );
}
