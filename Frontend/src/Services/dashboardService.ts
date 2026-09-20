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
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  csatScore: number;
  activeBranches: number;
  activeKiosks: number;
  comparisonChange?: number;
}

export interface TrendChartApiDto {
  periodLabel: string;
  positive: number;
  neutral: number;
  negative: number;
  totalVotes: number;
  csatScore: number;
}

export interface TierGridRowApiDto {
  id: string;
  code: string;
  name: string;
  subTitle: string;
  positive: number;
  neutral: number;
  negative: number;
  totalVotes: number;
  csatScore: number;
  kioskCount?: number;
  status: string;
}

export interface LiveVoteFeedApiDto {
  id: string;
  branchName: string;
  brandName: string;
  kioskName?: string;
  sentiment: number; // 1 = Positive, 2 = Neutral, 3 = Negative
  votedAt: string;
}

export const dashboardService = {
  // 1. ดึงข้อมูลภาพรวมแดชบอร์ดทั้งหมด (รองรับแยกแบรนด์ brandId และเวลา timeFilter)
  async getDashboardData(timeFilter: string = "today", brandId?: string): Promise<DashboardDataResponse> {
    try {
      const brandParam = brandId && brandId !== "ALL" ? `&brandId=${encodeURIComponent(brandId)}` : "";
      
      // ดึง Overview, Trends, Grid แยกตาม Brand, Region, Province, Branch, Kiosk ขนานกัน
      const [
        overviewRes, 
        trendsRes, 
        brandGridRes, 
        regionGridRes, 
        provinceGridRes, 
        branchGridRes, 
        kioskGridRes, 
        feedRes
      ] = await Promise.allSettled([
        apiClient.get<DashboardOverviewApiDto>(`/dashboard/overview?timeFilter=${timeFilter}${brandParam}`),
        apiClient.get<TrendChartApiDto[]>(`/dashboard/trends?interval=hourly&timeFilter=${timeFilter}${brandParam}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=brand${brandParam}&timeFilter=${timeFilter}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=region${brandParam}&timeFilter=${timeFilter}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=province${brandParam}&timeFilter=${timeFilter}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=branch${brandParam}&timeFilter=${timeFilter}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=kiosk${brandParam}&timeFilter=${timeFilter}`),
        apiClient.get<LiveVoteFeedApiDto[]>(`/dashboard/live-feed?limit=20${brandParam}`),
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
        const pos = o.positiveCount || 0;
        const neu = o.neutralCount || 0;
        const neg = o.negativeCount || 0;

        aggregatedStats = {
          satisfiedTotal: pos,
          neutralTotal: neu,
          unsatisfiedTotal: neg,
          totalVotes: total,
          averageCsatRate: o.csatScore || 0,
          satPercent: total > 0 ? `${((pos / total) * 100).toFixed(1)}%` : "0%",
          neuPercent: total > 0 ? `${((neu / total) * 100).toFixed(1)}%` : "0%",
          unsPercent: total > 0 ? `${((neg / total) * 100).toFixed(1)}%` : "0%",
        };
      }

      // แปลง Hourly / Daily Trends
      let hourlyTrends: DashboardHourlyTrendPoint[] = [];
      if (trendsRes.status === "fulfilled" && trendsRes.value.success && Array.isArray(trendsRes.value.data)) {
        hourlyTrends = trendsRes.value.data.map((t) => ({
          hourLabel: t.periodLabel,
          timeLabel: t.periodLabel,
          satisfiedRate: t.csatScore,
          csatPercentage: t.csatScore,
          totalVotes: t.totalVotes,
          totalSurveys: t.totalVotes,
          satisfiedCount: t.positive,
          neutralCount: t.neutral,
          unsatisfiedCount: t.negative,
        }));
      }

      const mapGridRows = (
        res: PromiseSettledResult<{ success: boolean; data: TierGridRowApiDto[] }>,
        defaultSub: string = ""
      ): PerformanceTableRow[] => {
        if (res.status === "fulfilled" && res.value.success && Array.isArray(res.value.data)) {
          return res.value.data.map((g) => ({
            id: g.id,
            name: g.name,
            subLabel: g.subTitle || defaultSub,
            code: g.code,
            csatRate: g.csatScore,
            totalVotes: g.totalVotes,
            satisfiedCount: g.positive,
            neutralCount: g.neutral,
            unsatisfiedCount: g.negative,
            status: g.status,
          }));
        }
        return [];
      };

      const superAdminBrands = mapGridRows(brandGridRes, "Brand");
      const brandRegions = mapGridRows(regionGridRes, "Region");
      const regionalProvinces = mapGridRows(provinceGridRes, "Province");
      const provincialBranches = mapGridRows(branchGridRes, "Branch");
      const branchKiosks = mapGridRows(kioskGridRes, "Kiosk");

      // แปลง Live Votes
      let liveVotes: LiveVoteItem[] = [];
      if (feedRes.status === "fulfilled" && feedRes.value.success && Array.isArray(feedRes.value.data)) {
        liveVotes = feedRes.value.data.map((f) => {
          const sentimentType = f.sentiment === 1 ? "satisfied" : f.sentiment === 2 ? "neutral" : "unsatisfied";
          const sentimentLabel = f.sentiment === 1 ? "ดี (Satisfied)" : f.sentiment === 2 ? "ปานกลาง (Neutral)" : "แย่ (Unsatisfied)";
          return {
            id: f.id,
            time: f.votedAt ? new Date(f.votedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "",
            branchName: f.branchName || "",
            brandName: f.brandName || "",
            kioskCode: f.kioskName || "ตู้ Kiosk หน้าร้าน",
            sentiment: sentimentType,
            scoreText: sentimentLabel,
          };
        });
      }

      return {
        aggregatedStats,
        superAdminBrands: superAdminBrands.length > 0 ? superAdminBrands : provincialBranches,
        brandRegions: brandRegions.length > 0 ? brandRegions : provincialBranches,
        regionalProvinces: regionalProvinces.length > 0 ? regionalProvinces : provincialBranches,
        provincialBranches,
        branchKiosks: branchKiosks.length > 0 ? branchKiosks : provincialBranches,
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
