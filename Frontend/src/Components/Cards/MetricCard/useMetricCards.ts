"use client";

import { useMemo } from "react";
import { MetricCardItem } from "./MetricCard";

export interface UseMetricCardsOptions {
  data?: MetricCardItem[];
}

export const DEFAULT_DASHBOARD_METRICS: MetricCardItem[] = [
  {
    id: "total-votes",
    label: "Total Votes Today",
    value: "1,248",
    change: "+12.4% vs yesterday",
    trend: "up",
    iconType: "votes",
  },
  {
    id: "csat-score",
    label: "Satisfaction Score (CSAT)",
    value: "94.2%",
    change: "+2.1% target exceeded",
    trend: "up",
    valueHighlight: true,
    iconType: "satisfaction",
  },
  {
    id: "active-kiosks",
    label: "Active Kiosks",
    value: "18 / 18",
    change: "100% online & healthy",
    trend: "neutral",
    iconType: "kiosks",
  },
  {
    id: "avg-response-time",
    label: "Avg. Response Time",
    value: "1.8s",
    change: "Sub-second local sync",
    trend: "neutral",
    iconType: "speed",
  },
];

export function useMetricCards(options: UseMetricCardsOptions = {}) {
  const metrics = useMemo(() => {
    return options.data && options.data.length > 0
      ? options.data
      : DEFAULT_DASHBOARD_METRICS;
  }, [options.data]);

  return {
    metrics,
  };
}
