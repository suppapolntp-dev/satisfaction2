export type HierarchyScopeLevel =
  | "SUPER_ADMIN"
  | "BRAND"
  | "REGION"
  | "PROVINCE"
  | "BRANCH"
  | "CUSTOM_SCOPE";

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  brandName?: string;
  kiosksCount?: number;
  csatScore?: string;
}

export interface ProvinceItem {
  id: string;
  name: string;
  regionName?: string;
  branches: BranchItem[];
}

export interface RegionItem {
  id: string;
  name: string;
  provinces: ProvinceItem[];
}

export interface BrandItem {
  id: string;
  name: string;
  code?: string;
  logoIcon?: string;
  regions: RegionItem[];
}

export interface CustomScopeGroup {
  id: string;
  name: string;
  description?: string;
  brands: string[];
  branches: string[];
  createdAt?: string;
}

export interface UserDataAccessRole {
  roleCode: string;
  tierLevel: HierarchyScopeLevel;
  allowedBrandIds?: string[];
  allowedBranchIds?: string[];
  canExport?: boolean;
  canManageScope?: boolean;
}

export interface UserAccessRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  tierLevel: string;
  assignedBrands: string[];
  assignedRegions: string[];
  assignedProvinces: string[];
  assignedBranches: string[];
  permissions: {
    canViewSuperAdminOverview: boolean;
    canViewBrandRegionalGrid: boolean;
    canViewRegionalProvinceGrid: boolean;
    canViewProvincialBranchGrid: boolean;
    canViewBranchKiosksGrid: boolean;
  };
  status: string;
}
