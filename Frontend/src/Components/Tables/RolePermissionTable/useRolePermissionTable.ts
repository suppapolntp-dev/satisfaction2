"use client";

import { useMemo, useState, useCallback } from "react";
import { PermissionRow, PermissionKey } from "@/Types/role";

export type PermissionSortField = "module" | PermissionKey;
export type PermissionSortDirection = "asc" | "desc";

export interface UseRolePermissionTableOptions {
  permissionData?: PermissionRow[];
  searchQuery?: string;
  initialSortField?: PermissionSortField;
  initialSortDirection?: PermissionSortDirection;
}

export function useRolePermissionTable({
  permissionData = [],
  searchQuery: externalSearchQuery,
  initialSortField = "module",
  initialSortDirection = "asc",
}: UseRolePermissionTableOptions = {}) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [sortField, setSortField] = useState<PermissionSortField>(initialSortField);
  const [sortDirection, setSortDirection] = useState<PermissionSortDirection>(initialSortDirection);

  const effectiveSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  const handleSort = useCallback((field: PermissionSortField) => {
    setSortField((previousField) => {
      if (previousField === field) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDirection("asc");
      return field;
    });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setInternalSearchQuery(value);
  }, []);

  const handleResetFilters = useCallback(() => {
    setInternalSearchQuery("");
  }, []);

  const permissionFieldKeys: PermissionKey[] = ["view", "create", "update", "delete", "export"];

  // Filter by search query
  const filteredPermissions = useMemo(() => {
    if (!effectiveSearchQuery.trim()) return permissionData;
    const query = effectiveSearchQuery.toLowerCase().trim();
    return permissionData.filter(
      (row) =>
        row.module.toLowerCase().includes(query) ||
        (row.moduleCode && row.moduleCode.toLowerCase().includes(query))
    );
  }, [permissionData, effectiveSearchQuery]);

  // Sort filtered items
  const sortedPermissions = useMemo(() => {
    return [...filteredPermissions].sort((itemA, itemB) => {
      let comparison = 0;
      if (sortField === "module") {
        comparison = itemA.module.localeCompare(itemB.module, "th");
      } else {
        const valA = itemA[sortField] ? 1 : 0;
        const valB = itemB[sortField] ? 1 : 0;
        comparison = valA - valB;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredPermissions, sortField, sortDirection]);

  // Permission stats
  const totalItems = permissionData.length;
  const totalAvailablePermissions = totalItems * permissionFieldKeys.length;
  const grantedPermissionsCount = useMemo(() => {
    return permissionData.reduce((total, row) => {
      return (
        total +
        (row.view ? 1 : 0) +
        (row.create ? 1 : 0) +
        (row.update ? 1 : 0) +
        (row.delete ? 1 : 0) +
        (row.export ? 1 : 0)
      );
    }, 0);
  }, [permissionData]);

  const grantedPercentage =
    totalAvailablePermissions > 0
      ? Math.round((grantedPermissionsCount / totalAvailablePermissions) * 100)
      : 0;

  return {
    filteredPermissions: sortedPermissions,
    rawFilteredCount: filteredPermissions.length,
    totalItems,
    permissionFieldKeys,
    searchQuery: effectiveSearchQuery,
    setSearchQuery: setInternalSearchQuery,
    handleSearchChange,
    handleResetFilters,
    sortField,
    sortDirection,
    handleSort,
    totalAvailablePermissions,
    grantedPermissionsCount,
    grantedPercentage,
  };
}
