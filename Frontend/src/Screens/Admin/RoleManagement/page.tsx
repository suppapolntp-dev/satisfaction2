"use client";

import React, { useState, useMemo, useCallback } from "react";
import SearchInput from "@/Components/Inputs/SearchInput";
import RolePermissionTable, { PermissionRow, PermissionKey } from "@/Components/Tables/RolePermissionTable";

interface SystemRoleItem {
  roleId: string;
  roleName: string;
  roleStatus: "Active" | "Inactive";
  roleDescription: string;
  roleLastModified: string;
}

const ENTERPRISE_ROLES: SystemRoleItem[] = [
  {
    roleId: "ROLE_SUPER_ADMIN",
    roleName: "Super Admin",
    roleStatus: "Active",
    roleDescription: "Full system access and infrastructure configuration control.",
    roleLastModified: "Oct 12, 2023",
  },
  {
    roleId: "ROLE_AUDITOR",
    roleName: "Auditor",
    roleStatus: "Active",
    roleDescription: "Read-only access to comprehensive audit logs and reports.",
    roleLastModified: "Dec 18, 2023",
  },
  {
    roleId: "ROLE_COUNTRY_MANAGER",
    roleName: "Country Manager",
    roleStatus: "Active",
    roleDescription: "Regional oversight, regional branches, and team management.",
    roleLastModified: "Jan 05, 2024",
  },
  {
    roleId: "ROLE_BRANCH_MANAGER",
    roleName: "Branch Manager",
    roleStatus: "Active",
    roleDescription: "Local branch operations, event management, and local staffs.",
    roleLastModified: "Jan 10, 2024",
  },
];

function generateDefaultMatrix(map: Record<string, Partial<PermissionRow>>): PermissionRow[] {
  const SYSTEM_MODULES = [
    "Dashboard",
    "User Management",
    "Company Management",
    "Brand Management",
    "Branch Management",
    "Event Management",
    "Notification",
    "Audit Log",
    "System Settings",
  ];
  return SYSTEM_MODULES.map((moduleName) => ({
    module: moduleName,
    view: false,
    create: false,
    update: false,
    delete: false,
    export: false,
    ...map[moduleName],
  }));
}

const INITIAL_PERMISSION_MATRIX: Record<string, PermissionRow[]> = {
  ROLE_SUPER_ADMIN: generateDefaultMatrix({
    Dashboard: { view: true, export: true },
    "User Management": { view: true, create: true, update: true, delete: true, export: true },
    "Company Management": { view: true, create: true, update: true, delete: true, export: true },
    "Brand Management": { view: true, create: true, update: true, delete: true, export: true },
    "Branch Management": { view: true, create: true, update: true, delete: true, export: true },
    "Event Management": { view: true, create: true, update: true, delete: true, export: true },
    Notification: { view: true, create: true, update: true, delete: true, export: true },
    "Audit Log": { view: true, export: true },
    "System Settings": { view: true, create: true, update: true, delete: true, export: true },
  }),
  ROLE_AUDITOR: generateDefaultMatrix({
    Dashboard: { view: true, export: true },
    "User Management": { view: true, export: true },
    "Company Management": { view: true },
    "Brand Management": { view: true },
    "Branch Management": { view: true },
    "Event Management": { view: true },
    Notification: { view: true },
    "Audit Log": { view: true, export: true },
  }),
  ROLE_COUNTRY_MANAGER: generateDefaultMatrix({
    Dashboard: { view: true, export: true },
    "User Management": { view: true, create: true, update: true, export: true },
    "Company Management": { view: true, update: true, export: true },
    "Brand Management": { view: true, update: true },
    "Branch Management": { view: true, create: true, update: true, delete: true, export: true },
    "Event Management": { view: true, create: true, update: true, export: true },
    Notification: { view: true, create: true },
    "Audit Log": { view: true, export: true },
    "System Settings": { view: true },
  }),
  ROLE_BRANCH_MANAGER: generateDefaultMatrix({
    Dashboard: { view: true },
    "User Management": { view: true },
    "Branch Management": { view: true, update: true },
    "Event Management": { view: true, create: true, update: true, delete: true, export: true },
    Notification: { view: true, create: true },
  }),
};

