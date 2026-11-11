"use client";

import React, { Suspense, useMemo } from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import MetricCard from "@/Components/Cards/MetricCard";
import { useMetricCards } from "@/Components/Cards/MetricCard/useMetricCards";
import OrgHierarchyTreeSidebar from "@/Components/Sidebars/OrgHierarchyTreeSidebar";
import { useOrgTree } from "@/Components/Sidebars/OrgHierarchyTreeSidebar/useOrgTree";
import SatisfactionAnalyticsCard from "@/Components/Cards/SatisfactionAnalyticsCard";
import SentimentTimelineChart from "@/Components/Charts/SentimentTimelineChart";
import PeakServiceHeatmap from "@/Components/Charts/PeakServiceHeatmap";
import DetailedPerformanceTable from "@/Components/Tables/DetailedPerformanceTable";
import LiveKioskVoteFeedList from "@/Components/Lists/LiveKioskVoteFeedList";
import SelectInput from "@/Components/Inputs/SelectInput";
import DateModal from "@/Components/Modals/DateModal";
import { useDashboardSettings } from "@/Lib/dashboardSettings";
import { useDashboardScreen, WatchlistTierKey } from "./useDashboardScreen";

const TIER_ROLE_SIMULATOR_OPTIONS = [
  { value: "SUPER_ADMIN", label: "มุมมองสิทธิ์: Tier 1 — Super Admin (ทุกแบรนด์)" },
  { value: "BRAND_OWNER", label: "มุมมองสิทธิ์: Tier 2 — Brand Owner (เฉพาะแบรนด์ KFC)" },
  { value: "REGIONAL_MANAGER", label: "มุมมองสิทธิ์: Tier 3 — Regional Manager (ภาคเหนือ)" },
  { value: "AREA_MANAGER", label: "มุมมองสิทธิ์: Tier 4 — Area Manager (จ.เชียงใหม่)" },
  { value: "BRANCH_STAFF", label: "มุมมองสิทธิ์: Tier 5 — Branch Staff (สาขาเชียงใหม่ แอร์พอร์ต)" },
];

