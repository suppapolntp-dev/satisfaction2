import { apiClient } from "./apiClient";
import { 
  UserAccessRecord, 
  BrandItem, 
  HierarchyScopeLevel,
  BranchItem,
  ProvinceItem,
  RegionItem,
} from "@/Types/dataAccess";
import { BrandModel } from "@/Types/brand";
import { BranchModel } from "@/Types/branch";
import { brandService } from "./brandService";
import { branchService } from "./branchService";

export type { 
  UserAccessRecord, 
  BrandItem, 
  HierarchyScopeLevel,
  BranchItem,
  ProvinceItem,
  RegionItem,
};

export function buildHierarchyTree(brands: BrandModel[], branches: BranchModel[]): BrandItem[] {
  if (!brands || brands.length === 0) return [];
  return brands.map((b, bIdx) => {
    const relatedBranches = (branches || []).filter(
      (br) =>
        (Boolean(br.brand) && br.brand.includes(b.brandName)) ||
        (br.brands && br.brands.includes(b.brandName))
    );

    // Group by region
    const regionsMap = new Map<string, BranchModel[]>();
    relatedBranches.forEach((br) => {
      const reg = br.region || "ภูมิภาคทั่วไป";
      if (!regionsMap.has(reg)) regionsMap.set(reg, []);
      regionsMap.get(reg)!.push(br);
    });

    const regionsList: RegionItem[] = Array.from(regionsMap.entries()).map(([regName, regBranches], rIdx) => {
      // Group by province
      const provMap = new Map<string, BranchModel[]>();
      regBranches.forEach((br) => {
        const prov = br.province || "จังหวัดทั่วไป";
        if (!provMap.has(prov)) provMap.set(prov, []);
        provMap.get(prov)!.push(br);
      });

      const provincesList: ProvinceItem[] = Array.from(provMap.entries()).map(([provName, provBranches], pIdx) => ({
        id: `PRV_${bIdx}_${rIdx}_${pIdx}`,
        name: provName,
        branches: provBranches.map((br) => ({
          id: br.id,
          code: br.code,
          name: br.name,
          brandName: br.brand,
          kiosksCount: br.kioskCount || 1,
          csatScore: br.satisfaction ? `${br.satisfaction}%` : "-",
        })),
      }));

      return {
        id: `REG_${bIdx}_${rIdx}`,
        name: regName,
        provinces: provincesList,
      };
    });

    return {
      id: b.id,
      code: b.brandId || b.brandName.slice(0, 3).toUpperCase(),
      name: b.brandName,
      regions: regionsList,
    };
  });
}

import { DEFAULT_DEV_BRANDS } from "./brandService";
import { DEFAULT_DEV_BRANCHES } from "./branchService";

export const DEFAULT_HIERARCHY_TREE: BrandItem[] = buildHierarchyTree(
  DEFAULT_DEV_BRANDS,
  DEFAULT_DEV_BRANCHES
);

export function computePermissionsByTier(tier: string) {
  switch (tier) {
    case "Super Admin":
      return {
        canViewSuperAdminOverview: true,
        canViewBrandRegionalGrid: true,
        canViewRegionalProvinceGrid: true,
        canViewProvincialBranchGrid: true,
        canViewBranchKiosksGrid: true,
      };
    case "Brand Owner":
      return {
        canViewSuperAdminOverview: false,
        canViewBrandRegionalGrid: true,
        canViewRegionalProvinceGrid: true,
        canViewProvincialBranchGrid: true,
        canViewBranchKiosksGrid: true,
      };
    case "Regional Manager (RM)":
      return {
        canViewSuperAdminOverview: false,
        canViewBrandRegionalGrid: false,
        canViewRegionalProvinceGrid: true,
        canViewProvincialBranchGrid: true,
        canViewBranchKiosksGrid: true,
      };
    case "Area Manager (AM)":
      return {
        canViewSuperAdminOverview: false,
        canViewBrandRegionalGrid: false,
        canViewRegionalProvinceGrid: false,
        canViewProvincialBranchGrid: true,
        canViewBranchKiosksGrid: true,
      };
    case "Branch Staff":
    default:
      return {
        canViewSuperAdminOverview: false,
        canViewBrandRegionalGrid: false,
        canViewRegionalProvinceGrid: false,
        canViewProvincialBranchGrid: false,
        canViewBranchKiosksGrid: true,
      };
  }
}

import { userService } from "./userService";

export const dataAccessService = {
  async getDataAccessUsers(): Promise<UserAccessRecord[]> {
    try {
      const users = await userService.getUsers();
      if (users && users.length > 0) {
        return users.map((u) => ({
          id: u.id,
          userId: u.id,
          userName: `${u.firstName} ${u.lastName}`.trim() || u.id,
          userEmail: u.email,
          userPhone: u.phone,
          tierLevel: u.tierLevel || "Branch Staff",
          assignedBrands: u.assignedBrands && u.assignedBrands.length > 0 ? u.assignedBrands : (u.brand && u.brand !== "ทุกแบรนด์" ? [u.brand] : []),
          assignedRegions: u.assignedRegions && u.assignedRegions.length > 0 ? u.assignedRegions : (u.region && u.region !== "-" ? [u.region] : []),
          assignedProvinces: u.assignedProvinces && u.assignedProvinces.length > 0 ? u.assignedProvinces : (u.province && u.province !== "-" ? [u.province] : []),
          assignedBranches: u.assignedBranches && u.assignedBranches.length > 0 ? u.assignedBranches : (u.branch && u.branch !== "-" ? [u.branch] : []),
          permissions: computePermissionsByTier(u.tierLevel || "Branch Staff"),
          status: u.status,
        }));
      }
    } catch (err) {
      console.error("[dataAccessService.getDataAccessUsers] error:", err);
    }
    return [];
  },

  async saveDataAccessUser(userData: Omit<UserAccessRecord, "id" | "permissions"> & { id?: string }): Promise<UserAccessRecord> {
    const permissions = computePermissionsByTier(userData.tierLevel);
    const accessRecord: UserAccessRecord = {
      ...userData,
      id: userData.id || `ACC-${Date.now()}`,
      permissions,
    };

    try {
      const response = await apiClient.post<UserAccessRecord>("/data-access/users", accessRecord);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return accessRecord;
  },

  async deleteDataAccessUser(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/data-access/users/${id}`);
      if (response.success) {
        return true;
      }
    } catch {}

    return true;
  },

  async getHierarchyTree(): Promise<BrandItem[]> {
    try {
      const response = await apiClient.get<BrandItem[]>("/organization/hierarchy");
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {}

    try {
      const [brands, branches] = await Promise.all([
        brandService.getBrands(),
        branchService.getBranches(),
      ]);
      return buildHierarchyTree(brands, branches);
    } catch (err) {
      console.error("[dataAccessService.getHierarchyTree] error:", err);
      return [];
    }
  },
};
