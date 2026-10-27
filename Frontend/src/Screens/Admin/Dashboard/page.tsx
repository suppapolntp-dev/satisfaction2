"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import { useDashboardScreen } from "./useDashboardScreen";

export default function DashboardScreen() {
  const {
    activeTab,
    dashboardTabs,
    handleTabChange,
    handleFilterClick,
  } = useDashboardScreen();

  return (
    <div className="space-y-6">
      {/* ─── 1. MODULAR PAGE HEADER WITH TITLE, STATUS & TABS ─── */}
      <PageHeader
        title="Dashboard"
        description="Real-time CSAT Pulse, Multi-Tier Operations & Cross-Brand Experience Intelligence"
        badges={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              94.2% CSAT SLA
            </span>
          </div>
        }
        tabs={dashboardTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryAction={{
          label: "Filter Range",
          variant: "emerald",
          icon: (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ),
          onClick: handleFilterClick,
        }}
      />

      {/* Metric Cards Shell */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <span className="text-xs font-medium text-slate-500">Total Votes Today</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">1,248</div>
          <span className="text-xs text-emerald-600 font-medium">+12.4% vs yesterday</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <span className="text-xs font-medium text-slate-500">Satisfaction Score (CSAT)</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700">94.2%</div>
          <span className="text-xs text-emerald-600 font-medium">+2.1% target exceeded</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <span className="text-xs font-medium text-slate-500">Active Kiosks</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">18 / 18</div>
          <span className="text-xs text-slate-500">100% online & healthy</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <span className="text-xs font-medium text-slate-500">Avg. Response Time</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">1.8s</div>
          <span className="text-xs text-slate-500">Sub-second local sync</span>
        </div>
      </div>

      {/* Main Canvas Placeholder */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] min-h-[380px] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Layout &amp; Sidebar Ready
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Sidebar และ Admin Layout สไตล์ Neo-Mint ถูกติดตั้งเรียบร้อยแล้ว รอรับคำสั่งขั้นตอนถัดไปสำหรับเนื้อหา Dashboard
        </p>
      </div>
    </div>
  );
}