const BRAND_FILTER_OPTIONS = [
  { value: "ALL", label: "ทุกแบรนด์ในเครือ CRG" },
  { value: "KFC", label: "KFC (เคเอฟซี)" },
  { value: "MDO", label: "Mister Donut" },
  { value: "OOT", label: "Ootoya (โอโตยะ)" },
  { value: "ATN", label: "Auntie Anne's" },
];

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
    selectedBrandFilter,
    handleBrandFilterChange,
    currentUserRole,
    accessProfile,
    effectivePermissions,
    handleSelectTierPreset,
    allowedWatchlistTiers,
    selectedWatchlistTier,
    setSelectedWatchlistTier,
    activeWatchlistConfig,
    watchlistAlertOnly,
    setWatchlistAlertOnly,
    scopedWatchlistRows,
    belowTargetCount,
    scopedLiveVotes,
    timelineData,
    isLoadingTimeline,
    timelineError,
    metricsData,
    sentimentVotes,
    dashboardData,
    refetchDashboard,
  } = useDashboardScreen();

  const { metrics } = useMetricCards({ metricsData });
  const { dashboardSettings } = useDashboardSettings();

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

  const activeTierPresetKey =
    currentUserRole.tierLevel === "BRAND"
      ? "BRAND_OWNER"
      : currentUserRole.tierLevel === "REGION"
      ? "REGIONAL_MANAGER"
      : currentUserRole.tierLevel === "PROVINCE"
      ? "AREA_MANAGER"
      : currentUserRole.tierLevel === "BRANCH"
      ? "BRANCH_STAFF"
      : "SUPER_ADMIN";

  const scopeSummaryLabel =
    currentUserRole.tierLevel === "SUPER_ADMIN"
      ? selectedBrandFilter === "ALL"
        ? "ทุกแบรนด์ทั่วประเทศ"
        : `แบรนด์ ${selectedBrandFilter}`
      : `${accessProfile.assignedBrand} · ${accessProfile.assignedBranch}`;

  // Derive selected branch telemetry from API or scope data (Strict 0 fallback, zero hardcoded numbers)
  const selectedBranchData = useMemo(() => {
    if (!selectedBranch) return null;
    const branchRow =
      dashboardData?.provincialBranches?.find(
        (b) =>
          b.id === selectedBranch.id ||
          b.name === selectedBranch.name ||
          (b.code && b.code === selectedBranch.code)
      ) ||
      dashboardData?.branchKiosks?.find(
        (k) => k.id === selectedBranch.id || k.name === selectedBranch.name
      );
    return branchRow || null;
  }, [selectedBranch, dashboardData]);

  return (
    <div className="space-y-6">
      {/* ─── 1. MODULAR PAGE HEADER WITH SCOPE BADGE, RBAC SELECTORS & TABS ─── */}
      <PageHeader
        title="Dashboard"
        description="ติดตามคะแนนความพึงพอใจลูกค้า (CSAT) แนวโน้มรายชั่วโมง และผลการดำเนินงานแยกตามสิทธิ์ 5 ระดับองค์กร"
        tabs={dashboardTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryAction={{
          label: selectedDateRange?.label || "วันนี้ (Today)",
          variant: "primary",
          icon: (
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
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
          {/* 1. Top KPI Metric Cards (3 Columns according to Reference Design) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((item) => (
              <MetricCard key={item.id || item.label} item={item} />
            ))}
          </div>

          {/* 2. Main Canvas: Sentiment Score Timeline + Donut Breakdown */}
          <SentimentTimelineChart
            data={timelineData}
            isLoading={isLoadingTimeline}
            errorMessage={timelineError}
            onRetry={refetchDashboard}
            height={dashboardSettings.chartHeight}
            curveType={dashboardSettings.chartCurveType}
            showGridLines={dashboardSettings.showGridLines}
            showDataLabels={dashboardSettings.showDataLabels}
          />

          {/* 3. Permission-Gated Watchlist (Reusing DetailedPerformanceTable) + Real-Time Kiosk Vote Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left (7 Cols): Multi-Tier Performance Watchlist */}
            <div className="lg:col-span-7 flex flex-col">
              <DetailedPerformanceTable
                title={activeWatchlistConfig.title}
                subtitle={`${activeWatchlistConfig.subtitle} · ขอบเขต: ${scopeSummaryLabel}`}
                icon={activeWatchlistConfig.icon}
                data={scopedWatchlistRows}
                nameColumnLabel={activeWatchlistConfig.nameColumnLabel}
                defaultPageSize={dashboardSettings.watchlistDefaultPageSize}
              />
            </div>

            {/* Right (5 Cols): Real-Time Kiosk Vote Stream */}
            <div className="lg:col-span-5 flex flex-col">
              <LiveKioskVoteFeedList
                items={scopedLiveVotes}
                isLoading={isLoadingTimeline}
                canViewFeed={effectivePermissions.canViewBranchKiosksGrid}
                scopeLabel={scopeSummaryLabel}
                maxItems={dashboardSettings.maxLiveFeedItems}
              />
            </div>
          </div>
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

          {/* Right: Peak Service Heatmap & Diagnostic Intelligence */}
          <div className="flex-1 w-full min-w-0">
            <PeakServiceHeatmap
              isSelected={Boolean(selectedBranch)}
              branchName={selectedBranch?.name || ""}
              brandName={selectedBrand?.name || selectedBranch?.brandName || ""}
              score={selectedBranchData ? selectedBranchData.csatRate : 0}
              satisfiedCount={selectedBranchData?.satisfiedCount ?? 0}
              neutralCount={selectedBranchData?.neutralCount ?? 0}
              unsatisfiedCount={selectedBranchData?.unsatisfiedCount ?? 0}
              totalVotes={selectedBranchData?.totalVotes ?? 0}
              defaultViewMode={dashboardSettings.defaultHeatmapView}
            />
          </div>
        </div>
      )}

      {/* ─── SUBSCRIPTIONS CALENDAR STYLE DATE MODAL ─── */}
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
