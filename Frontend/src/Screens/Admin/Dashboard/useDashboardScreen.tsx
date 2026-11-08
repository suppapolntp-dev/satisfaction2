"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { UserDataAccessRole } from "@/Types/dataAccess";
import { SentimentTimelinePoint } from "@/Components/Charts/SentimentTimelineChart";
import { DateSelectionRange } from "@/Components/Modals/DateModal";
import { DashboardMetricsData } from "@/Components/Cards/MetricCard";
import { SentimentVoteSummary } from "@/Components/Cards/SatisfactionAnalyticsCard";
import { dashboardService } from "@/Services/dashboardService";
import { useApiMode } from "@/Context/ApiModeContext";
import { DashboardDataResponse } from "@/Types/dashboard";

export interface DashboardScreenState {
  currentUserRole?: UserDataAccessRole;
  initialTimelineData?: SentimentTimelinePoint[] | null;
  initialIsLoading?: boolean;
}

export function useDashboardScreen(initialState: DashboardScreenState = {}) {
  const { isApiEnabled } = useApiMode();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Prepared role/dataaccess variables for permission gating
  const [currentUserRole, setCurrentUserRole] = useState<UserDataAccessRole>(
    initialState.currentUserRole || {
      roleCode: "SUPER_ADMIN",
      tierLevel: "SUPER_ADMIN",
      canExport: true,
      canManageScope: true,
    }
  );

  const canAccessAnalytics = currentUserRole.tierLevel !== undefined;
  const isSuperAdmin = currentUserRole.tierLevel === "SUPER_ADMIN";

  const [dashboardData, setDashboardData] = useState<DashboardDataResponse | null>(null);
  const [timelineData, setTimelineData] = useState<SentimentTimelinePoint[] | null>(
    initialState.initialTimelineData ?? null
  );
  const [isLoadingTimeline, setIsLoadingTimeline] = useState<boolean>(
    initialState.initialIsLoading ?? true
  );

  const dashboardTabs: HeaderTabItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      ),
    },
    {
      id: "analytics",
      label: "Analyses",
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ];

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateSelectionRange | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDateRange({
      startDate: today,
      endDate: today,
      label: "Today (วันนี้)",
      viewMode: "day",
    });
  }, []);

  // Fetch Dashboard Telemetry when Date Range or API Mode changes
  const loadDashboardData = useCallback(async () => {
    setIsLoadingTimeline(true);
    try {
      if (!isApiEnabled) {
        setDashboardData(null);
        setTimelineData([]);
        return;
      }

      const res = await dashboardService.getDashboardData("today");
      setDashboardData(res);

      if (res && res.hourlyTrends && res.hourlyTrends.length > 0) {
        const mappedPoints: SentimentTimelinePoint[] = res.hourlyTrends.map((h) => ({
          time: h.hourLabel.length === 5 ? h.hourLabel : `${h.hourLabel.padStart(2, "0")}:00`,
          happy: h.satisfiedCount ?? 0,
          neutral: h.neutralCount ?? 0,
          sad: h.unsatisfiedCount ?? 0,
        }));
        setTimelineData(mappedPoints);
      } else {
        setTimelineData([]);
      }
    } catch (err) {
      console.error("[useDashboardScreen] loadDashboardData error:", err);
      setTimelineData([]);
    } finally {
      setIsLoadingTimeline(false);
    }
  }, [isApiEnabled]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derive Top KPI Metric Cards
  const metricsData = useMemo<DashboardMetricsData>(() => {
    if (!isApiEnabled || !dashboardData?.aggregatedStats) {
      return {
        totalVotes: 0,
        csatScore: "0%",
        activeKiosks: 0,
        totalKiosks: 0,
        avgResponseTime: "-",
        votesChange: "-",
        csatChange: "-",
        kiosksStatus: "-",
        responseStatus: "-",
      };
    }

    const agg = dashboardData.aggregatedStats;
    const hasVotes = agg.totalVotes > 0;

    return {
      totalVotes: agg.totalVotes,
      csatScore: hasVotes ? `${agg.averageCsatRate}%` : "0%",
      activeKiosks: 18,
      totalKiosks: 18,
      avgResponseTime: "1.2s",
      votesChange: "+8.4% WoW",
      csatChange: "Target >= 90%",
      kiosksStatus: "All Online",
      responseStatus: "Fast",
    };
  }, [isApiEnabled, dashboardData]);

  // Derive Satisfaction Analytics Votes
  const sentimentVotes = useMemo<SentimentVoteSummary>(() => {
    if (!isApiEnabled || !dashboardData?.aggregatedStats) {
      return {
        sad: 0,
        neutral: 0,
        happy: 0,
        totalVotes: 0,
      };
    }

    const agg = dashboardData.aggregatedStats;
    return {
      happy: agg.satisfiedTotal,
      neutral: agg.neutralTotal,
      sad: agg.unsatisfiedTotal,
      totalVotes: agg.totalVotes,
    };
  }, [isApiEnabled, dashboardData]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleFilterClick = () => {
    setIsDateModalOpen(true);
  };

  const handleCloseDateModal = () => {
    setIsDateModalOpen(false);
  };

  const handleApplyDateRange = (range: DateSelectionRange) => {
    setSelectedDateRange(range);
    setIsDateModalOpen(false);
    loadDashboardData();
  };

  return {
    activeTab,
    dashboardTabs,
    handleTabChange,
    handleFilterClick,
    isDateModalOpen,
    handleCloseDateModal,
    handleApplyDateRange,
    selectedDateRange,
    currentUserRole,
    setCurrentUserRole,
    canAccessAnalytics,
    isSuperAdmin,
    timelineData,
    setTimelineData,
    isLoadingTimeline,
    setIsLoadingTimeline,
    metricsData,
    sentimentVotes,
    dashboardData,
    refetchDashboard: loadDashboardData,
  };
}
