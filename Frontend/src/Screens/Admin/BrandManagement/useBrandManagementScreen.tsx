"use client";

import React, { useState, useEffect, useMemo } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { MetricCardItem } from "@/Components/Cards/MetricCard";
import { BrandModel } from "@/Types/brand";
import { BranchModel } from "@/Types/branch";
import { brandService } from "@/Services/brandService";
import { branchService } from "@/Services/branchService";

export type BrandManagementTab = "brands" | "branches";

export interface BrandManagementScreenState {
  initialTab?: BrandManagementTab;
}

export function useBrandManagementScreen({
  initialTab = "brands",
}: BrandManagementScreenState = {}) {
  const [activeTab, setActiveTab] = useState<BrandManagementTab>(initialTab);
  const [brands, setBrands] = useState<BrandModel[] | null>(null);
  const [branches, setBranches] = useState<BranchModel[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial brand & branch data from service layer
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [brandData, branchData] = await Promise.all([
          brandService.getBrands(),
          branchService.getBranches(),
        ]);

        if (isMounted) {
          setBrands(brandData || []);
          setBranches(branchData || []);
        }
      } catch (error) {
        console.error("[useBrandManagementScreen] loadData failed:", error);
        if (isMounted) {
          setBrands([]);
          setBranches([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Brand Metric Cards
  const brandMetrics: MetricCardItem[] = useMemo(() => {
    const hasData = brands !== null;
    const totalBrands = brands?.length ?? null;
    const activeBrands = brands ? brands.filter((item) => item.status === "Active").length : null;
    const totalBranches = brands
      ? brands.reduce((sum, item) => sum + (item.totalBranchesCount || 0), 0)
      : null;

    // Calculate average CSAT across brands
    const validCsatBrands = brands?.filter((item) => Boolean(item.csatAverage)) || [];
    const avgCsat =
      validCsatBrands.length > 0
        ? (
            validCsatBrands.reduce(
              (sum, item) => sum + parseFloat(item.csatAverage.replace("%", "") || "0"),
              0
            ) / validCsatBrands.length
          ).toFixed(1) + "%"
        : null;

    return [
      {
        id: "total-brands",
        label: "Total Brands",
        value: hasData && totalBrands !== null ? totalBrands.toLocaleString() : "-",
        change: hasData ? "Portfolio overview" : undefined,
        trend: "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
          </svg>
        ),
      },
      {
        id: "active-brands",
        label: "Active Brands",
        value: hasData && activeBrands !== null ? activeBrands.toLocaleString() : "-",
        change: hasData ? "Operational brands" : undefined,
        trend: "up",
        tag: "Active",
        customIcon: (
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
      },
      {
        id: "total-network-branches",
        label: "Network Branches",
        value: hasData && totalBranches !== null ? totalBranches.toLocaleString() : "-",
        change: hasData ? "Across all locations" : undefined,
        trend: "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
      },
      {
        id: "brand-avg-csat",
        label: "Avg. Brand CSAT",
        value: hasData && avgCsat !== null ? avgCsat : "-",
        change: hasData ? "Customer sentiment" : undefined,
        trend: "up",
        valueHighlight: true,
        iconType: "satisfaction",
      },
    ];
  }, [brands]);

  // Compute Branch Metric Cards
  const branchMetrics: MetricCardItem[] = useMemo(() => {
    const hasData = branches !== null;
    const totalBranches = branches?.length ?? null;
    const activeBranches = branches ? branches.filter((item) => item.status === "Active").length : null;
    const dualBrandBranches = branches
      ? branches.filter(
          (item) => (item.brands && item.brands.length > 1) || item.brand.includes("+")
        ).length
      : null;
    const totalKiosks = branches
      ? branches.reduce((sum, item) => sum + (item.kioskCount || 0), 0)
      : null;

    return [
      {
        id: "total-branches",
        label: "Total Branches",
        value: hasData && totalBranches !== null ? totalBranches.toLocaleString() : "-",
        change: hasData ? "Physical sites" : undefined,
        trend: "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        ),
      },
      {
        id: "active-branches",
        label: "Active Stores",
        value: hasData && activeBranches !== null ? activeBranches.toLocaleString() : "-",
        change: hasData ? "Currently open" : undefined,
        trend: "up",
        tag: "Operational",
        customIcon: (
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        id: "dual-brand-branches",
        label: "Dual-Brand Stores",
        value: hasData && dualBrandBranches !== null ? dualBrandBranches.toLocaleString() : "-",
        change: hasData ? "Co-location spaces" : undefined,
        trend: "neutral",
        customIcon: (
          <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        ),
      },
      {
        id: "total-kiosks",
        label: "Registered Kiosks",
        value: hasData && totalKiosks !== null ? totalKiosks.toLocaleString() : "-",
        change: hasData ? "Deployed devices" : undefined,
        trend: "neutral",
        iconType: "kiosks",
      },
    ];
  }, [branches]);

  const brandTabs: HeaderTabItem[] = [
    {
      id: "brands",
      label: "Brands",
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
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
          <path d="M10 6h4" />
          <path d="M10 10h4" />
          <path d="M10 14h4" />
          <path d="M10 18h4" />
        </svg>
      ),
    },
    {
      id: "branches",
      label: "Branches",
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
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as BrandManagementTab);
  };

  const handleAddAction = () => {
    // TODO: Connect API or trigger creation modal based on activeTab
  };

  return {
    activeTab,
    brandTabs,
    brandMetrics,
    branchMetrics,
    isLoading,
    handleTabChange,
    handleAddAction,
  };
}
