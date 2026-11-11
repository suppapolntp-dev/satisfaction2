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

export function computeDevStatsForDateRange(
  timeFilter: string = "today",
  startDate?: string,
  endDate?: string
): { stats: DashboardAggregatedStats; hourly: DashboardHourlyTrendPoint[] } {
  let days = 1;
  if (startDate && endDate) {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diff = Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    days = Math.max(1, diff + 1);
  } else if (timeFilter === "week") {
    days = 7;
  } else if (timeFilter === "month") {
    days = 30;
  } else if (timeFilter === "year") {
    days = 365;
  }

  // Base daily numbers: ~180-210 votes per day
  const dailyVotes = 192;
  const total = dailyVotes * days;
  const sat = Math.round(total * 0.865);
  const neu = Math.round(total * 0.096);
  const uns = total - sat - neu;
  const score = total > 0 ? Number(((sat / total) * 100).toFixed(1)) : 0;

  const stats: DashboardAggregatedStats = {
    satisfiedTotal: sat,
    neutralTotal: neu,
    unsatisfiedTotal: uns,
    totalVotes: total,
    averageCsatRate: score,
    satPercent: total > 0 ? `${((sat / total) * 100).toFixed(1)}%` : "0%",
    neuPercent: total > 0 ? `${((neu / total) * 100).toFixed(1)}%` : "0%",
    unsPercent: total > 0 ? `${((uns / total) * 100).toFixed(1)}%` : "0%",
    activeBranches: 12,
    activeKiosks: 18,
    comparisonChange: 2.4,
  };

  const hours = [
    { label: "10:00", factor: 0.05 },
    { label: "11:00", factor: 0.07 },
    { label: "12:00", factor: 0.16 },
    { label: "13:00", factor: 0.14 },
    { label: "14:00", factor: 0.06 },
    { label: "15:00", factor: 0.05 },
    { label: "16:00", factor: 0.06 },
    { label: "17:00", factor: 0.08 },
    { label: "18:00", factor: 0.15 },
    { label: "19:00", factor: 0.12 },
    { label: "20:00", factor: 0.04 },
    { label: "21:00", factor: 0.02 },
  ];

  const hourly: DashboardHourlyTrendPoint[] = hours.map((h) => {
    const hourTotal = Math.round(total * h.factor);
    const hourSat = Math.round(hourTotal * 0.865);
    const hourNeu = Math.round(hourTotal * 0.096);
    const hourUns = hourTotal - hourSat - hourNeu;
    return {
      hourLabel: h.label,
      timeLabel: h.label,
      satisfiedRate: 86.5,
      csatPercentage: 86.5,
      totalVotes: hourTotal,
      totalSurveys: hourTotal,
      satisfiedCount: hourSat,
      neutralCount: hourNeu,
      unsatisfiedCount: hourUns,
    };
  });

  return { stats, hourly };
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
  activeBranches: 12,
  activeKiosks: 18,
  comparisonChange: 2.4,
};

export const DEFAULT_DEV_SUPER_ADMIN_BRANDS: PerformanceTableRow[] = [
  { id: "br-kfc", code: "KFC", name: "KFC (เคเอฟซี)", subLabel: "Quick Service Restaurant · 5 สาขา", csatRate: 91.2, totalVotes: 615, satisfiedCount: 561, neutralCount: 38, unsatisfiedCount: 16, status: "Active", trendText: "+2.8% vs สัปดาห์ก่อน", isUp: true },
  { id: "br-oot", code: "OOT", name: "Ootoya (โอโตยะ)", subLabel: "Japanese Dining · 3 สาขา", csatRate: 92.2, totalVotes: 320, satisfiedCount: 295, neutralCount: 19, unsatisfiedCount: 6, status: "Active", trendText: "+1.9% vs สัปดาห์ก่อน", isUp: true },
  { id: "br-mdo", code: "MDO", name: "Mister Donut (มิสเตอร์ โดนัท)", subLabel: "Bakery & Cafe · 2 สาขา", csatRate: 83.5, totalVotes: 297, satisfiedCount: 248, neutralCount: 35, unsatisfiedCount: 14, status: "Active", trendText: "+0.6% vs สัปดาห์ก่อน", isUp: true },
  { id: "br-atn", code: "ATN", name: "Auntie Anne's (อานตี้ แอนส์)", subLabel: "Bakery & Pretzel · 2 สาขา", csatRate: 71.0, totalVotes: 252, satisfiedCount: 180, neutralCount: 50, unsatisfiedCount: 22, status: "Active", trendText: "-3.4% vs สัปดาห์ก่อน", isUp: false },
];

