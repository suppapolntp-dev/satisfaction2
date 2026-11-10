"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import AuditMetricCards from "@/Components/Cards/AuditMetricCards";
import AuditLogTable from "@/Components/Tables/AuditLogTable";
import ServiceHealthTable from "@/Components/Tables/ServiceHealthTable";
import { useAuditTriageScreen, AuditTabType } from "./useAuditTriageScreen";

export interface AuditScreenProps {
  initialTab?: AuditTabType;
}

export default function AuditScreen({
  initialTab = "activity_logs",
}: AuditScreenProps = {}) {
  const {
    activeTab,
    auditTabs,
    activityLogs,
    apiServices,
    isLoading,
    isRefreshing,
    handleTabChange,
    handleRefresh,
    handleExportAuditLogs,
    handleFilterMetrics,
  } = useAuditTriageScreen({ initialTab });

  return (
    <div className="space-y-6">
      {/* ─── 1. MODULAR PAGE HEADER COMPONENT ─── */}
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
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
            </span>
            <span>Audit Trail &amp; System Health</span>
          </span>
        }
        badges={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Tier 1 Super Admin
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
        }
        description="ตรวจสอบประวัติการเปลี่ยนแปลงระดับผู้ดูแลระบบ (Audit Trail) เปรียบเทียบข้อมูลก่อน-หลัง (Data Diff) และมอนิเตอร์สถานะความพร้อมของบริการ API แบบ Real-time"
        tabs={auditTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryAction={{
          label: "Export Audit Logs",
          variant: "dark",
          icon: (
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          ),
          onClick: handleExportAuditLogs,
        }}
        secondaryActions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 select-none"
          >
            <svg
              className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? "animate-spin" : ""}`}
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
            <span>{isRefreshing ? "กำลังรีเฟรช..." : "Refresh Telemetry"}</span>
          </button>
        }
      />

      {/* ─── 2. AUDIT METRIC & KPI CARDS ─── */}
      <AuditMetricCards
        logs={activityLogs}
        services={apiServices}
        isLoading={isLoading}
        onFilterClick={handleFilterMetrics}
      />

      {/* ─── 3. TAB 1: ACTIVITY AUDIT LOGS & DIFF INSPECTOR ─── */}
      {activeTab === "activity_logs" && (
        <AuditLogTable
          logs={activityLogs}
          isLoading={isLoading}
        />
      )}

      {/* ─── 4. TAB 2: API & SERVICE HEALTH TELEMETRY MONITOR (Step 4) ─── */}
      {activeTab === "api_health" && (
        <ServiceHealthTable
          services={apiServices}
          isLoading={isLoading}
          onRefreshAll={handleRefresh}
        />
      )}
    </div>
  );
}
