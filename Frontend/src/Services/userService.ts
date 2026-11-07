import { apiClient, isApiModeEnabled } from "./apiClient";
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

export const DEFAULT_DEV_USERS: UserModel[] = [
  {
    id: "usr-001",
    userCode: "SA-001",
    firstName: "System",
    lastName: "Administrator",
    email: "admin@satisfaction.local",
    phone: "081-234-5678",
    role: "Administrator",
    tierLevel: "Super Admin",
    brand: "All Brands (ทุกแบรนด์)",
    assignedBrands: ["Mister Donut", "KFC", "Ootoya", "Pepper Lunch", "Auntie Anne's", "Arigato"],
    region: "All Regions (ทุกภูมิภาค)",
    assignedRegions: ["ภาคกลาง", "ภาคเหนือ", "ภาคใต้", "ภาคตะวันออกเฉียงเหนือ", "ภาคตะวันออก"],
    branch: "All Branches (ทุกสาขา)",
    assignedBranches: ["Future Park Rangsit", "Siam Paragon", "Central World", "Mega Bangna", "Central Chiangmai"],
    status: "Active",
    createdDate: "2026-10-01",
  },
  {
    id: "usr-002",
    userCode: "BM-001",
    firstName: "Thanawat",
    lastName: "Suksomboon",
    email: "kfc.bm@satisfaction.local",
    phone: "082-345-6789",
    role: "Manager",
    tierLevel: "Brand Owner",
    brand: "KFC",
    assignedBrands: ["KFC"],
    region: "All Regions",
    branch: "12 สาขา",
    assignedBranches: ["Future Park Rangsit", "Siam Paragon", "Central World"],
    status: "Active",
    createdDate: "2026-10-05",
  },
  {
    id: "usr-003",
    userCode: "BM-002",
    firstName: "Nattaporn",
    lastName: "Kiatwongse",
    email: "donut.bm@satisfaction.local",
    phone: "083-456-7890",
    role: "Manager",
    tierLevel: "Brand Owner",
    brand: "Mister Donut",
    assignedBrands: ["Mister Donut"],
    region: "All Regions",
    branch: "15 สาขา",
    assignedBranches: ["Mega Bangna", "Central Rama 9"],
    status: "Active",
    createdDate: "2026-10-08",
  },
  {
    id: "usr-004",
    userCode: "RM-001",
    firstName: "Somchai",
    lastName: "Prasertying",
    email: "rm.central@satisfaction.local",
    phone: "084-567-8901",
    role: "Manager",
    tierLevel: "Regional Manager (RM)",
    brand: "Mister Donut, KFC",
    assignedBrands: ["Mister Donut", "KFC"],
    region: "ภาคกลาง",
    assignedRegions: ["ภาคกลาง"],
    province: "กรุงเทพมหานคร",
    assignedProvinces: ["กรุงเทพมหานคร", "นนทบุรี"],
    branch: "8 สาขา",
    assignedBranches: ["Siam Paragon", "Central World", "Mega Bangna"],
    status: "Active",
    createdDate: "2026-10-12",
  },
  {
    id: "usr-005",
    userCode: "AM-001",
    firstName: "Pimchanok",
    lastName: "Rattanasiri",
    email: "am.bkk@satisfaction.local",
    phone: "085-678-9012",
    role: "Manager",
    tierLevel: "Area Manager (AM)",
    brand: "KFC",
    assignedBrands: ["KFC"],
    region: "ภาคกลาง",
    province: "กรุงเทพมหานคร",
    branch: "Future Park Rangsit, Siam Paragon",
    assignedBranches: ["Future Park Rangsit", "Siam Paragon"],
    status: "Active",
    createdDate: "2026-10-15",
  },
  {
    id: "usr-006",
    userCode: "ST-001",
    firstName: "Apinya",
    lastName: "Srisuwan",
    email: "staff.futurepark@satisfaction.local",
    phone: "086-789-0123",
    role: "Agent",
    tierLevel: "Branch Staff",
    brand: "KFC",
    assignedBrands: ["KFC"],
    region: "ภาคกลาง",
    province: "ปทุมธานี",
    branch: "Future Park Rangsit",
    assignedBranches: ["Future Park Rangsit"],
    status: "Active",
    createdDate: "2026-10-20",
  },
  {
    id: "usr-007",
    userCode: "CS-001",
    firstName: "Kittisak",
    lastName: "Charoenphon",
    email: "custom.auditor@satisfaction.local",
    phone: "087-890-1234",
    role: "Auditor",
    tierLevel: "Custom Scope",
    brand: "KFC, Mister Donut, Ootoya",
    assignedBrands: ["KFC", "Mister Donut", "Ootoya"],
    region: "ภาคกลาง, ภาคเหนือ",
    branch: "4 สาขา",
    assignedBranches: ["Siam Paragon", "Central Chiangmai"],
    status: "Inactive",
    createdDate: "2026-10-22",
  },
];

export const userService = {
  // TODO: Connect API [get_users]
  async getUsers(): Promise<UserModel[]> {
    if (!isApiModeEnabled()) {
      return [];
    }
    try {
      const response = await apiClient.get<BackendUserDto[]>("/users");
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(mapBackendUserToModel);
      }
    } catch (error) {
      console.error("[userService.getUsers] error:", error);
    }
    // Fallback to dev test seed users when backend is offline or empty
    return DEFAULT_DEV_USERS;
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
    if (!isApiModeEnabled()) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        multiScopeUsers: 0,
        inactiveUsers: 0,
      };
    }
    try {
      const response = await apiClient.get<UserOverviewMetrics>("/users/metrics");
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("[userService.getUserMetrics] error:", error);
    }

    const total = DEFAULT_DEV_USERS.length;
    const active = DEFAULT_DEV_USERS.filter((u) => u.status === "Active").length;
    const multi = DEFAULT_DEV_USERS.filter(
      (u) =>
        (u.assignedBrands && u.assignedBrands.length > 1) ||
        (u.assignedBranches && u.assignedBranches.length > 1) ||
        u.tierLevel !== "Branch Staff"
    ).length;
    const inactive = total - active;

    return {
      totalUsers: total,
      activeUsers: active,
      multiScopeUsers: multi,
      inactiveUsers: inactive,
      totalChange: "+12% MoM",
      activeChange: "86% active rate",
      multiScopeChange: "Enterprise",
      inactiveChange: "1 inactive",
    };
  },
};
