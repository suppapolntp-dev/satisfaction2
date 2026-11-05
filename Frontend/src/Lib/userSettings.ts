// ==========================================================================
// ─── 1. INTERFACES (นิยามตัวแปรการตั้งค่าสำหรับระบบ User Management)
// ==========================================================================

import { UserTierLevel } from "@/Types/user";

export interface SystemRoleOption {
  id: string;
  name: string;
  label: string;
  description: string;
}

export interface TierLevelDefinition {
  id: string;
  nameEn: UserTierLevel;
  nameTh: string;
  tierNumber: number;
  badgeClass: string;
}

export interface UserManagementConfig {
  // ─── 1. ข้อมูลหัวข้อหน้าจอ (Page Header & Description) ───
  pageTitle: string;
  pageDescription: string;

  // ─── 2. บทบาทระบบ (System Roles) ───
  roles: SystemRoleOption[];

  // ─── 3. ระดับสิทธิ์องค์กร 5 ลำดับขั้น (Data Access Tier Levels) ───
  tiers: TierLevelDefinition[];

  // ─── 4. การตั้งค่าตารางและการส่งออกข้อมูล (Table & Export Settings) ───
  defaultPageSize: number;
  exportFileNamePrefix: string;
  statusTabLabels: {
    all: string;
    active: string;
    inactive: string;
  };
}

export const DEFAULT_USER_CONFIG: UserManagementConfig = {
  pageTitle: "User & Multi-Scope Management",
  pageDescription: "Enterprise corporate accounts, 5-tier organizational data access scope, and role provisioning",

  roles: [
    {
      id: "role-admin",
      name: "Administrator",
      label: "Administrator (ควบคุมระบบ)",
      description: "เข้าถึงและจัดการทุกระบบในแพลตฟอร์ม",
    },
    {
      id: "role-manager",
      name: "Manager",
      label: "Manager (ผู้จัดการระดับเขต/แบรนด์)",
      description: "บริหารจัดการข้อมูลและทีมงานตามขอบเขตที่ได้รับมอบหมาย",
    },
    {
      id: "role-agent",
      name: "Agent",
      label: "Agent (เจ้าหน้าที่ปฏิบัติการ)",
      description: "ดูแลตู้ Kiosk และตอบสนองต่อความคิดเห็นหน้างาน",
    },
    {
      id: "role-auditor",
      name: "Auditor",
      label: "Auditor (ตรวจสอบข้อมูล)",
      description: "ตรวจสอบบันทึกความปลอดภัยและ Audit Log",
    },
    {
      id: "role-readonly",
      name: "Read Only",
      label: "Read Only (ดูรายงานอย่างเดียว)",
      description: "เข้าดูสรุปและรายงานเชิงลึกโดยไม่สามารถแก้ไขข้อมูลได้",
    },
  ],

  tiers: [
    {
      id: "tier-1",
      nameEn: "Super Admin",
      nameTh: "Super Administrator (ผู้ดูแลระบบระดับองค์กร - Tier 1)",
      tierNumber: 1,
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
    },
    {
      id: "tier-2",
      nameEn: "Brand Owner",
      nameTh: "Brand Manager / Owner (ผู้บริหารระดับแบรนด์ - Tier 2)",
      tierNumber: 2,
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    },
    {
      id: "tier-3",
      nameEn: "Regional Manager (RM)",
      nameTh: "Regional Manager / RM (ผู้จัดการระดับภูมิภาค - Tier 3)",
      tierNumber: 3,
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80",
    },
    {
      id: "tier-4",
      nameEn: "Area Manager (AM)",
      nameTh: "Area Manager / AM (ผู้จัดการระดับเขต - Tier 4)",
      tierNumber: 4,
      badgeClass: "bg-teal-50 text-teal-700 border-teal-200/80",
    },
    {
      id: "tier-5",
      nameEn: "Branch Staff",
      nameTh: "Branch Officer / Staff (เจ้าหน้าที่ประจำสาขา - Tier 5)",
      tierNumber: 5,
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200/80",
    },
    {
      id: "tier-custom",
      nameEn: "Custom Scope",
      nameTh: "Custom Scope (กำหนดขอบเขตเฉพาะบุคคล)",
      tierNumber: 0,
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
  ],

  defaultPageSize: 8,
  exportFileNamePrefix: "users_export",
  statusTabLabels: {
    all: "All Users",
    active: "Active",
    inactive: "Inactive",
  },
};

// ==========================================================================
// ─── 2. LOCAL STORAGE SYNC (ระบบจัดเก็บและกระจาย Event แบบ Reactive)
// ==========================================================================

const USER_SETTINGS_STORAGE_KEY = "csat_user_management_settings";
export const USER_SETTINGS_UPDATED_EVENT = "csat_user_management_settings_updated";

/**
 * ดึงค่าการตั้งค่า User Management จาก LocalStorage (Fallback ไปยัง DEFAULT_USER_CONFIG)
 */
export function getStoredUserConfig(): UserManagementConfig {
  if (typeof window === "undefined") {
    return DEFAULT_USER_CONFIG;
  }
  try {
    const rawData = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
    if (!rawData) {
      return DEFAULT_USER_CONFIG;
    }
    const parsed = JSON.parse(rawData);
    return {
      ...DEFAULT_USER_CONFIG,
      ...parsed,
      pageTitle: parsed.pageTitle || DEFAULT_USER_CONFIG.pageTitle,
      pageDescription: parsed.pageDescription || DEFAULT_USER_CONFIG.pageDescription,
      roles: Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : DEFAULT_USER_CONFIG.roles,
      tiers: Array.isArray(parsed.tiers) && parsed.tiers.length > 0 ? parsed.tiers : DEFAULT_USER_CONFIG.tiers,
      defaultPageSize: parsed.defaultPageSize || DEFAULT_USER_CONFIG.defaultPageSize,
      exportFileNamePrefix: parsed.exportFileNamePrefix || DEFAULT_USER_CONFIG.exportFileNamePrefix,
      statusTabLabels: parsed.statusTabLabels || DEFAULT_USER_CONFIG.statusTabLabels,
    };
  } catch (error) {
    console.error("Error reading user management config from localStorage:", error);
    return DEFAULT_USER_CONFIG;
  }
}

/**
 * บันทึกการตั้งค่า User Management ลง LocalStorage และกระจาย Event ให้ UI อัปเดตทันที
 */
export function saveStoredUserConfig(config: UserManagementConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event(USER_SETTINGS_UPDATED_EVENT));
  } catch (error) {
    console.error("Error writing user management config to localStorage:", error);
  }
}