export const DEFAULT_DEV_BRAND_REGIONS: PerformanceTableRow[] = [
  { id: "reg-bkk", code: "REG-01", name: "กรุงเทพฯ และปริมณฑล", subLabel: "6 จังหวัด · 8 สาขา", csatRate: 89.4, totalVotes: 995, satisfiedCount: 890, neutralCount: 72, unsatisfiedCount: 33, status: "Active", trendText: "+2.1% vs สัปดาห์ก่อน", isUp: true },
  { id: "reg-central", code: "REG-02", name: "ภาคกลาง", subLabel: "4 จังหวัด · 2 สาขา", csatRate: 83.5, totalVotes: 297, satisfiedCount: 248, neutralCount: 35, unsatisfiedCount: 14, status: "Active", trendText: "+0.8% vs สัปดาห์ก่อน", isUp: true },
  { id: "reg-north", code: "REG-03", name: "ภาคเหนือ", subLabel: "3 จังหวัด · 2 สาขา", csatRate: 76.0, totalVotes: 192, satisfiedCount: 146, neutralCount: 35, unsatisfiedCount: 11, status: "Active", trendText: "-2.5% vs สัปดาห์ก่อน", isUp: false },
];

export const DEFAULT_DEV_REGIONAL_PROVINCES: PerformanceTableRow[] = [
  { id: "prv-bkk", code: "PRV-BKK", name: "กรุงเทพมหานคร", subLabel: "กรุงเทพฯ และปริมณฑล", csatRate: 90.8, totalVotes: 764, satisfiedCount: 694, neutralCount: 51, unsatisfiedCount: 19, status: "Active", trendText: "+2.6% vs สัปดาห์ก่อน", isUp: true },
  { id: "prv-ptm", code: "PRV-PTM", name: "ปทุมธานี", subLabel: "ภาคกลาง", csatRate: 83.5, totalVotes: 297, satisfiedCount: 248, neutralCount: 35, unsatisfiedCount: 14, status: "Active", trendText: "+0.9% vs สัปดาห์ก่อน", isUp: true },
  { id: "prv-spn", code: "PRV-SPN", name: "สมุทรปราการ", subLabel: "กรุงเทพฯ และปริมณฑล", csatRate: 71.0, totalVotes: 231, satisfiedCount: 164, neutralCount: 38, unsatisfiedCount: 29, status: "Active", trendText: "-3.1% vs สัปดาห์ก่อน", isUp: false },
  { id: "prv-cnx", code: "PRV-CNX", name: "เชียงใหม่", subLabel: "ภาคเหนือ", csatRate: 68.6, totalVotes: 172, satisfiedCount: 118, neutralCount: 26, unsatisfiedCount: 28, status: "Active", trendText: "-4.2% vs สัปดาห์ก่อน", isUp: false },
];

