"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import MetricCard from "@/Components/Cards/MetricCard";
import { useMetricCards } from "@/Components/Cards/MetricCard/useMetricCards";
import OrgHierarchyTreeSidebar from "@/Components/Sidebars/OrgHierarchyTreeSidebar";
import { useOrgTree } from "@/Components/Sidebars/OrgHierarchyTreeSidebar/useOrgTree";
import SatisfactionAnalyticsCard from "@/Components/Cards/SatisfactionAnalyticsCard";
import SentimentTimelineChart from "@/Components/Charts/SentimentTimelineChart";
import { useDashboardScreen } from "./useDashboardScreen";

export default function DashboardScreen() {
  const {
    activeTab,
    dashboardTabs,
    handleTabChange,
    handleFilterClick,
    currentUserRole,
    canAccessAnalytics,
    isSuperAdmin,
    timelineData,
  } = useDashboardScreen();

  const { metrics } = useMetricCards();

  const {
    searchQuery,
    setSearchQuery,
    brandHierarchy,
    selectedScopeLevel,
    selectedBrand,
    selectedRegion,
    selectedProvince,
    selectedBranch,
    expandedNodes,
    toggleNode,
    selectSuperAdmin,
    selectBrand,
    selectRegion,
    selectProvince,
    selectBranch,
    activeScopeInfo,
  } = useOrgTree();

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
            {currentUserRole && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/80">
                {currentUserRole.tierLevel}
              </span>
            )}
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

      {/* ─── TAB 1: OVERVIEW VIEW ─── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((item) => (
              <MetricCard key={item.id || item.label} item={item} />
            ))}
          </div>

          {/* Main Canvas: Sentiment Score Timeline */}
          <SentimentTimelineChart data={timelineData} />
        </div>
      )}

      {/* ─── TAB 2: ANALYSES VIEW (Tree Sidebar + Live Satisfaction Pulse) ─── */}
      {activeTab === "analytics" && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: 5-Tier Organization Hierarchy Tree Navigation */}
          <OrgHierarchyTreeSidebar
            brandHierarchy={brandHierarchy}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedScopeLevel={selectedScopeLevel}
            selectedBrand={selectedBrand}
            selectedRegion={selectedRegion}
            selectedProvince={selectedProvince}
            selectedBranch={selectedBranch}
            expandedNodes={expandedNodes}
            onToggleNode={toggleNode}
            onSelectSuperAdmin={selectSuperAdmin}
            onSelectBrand={selectBrand}
            onSelectRegion={selectRegion}
            onSelectProvince={selectProvince}
            onSelectBranch={selectBranch}
          />

          {/* Right: Satisfaction Buttons transformed into Dashboard Analytics Cards */}
          <div className="flex-1 w-full min-w-0">
            <SatisfactionAnalyticsCard
              scopeTitle={activeScopeInfo.title}
              scopeTier={activeScopeInfo.tier}
            />
          </div>
        </div>
      )}
    </div>
  );
}
