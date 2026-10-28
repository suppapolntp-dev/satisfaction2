"use client";

import { useState, useEffect } from "react";

export interface SentimentVoteSummary {
  sad: number;
  neutral: number;
  happy: number;
  totalVotes?: number;
}

export const INITIAL_ANALYTICS_VOTES: SentimentVoteSummary = {
  sad: 0,
  neutral: 0,
  happy: 0,
  totalVotes: 0,
};

export function useSatisfactionDashboardCard(initialData?: Partial<SentimentVoteSummary>) {
  const [votes, setVotes] = useState<SentimentVoteSummary>({
    sad: initialData?.sad ? initialData.sad : 0,
    neutral: initialData?.neutral ? initialData.neutral : 0,
    happy: initialData?.happy ? initialData.happy : 0,
    totalVotes: initialData?.totalVotes
      ? initialData.totalVotes
      : (initialData?.sad ? initialData.sad : 0) +
        (initialData?.neutral ? initialData.neutral : 0) +
        (initialData?.happy ? initialData.happy : 0),
  });

  useEffect(() => {
    if (initialData) {
      setVotes({
        sad: initialData.sad ? initialData.sad : 0,
        neutral: initialData.neutral ? initialData.neutral : 0,
        happy: initialData.happy ? initialData.happy : 0,
        totalVotes: initialData.totalVotes
          ? initialData.totalVotes
          : (initialData.sad ? initialData.sad : 0) +
            (initialData.neutral ? initialData.neutral : 0) +
            (initialData.happy ? initialData.happy : 0),
      });
    }
  }, [initialData?.sad, initialData?.neutral, initialData?.happy, initialData?.totalVotes]);

  const totalVotes = votes.totalVotes
    ? votes.totalVotes
    : (votes.sad ? votes.sad : 0) + (votes.neutral ? votes.neutral : 0) + (votes.happy ? votes.happy : 0);

  return {
    votes: {
      sad: votes.sad ? votes.sad : 0,
      neutral: votes.neutral ? votes.neutral : 0,
      happy: votes.happy ? votes.happy : 0,
      totalVotes,
    },
    setVotes,
  };
}
