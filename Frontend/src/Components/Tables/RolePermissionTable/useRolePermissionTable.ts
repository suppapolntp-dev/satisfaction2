"use client";

import { useMemo, useState } from "react";
import { PermissionRow, PermissionKey } from "@/Types/role";

export interface UseRolePermissionTableOptions {
  permissionData?: PermissionRow[];
  searchQuery?: string;
}

export function useRolePermissionTable({
  permissionData = [],
  searchQuery: externalSearchQuery,
}: UseRolePermissionTableOptions = {}) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");

  const effectiveSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  const filteredPermissions = useMemo(() => {
    if (!effectiveSearchQuery.trim()) return permissionData;
    const query = effectiveSearchQuery.toLowerCase().trim();
    return permissionData.filter(
      (row) =>
        row.module.toLowerCase().includes(query) ||
        (row.moduleCode && row.moduleCode.toLowerCase().includes(query))
    );
  }, [permissionData, effectiveSearchQuery]);

  const permissionFieldKeys: PermissionKey[] = ["view", "create", "update", "delete", "export"];

  return {
    filteredPermissions,
    permissionFieldKeys,
    searchQuery: effectiveSearchQuery,
    setSearchQuery: setInternalSearchQuery,
  };
}
