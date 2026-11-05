import { apiClient } from "./apiClient";
import {
  UserModel,
  UserOverviewMetrics,
  CreateUserPayload,
  UpdateUserPayload,
  UserStatus,
} from "@/Types/user";

export type { UserModel, UserOverviewMetrics, CreateUserPayload, UpdateUserPayload };

interface BackendUserDto {
  id: string;
  userCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  roleName?: string;
  tierLevel?: string;
  brand?: string;
  assignedBrands?: string[];
  region?: string;
  assignedRegions?: string[];
  province?: string;
  assignedProvinces?: string[];
  branch?: string;
  assignedBranches?: string[];
  status?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

function mapBackendUserToModel(dto: BackendUserDto): UserModel {
  const rawTier = dto.tierLevel || "Branch Staff";
  const validTier: UserModel["tierLevel"] =
    rawTier === "Super Admin" ||
    rawTier === "Brand Owner" ||
    rawTier === "Regional Manager (RM)" ||
    rawTier === "Area Manager (AM)" ||
    rawTier === "Branch Staff" ||
    rawTier === "Custom Scope"
      ? rawTier
      : "Branch Staff";

  return {
    id: dto.id,
    userCode: dto.userCode || `EMP-${dto.id.slice(0, 5).toUpperCase()}`,
    firstName: dto.firstName || "",
    lastName: dto.lastName || "",
    email: dto.email || "",
    phone: dto.phone || undefined,
    role: dto.roleName || "User",
    roleId: dto.roleId,
    tierLevel: validTier,
    brand: dto.brand,
    assignedBrands: dto.assignedBrands || (dto.brand ? [dto.brand] : []),
    region: dto.region,
    assignedRegions: dto.assignedRegions || (dto.region ? [dto.region] : []),
    province: dto.province,
    assignedProvinces: dto.assignedProvinces || (dto.province ? [dto.province] : []),
    branch: dto.branch,
    assignedBranches: dto.assignedBranches || (dto.branch ? [dto.branch] : []),
    status: dto.status === "Inactive" ? "Inactive" : "Active",
    lastLoginAt: dto.lastLoginAt,
    createdDate: dto.createdAt ? new Date(dto.createdAt).toLocaleDateString("en-CA") : undefined,
    updatedDate: dto.updatedAt ? new Date(dto.updatedAt).toLocaleDateString("en-CA") : undefined,
  };
}

export const userService = {
  // TODO: Connect API [get_users]
  async getUsers(): Promise<UserModel[]> {
    try {
      const response = await apiClient.get<BackendUserDto[]>("/users");
      if (response.success && Array.isArray(response.data)) {
        return response.data.map(mapBackendUserToModel);
      }
    } catch (error) {
      console.error("[userService.getUsers] error:", error);
    }
    return [];
  },

  // TODO: Connect API [get_user_by_id]
  async getUserById(id: string): Promise<UserModel | null> {
    try {
      const response = await apiClient.get<BackendUserDto>(`/users/${id}`);
      if (response.success && response.data) {
        return mapBackendUserToModel(response.data);
      }
    } catch (error) {
      console.error("[userService.getUserById] error:", error);
    }
    return null;
  },

  // TODO: Connect API [create_user]
  async createUser(payload: CreateUserPayload): Promise<UserModel> {
    const response = await apiClient.post<BackendUserDto>("/users", payload);
    if (response.success && response.data) {
      return mapBackendUserToModel(response.data);
    }
    throw new Error(response.message || "Failed to create user");
  },

  // TODO: Connect API [update_user]
  async updateUser(id: string, payload: UpdateUserPayload): Promise<UserModel> {
    const response = await apiClient.put<BackendUserDto>(`/users/${id}`, payload);
    if (response.success && response.data) {
      return mapBackendUserToModel(response.data);
    }
    throw new Error(response.message || "Failed to update user");
  },

  // TODO: Connect API [toggle_user_status]
  async toggleUserStatus(id: string, nextStatus: UserStatus): Promise<boolean> {
    const response = await apiClient.put<{ id: string; status: string }>(`/users/${id}/status`, {
      status: nextStatus,
    });
    return response.success;
  },

  // TODO: Connect API [delete_user]
  async deleteUser(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/users/${id}`);
    return response.success;
  },

  // TODO: Connect API [get_user_metrics]
  async getUserMetrics(): Promise<UserOverviewMetrics> {
    try {
      const response = await apiClient.get<UserOverviewMetrics>("/users/metrics");
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("[userService.getUserMetrics] error:", error);
    }

    return {
      totalUsers: 0,
      activeUsers: 0,
      multiScopeUsers: 0,
      inactiveUsers: 0,
    };
  },
};
