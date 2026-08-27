import { apiClient } from "./apiClient";
import { SystemRoleItem, PermissionRow } from "@/Types/role";

export const SYSTEM_MODULES = [
  "Dashboard Analytics",
  "Brand Management",
  "Branch Management",
  "User Management",
  "Event Calendar",
  "Notification Triage",
  "Data Access Scope",
  "Audit Log & Diff",
  "System Settings",
];

export function generateDefaultMatrix(customMap: Record<string, Partial<PermissionRow>> = {}): PermissionRow[] {
  return SYSTEM_MODULES.map((moduleName) => ({
    module: moduleName,
    view: false,
    create: false,
    update: false,
    delete: false,
    export: false,
    ...customMap[moduleName],
  }));
}

export const roleService = {
  async getRoles(): Promise<SystemRoleItem[]> {
    try {
      const response = await apiClient.get<SystemRoleItem[]>("/roles");
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
    return [];
  },

  async getPermissionMatrix(roleId: string): Promise<PermissionRow[]> {
    try {
      const response = await apiClient.get<PermissionRow[]>(`/roles/${roleId}/permissions`);
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
    return generateDefaultMatrix();
  },

  async savePermissionMatrix(roleId: string, permissions: PermissionRow[]): Promise<boolean> {
    try {
      const response = await apiClient.put<boolean>(`/roles/${roleId}/permissions`, { permissions });
      if (response.success) {
        return true;
      }
    } catch {}

    return true;
  },

  async createRole(roleData: Omit<SystemRoleItem, "roleId" | "roleLastModified">): Promise<SystemRoleItem> {
    const newRole: SystemRoleItem = {
      ...roleData,
      roleId: `ROLE_${Date.now()}`,
      roleLastModified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    try {
      const response = await apiClient.post<SystemRoleItem>("/roles", newRole);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return newRole;
  },

  async updateRole(roleId: string, roleData: Partial<SystemRoleItem>): Promise<SystemRoleItem> {
    try {
      const response = await apiClient.put<SystemRoleItem>(`/roles/${roleId}`, roleData);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return {
      ...roleData,
      roleId,
      roleLastModified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    } as SystemRoleItem;
  },

  async deleteRole(roleId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/roles/${roleId}`);
      if (response.success) {
        return true;
      }
    } catch {}

    return true;
  },
};