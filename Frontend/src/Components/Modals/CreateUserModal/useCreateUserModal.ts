"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CreateUserPayload, UserTierLevel, UserStatus } from "@/Types/user";
import { BranchModel } from "@/Types/branch";
import { branchService } from "@/Services/branchService";
import { useUserSettings } from "@/Lib/useUserSettings";

export interface CreateUserFormData {
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  tierLevel: UserTierLevel;
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
  availableBrands = [],
  availableBranches = [],
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
    tierLevel: "Area Manager (AM)",
    assignedBrands: [],
    assignedBranches: [],
    status: "Active",
  });

  const [branches, setBranches] = useState<BranchModel[]>([]);
  const [isBranchesLoading, setIsBranchesLoading] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState("");
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  const [focusedBranch, setFocusedBranch] = useState<BranchModel | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load branches from service on open
  useEffect(() => {
    let isMounted = true;

    async function loadBranches() {
      if (!isOpen) return;
      try {
        setIsBranchesLoading(true);
        const data = await branchService.getBranches();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setBranches(data);
            setFocusedBranch(data[0]);
          } else if (availableBranches.length > 0) {
            const fallbackBranches: BranchModel[] = availableBranches.map((name, idx) => ({
              id: `br-${idx}`,
              code: `CRG-${idx + 1}`,
              name,
              brand: availableBrands[0] || "General",
              region: "Central",
              province: "Bangkok",
              kioskCount: 2,
              satisfaction: 92,
              status: "Active",
            }));
            setBranches(fallbackBranches);
            setFocusedBranch(fallbackBranches[0]);
          }
        }
      } catch (err) {
        console.error("[useCreateUserModal] loadBranches error:", err);
      } finally {
        if (isMounted) {
          setIsBranchesLoading(false);
        }
      }
    }

    loadBranches();

    return () => {
      isMounted = false;
    };
  }, [isOpen, availableBranches, availableBrands]);

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
        tierLevel: "Area Manager (AM)",
        assignedBrands: [],
        assignedBranches: [],
        status: "Active",
      });
      setBranchSearchQuery("");
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Filtered branches by search query
  const filteredBranches = useMemo(() => {
    if (!branchSearchQuery.trim()) return branches;
    const query = branchSearchQuery.toLowerCase().trim();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.code.toLowerCase().includes(query) ||
        (b.brand && b.brand.toLowerCase().includes(query)) ||
        (b.province && b.province.toLowerCase().includes(query))
    );
  }, [branches, branchSearchQuery]);

  // Group branches by brand
  const branchesByBrand = useMemo(() => {
    const map: Record<string, BranchModel[]> = {};
    filteredBranches.forEach((branch) => {
      const brandKey = branch.brand || "General";
      if (!map[brandKey]) {
        map[brandKey] = [];
      }
      map[brandKey].push(branch);
    });
    return map;
  }, [filteredBranches]);

  const toggleBrandExpand = useCallback((brandName: string) => {
    setExpandedBrands((prev) => ({
      ...prev,
      [brandName]: prev[brandName] === undefined ? false : !prev[brandName],
    }));
  }, []);

  const handleChange = useCallback((field: keyof CreateUserFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Toggle a single branch selection
  const toggleBranch = useCallback(
    (branchName: string, branchObj?: BranchModel) => {
      setFormData((prev) => {
        const isSelected = prev.assignedBranches.includes(branchName);
        const updatedBranches = isSelected
          ? prev.assignedBranches.filter((b) => b !== branchName)
          : [...prev.assignedBranches, branchName];

        const relatedBrands = new Set(prev.assignedBrands);
        if (branchObj?.brand) {
          if (!isSelected) {
            relatedBrands.add(branchObj.brand);
          } else {
            const stillHasBrand = branches.some(
              (b) => b.brand === branchObj.brand && updatedBranches.includes(b.name)
            );
            if (!stillHasBrand) {
              relatedBrands.delete(branchObj.brand);
            }
          }
        }

        return {
          ...prev,
          assignedBranches: updatedBranches,
          assignedBrands: Array.from(relatedBrands),
        };
      });

      if (branchObj) {
        setFocusedBranch(branchObj);
      }
    },
    [branches]
  );

  // Select all branches in scope
  const selectAllBranches = useCallback(() => {
    const allNames = branches.map((b) => b.name);
    const allBrands = Array.from(new Set(branches.map((b) => b.brand).filter(Boolean)));
    setFormData((prev) => ({
      ...prev,
      assignedBranches: allNames,
      assignedBrands: allBrands,
    }));
  }, [branches]);

  // Clear all branches
  const clearAllBranches = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      assignedBranches: [],
      assignedBrands: [],
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
    branches,
    isBranchesLoading,
    branchSearchQuery,
    setBranchSearchQuery,
    branchesByBrand,
    expandedBrands,
    toggleBrandExpand,
    focusedBranch,
    setFocusedBranch,
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
