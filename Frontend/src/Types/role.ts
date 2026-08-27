export type PermissionKey = "view" | "create" | "update" | "delete" | "export";

export interface PermissionRow {
  module: string;
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
}

export interface SystemRoleItem {
  roleId: string;
  roleName: string;
  roleStatus: "Active" | "Inactive";
  roleDescription: string;
  roleLastModified: string;
  totalUsersCount: number;
  isSystemDefault?: boolean;
}

