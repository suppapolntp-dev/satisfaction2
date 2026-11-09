"use client";

import React from "react";
import {
  BrandItem,
  RegionItem,
  ProvinceItem,
  BranchItem,
  HierarchyScopeLevel,
} from "@/Types/dataAccess";

export interface OrgHierarchyTreeSidebarProps {
  brandHierarchy: BrandItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedScopeLevel: HierarchyScopeLevel;
  selectedBrand: BrandItem | null;
  selectedRegion: RegionItem | null;
  selectedProvince: ProvinceItem | null;
  selectedBranch: BranchItem | null;
  expandedNodes: Record<string, boolean>;
  onToggleNode: (id: string, e?: React.MouseEvent) => void;
  onSelectSuperAdmin: () => void;
  onSelectBrand: (brand: BrandItem) => void;
  onSelectRegion: (brand: BrandItem, region: RegionItem, e?: React.MouseEvent) => void;
  onSelectProvince: (brand: BrandItem, region: RegionItem, province: ProvinceItem, e?: React.MouseEvent) => void;
  onSelectBranch: (brand: BrandItem, region: RegionItem, province: ProvinceItem, branch: BranchItem, e?: React.MouseEvent) => void;
  scopePath?: string;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  showBreadcrumbs?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  selectedBranches?: string[];
  onToggleBranch?: (branchName: string, branch?: BranchItem) => void;
  enableBranchCheckboxes?: boolean;
}

