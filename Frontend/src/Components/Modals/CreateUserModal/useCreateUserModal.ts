"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CreateUserPayload, UserTierLevel, UserStatus } from "@/Types/user";
import { HierarchyScopeLevel } from "@/Types/dataAccess";
import { useUserSettings } from "@/Lib/useUserSettings";
import { useOrgTree } from "@/Components/Sidebars/OrgHierarchyTreeSidebar/useOrgTree";

export interface CreateUserFormData {
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  tierLevel: UserTierLevel;
  dataAccessScope: string;
  assignedBrands: string[];
  assignedBranches: string[];
  status: UserStatus;
}

export interface UseCreateUserModalOptions {
  isOpen: boolean;
  availableBrands?: string[];
  availableBranches?: string[];
  onSave?: (userData: CreateUserPayload) => Promise<void> | void;
  onClose: () => void;
}

export function useCreateUserModal({
  isOpen,
  onSave,
  onClose,
}: UseCreateUserModalOptions) {
  const { userConfig } = useUserSettings();

  const [formData, setFormData] = useState<CreateUserFormData>({
    userCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Manager",
    tierLevel: "Super Admin",
    dataAccessScope: "All Organizations (สำนักงานใหญ่)",
    assignedBrands: [],
    assignedBranches: [],
    status: "Active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── 5-Tier Org Hierarchy Tree Hook (Identical to Dashboard Analyses) ───
  const orgTree = useOrgTree({
    onScopeChange: (scopeInfo) => {
      const tierMap: Record<HierarchyScopeLevel, UserTierLevel> = {
        SUPER_ADMIN: "Super Admin",
        BRAND: "Brand Owner",
        REGION: "Regional Manager (RM)",
        PROVINCE: "Area Manager (AM)",
        BRANCH: "Branch Staff",
        CUSTOM_SCOPE: "Custom Scope",
      };

      setFormData((prev) => ({
        ...prev,
        dataAccessScope: scopeInfo.scopePath,
        tierLevel: tierMap[scopeInfo.level] || prev.tierLevel,
        assignedBrands: scopeInfo.targetBrands,
        assignedBranches: scopeInfo.targetBranches,
      }));
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        userCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "Manager",
        tierLevel: "Super Admin",
        dataAccessScope: orgTree.scopePath || "All Organizations (สำนักงานใหญ่)",
        assignedBrands: orgTree.targetBrands || [],
        assignedBranches: orgTree.targetBranches || [],
        status: "Active",
      });
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, orgTree.scopePath, orgTree.targetBrands, orgTree.targetBranches]);

  const handleChange = useCallback((field: keyof CreateUserFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Toggle or remove a specific branch from the assigned scope chips
  const toggleBranch = useCallback((branchName: string) => {
    setFormData((prev) => {
      const isSelected = prev.assignedBranches.includes(branchName);
      const updatedBranches = isSelected
        ? prev.assignedBranches.filter((b) => b !== branchName)
        : [...prev.assignedBranches, branchName];
      return {
        ...prev,
        assignedBranches: updatedBranches,
      };
    });
  }, []);

  // Select all branches from hierarchy
  const selectAllBranches = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      assignedBranches: orgTree.targetBranches,
      assignedBrands: orgTree.targetBrands,
    }));
  }, [orgTree.targetBranches, orgTree.targetBrands]);

  // Clear all branches
  const clearAllBranches = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      assignedBranches: [],
    }));
  }, []);

  // Compute initials for header avatar preview
  const initials = useMemo(() => {
    const firstInitial = formData.firstName?.trim().charAt(0) || "";
    const lastInitial = formData.lastName?.trim().charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase() || "NU";
  }, [formData.firstName, formData.lastName]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedFirstName = formData.firstName.trim();
      const trimmedLastName = formData.lastName.trim();
      const trimmedEmail = formData.email.trim();

      if (!trimmedFirstName) {
        setErrorMessage("กรุณาระบุชื่อผู้ใช้งาน (First Name)");
        return;
      }
      if (!trimmedLastName) {
        setErrorMessage("กรุณาระบุนามสกุล (Last Name)");
        return;
      }
      if (!trimmedEmail) {
        setErrorMessage("กรุณาระบุอีเมล (Email Address)");
        return;
      }

      // Basic email syntax check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage("รูปแบบอีเมลไม่ถูกต้อง");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        if (onSave) {
          await onSave({
            userCode: formData.userCode.trim(),
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: trimmedEmail,
            phone: formData.phone.trim() || undefined,
            role: formData.role,
            tierLevel: formData.tierLevel,
            dataAccessScope: formData.dataAccessScope,
            assignedBrands: formData.assignedBrands,
            assignedBranches: formData.assignedBranches,
            status: formData.status,
          });
        }
        onClose();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้";
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSave, onClose]
  );

  return {
    userConfig,
    formData,
    orgTree,
    toggleBranch,
    selectAllBranches,
    clearAllBranches,
    initials,
    isSubmitting,
    errorMessage,
    handleChange,
    handleSubmit,
  };
}
