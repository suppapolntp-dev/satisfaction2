"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  BrandItem,
  RegionItem,
  ProvinceItem,
  BranchItem,
  HierarchyScopeLevel,
} from "@/Types/dataAccess";
import { dataAccessService } from "@/Services/dataAccessService";

export interface OrgScopeChangeInfo {
  level: HierarchyScopeLevel;
  brand: BrandItem | null;
  region: RegionItem | null;
  province: ProvinceItem | null;
  branch: BranchItem | null;
  scopePath: string;
  scopeTitle: string;
  targetBranches: string[];
  targetBrands: string[];
}

export interface UseOrgTreeOptions {
  data?: BrandItem[];
  initialScopeLevel?: HierarchyScopeLevel;
  initialExpandedNodes?: Record<string, boolean>;
  onScopeChange?: (scopeInfo: OrgScopeChangeInfo) => void;
}

function getAllBranchesFromBrand(brand: BrandItem): string[] {
  return (brand.regions || []).flatMap((r) =>
    (r.provinces || []).flatMap((p) => (p.branches || []).map((b) => b.name))
  );
}

function getAllBranchesFromRegion(region: RegionItem): string[] {
  return (region.provinces || []).flatMap((p) =>
    (p.branches || []).map((b) => b.name)
  );
}

function getAllBranchesFromProvince(province: ProvinceItem): string[] {
  return (province.branches || []).map((b) => b.name);
}

export function useOrgTree(options: UseOrgTreeOptions = {}) {
  const [internalData, setInternalData] = useState<BrandItem[]>(options.data ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(!options.data || options.data.length === 0);

  // Load hierarchy tree if not provided via props
  useEffect(() => {
    let isMounted = true;
    if (options.data && options.data.length > 0) {
      setInternalData(options.data);
      setIsLoading(false);
      return;
    }

    async function loadTree() {
      try {
        setIsLoading(true);
        const tree = await dataAccessService.getHierarchyTree();
        if (isMounted) {
          setInternalData(tree || []);
        }
      } catch (err) {
        console.error("[useOrgTree] loadTree error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTree();

    return () => {
      isMounted = false;
    };
  }, [options.data]);

  const brandHierarchy = internalData;

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

  // Compute detailed path and assigned scopes
  const scopeDetails = useMemo(() => {
    if (selectedScopeLevel === "BRANCH" && selectedBranch) {
      const bName = selectedBrand?.name || "";
      const rName = selectedRegion?.name || "";
      const pName = selectedProvince?.name || "";
      const brName = selectedBranch.name;
      const path = [bName, rName, pName, brName].filter(Boolean).join(" > ");
      return {
        scopePath: path || brName,
        scopeTitle: brName,
        targetBranches: [brName],
        targetBrands: bName ? [bName] : [],
      };
    }
    if (selectedScopeLevel === "PROVINCE" && selectedProvince) {
      const bName = selectedBrand?.name || "";
      const rName = selectedRegion?.name || "";
      const pName = selectedProvince.name;
      const path = [bName, rName, pName].filter(Boolean).join(" > ");
      return {
        scopePath: path || pName,
        scopeTitle: `จ.${pName}`,
        targetBranches: getAllBranchesFromProvince(selectedProvince),
        targetBrands: bName ? [bName] : [],
      };
    }
    if (selectedScopeLevel === "REGION" && selectedRegion) {
      const bName = selectedBrand?.name || "";
      const rName = selectedRegion.name;
      const path = [bName, rName].filter(Boolean).join(" > ");
      return {
        scopePath: path || rName,
        scopeTitle: rName,
        targetBranches: getAllBranchesFromRegion(selectedRegion),
        targetBrands: bName ? [bName] : [],
      };
    }
    if (selectedScopeLevel === "BRAND" && selectedBrand) {
      const bName = selectedBrand.name;
      return {
        scopePath: bName,
        scopeTitle: bName,
        targetBranches: getAllBranchesFromBrand(selectedBrand),
        targetBrands: [bName],
      };
    }
    // SUPER_ADMIN
    const allBranches = brandHierarchy.flatMap(getAllBranchesFromBrand);
    const allBrands = brandHierarchy.map((b) => b.name);
    return {
      scopePath: "All Organizations (สำนักงานใหญ่)",
      scopeTitle: "All Organization",
      targetBranches: allBranches,
      targetBrands: allBrands,
    };
  }, [selectedScopeLevel, selectedBrand, selectedRegion, selectedProvince, selectedBranch, brandHierarchy]);

  // Notify onScopeChange callback
  const onScopeChangeRef = useRef(options.onScopeChange);
  useEffect(() => {
    onScopeChangeRef.current = options.onScopeChange;
  }, [options.onScopeChange]);

  useEffect(() => {
    if (onScopeChangeRef.current) {
      onScopeChangeRef.current({
        level: selectedScopeLevel,
        brand: selectedBrand,
        region: selectedRegion,
        province: selectedProvince,
        branch: selectedBranch,
        scopePath: scopeDetails.scopePath,
        scopeTitle: scopeDetails.scopeTitle,
        targetBranches: scopeDetails.targetBranches,
        targetBrands: scopeDetails.targetBrands,
      });
    }
  }, [selectedScopeLevel, selectedBrand, selectedRegion, selectedProvince, selectedBranch, scopeDetails]);

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
    rawBrandHierarchy: brandHierarchy,
    isLoading,
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
    scopePath: scopeDetails.scopePath,
    scopeTitle: scopeDetails.scopeTitle,
    targetBranches: scopeDetails.targetBranches,
    targetBrands: scopeDetails.targetBrands,
  };
}