export default function OrgHierarchyTreeSidebar({
  brandHierarchy,
  searchQuery,
  onSearchChange,
  selectedScopeLevel,
  selectedBrand,
  selectedRegion,
  selectedProvince,
  selectedBranch,
  expandedNodes,
  onToggleNode,
  onSelectSuperAdmin,
  onSelectBrand,
  onSelectRegion,
  onSelectProvince,
  onSelectBranch,
  scopePath,
  onSelectAll,
  onClearAll,
  showBreadcrumbs = true,
  collapsible = true,
  defaultCollapsed = false,
  className = "",
  selectedBranches,
  onToggleBranch,
  enableBranchCheckboxes,
}: OrgHierarchyTreeSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(defaultCollapsed);

  const displayBrands = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return brandHierarchy;

    return brandHierarchy
      .map((brand) => {
        const brandMatch = brand.name.toLowerCase().includes(q);
        const filteredRegions = brand.regions
          .map((reg) => {
            const regMatch = reg.name.toLowerCase().includes(q);
            const filteredProvinces = reg.provinces
              .map((prov) => {
                const provMatch = prov.name.toLowerCase().includes(q);
                const filteredBranches = prov.branches.filter(
                  (br) =>
                    br.name.toLowerCase().includes(q) || br.code.toLowerCase().includes(q)
                );
                if (provMatch || filteredBranches.length > 0) {
                  return { ...prov, branches: filteredBranches };
                }
                return null;
              })
              .filter(Boolean) as ProvinceItem[];

            if (regMatch || filteredProvinces.length > 0) {
              return { ...reg, provinces: filteredProvinces };
            }
            return null;
          })
          .filter(Boolean) as RegionItem[];

        if (brandMatch || filteredRegions.length > 0) {
          return { ...brand, regions: filteredRegions };
        }
        return null;
      })
      .filter(Boolean) as BrandItem[];
  }, [brandHierarchy, searchQuery]);

  // Compute active breadcrumb path dynamically from current selection state
  const activeDisplayPath = React.useMemo(() => {
    if (selectedScopeLevel === "BRANCH" && selectedBranch) {
      const bName = selectedBrand?.name || "";
      const rName = selectedRegion?.name || "";
      const pName = selectedProvince?.name || "";
      const brName = selectedBranch.name;
      return [bName, rName, pName, brName].filter(Boolean).join(" > ");
    }
    if (selectedScopeLevel === "PROVINCE" && selectedProvince) {
      const bName = selectedBrand?.name || "";
      const rName = selectedRegion?.name || "";
      const pName = selectedProvince.name;
      return [bName, rName, pName].filter(Boolean).join(" > ");
    }
    if (selectedScopeLevel === "REGION" && selectedRegion) {
      const bName = selectedBrand?.name || "";
      const rName = selectedRegion.name;
      return [bName, rName].filter(Boolean).join(" > ");
    }
    if (selectedScopeLevel === "BRAND" && selectedBrand) {
      return selectedBrand.name;
    }
    if (selectedScopeLevel === "SUPER_ADMIN") {
      return "All Organizations (สำนักงานใหญ่)";
    }
    return scopePath || "All Organizations (สำนักงานใหญ่)";
  }, [selectedScopeLevel, selectedBrand, selectedRegion, selectedProvince, selectedBranch, scopePath]);

  if (collapsible && isCollapsed) {
    return (
      <aside
        className={`w-12 flex flex-col items-center bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] py-4 gap-3 shrink-0 transition-all select-none ${className}`}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          title="ขยายแถบ Scope Hierarchy"
          aria-label="Expand sidebar"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="h-px w-6 bg-slate-200 my-1" />

        {/* Vertical Label */}
        <span
          className="text-[11px] font-bold text-slate-400 tracking-wider uppercase [writing-mode:vertical-lr] rotate-180 cursor-pointer hover:text-slate-700 transition-colors"
          onClick={() => setIsCollapsed(false)}
        >
          Scope Hierarchy
        </span>
      </aside>
    );
  }

  return (
    <aside
      className={`flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden shrink-0 transition-all ${
        className.includes("w-") ? "" : "w-full lg:w-[298px] xl:w-[298px]"
      } ${className}`}
    >
      {/* ─── Header: Scope Search, Collapse Action & Root Action (image_782ae7.png & Figma 13-91) ─── */}
      <div className="p-3.5 space-y-2.5 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Scope Hierarchy
          </span>

          {collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-5 h-5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="พับเก็บแถบข้าง"
              aria-label="Collapse sidebar"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Pill Search input */}
        <div className="relative flex items-center">
          <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter brand / branch..."
            className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-200 rounded-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Breadcrumb Path & Select All Action Row (Figma scope-hierarchy-sidebar 1 Parity) */}
        <div className="flex items-start justify-between gap-2 border-t border-slate-100 pt-2 pb-0.5">
          <div
            onClick={onSelectSuperAdmin}
            className="text-[10px] leading-tight text-slate-500 truncate flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            title={activeDisplayPath}
          >
            {activeDisplayPath && activeDisplayPath !== "All Organizations (สำนักงานใหญ่)" && activeDisplayPath !== "All Organizations" ? (
              <>
                <div className="text-slate-400 truncate">
                  {activeDisplayPath.includes(" > ")
                    ? activeDisplayPath.split(" > ").slice(0, -1).join(" / ") + " /"
                    : activeDisplayPath + " /"}
                </div>
                <div className="font-semibold text-slate-700 truncate mt-0.5 flex items-center gap-1">
                  <span>
                    {activeDisplayPath.includes(" > ")
                      ? activeDisplayPath.split(" > ").slice(-1)[0]
                      : activeDisplayPath}
                  </span>
                  {selectedBranches && selectedBranches.length > 0 && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200/60">
                      {selectedBranches.length} สาขา
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">All Organizations</span>
                {selectedBranches && selectedBranches.length > 0 && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200/60">
                    {selectedBranches.length} สาขา
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={onSelectAll || onSelectSuperAdmin}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Select All
            </button>
            {onClearAll && selectedBranches && selectedBranches.length > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  ล้างค่า
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* ─── Tree Navigation Body ─── */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs select-none max-h-[580px] [scrollbar-width:thin]">
        {displayBrands.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-xs">ไม่มีข้อมูลโครงสร้างองค์กร</p>
            <p className="text-[11px] text-slate-400 mt-1">รอการเชื่อมต่อ API</p>
          </div>
        ) : (
          displayBrands.map((brand) => {
          const isBrandExpanded = !!expandedNodes[brand.id];
          const isBrandSelected =
            selectedScopeLevel === "BRAND" && selectedBrand?.id === brand.id;

          return (
            <div key={brand.id} className="space-y-0.5">
              {/* Tier 2: Brand Item (Exact Match image_9f68c2.png) */}
              <div
                onClick={() => onSelectBrand(brand)}
                className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors ${
                  isBrandSelected
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-800 hover:bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => onToggleNode(brand.id, e)}
                  className="w-4 h-4 rounded hover:bg-slate-200/60 flex items-center justify-center shrink-0 text-slate-400"
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isBrandExpanded ? "rotate-90" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                {/* Circular Initial Avatar */}
                <div className="w-5 h-5 rounded-full bg-white text-blue-600 border border-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs">
                  {brand.name?.[0]?.toUpperCase() || brand.code?.[0]?.toUpperCase() || "B"}
                </div>

                <span className="truncate flex-1 font-medium text-slate-800">{brand.name}</span>
              </div>

              {/* Regions */}
              {isBrandExpanded && (
                <div className="pl-4 ml-2 border-l border-slate-200 space-y-0.5">
                  {brand.regions.map((region) => {
                    const isRegionExpanded = !!expandedNodes[region.id];
                    const isRegionSelected =
                      selectedScopeLevel === "REGION" && selectedRegion?.id === region.id;

                    return (
                      <div key={region.id} className="space-y-0.5">
                        <div
                          onClick={(e) => onSelectRegion(brand, region, e)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer transition-colors ${
                            isRegionSelected
                              ? "bg-[var(--accent-bg)] text-[var(--primary-container)] font-semibold"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => onToggleNode(region.id, e)}
                            className="w-4 h-4 rounded hover:bg-black/5 flex items-center justify-center shrink-0 text-slate-400"
                          >
                            <svg
                              className={`w-3 h-3 transition-transform ${isRegionExpanded ? "rotate-90" : ""}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                          <span className="truncate flex-1">{region.name}</span>
                        </div>

                        {/* Provinces */}
                        {isRegionExpanded && (
                          <div className="pl-4 ml-2 border-l border-slate-200 space-y-0.5">
                            {region.provinces.map((prov) => {
                              const isProvExpanded = !!expandedNodes[prov.id];
                              const isProvSelected =
                                selectedScopeLevel === "PROVINCE" &&
                                selectedProvince?.id === prov.id;

                              const provBranches = prov.branches || [];
                              const provCheckedCount = selectedBranches
                                ? provBranches.filter((b) => selectedBranches.includes(b.name)).length
                                : 0;

                              return (
                                <div key={prov.id} className="space-y-0.5">
                                  <div
                                    onClick={(e) => onSelectProvince(brand, region, prov, e)}
                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer transition-colors ${
                                      isProvSelected
                                        ? "bg-[var(--accent-bg)] text-[var(--primary-container)] font-semibold"
                                        : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => onToggleNode(prov.id, e)}
                                      className="w-4 h-4 rounded hover:bg-black/5 flex items-center justify-center shrink-0 text-slate-400"
                                    >
                                      <svg
                                        className={`w-3 h-3 transition-transform ${isProvExpanded ? "rotate-90" : ""}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                      >
                                        <polyline points="9 18 15 12 9 6" />
                                      </svg>
                                    </button>
                                    <span className="truncate flex-1">{prov.name}</span>

                                    {/* Province branches selected count pill */}
                                    {provBranches.length > 0 && selectedBranches !== undefined && (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                                          provCheckedCount > 0
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-slate-100 text-slate-400"
                                        }`}
                                        title={`${provCheckedCount} จาก ${provBranches.length} สาขาที่เลือก`}
                                      >
                                        {provCheckedCount}/{provBranches.length}
                                      </span>
                                    )}
                                  </div>

                                  {/* Branches */}
                                  {isProvExpanded && (
                                    <div className="pl-4 ml-2 border-l border-slate-200 space-y-0.5">
                                      {prov.branches.map((branch) => {
                                        const isCheckboxMode =
                                          enableBranchCheckboxes ||
                                          onToggleBranch !== undefined ||
                                          selectedBranches !== undefined;

                                        const isBranchChecked =
                                          selectedBranches !== undefined
                                            ? selectedBranches.includes(branch.name)
                                            : selectedScopeLevel === "BRANCH" &&
                                              selectedBranch?.id === branch.id;

                                        if (isCheckboxMode) {
                                          return (
                                            <label
                                              key={branch.id}
                                              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors select-none text-xs ${
                                                isBranchChecked
                                                  ? "bg-blue-50 text-blue-900 font-semibold border border-blue-200/50"
                                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                                              }`}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={Boolean(isBranchChecked)}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  if (onToggleBranch) {
                                                    onToggleBranch(branch.name, branch);
                                                  } else {
                                                    onSelectBranch(brand, region, prov, branch, e as any);
                                                  }
                                                }}
                                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 accent-blue-600 cursor-pointer shrink-0"
                                              />
                                              <span className="truncate flex-1">{branch.name}</span>
                                            </label>
                                          );
                                        }

                                        return (
                                          <div
                                            key={branch.id}
                                            onClick={(e) =>
                                              onSelectBranch(brand, region, prov, branch, e)
                                            }
                                            className={`flex items-center px-2.5 py-1 rounded-lg cursor-pointer transition-colors text-xs ${
                                              isBranchChecked
                                                ? "bg-blue-600 text-white font-medium shadow-xs"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            }`}
                                          >
                                            <span className="truncate">{branch.name}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }))}
      </nav>
    </aside>
  );
}
