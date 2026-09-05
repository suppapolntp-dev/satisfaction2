export interface TierLevelModel {
  id: string;
  levelOrder: number;
  tierCode: string;
  nameTh: string;
  nameEn: string;
  description: string;
  scopeDimension: "Global" | "Brand" | "Region" | "Province" | "Branch" | "Custom";
  canViewSuperAdminOverview: boolean;
  canViewBrandRegionalGrid: boolean;
  canViewRegionalProvinceGrid: boolean;
  canViewProvincialBranchGrid: boolean;
  canViewBranchKiosksGrid: boolean;
  isSystemDefault: boolean;
  status: "Active" | "Inactive";
}

