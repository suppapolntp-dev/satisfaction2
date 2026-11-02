"use client";

import React, { Suspense } from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import MetricCard from "@/Components/Cards/MetricCard";
import { useMetricCards } from "@/Components/Cards/MetricCard/useMetricCards";
import OrgHierarchyTreeSidebar from "@/Components/Sidebars/OrgHierarchyTreeSidebar";
import { useOrgTree } from "@/Components/Sidebars/OrgHierarchyTreeSidebar/useOrgTree";
import SatisfactionAnalyticsCard from "@/Components/Cards/SatisfactionAnalyticsCard";
import SentimentTimelineChart from "@/Components/Charts/SentimentTimelineChart";
import DateModal from "@/Components/Modals/DateModal";
import { useDashboardScreen } from "./useDashboardScreen";

export default function DashboardScreen() {
  const {
    activeTab,
    dashboardTabs,
    handleTabChange,
    handleFilterClick,
    isDateModalOpen,
    handleCloseDateModal,
    handleApplyDateRange,
    selectedDateRange,
    currentUserRole,
    canAccessAnalytics,
    isSuperAdmin,
    timelineData,
    isLoadingTimeline,
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
        tabs={dashboardTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryAction={{
          label: selectedDateRange?.label || "fillter",
          variant: "primary",
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
          {/* Top Metric Cards (Auto-Flex Layout) */}
          <div className="flex flex-wrap gap-4">
            {metrics.map((item) => (
              <MetricCard key={item.id || item.label} item={item} />
            ))}
          </div>

          {/* Main Canvas: Sentiment Score Timeline */}
          <SentimentTimelineChart
            data={timelineData}
            isLoading={isLoadingTimeline}
          />
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

      {/* ─── SUBSCRIPTIONS CALENDAR STYLE DATE MODAL (FROM BACKUP) ─── */}
      <Suspense fallback={null}>
        <DateModal
          isOpen={isDateModalOpen}
          onClose={handleCloseDateModal}
          onApply={handleApplyDateRange}
          currentRange={selectedDateRange || undefined}
        />
      </Suspense>
    </div>
  );
}
