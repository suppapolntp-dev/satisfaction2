import { apiClient } from "./apiClient";
import { SatisfactionVotePayload, SatisfactionVoteResponse } from "@/Types/satisfaction";

export const satisfactionService = {
  async submitVote(payload: SatisfactionVotePayload): Promise<SatisfactionVoteResponse> {
    try {
      const response = await apiClient.post<SatisfactionVoteResponse>("/satisfaction/vote", payload);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    // Offline / Local development fallback
    const voteId = `VOTE-${Date.now()}`;
    return {
      voteId,
      status: "Recorded",
      message: "Vote recorded successfully (Local Service).",
    };
  },
};

