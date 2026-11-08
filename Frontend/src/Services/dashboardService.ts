import { apiClient, isApiModeEnabled } from "./apiClient";
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

export const DEFAULT_DEV_AGGREGATED_STATS: DashboardAggregatedStats = {
  satisfiedTotal: 1284,
  neutralTotal: 142,
  unsatisfiedTotal: 58,
  totalVotes: 1484,
  averageCsatRate: 86.5,
  satPercent: "86.5%",
  neuPercent: "9.6%",
  unsPercent: "3.9%",
};

export const DEFAULT_DEV_HOURLY_TRENDS: DashboardHourlyTrendPoint[] = [
  { hourLabel: "08:00", timeLabel: "08:00", satisfiedRate: 88, csatPercentage: 88, totalVotes: 45, satisfiedCount: 40, neutralCount: 4, unsatisfiedCount: 1 },
  { hourLabel: "09:00", timeLabel: "09:00", satisfiedRate: 91, csatPercentage: 91, totalVotes: 78, satisfiedCount: 71, neutralCount: 5, unsatisfiedCount: 2 },
  { hourLabel: "10:00", timeLabel: "10:00", satisfiedRate: 94, csatPercentage: 94, totalVotes: 120, satisfiedCount: 113, neutralCount: 5, unsatisfiedCount: 2 },
  { hourLabel: "11:00", timeLabel: "11:00", satisfiedRate: 89, csatPercentage: 89, totalVotes: 195, satisfiedCount: 174, neutralCount: 15, unsatisfiedCount: 6 },
  { hourLabel: "12:00", timeLabel: "12:00", satisfiedRate: 82, csatPercentage: 82, totalVotes: 260, satisfiedCount: 213, neutralCount: 32, unsatisfiedCount: 15 },
  { hourLabel: "13:00", timeLabel: "13:00", satisfiedRate: 85, csatPercentage: 85, totalVotes: 210, satisfiedCount: 178, neutralCount: 22, unsatisfiedCount: 10 },
  { hourLabel: "14:00", timeLabel: "14:00", satisfiedRate: 90, csatPercentage: 90, totalVotes: 115, satisfiedCount: 103, neutralCount: 9, unsatisfiedCount: 3 },
  { hourLabel: "15:00", timeLabel: "15:00", satisfiedRate: 92, csatPercentage: 92, totalVotes: 95, satisfiedCount: 87, neutralCount: 6, unsatisfiedCount: 2 },
  { hourLabel: "16:00", timeLabel: "16:00", satisfiedRate: 88, csatPercentage: 88, totalVotes: 110, satisfiedCount: 97, neutralCount: 9, unsatisfiedCount: 4 },
  { hourLabel: "17:00", timeLabel: "17:00", satisfiedRate: 84, csatPercentage: 84, totalVotes: 180, satisfiedCount: 151, neutralCount: 20, unsatisfiedCount: 9 },
  { hourLabel: "18:00", timeLabel: "18:00", satisfiedRate: 81, csatPercentage: 81, totalVotes: 225, satisfiedCount: 182, neutralCount: 28, unsatisfiedCount: 15 },
  { hourLabel: "19:00", timeLabel: "19:00", satisfiedRate: 86, csatPercentage: 86, totalVotes: 170, satisfiedCount: 146, neutralCount: 18, unsatisfiedCount: 6 },
  { hourLabel: "20:00", timeLabel: "20:00", satisfiedRate: 93, csatPercentage: 93, totalVotes: 98, satisfiedCount: 91, neutralCount: 5, unsatisfiedCount: 2 },
  { hourLabel: "21:00", timeLabel: "21:00", satisfiedRate: 95, csatPercentage: 95, totalVotes: 42, satisfiedCount: 40, neutralCount: 2, unsatisfiedCount: 0 },
];

export const DEFAULT_DEV_LIVE_VOTES: LiveVoteItem[] = [
  { id: "lv-1", time: "18:42", branchName: "Siam Paragon", brandName: "KFC", kioskCode: "KFC-BKK-01-K01", sentiment: "satisfied", scoreText: "ดี (Satisfied)" },
  { id: "lv-2", time: "18:39", branchName: "Future Park Rangsit", brandName: "Mister Donut", kioskCode: "MDO-NON-01-K01", sentiment: "satisfied", scoreText: "ดี (Satisfied)" },
  { id: "lv-3", time: "18:35", branchName: "Central World", brandName: "Ootoya", kioskCode: "OOT-BKK-01-K02", sentiment: "satisfied", scoreText: "ดี (Satisfied)" },
  { id: "lv-4", time: "18:30", branchName: "Mega Bangna", brandName: "Auntie Anne's", kioskCode: "ATN-BKK-02-K01", sentiment: "neutral", scoreText: "ปานกลาง (Neutral)" },
  { id: "lv-5", time: "18:22", branchName: "Central Chiangmai", brandName: "KFC", kioskCode: "KFC-CNX-01-K02", sentiment: "satisfied", scoreText: "ดี (Satisfied)" },
];

export const EMPTY_DASHBOARD_RESPONSE: DashboardDataResponse = {
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

export const dashboardService = {
  // 1. ดึงข้อมูลภาพรวมแดชบอร์ดทั้งหมด (รองรับแยกแบรนด์ brandId และเวลา timeFilter)
  async getDashboardData(timeFilter: string = "today", brandId?: string): Promise<DashboardDataResponse> {
    if (!isApiModeEnabled()) {
      return EMPTY_DASHBOARD_RESPONSE;
    }

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
      let aggregatedStats: DashboardAggregatedStats = DEFAULT_DEV_AGGREGATED_STATS;

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
          averageCsatRate: Number(o.csatScore) || 0,
          satPercent: total > 0 ? `${((pos / total) * 100).toFixed(1)}%` : "0%",
          neuPercent: total > 0 ? `${((neu / total) * 100).toFixed(1)}%` : "0%",
          unsPercent: total > 0 ? `${((neg / total) * 100).toFixed(1)}%` : "0%",
        };
      }

      // แปลง Hourly / Daily Trends
      let hourlyTrends: DashboardHourlyTrendPoint[] = DEFAULT_DEV_HOURLY_TRENDS;
      if (trendsRes.status === "fulfilled" && trendsRes.value.success && Array.isArray(trendsRes.value.data) && trendsRes.value.data.length > 0) {
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
      let liveVotes: LiveVoteItem[] = DEFAULT_DEV_LIVE_VOTES;
      if (feedRes.status === "fulfilled" && feedRes.value.success && Array.isArray(feedRes.value.data) && feedRes.value.data.length > 0) {
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
      console.warn("[DashboardService] Error or offline backend, using test fallback data:", error);
      return {
        aggregatedStats: DEFAULT_DEV_AGGREGATED_STATS,
        superAdminBrands: [],
        brandRegions: [],
        regionalProvinces: [],
        provincialBranches: [],
        branchKiosks: [],
        hourlyTrends: DEFAULT_DEV_HOURLY_TRENDS,
        liveVotes: DEFAULT_DEV_LIVE_VOTES,
      };
    }
  },
};
