import { apiClient } from "./apiClient";
import { UserModel } from "@/Types/user";

export type { UserModel };

function mapBackendUserToModel(u: any): UserModel {
  const brandScopes = u.brandScopes || u.assignedBrands || [];
  const regionScopes = u.regionScopes || u.assignedRegions || [];
  const provinceScopes = u.provinceScopes || u.assignedProvinces || [];
  const branchScopes = u.branchScopes || u.assignedBranches || [];

  return {
    id: u.userCode || u.id,
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    email: u.email || "",
    phone: u.phone || "-",
    role: u.roleName || u.role || "Staff",
    brand: brandScopes.length > 0 ? brandScopes.join(", ") : u.brand || "ทุกแบรนด์",
    assignedBrands: brandScopes,
    region: regionScopes.length > 0 ? regionScopes.join(", ") : u.region || "-",
    assignedRegions: regionScopes,
    province: provinceScopes.length > 0 ? provinceScopes.join(", ") : u.province || "-",
    assignedProvinces: provinceScopes,
    branch: branchScopes.length > 0 ? branchScopes.join(", ") : u.branch || "-",
    assignedBranches: branchScopes,
    status: u.status === "Inactive" ? "Inactive" : "Active",
    tierLevel: typeof u.tierLevel === "number" 
      ? (["Super Admin", "Brand Owner", "Regional Manager (RM)", "Area Manager (AM)", "Branch Staff"][u.tierLevel - 1] || "Branch Staff")
      : u.tierLevel || "Branch Staff",
    createdDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("th-TH") : "-",
  };
}

export const userService = {
  async getUsers(): Promise<UserModel[]> {
    try {
      const response = await apiClient.get<any[]>("/users");
      if (response.success && Array.isArray(response.data)) {
        return response.data.map(mapBackendUserToModel);
      }
    } catch (err) {
      console.error("[userService.getUsers] error:", err);
    }
    return [];
  },

  async getUserById(id: string): Promise<UserModel | null> {
    try {
      const response = await apiClient.get<any>(`/users/${id}`);
      if (response.success && response.data) {
        return mapBackendUserToModel(response.data);
      }
    } catch (err) {
      console.error("[userService.getUserById] error:", err);
    }
    return null;
  },

  async createUser(userData: Omit<UserModel, "id"> & { id?: string; password?: string; roleId?: string }): Promise<UserModel> {
    const payload = {
      userCode: userData.id || `EMP-${String(Math.floor(100 + Math.random() * 900))}`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password || "Temp@123456",
      roleId: userData.roleId || "7b7f5d0c-03af-4f28-99b0-c824ddcdb342", // Default role
      tierLevel: userData.tierLevel || "Branch",
      isMfaEnabled: false,
      brandScopeIds: [],
      regionScopeIds: [],
      provinceScopeIds: [],
      branchScopeIds: [],
    };

    const response = await apiClient.post<any>("/users", payload);
    if (response.success && response.data) {
      return mapBackendUserToModel(response.data);
    }

    throw new Error(response.message || "ไม่สามารถสร้างผู้ใช้งานใหม่ได้");
  },

  async updateUser(id: string, userData: Partial<UserModel>): Promise<UserModel> {
    const response = await apiClient.put<any>(`/users/${id}`, userData);
    if (response.success && response.data) {
      return mapBackendUserToModel(response.data);
    }

    // Return fallback updated model if backend didn't return full entity
    return {
      ...userData,
      id,
    } as UserModel;
  },

  async deleteUser(id: string): Promise<boolean> {
    const response = await apiClient.delete<any>(`/users/${id}`);
    if (response.success) {
      return true;
    }
    throw new Error(response.message || "ไม่สามารถลบผู้ใช้งานได้");
  },
};
