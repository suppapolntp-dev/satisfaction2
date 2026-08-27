// ==========================================================================
// ─── ENTERPRISE SEARCH ENGINE & UTILITIES (MODULAR SEARCH SYSTEM)
// ==========================================================================

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: "Page" | "Branch" | "User" | "Brand" | "Event" | "Audit" | "Role" | "Notification";
  route: string;
  badge?: string;
  icon: string;
}

// ─── 1. BRANCH SEARCH ALGORITHM ───
export function searchBranches<T extends {
  id: string;
  code: string;
  name: string;
  brand?: string;
  brands?: string[];
  region?: string;
  province?: string;
}>(query: string, branches: T[]): T[] {
  if (!query || !query.trim()) return branches;
  const q = query.toLowerCase().trim();

  return branches.filter((b) => {
    const matchCode = b.code?.toLowerCase().includes(q);
    const matchName = b.name?.toLowerCase().includes(q);
    const matchBrand = b.brand?.toLowerCase().includes(q);
    const matchBrands = b.brands?.some((brand) => brand.toLowerCase().includes(q));
    const matchRegion = b.region?.toLowerCase().includes(q);
    const matchProvince = b.province?.toLowerCase().includes(q);
    const matchId = b.id?.toLowerCase().includes(q);

    return matchCode || matchName || matchBrand || matchBrands || matchRegion || matchProvince || matchId;
  });
}

// ─── 2. USER SEARCH ALGORITHM ───
export function searchUsers<T extends {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  userName?: string;
  email?: string;
  userEmail?: string;
  phone?: string;
  userPhone?: string;
  role?: string;
  tierLevel?: string;
  assignedBrands?: string[];
  assignedBranches?: string[];
}>(query: string, users: T[]): T[] {
  if (!query || !query.trim()) return users;
  const q = query.toLowerCase().trim();

  return users.filter((u) => {
    const fullName = `${u.firstName || ""} ${u.lastName || ""} ${u.name || ""} ${u.userName || ""}`.toLowerCase();
    const matchName = fullName.includes(q);
    const matchId = u.id?.toLowerCase().includes(q);
    const matchEmail = (u.email || u.userEmail)?.toLowerCase().includes(q);
    const matchPhone = (u.phone || u.userPhone)?.toLowerCase().includes(q);
    const matchRole = u.role?.toLowerCase().includes(q);
    const matchTier = u.tierLevel?.toLowerCase().includes(q);
    const matchBrands = u.assignedBrands?.some((b) => b.toLowerCase().includes(q));
    const matchBranches = u.assignedBranches?.some((br) => br.toLowerCase().includes(q));

    return matchName || matchId || matchEmail || matchPhone || matchRole || matchTier || matchBrands || matchBranches;
  });
}

// ─── 3. BRAND SEARCH ALGORITHM ───
export function searchBrands<T extends {
  brandId: string;
  brandName: string;
  parentCompanyName?: string;
  category?: string;
}>(query: string, brands: T[]): T[] {
  if (!query || !query.trim()) return brands;
  const q = query.toLowerCase().trim();

  return brands.filter((b) => {
    const matchId = b.brandId?.toLowerCase().includes(q);
    const matchName = b.brandName?.toLowerCase().includes(q);
    const matchCompany = b.parentCompanyName?.toLowerCase().includes(q);
    const matchCategory = b.category?.toLowerCase().includes(q);

    return matchId || matchName || matchCompany || matchCategory;
  });
}

// ─── 4. EVENT SEARCH ALGORITHM ───
export function searchEvents<T extends {
  eventId: string;
  eventName: string;
  brandScope?: string;
  eventLocation?: string;
  description?: string;
}>(query: string, events: T[]): T[] {
  if (!query || !query.trim()) return events;
  const q = query.toLowerCase().trim();

  return events.filter((e) => {
    const matchId = e.eventId?.toLowerCase().includes(q);
    const matchName = e.eventName?.toLowerCase().includes(q);
    const matchScope = e.brandScope?.toLowerCase().includes(q);
    const matchLocation = e.eventLocation?.toLowerCase().includes(q);
    const matchDesc = e.description?.toLowerCase().includes(q);

    return matchId || matchName || matchScope || matchLocation || matchDesc;
  });
}

