"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { UserModel, UpdateUserPayload, UserTierLevel, UserStatus } from "@/Types/user";
import { HierarchyScopeLevel } from "@/Types/dataAccess";
import { useUserSettings } from "@/Lib/useUserSettings";
import { useOrgTree } from "@/Components/Sidebars/OrgHierarchyTreeSidebar/useOrgTree";

export interface EditUserFormData {
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

export interface UseEditUserModalOptions {
  isOpen: boolean;
  user: UserModel | null;
  onSave?: (id: string, userData: UpdateUserPayload) => Promise<void> | void;
  onClose: () => void;
}

export function useEditUserModal({
  isOpen,
  user,
  onSave,
  onClose,
}: UseEditUserModalOptions) {
  const { userConfig } = useUserSettings();

  const [formData, setFormData] = useState<EditUserFormData>({
    userCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Manager",
    tierLevel: "Area Manager (AM)",
    dataAccessScope: "All Organizations (สำนักงานใหญ่)",
    assignedBrands: [],
    assignedBranches: [],
    status: "Active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track initial population phase to prevent orgTree mount from overwriting user data
  const isInitialMountRef = useRef(true);

  // ─── 5-Tier Org Hierarchy Tree Hook (Identical to Dashboard Analyses & Add User) ───
  const orgTree = useOrgTree({
    onScopeChange: (scopeInfo) => {
      if (isInitialMountRef.current) {
        return;
      }
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

  // Populate form with existing user data on open
  useEffect(() => {
    if (isOpen && user) {
      isInitialMountRef.current = true;

      const initialBranches = user.assignedBranches && user.assignedBranches.length > 0
        ? [...user.assignedBranches]
        : user.branch && user.branch !== "-"
        ? [user.branch]
        : [];

      const initialBrands = user.assignedBrands && user.assignedBrands.length > 0
        ? [...user.assignedBrands]
        : user.brand && user.brand !== "ทุกแบรนด์"
        ? [user.brand]
        : [];

      const initialScope = user.dataAccessScope || (
        initialBranches.length > 0
          ? initialBranches.join(", ")
          : initialBrands.length > 0
          ? initialBrands.join(", ")
          : "All Organizations (สำนักงานใหญ่)"
      );

      setFormData({
        userCode: user.userCode || user.id || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "Manager",
        tierLevel: user.tierLevel || "Area Manager (AM)",
        dataAccessScope: initialScope,
        assignedBrands: initialBrands,
        assignedBranches: initialBranches,
        status: user.status === "Inactive" ? "Inactive" : "Active",
      });

      setErrorMessage(null);
      setIsSubmitting(false);

      const timer = setTimeout(() => {
        isInitialMountRef.current = false;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, user]);

  const handleChange = useCallback((field: keyof EditUserFormData, value: unknown) => {
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
      if (!user) return;

      const trimmedFirstName = formData.firstName.trim();
      const trimmedLastName = formData.lastName.trim();

      if (!trimmedFirstName) {
        setErrorMessage("กรุณาระบุชื่อผู้ใช้งาน (First Name)");
        return;
      }
      if (!trimmedLastName) {
        setErrorMessage("กรุณาระบุนามสกุล (Last Name)");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        if (onSave) {
          await onSave(user.id, {
            id: user.id,
            userCode: user.userCode || formData.userCode, // Keep original userCode locked
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: user.email, // Keep original email locked
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
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการแก้ไขบัญชีผู้ใช้";
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, formData, onSave, onClose]
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
