"use client";

import React, { useMemo } from "react";
import { SystemRoleItem, PermissionRow } from "@/Types/role";
import { MetricCardItem } from "@/Components/Cards/MetricCard";

export interface UseRoleMetricCardsOptions {
  roles?: SystemRoleItem[];
  currentRolePermissions?: PermissionRow[];
  selectedRole?: SystemRoleItem | null;
}

export function useRoleMetricCards({
  roles = [],
  currentRolePermissions = [],
  selectedRole = null,
}: UseRoleMetricCardsOptions = {}) {
  const metricItems: MetricCardItem[] = useMemo(() => {
    const totalRoles = roles.length;
    const totalUsers = roles.reduce((acc, r) => acc + (r.totalUsersCount || 0), 0);
    const systemDefaultRoles = roles.filter((r) => r.isSystemDefault).length;

    let activePermissionsCount = 0;
    currentRolePermissions.forEach((row) => {
      if (row.view) activePermissionsCount++;
      if (row.create) activePermissionsCount++;
      if (row.update) activePermissionsCount++;
      if (row.delete) activePermissionsCount++;
      if (row.export) activePermissionsCount++;
    });

    const hasData = totalRoles > 0;

    return [
      {
        id: "total-roles",
        label: "Total Roles (บทบาททั้งหมด)",
        value: hasData ? `${totalRoles} บทบาท` : "-",
        tag: "SYSTEM",
        trend: "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-blue-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        id: "active-permissions",
        label: selectedRole ? `สิทธิ์ของ ${selectedRole.roleName}` : "Active Permissions",
        value: hasData ? `${activePermissionsCount} สิทธิ์` : "-",
        tag: "MATRIX",
        trend: "up",
        valueHighlight: true,
        customIcon: (
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
      },
      {
        id: "assigned-users",
        label: "Assigned Users (ผู้ใช้ที่ผูกกับบทบาท)",
        value: hasData ? `${totalUsers.toLocaleString()} บัญชี` : "-",
        tag: "ACCOUNTS",
        trend: "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        id: "system-defaults",
        label: "System Defaults (บทบาทมาตรฐาน)",
        value: hasData ? `${systemDefaultRoles} มาตรฐาน` : "-",
        tag: "PROTECTED",
        trend: "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ),
      },
    ];
  }, [roles, currentRolePermissions, selectedRole]);

  return { metricItems };
}
