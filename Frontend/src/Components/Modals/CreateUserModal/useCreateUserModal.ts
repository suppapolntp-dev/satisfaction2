"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { UserModel, CreateUserPayload, UpdateUserPayload, UserTierLevel, UserStatus } from "@/Types/user";
import { HierarchyScopeLevel } from "@/Types/dataAccess";
import { useUserSettings } from "@/Lib/useUserSettings";
import { useOrgTree } from "@/Components/Sidebars/OrgHierarchyTreeSidebar/useOrgTree";

export interface CreateUserFormData {
  userCode: string;
  corporateId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  tierLevel: UserTierLevel;
  dataAccessScope: string;
  assignedBrands: string[];
  assignedBranches: string[];
  status: UserStatus;
}

export type UserModalTab = "account_profile" | "data_access_scope";

export interface DefaultScopeConfig {
  scopePath?: string;
  tierLevel?: UserTierLevel;
  assignedBrands?: string[];
  assignedBranches?: string[];
}

export function generateCorporateIdByTier(tier: UserTierLevel): string {
  const prefixMap: Record<UserTierLevel, string> = {
    "Super Admin": "SA",
    "Brand Owner": "BM",
    "Regional Manager (RM)": "RM",
    "Area Manager (AM)": "AM",
    "Branch Staff": "ST",
    "Custom Scope": "CS",
  };
  const prefix = prefixMap[tier] || "EMP";
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${num}`;
}

export function generateSecurePassword(): string {
  const charsSpecial = ["@", "#", "$", "!", "%", "*"];
  const randSpecial = charsSpecial[Math.floor(Math.random() * charsSpecial.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CRG@${randomNum}${randSpecial}`;
}

export interface UseCreateUserModalOptions {
  isOpen: boolean;
  user?: UserModel | null;
  defaultScope?: DefaultScopeConfig;
  availableBrands?: string[];
  availableBranches?: string[];
  onSave?: (userData: CreateUserPayload | UpdateUserPayload) => Promise<void> | void;
  onClose: () => void;
}

