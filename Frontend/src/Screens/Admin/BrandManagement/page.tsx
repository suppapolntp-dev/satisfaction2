"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import { useBrandManagementScreen } from "./useBrandManagementScreen";

export default function BrandManagementScreen() {
  const {
    activeTab,
    brandTabs,
    handleTabChange,
    handleAddAction,
  } = useBrandManagementScreen();

  const isBrandTab = activeTab === "brands";

  return (
    <div className="space-y-6">
      {/* ─── 1. MODULAR PAGE HEADER WITH TABS & ACTIONS ─── */}
      <PageHeader
        title="Brand & Branch"
        description="Enterprise corporate brand portfolio, regional branch networks, and location hierarchy management"
        tabs={brandTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryAction={{
          label: isBrandTab ? "Add Brand" : "Add Branch",
          variant: "emerald",
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          ),
          onClick: handleAddAction,
        }}
      />

      {/* ─── 2. ACTIVE TAB OUTLET PLACEHOLDER ─── */}
      <div className="p-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-500">
          {isBrandTab
            ? "Ready for Brand Directory module"
            : "Ready for Branch Directory module"}
        </p>
      </div>
    </div>
  );
}
