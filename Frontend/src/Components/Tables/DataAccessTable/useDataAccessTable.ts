"use client";

import { useState, useMemo, useCallback } from "react";
import { UserAccessRecord } from "@/Types/dataAccess";

export type DataAccessTableSortField = "userName" | "tierLevel" | "assignedBrands" | "status";
export type DataAccessTableSortDirection = "asc" | "desc";

export interface UseDataAccessTableOptions {
  users: UserAccessRecord[];
  initialPageSize?: number;
}

export function useDataAccessTable({
  users = [],
  initialPageSize = 8,
}: UseDataAccessTableOptions) {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [sortField, setSortField] = useState<DataAccessTableSortField>("userName");
  const [sortDirection, setSortDirection] = useState<DataAccessTableSortDirection>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const handleSort = useCallback((field: DataAccessTableSortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDirection("asc");
      return field;
    });
    setCurrentPage(1);
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const matchName = (u.userName || "").toLowerCase().includes(q);
      const matchEmail = (u.userEmail || "").toLowerCase().includes(q);
      const matchTier = (u.tierLevel || "").toLowerCase().includes(q);
      const matchBrands = (u.assignedBrands || []).some((b) => b.toLowerCase().includes(q));
      const matchBranches = (u.assignedBranches || []).some((br) => br.toLowerCase().includes(q));
      return matchName || matchEmail || matchTier || matchBrands || matchBranches;
    });
  }, [users, searchKeyword]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let cmp = 0;
      if (sortField === "userName") {
        cmp = (a.userName || "").localeCompare(b.userName || "");
      } else if (sortField === "tierLevel") {
        cmp = (a.tierLevel || "").localeCompare(b.tierLevel || "");
      } else if (sortField === "assignedBrands") {
        cmp = (a.assignedBrands?.length || 0) - (b.assignedBrands?.length || 0);
      } else if (sortField === "status") {
        cmp = (a.status || "").localeCompare(b.status || "");
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [filteredUsers, sortField, sortDirection]);

  const totalItems = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, safeCurrentPage, pageSize]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const handleSearchChange = useCallback((val: string) => {
    setSearchKeyword(val);
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchKeyword("");
    setCurrentPage(1);
  }, []);

  return {
    searchKeyword,
    sortField,
    sortDirection,
    currentPage: safeCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedUsers,
    handleSort,
    handleSearchChange,
    handlePageChange,
    handleResetFilters,
    setPageSize,
  };
}
