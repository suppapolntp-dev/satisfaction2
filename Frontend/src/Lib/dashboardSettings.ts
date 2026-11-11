"use client";

import { useState, useEffect } from "react";

// ==========================================================================
// ─── 1. INTERFACES (นิยามโครงสร้างการตั้งค่าหน้าแดชบอร์ด & กราฟ)
// ==========================================================================

export interface DashboardConfig {
  // ─── 1. กราฟแนวโน้มความพึงพอใจ (Sentiment Timeline Chart) ───
  chartHeight: number;                   // ความสูงของกราฟ (px) - ค่าตั้งต้น 260px (ช่วง 200 - 400px)
  chartCurveType: "smooth" | "straight"; // สไตล์เส้นกราฟ (smooth = เส้นโค้งนวล, straight = เส้นตรงเชิงมุม)
  showGridLines: boolean;                // แสดงเส้นตารางแกน Y พื้นหลัง
  showDataLabels: boolean;               // แสดงป้ายตัวเลขกำกับบนจุดโหวต

  // ─── 2. เกณฑ์เป้าหมาย & การรีเฟรชข้อมูล (Benchmarks & Polling) ───
  refreshInterval: string;               // รอบการรีเฟรช ("15s", "30s", "1m", "5m", "never")
  benchmarkThreshold: number;            // เกณฑ์เป้าหมาย CSAT (%) - ค่าตั้งต้น 80%
  enableRealtimeSound: boolean;          // เล่นเสียงแจ้งเตือนเมื่อมีโหวตใหม่เข้ามา

  // ─── 3. การวิเคราะห์ชั่วโมงวิกฤต (Peak Service Heatmap) ───
  defaultHeatmapView: "rate" | "count";  // มุมมองเริ่มต้น ("rate" = % Sad Rate, "count" = จำนวนโหวต)
  operatingHoursStart: number;           // ชั่วโมงเริ่มต้นเปิดให้บริการ (เช่น 10:00 น.)
  operatingHoursEnd: number;             // ชั่วโมงสิ้นสุดปิดให้บริการ (เช่น 21:00 น.)

  // ─── 4. ตารางเฝ้าระวัง & สตรีมสด (Watchlist & Live Stream) ───
  watchlistDefaultPageSize: number;      // จำนวนรายการต่อหน้าใน Watchlist (5, 10, 15, 20)
  maxLiveFeedItems: number;              // จำนวนรายการโหวตล่าสุดใน Live Feed (5, 10, 15, 20)
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  chartHeight: 260,
  chartCurveType: "smooth",
  showGridLines: true,
  showDataLabels: false,
  refreshInterval: "30s",
  benchmarkThreshold: 80,
  enableRealtimeSound: false,
  defaultHeatmapView: "rate",
  operatingHoursStart: 10,
  operatingHoursEnd: 21,
  watchlistDefaultPageSize: 5,
  maxLiveFeedItems: 5,
};

// ==========================================================================
// ─── 2. LOCAL STORAGE SYNC (ซิงก์ค่าระหว่าง System Settings กับ Dashboard)
// ==========================================================================

const DASHBOARD_STORAGE_KEY = "csat_dashboard_settings";
const DASHBOARD_UPDATE_EVENT = "csat_dashboard_settings_updated";

/**
 * ดึงค่าการตั้งค่าแดชบอร์ดจาก LocalStorage (Fallback ไปยังค่า Default หากยังไม่ได้ตั้งค่า)
 */
export function getStoredDashboardConfig(): DashboardConfig {
  if (typeof window === "undefined") {
    return DEFAULT_DASHBOARD_CONFIG;
  }
  try {
    const rawData = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (!rawData) {
      return DEFAULT_DASHBOARD_CONFIG;
    }
    const parsed = JSON.parse(rawData);
    return {
      ...DEFAULT_DASHBOARD_CONFIG,
      ...parsed,
      chartHeight: typeof parsed.chartHeight === "number" ? parsed.chartHeight : DEFAULT_DASHBOARD_CONFIG.chartHeight,
      chartCurveType: parsed.chartCurveType === "straight" ? "straight" : "smooth",
      showGridLines: typeof parsed.showGridLines === "boolean" ? parsed.showGridLines : true,
      showDataLabels: typeof parsed.showDataLabels === "boolean" ? parsed.showDataLabels : false,
      refreshInterval: parsed.refreshInterval || DEFAULT_DASHBOARD_CONFIG.refreshInterval,
      benchmarkThreshold: typeof parsed.benchmarkThreshold === "number" ? parsed.benchmarkThreshold : DEFAULT_DASHBOARD_CONFIG.benchmarkThreshold,
      enableRealtimeSound: Boolean(parsed.enableRealtimeSound),
      defaultHeatmapView: parsed.defaultHeatmapView === "count" ? "count" : "rate",
      operatingHoursStart: typeof parsed.operatingHoursStart === "number" ? parsed.operatingHoursStart : DEFAULT_DASHBOARD_CONFIG.operatingHoursStart,
      operatingHoursEnd: typeof parsed.operatingHoursEnd === "number" ? parsed.operatingHoursEnd : DEFAULT_DASHBOARD_CONFIG.operatingHoursEnd,
      watchlistDefaultPageSize: typeof parsed.watchlistDefaultPageSize === "number" ? parsed.watchlistDefaultPageSize : DEFAULT_DASHBOARD_CONFIG.watchlistDefaultPageSize,
      maxLiveFeedItems: typeof parsed.maxLiveFeedItems === "number" ? parsed.maxLiveFeedItems : DEFAULT_DASHBOARD_CONFIG.maxLiveFeedItems,
    };
  } catch (error) {
    console.error("Error reading dashboard config from localStorage:", error);
    return DEFAULT_DASHBOARD_CONFIG;
  }
}

/**
 * บันทึกการตั้งค่าแดชบอร์ดลง LocalStorage และกระจาย Custom Event แจ้งเตือนทุก Component
 */
export function saveStoredDashboardConfig(config: DashboardConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event(DASHBOARD_UPDATE_EVENT));
  } catch (error) {
    console.error("Error writing dashboard config to localStorage:", error);
  }
}

/**
 * React Hook สำหรับใช้และฟังการเปลี่ยนแปลงการตั้งค่าแดชบอร์ดแบบ Reactive
 */
export function useDashboardSettings() {
  const [config, setConfig] = useState<DashboardConfig>(getStoredDashboardConfig);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getStoredDashboardConfig());
    };
    window.addEventListener(DASHBOARD_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(DASHBOARD_UPDATE_EVENT, handleUpdate);
  }, []);

  const updateConfig = (newPartial: Partial<DashboardConfig>) => {
    const nextConfig = { ...config, ...newPartial };
    setConfig(nextConfig);
    saveStoredDashboardConfig(nextConfig);
  };

  return {
    dashboardSettings: config,
    updateDashboardSettings: updateConfig,
  };
}
