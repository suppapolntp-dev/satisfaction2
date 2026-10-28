"use client";

import React, { useEffect } from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import MetricCard from "@/Components/Cards/MetricCard";
import BrandTable from "@/Components/Tables/BrandTable";
import BranchTable from "@/Components/Tables/BranchTable";
import BrandModal from "@/Components/Modals/BrandModal";
import OrgHierarchyTreeSidebar from "@/Components/Sidebars/OrgHierarchyTreeSidebar";
import { useOrgTree } from "@/Components/Sidebars/OrgHierarchyTreeSidebar/useOrgTree";
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
    branches,
    isLoading,
    isEditModalOpen,
    editingBrand,
    handleTabChange,
    handleAddAction,
    handleOpenEditModal,
    handleCloseEditModal,
    handleSaveEditBrand,
    handleDeleteBrand,
    handleAddBranch,
    handleEditBranch,
    handleDeleteBranch,
  } = useBrandManagementScreen({ initialTab });

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
  } = useOrgTree();

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
        primaryAction={
          isBrandTab
            ? {
                label: "Add Brand",
                variant: "primary",
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
              }
            : undefined
        }
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

      {/* ─── TAB 2: BRANCHES OVERVIEW, TREE SIDEBAR & TABLE ─── */}
      {activeTab === "branches" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            {branchMetrics.map((item) => (
              <MetricCard key={item.id || item.label} item={item} />
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left: Collapsible 5-Tier Organization Hierarchy Tree Navigation */}
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
              collapsible={true}
              defaultCollapsed={false}
            />

            {/* Right: Branch Directory Table with in-table Add Branch button */}
            <div className="flex-1 w-full min-w-0">
              <BranchTable
                branches={branches}
                isLoading={isLoading}
                onAddBranch={handleAddBranch}
                onEditBranch={handleEditBranch}
                onDeleteBranch={handleDeleteBranch}
              />
            </div>
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
