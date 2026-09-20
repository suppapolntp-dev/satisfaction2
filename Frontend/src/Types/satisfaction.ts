export interface SatisfactionVotePayload {
  branchId?: string;
  brandId?: string;
  kioskId?: string;
  branchCode?: string;
  kioskCode?: string;
  brandName?: string;
  sentiment: number; // 1 = Positive, 2 = Neutral, 3 = Negative
  timestamp?: string;
  clientIp?: string;
}

export interface SatisfactionVoteResponse {
  voteId: string;
  status: string;
  message: string;
}

