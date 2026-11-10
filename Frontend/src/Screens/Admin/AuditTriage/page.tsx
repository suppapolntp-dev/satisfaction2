"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import AuditMetricCards from "@/Components/Cards/AuditMetricCards";
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

      {/* ─── 2. AUDIT METRIC & KPI CARDS (Step 2) ─── */}
      <AuditMetricCards
        logs={activityLogs}
        services={apiServices}
        isLoading={isLoading}
        onFilterClick={handleFilterMetrics}
      />

      {/* ─── 3. WORKSPACE CONTAINER (Ready for Step 3) ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] p-8 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="m9 15 2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-slate-800">
            Audit Metric &amp; KPI Cards ติดตั้งเรียบร้อยแล้ว (Step 2)
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            แท็บปัจจุบัน:{" "}
            <span className="font-semibold text-slate-700">
              {activeTab === "activity_logs"
                ? "ประวัติการตรวจสอบ (Action Logs)"
                : "สถานะระบบ & API Health"}
            </span>
            <br />
            พร้อมต่อยอด Step 3: Activity Audit Logs &amp; Data Diff Inspector
          </p>
        </div>
      </div>
    </div>
  );
}