export const DEFAULT_DEV_PROVINCIAL_BRANCHES: PerformanceTableRow[] = [
  { id: "bch-01", code: "KFC-BKK-01", name: "Siam Paragon", subLabel: "KFC · กรุงเทพมหานคร", csatRate: 92.8, totalVotes: 444, satisfiedCount: 412, neutralCount: 24, unsatisfiedCount: 8, status: "Active", trendText: "+3.1% vs สัปดาห์ก่อน", isUp: true },
  { id: "bch-02", code: "OOT-BKK-01", name: "Central World", subLabel: "Ootoya · กรุงเทพมหานคร", csatRate: 92.2, totalVotes: 320, satisfiedCount: 295, neutralCount: 19, unsatisfiedCount: 6, status: "Active", trendText: "+1.9% vs สัปดาห์ก่อน", isUp: true },
  { id: "bch-03", code: "MDO-NON-01", name: "Future Park Rangsit", subLabel: "Mister Donut · ปทุมธานี", csatRate: 83.5, totalVotes: 297, satisfiedCount: 248, neutralCount: 35, unsatisfiedCount: 14, status: "Active", trendText: "+0.7% vs สัปดาห์ก่อน", isUp: true },
  { id: "bch-04", code: "ATN-BKK-02", name: "Mega Bangna", subLabel: "Auntie Anne's · สมุทรปราการ", csatRate: 71.0, totalVotes: 231, satisfiedCount: 164, neutralCount: 38, unsatisfiedCount: 29, status: "Active", trendText: "-3.1% vs สัปดาห์ก่อน", isUp: false },
  { id: "bch-05", code: "KFC-CNX-03", name: "Central Airport Chiangmai", subLabel: "KFC · เชียงใหม่", csatRate: 68.6, totalVotes: 172, satisfiedCount: 118, neutralCount: 26, unsatisfiedCount: 28, status: "Active", trendText: "-4.2% vs สัปดาห์ก่อน", isUp: false },
];