// ─── 5. AUDIT LOG SEARCH ALGORITHM ───
export function searchAuditLogs<T extends {
  id: string;
  actorName?: string;
  actionType?: string;
  targetEntity?: string;
  description?: string;
  ipAddress?: string;
}>(query: string, logs: T[]): T[] {
  if (!query || !query.trim()) return logs;
  const q = query.toLowerCase().trim();

  return logs.filter((l) => {
    const matchId = l.id?.toLowerCase().includes(q);
    const matchActor = l.actorName?.toLowerCase().includes(q);
    const matchAction = l.actionType?.toLowerCase().includes(q);
    const matchTarget = l.targetEntity?.toLowerCase().includes(q);
    const matchDesc = l.description?.toLowerCase().includes(q);
    const matchIp = l.ipAddress?.toLowerCase().includes(q);

    return matchId || matchActor || matchAction || matchTarget || matchDesc || matchIp;
  });
}

// ==========================================================================
// ─── 6. GLOBAL NAVBAR SEARCH ENGINE (SEARCHES APP PAGES & DYNAMIC DATA)
// ==========================================================================

export const APP_NAVIGATION_PAGES: GlobalSearchResult[] = [
  { id: "NAV-DASHBOARD", title: "CSAT Analytics Dashboard", subtitle: "ภาพรวมคะแนนความพึงพอใจและตารางเปรียบเทียบ", category: "Page", route: "/dashboard", icon: "dashboard" },
  { id: "NAV-BRAND", title: "Brand Management", subtitle: "จัดการรายชื่อแบรนด์ในระบบ", category: "Page", route: "/brand", icon: "branding_watermark" },
  { id: "NAV-BRANCH", title: "Branch Management", subtitle: "จัดการสาขา รหัสสาขา และตู้ Kiosk", category: "Page", route: "/branch", icon: "storefront" },
  { id: "NAV-USER", title: "User Management", subtitle: "จัดการผู้ใช้งาน สิทธิ์ และสาขาที่ดูแล", category: "Page", route: "/usermanagement", icon: "manage_accounts" },
  { id: "NAV-EVENT", title: "Event Management & Calendar", subtitle: "ตารางกิจกรรมและแคมเปญประเมินพิเศษ", category: "Page", route: "/event", icon: "event" },
  { id: "NAV-NOTIF", title: "Notifications & Alerts", subtitle: "การแจ้งเตือนตู้ Kiosk และข้อร้องเรียน", category: "Page", route: "/notifications", icon: "notifications" },
  { id: "NAV-ROLES", title: "Roles & Permissions Matrix", subtitle: "กำหนดบทบาทและ Matrix สิทธิ์การเข้าถึง", category: "Page", route: "/roles", icon: "admin_panel_settings" },
  { id: "NAV-DATAACCESS", title: "Data Access Scope Management", subtitle: "ผังองค์กรและการมอบหมายขอบเขตการดูข้อมูล", category: "Page", route: "/dataaccess", icon: "lock_person" },
  { id: "NAV-AUDIT", title: "Audit Log & Security Trail", subtitle: "บันทึกประวัติการแก้ไขและ Audit Diff", category: "Page", route: "/audit", icon: "gavel" },
  { id: "NAV-SETTINGS", title: "System Settings", subtitle: "การตั้งค่าระบบ แบบประเมิน และรายงาน", category: "Page", route: "/settings", icon: "settings" },
  { id: "NAV-KIOSK", title: "Kiosk Satisfaction Screen", subtitle: "หน้าจอประเมินความพึงพอใจสำหรับลูกค้า", category: "Page", route: "/satisfaction", icon: "sentiment_satisfied" },
];

/**
 * Searches across web app pages and any provided dynamic dataset
 */
export function searchGlobalApp(
  query: string,
  dynamicEntities: GlobalSearchResult[] = []
): GlobalSearchResult[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  // Search Pages
  const matchedPages = APP_NAVIGATION_PAGES.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.route.toLowerCase().includes(q)
  );

  // Search Dynamic Entities (from real database / services)
  const matchedEntities = dynamicEntities.filter(
    (item) =>
      item.id.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q))
  );

  return [...matchedPages, ...matchedEntities].slice(0, 10);
}
