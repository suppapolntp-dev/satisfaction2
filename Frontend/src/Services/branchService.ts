import { apiClient } from "./apiClient";
import { BranchModel } from "@/Types/branch";

export type { BranchModel };

export const branchService = {
  async getBranches(): Promise<BranchModel[]> {
    try {
      const response = await apiClient.get<BranchModel[]>("/branches");
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
    return [];
  },

  async getBranchById(id: string): Promise<BranchModel | null> {
    try {
      const response = await apiClient.get<BranchModel>(`/branches/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}
    return null;
  },

  async createBranch(branchData: Omit<BranchModel, "id">): Promise<BranchModel> {
    const newBranch: BranchModel = {
      ...branchData,
      id: `BR-${Date.now()}`,
    };

    try {
      const response = await apiClient.post<BranchModel>("/branches", newBranch);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return newBranch;
  },

  async updateBranch(id: string, branchData: Partial<BranchModel>): Promise<BranchModel> {
    try {
      const response = await apiClient.put<BranchModel>(`/branches/${id}`, branchData);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return { ...branchData, id } as BranchModel;
  },

  async deleteBranch(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/branches/${id}`);
      if (response.success) {
        return true;
      }
    } catch {}

    return true;
  },
};
