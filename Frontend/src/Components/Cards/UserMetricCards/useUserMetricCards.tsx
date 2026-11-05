"use client";

import React, { useMemo } from "react";
import { UserModel, UserOverviewMetrics } from "@/Types/user";
import { MetricCardItem } from "@/Components/Cards/MetricCard";

export interface UseUserMetricCardsOptions {
  users?: UserModel[];
  metricsData?: UserOverviewMetrics;
  onFilterClick?: (filterType: "all" | "active" | "multi_scope" | "inactive") => void;
}

export function useUserMetricCards({
  users,
  metricsData,
  onFilterClick,
}: UseUserMetricCardsOptions = {}) {
  const metricItems: MetricCardItem[] = useMemo(() => {
    // Priority: Calculate from users array if provided, else use metricsData
    const hasUsersArray = Array.isArray(users);

    let total = 0;
    let active = 0;
    let multiScope = 0;
    let inactive = 0;

    if (hasUsersArray && users.length > 0) {
      total = users.length;
      active = users.filter((u) => u.status === "Active").length;
      multiScope = users.filter(
        (u) =>
          (u.assignedBrands && u.assignedBrands.length > 1) ||
          (u.assignedBranches && u.assignedBranches.length > 1) ||
          (u.tierLevel && u.tierLevel !== "Branch Staff")
      ).length;
      inactive = users.filter((u) => u.status === "Inactive").length;
    } else if (metricsData) {
      total = metricsData.totalUsers ?? 0;
      active = metricsData.activeUsers ?? 0;
      multiScope = metricsData.multiScopeUsers ?? 0;
      inactive = metricsData.inactiveUsers ?? 0;
    }

    const hasData = (hasUsersArray && users.length > 0) || Boolean(metricsData);

    return [
      {
        id: "total-users",
        label: "Total Users (ผู้ใช้งานรวม)",
        value: hasData ? `${total.toLocaleString()} บัญชี` : "-",
        change: metricsData?.totalChange,
        trend: "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        onClick: onFilterClick ? () => onFilterClick("all") : undefined,
      },
      {
        id: "active-users",
        label: "Active Accounts (เปิดใช้งาน)",
        value: hasData ? `${active.toLocaleString()} ใช้งาน` : "-",
        change: metricsData?.activeChange,
        trend: "up",
        valueHighlight: true,
        customIcon: (
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <polyline points="16 11 18 13 22 9" />
          </svg>
        ),
        onClick: onFilterClick ? () => onFilterClick("active") : undefined,
      },
      {
        id: "multi-scope-users",
        label: "Multi-Scope Users (ข้ามสาขา/แบรนด์)",
        value: hasData ? `${multiScope.toLocaleString()} บัญชี` : "-",
        change: metricsData?.multiScopeChange,
        trend: "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
        onClick: onFilterClick ? () => onFilterClick("multi_scope") : undefined,
      },
      {
        id: "inactive-users",
        label: "Inactive Accounts (ปิดใช้งาน)",
        value: hasData ? `${inactive.toLocaleString()} บัญชี` : "-",
        change: metricsData?.inactiveChange,
        trend: inactive > 0 ? "down" : "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        ),
        onClick: onFilterClick ? () => onFilterClick("inactive") : undefined,
      },
    ];
  }, [users, metricsData, onFilterClick]);

  return {
    metricItems,
  };
}
