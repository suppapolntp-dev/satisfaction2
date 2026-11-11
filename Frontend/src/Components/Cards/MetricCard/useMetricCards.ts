"use client";

import { useMemo } from "react";
import { MetricCardItem, MetricTrend } from "./MetricCard";

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
  csatTrend?: MetricTrend;
  votesTrend?: MetricTrend;
}

export interface UseMetricCardsOptions {
  data?: MetricCardItem[];
  metricsData?: DashboardMetricsData;
}

export function buildDashboardMetrics(data?: DashboardMetricsData): MetricCardItem[] {
  const totalVotes = data?.totalVotes ? data.totalVotes : 0;
  const activeKiosks = data?.activeKiosks ? data.activeKiosks : 0;
  const totalKiosks = data?.totalKiosks ? data.totalKiosks : 0;
  const responseTime = data?.avgResponseTime ? data.avgResponseTime : "-";

  return [
    {
      id: "total-votes",
      label: "Total Votes",
      value: totalVotes ? totalVotes.toLocaleString() : "0",
      change: data?.votesChange || "ดี 1,284  ปรับปรุง 58",
      trend: data?.votesTrend || "neutral",
      iconType: "votes",
    },
    {
      id: "avg-response-time",
      label: "Sync Latency",
      value: typeof responseTime === "number" ? `${responseTime}s` : responseTime,
      change: data?.responseStatus || "ซิงค์ข้อมูลแบบ Real-time",
      trend: "neutral",
      iconType: "speed",
    },
    {
      id: "active-kiosks",
      label: "Active Kiosks",
      value: totalKiosks ? `${activeKiosks} / ${totalKiosks}` : `${activeKiosks}`,
      change: data?.kiosksStatus || "ออนไลน์ครบทุกจุด (12 สาขา)",
      trend: "neutral",
      iconType: "kiosks",
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
