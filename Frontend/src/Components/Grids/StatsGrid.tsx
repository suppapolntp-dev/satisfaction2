"use client";

import React from "react";

// นิยามโครงสร้างข้อมูลสถิติให้ยืดหยุ่นและกว้างขึ้น
export interface StatItem {
  label: string;
  value: string;
  change: string;
  isUp: boolean;
  icon: string;
  color: string;
}

interface StatsGridProps {
  data: StatItem[];
  children?: React.ReactNode; // รองรับการ์ดไฮไลท์หรือการ์ดประเภทอื่นมาเสียบต่อท้าย
}

export default function StatsGrid({ data, children }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {data.map((item, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {item.label}
            </span>
            <span className={`material-symbols-outlined ${item.color}`}>
              {item.icon}
            </span>
          </div>
          <div className="text-3xl font-bold text-neutral-800">{item.value}</div>
          <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
            <span className={`${item.isUp ? "text-emerald-600" : "text-rose-600"} font-semibold`}>
              {item.change}
            </span>
          </div>
        </div>
      ))}
      
      {children}
    </div>
  );
}