"use client";

import React, { useMemo } from "react";
import DataTable, { TableColumn } from "@/Components/Tables/DataTable";
import { ApiServiceHealth } from "@/Types/audit";
import { useServiceHealthTable } from "./useServiceHealthTable";

export interface ServiceHealthTableProps {
  services?: ApiServiceHealth[] | null;
  isLoading?: boolean;
  onRefreshAll?: () => Promise<void> | void;
  className?: string;
}

export default function ServiceHealthTable({
  services,
  isLoading = false,
  onRefreshAll,
  className = "",
}: ServiceHealthTableProps) {
  const {
    filteredServices,
    summary,
    searchQuery,
    setSearchQuery,
    pingingServiceId,
    isRefreshing,
    pingNotification,
    handlePing,
    handleRefresh,
  } = useServiceHealthTable({ services, onRefreshAll });

  const columns: TableColumn<ApiServiceHealth>[] = useMemo(
    () => [
      {
        key: "serviceName",
        label: "SERVICE & ENDPOINT",
        sortable: true,
        render: (s) => (
          <div>
            <div className="font-semibold text-slate-900 leading-snug">
              {s.serviceName}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {s.endpoint}
            </div>
          </div>
        ),
      },
      {
        key: "status",
        label: "STATUS",
        sortable: true,
        render: (s) => (
          <span className="inline-flex items-center text-xs font-semibold text-slate-700">
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                s.status === "Operational"
                  ? "bg-emerald-500"
                  : s.status === "Degraded"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-rose-500"
              }`}
            />
            {s.status}
          </span>
        ),
      },
      {
        key: "uptimePercent",
        label: "UPTIME",
        sortable: true,
        render: (s) => (
          <span className="text-xs font-semibold text-slate-800">
            {s.uptimePercent !== undefined ? `${s.uptimePercent}%` : "-"}
          </span>
        ),
      },
      {
        key: "latencyMs",
        label: "LATENCY",
        sortable: true,
        render: (s) => (
          <span
            className={`font-mono text-xs font-semibold ${
              s.latencyMs > 100 ? "text-amber-600" : "text-emerald-700"
            }`}
          >
            {s.latencyMs !== undefined ? `${s.latencyMs} ms` : "-"}
          </span>
        ),
      },
      {
        key: "errorRatePercent",
        label: "ERROR RATE",
        sortable: true,
        render: (s) => (
          <span className="text-xs text-slate-500">
            {s.errorRatePercent !== undefined ? `${s.errorRatePercent}%` : "-"}
          </span>
        ),
      },
      {
        key: "lastChecked",
        label: "LAST CHECKED",
        render: (s) => (
          <span className="text-[11px] font-mono text-slate-400">
            {s.lastChecked ?? "-"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "DIAGNOSTIC",
        render: (s) => {
          const isPinging = pingingServiceId === s.serviceId;
          return (
            <button
              type="button"
              onClick={() => handlePing(s.serviceId)}
              disabled={isPinging}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-[11px] font-semibold text-slate-700 transition-all cursor-pointer disabled:opacity-50 select-none shadow-2xs"
            >
              <svg
                className={`w-3.5 h-3.5 text-slate-500 ${isPinging ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>{isPinging ? "Testing..." : "Ping Test"}</span>
            </button>
          );
        },
      },
    ],
    [handlePing, pingingServiceId]
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {pingNotification && (
        <div className="bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs font-medium text-emerald-800">
          <span>{pingNotification}</span>
        </div>
      )}

      <DataTable<ApiServiceHealth>
        title="API Microservices & Ingestion Gateway Health"
        subtitle={`ติดตามประสิทธิภาพ, ความเร็วตอบสนอง และความพร้อมของระบบ (${summary.operational} / ${summary.total} Services Operational)`}
        icon="dns"
        searchPlaceholder="ค้นหาบริการหรือ Endpoint..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        columns={columns}
        data={filteredServices}
        emptyMessage="ไม่พบบริการ API ในระบบ"
        defaultPageSize={10}
        headerActions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 select-none shadow-2xs"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>{isRefreshing ? "กำลังรีเฟรช..." : "Refresh All"}</span>
          </button>
        }
      />
    </div>
  );
}
