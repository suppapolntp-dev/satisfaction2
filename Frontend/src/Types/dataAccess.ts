import { DashboardTierPermissions } from "@/Lib/dataAccessContext";

export type HierarchyScopeLevel = "SUPER_ADMIN" | "BRAND" | "REGION" | "PROVINCE" | "BRANCH" | "CUSTOM_SCOPE";

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  brandName: string;
  kiosksCount: number;
  csatScore: string;
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
  logoIcon: string;
  regions: RegionItem[];
}

export interface CustomScopeGroup {
  id: string;
  name: string;
  description?: string;
  brands: string[];
  branches: string[];
  createdAt: string;
}

export interface UserAccessRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  tierLevel: "Super Admin" | "Brand Owner" | "Regional Manager (RM)" | "Area Manager (AM)" | "Branch Staff" | "Custom Scope" | string;
  assignedBrands: string[];
  assignedRegions: string[];
  assignedProvinces: string[];
  assignedBranches: string[];
  permissions: DashboardTierPermissions;
  status: "Active" | "Inactive";
  lastActiveDate?: string;
}
