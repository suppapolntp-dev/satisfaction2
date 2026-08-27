import { apiClient } from "./apiClient";
import { BrandModel } from "@/Types/brand";

export type { BrandModel };

export const brandService = {
  async getBrands(): Promise<BrandModel[]> {
    try {
      const response = await apiClient.get<BrandModel[]>("/brands");
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
    return [];
  },

  async getBrandById(id: string): Promise<BrandModel | null> {
    try {
      const response = await apiClient.get<BrandModel>(`/brands/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}
    return null;
  },

  async createBrand(brandData: Omit<BrandModel, "id">): Promise<BrandModel> {
    const newBrand: BrandModel = {
      ...brandData,
      id: `BRD-${Date.now()}`,
    };

    try {
      const response = await apiClient.post<BrandModel>("/brands", newBrand);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return newBrand;
  },

  async updateBrand(id: string, brandData: Partial<BrandModel>): Promise<BrandModel> {
    try {
      const response = await apiClient.put<BrandModel>(`/brands/${id}`, brandData);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return { ...brandData, id } as BrandModel;
  },

  async deleteBrand(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/brands/${id}`);
      if (response.success) {
        return true;
      }
    } catch {}

    return true;
  },
};
