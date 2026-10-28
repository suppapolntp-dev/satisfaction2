"use client";

import { useState, useMemo } from "react";
import {
  BrandItem,
  RegionItem,
  ProvinceItem,
  BranchItem,
  HierarchyScopeLevel,
} from "@/Types/dataAccess";

export const MOCK_BRAND_HIERARCHY: BrandItem[] = [
  {
    id: "b-kfc",
    name: "KFC Thailand",
    code: "KFC",
    regions: [
      {
        id: "r-central",
        name: "Central Region",
        provinces: [
          {
            id: "p-bkk",
            name: "Bangkok",
            branches: [
              { id: "br-siam", code: "BKK-01", name: "Siam Paragon", kiosksCount: 4, csatScore: "95.5%" },
              { id: "br-ctw", code: "BKK-02", name: "CentralWorld", kiosksCount: 3, csatScore: "93.8%" },
              { id: "br-ladprao", code: "BKK-03", name: "Central Ladprao", kiosksCount: 2, csatScore: "96.1%" },
            ],
          },
          {
            id: "p-nbi",
            name: "Nonthaburi",
            branches: [
              { id: "br-westgate", code: "NBI-01", name: "Central Westgate", kiosksCount: 3, csatScore: "92.4%" },
            ],
          },
        ],
      },
      {
        id: "r-north",
        name: "Northern Region",
        provinces: [
          {
            id: "p-cmi",
            name: "Chiang Mai",
            branches: [
              { id: "br-cmi-fest", code: "CMI-01", name: "Central Festival Chiangmai", kiosksCount: 2, csatScore: "94.0%" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "b-misterdonut",
    name: "Mister Donut",
    code: "MDN",
    regions: [
      {
        id: "r-bkk-met",
        name: "Bangkok Metro",
        provinces: [
          {
            id: "p-bkk-2",
            name: "Bangkok",
            branches: [
              { id: "br-mbk", code: "MDN-01", name: "MBK Center", kiosksCount: 2, csatScore: "91.2%" },
              { id: "br-silom", code: "MDN-02", name: "Silom Complex", kiosksCount: 2, csatScore: "94.8%" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "b-auntieannes",
    name: "Auntie Anne's",
    code: "ANN",
    regions: [
      {
        id: "r-east",
        name: "Eastern Region",
        provinces: [
          {
            id: "p-chon",
            name: "Chonburi",
            branches: [
              { id: "br-pattaya", code: "PTY-01", name: "Central Pattaya Beach", kiosksCount: 2, csatScore: "96.7%" },
            ],
          },
        ],
      },
    ],
  },
];

export interface UseOrgTreeOptions {
  data?: BrandItem[];
  initialScopeLevel?: HierarchyScopeLevel;
}

export function useOrgTree(options: UseOrgTreeOptions = {}) {
  const brandHierarchy = options.data || MOCK_BRAND_HIERARCHY;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScopeLevel, setSelectedScopeLevel] = useState<HierarchyScopeLevel>(
    options.initialScopeLevel || "SUPER_ADMIN"
  );
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionItem | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceItem | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "b-kfc": true,
    "r-central": true,
    "p-bkk": true,
  });

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
