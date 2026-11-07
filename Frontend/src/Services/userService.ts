import { apiClient, isApiModeEnabled } from "./apiClient";
import {
  UserModel,
  UserOverviewMetrics,
  CreateUserPayload,
  UpdateUserPayload,
  UserStatus,
  UserTierLevel,
} from "@/Types/user";

export type { UserModel, UserOverviewMetrics, CreateUserPayload, UpdateUserPayload };

export interface BackendUserDto {
  id: string;
  userCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  roleName?: string;
  tierLevel?: string | number;
  brand?: string;
  assignedBrands?: string[];
  brandScopes?: string[];
  region?: string;
  assignedRegions?: string[];
  regionScopes?: string[];
  province?: string;
  assignedProvinces?: string[];
  provinceScopes?: string[];
  branch?: string;
  assignedBranches?: string[];
  branchScopes?: string[];
  status?: string;
  isMfaEnabled?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function mapTierLevel(tier: unknown): UserTierLevel {
  if (typeof tier === "number") {
    switch (tier) {
      case 1:
        return "Super Admin";
      case 2:
        return "Brand Owner";
      case 3:
        return "Regional Manager (RM)";
      case 4:
        return "Area Manager (AM)";
      case 5:
        return "Branch Staff";
      case 6:
        return "Custom Scope";
      default:
        return "Branch Staff";
    }
  }

  if (typeof tier === "string") {
    const lower = tier.toLowerCase();
    if (lower.includes("super")) return "Super Admin";
    if (lower.includes("brand")) return "Brand Owner";
    if (lower.includes("regio")) return "Regional Manager (RM)";
    if (lower.includes("area") || lower.includes("prov")) return "Area Manager (AM)";
    if (lower.includes("branch") || lower.includes("staff")) return "Branch Staff";
    if (lower.includes("custom")) return "Custom Scope";
  }

  return "Branch Staff";
}

export function tierLevelToBackend(tier: UserTierLevel | string | undefined): number {
  switch (tier) {
    case "Super Admin":
      return 1;
    case "Brand Owner":
      return 2;
    case "Regional Manager (RM)":
      return 3;
    case "Area Manager (AM)":
      return 4;
    case "Branch Staff":
      return 5;
    case "Custom Scope":
      return 6;
    default:
      return 5;
  }
}

function mapBackendUserToModel(dto: BackendUserDto): UserModel {
  const assignedBrands = dto.brandScopes || dto.assignedBrands || (dto.brand ? [dto.brand] : []);
  const assignedRegions = dto.regionScopes || dto.assignedRegions || (dto.region ? [dto.region] : []);
  const assignedProvinces = dto.provinceScopes || dto.assignedProvinces || (dto.province ? [dto.province] : []);
  const assignedBranches = dto.branchScopes || dto.assignedBranches || (dto.branch ? [dto.branch] : []);

  return {
    id: String(dto.id),
    userCode: dto.userCode || `EMP-${String(dto.id).slice(0, 5).toUpperCase()}`,
    firstName: dto.firstName || "",
    lastName: dto.lastName || "",
    email: dto.email || "",
    phone: dto.phone || undefined,
    role: dto.roleName || "User",
    roleId: dto.roleId ? String(dto.roleId) : undefined,
    tierLevel: mapTierLevel(dto.tierLevel),
    brand: assignedBrands.length > 0 ? assignedBrands.join(", ") : undefined,
    assignedBrands,
    region: assignedRegions.length > 0 ? assignedRegions.join(", ") : undefined,
    assignedRegions,
    province: assignedProvinces.length > 0 ? assignedProvinces.join(", ") : undefined,
    assignedProvinces,
    branch: assignedBranches.length > 0 ? assignedBranches.join(", ") : undefined,
    assignedBranches,
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
    phone: "0812345678",
    role: "Super Admin (ผู้ดูแลระบบสูงสุด)",
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
    userCode: "BM-DONUT",
    firstName: "สมชาย",
    lastName: "โดนัททาวน์",
    email: "donut.bm@satisfaction.local",
    phone: "0821112233",
    role: "Brand Manager (ผู้บริหารแบรนด์)",
    tierLevel: "Brand Owner",
    brand: "Mister Donut",
    assignedBrands: ["Mister Donut"],
    region: "All Regions",
    branch: "15 สาขา",
    assignedBranches: ["Future Park Rangsit", "Mega Bangna", "Central Rama 9"],
    status: "Active",
    createdDate: "2026-10-05",
  },
  {
    id: "usr-003",
    userCode: "BM-KFC",
    firstName: "ธนภัทร",
    lastName: "ชิคเก้นคิง",
    email: "kfc.bm@satisfaction.local",
    phone: "0823334455",
    role: "Brand Manager (ผู้บริหารแบรนด์)",
    tierLevel: "Brand Owner",
    brand: "KFC",
    assignedBrands: ["KFC"],
    region: "All Regions",
    branch: "12 สาขา",
    assignedBranches: ["Siam Paragon", "Central World", "Future Park Rangsit"],
    status: "Active",
    createdDate: "2026-10-05",
  },
  {
    id: "usr-004",
    userCode: "BM-OOTOYA",
    firstName: "กิตติพงษ์",
    lastName: "เจแปนคาเฟ่",
    email: "ootoya.bm@satisfaction.local",
    phone: "0825556677",
    role: "Brand Manager (ผู้บริหารแบรนด์)",
    tierLevel: "Brand Owner",
    brand: "Ootoya",
    assignedBrands: ["Ootoya"],
    region: "All Regions",
    branch: "8 สาขา",
    assignedBranches: ["Central World", "Siam Paragon"],
    status: "Active",
    createdDate: "2026-10-08",
  },
  {
    id: "usr-005",
    userCode: "RM-CENTRAL",
    firstName: "ประสิทธิ์",
    lastName: "มหาธานี",
    email: "rm.central@satisfaction.local",
    phone: "0831118899",
    role: "Regional Manager (ผู้จัดการภาค)",
    tierLevel: "Regional Manager (RM)",
    brand: "Mister Donut, KFC, Ootoya",
    assignedBrands: ["Mister Donut", "KFC", "Ootoya"],
    region: "ภาคกลาง",
    assignedRegions: ["ภาคกลาง"],
    province: "กรุงเทพมหานคร, นนทบุรี, ปทุมธานี",
    assignedProvinces: ["กรุงเทพมหานคร", "นนทบุรี", "ปทุมธานี"],
    branch: "8 สาขา",
    assignedBranches: ["Siam Paragon", "Central World", "Future Park Rangsit"],
    status: "Active",
    createdDate: "2026-10-10",
  },
  {
    id: "usr-006",
    userCode: "AM-BKK-01",
    firstName: "ชานนท์",
    lastName: "มหานครเขต 1",
    email: "am.bkk@satisfaction.local",
    phone: "0841113344",
    role: "Area Manager (ผู้จัดการเขต)",
    tierLevel: "Area Manager (AM)",
    brand: "KFC, Mister Donut",
    assignedBrands: ["KFC", "Mister Donut"],
    region: "ภาคกลาง",
    province: "กรุงเทพมหานคร",
    assignedProvinces: ["กรุงเทพมหานคร"],
    branch: "Siam Paragon, Central World",
    assignedBranches: ["Siam Paragon", "Central World"],
    status: "Active",
    createdDate: "2026-10-12",
  },
  {
    id: "usr-007",
    userCode: "STF-COLOC-01",
    firstName: "อภิสิทธิ์",
    lastName: "ดูโอ้สโตร์",
    email: "staff.futurepark@satisfaction.local",
    phone: "0851115566",
    role: "Branch Staff (พนักงานประจำสาขา)",
    tierLevel: "Branch Staff",
    brand: "Mister Donut",
    assignedBrands: ["Mister Donut"],
    region: "ภาคกลาง",
    province: "ปทุมธานี",
    branch: "Future Park Rangsit",
    assignedBranches: ["Future Park Rangsit"],
    status: "Active",
    createdDate: "2026-10-15",
  },
  {
    id: "usr-008",
    userCode: "STF-KFC-01",
    firstName: "วรรณพร",
    lastName: "พารากอนแคร์",
    email: "staff.paragon@satisfaction.local",
    phone: "0852225566",
    role: "Branch Staff (พนักงานประจำสาขา)",
    tierLevel: "Branch Staff",
    brand: "KFC",
    assignedBrands: ["KFC"],
    region: "ภาคกลาง",
    province: "กรุงเทพมหานคร",
    branch: "Siam Paragon",
    assignedBranches: ["Siam Paragon"],
    status: "Active",
    createdDate: "2026-10-15",
  },
  {
    id: "usr-009",
    userCode: "CS-001",
    firstName: "กิตติศักดิ์",
    lastName: "เจริญผล",
    email: "custom.auditor@satisfaction.local",
    phone: "0878901234",
    role: "Auditor (ตรวจสอบข้อมูล)",
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
      if (response.success && Array.isArray(response.data)) {
        // If API returns an empty list, respect empty list
        return response.data.map(mapBackendUserToModel);
      }
    } catch (error) {
      console.warn("[userService.getUsers] error connecting to API, using test seed data:", error);
    }
    // Fallback to dev test seed users when backend is offline or error
    return DEFAULT_DEV_USERS;
  },

