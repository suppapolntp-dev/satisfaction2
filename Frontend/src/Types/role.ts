export type PermissionKey = "view" | "create" | "update" | "delete" | "export";

export interface PermissionRow {
  id?: string;
  moduleId?: string;
  moduleCode?: string;
  module: string;
  description?: string;
  isParent?: boolean;
  parentId?: string;
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
  children?: PermissionRow[];
}

export interface SystemRoleItem {
  id?: string;
  roleId: string;
  roleCode?: string;
  roleName: string;
  roleStatus: "Active" | "Inactive";
  roleDescription: string;
  roleLastModified: string;
  totalUsersCount: number;
  isSystemDefault?: boolean;
}

export interface RoleOverviewMetrics {
  totalRoles: number;
  activePermissions: number;
  assignedUsers: number;
  systemDefaultRoles: number;
}

export interface SystemModuleItem {
  id: string;
  moduleCode: string;
  moduleLabel: string;
  displayOrder: number;
}

export interface CreateRolePayload {
  roleCode: string;
  roleName: string;
  roleDescription?: string;
  cloneFromRoleId?: string;
  roleStatus?: "Active" | "Inactive";
}

export interface UpdateRolePayload {
  roleName: string;
  roleDescription?: string;
  roleStatus: "Active" | "Inactive";
}