export default function RoleManagementScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("ROLE_SUPER_ADMIN");
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, PermissionRow[]>>(INITIAL_PERMISSION_MATRIX);

  const activeRole = useMemo(
    () => ENTERPRISE_ROLES.find((role) => role.roleId === selectedRoleId) ?? ENTERPRISE_ROLES[0],
    [selectedRoleId]
  );

  const filteredRoles = useMemo(() => {
    const formatQuery = searchQuery.toLowerCase();
    return ENTERPRISE_ROLES.filter(
      (role) =>
        role.roleName.toLowerCase().includes(formatQuery) ||
        role.roleDescription.toLowerCase().includes(formatQuery)
    );
  }, [searchQuery]);

  const currentRolePermissions = useMemo(
    () => permissionMatrix[selectedRoleId] ?? [],
    [permissionMatrix, selectedRoleId]
  );

  const handlePermissionChange = useCallback(
    (moduleName: string, field: PermissionKey) => {
      setPermissionMatrix((prevMatrix) => ({
        ...prevMatrix,
        [selectedRoleId]: (prevMatrix[selectedRoleId] ?? []).map((row) =>
          row.module === moduleName ? { ...row, [field]: !row[field] } : row
        ),
      }));
    },
    [selectedRoleId]
  );

  const handleResetToDefault = useCallback(() => {
    setPermissionMatrix((prevMatrix) => ({
      ...prevMatrix,
      [selectedRoleId]: INITIAL_PERMISSION_MATRIX[selectedRoleId] ?? [],
    }));
  }, [selectedRoleId]);

  const handleSaveChanges = useCallback(() => {
    console.log("Saving changes for:", activeRole.roleName, currentRolePermissions);
  }, [activeRole, currentRolePermissions]);

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full bg-[var(--surface-variant)]/20 min-h-screen">
      {/* Page Header */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--outline-variant)] bg-white shadow-sm">
        <div>
          <nav aria-label="Breadcrumb" className="flex mb-2">
            <ol className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--on-surface-variant)] tracking-wide">
              <li className="hover:text-[var(--primary-container)] transition-colors cursor-pointer">Settings</li>
              <li aria-hidden="true" className="text-[var(--outline)]">
                <span className="material-symbols-outlined text-xs">chevron_right</span>
              </li>
              <li aria-current="page" className="text-gray-400">Role Management</li>
            </ol>
          </nav>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--on-surface)]">Role Management</h2>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Define and manage granular permissions for system enterprise roles
          </p>
        </div>

        <button
          type="button"
          onClick={() => console.log("Open create role modal")}
          className="btn-primary self-start md:self-auto shadow-md hover:shadow-lg transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
          Create New Role
        </button>
      </div>

      {/* Main Layout Workspace */}
      <div className="p-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: System Roles List Selection Card */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[var(--outline-variant)] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                    System Roles
                  </h3>
                  <span className="text-[11px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                    {filteredRoles.length} Roles
                  </span>
                </div>
                <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search roles..." />
              </div>

              <ul className="p-3 flex flex-col gap-2 max-h-[550px] overflow-y-auto no-scrollbar" role="listbox">
                {filteredRoles.map((role) => {
                  const isCurrentRoleSelected = role.roleId === selectedRoleId;
                  return (
                    <li key={role.roleId} role="option" aria-selected={isCurrentRoleSelected}>
                      <button
                        type="button"
                        onClick={() => setSelectedRoleId(role.roleId)}
                        className={[
                          "w-full text-left p-4 rounded-xl transition-all duration-200 outline-none border text-sm group",
                          isCurrentRoleSelected
                            ? "bg-[var(--primary-container)]/[0.04] border-[var(--primary-container)] shadow-sm"
                            : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200",
                        ].join(" ")}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={[
                            "font-semibold transition-colors text-sm",
                            isCurrentRoleSelected ? "text-[var(--primary-container)]" : "text-[var(--on-surface)]"
                          ].join(" ")}>
                            {role.roleName}
                          </span>
                          {isCurrentRoleSelected ? (
                            <span className="badge-status bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 font-bold rounded-md">
                              {role.roleStatus}
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-gray-300 group-hover:text-gray-400 text-sm transition-colors">
                              chevron_right
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--on-surface-variant)] mb-3 line-clamp-2 leading-relaxed">
                          {role.roleDescription}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--outline)] font-medium">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          <span>Modified: {role.roleLastModified}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}

                {filteredRoles.length === 0 && (
                  <div className="py-12 text-center text-xs text-[var(--outline)] font-medium">
                    No system roles found
                  </div>
                )}
              </ul>
            </div>
          </div>

          {/* Right Side: Permission Matrix Grid Display Card */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-[var(--outline-variant)] shadow-sm overflow-hidden p-6 flex flex-col gap-6">
              
              {/* Matrix Card Header Actions bar */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-5 border-b border-[var(--outline-variant)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 bg-[var(--primary-container)] rounded-full inline-block"></span>
                    <h3 className="text-lg font-bold text-[var(--on-surface)]">
                      Permissions Management
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                    Currently configuring access scope for <span className="font-semibold text-gray-800">{activeRole.roleName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button 
                    type="button" 
                    onClick={handleResetToDefault} 
                    className="btn-ghost text-xs py-1.5 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Reset to Default
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSaveChanges} 
                    className="btn-primary text-xs py-1.5 px-4 font-semibold shadow-sm hover:shadow transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Injected Clean Reusable Table Component */}
              <RolePermissionTable
                permissionData={currentRolePermissions}
                onPermissionChange={handlePermissionChange}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}