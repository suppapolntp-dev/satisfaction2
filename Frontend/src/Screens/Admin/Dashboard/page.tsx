"use client";

import React, { useState, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import RankingsGrid from "@/Components/Grids/RankingsGrid";
import ExportButton from "@/Components/Buttons/ExportButton";
import SelectInput, { SelectOption } from "@/Components/Inputs/SelectInput";
import { useModal } from "@/Context/ModalContext";

// ─── 1. INTERFACES (นิยามโครงสร้างข้อมูลอย่างละเอียด ไม่มักง่าย) ───
type KioskRankingRow = {
  rank: string;
  name: string;
  votes: string;
  rate: string;
};

type KioskRankingGroup = {
  title: string;
  icon: string;
  color: string;
  rankColor: string;
  badge: string;
  data: KioskRankingRow[];
};

interface DashboardScreenProps {
  statsData?: StatItem[];
  rankings?: {
    top: KioskRankingGroup;
    bottom: KioskRankingGroup;
  };
  csatScore?: string;
}

// ─── 2. STATIC MOCK DATA (ชุดข้อมูลจำลองสำหรับนำไปใช้เทสหน้าจอ) ───
const DEFAULT_STATS_DATA: StatItem[] = [
  { label: "Total Votes", value: "12,482", change: "+4.2%", isUp: true, icon: "poll", color: "text-neutral-400" },
  { label: "Satisfied", value: "8,930", change: "71.5%", isUp: true, icon: "sentiment_very_satisfied", color: "text-emerald-500" },
  { label: "Neutral", value: "2,145", change: "17.2%", isUp: true, icon: "sentiment_neutral", color: "text-amber-500" },
  { label: "Unsatisfied", value: "1,407", change: "11.3%", isUp: false, icon: "sentiment_very_dissatisfied", color: "text-rose-500" },
];

const DEFAULT_RANKINGS: NonNullable<DashboardScreenProps["rankings"]> = {
  top: {
    title: "Top 5 Active Kiosks",
    icon: "thumb_up",
    color: "text-emerald-500",
    rankColor: "text-blue-900",
    badge: "bg-emerald-50 text-emerald-700",
    data: [
      { rank: "#1", name: "T1 Gate 3 (Passport Control)", votes: "2,104", rate: "98.2%" },
      { rank: "#2", name: "T2 Arrival Hall Exit A", votes: "1,820", rate: "97.5%" },
      { rank: "#3", name: "Baggage Claim Zone C", votes: "1,240", rate: "96.8%" },
    ],
  },
  bottom: {
    title: "Underperforming Kiosks",
    icon: "thumb_down",
    color: "text-rose-500",
    rankColor: "text-rose-600",
    badge: "bg-rose-50 text-rose-600",
    data: [
      { rank: "#42", name: "T2 Transfer Desk Area", votes: "430", rate: "62.1%" },
      { rank: "#41", name: "T1 Gate 45 (Remote Gate)", votes: "670", rate: "65.4%" },
    ],
  },
};

const TIME_FILTER_OPTIONS: SelectOption[] = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
];

// ─── 3. MAIN COMPONENT ───
export default function DashboardScreen({
  statsData = DEFAULT_STATS_DATA, // ดึงค่าจากก้อนตัวแปรจำลองด้านบนมาสวมเป็นค่าเริ่มต้น
  rankings = DEFAULT_RANKINGS,   // ดึงค่าจากก้อนตัวแปรจำลองด้านบนมาสวมเป็นค่าเริ่มต้น
  csatScore = "88.7%",
}: DashboardScreenProps) {
  const { openModal } = useModal();
  
  // State สำหรับควบคุมช่องกรองเวลาตัวกลาง
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("today");

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">Real-Time CSAT</h1>
          <p className="text-sm text-neutral-500 mt-1">Live sentiment analysis and performance metrics.</p>
        </div>

        {/* แผงควบคุมตัวกรองและปุ่ม Action */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          {/* ดึง Component ช่องเลือก SelectInput ส่วนกลางมาประกบแทนแท็กดิบ */}
          <SelectInput 
            value={selectedTimeFilter} 
            onChange={setSelectedTimeFilter} 
            options={TIME_FILTER_OPTIONS} 
          />
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <ExportButton onClick={() => openModal("export")} />
        </div>
      </div>

      {/* STATS GRID SECTION */}
      {/* ส่งอาเรย์ดาต้าสถิติผ่านพร็อพ และเปิดช่องสล็อต children เสียบการ์ดคะแนน CSAT ปิดท้ายคอลัมน์ที่ 5 */}
      <StatsGrid data={statsData}>
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">CSAT Score</span>
            <span className="material-symbols-outlined text-blue-900">percent</span>
          </div>
          <div className="text-3xl font-bold text-blue-900">{csatScore}</div>
          <div className="text-xs text-blue-700/80 mt-2 font-semibold">vs Target</div>
        </div>
      </StatsGrid>

      {/* ANALYTICS CHARTS SECTION (กล่อง Box เปล่าสำหรับเตรียมรองรับกราฟตัวจริง) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* กล่องกราฟเส้นแนวโน้มความพึงพอใจ */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-neutral-800 mb-4 pb-3 border-b border-slate-50">
            Satisfaction Trend
          </h2>
          <div className="flex-1 min-h-[240px] bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-sm text-neutral-400 font-medium">
            [ Line Chart Component Place Here ]
          </div>
        </div>

        {/* กล่องกราฟวงกลมสัดส่วนคะแนน */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-neutral-800 mb-4 pb-3 border-b border-slate-50">
            Score Distribution
          </h2>
          <div className="flex-1 min-h-[240px] bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-sm text-neutral-400 font-medium">
            [ Donut Chart Component Place Here ]
          </div>
        </div>
      </div>

      {/* RANKINGS TABLES SECTION */}
      <RankingsGrid rankings={rankings} />
      
    </div>
  );
}