"use client";

import React from "react";

// ==========================================================================
// ─── 1. INTERFACES (นิยามโครงสร้างสถิติ KPI)
// ==========================================================================
export interface StatItem {
  label: string;      // ชื่อตัวชี้วัด (เช่น "Total Votes", "Active Accounts")
  value: string;      // ค่าตัวเลขแสดงผล
  change: string;     // ข้อความระบุการเปลี่ยนแปลง (เช่น "+4.2%", "95.5% operational")
  isUp: boolean;      // สถานะทิศทาง (บวก/ลบ เพื่อกำหนดสีเขียวหรือแดง)
  icon: string;       // ชื่อ Material Symbol Icon
  color: string;      // คลาสสีไอคอน (เช่น text-blue-600, text-emerald-500)
}

interface StatsGridProps {
  data: StatItem[];
  children?: React.ReactNode; // รองรับการส่งการ์ดพิเศษ (เช่น CSAT Score Card) มาต่อท้าย
}

// ==========================================================================
// ─── 2. MAIN STATS GRID COMPONENT
// ==========================================================================
export default function StatsGrid({ data, children }: StatsGridProps) {
  const totalCardsCount = data.length + (children ? 1 : 0);

  // คำนวณคลาส Grid ให้ยืดเต็มหน้าจอพอดีตามจำนวนการ์ดจริง (ไม่เหลือช่องว่างด้านข้าง)
  const getResponsiveGridColumns = (count: number): string => {
    switch (count) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      case 5:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5";
      case 6:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    }
  };

  return (
    <div className={`grid ${getResponsiveGridColumns(totalCardsCount)} gap-4 w-full`}>
      {data.map((statItem, itemIndex) => (
        <div 
          key={itemIndex} 
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors w-full"
        >
          {/* Header แถวบนของการ์ด */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {statItem.label}
            </span>
            <div className={`p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center ${statItem.color}`}>
              <span className="material-symbols-outlined text-[20px]">
                {statItem.icon}
              </span>
            </div>
          </div>

          {/* ตัวเลขสถิติขนาดใหญ่ */}
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            {statItem.value}
          </div>

          {/* ป้ายแสดงการเติบโต */}
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className={`font-semibold ${statItem.isUp ? "text-emerald-600" : "text-rose-600"}`}>
              {statItem.change}
            </span>
          </div>
        </div>
      ))}
      
      {/* สล็อตเรนเดอร์การ์ดพิเศษต่อท้าย */}
      {children}
    </div>
  );
}