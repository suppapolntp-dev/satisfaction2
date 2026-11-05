import { apiClient } from "./apiClient";
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
  { id: "br-1", code: "CRG-BKK-01", name: "Future Park Rangsit", brand: "KFC", brands: ["KFC", "Mister Donut"], region: "ภาคกลาง", province: "ปทุมธานี", kioskCount: 4, satisfaction: 94, status: "Active", totalVotes: 1250 },
  { id: "br-2", code: "CRG-BKK-02", name: "Siam Paragon", brand: "KFC", brands: ["KFC", "Ootoya"], region: "ภาคกลาง", province: "กรุงเทพมหานคร", kioskCount: 3, satisfaction: 96, status: "Active", totalVotes: 2180 },
  { id: "br-3", code: "CRG-BKK-03", name: "Central World", brand: "Mister Donut", brands: ["Mister Donut", "Pepper Lunch"], region: "ภาคกลาง", province: "กรุงเทพมหานคร", kioskCount: 2, satisfaction: 91, status: "Active", totalVotes: 980 },
  { id: "br-4", code: "CRG-BKK-04", name: "Mega Bangna", brand: "Mister Donut", brands: ["Mister Donut", "Auntie Anne's"], region: "ภาคกลาง", province: "สมุทรปราการ", kioskCount: 3, satisfaction: 93, status: "Active", totalVotes: 1420 },
  { id: "br-5", code: "CRG-CNX-01", name: "Central Chiangmai", brand: "Ootoya", brands: ["Ootoya", "KFC"], region: "ภาคเหนือ", province: "เชียงใหม่", kioskCount: 2, satisfaction: 95, status: "Active", totalVotes: 870 },
  { id: "br-6", code: "CRG-HKT-01", name: "Central Festival Phuket", brand: "Pepper Lunch", brands: ["Pepper Lunch", "Arigato"], region: "ภาคใต้", province: "ภูเก็ต", kioskCount: 2, satisfaction: 89, status: "Active", totalVotes: 640 },
];

export const branchService = {
  // TODO: Connect API [get_branches]
  async getBranches(): Promise<BranchModel[]> {
    try {
      console.log("[branchService.getBranches] Requesting GET /branches...");
      const response = await apiClient.get<BackendBranchDto[]>("/branches");
      console.log("[branchService.getBranches] Response received:", response);
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        const mapped = response.data.map(mapBackendBranchToModel);
        console.log(`[branchService.getBranches] Successfully mapped ${mapped.length} branches:`, mapped);
        return mapped;
      }
      console.warn("[branchService.getBranches] Response success is false or data is not array:", response);
    } catch (error) {
      console.error("[branchService.getBranches] error:", error);
    }
    // Fallback to dev test seed branches when backend is offline or empty
    return DEFAULT_DEV_BRANCHES;
  },

  // TODO: Connect API [get_branch_by_id]
  async getBranchById(id: string): Promise<BranchModel | null> {
    try {
      const response = await apiClient.get<BackendBranchDto>(`/branches/${id}`);
      if (response.success && response.data) {
        return mapBackendBranchToModel(response.data);
      }
    } catch (error) {
      console.error("[branchService.getBranchById] error:", error);
    }
    return null;
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

    const response = await apiClient.post<BackendBranchDto>("/branches", payload);
    if (response.success && response.data) {
      return mapBackendBranchToModel(response.data);
    }

    throw new Error(response.message || "Failed to create branch");
  },

  // TODO: Connect API [update_branch]
  async updateBranch(
    id: string,
    branchData: Partial<BranchModel> & { provinceId?: string; brandIds?: string[] }
  ): Promise<BranchModel> {
    const payload = {
      name: branchData.name,
      provinceId: branchData.provinceId || "00000000-0000-0000-0000-000000000000",
      status: branchData.status || "Active",
      brandIds: branchData.brandIds || [],
    };

    const response = await apiClient.put<BackendBranchDto>(`/branches/${id}`, payload);
    if (response.success) {
      return { ...branchData, id } as BranchModel;
    }

    throw new Error(response.message || "Failed to update branch");
  },

  // TODO: Connect API [delete_branch]
  async deleteBranch(id: string): Promise<boolean> {
    const response = await apiClient.delete<boolean>(`/branches/${id}`);
    if (response.success) {
      return true;
    }
    throw new Error(response.message || "Failed to delete branch");
  },
};
