import { DashboardTierPermissions } from "@/Lib/dataAccessContext";

export interface UserModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  brand: string;
  assignedBrands?: string[];
  region?: string;
  assignedRegions?: string[];
  province?: string;
  assignedProvinces?: string[];
  branch: string;
  assignedBranches?: string[];
  status: "Active" | "Inactive";
  tierLevel?: string;
  createdDate?: string;
  permissions?: DashboardTierPermissions;
}

export interface EditableUserModel extends UserModel {}
export interface ImportedUserModel extends UserModel {}

