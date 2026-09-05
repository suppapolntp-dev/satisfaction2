import { apiClient } from "./apiClient";
import { BranchModel } from "@/Types/branch";

export type { BranchModel };

function mapBackendBranchToModel(b: any): BranchModel {
  const brandList = b.brandNames || b.brands || [];
  return {
    id: b.id,
    code: b.branchCode || b.code || "",
    name: b.name || "",
    brand: brandList.length > 0 ? brandList.join(", ") : (b.brand || "-"),
    brands: brandList,
    region: b.regionName || b.region || "-",
    province: b.provinceName || b.province || "-",
    kioskCount: b.kioskCount || 0,
    status: b.status === "Inactive" ? "Inactive" : "Active",
    satisfaction: b.satisfaction || 0,
    totalVotes: b.totalVotes || 0,
  };
}

export const branchService = {
  async getBranches(): Promise<BranchModel[]> {
    try {
      const response = await apiClient.get<any[]>("/branches");
      if (response.success && Array.isArray(response.data)) {
        return response.data.map(mapBackendBranchToModel);
      }
    } catch (err) {
      console.error("[branchService.getBranches] error:", err);
    }
    return [];
  },

  async getBranchById(id: string): Promise<BranchModel | null> {
    try {
      const response = await apiClient.get<any>(`/branches/${id}`);
      if (response.success && response.data) {
        return mapBackendBranchToModel(response.data);
      }
    } catch (err) {
      console.error("[branchService.getBranchById] error:", err);
    }
    return null;
  },

  async createBranch(branchData: Omit<BranchModel, "id"> & { provinceId?: string; brandIds?: string[] }): Promise<BranchModel> {
    const payload = {
      branchCode: branchData.code.trim().toUpperCase(),
      name: branchData.name.trim(),
      provinceId: branchData.provinceId || "00000000-0000-0000-0000-000000000000",
      brandIds: branchData.brandIds || [],
    };

    const response = await apiClient.post<any>("/branches", payload);
    if (response.success && response.data) {
      return mapBackendBranchToModel(response.data);
    }

    throw new Error(response.message || "ไม่สามารถสร้างสาขาได้");
  },

  async updateBranch(id: string, branchData: Partial<BranchModel> & { provinceId?: string; brandIds?: string[] }): Promise<BranchModel> {
    const payload = {
      name: branchData.name,
      provinceId: branchData.provinceId || "00000000-0000-0000-0000-000000000000",
      status: branchData.status || "Active",
      brandIds: branchData.brandIds || [],
    };

    const response = await apiClient.put<any>(`/branches/${id}`, payload);
    if (response.success) {
      return { ...branchData, id } as BranchModel;
    }

    throw new Error(response.message || "ไม่สามารถอัปเดตข้อมูลสาขาได้");
  },

  async deleteBranch(id: string): Promise<boolean> {
    const response = await apiClient.delete<any>(`/branches/${id}`);
    if (response.success) {
      return true;
    }
    throw new Error(response.message || "ไม่สามารถลบสาขาได้");
  },
};
