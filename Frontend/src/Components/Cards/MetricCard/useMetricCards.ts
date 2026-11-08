"use client";

import { useMemo } from "react";
import { MetricCardItem } from "./MetricCard";

export interface DashboardMetricsData {
  totalVotes?: number;
  csatScore?: number | string;
  activeKiosks?: number | string;
  totalKiosks?: number | string;
  avgResponseTime?: number | string;
  votesChange?: string;
  csatChange?: string;
  kiosksStatus?: string;
  responseStatus?: string;
}

export interface UseMetricCardsOptions {
  data?: MetricCardItem[];
  metricsData?: DashboardMetricsData;
}

export function buildDashboardMetrics(data?: DashboardMetricsData): MetricCardItem[] {
  const totalVotes = data?.totalVotes ? data.totalVotes : 0;
  const csat = data?.csatScore ? data.csatScore : 0;
  const activeKiosks = data?.activeKiosks ? data.activeKiosks : 0;
  const totalKiosks = data?.totalKiosks ? data.totalKiosks : 0;
  const responseTime = data?.avgResponseTime ? data.avgResponseTime : 0;

  return [
    {
      id: "csat-score",
      label: "CSAT Satisfaction",
      value: csat ? (typeof csat === "number" ? `${csat}%` : csat) : "0%",
      change: data?.csatChange ? data.csatChange : "-",
      trend: "up",
      iconType: "satisfaction",
    },
    {
      id: "total-votes",
      label: "Total Votes Today",
      value: totalVotes ? totalVotes.toLocaleString() : "0",
      change: data?.votesChange ? data.votesChange : "-",
      trend: "up",
      iconType: "votes",
    },
    {
      id: "active-kiosks",
      label: "Active Kiosks",
      value: totalKiosks ? `${activeKiosks} / ${totalKiosks}` : `${activeKiosks}`,
      change: data?.kiosksStatus ? data.kiosksStatus : "-",
      trend: "neutral",
      iconType: "kiosks",
    },
    {
      id: "avg-response-time",
      label: "Avg. Response Time",
      value: typeof responseTime === "number" ? `${responseTime}s` : responseTime,
      change: data?.responseStatus ? data.responseStatus : "-",
      trend: "neutral",
      iconType: "speed",
    },
  ];
}

export function useMetricCards(options: UseMetricCardsOptions = {}) {
  const metrics = useMemo(() => {
    if (options.data && options.data.length > 0) {
      return options.data;
    }
    return buildDashboardMetrics(options.metricsData);
  }, [options.data, options.metricsData]);

  return {
    metrics,
  };
}