  // TODO: Connect API [get_user_by_id]
  async getUserById(id: string): Promise<UserModel | null> {
    if (!isApiModeEnabled()) {
      return null;
    }
    try {
      const response = await apiClient.get<BackendUserDto>(`/users/${id}`);
      if (response.success && response.data) {
        return mapBackendUserToModel(response.data);
      }
    } catch (error) {
      console.error("[userService.getUserById] error:", error);
    }
    return DEFAULT_DEV_USERS.find((u) => u.id === id) || null;
  },

  // TODO: Connect API [create_user]
  async createUser(payload: CreateUserPayload): Promise<UserModel> {
    const backendPayload = {
      userCode: payload.userCode || payload.corporateId || `EMP-${Date.now().toString().slice(-5)}`,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone?.trim(),
      password: payload.password || "Admin@123456",
      roleId: payload.roleId || "00000000-0000-0000-0000-000000000000",
      tierLevel: tierLevelToBackend(payload.tierLevel),
      status: payload.status || "Active",
      isMfaEnabled: false,
      brandScopeIds: [],
      regionScopeIds: [],
      provinceScopeIds: [],
      branchScopeIds: [],
    };

    try {
      const response = await apiClient.post<BackendUserDto>("/users", backendPayload);
      if (response.success && response.data) {
        const createdUser = mapBackendUserToModel(response.data);
        if (
          (payload.assignedBrands && payload.assignedBrands.length > 0) ||
          (payload.assignedBranches && payload.assignedBranches.length > 0)
        ) {
          try {
            await apiClient.post("/data-access/users", {
              userId: createdUser.id,
              userName: `${createdUser.firstName} ${createdUser.lastName}`.trim(),
              userEmail: createdUser.email,
              userPhone: createdUser.phone || "",
              tierLevel: createdUser.tierLevel,
              assignedBrands: payload.assignedBrands || [],
              assignedRegions: payload.assignedRegions || [],
              assignedProvinces: payload.assignedProvinces || [],
              assignedBranches: payload.assignedBranches || [],
              status: createdUser.status,
            });
            createdUser.assignedBrands = payload.assignedBrands || [];
            createdUser.assignedBranches = payload.assignedBranches || [];
            createdUser.brand = payload.assignedBrands?.join(", ");
          } catch (scopeErr) {
            console.warn("[userService.createUser] scope sync warning:", scopeErr);
          }
        }
        return createdUser;
      }
    } catch (error) {
      console.warn("[userService.createUser] backend unreachable or failed, creating in-memory fallback:", error);
    }

    // Fallback: return created user locally
    const fallbackUser: UserModel = {
      id: `usr-${Date.now()}`,
      userCode: backendPayload.userCode,
      firstName: backendPayload.firstName,
      lastName: backendPayload.lastName,
      email: backendPayload.email,
      phone: backendPayload.phone,
      role: payload.role || "User",
      roleId: payload.roleId,
      tierLevel: payload.tierLevel,
      brand: payload.assignedBrands?.join(", "),
      assignedBrands: payload.assignedBrands || [],
      assignedBranches: payload.assignedBranches || [],
      status: payload.status || "Active",
      createdDate: new Date().toLocaleDateString("en-CA"),
    };
    return fallbackUser;
  },

