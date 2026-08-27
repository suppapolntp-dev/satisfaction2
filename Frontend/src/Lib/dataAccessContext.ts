/**
 * Data Access Permission Management & Scope State
 * จัดการสิทธิ์การเข้าถึงข้อมูลและการมองเห็น Grid ในหน้า Dashboard ตาม 5 ลำดับชั้นองค์กร
 */

export interface DashboardTierPermissions {
  canViewSuperAdminOverview: boolean;   // ระดับ 1: Super Admin (เปรียบเทียบทุกแบรนด์)
  canViewBrandRegionalGrid: boolean;    // ระดับ 2: Brand Owner (เปรียบเทียบระดับภาค)
  canViewRegionalProvinceGrid: boolean; // ระดับ 3: Regional Manager RM (เปรียบเทียบระดับจังหวัด)
  canViewProvincialBranchGrid: boolean; // ระดับ 4: Area Manager AM (เปรียบเทียบระดับสาขา)
  canViewBranchKiosksGrid: boolean;     // ระดับ 5: Branch Staff (ดูตู้ Kiosk รายเครื่อง & Live Feed)
}

export interface UserDataAccessProfile {
  userId: string;
  userName: string;
  userEmail: string;
  roleName: string;
  assignedBrand: string;
  assignedRegion: string;
  assignedProvince: string;
  assignedBranch: string;
  permissions: DashboardTierPermissions;
}

export const DATA_ACCESS_STORAGE_KEY = "csat_active_data_access_profile";

// สิทธิ์เริ่มต้นตามบทบาทต่างๆ
export const PRESET_TIER_PROFILES: Record<string, UserDataAccessProfile> = {
  SUPER_ADMIN: {
    userId: "USR-001",
    userName: "สมชาย เกียรติสกุล (Super Admin)",
    userEmail: "somchai.k@crg.co.th",
    roleName: "Super Administrator",
    assignedBrand: "ทุกแบรนด์ (CRG Group)",
    assignedRegion: "ทั่วประเทศ",
    assignedProvince: "ทุกจังหวัด",
    assignedBranch: "ทุกสาขา",
    permissions: {
      canViewSuperAdminOverview: true,
      canViewBrandRegionalGrid: true,
      canViewRegionalProvinceGrid: true,
      canViewProvincialBranchGrid: true,
      canViewBranchKiosksGrid: true,
    },
  },
  BRAND_OWNER: {
    userId: "USR-002",
    userName: "วิภาดา เจริญพร (Brand Owner - KFC)",
    userEmail: "wiphada.c@crg.co.th",
    roleName: "Brand Owner",
    assignedBrand: "KFC Thailand",
    assignedRegion: "ทั่วประเทศ",
    assignedProvince: "ทุกจังหวัด",
    assignedBranch: "ทุกสาขาของแบรนด์",
    permissions: {
      canViewSuperAdminOverview: false,
      canViewBrandRegionalGrid: true,
      canViewRegionalProvinceGrid: true,
      canViewProvincialBranchGrid: true,
      canViewBranchKiosksGrid: true,
    },
  },
  REGIONAL_MANAGER: {
    userId: "USR-003",
    userName: "ธนากร ศรีเจริญ (RM ภาคเหนือ)",
    userEmail: "thanakorn.s@crg.co.th",
    roleName: "Regional Manager (RM)",
    assignedBrand: "KFC Thailand",
    assignedRegion: "ภาคเหนือ",
    assignedProvince: "เชียงใหม่, พิษณุโลก, เชียงราย, ลำปาง",
    assignedBranch: "ทุกสาขาในภาคเหนือ",
    permissions: {
      canViewSuperAdminOverview: false,
      canViewBrandRegionalGrid: false,
      canViewRegionalProvinceGrid: true,
      canViewProvincialBranchGrid: true,
      canViewBranchKiosksGrid: true,
    },
  },
  AREA_MANAGER: {
    userId: "USR-004",
    userName: "อนุชา รัตนพรหม (AM เชียงใหม่)",
    userEmail: "anucha.r@crg.co.th",
    roleName: "Area Manager (AM)",
    assignedBrand: "KFC Thailand",
    assignedRegion: "ภาคเหนือ",
    assignedProvince: "เชียงใหม่",
    assignedBranch: "สาขาในเชียงใหม่",
    permissions: {
      canViewSuperAdminOverview: false,
      canViewBrandRegionalGrid: false,
      canViewRegionalProvinceGrid: false,
      canViewProvincialBranchGrid: true,
      canViewBranchKiosksGrid: true,
    },
  },
  BRANCH_STAFF: {
    userId: "USR-005",
    userName: "นันทิยา ชัยชนะ (Staff เชียงใหม่ แอร์พอร์ต)",
    userEmail: "nanthiya.c@crg.co.th",
    roleName: "Branch Staff",
    assignedBrand: "KFC Thailand",
    assignedRegion: "ภาคเหนือ",
    assignedProvince: "เชียงใหม่",
    assignedBranch: "KFC เซ็นทรัล เชียงใหม่ แอร์พอร์ต",
    permissions: {
      canViewSuperAdminOverview: false,
      canViewBrandRegionalGrid: false,
      canViewRegionalProvinceGrid: false,
      canViewProvincialBranchGrid: false,
      canViewBranchKiosksGrid: true,
    },
  },
};

export function getActiveDataAccessProfile(): UserDataAccessProfile {
  if (typeof window === "undefined") {
    return PRESET_TIER_PROFILES.SUPER_ADMIN;
  }
  try {
    const raw = localStorage.getItem(DATA_ACCESS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading active data access profile:", err);
  }
  return PRESET_TIER_PROFILES.SUPER_ADMIN;
}

export function saveActiveDataAccessProfile(profile: UserDataAccessProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DATA_ACCESS_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("csat_data_access_updated"));
  } catch (err) {
    console.error("Error saving active data access profile:", err);
  }
}

