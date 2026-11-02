"use client";

import { useState, useMemo } from "react";
import {
  BrandItem,
  RegionItem,
  ProvinceItem,
  BranchItem,
  HierarchyScopeLevel,
} from "@/Types/dataAccess";

export interface UseOrgTreeOptions {
  data?: BrandItem[];
  initialScopeLevel?: HierarchyScopeLevel;
  initialExpandedNodes?: Record<string, boolean>;
}

export function useOrgTree(options: UseOrgTreeOptions = {}) {
  // TODO: Connect API [organization_hierarchy_tree]
  const brandHierarchy = options.data ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScopeLevel, setSelectedScopeLevel] = useState<HierarchyScopeLevel>(
    options.initialScopeLevel || "SUPER_ADMIN"
  );
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionItem | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceItem | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    options.initialExpandedNodes || {}
  );

  const toggleNode = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectSuperAdmin = () => {
    setSelectedScopeLevel("SUPER_ADMIN");
    setSelectedBrand(null);
    setSelectedRegion(null);
    setSelectedProvince(null);
    setSelectedBranch(null);
  };

  const selectBrand = (brand: BrandItem) => {
    setSelectedScopeLevel("BRAND");
    setSelectedBrand(brand);
    setSelectedRegion(null);
    setSelectedProvince(null);
    setSelectedBranch(null);
    setExpandedNodes((prev) => ({ ...prev, [brand.id]: true }));
  };

  const selectRegion = (brand: BrandItem, region: RegionItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedScopeLevel("REGION");
    setSelectedBrand(brand);
    setSelectedRegion(region);
    setSelectedProvince(null);
    setSelectedBranch(null);
    setExpandedNodes((prev) => ({ ...prev, [region.id]: true }));
  };

  const selectProvince = (
    brand: BrandItem,
    region: RegionItem,
    province: ProvinceItem,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setSelectedScopeLevel("PROVINCE");
    setSelectedBrand(brand);
    setSelectedRegion(region);
    setSelectedProvince(province);
    setSelectedBranch(null);
    setExpandedNodes((prev) => ({ ...prev, [province.id]: true }));
  };

  const selectBranch = (
    brand: BrandItem,
    region: RegionItem,
    province: ProvinceItem,
    branch: BranchItem,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setSelectedScopeLevel("BRANCH");
    setSelectedBrand(brand);
    setSelectedRegion(region);
    setSelectedProvince(province);
    setSelectedBranch(branch);
  };

  // Scope label badge
  const activeScopeInfo = useMemo(() => {
    if (selectedScopeLevel === "BRANCH" && selectedBranch) {
      return {
        title: selectedBranch.name,
        code: selectedBranch.code,
        tier: "Branch",
      };
    }
    if (selectedScopeLevel === "PROVINCE" && selectedProvince) {
      return {
        title: `จ.${selectedProvince.name}`,
        code: selectedBrand?.code,
        tier: "Province",
      };
    }
    if (selectedScopeLevel === "REGION" && selectedRegion) {
      return {
        title: selectedRegion.name,
        code: selectedBrand?.code,
        tier: "Region",
      };
    }
    if (selectedScopeLevel === "BRAND" && selectedBrand) {
      return {
        title: selectedBrand.name,
        code: selectedBrand.code,
        tier: "Brand",
      };
    }
    return {
      title: "All Organization",
      code: "HQ",
      tier: "SuperAdmin",
    };
  }, [selectedScopeLevel, selectedBrand, selectedRegion, selectedProvince, selectedBranch]);

  // Filtered tree
  const filteredBrands = useMemo(() => {
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

  return {
    searchQuery,
    setSearchQuery,
    brandHierarchy: filteredBrands,
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
    activeScopeInfo,
  };
}
