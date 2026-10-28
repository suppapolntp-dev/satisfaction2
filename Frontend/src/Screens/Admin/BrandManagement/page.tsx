"use client";

import React, { useEffect } from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import MetricCard from "@/Components/Cards/MetricCard";
import BrandTable from "@/Components/Tables/BrandTable";
import BrandModal from "@/Components/Modals/BrandModal";
import { useBrandManagementScreen, BrandManagementTab } from "./useBrandManagementScreen";

export interface BrandManagementScreenProps {
  initialTab?: BrandManagementTab;
}

export default function BrandManagementScreen({
  initialTab = "brands",
}: BrandManagementScreenProps = {}) {
  const {
    activeTab,
    brandTabs,
    brandMetrics,
    branchMetrics,
    brands,
    isLoading,
    isEditModalOpen,
    editingBrand,
    handleTabChange,
    handleAddAction,
    handleOpenEditModal,
    handleCloseEditModal,
    handleSaveEditBrand,
    handleDeleteBrand,
  } = useBrandManagementScreen({ initialTab });

  useEffect(() => {
    console.log("[BrandManagementScreen] Mounted / Updated with activeTab:", activeTab, {
      brandMetricsCount: brandMetrics.length,
      branchMetricsCount: branchMetrics.length,
    });
  }, [activeTab, brandMetrics.length, branchMetrics.length]);

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

      {/* ─── TAB 1: BRANDS OVERVIEW & CARDS ─── */}
      {activeTab === "brands" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            {brandMetrics.map((item) => (
              <MetricCard key={item.id || item.label} item={item} />
            ))}
          </div>

          <BrandTable
            brands={brands}
            isLoading={isLoading}
            onEditBrand={handleOpenEditModal}
            onDeleteBrand={handleDeleteBrand}
          />
        </div>
      )}

      {/* ─── TAB 2: BRANCHES OVERVIEW & CARDS ─── */}
      {activeTab === "branches" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            {branchMetrics.map((item) => (
              <MetricCard key={item.id || item.label} item={item} />
            ))}
          </div>

          <div className="p-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-500">
              Ready for Branch Directory module
            </p>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT BRAND ─── */}
      <BrandModal
        isOpen={isEditModalOpen}
        brand={editingBrand}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditBrand}
      />
    </div>
  );
}
