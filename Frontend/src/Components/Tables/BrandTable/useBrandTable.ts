"use client";

import { useState, useMemo, useCallback } from "react";
import { BrandModel } from "@/Types/brand";

export type BrandTableSortField = "brandName" | "brandId" | "totalBranchesCount" | "csatAverage" | "status";
export type BrandTableSortDirection = "asc" | "desc";

export interface UseBrandTableOptions {
  brands: BrandModel[];
  initialPageSize?: number;
}

export function useBrandTable({
  brands = [],
  initialPageSize = 8,
}: UseBrandTableOptions) {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [sortField, setSortField] = useState<BrandTableSortField>("brandName");
  const [sortDirection, setSortDirection] = useState<BrandTableSortDirection>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Handle sorting toggles
  const handleSort = useCallback((field: BrandTableSortField) => {
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

  // Filtered and sorted dataset
  const filteredBrands = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return brands.filter((brand) => {
      return (
        !normalizedKeyword ||
        (brand.brandName || "").toLowerCase().includes(normalizedKeyword) ||
        (brand.brandId || "").toLowerCase().includes(normalizedKeyword) ||
        (brand.parentCompanyName || "").toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [brands, searchKeyword]);

  const sortedBrands = useMemo(() => {
    return [...filteredBrands].sort((itemA, itemB) => {
      let comparison = 0;

      if (sortField === "brandName") {
        comparison = (itemA.brandName || "").localeCompare(itemB.brandName || "");
      } else if (sortField === "brandId") {
        comparison = (itemA.brandId || "").localeCompare(itemB.brandId || "");
      } else if (sortField === "totalBranchesCount") {
        comparison = (itemA.totalBranchesCount || 0) - (itemB.totalBranchesCount || 0);
      } else if (sortField === "csatAverage") {
        const csatA = parseFloat(String(itemA.csatAverage || "0").replace("%", "")) || 0;
        const csatB = parseFloat(String(itemB.csatAverage || "0").replace("%", "")) || 0;
        comparison = csatA - csatB;
      } else if (sortField === "status") {
        comparison = (itemA.status || "").localeCompare(itemB.status || "");
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredBrands, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = sortedBrands.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBrands = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedBrands.slice(startIndex, startIndex + pageSize);
  }, [sortedBrands, safeCurrentPage, pageSize]);

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
    paginatedBrands,
    handleSort,
    handleSearchChange,
    handlePageChange,
    handleResetFilters,
    setPageSize,
  };
}
