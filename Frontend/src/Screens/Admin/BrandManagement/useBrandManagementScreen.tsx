"use client";

import React, { useState } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";

export type BrandManagementTab = "brands" | "branches";

export interface BrandManagementScreenState {
  initialTab?: BrandManagementTab;
}

export function useBrandManagementScreen({
  initialTab = "brands",
}: BrandManagementScreenState = {}) {
  const [activeTab, setActiveTab] = useState<BrandManagementTab>(initialTab);

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
    handleTabChange,
    handleAddAction,
  };
}
