import { apiClient } from "./apiClient";
import { BrandModel } from "@/Types/brand";

export type { BrandModel };

function mapBackendBrandToModel(b: any): BrandModel {
  return {
    id: b.id,
    brandId: b.brandCode || b.id,
    brandName: b.brandName || "",
    parentCompanyName: b.parentCompanyName || "Enterprise Group",
    category: b.category || "General",
    brandLogoUrl: b.brandLogoUrl,
    brandIconName: b.brandIconName || "restaurant",
    totalBranchesCount: b.branchCount || 0,
    totalKiosksCount: 0,
    csatAverage: "0.0%",
    status: b.status === "Inactive" ? "Inactive" : "Active",
  };
}

export const brandService = {
  async getBrands(): Promise<BrandModel[]> {
    try {
      const response = await apiClient.get<any[]>("/brands");
      if (response.success && Array.isArray(response.data)) {
        return response.data.map(mapBackendBrandToModel);
      }
    } catch (err) {
      console.error("[brandService.getBrands] error:", err);
    }
    return [];
  },

  async getBrandById(id: string): Promise<BrandModel | null> {
    try {
      const response = await apiClient.get<any>(`/brands/${id}`);
      if (response.success && response.data) {
        return mapBackendBrandToModel(response.data);
      }
    } catch (err) {
      console.error("[brandService.getBrandById] error:", err);
    }
    return null;
  },

  async createBrand(brandData: Omit<BrandModel, "id">): Promise<BrandModel> {
    const payload = {
      brandCode: brandData.brandId?.toUpperCase().trim() || `BRD_${Date.now()}`,
      brandName: brandData.brandName.trim(),
      category: brandData.category,
      brandLogoUrl: brandData.brandLogoUrl,
      brandIconName: brandData.brandIconName || "restaurant",
    };

    const response = await apiClient.post<any>("/brands", payload);
    if (response.success && response.data) {
      return mapBackendBrandToModel(response.data);
    }

    throw new Error(response.message || "ไม่สามารถสร้างแบรนด์ได้");
  },

  async updateBrand(id: string, brandData: Partial<BrandModel>): Promise<BrandModel> {
    const payload = {
      brandName: brandData.brandName,
      category: brandData.category,
      brandLogoUrl: brandData.brandLogoUrl,
      brandIconName: brandData.brandIconName,
      status: brandData.status || "Active",
    };

    const response = await apiClient.put<any>(`/brands/${id}`, payload);
    if (response.success) {
      return { ...brandData, id } as BrandModel;
    }

    throw new Error(response.message || "ไม่สามารถอัปเดตข้อมูลแบรนด์ได้");
  },

  async deleteBrand(id: string): Promise<boolean> {
    const response = await apiClient.delete<any>(`/brands/${id}`);
    if (response.success) {
      return true;
    }
    throw new Error(response.message || "ไม่สามารถลบแบรนด์ได้");
  },
};
