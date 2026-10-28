"use client";

import { useState, useEffect, useCallback } from "react";
import { BrandModel } from "@/Types/brand";

export interface BrandFormData {
  brandName: string;
  brandId: string;
  parentCompanyName: string;
  category: string;
  brandLogoUrl: string;
  status: "Active" | "Inactive";
}

export interface UseBrandModalOptions {
  isOpen: boolean;
  brand: BrandModel | null;
  onSave: (id: string, data: Partial<BrandModel>) => Promise<void> | void;
  onClose: () => void;
}

export function useBrandModal({
  isOpen,
  brand,
  onSave,
  onClose,
}: UseBrandModalOptions) {
  const [formData, setFormData] = useState<BrandFormData>({
    brandName: "",
    brandId: "",
    parentCompanyName: "",
    category: "",
    brandLogoUrl: "",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever modal opens or brand changes
  useEffect(() => {
    if (isOpen && brand) {
      setFormData({
        brandName: brand.brandName || "",
        brandId: brand.brandId || brand.id || "",
        parentCompanyName: brand.parentCompanyName || "",
        category: brand.category || "",
        brandLogoUrl: brand.brandLogoUrl || "",
        status: brand.status === "Inactive" ? "Inactive" : "Active",
      });
      setErrorMessage(null);
    } else if (!isOpen) {
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, brand]);

  const handleChange = useCallback((field: keyof BrandFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!brand) return;

      const trimmedName = formData.brandName.trim();
      if (!trimmedName) {
        setErrorMessage("กรุณากรอกชื่อแบรนด์");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        await onSave(brand.id, {
          brandName: trimmedName,
          brandId: formData.brandId.trim() || brand.brandId,
          parentCompanyName: formData.parentCompanyName.trim() || brand.parentCompanyName,
          category: formData.category.trim() || brand.category,
          brandLogoUrl: formData.brandLogoUrl.trim() || undefined,
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
    [brand, formData, onSave, onClose]
  );

  return {
    formData,
    isSubmitting,
    errorMessage,
    handleChange,
    handleSubmit,
  };
}
