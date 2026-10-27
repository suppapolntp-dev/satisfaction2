"use client";

import { useState } from "react";
import { SentimentLevel } from "@/Components/Buttons/SatifactionButton";

export interface SentimentVoteSummary {
  sad: number;
  neutral: number;
  happy: number;
  totalVotes: number;
  csatPercentage: number;
}

export const INITIAL_ANALYTICS_VOTES: SentimentVoteSummary = {
  sad: 24,
  neutral: 82,
  happy: 1142,
  totalVotes: 1248,
  csatPercentage: 94.2,
};

export function useSatisfactionDashboardCard(initialData: SentimentVoteSummary = INITIAL_ANALYTICS_VOTES) {
  const [votes, setVotes] = useState<SentimentVoteSummary>(initialData);
  const [activeSentiment, setActiveSentiment] = useState<SentimentLevel | null>(null);

  const simulateVote = (level: SentimentLevel) => {
    setActiveSentiment(level);
    setVotes((prev) => {
      const nextCounts = {
        ...prev,
        [level]: prev[level] + 1,
        totalVotes: prev.totalVotes + 1,
      };
      const csat = (
        ((nextCounts.happy + nextCounts.neutral * 0.5) / nextCounts.totalVotes) *
        100
      ).toFixed(1);

      return {
        ...nextCounts,
        csatPercentage: parseFloat(csat),
      };
    });

    setTimeout(() => setActiveSentiment(null), 400);
  };

  return {
    votes,
    activeSentiment,
    simulateVote,
  };
}
