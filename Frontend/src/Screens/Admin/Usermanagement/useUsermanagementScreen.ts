"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserModel, CreateUserPayload, UpdateUserPayload } from "@/Types/user";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { userService } from "@/Services/userService";
import { brandService } from "@/Services/brandService";
import { branchService } from "@/Services/branchService";
import { useUserSettings } from "@/Lib/useUserSettings";
import { useApiMode } from "@/Context/ApiModeContext";

export type UserManagementScreenTab = "users" | "dataaccess";

export interface UseUsermanagementScreenProps {
  initialTab?: UserManagementScreenTab;
}

export function useUsermanagementScreen({
  initialTab,
}: UseUsermanagementScreenProps = {}) {
  const { isApiEnabled } = useApiMode();
  const { userConfig } = useUserSettings();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active tab driven by URL query parameter (?tab=dataaccess)
  const tabQuery = searchParams.get("tab");
  const activeTab: UserManagementScreenTab =
    tabQuery === "dataaccess" ? "dataaccess" : initialTab || "users";

  const [users, setUsers] = useState<UserModel[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserModel | null>(null);

  // Delete confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [usersData, brandsData, branchesData] = await Promise.all([
          userService.getUsers(),
          brandService.getBrands(),
          branchService.getBranches(),
        ]);

        if (isMounted) {
          setUsers(Array.isArray(usersData) ? usersData : []);
          setAvailableBrands(Array.isArray(brandsData) ? brandsData.map((b) => b.brandName) : []);
          setAvailableBranches(Array.isArray(branchesData) ? branchesData.map((b) => b.name) : []);
        }
      } catch (error) {
        console.error("[useUsermanagementScreen] loadInitialData error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [isApiEnabled]);

  // Tab Management
  const userManagementTabs: HeaderTabItem[] = useMemo(
    () => [
      {
        id: "users",
        label: "User Accounts",
        badge: users.length > 0 ? users.length : undefined,
      },
      {
        id: "dataaccess",
        label: "Data Access Scope",
      },
    ],
    [users.length]
  );

  const handleTabChange = useCallback(
    (tabId: string) => {
      const targetTab = tabId as UserManagementScreenTab;
      if (targetTab === "dataaccess") {
        router.push("/usermanagement?tab=dataaccess", { scroll: false });
      } else {
        router.push("/usermanagement", { scroll: false });
      }
    },
    [router]
  );

  // Modal handlers
  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleSaveCreateUser = useCallback(async (userData: CreateUserPayload) => {
    try {
      const created = await userService.createUser(userData);
      setUsers((prev) => [created, ...prev]);
    } catch (error) {
      console.error("[useUsermanagementScreen] handleSaveCreateUser error:", error);
      throw error;
    }
  }, []);

  const handleOpenEditModal = useCallback((user: UserModel) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleSaveEditUser = useCallback(
    async (userId: string, updatedData: UpdateUserPayload) => {
      try {
        const updated = await userService.updateUser(userId, updatedData);
        setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      } catch (error) {
        console.error("[useUsermanagementScreen] handleSaveEditUser error:", error);
        throw error;
      }
    },
    []
  );

  const handleToggleStatus = useCallback(async (user: UserModel) => {
    const nextStatus = user.status === "Active" ? "Inactive" : "Active";
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );

    try {
      await userService.toggleUserStatus(user.id, nextStatus);
    } catch (error) {
      console.error("[useUsermanagementScreen] handleToggleStatus error:", error);
      // Revert optimistic update on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u))
      );
    }
  }, []);

  const handleRequestDelete = useCallback((user: UserModel) => {
    setDeletingUser(user);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeletingUser(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      await userService.deleteUser(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setIsDeleteConfirmOpen(false);
      setDeletingUser(null);
    } catch (error) {
      console.error("[useUsermanagementScreen] handleConfirmDelete error:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [deletingUser]);

  return {
    userConfig,
    activeTab,
    userManagementTabs,
    handleTabChange,
    users,
    availableBrands,
    availableBranches,
    isLoading,
    isCreateModalOpen,
    isEditModalOpen,
    editingUser,
    isDeleteConfirmOpen,
    deletingUser,
    isDeleting,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleSaveCreateUser,
    handleOpenEditModal,
    handleCloseEditModal,
    handleSaveEditUser,
    handleToggleStatus,
    handleRequestDelete,
    handleCloseDeleteConfirm,
    handleConfirmDelete,
  };
}
