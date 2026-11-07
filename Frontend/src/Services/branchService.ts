import { apiClient, isApiModeEnabled } from "./apiClient";
import { BranchModel } from "@/Types/branch";

export type { BranchModel };

interface BackendBranchDto {
  id: string;
  branchCode?: string;
  code?: string;
  name?: string;
  brand?: string;
  brandNames?: string[];
  brands?: string[];
  regionName?: string;
  region?: string;
  provinceName?: string;
  province?: string;
  kioskCount?: number;
  satisfaction?: number;
  status?: string;
  totalVotes?: number;
}

function mapBackendBranchToModel(dto: BackendBranchDto): BranchModel {
  const brandList = dto.brandNames || dto.brands || [];
  return {
    id: dto.id,
    code: dto.branchCode || dto.code || "",
    name: dto.name || "",
    brand: brandList.length > 0 ? brandList.join(", ") : (dto.brand || "-"),
    brands: brandList,
    region: dto.regionName || dto.region || "-",
    province: dto.provinceName || dto.province || "-",
    kioskCount: dto.kioskCount || 0,
    status: dto.status === "Inactive" ? "Inactive" : "Active",
    satisfaction: dto.satisfaction || 0,
    totalVotes: dto.totalVotes || 0,
  };
}

export const DEFAULT_DEV_BRANCHES: BranchModel[] = [
  { id: "br-1", code: "MDO-NON-01", name: "Mister Donut & Arigato สาขา ฟิวเจอร์พาร์ค รังสิต", brand: "Mister Donut, Arigato", brands: ["Mister Donut", "Arigato"], region: "ภาคกลาง", province: "นนทบุรี", kioskCount: 4, satisfaction: 94, status: "Active", totalVotes: 1250 },
  { id: "br-2", code: "KFC-BKK-01", name: "KFC สาขา สยามพารากอน", brand: "KFC", brands: ["KFC"], region: "ภาคกลาง", province: "กรุงเทพมหานคร", kioskCount: 3, satisfaction: 96, status: "Active", totalVotes: 2180 },
  { id: "br-3", code: "MDO-BKK-01", name: "Mister Donut สาขา เซ็นทรัลเวิลด์", brand: "Mister Donut", brands: ["Mister Donut"], region: "ภาคกลาง", province: "กรุงเทพมหานคร", kioskCount: 2, satisfaction: 91, status: "Active", totalVotes: 980 },
  { id: "br-4", code: "ATN-BKK-02", name: "Auntie Anne's สาขา เมกาบางนา", brand: "Auntie Anne's", brands: ["Auntie Anne's"], region: "ภาคกลาง", province: "สมุทรปราการ", kioskCount: 3, satisfaction: 93, status: "Active", totalVotes: 1420 },
  { id: "br-5", code: "KFC-CNX-01", name: "KFC สาขา เซ็นทรัล เชียงใหม่", brand: "KFC", brands: ["KFC"], region: "ภาคเหนือ", province: "เชียงใหม่", kioskCount: 3, satisfaction: 95, status: "Active", totalVotes: 870 },
  { id: "br-6", code: "KFC-HKT-01", name: "KFC สาขา เซ็นทรัล ภูเก็ต ฟลอเรสต้า", brand: "KFC", brands: ["KFC"], region: "ภาคใต้", province: "ภูเก็ต", kioskCount: 2, satisfaction: 89, status: "Active", totalVotes: 640 },
];

export const branchService = {
  // TODO: Connect API [get_branches]
  async getBranches(): Promise<BranchModel[]> {
    if (!isApiModeEnabled()) {
      return [];
    }
    try {
      const response = await apiClient.get<BackendBranchDto[]>("/branches");
      if (response.success && Array.isArray(response.data)) {
        return response.data.map(mapBackendBranchToModel);
      }
    } catch (error) {
      console.warn("[branchService.getBranches] error connecting to API, using test seed data:", error);
    }
    // Fallback to dev test seed branches when backend is offline or error
    return DEFAULT_DEV_BRANCHES;
  },

  // TODO: Connect API [get_branch_by_id]
  async getBranchById(id: string): Promise<BranchModel | null> {
    if (!isApiModeEnabled()) {
      return null;
    }
    try {
      const response = await apiClient.get<BackendBranchDto>(`/branches/${id}`);
      if (response.success && response.data) {
        return mapBackendBranchToModel(response.data);
      }
    } catch (error) {
      console.error("[branchService.getBranchById] error:", error);
    }
    return DEFAULT_DEV_BRANCHES.find((b) => b.id === id) || null;
  },

  // TODO: Connect API [create_branch]
  async createBranch(
    branchData: Omit<BranchModel, "id"> & { provinceId?: string; brandIds?: string[] }
  ): Promise<BranchModel> {
    const payload = {
      branchCode: branchData.code.trim().toUpperCase(),
      name: branchData.name.trim(),
      provinceId: branchData.provinceId || "00000000-0000-0000-0000-000000000000",
      brandIds: branchData.brandIds || [],
    };

    try {
      const response = await apiClient.post<BackendBranchDto>("/branches", payload);
      if (response.success && response.data) {
        return mapBackendBranchToModel(response.data);
      }
    } catch (error) {
      console.warn("[branchService.createBranch] backend unreachable, creating local fallback:", error);
    }

    return {
      id: `br-${Date.now()}`,
      code: payload.branchCode,
      name: payload.name,
      brand: branchData.brand || "KFC",
      brands: branchData.brands || [branchData.brand || "KFC"],
      region: branchData.region || "ภาคกลาง",
      province: branchData.province || "กรุงเทพมหานคร",
      kioskCount: branchData.kioskCount || 0,
      status: branchData.status || "Active",
      satisfaction: 0,
      totalVotes: 0,
    };
  },

  // TODO: Connect API [update_branch]
  async updateBranch(
    id: string,
    branchData: Partial<BranchModel> & { provinceId?: string; brandIds?: string[] }
  ): Promise<BranchModel> {
    const payload = {
      name: (branchData.name || "").trim(),
      provinceId: branchData.provinceId || "00000000-0000-0000-0000-000000000000",
      status: branchData.status || "Active",
      brandIds: branchData.brandIds || [],
    };

    try {
      const response = await apiClient.put<BackendBranchDto>(`/branches/${id}`, payload);
      if (response.success && response.data) {
        return mapBackendBranchToModel(response.data);
      }
    } catch (error) {
      console.warn("[branchService.updateBranch] backend unreachable, fallback to local update:", error);
    }

    return { ...branchData, id } as BranchModel;
  },

  // TODO: Connect API [delete_branch]
  async deleteBranch(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/branches/${id}`);
      if (response.success) return true;
    } catch (error) {
      console.warn("[branchService.deleteBranch] backend call failed:", error);
    }
    return true; // optimistic
  },
};
