"use client";

import React from "react";
import { UserModel, UpdateUserPayload } from "@/Types/user";
import CreateUserModal from "@/Components/Modals/CreateUserModal";

export interface EditUserModalProps {
  isOpen: boolean;
  user: UserModel | null;
  availableBrands?: string[];
  availableBranches?: string[];
  onClose: () => void;
  onSave?: (id: string, userData: UpdateUserPayload) => Promise<void> | void;
}

/**
 * EditUserModal: Reuses the unified CreateUserModal with isEditMode=true.
 * Shares 100% layout, Tab Pills split workspace, locked corporate credentials,
 * and real-time DataAccess Scope query inspection.
 */
export default function EditUserModal({
  isOpen,
  user,
  availableBrands = [],
  availableBranches = [],
  onClose,
  onSave,
}: EditUserModalProps) {
  return (
    <CreateUserModal
      isOpen={isOpen}
      user={user}
      availableBrands={availableBrands}
      availableBranches={availableBranches}
      onClose={onClose}
      onSave={
        onSave
          ? async (userData: any) => {
              if (user?.id) {
                await onSave(user.id, userData as UpdateUserPayload);
              }
            }
          : undefined
      }
    />
  );
}
