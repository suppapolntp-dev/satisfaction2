"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { SystemRoleItem, PermissionRow, PermissionKey } from "@/Types/role";
import { roleService, generateDefaultMatrix } from "@/Services/roleService";
import { useModal } from "@/Context/ModalContext";

export function useRoleManagementScreen() {
  const { showSuccess, showError } = useModal();

  const [rolesList, setRolesList] = useState<SystemRoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, PermissionRow[]>>({});
  const [searchRoleQuery, setSearchRoleQuery] = useState("");

  // Modal States สำหรับสร้าง/แก้ไข Role
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SystemRoleItem | null>(null);

  // Modal State สำหรับยืนยันการลบ Role
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<SystemRoleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load from roleService on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchRolesData() {
      try {
        setIsLoading(true);
        const roles = await roleService.getRoles();
        if (!isMounted) return;

        setRolesList(roles || []);

        if (roles && roles.length > 0) {
          const initialRoleId = roles[0].roleId;
          setSelectedRoleId(initialRoleId);

          const matrix: Record<string, PermissionRow[]> = {};
          // Load matrix for first role immediately, others lazily or concurrently
          const firstRolePerms = await roleService.getPermissionMatrix(initialRoleId);
          if (isMounted) {
            matrix[initialRoleId] = firstRolePerms;
            setPermissionMatrix(matrix);
          }

          // Populate the rest of roles in matrix in background
          for (const r of roles) {
            if (r.roleId !== initialRoleId) {
              const perms = await roleService.getPermissionMatrix(r.roleId);
              if (isMounted) {
                setPermissionMatrix((prev) => ({
                  ...prev,
                  [r.roleId]: perms,
                }));
              }
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          showError(err?.message || "ไม่สามารถโหลดข้อมูลบทบาทได้");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRolesData();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const activeSelectedRole = useMemo(
    () => rolesList.find((roleItem) => roleItem.roleId === selectedRoleId) || null,
    [rolesList, selectedRoleId]
  );

  const isCurrentRoleSystemDefault = Boolean(activeSelectedRole?.isSystemDefault);

  const filteredRolesList = useMemo(() => {
    const formattedQuery = searchRoleQuery.toLowerCase().trim();
    if (!formattedQuery) return rolesList;

    return rolesList.filter(
      (roleItem) =>
        roleItem.roleName.toLowerCase().includes(formattedQuery) ||
        roleItem.roleDescription.toLowerCase().includes(formattedQuery) ||
        roleItem.roleId.toLowerCase().includes(formattedQuery) ||
        (roleItem.roleCode && roleItem.roleCode.toLowerCase().includes(formattedQuery))
    );
  }, [rolesList, searchRoleQuery]);

  const currentRolePermissions = useMemo(
    () => permissionMatrix[selectedRoleId] || generateDefaultMatrix(),
    [permissionMatrix, selectedRoleId]
  );

  // เมื่อผู้ใช้เลือกบทบาท
  const handleSelectRole = useCallback(
    async (roleId: string) => {
      setSelectedRoleId(roleId);
      if (!permissionMatrix[roleId]) {
        try {
          const perms = await roleService.getPermissionMatrix(roleId);
          setPermissionMatrix((prev) => ({
            ...prev,
            [roleId]: perms,
          }));
        } catch {}
      }
    },
    [permissionMatrix]
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

  // ฟังก์ชันเลือกเปิด/ปิดสิทธิ์ทั้งหมดในบทบาทนี้ (Select / Clear All)
  const handleToggleAllPermissions = useCallback(
    (enableAll: boolean) => {
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
    },
    [selectedRoleId]
  );

  // รีเซ็ตสิทธิ์กลับเป็นค่าเริ่มต้น
  const handleResetToDefaultPermissions = useCallback(() => {
    setPermissionMatrix((previousMatrix) => ({
      ...previousMatrix,
      [selectedRoleId]: generateDefaultMatrix(),
    }));
  }, [selectedRoleId]);

  // บันทึกการเปลี่ยนแปลงสิทธิ์ลงฐานข้อมูล
  const handleSavePermissionChanges = useCallback(async () => {
    if (!activeSelectedRole) return;
    try {
      setIsSaving(true);
      const currentMatrix = permissionMatrix[selectedRoleId] || [];
      await roleService.savePermissionMatrix(selectedRoleId, currentMatrix);
      showSuccess(`บันทึกสิทธิ์ของบทบาท "${activeSelectedRole.roleName}" เรียบร้อยแล้ว`);
    } catch (err: any) {
      showError(err?.message || "ไม่สามารถบันทึกสิทธิ์ได้ โปรดลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  }, [selectedRoleId, activeSelectedRole, permissionMatrix, showSuccess, showError]);

  // ─── Modal Handlers สำหรับ Create / Edit Role ───
  const handleOpenCreateRoleModal = useCallback(() => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  }, []);

  const handleOpenEditRoleModal = useCallback((role: SystemRoleItem) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  }, []);

  const handleCloseRoleModal = useCallback(() => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
  }, []);

  const handleSaveRole = useCallback(
    async (roleData: {
      roleId: string;
      roleCode: string;
      roleName: string;
      roleDescription: string;
      roleStatus: "Active" | "Inactive";
      cloneFromRole?: string;
    }) => {
      try {
        if (editingRole) {
          const updated = await roleService.updateRole(editingRole.roleId, {
            roleName: roleData.roleName,
            roleDescription: roleData.roleDescription,
            roleStatus: roleData.roleStatus,
          });
          setRolesList((prev) =>
            prev.map((r) => (r.roleId === editingRole.roleId ? { ...r, ...updated } : r))
          );
          showSuccess(`แก้ไขข้อมูลบทบาท "${roleData.roleName}" สำเร็จเรียบร้อย`);
        } else {
          const newRoleItem = await roleService.createRole({
            roleCode: roleData.roleCode || `ROLE_${Date.now()}`,
            roleName: roleData.roleName,
            roleDescription: roleData.roleDescription || "-",
            roleStatus: roleData.roleStatus,
          });

          const clonedPermissions =
            roleData.cloneFromRole && permissionMatrix[roleData.cloneFromRole]
              ? permissionMatrix[roleData.cloneFromRole].map((row) => ({ ...row }))
              : generateDefaultMatrix();

          await roleService.savePermissionMatrix(newRoleItem.roleId, clonedPermissions);

          setRolesList((prev) => [...prev, newRoleItem]);
          setPermissionMatrix((prev) => ({
            ...prev,
            [newRoleItem.roleId]: clonedPermissions,
          }));
          setSelectedRoleId(newRoleItem.roleId);
          showSuccess(`สร้างบทบาท "${roleData.roleName}" สำเร็จเรียบร้อย`);
        }

        setIsRoleModalOpen(false);
        setEditingRole(null);
      } catch (err: any) {
        showError(err?.message || "ไม่สามารถบันทึกบทบาทได้");
      }
    },
    [editingRole, permissionMatrix, showSuccess, showError]
  );

  // ─── Modal Handlers สำหรับ Delete Role ───
  const handleRequestDeleteRole = useCallback(
    (role: SystemRoleItem) => {
      if (role.isSystemDefault) {
        showError("ไม่สามารถลบบทบาทมาตรฐานของระบบได้");
        return;
      }
      setDeletingRole(role);
      setIsDeleteConfirmOpen(true);
    },
    [showError]
  );

  const handleCloseDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeletingRole(null);
  }, []);

  const handleConfirmDeleteRole = useCallback(async () => {
    if (!deletingRole) return;
    try {
      setIsDeleting(true);
      await roleService.deleteRole(deletingRole.roleId);
      setRolesList((prev) => prev.filter((r) => r.roleId !== deletingRole.roleId));
      if (selectedRoleId === deletingRole.roleId) {
        const remaining = rolesList.filter((r) => r.roleId !== deletingRole.roleId);
        setSelectedRoleId(remaining[0]?.roleId || "");
      }
      showSuccess(`ลบบทบาท "${deletingRole.roleName}" สำเร็จเรียบร้อย`);
      setIsDeleteConfirmOpen(false);
      setDeletingRole(null);
    } catch (err: any) {
      showError(err?.message || "ไม่สามารถลบบทบาทได้");
    } finally {
      setIsDeleting(false);
    }
  }, [deletingRole, selectedRoleId, rolesList, showSuccess, showError]);

  return {
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
  };
}
