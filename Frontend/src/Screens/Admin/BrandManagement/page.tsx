"use client";

import React, { useEffect, useMemo } from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import MetricCard from "@/Components/Cards/MetricCard";
import BrandTable from "@/Components/Tables/BrandTable";
import BranchTable from "@/Components/Tables/BranchTable";
import BrandModal from "@/Components/Modals/BrandModal";
import BranchModal from "@/Components/Modals/BranchModal";
import OrgHierarchyTreeSidebar from "@/Components/Sidebars/OrgHierarchyTreeSidebar";
import { useOrgTree } from "@/Components/Sidebars/OrgHierarchyTreeSidebar/useOrgTree";
import { buildHierarchyTree } from "@/Services/dataAccessService";
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
    brands,
    branches,
    isLoading,
    isEditModalOpen,
    editingBrand,
    isBranchModalOpen,
    editingBranch,
    masterBrands,
    handleTabChange,
    handleAddAction,
    handleOpenEditModal,
    handleCloseEditModal,
    handleSaveEditBrand,
    handleDeleteBrand,
    handleAddBranch,
    handleEditBranch,
    handleCloseBranchModal,
    handleSaveBranch,
    handleDeleteBranch,
  } = useBrandManagementScreen({ initialTab });

  // 1. Build hierarchy tree from loaded brands and branches
  const hierarchyTreeData = useMemo(() => {
    return buildHierarchyTree(brands, branches);
  }, [brands, branches]);

  // 2. Synchronize Org Tree with live data
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
    scopePath,
  } = useOrgTree({
    data: hierarchyTreeData.length > 0 ? hierarchyTreeData : undefined,
  });

  // 3. Connect State from Org Tree to filter branch dataset
  const filteredBranches = useMemo(() => {
    if (!branches || branches.length === 0) return [];

    // All Organization (Super Admin level or no filter)
    if (
      selectedScopeLevel === "SUPER_ADMIN" ||
      (!selectedBrand && !selectedRegion && !selectedProvince && !selectedBranch)
    ) {
      return branches;
    }

    return branches.filter((branch) => {
      // Level 5: Branch
      if (selectedScopeLevel === "BRANCH" && selectedBranch) {
        return (
          branch.id === selectedBranch.id ||
          (Boolean(branch.code) && branch.code.toLowerCase() === selectedBranch.code.toLowerCase()) ||
          branch.name.trim().toLowerCase() === selectedBranch.name.trim().toLowerCase()
        );
      }

      // Level 2, 3, 4: Brand matching
      if (selectedBrand) {
        const brandName = selectedBrand.name.trim().toLowerCase();
        const brandCode = (selectedBrand.code || "").trim().toLowerCase();

        const matchBrandList =
          Array.isArray(branch.brands) &&
          branch.brands.some((b) => {
            const lower = b.trim().toLowerCase();
            return lower === brandName || (Boolean(brandCode) && lower === brandCode);
          });

        const matchBrandStr =
          typeof branch.brand === "string" &&
          (branch.brand.toLowerCase().includes(brandName) ||
            (Boolean(brandCode) && branch.brand.toLowerCase().includes(brandCode)));

        if (!matchBrandList && !matchBrandStr) {
          return false;
        }
      }

      // Level 3, 4: Region matching
      if (selectedRegion) {
        const regionName = selectedRegion.name.trim().toLowerCase();
        const branchRegion = (branch.region || "").trim().toLowerCase();
        if (branchRegion !== regionName) {
          return false;
        }
      }

      // Level 4: Province matching
      if (selectedProvince) {
        const provName = selectedProvince.name.trim().toLowerCase();
        const branchProvince = (branch.province || "").trim().toLowerCase();
        if (branchProvince !== provName) {
          return false;
        }
      }

      return true;
    });
  }, [branches, selectedScopeLevel, selectedBrand, selectedRegion, selectedProvince, selectedBranch]);

  // Compute active scope filter pill for BranchTable
  const scopeFilter = useMemo(() => {
    if (selectedScopeLevel === "BRANCH" && selectedBranch) {
      return { level: "Branch", label: selectedBranch.name };
    }
    if (selectedScopeLevel === "PROVINCE" && selectedProvince) {
      return { level: "Province", label: `จ.${selectedProvince.name}` };
    }
    if (selectedScopeLevel === "REGION" && selectedRegion) {
      return { level: "Region", label: selectedRegion.name };
    }
    if (selectedScopeLevel === "BRAND" && selectedBrand) {
      return { level: "Brand", label: selectedBrand.name };
    }
    return undefined;
  }, [selectedScopeLevel, selectedBrand, selectedRegion, selectedProvince, selectedBranch]);

  useEffect(() => {
    console.log("[BrandManagementScreen] Mounted / Updated with activeTab:", activeTab, {
      brandMetricsCount: brandMetrics.length,
      filteredBranchesCount: filteredBranches.length,
      selectedScopeLevel,
    });
  }, [activeTab, brandMetrics.length, filteredBranches.length, selectedScopeLevel]);

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

      {/* ─── TAB 2: BRANCHES OVERVIEW, CLEAN 2-GRID (TREE SIDEBAR & TABLE) ─── */}
      {activeTab === "branches" && (
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
            scopePath={scopePath}
            collapsible={true}
            defaultCollapsed={false}
          />

          {/* Right: Branch Directory Table with in-table Add Branch button */}
          <div className="flex-1 w-full min-w-0">
            <BranchTable
              branches={filteredBranches}
              isLoading={isLoading}
              onAddBranch={handleAddBranch}
              onEditBranch={handleEditBranch}
              onDeleteBranch={handleDeleteBranch}
              scopeFilter={scopeFilter}
              onClearScopeFilter={selectSuperAdmin}
            />
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

      {/* ─── MODAL: ADD / EDIT BRANCH ─── */}
      <BranchModal
        isOpen={isBranchModalOpen}
        branch={editingBranch}
        currentScopeContext={{
          brandName: selectedBrand?.name,
          regionName: selectedRegion?.name,
          provinceName: selectedProvince?.name,
        }}
        onClose={handleCloseBranchModal}
        onSave={(data) =>
          handleSaveBranch(data, {
            brand: selectedBrand?.name,
            region: selectedRegion?.name,
            province: selectedProvince?.name,
          })
        }
      />
    </div>
  );
}
