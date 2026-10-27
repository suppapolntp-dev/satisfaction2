"use client";

import React, { useState } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { HierarchyScopeLevel, UserDataAccessRole } from "@/Types/dataAccess";

export interface DashboardScreenState {
  currentUserRole?: UserDataAccessRole;
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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleFilterClick = () => {
    // Reserved for filter range dialog
  };

  return {
    activeTab,
    dashboardTabs,
    handleTabChange,
    handleFilterClick,
    currentUserRole,
    setCurrentUserRole,
    canAccessAnalytics,
    isSuperAdmin,
  };
}
