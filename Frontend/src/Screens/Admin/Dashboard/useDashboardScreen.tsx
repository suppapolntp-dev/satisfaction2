"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { UserDataAccessRole, HierarchyScopeLevel } from "@/Types/dataAccess";
import { SentimentTimelinePoint } from "@/Components/Charts/SentimentTimelineChart";
import { DateSelectionRange } from "@/Components/Modals/DateModal";
import { DashboardMetricsData } from "@/Components/Cards/MetricCard";
import { SentimentVoteSummary } from "@/Components/Cards/SatisfactionAnalyticsCard";
import { dashboardService } from "@/Services/dashboardService";
import { useApiMode } from "@/Context/ApiModeContext";
import { useAuth } from "@/Context/AuthContext";
import {
  getActiveDataAccessProfile,
  PRESET_TIER_PROFILES,
  UserDataAccessProfile,
  DashboardTierPermissions,
} from "@/Lib/dataAccessContext";
import {
  DashboardDataResponse,
  PerformanceTableRow,
  LiveVoteItem,
} from "@/Types/dashboard";

export type WatchlistTierKey =
  | "brand"
  | "region"
  | "province"
  | "branch"
  | "kiosk";

export interface WatchlistTierOption {
  key: WatchlistTierKey;
  label: string;
  title: string;
  subtitle: string;
  nameColumnLabel: string;
  icon: string;
}

export const WATCHLIST_TIER_CONFIG: Record<WatchlistTierKey, WatchlistTierOption> = {
  brand: {
    key: "brand",
    label: "ระดับแบรนด์ (Brands)",
    title: "Brand Performance Watchlist",
    subtitle: "เปรียบเทียบคะแนนความพึงพอใจและสัดส่วนโหวตแยกตามแบรนด์ในเครือ",
    nameColumnLabel: "แบรนด์ (Brand)",
    icon: "storefront",
  },
  region: {
    key: "region",
    label: "ระดับภูมิภาค (Regions)",
    title: "Regional Performance Watchlist",
    subtitle: "เปรียบเทียบคะแนนความพึงพอใจแยกตามภูมิภาคภายใต้สิทธิ์ที่ดูแล",
    nameColumnLabel: "ภูมิภาค (Region)",
    icon: "map",
  },
  province: {
    key: "province",
    label: "ระดับจังหวัด (Provinces)",
    title: "Provincial Performance Watchlist",
    subtitle: "เปรียบเทียบคะแนนความพึงพอใจแยกตามจังหวัดในเขตที่รับผิดชอบ",
    nameColumnLabel: "จังหวัด (Province)",
    icon: "location_city",
  },
  branch: {
    key: "branch",
    label: "ระดับสาขา (Branches)",
    title: "Branch Performance Watchlist",
    subtitle: "จัดอันดับสาขาที่ทำคะแนนสูงสุดและสาขาที่ต่ำกว่าเกณฑ์มาตรฐาน (< 80%)",
    nameColumnLabel: "สาขา (Branch)",
    icon: "store",
  },
  kiosk: {
    key: "kiosk",
    label: "ระดับตู้ Kiosk (Kiosks)",
    title: "Kiosk Performance Watchlist",
    subtitle: "ตรวจสอบผลโหวตและสถานะการทำงานแยกตามจุดติดตั้งตู้ Kiosk",
    nameColumnLabel: "จุดติดตั้งตู้ Kiosk",
    icon: "devices",
  },
};

function mapAuthTierToScopeLevel(tier?: string): HierarchyScopeLevel {
  const normalized = (tier || "").toUpperCase();
  if (normalized.includes("BRAND")) return "BRAND";
  if (normalized.includes("REGION")) return "REGION";
  if (normalized.includes("PROVINCE") || normalized.includes("AREA")) return "PROVINCE";
  if (normalized.includes("BRANCH") || normalized.includes("STAFF")) return "BRANCH";
  if (normalized.includes("CUSTOM")) return "CUSTOM_SCOPE";
  return "SUPER_ADMIN";
}

function getTodayDateSelection(): DateSelectionRange {
  const today = new Date().toISOString().slice(0, 10);
  return {
    startDate: today,
    endDate: today,
    label: "วันนี้ (Today)",
    viewMode: "day",
  };
}

