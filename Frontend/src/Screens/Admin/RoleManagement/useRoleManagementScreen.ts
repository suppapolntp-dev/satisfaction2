"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { SystemRoleItem, PermissionRow, PermissionKey } from "@/Types/role";
import { roleService, generateDefaultMatrix } from "@/Services/roleService";
import { useModal } from "@/Context/ModalContext";

// Helper: Toggle permission on parent or child in tree hierarchy
function toggleTreePermission(
  rows: PermissionRow[],
  targetIdentifier: string,
  field: PermissionKey
): PermissionRow[] {
  return rows.map((parent) => {
    const isParentTarget =
      parent.id === targetIdentifier ||
      parent.module === targetIdentifier ||
      parent.moduleCode === targetIdentifier;

    if (isParentTarget) {
      const willEnable = !(parent.children && parent.children.every((c) => c[field]));
      const updatedChildren = parent.children
        ? parent.children.map((c) => ({ ...c, [field]: willEnable }))
        : undefined;

      return {
        ...parent,
        [field]: willEnable,
        children: updatedChildren,
      };
    }

    if (parent.children && parent.children.length > 0) {
      const hasMatchingChild = parent.children.some(
        (c) =>
          c.id === targetIdentifier ||
          c.module === targetIdentifier ||
          c.moduleCode === targetIdentifier
      );

      if (hasMatchingChild) {
        const updatedChildren = parent.children.map((child) => {
          if (
            child.id === targetIdentifier ||
            child.module === targetIdentifier ||
            child.moduleCode === targetIdentifier
          ) {
            return { ...child, [field]: !child[field] };
          }
          return child;
        });

        const allChecked = updatedChildren.every((c) => c[field]);
        return {
          ...parent,
          [field]: allChecked,
          children: updatedChildren,
        };
      }
    }

    return parent;
  });
}

function toggleAllTreePermissions(rows: PermissionRow[], enableAll: boolean): PermissionRow[] {
  return rows.map((parent) => ({
    ...parent,
    view: enableAll,
    create: enableAll,
    update: enableAll,
    delete: enableAll,
    export: enableAll,
    children: parent.children
      ? parent.children.map((c) => ({
          ...c,
          view: enableAll,
          create: enableAll,
          update: enableAll,
          delete: enableAll,
          export: enableAll,
        }))
      : undefined,
  }));
}

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
          const firstRolePerms = await roleService.getPermissionMatrix(initialRoleId);
          if (isMounted) {
            matrix[initialRoleId] = firstRolePerms;
            setPermissionMatrix(matrix);
          }

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
    () => permissionMatrix[selectedRoleId] || generateDefaultMatrix(selectedRoleId),
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

  // ฟังก์ชันสลับสิทธิ์แต่ละ Checkbox (Tree-aware)
  const handlePermissionFieldToggle = useCallback(
    (targetIdentifier: string, permissionField: PermissionKey) => {
      setPermissionMatrix((previousMatrix) => {
        const currentList = previousMatrix[selectedRoleId] || generateDefaultMatrix(selectedRoleId);
        const updatedList = toggleTreePermission(currentList, targetIdentifier, permissionField);
        return {
          ...previousMatrix,
          [selectedRoleId]: updatedList,
        };
      });
    },
    [selectedRoleId]
  );

  // ฟังก์ชันเลือกเปิด/ปิดสิทธิ์ทั้งหมดในบทบาทนี้ (Select / Clear All)
  const handleToggleAllPermissions = useCallback(
    (enableAll: boolean) => {
      setPermissionMatrix((prev) => {
        const currentList = prev[selectedRoleId] || generateDefaultMatrix(selectedRoleId);
        return {
          ...prev,
          [selectedRoleId]: toggleAllTreePermissions(currentList, enableAll),
        };
      });
    },
    [selectedRoleId]
  );

  // รีเซ็ตสิทธิ์กลับเป็นค่าเริ่มต้น
  const handleResetToDefaultPermissions = useCallback(() => {
    setPermissionMatrix((previousMatrix) => ({
      ...previousMatrix,
      [selectedRoleId]: generateDefaultMatrix(activeSelectedRole?.roleCode || selectedRoleId),
    }));
  }, [selectedRoleId, activeSelectedRole]);

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
            roleStatus: roleData.roleStatus || "Active",
          });
          setRolesList((prev) => [newRoleItem, ...prev]);
          showSuccess(`สร้างบทบาท "${roleData.roleName}" สำเร็จเรียบร้อย`);
        }
        setIsRoleModalOpen(false);
        setEditingRole(null);
      } catch (err: any) {
        showError(err?.message || "บันทึกข้อมูลบทบาทไม่สำเร็จ");
      }
    },
    [editingRole, showSuccess, showError]
  );

  const handleRequestDeleteRole = useCallback((role: SystemRoleItem) => {
    setDeletingRole(role);
    setIsDeleteConfirmOpen(true);
  }, []);

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
        if (remaining.length > 0) {
          setSelectedRoleId(remaining[0].roleId);
        }
      }
      showSuccess(`ลบบทบาท "${deletingRole.roleName}" เรียบร้อยแล้ว`);
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
