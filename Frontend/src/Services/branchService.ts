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

export const branchService = {
  // TODO: Connect API [get_branches]
  async getBranches(): Promise<BranchModel[]> {
    try {
      console.log("[branchService.getBranches] Requesting GET /branches...");
      const response = await apiClient.get<BackendBranchDto[]>("/branches");
      console.log("[branchService.getBranches] Response received:", response);
      if (response.success && Array.isArray(response.data)) {
        const mapped = response.data.map(mapBackendBranchToModel);
        console.log(`[branchService.getBranches] Successfully mapped ${mapped.length} branches:`, mapped);
        return mapped;
      }
      console.warn("[branchService.getBranches] Response success is false or data is not array:", response);
    } catch (error) {
      console.error("[branchService.getBranches] error:", error);
    }
    return [];
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
