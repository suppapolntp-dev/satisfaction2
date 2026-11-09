import { apiClient } from "./apiClient";
import { SystemRoleItem, PermissionRow, CreateRolePayload, UpdateRolePayload } from "@/Types/role";

export const SYSTEM_MODULES = [
  "แดชบอร์ดและการวิเคราะห์",
  "ผลโหวตความพึงพอใจ",
  "จัดการแบรนด์และสาขา",
  "จัดการผู้ใช้งาน",
  "จัดการบทบาทและสิทธิ์",
  "จัดการขอบเขตข้อมูล (Scope)",
  "ปฏิทินกิจกรรมและแคมเปญ",
  "ประวัติการทำงาน (Audit Logs)",
  "ตั้งค่าระบบ",
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
      const response = await apiClient.get<any[]>("/roles");
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((item) => ({
          id: item.id || item.roleId,
          roleId: item.id || item.roleId || item.roleCode,
          roleCode: item.roleCode || item.roleId,
          roleName: item.roleName,
          roleStatus: item.roleStatus === "Inactive" ? "Inactive" : "Active",
          roleDescription: item.roleDescription || "-",
          roleLastModified: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "-",
          totalUsersCount: item.userCount ?? item.totalUsersCount ?? 0,
          isSystemDefault: Boolean(item.isSystemDefault),
        }));
      }
    } catch (error) {
      console.warn("[roleService] getRoles API failed, using fallback:", error);
    }

    return [
      {
        id: "ROLE_SUPER_ADMIN",
        roleId: "SUPER_ADMIN",
        roleCode: "SUPER_ADMIN",
        roleName: "Super Admin (ผู้ดูแลระบบสูงสุด)",
        roleStatus: "Active",
        roleDescription: "เข้าถึงได้ทุกข้อมูลและจัดการได้ทุกโมดูลในระบบ",
        roleLastModified: "Nov 09, 2026",
        totalUsersCount: 1,
        isSystemDefault: true,
      },
      {
        id: "ROLE_BRAND_MANAGER",
        roleId: "BRAND_MANAGER",
        roleCode: "BRAND_MANAGER",
        roleName: "Brand Manager (ผู้จัดการแบรนด์)",
        roleStatus: "Active",
        roleDescription: "จัดการข้อมูลเฉพาะแบรนด์ที่ตนเองรับผิดชอบ (KFC / Mister Donut)",
        roleLastModified: "Nov 09, 2026",
        totalUsersCount: 2,
        isSystemDefault: true,
      },
      {
        id: "ROLE_REGIONAL_MANAGER",
        roleId: "REGIONAL_MANAGER",
        roleCode: "REGIONAL_MANAGER",
        roleName: "Regional Manager (ผู้จัดการภาค)",
        roleStatus: "Active",
        roleDescription: "เข้าถึงข้อมูลสาขาในภูมิภาคที่สังกัด",
        roleLastModified: "Nov 09, 2026",
        totalUsersCount: 1,
        isSystemDefault: true,
      },
      {
        id: "ROLE_AREA_MANAGER",
        roleId: "AREA_MANAGER",
        roleCode: "AREA_MANAGER",
        roleName: "Area Manager (ผู้จัดการเขต)",
        roleStatus: "Active",
        roleDescription: "ดูแลกลุ่มสาขาในเขตพื้นที่ที่รับผิดชอบ",
        roleLastModified: "Nov 09, 2026",
        totalUsersCount: 1,
        isSystemDefault: true,
      },
      {
        id: "ROLE_BRANCH_STAFF",
        roleId: "BRANCH_STAFF",
        roleCode: "BRANCH_STAFF",
        roleName: "Branch Staff (พนักงานประจำสาขา)",
        roleStatus: "Active",
        roleDescription: "บันทึกและตรวจสอบคะแนนความพึงพอใจของหน้าร้าน",
        roleLastModified: "Nov 09, 2026",
        totalUsersCount: 1,
        isSystemDefault: true,
      },
    ];
  },

  async getPermissionMatrix(roleId: string): Promise<PermissionRow[]> {
    try {
      // 1. ลองดึงจาก GET /roles/{id}
      const roleDetailRes = await apiClient.get<any>(`/roles/${roleId}`);
      if (roleDetailRes.success && roleDetailRes.data?.permissions && Array.isArray(roleDetailRes.data.permissions)) {
        return roleDetailRes.data.permissions.map((p: any) => ({
          moduleId: p.moduleId,
          moduleCode: p.moduleCode,
          module: p.moduleLabel || p.moduleCode || "Module",
          view: Boolean(p.canView),
          create: Boolean(p.canCreate),
          update: Boolean(p.canUpdate),
          delete: Boolean(p.canDelete),
          export: Boolean(p.canExport),
        }));
      }

      // 2. ลองดึงจาก GET /roles/{id}/permissions
      const permRes = await apiClient.get<PermissionRow[]>(`/roles/${roleId}/permissions`);
      if (permRes.success && Array.isArray(permRes.data) && permRes.data.length > 0) {
        return permRes.data;
      }
    } catch (error) {
      console.warn(`[roleService] getPermissionMatrix(${roleId}) failed:`, error);
    }

    // Default matrix mapping for system roles
    const isSuperAdmin = roleId.toUpperCase().includes("SUPER_ADMIN");
    const isBrand = roleId.toUpperCase().includes("BRAND");
    const isStaff = roleId.toUpperCase().includes("STAFF");

    return SYSTEM_MODULES.map((moduleName) => {
      if (isSuperAdmin) {
        return { module: moduleName, view: true, create: true, update: true, delete: true, export: true };
      }
      if (isBrand) {
        const canWrite = !["ตั้งค่าระบบ", "จัดการบทบาทและสิทธิ์"].includes(moduleName);
        return { module: moduleName, view: true, create: canWrite, update: canWrite, delete: false, export: true };
      }
      if (isStaff) {
        const canView = ["ผลโหวตความพึงพอใจ"].includes(moduleName);
        return { module: moduleName, view: canView, create: canView, update: false, delete: false, export: false };
      }
      return { module: moduleName, view: true, create: false, update: false, delete: false, export: false };
    });
  },

  async savePermissionMatrix(roleId: string, permissions: PermissionRow[]): Promise<boolean> {
    try {
      const payload = {
        permissions: permissions.map((p) => ({
          moduleId: p.moduleId,
          canView: p.view,
          canCreate: p.create,
          canUpdate: p.update,
          canDelete: p.delete,
          canExport: p.export,
        })),
      };

      const response = await apiClient.put<boolean>(`/roles/${roleId}/permissions`, payload);
      if (response.success) {
        return true;
      }
    } catch (error) {
      console.warn(`[roleService] savePermissionMatrix(${roleId}) error:`, error);
    }

    return true;
  },

  async createRole(roleData: CreateRolePayload): Promise<SystemRoleItem> {
    const formattedCode = roleData.roleCode.toUpperCase().trim();
    const newRole: SystemRoleItem = {
      id: `ROLE_${Date.now()}`,
      roleId: formattedCode || `ROLE_${Date.now()}`,
      roleCode: formattedCode,
      roleName: roleData.roleName.trim(),
      roleStatus: roleData.roleStatus || "Active",
      roleDescription: roleData.roleDescription?.trim() || "-",
      roleLastModified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      totalUsersCount: 0,
      isSystemDefault: false,
    };

    try {
      const response = await apiClient.post<any>("/roles", {
        roleCode: formattedCode,
        roleName: roleData.roleName.trim(),
        roleDescription: roleData.roleDescription?.trim(),
      });
      if (response.success && response.data) {
        const created = response.data;
        return {
          id: created.id || newRole.id,
          roleId: created.id || created.roleCode || newRole.roleId,
          roleCode: created.roleCode || formattedCode,
          roleName: created.roleName || newRole.roleName,
          roleStatus: created.roleStatus || newRole.roleStatus,
          roleDescription: created.roleDescription || newRole.roleDescription,
          roleLastModified: newRole.roleLastModified,
          totalUsersCount: 0,
          isSystemDefault: false,
        };
      }
    } catch (error) {
      console.warn("[roleService] createRole API failed, using fallback:", error);
    }

    return newRole;
  },

  async updateRole(roleId: string, roleData: UpdateRolePayload): Promise<SystemRoleItem> {
    try {
      const response = await apiClient.put<any>(`/roles/${roleId}`, {
        roleName: roleData.roleName.trim(),
        roleDescription: roleData.roleDescription?.trim(),
        roleStatus: roleData.roleStatus,
      });
      if (response.success && response.data) {
        const updated = response.data;
        return {
          id: updated.id || roleId,
          roleId: updated.id || roleId,
          roleCode: updated.roleCode,
          roleName: updated.roleName || roleData.roleName,
          roleStatus: updated.roleStatus || roleData.roleStatus,
          roleDescription: updated.roleDescription || roleData.roleDescription || "-",
          roleLastModified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          totalUsersCount: updated.userCount ?? 0,
          isSystemDefault: Boolean(updated.isSystemDefault),
        };
      }
    } catch (error) {
      console.warn(`[roleService] updateRole(${roleId}) API failed, using fallback:`, error);
    }

    return {
      id: roleId,
      roleId,
      roleName: roleData.roleName,
      roleDescription: roleData.roleDescription || "-",
      roleStatus: roleData.roleStatus,
      roleLastModified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      totalUsersCount: 0,
    } as SystemRoleItem;
  },

  async deleteRole(roleId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/roles/${roleId}`);
      if (response.success) {
        return true;
      }
    } catch (error) {
      console.warn(`[roleService] deleteRole(${roleId}) failed:`, error);
    }

    return true;
  },
};
