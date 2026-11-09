"use client";

import { useState, useEffect } from "react";
import { SystemRoleItem, CreateRolePayload, UpdateRolePayload } from "@/Types/role";

export interface RoleFormData {
  roleId: string;
  roleCode: string;
  roleName: string;
  roleDescription: string;
  roleStatus: "Active" | "Inactive";
  cloneFromRole?: string;
}

export interface UseRoleModalOptions {
  isOpen: boolean;
  editingRole: SystemRoleItem | null;
  existingRoles: SystemRoleItem[];
  onSave: (roleData: RoleFormData) => Promise<void> | void;
}

export function useRoleModal({
  isOpen,
  editingRole,
  existingRoles,
  onSave,
}: UseRoleModalOptions) {
  const [formRoleName, setFormRoleName] = useState("");
  const [formRoleCode, setFormRoleCode] = useState("");
  const [formRoleDescription, setFormRoleDescription] = useState("");
  const [formCloneFromRole, setFormCloneFromRole] = useState(existingRoles[0]?.roleId || "");
  const [formRoleStatus, setFormRoleStatus] = useState<"Active" | "Inactive">("Active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (editingRole) {
      setFormRoleName(editingRole.roleName || "");
      setFormRoleCode(editingRole.roleCode || editingRole.roleId || "");
      setFormRoleDescription(editingRole.roleDescription || "");
      setFormRoleStatus(editingRole.roleStatus || "Active");
      setValidationError("");
    } else {
      const generatedCode = `ROLE_${Date.now().toString().slice(-6)}`;
      setFormRoleName("");
      setFormRoleCode(generatedCode);
      setFormRoleDescription("");
      setFormCloneFromRole(existingRoles[0]?.roleId || "");
      setFormRoleStatus("Active");
      setValidationError("");
    }
  }, [editingRole, isOpen, existingRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName.trim()) {
      setValidationError("กรุณาระบุชื่อบทบาท");
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError("");
      await onSave({
        roleId: editingRole ? editingRole.roleId : (formRoleCode.trim() || `ROLE_${Date.now()}`),
        roleCode: formRoleCode.trim().toUpperCase(),
        roleName: formRoleName.trim(),
        roleDescription: formRoleDescription.trim(),
        roleStatus: formRoleStatus,
        cloneFromRole: !editingRole ? formCloneFromRole : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formRoleName,
    setFormRoleName,
    formRoleCode,
    setFormRoleCode,
    formRoleDescription,
    setFormRoleDescription,
    formCloneFromRole,
    setFormCloneFromRole,
    formRoleStatus,
    setFormRoleStatus,
    isSubmitting,
    validationError,
    handleSubmit,
  };
}
