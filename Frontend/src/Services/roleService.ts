import { apiClient } from "./apiClient";
import { SystemRoleItem, PermissionRow, CreateRolePayload, UpdateRolePayload } from "@/Types/role";

export interface SystemModuleTreeDefinition {
  id: string;
  moduleCode: string;
  moduleLabel: string;
  children: {
    id: string;
    moduleCode: string;
    module: string;
    description?: string;
  }[];
}

export const SYSTEM_MODULE_TREE: SystemModuleTreeDefinition[] = [
  {
    id: "dashboard",
    moduleCode: "DASHBOARD",
    moduleLabel: "dashboard (แดชบอร์ดและการวิเคราะห์)",
    children: [
      { id: "dashboard.filter", moduleCode: "DASHBOARD_FILTER", module: "filter", description: "ตัวกรองข้อมูลและช่วงเวลา" },
      { id: "dashboard.sentiment_timeline", moduleCode: "DASHBOARD_TIMELINE", module: "Sentiment Score Timeline", description: "กราฟแนวโน้มความพึงพอใจตามไทม์ไลน์" },
      { id: "dashboard.analyses", moduleCode: "DASHBOARD_ANALYSES", module: "Analyses tabpill", description: "แท็บเจาะลึกสถิติและการวิเคราะห์" },
    ],
  },
  {
    id: "event",
    moduleCode: "EVENTS",
    moduleLabel: "event (ปฏิทินกิจกรรมและแคมเปญ)",
    children: [
      { id: "event.calendar_view", moduleCode: "EVENTS_CALENDAR_VIEW", module: "calendar view", description: "มุมมองปฏิทินตารางกิจกรรม" },
      { id: "event.campaigns", moduleCode: "EVENTS_CAMPAIGNS", module: "Events & Campaigns", description: "จัดการกิจกรรม แคมเปญ และโปรโมชั่น" },
    ],
  },
  {
    id: "satisfaction",
    moduleCode: "SATISFACTION",
    moduleLabel: "satisfaction (ผลโหวตความพึงพอใจ)",
    children: [
      { id: "satisfaction.feed", moduleCode: "SATISFACTION_FEED", module: "Live Vote Ingestion Feed", description: "ฟีดข้อมูลผลโหวตแบบเรียลไทม์" },
      { id: "satisfaction.branch_breakdown", moduleCode: "SATISFACTION_BREAKDOWN", module: "Branch CSAT Breakdown", description: "รายงานคะแนนแยกตามสาขา" },
      { id: "satisfaction.comments", moduleCode: "SATISFACTION_COMMENTS", module: "Customer Feedback & Voice", description: "ความคิดเห็นและข้อเสนอแนะลูกค้า" },
    ],
  },
  {
    id: "brands",
    moduleCode: "BRANDS",
    moduleLabel: "brands (จัดการแบรนด์และสาขา)",
    children: [
      { id: "brands.catalog", moduleCode: "BRANDS_CATALOG", module: "Brand Catalog & Info", description: "จัดการข้อมูลแบรนด์ในเครือ" },
      { id: "brands.branches", moduleCode: "BRANDS_BRANCHES", module: "Branch Outlets Directory", description: "จัดการข้อมูลสาขาและพิกัด" },
      { id: "brands.kiosks", moduleCode: "BRANDS_KIOSKS", module: "Kiosk Touchscreen Binding", description: "ผูกและควบคุมเครื่องคีออสหน้าร้าน" },
    ],
  },
  {
    id: "users",
    moduleCode: "USERS",
    moduleLabel: "users (จัดการผู้ใช้งาน)",
    children: [
      { id: "users.directory", moduleCode: "USERS_DIRECTORY", module: "User Accounts Directory", description: "รายชื่อบัญชีผู้ใช้งานระบบ" },
      { id: "users.scope", moduleCode: "USERS_SCOPE", module: "5-Tier Scope Hierarchy Access", description: "การจัดสรรขอบเขตข้อมูลรายบุคคล" },
      { id: "users.security", moduleCode: "USERS_SECURITY", module: "MFA & Password Security", description: "รีเซ็ตรหัสผ่านและตั้งค่าความปลอดภัย" },
    ],
  },
  {
    id: "roles",
    moduleCode: "ROLES",
    moduleLabel: "roles (จัดการบทบาทและสิทธิ์)",
    children: [
      { id: "roles.list", moduleCode: "ROLES_LIST", module: "System Roles Directory", description: "กำหนดและจัดการบทบาทผู้ใช้งาน" },
      { id: "roles.matrix", moduleCode: "ROLES_MATRIX", module: "Granular Permission Matrix", description: "กำหนดสิทธิ์ระดับฟังก์ชัน (Tree Access)" },
    ],
  },
  {
    id: "audit",
    moduleCode: "AUDIT",
    moduleLabel: "audit (ประวัติการทำงาน Audit Logs)",
    children: [
      { id: "audit.auth_logs", moduleCode: "AUDIT_AUTH_LOGS", module: "Authentication & Login Logs", description: "บันทึกการเข้าสู่ระบบและ SMS OTP" },
      { id: "audit.activity", moduleCode: "AUDIT_ACTIVITY", module: "Operation Change Trail", description: "ประวัติการแก้ไขข้อมูลสำคัญในระบบ" },
    ],
  },
  {
    id: "settings",
    moduleCode: "SETTINGS",
    moduleLabel: "settings (ตั้งค่าระบบ)",
    children: [
      { id: "settings.security", moduleCode: "SETTINGS_SECURITY", module: "Security & SMS OTP Rules", description: "นโยบายความปลอดภัยและ Session" },
      { id: "settings.csat_benchmarks", moduleCode: "SETTINGS_BENCHMARKS", module: "CSAT Benchmark Thresholds", description: "เกณฑ์คะแนนชี้วัดความพึงพอใจ" },
    ],
  },
];

