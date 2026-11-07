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
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
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
  collapsible = true,
  defaultCollapsed = false,
  className = "",
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
      className={`w-full lg:w-72 flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden shrink-0 transition-all ${className}`}
    >
      {/* ─── Header: Scope Search, Collapse Action & Root Action (image_9f68c2.png) ─── */}
      <div className="p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Scope Hierarchy
          </span>

          {collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
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
          <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter brand / branch..."
            className="w-full h-8.5 pl-8.5 pr-3 text-xs bg-white border border-slate-200 rounded-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* SuperAdmin Root Button (Pill shape) */}
        <button
          type="button"
          onClick={onSelectSuperAdmin}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedScopeLevel === "SUPER_ADMIN"
              ? "bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs"
              : "text-slate-700 hover:bg-slate-50 border border-transparent"
          }`}
        >
          <svg className="w-4 h-4 shrink-0 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span className="truncate flex-1 text-left">All Organizations</span>
        </button>
      </div>

      <div className="border-t border-slate-100" />

      {/* ─── Tree Navigation Body ─── */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 text-xs select-none max-h-[560px] [scrollbar-width:thin]">
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
                                  </div>

                                  {/* Branches */}
                                  {isProvExpanded && (
                                    <div className="pl-4 ml-2 border-l border-slate-200 space-y-0.5">
                                      {prov.branches.map((branch) => {
                                        const isBranchSelected =
                                          selectedScopeLevel === "BRANCH" &&
                                          selectedBranch?.id === branch.id;

                                        return (
                                          <div
                                            key={branch.id}
                                            onClick={(e) =>
                                              onSelectBranch(brand, region, prov, branch, e)
                                            }
                                            className={`flex items-center px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                                              isBranchSelected
                                                ? "bg-[var(--primary-container)] text-white font-medium shadow-xs"
                                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