export function useCreateUserModal({
  isOpen,
  user,
  defaultScope,
  availableBrands = [],
  availableBranches = [],
  onSave,
  onClose,
}: UseCreateUserModalOptions) {
  const { userConfig } = useUserSettings();
  const isEditMode = Boolean(user);

  const [formData, setFormData] = useState<CreateUserFormData>({
    userCode: "",
    corporateId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "Manager",
    tierLevel: "Super Admin",
    dataAccessScope: "All Organizations (สำนักงานใหญ่)",
    assignedBrands: [],
    assignedBranches: [],
    status: "Active",
  });

  const [activeTab, setActiveTab] = useState<UserModalTab>("account_profile");
  const [copiedSql, setCopiedSql] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [copiedField, setCopiedField] = useState<"corporateId" | "password" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track initial population phase to prevent orgTree mount from overwriting user data
  const isInitialMountRef = useRef(true);

  // ─── 5-Tier Org Hierarchy Tree Hook (Identical to Dashboard Analyses) ───
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

  // Generator handlers
  const handleGenerateCorporateId = useCallback(() => {
    const newId = generateCorporateIdByTier(formData.tierLevel);
    setFormData((prev) => ({
      ...prev,
      userCode: newId,
      corporateId: newId,
    }));
  }, [formData.tierLevel]);

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generateSecurePassword();
    setFormData((prev) => ({
      ...prev,
      password: newPassword,
    }));
    setIsPasswordVisible(true);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const handleCopyField = useCallback(async (field: "corporateId" | "password") => {
    const value = field === "corporateId" ? (formData.userCode || formData.corporateId) : formData.password;
    if (!value) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }
    } catch (err) {
      console.warn("Failed to copy:", err);
    }
  }, [formData.userCode, formData.corporateId, formData.password]);

  // Scoped SQL generation for live DataAccess Query preview
  const scopedSql = useMemo(() => {
    const tier = formData.tierLevel;
    const brands = formData.assignedBrands;
    const branches = formData.assignedBranches;

    if (tier === "Super Admin" || (branches.length === 0 && brands.length === 0)) {
      return `-- Tier 1: Super Admin (Global Enterprise Scope)
SELECT v.id, v.score, v.rating, v.comment, v.created_at, b.name AS branch_name, br.brand_name
FROM satisfaction_votes v
JOIN branches b ON v.branch_id = b.id
JOIN brands br ON v.brand_id = br.id
WHERE v.is_active = true
ORDER BY v.created_at DESC;`;
    }

    const brandList = brands.length > 0 ? brands.map((b) => `'${b}'`).join(", ") : null;
    const branchList = branches.length > 0 ? branches.slice(0, 5).map((br) => `'${br}'`).join(", ") : null;
    const branchEllipsis = branches.length > 5 ? ` /* +${branches.length - 5} more branches */` : "";

    const whereClauses: string[] = ["v.is_active = true"];
    if (brandList) {
      whereClauses.push(`br.brand_name IN (${brandList})`);
    }
    if (branchList) {
      whereClauses.push(`b.name IN (${branchList}${branchEllipsis})`);
    }

    const tierComment =
      tier === "Brand Owner"
        ? "-- Tier 2: Brand Owner (Brand-Scoped Isolation)"
        : tier === "Regional Manager (RM)"
        ? "-- Tier 3: Regional Manager (Regional Boundary Scope)"
        : tier === "Area Manager (AM)"
        ? "-- Tier 4: Area Manager (Cluster & Branch Scope)"
        : tier === "Branch Staff"
        ? "-- Tier 5: Branch Staff (Single Kiosk/Branch Scope)"
        : "-- Custom Scope (Dual-Brand / Co-Location Cluster)";

    return `${tierComment}
SELECT v.id, v.score, v.rating, v.comment, v.created_at, b.name AS branch_name, br.brand_name
FROM satisfaction_votes v
JOIN branches b ON v.branch_id = b.id
JOIN brands br ON v.brand_id = br.id
WHERE ${whereClauses.join("\n  AND ")}
ORDER BY v.created_at DESC;`;
  }, [formData.tierLevel, formData.assignedBrands, formData.assignedBranches]);

  const handleCopySql = useCallback(async () => {
    if (!scopedSql) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(scopedSql);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2000);
      }
    } catch (err) {
      console.warn("Failed to copy SQL:", err);
    }
  }, [scopedSql]);

  // Populate or reset form when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("account_profile");
      setCopiedSql(false);
      if (user) {
        // Edit Mode: populate from existing user
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
          corporateId: user.corporateId || user.userCode || user.id || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          password: "",
          role: user.role || "Manager",
          tierLevel: user.tierLevel || "Area Manager (AM)",
          dataAccessScope: initialScope,
          assignedBrands: initialBrands,
          assignedBranches: initialBranches,
          status: user.status === "Inactive" ? "Inactive" : "Active",
        });

        const timer = setTimeout(() => {
          isInitialMountRef.current = false;
        }, 100);

        return () => clearTimeout(timer);
      } else {
        // Create Mode:
        // When opened from usermanagement tab (defaultScope undefined), default to a branch user (Branch Staff, ST-xxx, Agent)
        // When opened from dataaccess tab (defaultScope defined), pre-fill with selected sidebar scope (AM, RM, Brand, Admin, or Custom)
        isInitialMountRef.current = true;
        const initialTier = defaultScope?.tierLevel || "Branch Staff";
        const generatedId = generateCorporateIdByTier(initialTier);
        const initialPassword = generateSecurePassword();

        const defaultBranch = availableBranches.length > 0 ? availableBranches[0] : "";
        const defaultBrand = availableBrands.length > 0 ? availableBrands[0] : "";

        const initialScopePath = defaultScope?.scopePath ||
          (defaultBranch
            ? `${defaultBrand ? defaultBrand + " > " : ""}${defaultBranch}`
            : (orgTree.scopePath || "สาขาประจำ"));

        const initialBranches = defaultScope?.assignedBranches ||
          (defaultBranch ? [defaultBranch] : (orgTree.targetBranches || []));

        const initialBrands = defaultScope?.assignedBrands ||
          (defaultBrand ? [defaultBrand] : (orgTree.targetBrands || []));

        const initialRole = defaultScope
          ? (defaultScope.tierLevel === "Super Admin" ? "Administrator" : "Manager")
          : "Agent";

        setFormData({
          userCode: generatedId,
          corporateId: generatedId,
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: initialPassword,
          role: initialRole,
          tierLevel: initialTier,
          dataAccessScope: initialScopePath,
          assignedBrands: initialBrands,
          assignedBranches: initialBranches,
          status: "Active",
        });
        setIsPasswordVisible(true);

        const timer = setTimeout(() => {
          isInitialMountRef.current = false;
        }, 100);

        return () => clearTimeout(timer);
      }
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, user, defaultScope]);

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

      if (!isEditMode) {
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

        if (!formData.password || formData.password.trim().length < 6) {
          setErrorMessage("กรุณาระบุรหัสผ่านสำหรับการเข้าใช้งาน (อย่างน้อย 6 ตัวอักษร)");
          return;
        }
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        if (onSave) {
          await onSave({
            ...(user ? { id: user.id } : {}),
            userCode: user ? (user.userCode || formData.userCode) : (formData.userCode.trim() || formData.corporateId.trim()),
            corporateId: user ? (user.corporateId || user.userCode || formData.userCode) : (formData.corporateId.trim() || formData.userCode.trim()),
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: user ? user.email : trimmedEmail, // Locked when editing
            phone: formData.phone.trim() || undefined,
            password: !isEditMode ? formData.password.trim() : undefined,
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
        const message = err instanceof Error
          ? err.message
          : isEditMode
          ? "เกิดข้อผิดพลาดในการแก้ไขบัญชีผู้ใช้"
          : "เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้";
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, user, isEditMode, onSave, onClose]
  );

  return {
    userConfig,
    formData,
    isEditMode,
    isPasswordVisible,
    copiedField,
    orgTree,
    handleGenerateCorporateId,
    handleGeneratePassword,
    togglePasswordVisibility,
    handleCopyField,
    toggleBranch,
    selectAllBranches,
    clearAllBranches,
    initials,
    isSubmitting,
    errorMessage,
    activeTab,
    setActiveTab,
    scopedSql,
    copiedSql,
    handleCopySql,
    handleChange,
    handleSubmit,
  };
}
