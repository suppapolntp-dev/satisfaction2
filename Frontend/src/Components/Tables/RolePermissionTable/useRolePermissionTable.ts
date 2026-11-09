"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
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

  // Expanded parents state: id or module -> boolean (defaults to all expanded)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Initialize all parents to expanded by default
  useEffect(() => {
    if (permissionData.length > 0) {
      setExpandedRows((prev) => {
        const next = { ...prev };
        permissionData.forEach((row) => {
          const key = row.id || row.module;
          if (next[key] === undefined) {
            next[key] = true;
          }
        });
        return next;
      });
    }
  }, [permissionData]);

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

  const toggleExpand = useCallback((rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  const expandAll = useCallback(() => {
    const next: Record<string, boolean> = {};
    permissionData.forEach((row) => {
      next[row.id || row.module] = true;
    });
    setExpandedRows(next);
  }, [permissionData]);

  const collapseAll = useCallback(() => {
    const next: Record<string, boolean> = {};
    permissionData.forEach((row) => {
      next[row.id || row.module] = false;
    });
    setExpandedRows(next);
  }, [permissionData]);

  const permissionFieldKeys: PermissionKey[] = ["view", "create", "update", "delete", "export"];

  // Filter tree by search query
  const filteredPermissions = useMemo(() => {
    const query = effectiveSearchQuery.toLowerCase().trim();
    if (!query) return permissionData;

    return permissionData
      .map((parent) => {
        const parentMatches =
          parent.module.toLowerCase().includes(query) ||
          (parent.moduleCode && parent.moduleCode.toLowerCase().includes(query));

        if (!parent.children || parent.children.length === 0) {
          return parentMatches ? parent : null;
        }

        const matchingChildren = parent.children.filter(
          (child) =>
            child.module.toLowerCase().includes(query) ||
            (child.moduleCode && child.moduleCode.toLowerCase().includes(query)) ||
            (child.description && child.description.toLowerCase().includes(query))
        );

        if (parentMatches) {
          return parent;
        }

        if (matchingChildren.length > 0) {
          return {
            ...parent,
            children: matchingChildren,
          };
        }

        return null;
      })
      .filter((item): item is PermissionRow => item !== null);
  }, [permissionData, effectiveSearchQuery]);

  // When search query is active, auto-expand matching parents
  useEffect(() => {
    if (effectiveSearchQuery.trim()) {
      const next: Record<string, boolean> = {};
      filteredPermissions.forEach((row) => {
        next[row.id || row.module] = true;
      });
      setExpandedRows((prev) => ({ ...prev, ...next }));
    }
  }, [effectiveSearchQuery, filteredPermissions]);

  // Sort parents
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

  // Statistics calculation across all sub-features (or parents if flat)
  const stats = useMemo(() => {
    let totalFeatures = 0;
    let grantedCount = 0;

    permissionData.forEach((parent) => {
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach((child) => {
          totalFeatures += 1;
          grantedCount +=
            (child.view ? 1 : 0) +
            (child.create ? 1 : 0) +
            (child.update ? 1 : 0) +
            (child.delete ? 1 : 0) +
            (child.export ? 1 : 0);
        });
      } else {
        totalFeatures += 1;
        grantedCount +=
          (parent.view ? 1 : 0) +
          (parent.create ? 1 : 0) +
          (parent.update ? 1 : 0) +
          (parent.delete ? 1 : 0) +
          (parent.export ? 1 : 0);
      }
    });

    const totalAvailable = totalFeatures * permissionFieldKeys.length;
    const percentage = totalAvailable > 0 ? Math.round((grantedCount / totalAvailable) * 100) : 0;

    return {
      totalParents: permissionData.length,
      totalFeatures,
      grantedCount,
      totalAvailable,
      percentage,
    };
  }, [permissionData, permissionFieldKeys.length]);

  const isAllExpanded = useMemo(() => {
    if (permissionData.length === 0) return true;
    return permissionData.every((row) => expandedRows[row.id || row.module] !== false);
  }, [permissionData, expandedRows]);

  return {
    filteredPermissions: sortedPermissions,
    rawFilteredCount: filteredPermissions.length,
    totalItems: permissionData.length,
    permissionFieldKeys,
    searchQuery: effectiveSearchQuery,
    setSearchQuery: setInternalSearchQuery,
    handleSearchChange,
    handleResetFilters,
    sortField,
    sortDirection,
    handleSort,
    expandedRows,
    toggleExpand,
    expandAll,
    collapseAll,
    isAllExpanded,
    totalAvailablePermissions: stats.totalAvailable,
    grantedPermissionsCount: stats.grantedCount,
    grantedPercentage: stats.percentage,
    totalFeatures: stats.totalFeatures,
  };
}
