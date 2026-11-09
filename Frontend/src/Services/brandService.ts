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
  { id: "b-1", brandId: "KFC", brandName: "KFC", parentCompanyName: "Enterprise Group", category: "Fast Food (QSR)", brandLogoUrl: "/images/brands/kfc.svg", brandIconName: "restaurant", totalBranchesCount: 12, totalKiosksCount: 24, csatAverage: "94.2%", status: "Active" },
  { id: "b-2", brandId: "MISTER_DONUT", brandName: "Mister Donut", parentCompanyName: "Enterprise Group", category: "Beverage & Bakery", brandLogoUrl: "/images/brands/mister-donut.svg", brandIconName: "donut_large", totalBranchesCount: 15, totalKiosksCount: 30, csatAverage: "91.8%", status: "Active" },
  { id: "b-3", brandId: "OOTOYA", brandName: "Ootoya", parentCompanyName: "Enterprise Group", category: "Japanese Dining", brandLogoUrl: "/images/brands/ootoya.svg", brandIconName: "ramen_dining", totalBranchesCount: 8, totalKiosksCount: 16, csatAverage: "95.5%", status: "Active" },
  { id: "b-4", brandId: "PEPPER_LUNCH", brandName: "Pepper Lunch", parentCompanyName: "Enterprise Group", category: "Western Casual", brandLogoUrl: "/images/brands/pepper-lunch.svg", brandIconName: "dinner_dining", totalBranchesCount: 6, totalKiosksCount: 12, csatAverage: "89.4%", status: "Active" },
  { id: "b-5", brandId: "AUNTIE_ANNES", brandName: "Auntie Anne's", parentCompanyName: "Enterprise Group", category: "Beverage & Bakery", brandLogoUrl: "/images/brands/auntie-annes.svg", brandIconName: "bakery_dining", totalBranchesCount: 10, totalKiosksCount: 20, csatAverage: "93.1%", status: "Active" },
  { id: "b-6", brandId: "ARIGATO", brandName: "Arigato", parentCompanyName: "Enterprise Group", category: "Beverage & Bakery", brandLogoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMAyJ2wGea0fdN47kjswpn2Y7F1hmfItxNkdbPfEYC1Y2QhWztiVwMptRb&s=10", brandIconName: "local_cafe", totalBranchesCount: 14, totalKiosksCount: 28, csatAverage: "90.0%", status: "Active" },
];

export const brandService = {
  // TODO: Connect API [get_brands]
  async getBrands(): Promise<BrandModel[]> {
    if (!isApiModeEnabled()) {
      return [];
    }
    try {
      const response = await apiClient.get<BackendBrandDto[]>("/brands");
      if (response.success && Array.isArray(response.data)) {
        return response.data.map(mapBackendBrandToModel);
      }
    } catch (error) {
      console.warn("[brandService.getBrands] error connecting to API, using test seed data:", error);
    }
    // Fallback to dev test seed brands when backend is offline or error
    return DEFAULT_DEV_BRANDS;
  },

  // TODO: Connect API [get_brand_by_id]
  async getBrandById(id: string): Promise<BrandModel | null> {
    if (!isApiModeEnabled()) {
      return null;
    }
    try {
      const response = await apiClient.get<BackendBrandDto>(`/brands/${id}`);
      if (response.success && response.data) {
        return mapBackendBrandToModel(response.data);
      }
    } catch (error) {
      console.error("[brandService.getBrandById] error:", error);
    }
    return DEFAULT_DEV_BRANDS.find((b) => b.id === id) || null;
  },

  // TODO: Connect API [create_brand]
  async createBrand(brandData: Omit<BrandModel, "id">): Promise<BrandModel> {
    const payload = {
      brandCode: brandData.brandId?.toUpperCase().trim() || `BRD_${Date.now()}`,
      brandName: brandData.brandName.trim(),
      category: brandData.category || "General",
      brandLogoUrl: brandData.brandLogoUrl,
      brandIconName: brandData.brandIconName || "restaurant",
    };

    try {
      const response = await apiClient.post<BackendBrandDto>("/brands", payload);
      if (response.success && response.data) {
        return mapBackendBrandToModel(response.data);
      }
    } catch (error) {
      console.warn("[brandService.createBrand] backend unreachable, creating local fallback:", error);
    }

    return {
      id: `b-${Date.now()}`,
      brandId: payload.brandCode,
      brandName: payload.brandName,
      parentCompanyName: "Enterprise Group",
      category: payload.category,
      brandIconName: payload.brandIconName,
      brandLogoUrl: payload.brandLogoUrl,
      totalBranchesCount: 0,
      totalKiosksCount: 0,
      csatAverage: "0.0%",
      status: "Active",
    };
  },

  // TODO: Connect API [update_brand]
  async updateBrand(id: string, brandData: Partial<BrandModel>): Promise<BrandModel> {
    const payload = {
      brandName: (brandData.brandName || "").trim(),
      category: brandData.category,
      brandLogoUrl: brandData.brandLogoUrl,
      brandIconName: brandData.brandIconName,
      status: brandData.status || "Active",
    };

    try {
      const response = await apiClient.put<BackendBrandDto>(`/brands/${id}`, payload);
      if (response.success && response.data) {
        return mapBackendBrandToModel(response.data);
      }
    } catch (error) {
      console.warn("[brandService.updateBrand] backend unreachable, fallback to local update:", error);
    }

    return { ...brandData, id } as BrandModel;
  },

  // TODO: Connect API [delete_brand]
  async deleteBrand(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/brands/${id}`);
      if (response.success) return true;
    } catch (error) {
      console.warn("[brandService.deleteBrand] backend call failed:", error);
    }
    return true; // optimistic
  },
};
