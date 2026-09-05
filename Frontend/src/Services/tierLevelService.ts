import { apiClient } from "./apiClient";
import { TierLevelModel } from "@/Types/tierLevel";

export type { TierLevelModel };

const STORAGE_KEY = "satisfaction_custom_tier_levels";

const DEFAULT_TIER_LEVELS: TierLevelModel[] = [
  {
    id: "TIER-001",
    levelOrder: 1,
    tierCode: "SUPER_ADMIN",
    nameTh: "Super Administrator (ระดับองค์กรสูงสุด)",
    nameEn: "Super Admin",
    description: "ดูแลและวิเคราะห์ข้อมูลทุกระดับ ทั่วทั้งองค์กร ทุกแบรนด์และทุกสาขา",
    scopeDimension: "Global",
    canViewSuperAdminOverview: true,
    canViewBrandRegionalGrid: true,
    canViewRegionalProvinceGrid: true,
    canViewProvincialBranchGrid: true,
    canViewBranchKiosksGrid: true,
    isSystemDefault: true,
    status: "Active",
  },
  {
    id: "TIER-002",
    levelOrder: 2,
    tierCode: "BRAND",
    nameTh: "Brand Owner / Manager (ระดับแบรนด์)",
    nameEn: "Brand Owner",
    description: "ดูแลและเข้าถึงข้อมูลเฉพาะแบรนด์ที่ได้รับมอบหมาย ครอบคลุมทุกสาขาของแบรนด์นั้น",
    scopeDimension: "Brand",
    canViewSuperAdminOverview: false,
    canViewBrandRegionalGrid: true,
    canViewRegionalProvinceGrid: true,
    canViewProvincialBranchGrid: true,
    canViewBranchKiosksGrid: true,
    isSystemDefault: true,
    status: "Active",
  },
  {
    id: "TIER-003",
    levelOrder: 3,
    tierCode: "REGION",
    nameTh: "Regional Manager (ระดับภูมิภาค)",
    nameEn: "Regional Manager (RM)",
    description: "ดูแลและเข้าถึงข้อมูลสาขาทั้งหมดในเขตภูมิภาคที่รับผิดชอบ",
    scopeDimension: "Region",
    canViewSuperAdminOverview: false,
    canViewBrandRegionalGrid: false,
    canViewRegionalProvinceGrid: true,
    canViewProvincialBranchGrid: true,
    canViewBranchKiosksGrid: true,
    isSystemDefault: true,
    status: "Active",
  },
  {
    id: "TIER-004",
    levelOrder: 4,
    tierCode: "PROVINCE",
    nameTh: "Area Manager (ระดับจังหวัด / เขตพื้นที่)",
    nameEn: "Area Manager (AM)",
    description: "ดูแลและเข้าถึงข้อมูลสาขาในระดับจังหวัดหรือคลัสเตอร์พื้นที่ที่รับผิดชอบ",
    scopeDimension: "Province",
    canViewSuperAdminOverview: false,
    canViewBrandRegionalGrid: false,
    canViewRegionalProvinceGrid: false,
    canViewProvincialBranchGrid: true,
    canViewBranchKiosksGrid: true,
    isSystemDefault: true,
    status: "Active",
  },
  {
    id: "TIER-005",
    levelOrder: 5,
    tierCode: "BRANCH",
    nameTh: "Branch Officer / Staff (ระดับสาขา)",
    nameEn: "Branch Staff",
    description: "ดูแลและดูผลคะแนนความพึงพอใจเฉพาะสาขาและตู้ Kiosk ประจำสาขาของตนเอง",
    scopeDimension: "Branch",
    canViewSuperAdminOverview: false,
    canViewBrandRegionalGrid: false,
    canViewRegionalProvinceGrid: false,
    canViewProvincialBranchGrid: false,
    canViewBranchKiosksGrid: true,
    isSystemDefault: true,
    status: "Active",
  },
  {
    id: "TIER-006",
    levelOrder: 6,
    tierCode: "CUSTOM_SCOPE",
    nameTh: "Custom Scope (ระดับกลุ่มสโคปกำหนดเอง / Co-Location)",
    nameEn: "Custom Scope",
    description: "สำหรับบุคลากรที่ดูแลข้ามแบรนด์ เช่น สาขา 2 แบรนด์ (Co-Location) หรือโครงการพิเศษ",
    scopeDimension: "Custom",
    canViewSuperAdminOverview: false,
    canViewBrandRegionalGrid: true,
    canViewRegionalProvinceGrid: true,
    canViewProvincialBranchGrid: true,
    canViewBranchKiosksGrid: true,
    isSystemDefault: false,
    status: "Active",
  },
];

export const tierLevelService = {
  async getTierLevels(): Promise<TierLevelModel[]> {
    try {
      const response = await apiClient.get<TierLevelModel[]>("/tierlevels");
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn("[tierLevelService.getTierLevels] Fallback to local cache:", err);
    }

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TIER_LEVELS));
    }
    return DEFAULT_TIER_LEVELS;
  },

  async createTierLevel(data: Omit<TierLevelModel, "id" | "isSystemDefault">): Promise<TierLevelModel> {
    try {
      const response = await apiClient.post<TierLevelModel>("/tierlevels", data);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn("[tierLevelService.createTierLevel] Fallback to local save:", err);
    }

    const current = await this.getTierLevels();
    const newTier: TierLevelModel = {
      ...data,
      id: `TIER-${Date.now().toString().slice(-4)}`,
      isSystemDefault: false,
    };
    const updated = [...current, newTier].sort((a, b) => a.levelOrder - b.levelOrder);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return newTier;
  },

  async updateTierLevel(id: string, data: Partial<TierLevelModel>): Promise<TierLevelModel> {
    try {
      const response = await apiClient.put<TierLevelModel>(`/tierlevels/${id}`, data);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn("[tierLevelService.updateTierLevel] Fallback to local update:", err);
    }

    const current = await this.getTierLevels();
    const index = current.findIndex((t) => t.id === id);
    if (index >= 0) {
      const updatedItem = { ...current[index], ...data };
      current[index] = updatedItem;
      current.sort((a, b) => a.levelOrder - b.levelOrder);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      }
      return updatedItem;
    }
    throw new Error("ไม่พบระดับสิทธิ์ที่ต้องการแก้ไข");
  },

  async deleteTierLevel(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/tierlevels/${id}`);
      if (response.success) {
        return true;
      }
    } catch (err) {
      console.warn("[tierLevelService.deleteTierLevel] Fallback to local delete:", err);
    }

    const current = await this.getTierLevels();
    const target = current.find((t) => t.id === id);
    if (target?.isSystemDefault) {
      throw new Error("ไม่สามารถลบระดับสิทธิ์หลักของระบบ (System Default) ได้");
    }
    const filtered = current.filter((t) => t.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return true;
  },
};

