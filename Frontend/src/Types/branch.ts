export interface BranchModel {
  id: string;
  code: string;
  name: string;
  brand: string;
  brands?: string[];
  region: string;
  province: string;
  kioskCount: number;
  satisfaction: number | null;
  status: "Active" | "Inactive";
  totalVotes?: number;
}

