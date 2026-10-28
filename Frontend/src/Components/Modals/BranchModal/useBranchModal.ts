"use client";

import { useState, useEffect, useCallback } from "react";
import { BranchModel } from "@/Types/branch";

export interface BranchFormData {
  name: string;
  code: string;
  brands: string[];
  region: string;
  province: string;
  kioskCount: number;
  status: "Active" | "Inactive";
}

export interface UseBranchModalOptions {
  isOpen: boolean;
  branch: BranchModel | null;
  onSave: (branchData: {
    id?: string;
    code: string;
    name: string;
    brand: string;
    brands: string[];
    region: string;
    province: string;
    kioskCount: number;
    status: "Active" | "Inactive";
  }) => Promise<void> | void;
  onClose: () => void;
}

export function useBranchModal({
  isOpen,
  branch,
  onSave,
  onClose,
}: UseBranchModalOptions) {
  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    code: "",
    brands: [],
    region: "ภาคเหนือ",
    province: "เชียงใหม่",
    kioskCount: 1,
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && branch) {
      setFormData({
        name: branch.name || "",
        code: branch.code || "",
        brands: branch.brands && branch.brands.length > 0 ? branch.brands : (branch.brand ? [branch.brand] : []),
        region: branch.region || "ภาคเหนือ",
        province: branch.province || "",
        kioskCount: branch.kioskCount || 1,
        status: branch.status === "Inactive" ? "Inactive" : "Active",
      });
      setErrorMessage(null);
    } else if (isOpen && !branch) {
      setFormData({
        name: "",
        code: `CRG-BR-${Math.floor(10 + Math.random() * 80)}`,
        brands: [],
        region: "ภาคเหนือ",
        province: "",
        kioskCount: 1,
        status: "Active",
      });
      setErrorMessage(null);
    } else {
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, branch]);

  const handleChange = useCallback((field: keyof BranchFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setFormData((prev) => {
      const exists = prev.brands.includes(brand);
      return {
        ...prev,
        brands: exists ? prev.brands.filter((b) => b !== brand) : [...prev.brands, brand],
      };
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = formData.name.trim();
      const trimmedCode = formData.code.trim();

      if (!trimmedName) {
        setErrorMessage("กรุณากรอกชื่อสาขา");
        return;
      }
      if (!trimmedCode) {
        setErrorMessage("กรุณากรอกรหัสสาขา");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const brandDisplay = formData.brands.join(" + ") || "CRG Brand";
        await onSave({
          id: branch?.id,
          code: trimmedCode,
          name: trimmedName,
          brand: brandDisplay,
          brands: formData.brands,
          region: formData.region,
          province: formData.province.trim(),
          kioskCount: formData.kioskCount,
          status: formData.status,
        });
        onClose();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [branch, formData, onSave, onClose]
  );

  return {
    formData,
    isSubmitting,
    errorMessage,
    handleChange,
    toggleBrand,
    handleSubmit,
  };
}
