import { CustomScopeGroup } from "@/Types/dataAccess";

const STORAGE_KEY = "satisfaction_custom_scope_groups";

const DEFAULT_CUSTOM_SCOPES: CustomScopeGroup[] = [
  {
    id: "CSG-001",
    name: "Co-Location: KFC + Pizza Hut (สาขาห้างเซ็นทรัล)",
    description: "กลุ่มสาขา 2 แบรนด์ที่ตั้งอยู่ในจุดบริการเดียวกันสำหรับผู้จัดการเขตสายด่วน",
    brands: ["KFC", "Pizza Hut"],
    branches: ["KFC สาขา เซ็นทรัล ลาดพร้าว", "Pizza Hut สาขา เซ็นทรัล ลาดพร้าว"],
    createdAt: "2026-08-15",
  },
  {
    id: "CSG-002",
    name: "Dual-Brand Kiosk: Mister Donut + Arigato",
    description: "ตู้ Kiosk และเคาน์เตอร์บริการร่วมเครื่องดื่มและเบเกอรี่",
    brands: ["Mister Donut", "Arigato"],
    branches: ["Mister Donut สาขา ฟิวเจอร์พาร์ค รังสิต"],
    createdAt: "2026-08-20",
  },
];

export const customScopeService = {
  getCustomScopes(): CustomScopeGroup[] {
    if (typeof window === "undefined") return DEFAULT_CUSTOM_SCOPES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_SCOPES));
    return DEFAULT_CUSTOM_SCOPES;
  },

  createCustomScope(data: Omit<CustomScopeGroup, "id" | "createdAt">): CustomScopeGroup {
    const existing = this.getCustomScopes();
    const newScope: CustomScopeGroup = {
      ...data,
      id: `CSG-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newScope, ...existing];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return newScope;
  },

  updateCustomScope(id: string, data: Partial<CustomScopeGroup>): CustomScopeGroup {
    const existing = this.getCustomScopes();
    const index = existing.findIndex((s) => s.id === id);
    if (index >= 0) {
      const updatedItem = { ...existing[index], ...data };
      existing[index] = updatedItem;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }
      return updatedItem;
    }
    throw new Error("ไม่พบกลุ่มสโคปที่ต้องการแก้ไข");
  },

  deleteCustomScope(id: string): boolean {
    const existing = this.getCustomScopes();
    const filtered = existing.filter((s) => s.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return true;
  },
};

