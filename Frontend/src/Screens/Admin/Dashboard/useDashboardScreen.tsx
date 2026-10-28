"use client";

import React, { useState, useEffect } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { HierarchyScopeLevel, UserDataAccessRole } from "@/Types/dataAccess";
import { SentimentTimelinePoint } from "@/Components/Charts/SentimentTimelineChart";
import { DateSelectionRange } from "@/Components/Modals/DateModal";

// Sample telemetry for baseline overview visualization
// TODO: Connect API [sentiment_timeline_hourly]
export const INITIAL_TIMELINE_HOURLY: SentimentTimelinePoint[] = [
  { time: "08:00", happy: 88, neutral: 9, sad: 3 },
  { time: "09:00", happy: 85, neutral: 11, sad: 4 },
  { time: "10:00", happy: 82, neutral: 13, sad: 5 },
  { time: "11:00", happy: 80, neutral: 14, sad: 6 },
  { time: "12:00", happy: 68, neutral: 21, sad: 11 },
  { time: "13:00", happy: 74, neutral: 17, sad: 9 },
  { time: "14:00", happy: 84, neutral: 12, sad: 4 },
  { time: "15:00", happy: 87, neutral: 10, sad: 3 },
  { time: "16:00", happy: 86, neutral: 11, sad: 3 },
  { time: "17:00", happy: 89, neutral: 8, sad: 3 },
];

export interface DashboardScreenState {
  currentUserRole?: UserDataAccessRole;
  initialTimelineData?: SentimentTimelinePoint[] | null;
}

export function useDashboardScreen(initialState: DashboardScreenState = {}) {
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

  const [timelineData, setTimelineData] = useState<SentimentTimelinePoint[] | null>(
    initialState.initialTimelineData !== undefined
      ? initialState.initialTimelineData
      : INITIAL_TIMELINE_HOURLY
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
      label: "filter",
      viewMode: "day",
    });
  }, []);

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
    // TODO: Connect API [filter_date_range]
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
  };
}
