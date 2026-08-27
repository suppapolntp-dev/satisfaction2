export interface SatisfactionVotePayload {
  branchCode: string;
  kioskCode: string;
  brandName: string;
  sentiment: "satisfied" | "neutral" | "unsatisfied";
  timestamp: string;
  clientIp?: string;
}

export interface SatisfactionVoteResponse {
  voteId: string;
  status: "Recorded" | "DuplicateIgnored";
  message: string;
}

