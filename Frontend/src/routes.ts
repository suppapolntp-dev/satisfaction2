/**
 * Application Routes Configuration (Angular-inspired Route Definition)
 * กำหนดเส้นทาง (Routes), สิทธิ์การเข้าถึง (Roles/Tiers) และ Route Guards คล้ายคลึงกับ Angular canActivate
 */

export interface AppRouteConfig {
  /** เส้นทาง URL ของหน้า เช่น "/usermanagement", "/brand" */
  path: string;
  /** ชื่อโมดูลหรือคำอธิบายหน้า */
  name?: string;
  /** หน้าสาธารณะที่ไม่ต้องมี Token เช่น /login, /satisfaction */
  isPublic?: boolean;
  /** รายชื่อ Role Codes ที่อนุญาต (เช่น "SUPER_ADMIN", "BRAND_MANAGER") */
  allowedRoles?: string[];
  /** รายชื่อ Tier Levels ที่อนุญาต (เช่น "SuperAdmin", "Brand", "Region", "Province", "Branch") */
  allowedTiers?: string[];
  /** ปลายทางที่จะ redirect ไปหากไม่มีสิทธิ์ (ค่าเริ่มต้น: "/unauthorized") */
  redirectTo?: string;
  /** ตรวจสอบแบบตรงเป๊ะ (true) หรือจับแบบ prefix path (false) */
  exact?: boolean;
}

export const APP_ROUTES: AppRouteConfig[] = [
  // ---------------------------------------------------------------------------
  // 1. Public Routes (ไม่ต้องยืนยันตัวตน)
  // ---------------------------------------------------------------------------
  {
    path: "/login",
    name: "Authentication Login",
    isPublic: true,
    exact: true,
  },
  {
    path: "/satisfaction",
    name: "Customer Satisfaction Kiosk",
    isPublic: true,
    exact: false,
  },
  {
    path: "/unauthorized",
    name: "Access Denied 403",
    isPublic: false,
    exact: true,
  },
  {
    path: "/test",
    name: "Developer Test Playground",
    isPublic: true,
    exact: false,
  },

  // ---------------------------------------------------------------------------
  // 2. Analytics & Monitoring (เข้าถึงได้ทุกระดับชั้นหลังล็อกอิน)
  // ---------------------------------------------------------------------------
  {
    path: "/dashboard",
    name: "Analytics Dashboard",
    allowedRoles: ["SUPER_ADMIN", "BRAND_MANAGER", "REGIONAL_MANAGER", "AREA_MANAGER", "BRANCH_STAFF", "STAFF"],
    allowedTiers: ["SuperAdmin", "Brand", "Region", "Province", "Branch", "CustomScope"],
    exact: false,
  },
  {
    path: "/notifications",
    name: "System Notifications",
    allowedRoles: ["SUPER_ADMIN", "BRAND_MANAGER", "REGIONAL_MANAGER", "AREA_MANAGER", "BRANCH_STAFF", "STAFF"],
    allowedTiers: ["SuperAdmin", "Brand", "Region", "Province", "Branch", "CustomScope"],
    exact: false,
  },
  {
    path: "/docs",
    name: "API Documentation",
    allowedRoles: ["SUPER_ADMIN", "BRAND_MANAGER", "REGIONAL_MANAGER", "AREA_MANAGER", "BRANCH_STAFF", "STAFF"],
    allowedTiers: ["SuperAdmin", "Brand", "Region", "Province", "Branch", "CustomScope"],
    exact: false,
  },

  // ---------------------------------------------------------------------------
  // 3. Operations & Structure (Tier 1 ถึง Tier 4)
  // ---------------------------------------------------------------------------
  {
    path: "/brand",
    name: "Brand Management",
    allowedRoles: ["SUPER_ADMIN", "BRAND_MANAGER"],
    allowedTiers: ["SuperAdmin", "Brand"],
    redirectTo: "/unauthorized",
    exact: false,
  },
  {
    path: "/branch",
    name: "Branch Management",
    allowedRoles: ["SUPER_ADMIN", "BRAND_MANAGER", "REGIONAL_MANAGER", "AREA_MANAGER"],
    allowedTiers: ["SuperAdmin", "Brand", "Region", "Province"],
    redirectTo: "/unauthorized",
    exact: false,
  },
  {
    path: "/event",
    name: "Event & Campaigns",
    allowedRoles: ["SUPER_ADMIN", "BRAND_MANAGER", "REGIONAL_MANAGER", "AREA_MANAGER"],
    allowedTiers: ["SuperAdmin", "Brand", "Region", "Province"],
    redirectTo: "/unauthorized",
    exact: false,
  },

  // ---------------------------------------------------------------------------
  // 4. Security & Governance (Tier 1 Super Admin เท่านั้น)
  // ---------------------------------------------------------------------------
  {
    path: "/usermanagement",
    name: "User Management",
    allowedRoles: ["SUPER_ADMIN"],
    allowedTiers: ["SuperAdmin"],
    redirectTo: "/unauthorized",
    exact: false,
  },
  {
    path: "/roles",
    name: "Roles & Permissions",
    allowedRoles: ["SUPER_ADMIN"],
    allowedTiers: ["SuperAdmin"],
    redirectTo: "/unauthorized",
    exact: false,
  },
  {
    path: "/dataaccess",
    name: "Data Access Scope",
    allowedRoles: ["SUPER_ADMIN"],
    allowedTiers: ["SuperAdmin"],
    redirectTo: "/unauthorized",
    exact: false,
  },
  {
    path: "/audit",
    name: "Audit Logs",
    allowedRoles: ["SUPER_ADMIN"],
    allowedTiers: ["SuperAdmin"],
    redirectTo: "/unauthorized",
    exact: false,
  },

  // ---------------------------------------------------------------------------
  // 5. Configuration (Tier 1 Super Admin เท่านั้น)
  // ---------------------------------------------------------------------------
  {
    path: "/settings",
    name: "System Settings",
    allowedRoles: ["SUPER_ADMIN"],
    allowedTiers: ["SuperAdmin"],
    redirectTo: "/unauthorized",
    exact: false,
  },
];

/**
 * ฟังก์ชันค้นหา Route Configuration ตาม pathname ที่กำลังร้องขอ
 * เลียนแบบ Angular Route Matcher (Exact Match -> Longest Prefix Match)
 */
export function matchRoute(pathname: string): AppRouteConfig | undefined {
  const normalizedPath = pathname.toLowerCase();

  // 1. ตรวจสอบ exact match ก่อน
  const exactMatch = APP_ROUTES.find(
    (r) => r.exact && r.path.toLowerCase() === normalizedPath
  );
  if (exactMatch) return exactMatch;

  // 2. ตรวจสอบ prefix match โดยเรียงจาก path ที่ยาวกว่าก่อน เพื่อความแม่นยำสูงสุด
  const sortedPrefixRoutes = APP_ROUTES.filter((r) => !r.exact).sort(
    (a, b) => b.path.length - a.path.length
  );

  return sortedPrefixRoutes.find((r) => {
    const routePath = r.path.toLowerCase();
    return (
      normalizedPath === routePath ||
      normalizedPath.startsWith(`${routePath}/`)
    );
  });
}