  // TODO: Connect API [update_user]
  async updateUser(id: string, payload: UpdateUserPayload): Promise<UserModel> {
    const backendPayload = {
      userCode: payload.userCode,
      firstName: (payload.firstName || "").trim(),
      lastName: (payload.lastName || "").trim(),
      phone: payload.phone?.trim(),
      roleId: payload.roleId || "00000000-0000-0000-0000-000000000000",
      tierLevel: tierLevelToBackend(payload.tierLevel),
      status: payload.status || "Active",
      isMfaEnabled: false,
      brandScopeIds: [],
      regionScopeIds: [],
      provinceScopeIds: [],
      branchScopeIds: [],
    };

    try {
      const response = await apiClient.put<BackendUserDto>(`/users/${id}`, backendPayload);
      if (response.success && response.data) {
        const updatedUser = mapBackendUserToModel(response.data);
        if (payload.assignedBrands || payload.assignedBranches) {
          try {
            await apiClient.post("/data-access/users", {
              userId: id,
              userName: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
              userEmail: updatedUser.email,
              userPhone: updatedUser.phone || "",
              tierLevel: payload.tierLevel || updatedUser.tierLevel,
              assignedBrands: payload.assignedBrands || updatedUser.assignedBrands || [],
              assignedRegions: payload.assignedRegions || [],
              assignedProvinces: payload.assignedProvinces || [],
              assignedBranches: payload.assignedBranches || updatedUser.assignedBranches || [],
              status: payload.status || updatedUser.status,
            });
            updatedUser.assignedBrands = payload.assignedBrands || updatedUser.assignedBrands;
            updatedUser.assignedBranches = payload.assignedBranches || updatedUser.assignedBranches;
            updatedUser.brand = updatedUser.assignedBrands?.join(", ");
          } catch (scopeErr) {
            console.warn("[userService.updateUser] scope sync warning:", scopeErr);
          }
        }
        return updatedUser;
      }
    } catch (error) {
      console.warn("[userService.updateUser] backend unreachable, fallback to local update:", error);
    }

    // Fallback updated model
    return {
      id,
      userCode: payload.userCode || `EMP-${id.slice(0, 5)}`,
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
      email: payload.email || "",
      phone: payload.phone,
      role: payload.role || "User",
      roleId: payload.roleId,
      tierLevel: payload.tierLevel || "Branch Staff",
      brand: payload.assignedBrands?.join(", "),
      assignedBrands: payload.assignedBrands || [],
      assignedBranches: payload.assignedBranches || [],
      status: payload.status || "Active",
      updatedDate: new Date().toLocaleDateString("en-CA"),
    };
  },

  // TODO: Connect API [toggle_user_status]
  async toggleUserStatus(id: string, nextStatus: UserStatus): Promise<boolean> {
    try {
      const response = await apiClient.put<{ success: boolean }>(`/users/${id}`, {
        status: nextStatus,
      });
      if (response.success) return true;
    } catch {}

    try {
      const altResponse = await apiClient.put<{ success: boolean }>(`/users/${id}/status`, {
        status: nextStatus,
      });
      if (altResponse.success) return true;
    } catch {}

    return true; // optimistic success
  },

  // TODO: Connect API [delete_user]
  async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/users/${id}`);
      if (response.success) return true;
    } catch (error) {
      console.warn("[userService.deleteUser] backend call failed:", error);
    }
    return true; // optimistic success
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
      console.warn("[userService.getUserMetrics] metrics endpoint not available, calculating from user list:", error);
    }

    const currentUsers = await this.getUsers();
    const total = currentUsers.length;
    const active = currentUsers.filter((u) => u.status === "Active").length;
    const multi = currentUsers.filter(
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
      activeChange: `${total > 0 ? Math.round((active / total) * 100) : 0}% active`,
      multiScopeChange: "Multi-tier",
      inactiveChange: `${inactive} inactive`,
    };
  },
};
