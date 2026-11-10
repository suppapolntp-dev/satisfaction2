"use client";

import React, { useMemo } from "react";
import { MetricCardItem } from "@/Components/Cards/MetricCard";
import { ActivityAuditLog, ApiServiceHealth, AuditOverviewMetrics } from "@/Types/audit";

export interface UseAuditMetricCardsOptions {
  logs?: ActivityAuditLog[] | null;
  services?: ApiServiceHealth[] | null;
  metricsData?: AuditOverviewMetrics | null;
  onFilterClick?: (filterType: string) => void;
}

export function useAuditMetricCards({
  logs,
  services,
  metricsData,
  onFilterClick,
}: UseAuditMetricCardsOptions = {}) {
  const metricItems = useMemo<MetricCardItem[]>(() => {
    const hasLogs = Array.isArray(logs) && logs.length > 0;
    const hasServices = Array.isArray(services) && services.length > 0;

    // 1. Total records
    const totalCount = metricsData?.totalRecords ?? (hasLogs ? logs.length : null);

    // 2. Critical & Config changes
    const criticalCount =
      metricsData?.criticalChanges ??
      (hasLogs
        ? logs.filter(
            (l) =>
              l.actionType === "CONFIG_CHANGE" ||
              l.actionType === "UPDATE_ROLE" ||
              l.actionType === "DELETE_ENTITY" ||
              l.status === "WARNING" ||
              l.status === "FAILED" ||
              l.status === "Warning / Flagged"
          ).length
        : null);

    // 3. Security status
    const secStatus =
      metricsData?.securityStatus ??
      (hasLogs
        ? logs.some((l) => l.status === "FAILED")
          ? "Action Required"
          : "Normal Secure"
        : null);

    // 4. System health / Avg Uptime
    const avgUptime =
      metricsData?.systemHealthScore ??
      (hasServices
        ? Number(
            (
              services.reduce((acc, s) => acc + s.uptimePercent, 0) /
              services.length
            ).toFixed(1)
          )
        : null);

    return [
      {
        id: "total_audit_logs",
        label: "Total Audit Records",
        value: totalCount !== null ? `${totalCount} รายการ` : "-",
        tag: "Activity",
        valueHighlight: false,
        customIcon: (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        ),
        onClick: onFilterClick ? () => onFilterClick("all") : undefined,
      },
      {
        id: "critical_changes",
        label: "Critical & Config Changes",
        value: criticalCount !== null ? `${criticalCount} รายการ` : "-",
        tag: "Security",
        valueHighlight: criticalCount !== null && criticalCount > 0,
        customIcon: (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
        onClick: onFilterClick ? () => onFilterClick("critical") : undefined,
      },
      {
        id: "security_status",
        label: "Security Health Status",
        value: secStatus ?? "-",
        tag: "Status",
        valueHighlight: false,
        customIcon: (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ),
        onClick: onFilterClick ? () => onFilterClick("security") : undefined,
      },
      {
        id: "system_uptime",
        label: "API & Service Health",
        value: avgUptime !== null ? `${avgUptime}%` : "-",
        tag: "Telemetry",
        valueHighlight: true,
        customIcon: (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
            <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
            <line x1="6" x2="6.01" y1="6" y2="6" />
            <line x1="6" x2="6.01" y1="18" y2="18" />
          </svg>
        ),
        onClick: onFilterClick ? () => onFilterClick("health") : undefined,
      },
    ];
  }, [logs, services, metricsData, onFilterClick]);

  return { metricItems };
}
