"use client";

import React, { useState, useEffect, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import ExportModal from "@/Components/Modals/ExportModal";
import SelectInput from "@/Components/Inputs/SelectInput";
import DetailedPerformanceTable from "@/Components/Tables/DetailedPerformanceTable";
import {
  getActiveDataAccessProfile,
  UserDataAccessProfile,
  PRESET_TIER_PROFILES,
  saveActiveDataAccessProfile,
} from "@/Lib/dataAccessContext";
import {
  TimeRangeFilter,
  PerformanceTableRow,
  HourlyDataPoint,
  LiveVoteFeedItem,
  DashboardAggregatedStats,
} from "@/Types/dashboard";
import { dashboardService } from "@/Services/dashboardService";
import { brandService, BrandModel } from "@/Services/brandService";

// ==========================================================================
// ─── MAIN DASHBOARD COMPONENT
// ==========================================================================

export default function DashboardScreen() {
  const [timeFilter, setTimeFilter] = useState<TimeRangeFilter>("today");
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<HourlyDataPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── อ่านสิทธิ์ True / False จาก Data Access Profile ───
  const [activeProfile, setActiveProfile] = useState<UserDataAccessProfile>(getActiveDataAccessProfile());

  useEffect(() => {
    setActiveProfile(getActiveDataAccessProfile());

    const handleDataUpdate = () => {
      setActiveProfile(getActiveDataAccessProfile());
    };

    window.addEventListener("csat_data_access_updated", handleDataUpdate);
    return () => window.removeEventListener("csat_data_access_updated", handleDataUpdate);
  }, []);

  const { permissions } = activeProfile;

  // ─── State สำหรับข้อมูล 5 ระดับ ───
  const [brandsList, setBrandsList] = useState<BrandModel[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("ALL");
  const [superAdminBrands, setSuperAdminBrands] = useState<PerformanceTableRow[]>([]);
  const [brandRegions, setBrandRegions] = useState<PerformanceTableRow[]>([]);
  const [regionalProvinces, setRegionalProvinces] = useState<PerformanceTableRow[]>([]);
  const [provincialBranches, setProvincialBranches] = useState<PerformanceTableRow[]>([]);
  const [kiosksData, setKiosksData] = useState<PerformanceTableRow[]>([]);
  const [currentChartData, setCurrentChartData] = useState<HourlyDataPoint[]>([]);
  const [liveVotesFeed, setLiveVotesFeed] = useState<LiveVoteFeedItem[]>([]);
  const [serverStats, setServerStats] = useState<DashboardAggregatedStats | null>(null);

  // โหลดรายการแบรนด์ทั้งหมดสำหรับ Filter
  useEffect(() => {
    async function loadBrands() {
      try {
        const bList = await brandService.getBrands();
        setBrandsList(bList || []);
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    }
    loadBrands();
  }, []);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setIsLoading(true);
        const data = await dashboardService.getDashboardData(timeFilter, selectedBrandId);
        if (data.aggregatedStats) {
          setServerStats(data.aggregatedStats);
        }
        setSuperAdminBrands(data.superAdminBrands || []);
        setBrandRegions(data.brandRegions || []);
        setRegionalProvinces(data.regionalProvinces || []);
        setProvincialBranches(data.provincialBranches || []);
        setKiosksData(data.branchKiosks || []);
        setCurrentChartData(data.hourlyTrends || []);
        if (data.liveVotes && data.liveVotes.length > 0) {
          setLiveVotesFeed(
            data.liveVotes.map((v) => ({
              id: v.id,
              kioskName: `${v.kioskCode || ""} - ${v.branchName || ""}`.trim().replace(/^-\s*|\s*-$/g, ""),
              sentiment: v.sentiment === "satisfied" ? "happy" : v.sentiment === "neutral" ? "neutral" : "sad",
              sentimentLabel: v.scoreText || "",
              timestamp: v.time || "",
            }))
          );
        } else {
          setLiveVotesFeed([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, [timeFilter, selectedBrandId]);

  // Live Stream Simulation
  useEffect(() => {
    if (!isLiveStreamActive || kiosksData.length === 0) return;

    const interval = setInterval(() => {
      const randomKiosk = kiosksData[Math.floor(Math.random() * kiosksData.length)];
      if (!randomKiosk) return;

      const sentiments: Array<{ type: "happy" | "neutral" | "sad"; label: string }> = [
        { type: "happy", label: "ดี (Satisfied)" },
        { type: "happy", label: "ดี (Satisfied)" },
        { type: "neutral", label: "ปานกลาง (Neutral)" },
        { type: "happy", label: "ดี (Satisfied)" },
      ];
      const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

      const newVote: LiveVoteFeedItem = {
        id: `VOT-${Date.now()}`,
        kioskName: randomKiosk.name || "",
        sentiment: randomSentiment.type,
        sentimentLabel: randomSentiment.label,
        timestamp: "เมื่อสักครู่",
      };

      setLiveVotesFeed((prev) => [newVote, ...prev.slice(0, 5)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLiveStreamActive, kiosksData]);

  // สถิติ KPI รวม (ดึงตรงจาก Server หรือคำนวณจากตารางสรุปผล)
  const aggregatedStats = useMemo(() => {
    if (serverStats && serverStats.totalVotes > 0) {
      return {
        totalVotes: serverStats.totalVotes.toLocaleString(),
        satisfied: serverStats.satisfiedTotal.toLocaleString(),
        neutral: serverStats.neutralTotal.toLocaleString(),
        unsatisfied: serverStats.unsatisfiedTotal.toLocaleString(),
        satPercent: serverStats.satPercent,
        neuPercent: serverStats.neuPercent,
        unsPercent: serverStats.unsPercent,
        csatScore: `${serverStats.averageCsatRate}%`,
        hasData: true,
      };
    }

    let total = 0;
    let sat = 0;
    let neu = 0;
    let uns = 0;

    kiosksData.forEach((k) => {
      total += k.totalVotes || 0;
      sat += k.satisfiedCount || 0;
      neu += k.neutralCount || 0;
      uns += k.unsatisfiedCount || 0;
    });

    if (total === 0 && provincialBranches.length > 0) {
      provincialBranches.forEach((b) => {
        total += b.totalVotes || 0;
        sat += b.satisfiedCount || 0;
        neu += b.neutralCount || 0;
        uns += b.unsatisfiedCount || 0;
      });
    }

    const satP = total > 0 ? ((sat / total) * 100).toFixed(1) : "0.0";
    const neuP = total > 0 ? ((neu / total) * 100).toFixed(1) : "0.0";
    const unsP = total > 0 ? ((uns / total) * 100).toFixed(1) : "0.0";

    return {
      totalVotes: total.toLocaleString(),
      satisfied: sat.toLocaleString(),
      neutral: neu.toLocaleString(),
      unsatisfied: uns.toLocaleString(),
      satPercent: `${satP}%`,
      neuPercent: `${neuP}%`,
      unsPercent: `${unsP}%`,
      csatScore: total > 0 ? `${satP}%` : "-",
      hasData: total > 0,
    };
  }, [serverStats, kiosksData, provincialBranches]);

  const kpiStatsItems: StatItem[] = useMemo(
    () => [
      { label: "ยอดประเมินรวมทั้งหมด", value: aggregatedStats.totalVotes || "-", change: "", isUp: true, icon: "poll", color: "text-slate-600" },
      { label: "พึงพอใจมาก (ดี)", value: aggregatedStats.satisfied || "-", change: aggregatedStats.hasData ? `${aggregatedStats.satPercent} ของโหวตทั้งหมด` : "", isUp: true, icon: "sentiment_satisfied", color: "text-emerald-600" },
      { label: "ปานกลาง (เฉยๆ)", value: aggregatedStats.neutral || "-", change: aggregatedStats.hasData ? `${aggregatedStats.neuPercent} ของโหวตทั้งหมด` : "", isUp: true, icon: "sentiment_neutral", color: "text-amber-600" },
      { label: "ไม่พอใจ (แย่)", value: aggregatedStats.unsatisfied || "-", change: aggregatedStats.hasData ? `${aggregatedStats.unsPercent} ของโหวตทั้งหมด` : "", isUp: false, icon: "sentiment_dissatisfied", color: "text-rose-600" },
    ],
    [aggregatedStats]
  );

  const sortedKiosks = useMemo(() => [...kiosksData].sort((a, b) => (b.csatRate || 0) - (a.csatRate || 0)), [kiosksData]);
  const topKiosks = useMemo(() => sortedKiosks.slice(0, 3), [sortedKiosks]);
  const bottomKiosks = useMemo(() => sortedKiosks.slice(-2).reverse(), [sortedKiosks]);

  // Handler for quick tier switching
  const handleSwitchTier = (tierKey: string) => {
    const preset = PRESET_TIER_PROFILES[tierKey];
    if (preset) {
      saveActiveDataAccessProfile(preset);
      setActiveProfile(preset);
    }
  };

  // Determine current active tier key
  const currentTierKey = useMemo(() => {
    if (permissions.canViewSuperAdminOverview) return "SUPER_ADMIN";
    if (permissions.canViewBrandRegionalGrid) return "BRAND_OWNER";
    if (permissions.canViewRegionalProvinceGrid) return "REGIONAL_MANAGER";
    if (permissions.canViewProvincialBranchGrid) return "AREA_MANAGER";
    return "BRANCH_STAFF";
  }, [permissions]);

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200/80">
              Enterprise Analytics Console
            </span>
            <span className="text-[10px] font-semibold text-slate-400">|</span>
            <span className="text-[11px] font-medium text-slate-500">SLA Benchmark: 90.0%</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-3xl">analytics</span>
            Executive Customer Satisfaction Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบติดตามผลการประเมินลูกค้าแบบเรียลไทม์ ตรวจวัดดัชนี CSAT Pulse และวิเคราะห์ศักยภาพแยกตามแบรนด์และสาขา
          </p>
        </div>

        {/* แผงควบคุมตัวกรองแบรนด์, เวลา, สลับสิทธิ์จำลอง และปุ่ม Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Brand Filter Selector (แยกแบรนด์) */}
          <div className="flex items-center gap-1.5 bg-blue-50/70 p-1.5 rounded-xl border border-blue-200/80 text-xs shadow-2xs">
            <span className="material-symbols-outlined text-blue-900 text-base pl-1">storefront</span>
            <span className="text-[11px] font-bold text-blue-900 hidden sm:inline">แบรนด์:</span>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="bg-white border border-blue-200/80 rounded-lg px-2.5 py-1 text-xs font-bold text-blue-950 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-800 cursor-pointer min-w-[140px]"
            >
              <option value="ALL">🏢 ทุกแบรนด์ในเครือ (All Brands)</option>
              {brandsList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.brandName} ({b.brandId || b.category})
                </option>
              ))}
            </select>
          </div>

          {/* Tier Permission View Switcher (Segmented Style) */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <span className="material-symbols-outlined text-blue-900 text-base pl-1">shield_person</span>
            <span className="text-[11px] font-bold text-slate-600 hidden sm:inline">ระดับสิทธิ์:</span>
            <select
              value={currentTierKey}
              onChange={(e) => handleSwitchTier(e.target.value)}
              className="bg-white border border-slate-200/60 rounded-lg px-2.5 py-1 text-xs font-bold text-blue-900 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-800 cursor-pointer"
            >
              <option value="SUPER_ADMIN">Tier 1: Super Admin (5 ตาราง)</option>
              <option value="BRAND_OWNER">Tier 2: Brand Manager (4 ตาราง)</option>
              <option value="REGIONAL_MANAGER">Tier 3: Regional Manager (3 ตาราง)</option>
              <option value="AREA_MANAGER">Tier 4: Area Manager (2 ตาราง)</option>
              <option value="BRANCH_STAFF">Tier 5: Branch Staff (1 ตาราง)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsLiveStreamActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              isLiveStreamActive
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveStreamActive ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
            {isLiveStreamActive ? "Live Pulse: Active" : "Pulse Paused"}
          </button>

          <SelectInput
            value={timeFilter}
            onChange={(val) => setTimeFilter(val as TimeRangeFilter)}
            options={[
              { value: "today", label: "Today (วันนี้)" },
              { value: "last_7_days", label: "Last 7 Days (7 วันล่าสุด)" },
              { value: "last_30_days", label: "Last 30 Days (30 วันล่าสุด)" },
              { value: "this_quarter", label: "This Quarter (ไตรมาสนี้)" },
            ]}
          />

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="btn-primary text-xs shadow-xs hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSAT Report
          </button>
        </div>
      </div>

      {/* ─── 2. STATS & KPI GRID SECTION ─── */}
      <StatsGrid data={kpiStatsItems}>
        {/* การ์ด CSAT Score Meter ไฮไลต์พิเศษ สไตล์ Enterprise Glass/Navy */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden border border-blue-800/40">
          <div className="flex justify-between items-start z-10">
            <div>
              <span className="text-[10px] font-bold text-blue-300/90 uppercase tracking-widest">
                Overall CSAT Score
              </span>
              <div className="text-[11px] text-slate-300 font-medium mt-0.5">SLA Benchmark 90.0%</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-800/60 backdrop-blur-xs flex items-center justify-center border border-blue-700/80 shadow-2xs">
              <span className="material-symbols-outlined text-blue-200 text-[18px]">verified</span>
            </div>
          </div>
          
          <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight z-10 mt-3 flex items-baseline gap-2">
            <span>{aggregatedStats.csatScore || "-"}</span>
            {aggregatedStats.hasData && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {parseFloat(aggregatedStats.satPercent) >= 90 ? "On Target" : "Under SLA"}
              </span>
            )}
          </div>

          <div className="text-xs text-blue-200 mt-2 font-medium z-10 flex items-center justify-between min-h-[20px] pt-2 border-t border-white/10">
            <span className="text-slate-300 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ความพึงพอใจองค์กร
            </span>
            <span className="text-[11px] font-bold text-blue-200">
              {aggregatedStats.totalVotes ? `${aggregatedStats.totalVotes} responses` : "No data"}
            </span>
          </div>

          <span className="material-symbols-outlined absolute right-[-10px] bottom-[-15px] text-white/5 text-8xl pointer-events-none select-none">
            insights
          </span>
        </div>
      </StatsGrid>

      {/* ─── 3. VISUAL CHARTS & REAL-TIME MONITORING WIDGETS ─── */}
      <div className="space-y-6">
        
        {/* Charts Row: Hourly Trend + Sentiment Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Interactive Satisfaction Trend Chart (Pure SVG / Tailwind - ไม่พึ่งพา Material UI) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex flex-wrap justify-between items-center mb-4 pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">show_chart</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    แนวโน้มคะแนนความพึงพอใจรายชั่วโมง (Hourly CSAT Pulse)
                    {selectedBrandId !== "ALL" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        {brandsList.find((b) => b.id === selectedBrandId)?.brandName || "แบรนด์ที่เลือก"}
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500">เปรียบเทียบอัตราความพึงพอใจกับเป้าหมาย SLA Benchmark (90%)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <span className="w-2 h-0.5 bg-emerald-600 inline-block" />
                  <span>SLA 90%</span>
                </div>
                <span className="badge-live">Live Stream</span>
              </div>
            </div>

            {/* Interactive Pure SVG / Tailwind Chart with Dual Metrics */}
            <div className="flex-1 flex flex-col justify-end min-h-[220px] relative mt-2">
              {/* Target SLA (90%) Line */}
              <div className="absolute top-[18%] left-0 right-0 border-b-2 border-dashed border-emerald-500/60 flex justify-between items-center pointer-events-none z-10">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                  Target SLA Benchmark (90%)
                </span>
              </div>

              {currentChartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-12">
                  ยังไม่มีข้อมูลแนวโน้มรายชั่วโมงสำหรับแบรนด์นี้
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-3 items-end h-44 border-b border-slate-200 pb-2 px-2 z-20">
                  {currentChartData.map((dp, idx) => {
                    const rate = dp.satisfiedRate || dp.csatPercentage || 0;
                    const heightPercent = rate > 0 ? Math.max(14, rate) : 4;
                    const isHovered = hoveredDataPoint?.hourLabel === dp.hourLabel;
                    const isOnTarget = rate >= 90;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredDataPoint(dp)}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end relative"
                      >
                        {isHovered && (
                          <div className="absolute -top-12 z-30 text-[10px] font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap">
                            {rate > 0 ? `${rate}% CSAT` : "-"} • {dp.totalVotes || dp.totalSurveys || 0} โหวต
                          </div>
                        )}
                        <div
                          className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${
                            isOnTarget
                              ? "bg-blue-900 group-hover:bg-blue-950"
                              : rate > 0
                              ? "bg-amber-500 group-hover:bg-amber-600"
                              : "bg-slate-200"
                          } ${isHovered ? "ring-2 ring-blue-900 scale-105" : ""}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">
                          {dp.hourLabel || dp.timeLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 mt-1 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-900" /> อัตราความพึงพอใจ CSAT ผ่านเกณฑ์ (≥90%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> ต่ำกว่าเกณฑ์เป้าหมาย (&lt;90%)
              </span>
            </div>
          </div>

          {/* Sentiment Distribution Breakdown (Donut Gauge Style matching -45° to 225°) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">donut_large</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">สัดส่วนความพึงพอใจ</h2>
                  <p className="text-[11px] text-slate-500">จำแนกตามคะแนนโหวตของลูกค้า (Donut Gauge)</p>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-extrabold bg-slate-100 px-2.5 py-1 rounded-md">
                {aggregatedStats.totalVotes ? `${aggregatedStats.totalVotes} โหวต` : "-"}
              </span>
            </div>

            {/* Gauge Arc Donut Visualization */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
              {/* SVG Donut / Pie Chart */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg width="220" height="220" viewBox="0 0 240 240" className="transform drop-shadow-xs">
                  {(() => {
                    const cx = 120, cy = 120;
                    const innerR = 40;
                    const outerR = 95;

                    // ดึงคะแนนจริง หรือใช้ค่าเริ่มต้นจำลองหากยังไม่มีการโหวต เพื่อให้เห็น PieChart สวยงามเสมอ
                    const rawTotal = parseInt(aggregatedStats.totalVotes.replace(/,/g, "")) || 0;
                    const satVal = rawTotal > 0 ? (parseInt(aggregatedStats.satisfied.replace(/,/g, "")) || 0) : 72;
                    const neuVal = rawTotal > 0 ? (parseInt(aggregatedStats.neutral.replace(/,/g, "")) || 0) : 18;
                    const unsVal = rawTotal > 0 ? (parseInt(aggregatedStats.unsatisfied.replace(/,/g, "")) || 0) : 10;
                    const totalVal = satVal + neuVal + unsVal;

                    // สเปก: startAngle: -45, endAngle: 225 (ช่วงมุม 270 องศา หรือ 360 องศา Donut Pie)
                    // กวาดมุมจาก -45° ไปถึง 225° รวม 270 องศา
                    const startAngleOffset = -45;
                    const totalAngleSpan = 270;
                    const paddingDeg = 3;

                    const polarToX = (r: number, angleDeg: number) => cx + r * Math.cos((angleDeg - 90) * Math.PI / 180);
                    const polarToY = (r: number, angleDeg: number) => cy + r * Math.sin((angleDeg - 90) * Math.PI / 180);

                    // สร้าง path รูป sector (ชิ้นพายโดนัท มี innerRadius และ outerRadius)
                    const createDonutSlice = (startA: number, endA: number) => {
                      if (endA - startA <= 0.5) return "";
                      const x1 = polarToX(outerR, startA);
                      const y1 = polarToY(outerR, startA);
                      const x2 = polarToX(outerR, endA);
                      const y2 = polarToY(outerR, endA);
                      const x3 = polarToX(innerR, endA);
                      const y3 = polarToY(innerR, endA);
                      const x4 = polarToX(innerR, startA);
                      const y4 = polarToY(innerR, startA);
                      const largeArc = (endA - startA) > 180 ? 1 : 0;

                      return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
                    };

                    // วาด Background Track ช่องว่างช่วงที่เหลือ (จาก 225° ถึง 315°/ -45°)
                    const bgTrackPath = (() => {
                      const x1 = polarToX(outerR, 225);
                      const y1 = polarToY(outerR, 225);
                      const x2 = polarToX(outerR, 315);
                      const y2 = polarToY(outerR, 315);
                      const x3 = polarToX(innerR, 315);
                      const y3 = polarToY(innerR, 315);
                      const x4 = polarToX(innerR, 225);
                      const y4 = polarToY(innerR, 225);
                      return `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;
                    })();

                    const slices = [
                      { value: satVal, color: "#10b981", hoverColor: "#059669", label: "พึงพอใจมาก (ดี)" },
                      { value: neuVal, color: "#f59e0b", hoverColor: "#d97706", label: "ปานกลาง (เฉยๆ)" },
                      { value: unsVal, color: "#f43f5e", hoverColor: "#e11d48", label: "ไม่พอใจ (แย่)" },
                    ];

                    let currentA = startAngleOffset;

                    return (
                      <>
                        {/* ช่องเปิดด้านล่างของ Gauge Pie (-45° ถึง 225°) */}
                        <path d={bgTrackPath} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />

                        {slices.map((slice, i) => {
                          const sliceSpan = (slice.value / totalVal) * totalAngleSpan;
                          const startA = currentA + (paddingDeg / 2);
                          const endA = currentA + sliceSpan - (paddingDeg / 2);
                          currentA += sliceSpan;

                          const pathData = createDonutSlice(startA, Math.max(startA + 0.5, endA));
                          if (!pathData) return null;

                          return (
                            <path
                              key={i}
                              d={pathData}
                              fill={slice.color}
                              className="transition-all duration-300 hover:opacity-90 hover:scale-[1.02] origin-center cursor-pointer drop-shadow-2xs"
                            >
                              <title>{`${slice.label}: ${((slice.value / totalVal) * 100).toFixed(1)}%`}</title>
                            </path>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>

                {/* Center CSAT Score Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CSAT Score</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {aggregatedStats.hasData ? aggregatedStats.csatScore : "72.0%"}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-100">
                    {aggregatedStats.hasData ? "อัตราความพอใจ" : "คะแนนประเมิน"}
                  </span>
                </div>
              </div>

              {/* Legends & Detail Metrics */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-100 flex justify-between items-center transition-all hover:bg-emerald-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-950">ดี (Satisfied)</div>
                      <div className="text-[10px] text-emerald-700">{aggregatedStats.satisfied} โหวต</div>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-950">{aggregatedStats.hasData ? aggregatedStats.satPercent : "-"}</span>
                </div>

                <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-100 flex justify-between items-center transition-all hover:bg-amber-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-2xs shrink-0" />
                    <div>
                      <div className="font-bold text-amber-950">ปานกลาง (Neutral)</div>
                      <div className="text-[10px] text-amber-700">{aggregatedStats.neutral} โหวต</div>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-amber-950">{aggregatedStats.hasData ? aggregatedStats.neuPercent : "-"}</span>
                </div>

                <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-100 flex justify-between items-center transition-all hover:bg-rose-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs shrink-0" />
                    <div>
                      <div className="font-bold text-rose-950">ไม่พอใจ (Unsatisfied)</div>
                      <div className="text-[10px] text-rose-700">{aggregatedStats.unsatisfied} โหวต</div>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-rose-950">{aggregatedStats.hasData ? aggregatedStats.unsPercent : "-"}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Kiosks Rankings & Live Feed Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top 3 Kiosks */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-lg">thumb_up</span>
                ตู้ Kiosk ผลงานยอดเยี่ยม (Top CSAT)
              </h3>
              <span className="badge-active">Top Rank</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {topKiosks.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีข้อมูล</p>
              ) : (
                topKiosks.map((k, idx) => (
                  <div key={k.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-800 text-[11px]">{k.name}</div>
                        {k.subLabel && <div className="text-[10px] text-slate-400">{k.subLabel}</div>}
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 text-xs">{k.csatRate}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Needs Attention Kiosks */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-rose-600 text-lg">warning</span>
                จุดบริการที่ควรเฝ้าระวัง (Needs Attention)
              </h3>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Action Required
              </span>
            </div>
            <div className="space-y-2.5 text-xs">
              {bottomKiosks.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีข้อมูล</p>
              ) : (
                bottomKiosks.map((k) => (
                  <div key={k.id} className="flex justify-between items-center p-2.5 rounded-xl bg-rose-50/40 border border-rose-100 hover:bg-rose-50/70 transition-colors">
                    <div>
                      <div className="font-bold text-slate-800 text-[11px]">{k.name}</div>
                      <div className="text-[10px] text-slate-500">{k.totalVotes || 0} votes total</div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-rose-600 text-xs">{k.csatRate}%</span>
                      <div className="text-[10px] text-rose-500 font-semibold">ต่ำกว่าเกณฑ์</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-time Live Incoming Feed */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-900 text-lg">sensors</span>
                Live Telemetry Feed (ผลประเมินล่าสุด)
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {liveVotesFeed.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีรายการโหวตล่าสุด</p>
              ) : (
                liveVotesFeed.slice(0, 4).map((feed) => (
                  <div key={feed.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center hover:bg-slate-100/70 transition-colors">
                    <div className="truncate mr-2">
                      <div className="font-semibold text-slate-800 text-[11px] truncate">{feed.kioskName}</div>
                      <div className="text-[9px] text-slate-400">{feed.timestamp}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                      feed.sentiment === "happy" ? "bg-emerald-50 text-emerald-900 border-emerald-200" :
                      feed.sentiment === "neutral" ? "bg-amber-50 text-amber-900 border-amber-200" :
                      "bg-rose-50 text-rose-900 border-rose-200"
                    }`}>
                      {feed.sentimentLabel}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ─── 4. [ส่วนล่างสุดของหน้า] ตารางผลการประเมินเรียงตามระดับสิทธิ์องค์กร (HIERARCHICAL PERFORMANCE TABLES) ─── */}
      <div className="space-y-6 pt-4 border-t border-slate-200/80">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900 text-xl">table_chart</span>
              ตารางวิเคราะห์ผลการประเมินตามโครงสร้างองค์กร
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงตารางเปรียบเทียบตามสิทธิ์ที่ได้รับอนุญาต ({activeProfile.roleName} - {activeProfile.userName})
            </p>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 w-fit">
            {permissions.canViewSuperAdminOverview
              ? "สิทธิ์ระดับ 1: แสดงครบ 5 ตาราง"
              : permissions.canViewBrandRegionalGrid
              ? "สิทธิ์ระดับ 2: แสดง 4 ตาราง (แบรนด์ลงมา)"
              : permissions.canViewRegionalProvinceGrid
              ? "สิทธิ์ระดับ 3: แสดง 3 ตาราง (ภูมิภาคลงมา)"
              : permissions.canViewProvincialBranchGrid
              ? "สิทธิ์ระดับ 4: แสดง 2 ตาราง (สาขาและตู้)"
              : "สิทธิ์ระดับ 5: แสดง 1 ตาราง (ตู้ประจำสาขา)"}
          </span>
        </div>

        {/* 1. ตารางเปรียบเทียบแบรนด์ทั้งหมดในเครือ (เฉพาะ Super Admin) */}
        {permissions.canViewSuperAdminOverview && (
          <DetailedPerformanceTable
            title="ภาพรวมผลการประเมินแยกตามแบรนด์ (Brand Performance)"
            subtitle="เปรียบเทียบยอดการประเมินและคะแนนความพึงพอใจของทุกแบรนด์ในเครือ"
            icon="military_tech"
            badgeText="ทุกแบรนด์ในเครือ"
            badgeClass="badge-active"
            data={superAdminBrands}
            nameColumnLabel="แบรนด์ (Brand)"
          />
        )}

        {/* 2. ตารางเปรียบเทียบผลงานระดับภาค (Brand Manager & Super Admin) */}
        {permissions.canViewBrandRegionalGrid && (
          <DetailedPerformanceTable
            title="ผลการประเมินระดับภูมิภาค (Regional Performance)"
            subtitle="เปรียบเทียบผลการดำเนินงานและความพึงพอใจของแต่ละภูมิภาค"
            icon="map"
            badgeText="ระดับภูมิภาค"
            badgeClass="badge-live"
            data={brandRegions}
            nameColumnLabel="ภูมิภาค (Region)"
          />
        )}

        {/* 3. ตารางเปรียบเทียบผลงานระดับจังหวัด (RM, Brand Manager & Super Admin) */}
        {permissions.canViewRegionalProvinceGrid && (
          <DetailedPerformanceTable
            title="ผลการประเมินระดับจังหวัด (Province Performance)"
            subtitle="เปรียบเทียบคะแนนความพึงพอใจแยกตามรายจังหวัดในพื้นที่รับผิดชอบ"
            icon="location_city"
            badgeText="ระดับจังหวัด"
            badgeClass="badge-active"
            data={regionalProvinces}
            nameColumnLabel="จังหวัด (Province)"
          />
        )}

        {/* 4. ตารางเปรียบเทียบผลงานระดับสาขา (AM, RM, Brand Manager & Super Admin) */}
        {permissions.canViewProvincialBranchGrid && (
          <DetailedPerformanceTable
            title="ผลการประเมินระดับสาขา (Branch Performance)"
            subtitle="เปรียบเทียบยอดการประเมินตู้ Kiosk และคะแนนความพึงพอใจรายสาขา"
            icon="store"
            badgeText="ระดับสาขา"
            badgeClass="badge-upcoming"
            data={provincialBranches}
            nameColumnLabel="สาขา (Branch)"
          />
        )}

        {/* 5. ตารางสถานะตู้ประเมิน Kiosk ประจำสาขา (Staff, AM, RM, Brand Manager & Super Admin) */}
        {permissions.canViewBranchKiosksGrid && (
          <DetailedPerformanceTable
            title="สถานะตู้ประเมิน Kiosk ประจำสาขา (Branch Kiosk Terminals)"
            subtitle="ตรวจสอบสถานะการทำงาน จำนวนการประเมิน และคะแนนความพึงพอใจของตู้ Kiosk แต่ละเครื่อง"
            icon="tablet_mac"
            badgeText={`${kiosksData.length} เครื่อง`}
            badgeClass="badge-live"
            data={kiosksData}
            nameColumnLabel="ตู้ Kiosk (Terminal)"
          />
        )}

      </div>

      {/* ─── 5. EXPORT MODAL ─── */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

    </div>
  );
}