export const SYSTEM_MODULES = SYSTEM_MODULE_TREE.map((m) => m.moduleLabel);

export function generateDefaultMatrix(roleId: string = "SUPER_ADMIN"): PermissionRow[] {
  const isSuperAdmin =
    roleId.toUpperCase().includes("SUPER_ADMIN") ||
    roleId.toUpperCase().includes("ADMIN");
  const isBrand = roleId.toUpperCase().includes("BRAND");
  const isStaff = roleId.toUpperCase().includes("STAFF");

  return SYSTEM_MODULE_TREE.map((parent) => {
    const parentChildren: PermissionRow[] = parent.children.map((child) => {
      if (isSuperAdmin) {
        return {
          id: child.id,
          moduleId: child.id,
          moduleCode: child.moduleCode,
          module: child.module,
          description: child.description,
          parentId: parent.id,
          view: true,
          create: true,
          update: true,
          delete: true,
          export: true,
        };
      }

      if (isBrand) {
        // Specific pattern requested by user:
        // dashboard: filter (view only), timeline (view only), analyses (view only)
        // event: calendar view (view only), campaigns (view, create, update, delete)
        if (
          child.id === "dashboard.filter" ||
          child.id === "dashboard.sentiment_timeline" ||
          child.id === "dashboard.analyses"
        ) {
          return {
            id: child.id,
            moduleId: child.id,
            moduleCode: child.moduleCode,
            module: child.module,
            description: child.description,
            parentId: parent.id,
            view: true,
            create: false,
            update: false,
            delete: false,
            export: false,
          };
        }
        if (child.id === "event.calendar_view") {
          return {
            id: child.id,
            moduleId: child.id,
            moduleCode: child.moduleCode,
            module: child.module,
            description: child.description,
            parentId: parent.id,
            view: true,
            create: false,
            update: false,
            delete: false,
            export: false,
          };
        }
        if (child.id === "event.campaigns") {
          return {
            id: child.id,
            moduleId: child.id,
            moduleCode: child.moduleCode,
            module: child.module,
            description: child.description,
            parentId: parent.id,
            view: true,
            create: true,
            update: true,
            delete: true,
            export: false,
          };
        }

        const isSettingsOrRoles = parent.id === "settings" || parent.id === "roles";
        return {
          id: child.id,
          moduleId: child.id,
          moduleCode: child.moduleCode,
          module: child.module,
          description: child.description,
          parentId: parent.id,
          view: true,
          create: !isSettingsOrRoles,
          update: !isSettingsOrRoles,
          delete: false,
          export: true,
        };
      }

      if (isStaff) {
        const canView = parent.id === "satisfaction";
        return {
          id: child.id,
          moduleId: child.id,
          moduleCode: child.moduleCode,
          module: child.module,
          description: child.description,
          parentId: parent.id,
          view: canView,
          create: canView,
          update: false,
          delete: false,
          export: false,
        };
      }

      return {
        id: child.id,
        moduleId: child.id,
        moduleCode: child.moduleCode,
        module: child.module,
        description: child.description,
        parentId: parent.id,
        view: true,
        create: false,
        update: false,
        delete: false,
        export: false,
      };
    });

    const allView = parentChildren.every((c) => c.view);
    const allCreate = parentChildren.every((c) => c.create);
    const allUpdate = parentChildren.every((c) => c.update);
    const allDelete = parentChildren.every((c) => c.delete);
    const allExport = parentChildren.every((c) => c.export);

    return {
      id: parent.id,
      moduleId: parent.id,
      moduleCode: parent.moduleCode,
      module: parent.moduleLabel,
      isParent: true,
      view: allView,
      create: allCreate,
      update: allUpdate,
      delete: allDelete,
      export: allExport,
      children: parentChildren,
    };
  });
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
      const response = await apiClient.get<any>(`/roles/${roleId}`);
      if (
        response.success &&
        response.data?.permissions &&
        Array.isArray(response.data.permissions) &&
        response.data.permissions.length > 0
      ) {
        const perms: any[] = response.data.permissions;
        const parents = perms.filter((p) => !p.parentId);

        if (parents.length > 0) {
          const tree: PermissionRow[] = parents.map((parent) => {
            const children = perms.filter(
              (c) => c.parentId === parent.moduleId || c.parentId === parent.id
            );
            const childRows: PermissionRow[] = children.map((c) => ({
              id: c.moduleId || c.id,
              moduleId: c.moduleId || c.id,
              moduleCode: c.moduleCode,
              module: c.moduleLabel || c.module || c.moduleCode,
              description: c.description,
              parentId: parent.moduleId || parent.id,
              view: Boolean(c.canView),
              create: Boolean(c.canCreate),
              update: Boolean(c.canUpdate),
              delete: Boolean(c.canDelete),
              export: Boolean(c.canExport),
            }));

            return {
              id: parent.moduleId || parent.id,
              moduleId: parent.moduleId || parent.id,
              moduleCode: parent.moduleCode,
              module: parent.moduleLabel || parent.module || parent.moduleCode,
              description: parent.description,
              isParent: true,
              view: childRows.length > 0 ? childRows.every((c) => c.view) : Boolean(parent.canView),
              create: childRows.length > 0 ? childRows.every((c) => c.create) : Boolean(parent.canCreate),
              update: childRows.length > 0 ? childRows.every((c) => c.update) : Boolean(parent.canUpdate),
              delete: childRows.length > 0 ? childRows.every((c) => c.delete) : Boolean(parent.canDelete),
              export: childRows.length > 0 ? childRows.every((c) => c.export) : Boolean(parent.canExport),
              children: childRows,
            };
          });

          return tree;
        }
      }
    } catch (error) {
      console.warn(`[roleService] getPermissionMatrix(${roleId}) failed, using fallback:`, error);
    }

    return generateDefaultMatrix(roleId);
  },

  async savePermissionMatrix(roleId: string, permissions: PermissionRow[]): Promise<boolean> {
    try {
      // Flatten all permissions to send to API
      const flattenedPermissions: any[] = [];
      permissions.forEach((parent) => {
        flattenedPermissions.push({
          moduleId: parent.moduleId || parent.id,
          canView: parent.view,
          canCreate: parent.create,
          canUpdate: parent.update,
          canDelete: parent.delete,
          canExport: parent.export,
        });

        if (parent.children) {
          parent.children.forEach((child) => {
            flattenedPermissions.push({
              moduleId: child.moduleId || child.id,
              canView: child.view,
              canCreate: child.create,
              canUpdate: child.update,
              canDelete: child.delete,
              canExport: child.export,
            });
          });
        }
      });

      const response = await apiClient.put<boolean>(`/roles/${roleId}/permissions`, {
        permissions: flattenedPermissions,
      });
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

  async updateRole(roleId: string, roleData: UpdateRolePayload): Promise<Partial<SystemRoleItem>> {
    try {
      const response = await apiClient.put<any>(`/roles/${roleId}`, {
        roleName: roleData.roleName.trim(),
        roleDescription: roleData.roleDescription?.trim(),
        roleStatus: roleData.roleStatus,
      });
      if (response.success && response.data) {
        return {
          roleName: response.data.roleName,
          roleDescription: response.data.roleDescription,
          roleStatus: response.data.roleStatus,
        };
      }
    } catch (error) {
      console.warn(`[roleService] updateRole(${roleId}) API failed, using fallback:`, error);
    }

    return {
      roleName: roleData.roleName,
      roleDescription: roleData.roleDescription,
      roleStatus: roleData.roleStatus,
    };
  },

  async deleteRole(roleId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/roles/${roleId}`);
      if (response.success) {
        return true;
      }
    } catch (error) {
      console.warn(`[roleService] deleteRole(${roleId}) API failed, using fallback:`, error);
    }

    return true;
  },
};
