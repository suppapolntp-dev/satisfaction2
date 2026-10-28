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
  className = "",
}: OrgHierarchyTreeSidebarProps) {
  return (
    <aside
      className={`w-full lg:w-72 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden shrink-0 ${className}`}
    >
      {/* ─── Header: Scope Search & Root Action ─── */}
      <div className="p-3.5 border-b border-slate-100 space-y-2.5 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Scope Hierarchy
          </span>
          <span className="text-[10px] font-semibold text-[var(--primary-container)] bg-[var(--accent-bg)] px-2 py-0.5 rounded-full border border-[var(--accent-light)]">
            5 Tiers
          </span>
        </div>

        {/* Search input */}
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
            className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-200/80 rounded-xl outline-none focus:border-[var(--primary-container)] focus:ring-1 focus:ring-[var(--primary-container)] text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* SuperAdmin Root Button */}
        <button
          type="button"
          onClick={onSelectSuperAdmin}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedScopeLevel === "SUPER_ADMIN"
              ? "bg-[var(--accent-bg)] text-[var(--primary-container)] shadow-xs"
              : "text-slate-700 hover:bg-slate-100/80"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span className="truncate flex-1 text-left">All Organizations</span>
          <span className="text-[10px] opacity-70">Tier 1</span>
        </button>
      </div>

      {/* ─── Tree Navigation Body ─── */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 text-xs select-none max-h-[560px] [scrollbar-width:thin]">
        {brandHierarchy.map((brand) => {
          const isBrandExpanded = !!expandedNodes[brand.id];
          const isBrandSelected =
            selectedScopeLevel === "BRAND" && selectedBrand?.id === brand.id;

          return (
            <div key={brand.id} className="space-y-0.5">
              {/* Tier 2: Brand Item */}
              <div
                onClick={() => onSelectBrand(brand)}
                className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer transition-colors ${
                  isBrandSelected
                    ? "bg-[var(--accent-bg)] text-[var(--primary-container)] font-semibold"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => onToggleNode(brand.id, e)}
                  className="w-4 h-4 rounded hover:bg-black/5 flex items-center justify-center shrink-0 text-slate-400"
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${isBrandExpanded ? "rotate-90" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <div className="w-5 h-5 rounded-lg bg-[var(--accent-bg)] text-[var(--primary-container)] border border-[var(--accent-light)] flex items-center justify-center font-bold text-[10px] shrink-0">
                  {brand.code?.[0] || "B"}
                </div>

                <span className="truncate flex-1 font-medium">{brand.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">Tier 2</span>
              </div>

              {/* Tier 3: Regions */}
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
                          <span className="text-[10px] text-slate-400">Tier 3</span>
                        </div>

                        {/* Tier 4: Provinces */}
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
                                    <span className="text-[10px] text-slate-400">Tier 4</span>
                                  </div>

                                  {/* Tier 5: Branches */}
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
                                            className={`flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                                              isBranchSelected
                                                ? "bg-[var(--primary-container)] text-white font-medium shadow-xs"
                                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                            }`}
                                          >
                                            <span className="truncate">{branch.name}</span>
                                            <span
                                              className={`text-[10px] font-mono shrink-0 ml-1 ${
                                                isBranchSelected ? "text-white" : "text-[var(--primary-container)] font-semibold"
                                              }`}
                                            >
                                              {branch.csatScore || "Tier 5"}
                                            </span>
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
        })}
      </nav>
    </aside>
  );
}
