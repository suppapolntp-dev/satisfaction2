"use client";

import React, { useState, useEffect, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import DataTable, { TableColumn, TableAction } from "@/Components/Tables/DataTable";
import SearchInput from "@/Components/Inputs/SearchInput";
import SelectInput, { SelectOption } from "@/Components/Inputs/SelectInput";
import { searchUsers } from "@/Lib/search/searchEngine";
import CreateUserModal from "@/Components/Modals/CreateUserModal";
import EditUserModal from "@/Components/Modals/EditUserModal";
import UserImportExportModal from "@/Components/Modals/UserImportExportModal";
import { UserModel, EditableUserModel, ImportedUserModel } from "@/Types/user";
import { userService } from "@/Services/userService";
import { brandService } from "@/Services/brandService";
import { branchService } from "@/Services/branchService";

// ==========================================================================
// ─── MAIN USER MANAGEMENT COMPONENT
// ==========================================================================
export default function UserManagementScreen() {
  const [usersList, setUsersList] = useState<UserModel[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [selectedTierFilter, setSelectedTierFilter] = useState("All Tiers");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("All Brands");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Status");
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserModel | null>(null);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  // Load from services on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [users, brands, branches] = await Promise.all([
          userService.getUsers(),
          brandService.getBrands(),
          branchService.getBranches(),
        ]);
        setUsersList(users || []);
        setAvailableBrands(brands ? brands.map((b) => b.brandName) : []);
        setAvailableBranches(branches ? branches.map((b) => b.name) : []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // Dynamic KPI Stats
  const userStatsOverviewData: StatItem[] = useMemo(() => {
    const total = usersList.length;
    const activeCount = usersList.filter((u) => u.status === "Active").length;
    const multiBrandCount = usersList.filter((u) => (u.assignedBrands && u.assignedBrands.length > 1) || u.brand.includes(",")).length;
    const licenseSeats = Math.max(0, 2000 - total);

    const hasData = total > 0;

    return [
      {
        label: "Total Users (ผู้ใช้งานรวม)",
        value: hasData ? `${total.toLocaleString()} บัญชี` : "-",
        change: "",
        isUp: true,
        icon: "group",
        color: "text-blue-600",
      },
      {
        label: "Active Accounts (เปิดใช้งาน)",
        value: hasData ? `${activeCount.toLocaleString()} ใช้งาน` : "-",
        change: "",
        isUp: true,
        icon: "how_to_reg",
        color: "text-emerald-600",
      },
      {
        label: "Multi-Brand Users",
        value: hasData ? `${multiBrandCount} บัญชี` : "-",
        change: "",
        isUp: true,
        icon: "store",
        color: "text-purple-600",
      },
      {
        label: "License Quota",
        value: hasData ? `${licenseSeats.toLocaleString()} ที่นั่ง` : "-",
        change: "",
        isUp: true,
        icon: "verified_user",
        color: "text-amber-600",
      },
    ];
  }, [usersList]);

  // Filters
  const tierFilterOptions: SelectOption[] = [
    { value: "All Tiers", label: "ทุกระดับขอบเขต (All Tiers)" },
    { value: "Super Admin", label: "Super Administrator" },
    { value: "Brand Owner", label: "Brand Manager / Owner" },
    { value: "Regional Manager (RM)", label: "Regional Manager (RM)" },
    { value: "Area Manager (AM)", label: "Area Manager (AM)" },
    { value: "Branch Staff", label: "Branch Officer / Staff" },
    { value: "Custom Scope", label: "Custom Scope" },
  ];

  const brandFilterOptions: SelectOption[] = useMemo(() => [
    { value: "All Brands", label: "All Brands (ทุกแบรนด์)" },
    ...availableBrands.map((b) => ({ value: b, label: b })),
  ], [availableBrands]);

  const statusFilterOptions: SelectOption[] = [
    { value: "All Status", label: "All Statuses (ทุกสถานะ)" },
    { value: "Active", label: "Active (เปิดใช้งาน)" },
    { value: "Inactive", label: "Inactive (ปิดใช้งาน)" },
  ];

  // Callback เมื่อสร้างผู้ใช้เดี่ยวเสร็จ
  const handleUserCreated = async (newUserProfile: any) => {
    const created = await userService.createUser(newUserProfile);
    setUsersList((prev) => [created, ...prev]);
  };

  // Callback เมื่อแก้ไขข้อมูลผู้ใช้เสร็จ
  const handleUserUpdated = async (updatedUserProfile: EditableUserModel) => {
    const updated = await userService.updateUser(updatedUserProfile.id, updatedUserProfile);
    setUsersList((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u))
    );
  };

  // Callback เมื่อ Bulk Import สำเร็จ
  const handleBulkImportSuccess = async (importedUsers: ImportedUserModel[]) => {
    const formattedUsers: UserModel[] = importedUsers.map((u) => ({
      ...u,
      tierLevel: "Area Manager (AM)",
      assignedBrands: [u.brand],
      assignedRegions: [u.region || "-"],
      assignedProvinces: [u.province || "-"],
      assignedBranches: [u.branch],
    }));
    setUsersList((prev) => [...formattedUsers, ...prev]);
  };

  const handleOpenEditModal = (user: UserModel) => {
    setSelectedUserForEdit(user);
    setIsEditModalOpen(true);
  };

  // Table Columns
  const userTableColumns: TableColumn<UserModel>[] = [
    { 
      key: "id", 
      label: "User ID & Scope", 
      sortable: true,
      render: (u) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 w-fit">
            {u.id}
          </span>
          <span className="text-sub font-bold text-slate-700">
            {u.tierLevel || "User"}
          </span>
        </div>
      )
    },
    {
      key: "firstName",
      label: "Full Name & Email",
      sortable: true,
      render: (u) => {
        const nameInitials = `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs select-none">
              {nameInitials}
            </div>
            <div>
              <div className="text-body font-bold text-slate-900">{u.firstName} {u.lastName}</div>
              <div className="text-sub font-mono">{u.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "brand",
      label: "Assigned Scopes (แบรนด์ & สาขาที่ดูแล)",
      render: (u) => {
        const brandsList = u.assignedBrands && u.assignedBrands.length > 0 ? u.assignedBrands : u.brand ? u.brand.split(", ") : [];
        const branchesList = u.assignedBranches && u.assignedBranches.length > 0 ? u.assignedBranches : u.branch ? [u.branch] : [];

        return (
          <div className="space-y-1 max-w-xs">
            <div className="flex flex-wrap gap-1 items-center">
              <span className="font-bold text-slate-800 text-xs">แบรนด์:</span>
              {brandsList.length === 0 ? (
                <span className="text-sub text-slate-400">-</span>
              ) : (
                brandsList.map((b, i) => (
                  <span key={i} className="text-sub font-normal">
                    {b}{i < brandsList.length - 1 ? "," : ""}
                  </span>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="font-bold text-slate-800 text-xs">สาขา:</span>
              {branchesList.length === 0 ? (
                <span className="text-sub text-slate-400">-</span>
              ) : (
                branchesList.map((br, i) => (
                  <span key={i} className="text-sub font-normal truncate max-w-[200px]">
                    {br}{i < branchesList.length - 1 ? "," : ""}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {u.role}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (u) => {
        const isUserActive = u.status === "Active";
        return (
          <span className={isUserActive ? "badge-active" : "badge-inactive"}>
            <span className={`w-1.5 h-1.5 rounded-full ${isUserActive ? "bg-emerald-600" : "bg-slate-400"}`}></span>
            {u.status}
          </span>
        );
      },
    },
    { key: "createdDate", label: "Created Date", sortable: true }
  ];

  // Actions
  const userTableActions: TableAction<UserModel>[] = [
    { 
      label: "Edit User", 
      icon: "edit", 
      onClick: (selectedUser) => handleOpenEditModal(selectedUser) 
    },
    { 
      label: "Toggle Status", 
      icon: "toggle_on", 
      onClick: (selectedUser) => {
        const nextStatus = selectedUser.status === "Active" ? "Inactive" : "Active";
        setUsersList((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, status: nextStatus } : u))
        );
      } 
    },
    {
      label: "Delete User",
      icon: "delete",
      variant: "danger",
      onClick: async (u) => {
        if (confirm(`คุณต้องการลบผู้ใช้ "${u.firstName} ${u.lastName}" หรือไม่?`)) {
          await userService.deleteUser(u.id);
          setUsersList((prev) => prev.filter((item) => item.id !== u.id));
        }
      },
    },
  ];

  // Filtering using modular search algorithm
  const filteredUsersList = useMemo(() => {
    let result = searchUsers(searchUserQuery, usersList);

    if (selectedTierFilter !== "All Tiers") {
      result = result.filter((u) => u.tierLevel === selectedTierFilter);
    }
    if (selectedBrandFilter !== "All Brands") {
      result = result.filter(
        (u) =>
          u.brand.includes(selectedBrandFilter) ||
          (u.assignedBrands && u.assignedBrands.includes(selectedBrandFilter)) ||
          u.brand.includes("ทุกแบรนด์")
      );
    }
    if (selectedStatusFilter !== "All Status") {
      result = result.filter((u) => u.status === selectedStatusFilter);
    }

    return result;
  }, [usersList, searchUserQuery, selectedTierFilter, selectedBrandFilter, selectedStatusFilter]);

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-3xl">manage_accounts</span>
            User & Multi-Scope Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            จัดการบัญชีผู้ใช้งาน สิทธิ์ Multi-Brand, Multi-Branch และการนำเข้า-ส่งออกไฟล์
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsImportExportModalOpen(true)}
            className="btn-secondary text-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">swap_vert</span>
            Import / Export (JSON, XLSX, CSV, XML)
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary text-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            + Create User
          </button>
        </div>
      </div>

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={userStatsOverviewData} />

      {/* ─── 3. SEARCH & FILTER TOOLBAR ─── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <SearchInput
            placeholder="ค้นหาชื่อ, อีเมล, แบรนด์ หรือสาขา..."
            value={searchUserQuery}
            onChange={setSearchUserQuery}
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <div className="w-full sm:w-44">
            <SelectInput
              value={selectedTierFilter}
              onChange={setSelectedTierFilter}
              options={tierFilterOptions}
            />
          </div>

          <div className="w-full sm:w-40">
            <SelectInput
              value={selectedBrandFilter}
              onChange={setSelectedBrandFilter}
              options={brandFilterOptions}
            />
          </div>

          <div className="w-full sm:w-36">
            <SelectInput
              value={selectedStatusFilter}
              onChange={setSelectedStatusFilter}
              options={statusFilterOptions}
            />
          </div>
        </div>
      </div>

      {/* ─── 4. USERS DATA TABLE ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <DataTable
          columns={userTableColumns}
          data={filteredUsersList}
          actions={userTableActions}
          emptyMessage="ยังไม่มีข้อมูลผู้ใช้งานในระบบ"
        />
      </div>

      {/* ─── 5. MODALS INTEGRATION ─── */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availableBrands={availableBrands}
        availableBranches={availableBranches}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        user={selectedUserForEdit}
        availableBrands={availableBrands}
        availableBranches={availableBranches}
        onUserUpdated={handleUserUpdated}
      />

      <UserImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        currentUsers={usersList}
        availableBrands={availableBrands}
        onImportSuccess={handleBulkImportSuccess}
      />

    </div>
  );
}