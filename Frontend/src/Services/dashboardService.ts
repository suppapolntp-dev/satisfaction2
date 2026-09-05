import { apiClient } from "./apiClient";
import {
  PerformanceTableRow,
  DashboardHourlyTrendPoint,
  DashboardAggregatedStats,
  LiveVoteItem,
  DashboardDataResponse,
} from "@/Types/dashboard";

export interface DashboardOverviewApiDto {
  totalVotes: number;
  satisfiedVotes: number;
  neutralVotes: number;
  unsatisfiedVotes: number;
  csatScore: number;
  activeBranchesCount: number;
  activeKiosksCount: number;
}

export interface TrendChartApiDto {
  date: string;
  hour: number;
  timeLabel: string;
  totalVotes: number;
  satisfiedCount: number;
  neutralCount: number;
  unsatisfiedCount: number;
  csatScore: number;
}

export interface TierGridRowApiDto {
  id: string;
  code: string;
  name: string;
  subTitle: string;
  totalVotes: number;
  satisfiedCount: number;
  neutralCount: number;
  unsatisfiedCount: number;
  csatScore: number;
  status: string;
}

export interface LiveVoteFeedApiDto {
  id: string;
  branchName: string;
  brandName: string;
  kioskCode?: string;
  sentiment: number; // 1 = Positive, 2 = Neutral, 3 = Negative
  sentimentName: string;
  votedAt: string;
  clientIp?: string;
}

export const dashboardService = {
  // 1. ดึงข้อมูลภาพรวมแดชบอร์ดทั้งหมด
  async getDashboardData(timeFilter: string = "today"): Promise<DashboardDataResponse> {
    try {
      // ดึง 4 Endpoints ขนานกันเพื่อความรวดเร็วสูงสุด
      const [overviewRes, trendsRes, gridRes, feedRes] = await Promise.allSettled([
        apiClient.get<DashboardOverviewApiDto>("/dashboard/overview"),
        apiClient.get<TrendChartApiDto[]>("/dashboard/trends?interval=daily"),
        apiClient.get<TierGridRowApiDto[]>("/dashboard/grid?tierType=branch"),
        apiClient.get<LiveVoteFeedApiDto[]>("/dashboard/live-feed?limit=20"),
      ]);

      // แปลง Overview Stats
      let aggregatedStats: DashboardAggregatedStats = {
        satisfiedTotal: 0,
        neutralTotal: 0,
        unsatisfiedTotal: 0,
        totalVotes: 0,
        averageCsatRate: 0,
        satPercent: "0%",
        neuPercent: "0%",
        unsPercent: "0%",
      };

      if (overviewRes.status === "fulfilled" && overviewRes.value.success && overviewRes.value.data) {
        const o = overviewRes.value.data;
        const total = o.totalVotes || 0;
        aggregatedStats = {
          satisfiedTotal: o.satisfiedVotes,
          neutralTotal: o.neutralVotes,
          unsatisfiedTotal: o.unsatisfiedVotes,
          totalVotes: total,
          averageCsatRate: o.csatScore,
          satPercent: total > 0 ? `${((o.satisfiedVotes / total) * 100).toFixed(1)}%` : "0%",
          neuPercent: total > 0 ? `${((o.neutralVotes / total) * 100).toFixed(1)}%` : "0%",
          unsPercent: total > 0 ? `${((o.unsatisfiedVotes / total) * 100).toFixed(1)}%` : "0%",
        };
      }

      // แปลง Hourly / Daily Trends
      let hourlyTrends: DashboardHourlyTrendPoint[] = [];
      if (trendsRes.status === "fulfilled" && trendsRes.value.success && Array.isArray(trendsRes.value.data)) {
        hourlyTrends = trendsRes.value.data.map((t) => ({
          hourLabel: t.timeLabel,
          timeLabel: t.timeLabel,
          satisfiedRate: t.csatScore,
          csatPercentage: t.csatScore,
          totalVotes: t.totalVotes,
          totalSurveys: t.totalVotes,
          satisfiedCount: t.satisfiedCount,
          neutralCount: t.neutralCount,
          unsatisfiedCount: t.unsatisfiedCount,
        }));
      }

      // แปลง Tier Grid Rows
      let provincialBranches: PerformanceTableRow[] = [];
      if (gridRes.status === "fulfilled" && gridRes.value.success && Array.isArray(gridRes.value.data)) {
        provincialBranches = gridRes.value.data.map((g) => ({
          id: g.id,
          name: g.name,
          subLabel: g.subTitle,
          code: g.code,
          csatRate: g.csatScore,
          totalVotes: g.totalVotes,
          satisfiedCount: g.satisfiedCount,
          neutralCount: g.neutralCount,
          unsatisfiedCount: g.unsatisfiedCount,
          status: g.status,
        }));
      }

      // แปลง Live Votes
      let liveVotes: LiveVoteItem[] = [];
      if (feedRes.status === "fulfilled" && feedRes.value.success && Array.isArray(feedRes.value.data)) {
        liveVotes = feedRes.value.data.map((f) => ({
          id: f.id,
          time: new Date(f.votedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
          branchName: f.branchName,
          brandName: f.brandName,
          kioskCode: f.kioskCode,
          sentiment: f.sentiment === 1 ? "satisfied" : f.sentiment === 2 ? "neutral" : "unsatisfied",
          scoreText: f.sentimentName,
        }));
      }

      return {
        aggregatedStats,
        superAdminBrands: provincialBranches,
        brandRegions: provincialBranches,
        regionalProvinces: provincialBranches,
        provincialBranches,
        branchKiosks: provincialBranches,
        hourlyTrends,
        liveVotes,
      };
    } catch (error) {
      console.error("[DashboardService] Error fetching data:", error);
      return {
        aggregatedStats: {
          satisfiedTotal: 0,
          neutralTotal: 0,
          unsatisfiedTotal: 0,
          totalVotes: 0,
          averageCsatRate: 0,
          satPercent: "0%",
          neuPercent: "0%",
          unsPercent: "0%",
        },
        superAdminBrands: [],
        brandRegions: [],
        regionalProvinces: [],
        provincialBranches: [],
        branchKiosks: [],
        hourlyTrends: [],
        liveVotes: [],
      };
    }
  },
};
