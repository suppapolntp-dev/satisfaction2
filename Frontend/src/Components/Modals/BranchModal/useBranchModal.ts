"use client";

import { useState, useEffect, useCallback } from "react";
import { BranchModel } from "@/Types/branch";

export interface BranchFormData {
  name: string;
  code: string;
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
        kioskCount: branch.kioskCount || 1,
        status: branch.status === "Inactive" ? "Inactive" : "Active",
      });
      setErrorMessage(null);
    } else if (isOpen && !branch) {
      setFormData({
        name: "",
        code: `CRG-BR-${Math.floor(10 + Math.random() * 80)}`,
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
        await onSave({
          id: branch?.id,
          code: trimmedCode,
          name: trimmedName,
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
    handleSubmit,
  };
}
