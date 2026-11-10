"use client";

import React from "react";
import MetricCard, { MetricCardItem } from "@/Components/Cards/MetricCard";
import { ActivityAuditLog, ApiServiceHealth, AuditOverviewMetrics } from "@/Types/audit";
import { useAuditMetricCards } from "./useAuditMetricCards";

export interface AuditMetricCardsProps {
  logs?: ActivityAuditLog[] | null;
  services?: ApiServiceHealth[] | null;
  metricsData?: AuditOverviewMetrics | null;
  isLoading?: boolean;
  onFilterClick?: (filterType: string) => void;
  className?: string;
}

export default function AuditMetricCards({
  logs,
  services,
  metricsData,
  isLoading = false,
  onFilterClick,
  className = "",
}: AuditMetricCardsProps) {
  const { metricItems } = useAuditMetricCards({
    logs,
    services,
    metricsData,
    onFilterClick,
  });

  if (isLoading) {
    return (
      <div className={`flex flex-wrap gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`audit-metric-skeleton-${index}`}
            className="flex-1 min-w-[200px] p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-slate-200 rounded-md w-28" />
              <div className="w-7 h-7 rounded-xl bg-slate-100" />
            </div>
            <div className="h-8 bg-slate-200 rounded-md w-24 my-1" />
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
