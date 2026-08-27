export interface BrandModel {
  id: string;
  brandId: string;
  brandName: string;
  parentCompanyName: string;
  category: "Fast Food (QSR)" | "Beverage & Bakery" | "Japanese Dining" | "Western Casual" | string;
  brandLogoUrl?: string;
  brandIconName: string;
  totalBranchesCount: number;
  totalKiosksCount: number;
  csatAverage: string;
  status: "Active" | "Inactive";
}

export type CorporateBrandItem = BrandModel;

