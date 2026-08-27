"use client";

import React, { useState, useEffect, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import ExportModal from "@/Components/Modals/ExportModal";
import SelectInput from "@/Components/Inputs/SelectInput";
import DetailedPerformanceTable from "@/Components/Tables/DetailedPerformanceTable";
import {
  getActiveDataAccessProfile,
  UserDataAccessProfile,
} from "@/Lib/dataAccessContext";
import {
  TimeRangeFilter,
  PerformanceTableRow,
  HourlyDataPoint,
  LiveVoteFeedItem,
} from "@/Types/dashboard";
import { dashboardService } from "@/Services/dashboardService";

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

  // ─── Dashboard Data from Service ───
  const [superAdminBrands, setSuperAdminBrands] = useState<PerformanceTableRow[]>([]);
  const [brandRegions, setBrandRegions] = useState<PerformanceTableRow[]>([]);
  const [regionalProvinces, setRegionalProvinces] = useState<PerformanceTableRow[]>([]);
  const [provincialBranches, setProvincialBranches] = useState<PerformanceTableRow[]>([]);
  const [kiosksData, setKiosksData] = useState<PerformanceTableRow[]>([]);
  const [currentChartData, setCurrentChartData] = useState<HourlyDataPoint[]>([]);
  const [liveVotesFeed, setLiveVotesFeed] = useState<LiveVoteFeedItem[]>([]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setIsLoading(true);
        const data = await dashboardService.getDashboardData(timeFilter);
        setSuperAdminBrands(data.superAdminBrands || []);
        setBrandRegions(data.brandRegions || []);
        setRegionalProvinces(data.regionalProvinces || []);
        setProvincialBranches(data.provincialBranches || []);
        setKiosksData(data.branchKiosks || []);
        setCurrentChartData(data.hourlyTrends || []);
        if (data.liveVotes && data.liveVotes.length > 0) {
          setLiveVotesFeed(data.liveVotes.map((v) => ({
            id: v.id,
            kioskName: `${v.kioskCode || ""} - ${v.branchName || ""}`.trim().replace(/^-\s*|\s*-$/g, ""),
            sentiment: v.sentiment === "satisfied" ? "happy" : v.sentiment === "neutral" ? "neutral" : "sad",
            sentimentLabel: v.scoreText || "",
            timestamp: v.time || "",
          })));
        } else {
          setLiveVotesFeed([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, [timeFilter]);

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

  // สถิติ KPI รวม
  const aggregatedStats = useMemo(() => {
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

    const hasData = total > 0;
    const satP = hasData ? ((sat / total) * 100).toFixed(1) : "0.0";
    const neuP = hasData ? ((neu / total) * 100).toFixed(1) : "0.0";
    const unsP = hasData ? ((uns / total) * 100).toFixed(1) : "0.0";

    return {
      hasData,
      totalVotes: hasData ? total.toLocaleString() : "",
      satisfied: hasData ? sat.toLocaleString() : "",
      neutral: hasData ? neu.toLocaleString() : "",
      unsatisfied: hasData ? uns.toLocaleString() : "",
      csatScore: hasData ? `${satP}%` : "",
      satPercent: hasData ? `${satP}%` : "0%",
      neuPercent: hasData ? `${neuP}%` : "0%",
      unsPercent: hasData ? `${unsP}%` : "0%",
    };
  }, [kiosksData]);

  const kpiStatsItems: StatItem[] = useMemo(() => [
    { label: "ยอดประเมินรวมทั้งหมด", value: aggregatedStats.totalVotes || "-", change: "", isUp: true, icon: "poll", color: "text-slate-600" },
    { label: "พึงพอใจมาก (ดี)", value: aggregatedStats.satisfied || "-", change: aggregatedStats.hasData ? `${aggregatedStats.satPercent} ของโหวตทั้งหมด` : "", isUp: true, icon: "sentiment_satisfied", color: "text-emerald-600" },
    { label: "ปานกลาง (เฉยๆ)", value: aggregatedStats.neutral || "-", change: aggregatedStats.hasData ? `${aggregatedStats.neuPercent} ของโหวตทั้งหมด` : "", isUp: true, icon: "sentiment_neutral", color: "text-amber-600" },
    { label: "ไม่พอใจ (แย่)", value: aggregatedStats.unsatisfied || "-", change: aggregatedStats.hasData ? `${aggregatedStats.unsPercent} ของโหวตทั้งหมด` : "", isUp: false, icon: "sentiment_dissatisfied", color: "text-rose-600" },
  ], [aggregatedStats]);

  const sortedKiosks = useMemo(() => [...kiosksData].sort((a, b) => (b.csatRate || 0) - (a.csatRate || 0)), [kiosksData]);
  const topKiosks = useMemo(() => sortedKiosks.slice(0, 3), [sortedKiosks]);
  const bottomKiosks = useMemo(() => sortedKiosks.slice(-2).reverse(), [sortedKiosks]);

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-3xl">analytics</span>
            Customer Satisfaction Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            แดชบอร์ดติดตามและวิเคราะห์คะแนนความพึงพอใจของลูกค้าแบบเรียลไทม์ และเปรียบเทียบผลการดำเนินงาน
          </p>
        </div>

        {/* แผงควบคุมตัวกรองเวลาและปุ่ม Action */}
        <div className="flex flex-wrap items-center gap-3">
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
            {isLiveStreamActive ? "Live Stream Active" : "Stream Paused"}
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
            className="btn-primary text-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* ─── 2. STATS & KPI GRID SECTION ─── */}
      <StatsGrid data={kpiStatsItems}>
        {/* การ์ด CSAT Score Meter ไฮไลต์พิเศษ */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start z-10">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
              Overall CSAT Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-800/80 flex items-center justify-center border border-blue-700">
              <span className="material-symbols-outlined text-white text-[18px]">percent</span>
            </div>
          </div>
          
          <div className="text-3xl font-extrabold text-white tracking-tight z-10 mt-2 flex items-baseline gap-2">
            <span>{aggregatedStats.csatScore || "-"}</span>
            {aggregatedStats.hasData && <span className="text-xs font-semibold text-blue-300">/ 100%</span>}
          </div>

          <div className="text-xs text-blue-200 mt-2 font-semibold z-10 flex items-center gap-1.5 min-h-[20px]">
            {aggregatedStats.hasData && (
              <span className="text-blue-300 text-[11px]">คะแนนเฉลี่ยความพึงพอใจโดยรวม</span>
            )}
          </div>

          <span className="material-symbols-outlined absolute right-[-10px] bottom-[-15px] text-blue-800/30 text-8xl pointer-events-none select-none">
            insights
          </span>
        </div>
      </StatsGrid>

      {/* ─── 3. ตารางเปรียบเทียบแบรนด์ทั้งหมดในเครือ ─── */}
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

      {/* ─── 4. ตารางเปรียบเทียบผลงานระดับภาค ─── */}
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

      {/* ─── 5. ตารางเปรียบเทียบผลงานระดับจังหวัด ─── */}
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

      {/* ─── 6. ตารางเปรียบเทียบผลงานระดับสาขาในเขต ─── */}
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

      {/* ─── 7. [LEVEL 5: BRANCH LEVEL] ตารางตู้ KIOSK, ชาร์ตรายชั่วโมง & LIVE STREAM ─── */}
      {permissions.canViewBranchKiosksGrid && (
        <div className="space-y-6">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Interactive Satisfaction Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-900 text-xl">show_chart</span>
                  <h2 className="text-sm font-bold text-slate-800">
                    แนวโน้มคะแนนความพึงพอใจรายชั่วโมง (Hourly Sentiment Trend)
                  </h2>
                </div>
                <span className="badge-live">Live Stream</span>
              </div>

              <div className="flex-1 flex flex-col justify-end min-h-[200px]">
                {currentChartData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                    ยังไม่มีข้อมูลแนวโน้มรายชั่วโมง
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2 items-end h-36 border-b border-slate-200 pb-2 px-2">
                    {currentChartData.map((dp, idx) => {
                      const rate = dp.satisfiedRate || dp.csatPercentage || 0;
                      const heightPercent = rate > 0 ? Math.max(10, rate) : 4;
                      const isHovered = hoveredDataPoint?.hourLabel === dp.hourLabel;

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredDataPoint(dp)}
                          onMouseLeave={() => setHoveredDataPoint(null)}
                          className="flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end"
                        >
                          {isHovered && (
                            <div className="text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded shadow-md whitespace-nowrap mb-1">
                              {rate > 0 ? `${rate}%` : "-"} ({dp.totalVotes || dp.totalSurveys || 0} votes)
                            </div>
                          )}
                          <div
                            className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                              rate >= 92 ? "bg-blue-900 group-hover:bg-blue-950" : rate > 0 ? "bg-blue-600 group-hover:bg-blue-700" : "bg-slate-200"
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
            </div>

            {/* Sentiment Distribution Stacked Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-900 text-xl">pie_chart</span>
                  <h2 className="text-sm font-bold text-slate-800">สัดส่วนความพึงพอใจ</h2>
                </div>
                <span className="text-xs text-slate-400 font-bold">{aggregatedStats.totalVotes ? `${aggregatedStats.totalVotes} โหวต` : "-"}</span>
              </div>

              <div className="space-y-4">
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div className="h-full bg-emerald-500" style={{ width: aggregatedStats.satPercent }} />
                  <div className="h-full bg-amber-400" style={{ width: aggregatedStats.neuPercent }} />
                  <div className="h-full bg-rose-500" style={{ width: aggregatedStats.unsPercent }} />
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between items-center">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ดี (Satisfied)
                    </span>
                    <span className="font-extrabold text-emerald-950">{aggregatedStats.hasData ? aggregatedStats.satPercent : "-"}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 flex justify-between items-center">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> ปานกลาง (Neutral)
                    </span>
                    <span className="font-extrabold text-amber-950">{aggregatedStats.hasData ? aggregatedStats.neuPercent : "-"}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 flex justify-between items-center">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> แย่ (Unsatisfied)
                    </span>
                    <span className="font-extrabold text-rose-950">{aggregatedStats.hasData ? aggregatedStats.unsPercent : "-"}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Kiosks Rankings & Live Stream Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top 3 Kiosks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">thumb_up</span>
                  ตู้ Kiosk คะแนนสูงสุด
                </h3>
                <span className="badge-active">Top Rank</span>
              </div>
              <div className="space-y-2.5 text-xs">
                {topKiosks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">ยังไม่มีข้อมูล</p>
                ) : (
                  topKiosks.map((k, idx) => (
                    <div key={k.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50/60">
                      <span className="font-bold text-slate-800">#{idx + 1} {k.name}</span>
                      <span className="font-extrabold text-emerald-600">{k.csatRate}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Needs Attention Kiosks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-rose-600 text-lg">warning</span>
                  ตู้ Kiosk ควรเฝ้าระวัง
                </h3>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Needs Check
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                {bottomKiosks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">ยังไม่มีข้อมูล</p>
                ) : (
                  bottomKiosks.map((k) => (
                    <div key={k.id} className="flex justify-between items-center p-2 rounded-xl bg-rose-50/40 border border-rose-100">
                      <span className="font-bold text-slate-800">{k.name}</span>
                      <span className="font-extrabold text-rose-600">{k.csatRate}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Real-time Live Incoming Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-900 text-lg">sensors</span>
                  Live Feed การประเมินสด
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="space-y-2 text-xs">
                {liveVotesFeed.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">ยังไม่มีรายการโหวตล่าสุด</p>
                ) : (
                  liveVotesFeed.slice(0, 4).map((feed) => (
                    <div key={feed.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <span className="font-semibold text-slate-800 text-[11px] truncate">{feed.kioskName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        feed.sentiment === "happy" ? "bg-emerald-100 text-emerald-900" :
                        feed.sentiment === "neutral" ? "bg-amber-100 text-amber-900" :
                        "bg-rose-100 text-rose-900"
                      }`}>
                        {feed.sentimentLabel}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Detailed Branch Kiosks Performance Table */}
          <DetailedPerformanceTable
            title="สถานะตู้ประเมิน Kiosk ประจำสาขา (Branch Kiosk Terminals)"
            subtitle="ตรวจสอบสถานะการทำงาน จำนวนการประเมิน และคะแนนความพึงพอใจของตู้ Kiosk แต่ละเครื่อง"
            icon="tablet_mac"
            badgeText={`${kiosksData.length} เครื่อง`}
            badgeClass="badge-live"
            data={kiosksData}
            nameColumnLabel="ตู้ Kiosk (Terminal)"
          />

        </div>
      )}

      {/* ─── 8. EXPORT MODAL ─── */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

    </div>
  );
}