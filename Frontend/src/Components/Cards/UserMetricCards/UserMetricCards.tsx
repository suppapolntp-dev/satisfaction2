"use client";

import React from "react";
import MetricCard, { MetricCardItem } from "@/Components/Cards/MetricCard";
import { UserModel, UserOverviewMetrics } from "@/Types/user";
import { useUserMetricCards } from "./useUserMetricCards";

export interface UserMetricCardsProps {
  users?: UserModel[];
  metricsData?: UserOverviewMetrics;
  isLoading?: boolean;
  onFilterClick?: (filterType: "all" | "active" | "multi_scope" | "inactive") => void;
  className?: string;
}

export default function UserMetricCards({
  users,
  metricsData,
  isLoading = false,
  onFilterClick,
  className = "",
}: UserMetricCardsProps) {
  const { metricItems } = useUserMetricCards({
    users,
    metricsData,
    onFilterClick,
  });

  if (isLoading) {
    return (
      <div className={`flex flex-wrap gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`user-metric-skeleton-${index}`}
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