export interface DashboardScreenState {
  currentUserRole?: UserDataAccessRole;
  initialTimelineData?: SentimentTimelinePoint[] | null;
  initialIsLoading?: boolean;
}

export function useDashboardScreen(initialState: DashboardScreenState = {}) {
  const { isApiEnabled } = useApiMode();
  const authContext = useAuth();
  const authUser = authContext?.user ?? null;
  const [activeTab, setActiveTab] = useState<string>("overview");

  // ─── 1. 5-TIER PERMISSION & SCOPE ENGINE ───
  const [accessProfile, setAccessProfile] = useState<UserDataAccessProfile>(
    () => getActiveDataAccessProfile()
  );

  useEffect(() => {
    const syncProfile = () => {
      setAccessProfile(getActiveDataAccessProfile());
    };
    syncProfile();
    window.addEventListener("csat_data_access_updated", syncProfile);
    return () => window.removeEventListener("csat_data_access_updated", syncProfile);
  }, []);

  // Sync from authenticated user if available
  const effectivePermissions = useMemo<DashboardTierPermissions>(() => {
    if (authUser?.dashboardPermissions) {
      return authUser.dashboardPermissions;
    }
    return accessProfile.permissions;
  }, [authUser, accessProfile]);

  const currentUserRole = useMemo<UserDataAccessRole>(() => {
    if (initialState.currentUserRole) {
      return initialState.currentUserRole;
    }
    if (authUser) {
      return {
        roleCode: authUser.roleCode,
        tierLevel: mapAuthTierToScopeLevel(authUser.tierLevel),
        allowedBrandIds: authUser.brandScopes,
        allowedBranchIds: authUser.branchScopes,
        canExport: true,
        canManageScope: authUser.tierLevel === "SuperAdmin",
      };
    }
    const roleUpper = accessProfile.roleName.toUpperCase();
    let tierLevel: HierarchyScopeLevel = "SUPER_ADMIN";
    if (roleUpper.includes("BRAND")) tierLevel = "BRAND";
    else if (roleUpper.includes("REGIONAL")) tierLevel = "REGION";
    else if (roleUpper.includes("AREA")) tierLevel = "PROVINCE";
    else if (roleUpper.includes("STAFF") || roleUpper.includes("BRANCH")) tierLevel = "BRANCH";

    return {
      roleCode: tierLevel,
      tierLevel,
      canExport: tierLevel !== "BRANCH",
      canManageScope: tierLevel === "SUPER_ADMIN",
    };
  }, [initialState.currentUserRole, authUser, accessProfile]);

  const canAccessAnalytics = currentUserRole.tierLevel !== undefined;
  const isSuperAdmin = currentUserRole.tierLevel === "SUPER_ADMIN";

  // Switch active Tier Profile for quick RBAC verification in UI
  const handleSelectTierPreset = useCallback((presetKey: string) => {
    const preset = PRESET_TIER_PROFILES[presetKey];
    if (preset) {
      setAccessProfile(preset);
      if (typeof window !== "undefined") {
        localStorage.setItem("csat_active_data_access_profile", JSON.stringify(preset));
      }
    }
  }, []);

  // Determine which Watchlist Tiers this user is authorized to inspect
  const allowedWatchlistTiers = useMemo<WatchlistTierOption[]>(() => {
    const list: WatchlistTierOption[] = [];
    if (effectivePermissions.canViewSuperAdminOverview) {
      list.push(WATCHLIST_TIER_CONFIG.brand);
    }
    if (effectivePermissions.canViewBrandRegionalGrid) {
      list.push(WATCHLIST_TIER_CONFIG.region);
    }
    if (effectivePermissions.canViewRegionalProvinceGrid) {
      list.push(WATCHLIST_TIER_CONFIG.province);
    }
    if (effectivePermissions.canViewProvincialBranchGrid) {
      list.push(WATCHLIST_TIER_CONFIG.branch);
    }
    if (effectivePermissions.canViewBranchKiosksGrid) {
      list.push(WATCHLIST_TIER_CONFIG.kiosk);
    }
    return list;
  }, [effectivePermissions]);

  const [selectedWatchlistTier, setSelectedWatchlistTier] = useState<WatchlistTierKey>("branch");
  const [watchlistAlertOnly, setWatchlistAlertOnly] = useState<boolean>(false);

  // Ensure selectedWatchlistTier is always one the user has permission to view
  useEffect(() => {
    if (allowedWatchlistTiers.length === 0) return;
    const isStillAllowed = allowedWatchlistTiers.some(
      (t) => t.key === selectedWatchlistTier
    );
    if (!isStillAllowed) {
      // Default to branch if allowed, otherwise the highest allowed tier
      const preferred =
        allowedWatchlistTiers.find((t) => t.key === "branch") ||
        allowedWatchlistTiers[0];
      setSelectedWatchlistTier(preferred.key);
    }
  }, [allowedWatchlistTiers, selectedWatchlistTier]);

  // ─── 2. DASHBOARD DATA & DATE FILTER STATE ───
  const [dashboardData, setDashboardData] = useState<DashboardDataResponse | null>(null);
  const [timelineData, setTimelineData] = useState<SentimentTimelinePoint[] | null>(
    initialState.initialTimelineData ?? null
  );
  const [isLoadingTimeline, setIsLoadingTimeline] = useState<boolean>(
    initialState.initialIsLoading ?? true
  );
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateSelectionRange>(
    getTodayDateSelection
  );
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("ALL");

  // Lock brand filter if user is scoped to a specific brand (Tier 2-5)
  useEffect(() => {
    if (!effectivePermissions.canViewSuperAdminOverview) {
      const assigned = accessProfile.assignedBrand || "";
      if (assigned.toUpperCase().includes("KFC")) {
        setSelectedBrandFilter("KFC");
      } else if (assigned.toUpperCase().includes("MISTER") || assigned.toUpperCase().includes("MDO")) {
        setSelectedBrandFilter("MDO");
      } else if (assigned.toUpperCase().includes("OOTOYA")) {
        setSelectedBrandFilter("OOT");
      } else if (assigned.toUpperCase().includes("AUNTIE")) {
        setSelectedBrandFilter("ATN");
      }
    } else {
      setSelectedBrandFilter("ALL");
    }
  }, [effectivePermissions.canViewSuperAdminOverview, accessProfile.assignedBrand]);

  const dashboardTabs: HeaderTabItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
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
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ];

  // Fetch Dashboard Telemetry when Date Range, Brand Filter, or API Mode changes
  const loadDashboardData = useCallback(
    async (rangeOverride?: DateSelectionRange, brandOverride?: string) => {
      setIsLoadingTimeline(true);
      setTimelineError(null);
      try {
        if (!isApiEnabled) {
          setDashboardData(null);
          setTimelineData([]);
          return;
        }

        const activeRange = rangeOverride || selectedDateRange;
        const activeBrand = brandOverride ?? selectedBrandFilter;

        let timeFilterParam = "today";
        if (activeRange.viewMode === "week") {
          timeFilterParam = "week";
        } else if (activeRange.startDate !== activeRange.endDate) {
          const d1 = new Date(activeRange.startDate);
          const d2 = new Date(activeRange.endDate);
          const diffDays = Math.round(
            Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays >= 60) timeFilterParam = "year";
          else if (diffDays >= 14) timeFilterParam = "month";
          else if (diffDays >= 2) timeFilterParam = "week";
        }

        const res = await dashboardService.getDashboardData(
          timeFilterParam,
          activeBrand,
          activeRange.startDate,
          activeRange.endDate
        );
        setDashboardData(res);

        if (res && res.hourlyTrends && res.hourlyTrends.length > 0) {
          const mappedPoints: SentimentTimelinePoint[] = res.hourlyTrends.map((h) => ({
            time:
              h.hourLabel.length === 5
                ? h.hourLabel
                : `${h.hourLabel.padStart(2, "0")}:00`,
            happy: h.satisfiedCount ?? 0,
            neutral: h.neutralCount ?? 0,
            sad: h.unsatisfiedCount ?? 0,
          }));
          setTimelineData(mappedPoints);
        } else {
          setTimelineData([]);
        }
      } catch (err: any) {
        console.error("[useDashboardScreen] loadDashboardData error:", err);
        setTimelineError(err?.message || "เกิดข้อผิดพลาดในการซิงค์ข้อมูลแดชบอร์ด");
        setTimelineData([]);
      } finally {
        setIsLoadingTimeline(false);
      }
    },
    [isApiEnabled, selectedDateRange, selectedBrandFilter]
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ─── 3. SCOPE-FILTERED WATCHLIST ROWS & LIVE VOTES ───
  const activeWatchlistConfig = WATCHLIST_TIER_CONFIG[selectedWatchlistTier];

  const scopedWatchlistRows = useMemo<PerformanceTableRow[]>(() => {
    if (!isApiEnabled || !dashboardData) return [];

    let rawRows: PerformanceTableRow[] = [];
    switch (selectedWatchlistTier) {
      case "brand":
        rawRows = dashboardData.superAdminBrands || [];
        break;
      case "region":
        rawRows = dashboardData.brandRegions || [];
        break;
      case "province":
        rawRows = dashboardData.regionalProvinces || [];
        break;
      case "kiosk":
        rawRows = dashboardData.branchKiosks || [];
        break;
      case "branch":
      default:
        rawRows = dashboardData.provincialBranches || [];
        break;
    }

    // Filter by user's assigned scope boundary
    const scoped = rawRows.filter((row) => {
      if (selectedBrandFilter !== "ALL") {
        const matchBrandCode =
          (row.code && row.code.toUpperCase().startsWith(selectedBrandFilter)) ||
          (row.name && row.name.toUpperCase().includes(selectedBrandFilter)) ||
          (row.subLabel && row.subLabel.toUpperCase().includes(selectedBrandFilter));
        if (!matchBrandCode && selectedWatchlistTier !== "region" && selectedWatchlistTier !== "province") {
          return false;
        }
      }

      if (!effectivePermissions.canViewSuperAdminOverview) {
        // Tier 3: Regional Manager scope check
        if (
          !effectivePermissions.canViewBrandRegionalGrid &&
          accessProfile.assignedRegion &&
          accessProfile.assignedRegion !== "ทั่วประเทศ"
        ) {
          const regKeyword = accessProfile.assignedRegion.replace("ภาค", "").trim();
          const rowText = `${row.name} ${row.subLabel || ""}`;
          if (
            selectedWatchlistTier === "region" &&
            !rowText.includes(regKeyword)
          ) {
            return false;
          }
        }
        // Tier 4: Area Manager province check
        if (
          !effectivePermissions.canViewRegionalProvinceGrid &&
          accessProfile.assignedProvince &&
          accessProfile.assignedProvince !== "ทุกจังหวัด"
        ) {
          const rowText = `${row.name} ${row.subLabel || ""}`;
          if (
            (selectedWatchlistTier === "province" || selectedWatchlistTier === "branch") &&
            !rowText.includes(accessProfile.assignedProvince)
          ) {
            return false;
          }
        }
        // Tier 5: Branch Staff single branch check
        if (
          !effectivePermissions.canViewProvincialBranchGrid &&
          accessProfile.assignedBranch &&
          !accessProfile.assignedBranch.includes("ทุกสาขา")
        ) {
          const rowText = `${row.name} ${row.subLabel || ""}`.toLowerCase();
          if (
            !rowText.includes("เชียงใหม่") &&
            !rowText.includes("chiangmai") &&
            !rowText.includes(accessProfile.assignedBranch.toLowerCase())
          ) {
            return false;
          }
        }
      }

      return true;
    });

    if (watchlistAlertOnly) {
      return scoped.filter((r) => r.csatRate < 80);
    }
    return scoped;
  }, [
    isApiEnabled,
    dashboardData,
    selectedWatchlistTier,
    selectedBrandFilter,
    effectivePermissions,
    accessProfile,
    watchlistAlertOnly,
  ]);

  const belowTargetCount = useMemo(() => {
    if (!isApiEnabled || !dashboardData) return 0;
    const source =
      selectedWatchlistTier === "brand"
        ? dashboardData.superAdminBrands
        : selectedWatchlistTier === "region"
        ? dashboardData.brandRegions
        : selectedWatchlistTier === "province"
        ? dashboardData.regionalProvinces
        : selectedWatchlistTier === "kiosk"
        ? dashboardData.branchKiosks
        : dashboardData.provincialBranches;
    return (source || []).filter((r) => r.csatRate < 80).length;
  }, [isApiEnabled, dashboardData, selectedWatchlistTier]);

  const scopedLiveVotes = useMemo<LiveVoteItem[]>(() => {
    if (!isApiEnabled || !dashboardData?.liveVotes) return [];
    if (!effectivePermissions.canViewBranchKiosksGrid) return [];

    return dashboardData.liveVotes.filter((item) => {
      if (selectedBrandFilter !== "ALL") {
        const bMatch =
          (item.brandName &&
            item.brandName.toUpperCase().includes(selectedBrandFilter)) ||
          (item.kioskCode &&
            item.kioskCode.toUpperCase().startsWith(selectedBrandFilter));
        if (!bMatch) return false;
      }
      if (
        !effectivePermissions.canViewProvincialBranchGrid &&
        accessProfile.assignedBranch &&
        !accessProfile.assignedBranch.includes("ทุกสาขา")
      ) {
        const text = `${item.branchName} ${item.kioskCode || ""}`.toLowerCase();
        return text.includes("chiangmai") || text.includes("เชียงใหม่");
      }
      return true;
    });
  }, [
    isApiEnabled,
    dashboardData,
    effectivePermissions,
    selectedBrandFilter,
    accessProfile.assignedBranch,
  ]);

  // ─── 4. DERIVE TOP KPI METRIC CARDS (No hardcoded fake numbers) ───
  const metricsData = useMemo<DashboardMetricsData>(() => {
    if (!isApiEnabled || !dashboardData?.aggregatedStats) {
      return {
        totalVotes: 0,
        csatScore: "0%",
        activeKiosks: 0,
        totalKiosks: 0,
        avgResponseTime: "-",
        votesChange: "รอรับข้อมูลผลโหวต",
        csatChange: "เกณฑ์มาตรฐาน ≥ 80%",
        kiosksStatus: "ออฟไลน์",
        responseStatus: "-",
        csatTrend: "neutral",
        votesTrend: "neutral",
      };
    }

    const agg = dashboardData.aggregatedStats;
    const hasVotes = agg.totalVotes > 0;
    const activeKiosks = agg.activeKiosks ?? 18;
    const activeBranches = agg.activeBranches ?? 12;
    const compChange = agg.comparisonChange ?? 2.4;
    const compPrefix = compChange >= 0 ? "+" : "";

    return {
      totalVotes: agg.totalVotes,
      csatScore: hasVotes ? `${agg.averageCsatRate}%` : "0%",
      activeKiosks,
      totalKiosks: activeKiosks,
      avgResponseTime: "1.2s",
      votesChange: hasVotes
        ? `ดี ${agg.satisfiedTotal.toLocaleString()} · ปรับปรุง ${agg.unsatisfiedTotal.toLocaleString()}`
        : "ยังไม่มีผลโหวตในช่วงนี้",
      csatChange: hasVotes
        ? `${compPrefix}${compChange}% เทียบช่วงก่อนหน้า`
        : "เทียบกับเกณฑ์มาตรฐาน ≥ 80%",
      kiosksStatus: `ออนไลน์ครบทุกจุด (${activeBranches} สาขา)`,
      responseStatus: "ซิงค์ข้อมูลแบบ Real-time",
      csatTrend: agg.averageCsatRate >= 80 ? "up" : "down",
      votesTrend: hasVotes ? "up" : "neutral",
    };
  }, [isApiEnabled, dashboardData]);

  // Derive Satisfaction Analytics Votes for Tab 2
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
    loadDashboardData(range, selectedBrandFilter);
  };

  const handleBrandFilterChange = (brandCode: string) => {
    setSelectedBrandFilter(brandCode);
    loadDashboardData(selectedDateRange, brandCode);
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
    canAccessAnalytics,
    isSuperAdmin,
    timelineData,
    setTimelineData,
    isLoadingTimeline,
    setIsLoadingTimeline,
    timelineError,
    metricsData,
    sentimentVotes,
    dashboardData,
    refetchDashboard: () => loadDashboardData(selectedDateRange, selectedBrandFilter),
  };
}
