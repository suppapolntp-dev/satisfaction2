"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import SearchInput from "@/Components/Inputs/SearchInput";
import RolePermissionTable from "@/Components/Tables/RolePermissionTable";
import RoleModal from "@/Components/Modals/RoleModal";
import { PermissionRow, PermissionKey, SystemRoleItem } from "@/Types/role";
import { roleService, generateDefaultMatrix } from "@/Services/roleService";

// ==========================================================================
// ─── MAIN ROLE MANAGEMENT SCREEN COMPONENT
// ==========================================================================
export default function RoleManagementScreen() {
  const [rolesList, setRolesList] = useState<SystemRoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, PermissionRow[]>>({});
  const [searchRoleQuery, setSearchRoleQuery] = useState("");

  // Modal States สำหรับสร้าง/แก้ไข Role
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SystemRoleItem | null>(null);

  // Load from roleService on mount
  useEffect(() => {
    async function fetchRolesData() {
      try {
        setIsLoading(true);
        const roles = await roleService.getRoles();
        setRolesList(roles || []);
        if (roles && roles.length > 0) {
          setSelectedRoleId(roles[0].roleId);
          const matrix: Record<string, PermissionRow[]> = {};
          for (const r of roles) {
            matrix[r.roleId] = await roleService.getPermissionMatrix(r.roleId);
          }
          setPermissionMatrix(matrix);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchRolesData();
  }, []);

  // KPI Stats
  const roleStatsOverviewData: StatItem[] = useMemo(() => {
    const totalRoles = rolesList.length;
    const totalUsers = rolesList.reduce((acc, r) => acc + (r.totalUsersCount || 0), 0);

    let activePermissionsCount = 0;
    const currentMatrix = permissionMatrix[selectedRoleId] || [];
    currentMatrix.forEach((row) => {
      if (row.view) activePermissionsCount++;
      if (row.create) activePermissionsCount++;
      if (row.update) activePermissionsCount++;
      if (row.delete) activePermissionsCount++;
      if (row.export) activePermissionsCount++;
    });

    const hasData = totalRoles > 0;

    return [
      {
        label: "Total Roles",
        value: hasData ? `${totalRoles} บทบาท` : "-",
        change: "",
        isUp: true,
        icon: "admin_panel_settings",
        color: "text-blue-600",
      },
      {
        label: "Active Permissions",
        value: hasData ? `${activePermissionsCount} Scopes` : "-",
        change: "",
        isUp: true,
        icon: "verified_user",
        color: "text-emerald-600",
      },
      {
        label: "Assigned Users",
        value: hasData ? `${totalUsers.toLocaleString()} บัญชี` : "-",
        change: "",
        isUp: true,
        icon: "group",
        color: "text-purple-600",
      },
      {
        label: "Custom Overrides",
        value: hasData ? "0" : "-",
        change: "",
        isUp: false,
        icon: "tune",
        color: "text-amber-600",
      },
    ];
  }, [rolesList, permissionMatrix, selectedRoleId]);

  const activeSelectedRole = useMemo(
    () => rolesList.find((roleItem) => roleItem.roleId === selectedRoleId) || null,
    [rolesList, selectedRoleId]
  );

  const filteredRolesList = useMemo(() => {
    const formattedQuery = searchRoleQuery.toLowerCase().trim();
    return rolesList.filter(
      (roleItem) =>
        roleItem.roleName.toLowerCase().includes(formattedQuery) ||
        roleItem.roleDescription.toLowerCase().includes(formattedQuery) ||
        roleItem.roleId.toLowerCase().includes(formattedQuery)
    );
  }, [rolesList, searchRoleQuery]);

  const currentRolePermissions = useMemo(
    () => permissionMatrix[selectedRoleId] || generateDefaultMatrix(),
    [permissionMatrix, selectedRoleId]
  );

  // ฟังก์ชันสลับสิทธิ์แต่ละ Checkbox
  const handlePermissionFieldToggle = useCallback(
    (moduleName: string, permissionField: PermissionKey) => {
      setPermissionMatrix((previousMatrix) => ({
        ...previousMatrix,
        [selectedRoleId]: (previousMatrix[selectedRoleId] || generateDefaultMatrix()).map((permissionRow) =>
          permissionRow.module === moduleName 
            ? { ...permissionRow, [permissionField]: !permissionRow[permissionField] } 
            : permissionRow
        ),
      }));
    },
    [selectedRoleId]
  );

  // ฟังก์ชันเลือกเปิด/ปิดสิทธิ์ทั้งหมดในบทบาทนี้ (Select / Unselect All)
  const handleToggleAllPermissions = (enableAll: boolean) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [selectedRoleId]: (prev[selectedRoleId] || generateDefaultMatrix()).map((row) => ({
        ...row,
        view: enableAll,
        create: enableAll,
        update: enableAll,
        delete: enableAll,
        export: enableAll,
      })),
    }));
  };

  const handleResetToDefaultPermissions = useCallback(() => {
    setPermissionMatrix((previousMatrix) => ({
      ...previousMatrix,
      [selectedRoleId]: generateDefaultMatrix(),
    }));
  }, [selectedRoleId]);

  const handleSavePermissionChanges = useCallback(async () => {
    if (!activeSelectedRole) return;
    const currentMatrix = permissionMatrix[selectedRoleId] || [];
    await roleService.savePermissionMatrix(selectedRoleId, currentMatrix);
    alert(`บันทึกการเปลี่ยนแปลงสิทธิ์ของ "${activeSelectedRole.roleName}" สำเร็จเรียบร้อยแล้ว!`);
  }, [selectedRoleId, activeSelectedRole, permissionMatrix]);

  // ─── Modal Handlers สำหรับ Create / Edit Role ───
  const handleOpenCreateRoleModal = () => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRoleModal = (role: SystemRoleItem) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (roleData: {
    roleId: string;
    roleName: string;
    roleDescription: string;
    roleStatus: "Active" | "Inactive";
    cloneFromRole?: string;
  }) => {
    if (editingRole) {
      const updated = await roleService.updateRole(editingRole.roleId, roleData);
      setRolesList((prev) =>
        prev.map((r) => (r.roleId === editingRole.roleId ? { ...r, ...updated } : r))
      );
    } else {
      const newRoleItem = await roleService.createRole({
        roleName: roleData.roleName,
        roleStatus: roleData.roleStatus,
        roleDescription: roleData.roleDescription || "-",
        totalUsersCount: 0,
        isSystemDefault: false,
      });

      const clonedPermissions = roleData.cloneFromRole && permissionMatrix[roleData.cloneFromRole]
        ? permissionMatrix[roleData.cloneFromRole].map((row) => ({ ...row }))
        : generateDefaultMatrix();

      await roleService.savePermissionMatrix(newRoleItem.roleId, clonedPermissions);

      setRolesList((prev) => [...prev, newRoleItem]);
      setPermissionMatrix((prev) => ({
        ...prev,
        [newRoleItem.roleId]: clonedPermissions,
      }));
      setSelectedRoleId(newRoleItem.roleId);
    }

    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (confirm(`คุณต้องการลบบทบาท "${roleName}" หรือไม่?`)) {
      await roleService.deleteRole(roleId);
      setRolesList((prev) => prev.filter((r) => r.roleId !== roleId));
      if (selectedRoleId === roleId) {
        setSelectedRoleId(rolesList[0]?.roleId || "");
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-3xl">admin_panel_settings</span>
            Role & Permission Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดสิทธิ์การเข้าถึงเมนูและการทำงานต่าง ๆ ของระบบแบบแยกรายโมดูล (Granular Access Control)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateRoleModal}
          className="btn-primary shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add_moderator</span>
          Create New Role
        </button>
      </div>

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={roleStatsOverviewData} />

      {/* ─── 3. SPLIT-PANE WORKSPACE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: System Roles List Selection */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                System Roles ({filteredRolesList.length})
              </h3>
              <button
                type="button"
                onClick={handleOpenCreateRoleModal}
                className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                + New
              </button>
            </div>
            <SearchInput 
              value={searchRoleQuery} 
              onChange={setSearchRoleQuery} 
              placeholder="ค้นหาชื่อบทบาท..." 
              className="w-full"
            />
          </div>

          <div className="p-2.5 flex flex-col gap-2 max-h-[580px] overflow-y-auto custom-scrollbar">
            {filteredRolesList.map((roleItem) => {
              const isCurrentRoleActive = roleItem.roleId === selectedRoleId;

              return (
                <div
                  key={roleItem.roleId}
                  onClick={() => setSelectedRoleId(roleItem.roleId)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all duration-150 border cursor-pointer group relative ${
                    isCurrentRoleActive
                      ? "bg-blue-50/90 border-blue-900 shadow-xs ring-1 ring-blue-900"
                      : "bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className={`font-extrabold text-xs block ${
                        isCurrentRoleActive ? "text-blue-950" : "text-slate-800"
                      }`}>
                        {roleItem.roleName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {roleItem.roleId}
                      </span>
                    </div>

                    <span className="badge-active shrink-0 text-[10px]">
                      {roleItem.totalUsersCount || 0} Users
                    </span>
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
                        title="แก้ไขบทบาท"
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(roleItem.roleId, roleItem.roleName);
                        }}
                        title="ลบบทบาท"
                        className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded text-slate-400 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRolesList.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                ยังไม่มีข้อมูลบทบาทและสิทธิ์ในระบบ
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Granular Permission Matrix */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 flex flex-col gap-5">
          
          {/* Header Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-900 rounded-full inline-block"></span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  สิทธิ์การใช้งาน: <span className="text-blue-900">{activeSelectedRole ? activeSelectedRole.roleName : "ยังไม่มีบทบาทที่ถูกเลือก"}</span>
                </h3>
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
                  className="btn-secondary text-[11px] py-1 px-2.5 bg-slate-50"
                  title="เลือกเปิดสิทธิ์ทั้งหมด"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleAllPermissions(false)}
                  className="btn-secondary text-[11px] py-1 px-2.5 bg-slate-50"
                  title="ล้างสิทธิ์ทั้งหมด"
                >
                  Clear All
                </button>

                <button 
                  type="button" 
                  onClick={handleResetToDefaultPermissions} 
                  className="btn-secondary text-xs"
                >
                  Reset Default
                </button>

                <button 
                  type="button" 
                  onClick={handleSavePermissionChanges} 
                  className="btn-primary text-xs shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Permissions
                </button>
              </div>
            )}
          </div>

          {/* Reusable Permission Table Component */}
          {activeSelectedRole ? (
            <RolePermissionTable
              permissionData={currentRolePermissions}
              onPermissionChange={handlePermissionFieldToggle}
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
        onClose={() => setIsRoleModalOpen(false)}
        editingRole={editingRole}
        existingRoles={rolesList}
        onSave={handleSaveRole}
      />

    </div>
  );
}