export const DEFAULT_DEV_BRANCH_KIOSKS: PerformanceTableRow[] = [
  { id: "ksk-01", code: "KFC-BKK-01-K01", name: "ตู้ Kiosk จุดรับอาหาร #1", subLabel: "Siam Paragon (KFC)", csatRate: 94.1, totalVotes: 254, satisfiedCount: 239, neutralCount: 11, unsatisfiedCount: 4, status: "Online", trendText: "Online", isUp: true },
  { id: "ksk-02", code: "KFC-BKK-01-K02", name: "ตู้ Kiosk ทางออกหน้าร้าน #2", subLabel: "Siam Paragon (KFC)", csatRate: 91.1, totalVotes: 190, satisfiedCount: 173, neutralCount: 13, unsatisfiedCount: 4, status: "Online", trendText: "Online", isUp: true },
  { id: "ksk-03", code: "OOT-BKK-01-K01", name: "ตู้ Kiosk เคาน์เตอร์ชำระเงิน", subLabel: "Central World (Ootoya)", csatRate: 92.2, totalVotes: 320, satisfiedCount: 295, neutralCount: 19, unsatisfiedCount: 6, status: "Online", trendText: "Online", isUp: true },
  { id: "ksk-04", code: "ATN-BKK-02-K01", name: "ตู้ Kiosk หน้าร้าน Mega Bangna", subLabel: "Mega Bangna (Auntie Anne's)", csatRate: 71.0, totalVotes: 231, satisfiedCount: 164, neutralCount: 38, unsatisfiedCount: 29, status: "Online", trendText: "ต้องตรวจสอบ (<80%)", isUp: false },
  { id: "ksk-05", code: "KFC-CNX-03-K01", name: "ตู้ Kiosk เชียงใหม่ แอร์พอร์ต #1", subLabel: "Central Airport Chiangmai (KFC)", csatRate: 68.6, totalVotes: 172, satisfiedCount: 118, neutralCount: 26, unsatisfiedCount: 28, status: "Online", trendText: "ต้องตรวจสอบ (<80%)", isUp: false },
];

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
  // 1. ดึงข้อมูลภาพรวมแดชบอร์ดทั้งหมด (รองรับแยกแบรนด์ brandId และเวลา timeFilter / startDate / endDate)
  async getDashboardData(
    timeFilter: string = "today",
    brandId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<DashboardDataResponse> {
    if (!isApiModeEnabled()) {
      return EMPTY_DASHBOARD_RESPONSE;
    }

    try {
      const isGuid = brandId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandId);
      const brandParam = isGuid ? `&brandId=${encodeURIComponent(brandId)}` : "";
      const dateParams =
        startDate && endDate
          ? `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate + (endDate.includes("T") ? "" : "T23:59:59"))}`
          : "";
      
      const devFallback = computeDevStatsForDateRange(timeFilter, startDate, endDate);

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
        apiClient.get<DashboardOverviewApiDto>(`/dashboard/overview?timeFilter=${timeFilter}${brandParam}${dateParams}`),
        apiClient.get<TrendChartApiDto[]>(`/dashboard/trends?interval=hourly&timeFilter=${timeFilter}${brandParam}${dateParams}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=brand${brandParam}&timeFilter=${timeFilter}${dateParams}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=region${brandParam}&timeFilter=${timeFilter}${dateParams}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=province${brandParam}&timeFilter=${timeFilter}${dateParams}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=branch${brandParam}&timeFilter=${timeFilter}${dateParams}`),
        apiClient.get<TierGridRowApiDto[]>(`/dashboard/grid?tierType=kiosk${brandParam}&timeFilter=${timeFilter}${dateParams}`),
        apiClient.get<LiveVoteFeedApiDto[]>(`/dashboard/live-feed?limit=20${brandParam}`),
      ]);

      // แปลง Overview Stats (ใช้ข้อมูลจริงจาก API หากมี หรือใช้คำนวณตาม Date Range เมื่อ API ออฟไลน์)
      let aggregatedStats: DashboardAggregatedStats = devFallback.stats;

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
          activeBranches: o.activeBranches ?? 0,
          activeKiosks: o.activeKiosks ?? 0,
          comparisonChange: o.comparisonChange !== undefined ? Number(o.comparisonChange) : undefined,
        };
      }

      // แปลง Hourly / Daily Trends
      let hourlyTrends: DashboardHourlyTrendPoint[] = devFallback.hourly;
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
            trendText: g.csatScore >= 80 ? "ตามเกณฑ์ (≥80%)" : "ต้องตรวจสอบ (<80%)",
            isUp: g.csatScore >= 80,
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
          const sentimentLabel = f.sentiment === 1 ? "ดี (Satisfied)" : f.sentiment === 2 ? "ปานกลาง (Neutral)" : "ปรับปรุง (Unsatisfied)";
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
        superAdminBrands: superAdminBrands.length > 0 ? superAdminBrands : DEFAULT_DEV_SUPER_ADMIN_BRANDS,
        brandRegions: brandRegions.length > 0 ? brandRegions : DEFAULT_DEV_BRAND_REGIONS,
        regionalProvinces: regionalProvinces.length > 0 ? regionalProvinces : DEFAULT_DEV_REGIONAL_PROVINCES,
        provincialBranches: provincialBranches.length > 0 ? provincialBranches : DEFAULT_DEV_PROVINCIAL_BRANCHES,
        branchKiosks: branchKiosks.length > 0 ? branchKiosks : DEFAULT_DEV_BRANCH_KIOSKS,
        hourlyTrends,
        liveVotes,
      };
    } catch (error) {
      console.warn("[DashboardService] Error or offline backend, using test fallback data:", error);
      const fallback = computeDevStatsForDateRange(timeFilter, startDate, endDate);
      return {
        aggregatedStats: fallback.stats,
        superAdminBrands: DEFAULT_DEV_SUPER_ADMIN_BRANDS,
        brandRegions: DEFAULT_DEV_BRAND_REGIONS,
        regionalProvinces: DEFAULT_DEV_REGIONAL_PROVINCES,
        provincialBranches: DEFAULT_DEV_PROVINCIAL_BRANCHES,
        branchKiosks: DEFAULT_DEV_BRANCH_KIOSKS,
        hourlyTrends: fallback.hourly,
        liveVotes: DEFAULT_DEV_LIVE_VOTES,
      };
    }
  },
};
