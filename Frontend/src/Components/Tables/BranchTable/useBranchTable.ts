"use client";

import { useState, useMemo, useCallback } from "react";
import { BranchModel } from "@/Types/branch";

export type BranchTableSortField = "code" | "name" | "brand" | "province" | "region" | "kioskCount" | "status";
export type BranchTableSortDirection = "asc" | "desc";

export interface UseBranchTableOptions {
  branches: BranchModel[];
  initialPageSize?: number;
}

export function useBranchTable({
  branches = [],
  initialPageSize = 8,
}: UseBranchTableOptions) {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [sortField, setSortField] = useState<BranchTableSortField>("name");
  const [sortDirection, setSortDirection] = useState<BranchTableSortDirection>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Handle sorting toggles
  const handleSort = useCallback((field: BranchTableSortField) => {
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

  // Filtered dataset
  const filteredBranches = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return branches.filter((branch) => {
      return (
        !normalizedKeyword ||
        (branch.name || "").toLowerCase().includes(normalizedKeyword) ||
        (branch.code || "").toLowerCase().includes(normalizedKeyword) ||
        (branch.brand || "").toLowerCase().includes(normalizedKeyword) ||
        (branch.province || "").toLowerCase().includes(normalizedKeyword) ||
        (branch.region || "").toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [branches, searchKeyword]);

  // Sorted dataset
  const sortedBranches = useMemo(() => {
    return [...filteredBranches].sort((itemA, itemB) => {
      let comparison = 0;

      if (sortField === "name") {
        comparison = (itemA.name || "").localeCompare(itemB.name || "");
      } else if (sortField === "code") {
        comparison = (itemA.code || "").localeCompare(itemB.code || "");
      } else if (sortField === "brand") {
        comparison = (itemA.brand || "").localeCompare(itemB.brand || "");
      } else if (sortField === "province") {
        comparison = (itemA.province || "").localeCompare(itemB.province || "");
      } else if (sortField === "region") {
        comparison = (itemA.region || "").localeCompare(itemB.region || "");
      } else if (sortField === "kioskCount") {
        comparison = (itemA.kioskCount || 0) - (itemB.kioskCount || 0);
      } else if (sortField === "status") {
        comparison = (itemA.status || "").localeCompare(itemB.status || "");
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredBranches, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = sortedBranches.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBranches = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedBranches.slice(startIndex, startIndex + pageSize);
  }, [sortedBranches, safeCurrentPage, pageSize]);

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchKeyword(value);
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
    paginatedBranches,
    handleSort,
    handleSearchChange,
    handlePageChange,
    handleResetFilters,
    setPageSize,
  };
}
