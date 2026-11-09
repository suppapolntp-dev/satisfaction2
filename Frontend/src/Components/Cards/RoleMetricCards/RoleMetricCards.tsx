"use client";

import React from "react";
import MetricCard, { MetricCardItem } from "@/Components/Cards/MetricCard";
import { SystemRoleItem, PermissionRow } from "@/Types/role";
import { useRoleMetricCards } from "./useRoleMetricCards";

export interface RoleMetricCardsProps {
  roles?: SystemRoleItem[];
  currentRolePermissions?: PermissionRow[];
  selectedRole?: SystemRoleItem | null;
  isLoading?: boolean;
  className?: string;
}

export default function RoleMetricCards({
  roles = [],
  currentRolePermissions = [],
  selectedRole = null,
  isLoading = false,
  className = "",
}: RoleMetricCardsProps) {
  const { metricItems } = useRoleMetricCards({
    roles,
    currentRolePermissions,
    selectedRole,
  });

  if (isLoading) {
    return (
      <div className={`flex flex-wrap gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`role-metric-skeleton-${index}`}
            className="flex-1 min-w-[200px] p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-slate-200 rounded w-28" />
              <div className="w-7 h-7 rounded-xl bg-slate-100" />
            </div>
            <div className="h-8 bg-slate-200 rounded w-20 my-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {metricItems.map((item: MetricCardItem) => (
        <MetricCard key={item.id} item={item} />
      ))}
    </div>
  );
}
