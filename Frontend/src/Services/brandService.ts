import { apiClient, isApiModeEnabled } from "./apiClient";
import { BrandModel } from "@/Types/brand";

export type { BrandModel };

interface BackendBrandDto {
  id: string;
  brandCode?: string;
  brandName?: string;
  parentCompanyName?: string;
  category?: string;
  brandLogoUrl?: string;
  brandIconName?: string;
  branchCount?: number;
  status?: string;
}

function mapBackendBrandToModel(dto: BackendBrandDto): BrandModel {
  return {
    id: dto.id,
    brandId: dto.brandCode || dto.id,
    brandName: dto.brandName || "",
    parentCompanyName: dto.parentCompanyName || "Enterprise Group",
    category: dto.category || "General",
    brandLogoUrl: dto.brandLogoUrl,
    brandIconName: dto.brandIconName || "store",
    totalBranchesCount: dto.branchCount || 0,
    totalKiosksCount: 0,
    csatAverage: "0.0%",
    status: dto.status === "Inactive" ? "Inactive" : "Active",
  };
}

export const DEFAULT_DEV_BRANDS: BrandModel[] = [
  { id: "b-1", brandId: "KFC", brandName: "KFC", parentCompanyName: "Enterprise Group", category: "Fast Food (QSR)", brandIconName: "restaurant", totalBranchesCount: 12, totalKiosksCount: 24, csatAverage: "94.2%", status: "Active" },
  { id: "b-2", brandId: "MISTER_DONUT", brandName: "Mister Donut", parentCompanyName: "Enterprise Group", category: "Beverage & Bakery", brandIconName: "donut_large", totalBranchesCount: 15, totalKiosksCount: 30, csatAverage: "91.8%", status: "Active" },
  { id: "b-3", brandId: "OOTOYA", brandName: "Ootoya", parentCompanyName: "Enterprise Group", category: "Japanese Dining", brandIconName: "ramen_dining", totalBranchesCount: 8, totalKiosksCount: 16, csatAverage: "95.5%", status: "Active" },
  { id: "b-4", brandId: "PEPPER_LUNCH", brandName: "Pepper Lunch", parentCompanyName: "Enterprise Group", category: "Western Casual", brandIconName: "dinner_dining", totalBranchesCount: 6, totalKiosksCount: 12, csatAverage: "89.4%", status: "Active" },
  { id: "b-5", brandId: "AUNTIE_ANNES", brandName: "Auntie Anne's", parentCompanyName: "Enterprise Group", category: "Beverage & Bakery", brandIconName: "bakery_dining", totalBranchesCount: 10, totalKiosksCount: 20, csatAverage: "93.1%", status: "Active" },
  { id: "b-6", brandId: "ARIGATO", brandName: "Arigato", parentCompanyName: "Enterprise Group", category: "Beverage & Bakery", brandIconName: "local_cafe", totalBranchesCount: 14, totalKiosksCount: 28, csatAverage: "90.0%", status: "Active" },
];

export const brandService = {
  // TODO: Connect API [get_brands]
  async getBrands(): Promise<BrandModel[]> {
    if (!isApiModeEnabled()) {
      return [];
    }
    try {
      console.log("[brandService.getBrands] Requesting GET /brands...");
      const response = await apiClient.get<BackendBrandDto[]>("/brands");
      console.log("[brandService.getBrands] Response received:", response);
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        const mapped = response.data.map(mapBackendBrandToModel);
        console.log(`[brandService.getBrands] Successfully mapped ${mapped.length} brands:`, mapped);
        return mapped;
      }
      console.warn("[brandService.getBrands] Response success is false or data is not array:", response);
    } catch (error) {
      console.error("[brandService.getBrands] error:", error);
    }
    // Fallback to dev test seed brands when backend is offline or empty
    return DEFAULT_DEV_BRANDS;
  },

  // TODO: Connect API [get_brand_by_id]
  async getBrandById(id: string): Promise<BrandModel | null> {
    try {
      const response = await apiClient.get<BackendBrandDto>(`/brands/${id}`);
      if (response.success && response.data) {
        return mapBackendBrandToModel(response.data);
      }
    } catch (error) {
      console.error("[brandService.getBrandById] error:", error);
    }
    return null;
  },

  // TODO: Connect API [create_brand]
  async createBrand(brandData: Omit<BrandModel, "id">): Promise<BrandModel> {
    const payload = {
      brandCode: brandData.brandId?.toUpperCase().trim() || `BRD_${Date.now()}`,
      brandName: brandData.brandName.trim(),
      category: brandData.category,
      brandLogoUrl: brandData.brandLogoUrl,
      brandIconName: brandData.brandIconName || "store",
    };

    const response = await apiClient.post<BackendBrandDto>("/brands", payload);
    if (response.success && response.data) {
      return mapBackendBrandToModel(response.data);
    }

    throw new Error(response.message || "Failed to create brand");
  },

  // TODO: Connect API [update_brand]
  async updateBrand(id: string, brandData: Partial<BrandModel>): Promise<BrandModel> {
    const payload = {
      brandName: brandData.brandName,
      category: brandData.category,
      brandLogoUrl: brandData.brandLogoUrl,
      brandIconName: brandData.brandIconName,
      status: brandData.status || "Active",
    };

    const response = await apiClient.put<BackendBrandDto>(`/brands/${id}`, payload);
    if (response.success) {
      return { ...brandData, id } as BrandModel;
    }

    throw new Error(response.message || "Failed to update brand");
  },

  // TODO: Connect API [delete_brand]
  async deleteBrand(id: string): Promise<boolean> {
    const response = await apiClient.delete<boolean>(`/brands/${id}`);
    if (response.success) {
      return true;
    }
    throw new Error(response.message || "Failed to delete brand");
  },
};
