"use client";

import React, { useState, useMemo } from "react";
import DataTable, { TableColumn, TableAction } from "@/Components/Tables/DataTable";
import SearchInput from "@/Components/Inputs/SearchInput";
import SelectInput, { SelectOption } from "@/Components/Inputs/SelectInput";
import CreateUserModal from "@/Components/Modals/CreateUserModal";

interface UserModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brand: string;
  branch: string;
  role: "Administrator" | "Manager" | "Agent" | "Read Only";
  status: "Active" | "Inactive";
  createdDate: string;
}

export default function UserManagementScreen() {
  const [userList] = useState<UserModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ข้อมูลตัวเลือกสำหรับฟิลเตอร์ Dropdown
  const roleFilterOptions: SelectOption[] = [
    { value: "All Roles", label: "All Roles" },
    { value: "Administrator", label: "Administrator" },
    { value: "Manager", label: "Manager" },
    { value: "Agent", label: "Agent" },
    { value: "Read Only", label: "Read Only" },
  ];

  const statusFilterOptions: SelectOption[] = [
    { value: "All Status", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  // โครงสร้างคอลัมน์แสดงผลในตารางกลาง
  const tableColumns: TableColumn<UserModel>[] = [
    { key: "id", label: "User ID", sortable: true },
    {
      key: "firstName",
      label: "Full Name",
      sortable: true,
      render: (individualUser) => {
        const nameInitial = `${individualUser.firstName[0]}${individualUser.lastName[0]}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs shadow-sm">
              {nameInitial}
            </div>
            <span className="font-semibold text-neutral-800">{individualUser.firstName} {individualUser.lastName}</span>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Contact",
      render: (individualUser) => (
        <div className="text-xs">
          <div className="text-neutral-700 font-medium">{individualUser.phone}</div>
          <div className="text-neutral-400 mt-0.5">{individualUser.email}</div>
        </div>
      ),
    },
    {
      key: "brand",
      label: "Brand / Branch",
      render: (individualUser) => (
        <div className="text-xs">
          <div className="text-neutral-800 font-medium">{individualUser.brand}</div>
          <div className="text-neutral-400 mt-0.5">{individualUser.branch}</div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (individualUser) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 select-none">
          {individualUser.role}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (individualUser) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold select-none border ${
            individualUser.status === "Active"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-600 border-rose-200"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${individualUser.status === "Active" ? "bg-emerald-600" : "bg-rose-500"}`}></span>
          {individualUser.status}
        </span>
      ),
    },
    { key: "createdDate", label: "Created Date", sortable: true },
  ];

  // ฟังก์ชันคำสั่งท้ายแถวเมื่อกดปุ่มสามจุดในตาราง
  const rowActionMenu: TableAction<UserModel>[] = [
    { label: "Edit Profile", icon: "edit", onClick: (selectedUser) => alert(`Edit profile: ${selectedUser.firstName}`) },
    { label: "Reset Password", icon: "key", onClick: (selectedUser) => console.log("Reset key for:", selectedUser.id) },
    { label: "Delete Account", icon: "delete", variant: "danger", onClick: (selectedUser) => console.log("Delete account:", selectedUser.id) },
  ];

  // ตรรกะคัดกรองข้อมูลผู้ใช้หลังบ้าน
  const filteredUserList = useMemo(() => {
    return userList.filter((individualUser) => {
      const isSearchMatched =
        individualUser.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        individualUser.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        individualUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        individualUser.id.toLowerCase().includes(searchQuery.toLowerCase());
      const isRoleMatched = selectedRole === "All Roles" || individualUser.role === selectedRole;
      const isStatusMatched = selectedStatus === "All Status" || individualUser.status === selectedStatus;
      
      return isSearchMatched && isRoleMatched && isStatusMatched;
    });
  }, [userList, searchQuery, selectedRole, selectedStatus]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      
      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-200 bg-white gap-4">
        <div>
          <h1 className="text-sm font-bold text-neutral-800 tracking-tight">User Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Manage system access, roles, and user profiles.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-neutral-700 rounded-lg text-xs font-semibold shadow-sm transition-colors outline-none"
          >
            <span className="material-symbols-outlined text-[16px] select-none">download</span>
            Export
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 outline-none"
          >
            <span className="material-symbols-outlined text-[16px] select-none">add</span>
            Add User
          </button>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 p-6 flex flex-col gap-6 max-w-[1440px] w-full mx-auto overflow-y-auto">
        
        {/* DATA TABLE WRAPPER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          
          {/* TABLE FILTERS BAR */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users, IDs, emails..."
            />
            
            <div className="flex items-center gap-3 w-full lg:w-auto self-end lg:self-auto">
              <SelectInput
                label="Role:"
                value={selectedRole}
                onChange={setSelectedRole}
                options={roleFilterOptions}
              />

              <SelectInput
                label="Status:"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statusFilterOptions}
              />

              <button type="button" className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-neutral-500 flex items-center justify-center outline-none">
                <span className="material-symbols-outlined text-[18px] select-none">filter_list</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC SORTING DATA TABLE */}
          <DataTable
            columns={tableColumns}
            data={filteredUserList}
            actions={rowActionMenu}
            emptyMessage="ไม่พบข้อมูลรายชื่อผู้ใช้งานระบบที่ตรงกับเงื่อนไข"
          />

          {/* TABLE PAGINATION FOOTER */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-neutral-500 text-xs font-medium select-none">
            <div>Showing 1 to {filteredUserList.length} of {filteredUserList.length} results</div>
            <div className="flex items-center gap-1">
              <button type="button" className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-not-allowed" disabled>
                <span className="material-symbols-outlined text-[16px] flex items-center justify-center">chevron_left</span>
              </button>
              <button type="button" className="px-2.5 py-1 border border-blue-950 bg-blue-50 text-blue-900 rounded-md font-bold">1</button>
              <button type="button" className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors">2</button>
              <button type="button" className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors">3</button>
              <span className="px-1 text-neutral-400">...</span>
              <button type="button" className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors">12</button>
              <button type="button" className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[16px] flex items-center justify-center">chevron_right</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CREATE USER POPUP MODAL COMPONENT */}
      <CreateUserModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

    </div>
  );
}