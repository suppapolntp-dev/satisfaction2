export type TimeRangeFilter = "today" | "last_7_days" | "last_30_days" | "this_quarter" | "week" | "month" | "quarter" | "year";

export interface HourlyDataPoint {
  hourLabel: string;
  timeLabel?: string;
  satisfiedRate: number;
  csatPercentage?: number;
  totalVotes: number;
  totalSurveys?: number;
  satisfiedCount?: number;
  neutralCount?: number;
  unsatisfiedCount?: number;
}

export type DashboardHourlyTrendPoint = HourlyDataPoint;

export interface LiveVoteFeedItem {
  id: string;
  kioskName: string;
  sentiment: "happy" | "neutral" | "sad" | "satisfied" | "unsatisfied";
  sentimentLabel: string;
  timestamp: string;
}

export interface LiveVoteItem {
  id: string;
  time: string;
  branchName: string;
  brandName?: string;
  kioskCode?: string;
  sentiment: "satisfied" | "neutral" | "unsatisfied";
  scoreText: string;
}

export interface PerformanceTableRow {
  id: string;
  name: string;
  subLabel?: string;
  code?: string;
  csatRate: number;
  totalVotes: number;
  satisfiedCount: number;
  neutralCount: number;
  unsatisfiedCount: number;
  trendPercentage?: number;
  trendText?: string;
  isUp?: boolean;
  statusBadge?: "Active" | "Warning" | "Critical";
  status?: "ONLINE" | "EXCELLENT" | "GOOD" | "NEEDS_CHECK" | "BUSY" | string;
  kioskStatus?: "Online" | "Degraded" | "Offline";
  lastPing?: string;
}

export type DetailedPerformanceRow = PerformanceTableRow;

export interface DashboardAggregatedStats {
  satisfiedTotal: number;
  neutralTotal: number;
  unsatisfiedTotal: number;
  totalVotes: number;
  averageCsatRate: number;
  satPercent: string;
  neuPercent: string;
  unsPercent: string;
  activeBranches?: number;
  activeKiosks?: number;
  comparisonChange?: number;
}

export interface DashboardDataResponse {
  aggregatedStats?: DashboardAggregatedStats;
  superAdminBrands: PerformanceTableRow[];
  brandRegions: PerformanceTableRow[];
  regionalProvinces: PerformanceTableRow[];
  provincialBranches: PerformanceTableRow[];
  branchKiosks: PerformanceTableRow[];
  hourlyTrends: HourlyDataPoint[];
  liveVotes: LiveVoteItem[];
}

