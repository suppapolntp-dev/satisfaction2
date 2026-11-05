export type UserTierLevel =
  | "Super Admin"
  | "Brand Owner"
  | "Regional Manager (RM)"
  | "Area Manager (AM)"
  | "Branch Staff"
  | "Custom Scope";

export type UserStatus = "Active" | "Inactive";

export interface UserModel {
  id: string;
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  roleId?: string;
  tierLevel: UserTierLevel;
  brand?: string;
  assignedBrands?: string[];
  region?: string;
  assignedRegions?: string[];
  province?: string;
  assignedProvinces?: string[];
  branch?: string;
  assignedBranches?: string[];
  status: UserStatus;
  lastLoginAt?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface UserOverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  multiScopeUsers: number;
  inactiveUsers: number;
  totalChange?: string;
  activeChange?: string;
  multiScopeChange?: string;
  inactiveChange?: string;
}

export interface CreateUserPayload {
  userCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  roleId?: string;
  role: string;
  tierLevel: UserTierLevel;
  assignedBrands?: string[];
  assignedRegions?: string[];
  assignedProvinces?: string[];
  assignedBranches?: string[];
  status?: UserStatus;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  id: string;
}
