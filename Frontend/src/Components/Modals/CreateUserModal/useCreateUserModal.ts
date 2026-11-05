"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateUserPayload, UserTierLevel, UserStatus } from "@/Types/user";

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
  onSave?: (userData: CreateUserPayload) => Promise<void> | void;
  onClose: () => void;
}

export function useCreateUserModal({
  isOpen,
  onSave,
  onClose,
}: UseCreateUserModalOptions) {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleChange = useCallback((field: keyof CreateUserFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const toggleBrand = useCallback((brandName: string) => {
    setFormData((prev) => {
      const exists = prev.assignedBrands.includes(brandName);
      return {
        ...prev,
        assignedBrands: exists
          ? prev.assignedBrands.filter((b) => b !== brandName)
          : [...prev.assignedBrands, brandName],
      };
    });
  }, []);

  const selectAllBrands = useCallback((allBrands: string[]) => {
    setFormData((prev) => ({ ...prev, assignedBrands: [...allBrands] }));
  }, []);

  const clearBrands = useCallback(() => {
    setFormData((prev) => ({ ...prev, assignedBrands: [] }));
  }, []);

  const toggleBranch = useCallback((branchName: string) => {
    setFormData((prev) => {
      const exists = prev.assignedBranches.includes(branchName);
      return {
        ...prev,
        assignedBranches: exists
          ? prev.assignedBranches.filter((b) => b !== branchName)
          : [...prev.assignedBranches, branchName],
      };
    });
  }, []);

  const selectAllBranches = useCallback((allBranches: string[]) => {
    setFormData((prev) => ({ ...prev, assignedBranches: [...allBranches] }));
  }, []);

  const clearBranches = useCallback(() => {
    setFormData((prev) => ({ ...prev, assignedBranches: [] }));
  }, []);

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
    formData,
    isSubmitting,
    errorMessage,
    handleChange,
    toggleBrand,
    selectAllBrands,
    clearBrands,
    toggleBranch,
    selectAllBranches,
    clearBranches,
    handleSubmit,
  };
}
