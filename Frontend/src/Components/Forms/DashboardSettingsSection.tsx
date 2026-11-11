"use client";

import React from "react";
import { DashboardConfig } from "@/Lib/dashboardSettings";

export type DashboardSettingsState = DashboardConfig;

interface DashboardSettingsSectionProps {
  dashboardConfig: DashboardSettingsState;
  onUpdateDashboardConfig: (updatedFields: Partial<DashboardSettingsState>) => void;
}

const HEIGHT_PRESETS = [240, 260, 280, 320, 360];

export default function DashboardSettingsSection({
  dashboardConfig,
  onUpdateDashboardConfig,
}: DashboardSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Dashboard & Visualization Settings (การตั้งค่าแดชบอร์ดและกราฟ)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดความสูงกราฟ สไตล์เส้น รอบการซิงก์ข้อมูล และเกณฑ์เป้าหมายมาตรฐานความพึงพอใจ
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* ─── GROUP 1: SENTIMENT TIMELINE CHART SETTINGS ─── */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            1. กราฟแนวโน้มความพึงพอใจ (Sentiment Timeline Chart)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart Height (px) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  ความสูงของกราฟ (Chart Height)
                </label>
                <span className="text-xs font-mono font-bold text-[var(--primary)] bg-blue-50 px-2 py-0.5 rounded-md">
                  {dashboardConfig.chartHeight} px
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={200}
                  max={420}
                  step={10}
                  value={dashboardConfig.chartHeight}
                  onChange={(e) => onUpdateDashboardConfig({ chartHeight: Number(e.target.value) })}
                  className="w-full accent-[var(--primary)] cursor-pointer"
                />
              </div>
              {/* Height Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400">ขนาดแนะนำ:</span>
                {HEIGHT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpdateDashboardConfig({ chartHeight: preset })}
                    className={`px-2 py-0.5 text-[11px] rounded font-mono transition-colors cursor-pointer ${
                      dashboardConfig.chartHeight === preset
                        ? "bg-[var(--primary)] text-white font-semibold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {preset}px
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                ปรับความสูงของพื้นที่กราฟให้เหมาะกับขนาดหน้าจอและการแสดงผล
              </p>
            </div>

            {/* Line Curve Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                สไตล์เส้นกราฟ (Curve Tension)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateDashboardConfig({ chartCurveType: "smooth" })}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    dashboardConfig.chartCurveType === "smooth"
                      ? "border-[var(--primary)] bg-blue-50/50 text-slate-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="text-xs font-bold">เส้นโค้งนวล (Smooth)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">เส้นโค้ง Monotone ดูสบายตา</div>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateDashboardConfig({ chartCurveType: "straight" })}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    dashboardConfig.chartCurveType === "straight"
                      ? "border-[var(--primary)] bg-blue-50/50 text-slate-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="text-xs font-bold">เส้นตรงมุม (Linear)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">เส้นตรงหักมุม เห็นจุดชัดเจน</div>
                </button>
              </div>
            </div>

            {/* Show Gridlines */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-xs font-semibold text-slate-800">เส้นตารางพื้นหลัง (Grid Lines)</div>
                <div className="text-[11px] text-slate-500">แสดงเส้นประแนวนอนอ้างอิงสเกลแกน Y</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dashboardConfig.showGridLines}
                  onChange={(e) => onUpdateDashboardConfig({ showGridLines: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]" />
              </label>
            </div>

            {/* Show Data Labels */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-xs font-semibold text-slate-800">ป้ายตัวเลขกำกับจุด (Data Labels)</div>
                <div className="text-[11px] text-slate-500">แสดงตัวเลขคะแนนบนจุดข้อมูลทุกช่วงเวลา</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dashboardConfig.showDataLabels}
                  onChange={(e) => onUpdateDashboardConfig({ showDataLabels: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]" />
              </label>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ─── GROUP 2: BENCHMARK & AUTO-REFRESH ─── */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            2. เกณฑ์มาตรฐานความพึงพอใจ & รอบการรีเฟรช (Benchmarks & Polling)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Benchmark Threshold */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                เกณฑ์เป้าหมาย CSAT องค์กร (Benchmark Target %)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={dashboardConfig.benchmarkThreshold}
                  onChange={(e) => onUpdateDashboardConfig({ benchmarkThreshold: Number(e.target.value) })}
                  className="w-28 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold font-mono"
                />
                <span className="text-xs font-bold text-slate-600">% มาตรฐาน</span>
              </div>
              <p className="text-[11px] text-slate-400">
                สาขาที่มีคะแนนต่ำกว่าเกณฑ์นี้จะถูกจัดเข้าหมวด &quot;ต้องตรวจสอบ&quot; ใน Watchlist
              </p>
            </div>

            {/* Refresh Interval */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                รอบการดึงข้อมูลอัตโนมัติ (Auto-Refresh Interval)
              </label>
              <select
                value={dashboardConfig.refreshInterval}
                onChange={(e) => onUpdateDashboardConfig({ refreshInterval: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="15s">ทุก 15 วินาที (15s - รวดเร็ว)</option>
                <option value="30s">ทุก 30 วินาที (30s - แนะนำ)</option>
                <option value="1m">ทุก 1 นาที (1m)</option>
                <option value="5m">ทุก 5 นาที (5m)</option>
                <option value="never">รีเฟรชด้วยตนเองเท่านั้น (Manual)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                ความถี่ในการดึงสถิติใหม่จากตู้ Kiosk เข้าสู่หน้าแดชบอร์ด
              </p>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ─── GROUP 3: PEAK SERVICE HEATMAP SETTINGS ─── */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            3. แผนที่ความร้อนช่วงเวลาวิกฤต (Peak Service Heatmap)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Heatmap View Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                มุมมองเริ่มต้นของ Heatmap (Default Matrix View)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateDashboardConfig({ defaultHeatmapView: "rate" })}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    dashboardConfig.defaultHeatmapView === "rate"
                      ? "border-[var(--primary)] bg-blue-50/50 text-slate-900 font-bold"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="text-xs">อัตราส่วนปรับปรุง (% Sad)</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">เน้นชั่วโมงที่มีปัญหาบริการ</div>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateDashboardConfig({ defaultHeatmapView: "count" })}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    dashboardConfig.defaultHeatmapView === "count"
                      ? "border-[var(--primary)] bg-blue-50/50 text-slate-900 font-bold"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="text-xs">จำนวนโหวตรวม (Votes)</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">เน้นชั่วโมงที่มีลูกค้าหนาแน่น</div>
                </button>
              </div>
            </div>

            {/* Operating Hours Window */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                ช่วงเวลาทำการที่วิเคราะห์ (Operating Hours Window)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={6}
                  max={12}
                  value={dashboardConfig.operatingHoursStart}
                  onChange={(e) => onUpdateDashboardConfig({ operatingHoursStart: Number(e.target.value) })}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm font-mono"
                />
                <span className="text-xs text-slate-500">:00 น. ถึง</span>
                <input
                  type="number"
                  min={18}
                  max={24}
                  value={dashboardConfig.operatingHoursEnd}
                  onChange={(e) => onUpdateDashboardConfig({ operatingHoursEnd: Number(e.target.value) })}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm font-mono"
                />
                <span className="text-xs text-slate-500">:00 น.</span>
              </div>
              <p className="text-[11px] text-slate-400">
                กำหนดคอลัมน์เวลาเริ่มต้นและสิ้นสุดในตาราง Heatmap 7 วัน
              </p>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ─── GROUP 4: WATCHLIST & FEED SETTINGS ─── */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            4. ตารางเฝ้าระวัง & ฟีดสด (Watchlist & Live Stream)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Watchlist Default Page Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                จำนวนแถวเริ่มต้นต่อหน้าใน Watchlist
              </label>
              <select
                value={dashboardConfig.watchlistDefaultPageSize}
                onChange={(e) => onUpdateDashboardConfig({ watchlistDefaultPageSize: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value={5}>5 แถวต่อหน้า (กะทัดรัด - แนะนำ)</option>
                <option value={10}>10 แถวต่อหน้า</option>
                <option value={15}>15 แถวต่อหน้า</option>
                <option value={20}>20 แถวต่อหน้า</option>
              </select>
            </div>

            {/* Max Live Feed Items */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                จำนวนรายการโหวตล่าสุดใน Live Feed
              </label>
              <select
                value={dashboardConfig.maxLiveFeedItems}
                onChange={(e) => onUpdateDashboardConfig({ maxLiveFeedItems: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value={5}>5 รายการล่าสุด (แนะนำ)</option>
                <option value={10}>10 รายการล่าสุด</option>
                <option value={15}>15 รายการล่าสุด</option>
                <option value={20}>20 รายการล่าสุด</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
