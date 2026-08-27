import { apiClient } from "./apiClient";
import {
  PerformanceTableRow,
  DashboardHourlyTrendPoint,
  DashboardAggregatedStats,
  LiveVoteItem,
  DashboardDataResponse,
  TimeRangeFilter,
} from "@/Types/dashboard";

export const dashboardService = {
  async getDashboardData(timeFilter: string = "today"): Promise<DashboardDataResponse> {
    try {
      const response = await apiClient.get<DashboardDataResponse>(`/dashboard?timeRange=${timeFilter}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

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
  },
};
