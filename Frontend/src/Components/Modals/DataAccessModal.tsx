"use client";

import React, { useMemo } from "react";
import { UserAccessRecord } from "@/Types/dataAccess";
import { UserModel, UserTierLevel, UserStatus } from "@/Types/user";
import CreateUserModal from "@/Components/Modals/CreateUserModal";

export interface DataAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: UserAccessRecord | null;
  availableBrands?: string[];
  availableBranches?: string[];
  availableRegions?: string[];
  availableProvinces?: string[];
  onSave: (userData: {
    id?: string;
    userId?: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    tierLevel: UserAccessRecord["tierLevel"];
    assignedBrands: string[];
    assignedRegions: string[];
    assignedProvinces: string[];
    assignedBranches: string[];
    status: "Active" | "Inactive";
  }) => Promise<void> | void;
}

/**
 * DataAccessModal: Adapts and delegates to the unified CreateUserModal
 * Featuring the 2-column split workspace: Scope Hierarchy tree on the left,
 * and Tab Pills (Account Profile vs DataAccess Scope) on the right (image_bc107c.png).
 */
export default function DataAccessModal({
  isOpen,
  onClose,
  editingUser,
  availableBrands = [],
  availableBranches = [],
  onSave,
}: DataAccessModalProps) {
  const mappedUser: UserModel | null = useMemo(() => {
    if (!editingUser) return null;
    const nameParts = (editingUser.userName || "").trim().split(" ");
    const firstName = nameParts[0] || editingUser.userName || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      id: editingUser.userId || editingUser.id,
      userCode: editingUser.id || "",
      corporateId: editingUser.id || "",
      firstName,
      lastName,
      email: editingUser.userEmail || "",
      phone: editingUser.userPhone || "",
      role: "Manager",
      tierLevel: (editingUser.tierLevel || "Area Manager (AM)") as UserTierLevel,
      dataAccessScope:
        editingUser.assignedBranches?.length > 0
          ? editingUser.assignedBranches.join(", ")
          : editingUser.assignedBrands?.length > 0
          ? editingUser.assignedBrands.join(", ")
          : "All Organizations (สำนักงานใหญ่)",
      brand: editingUser.assignedBrands?.join(", ") || "",
      branch: editingUser.assignedBranches?.join(", ") || "",
      assignedBrands: editingUser.assignedBrands || [],
      assignedBranches: editingUser.assignedBranches || [],
      status: (editingUser.status === "Inactive" ? "Inactive" : "Active") as UserStatus,
    };
  }, [editingUser]);

  return (
    <CreateUserModal
      isOpen={isOpen}
      user={mappedUser}
      availableBrands={availableBrands}
      availableBranches={availableBranches}
      onClose={onClose}
      onSave={async (userData: any) => {
        await onSave({
          id: editingUser?.id || userData.id,
          userId: editingUser?.userId || userData.id,
          userName: `${userData.firstName} ${userData.lastName}`.trim(),
          userEmail: userData.email,
          userPhone: userData.phone || "+66 80 000 0000",
          tierLevel: userData.tierLevel,
          assignedBrands: userData.assignedBrands || [],
          assignedRegions: userData.assignedRegions || [],
          assignedProvinces: userData.assignedProvinces || [],
          assignedBranches: userData.assignedBranches || [],
          status: userData.status === "Inactive" ? "Inactive" : "Active",
        });
      }}
    />
  );
}

