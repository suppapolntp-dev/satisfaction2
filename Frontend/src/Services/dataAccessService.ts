import { apiClient } from "./apiClient";
import { 
  UserAccessRecord, 
  BrandItem, 
  HierarchyScopeLevel,
  BranchItem,
  ProvinceItem,
  RegionItem,
} from "@/Types/dataAccess";

export type { 
  UserAccessRecord, 
  BrandItem, 
  HierarchyScopeLevel,
  BranchItem,
  ProvinceItem,
  RegionItem,
};

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

export const dataAccessService = {
  async getDataAccessUsers(): Promise<UserAccessRecord[]> {
    try {
      const response = await apiClient.get<UserAccessRecord[]>("/data-access/users");
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
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
};
