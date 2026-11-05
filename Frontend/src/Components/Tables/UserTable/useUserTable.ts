"use client";

import { useState, useMemo, useCallback } from "react";
import { UserModel, UserTierLevel, UserStatus } from "@/Types/user";

export type UserTableSortField =
  | "userCode"
  | "name"
  | "email"
  | "role"
  | "tierLevel"
  | "status"
  | "createdDate";

export type UserTableSortDirection = "asc" | "desc";

export interface UseUserTableOptions {
  users?: UserModel[];
  initialPageSize?: number;
}

export function useUserTable({
  users = [],
  initialPageSize = 8,
}: UseUserTableOptions = {}) {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<UserTableSortField>("name");
  const [sortDirection, setSortDirection] = useState<UserTableSortDirection>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // Sorting handler
  const handleSort = useCallback((field: UserTableSortField) => {
    setSortField((previousField) => {
      if (previousField === field) {
        setSortDirection((previousDirection) => (previousDirection === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDirection("asc");
      return field;
    });
    setCurrentPage(1);
  }, []);

  // Filtered list
  const filteredUsers = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return users.filter((user) => {
      // Keyword filter
      if (normalizedKeyword) {
        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
        const userCode = (user.userCode ?? "").toLowerCase();
        const email = (user.email ?? "").toLowerCase();
        const role = (user.role ?? "").toLowerCase();
        const brands = (user.assignedBrands ?? []).join(" ").toLowerCase();
        const branches = (user.assignedBranches ?? []).join(" ").toLowerCase();

        const matchesKeyword =
          fullName.includes(normalizedKeyword) ||
          userCode.includes(normalizedKeyword) ||
          email.includes(normalizedKeyword) ||
          role.includes(normalizedKeyword) ||
          brands.includes(normalizedKeyword) ||
          branches.includes(normalizedKeyword);

        if (!matchesKeyword) return false;
      }

      // Tier filter
      if (tierFilter !== "All" && user.tierLevel !== tierFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "All" && user.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchKeyword, tierFilter, statusFilter]);

  // Sorted list
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((userA, userB) => {
      let comparison = 0;

      switch (sortField) {
        case "userCode":
          comparison = (userA.userCode ?? "").localeCompare(userB.userCode ?? "");
          break;
        case "name": {
          const nameA = `${userA.firstName ?? ""} ${userA.lastName ?? ""}`.trim();
          const nameB = `${userB.firstName ?? ""} ${userB.lastName ?? ""}`.trim();
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case "email":
          comparison = (userA.email ?? "").localeCompare(userB.email ?? "");
          break;
        case "role":
          comparison = (userA.role ?? "").localeCompare(userB.role ?? "");
          break;
        case "tierLevel":
          comparison = (userA.tierLevel ?? "").localeCompare(userB.tierLevel ?? "");
          break;
        case "status":
          comparison = (userA.status ?? "").localeCompare(userB.status ?? "");
          break;
        case "createdDate":
          comparison = (userA.createdDate ?? "").localeCompare(userB.createdDate ?? "");
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [sortedUsers, safeCurrentPage, pageSize]);

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);

  const handleResetFilters = useCallback(() => {
    setSearchKeyword("");
    setTierFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchKeyword !== "" || tierFilter !== "All" || statusFilter !== "All";

  return {
    searchKeyword,
    setSearchKeyword,
    tierFilter,
    setTierFilter,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    currentPage: safeCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedUsers,
    activeMenuUserId,
    setActiveMenuUserId,
    hasActiveFilters,
    handleSort,
    handlePageChange,
    handleResetFilters,
  };
}
