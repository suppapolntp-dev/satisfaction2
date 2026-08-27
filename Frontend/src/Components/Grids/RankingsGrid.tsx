"use client";

import React from "react";

// ==========================================================================
// ─── 1. INTERFACES (นิยามโครงสร้างตารางจัดอันดับตู้ Kiosk)
// ==========================================================================
export interface RankingRow {
  rank: string;       // อันดับ เช่น "#1", "#42"
  name: string;       // ชื่อจุดติดตั้งตู้ Kiosk
  votes: string;      // จำนวนโหวตสะสม
  rate: string;       // อัตราคะแนนความพึงพอใจ เช่น "98.2%"
}

export interface RankingGroup {
  title: string;      // หัวข้อตาราง เช่น "Top 5 Active Kiosks"
  icon: string;       // ไอคอนหัวตาราง เช่น "thumb_up"
  color: string;      // สีไอคอน
  rankColor: string;  // สีตัวเลข rank
  badge: string;      // คลาส Badge สำหรับ rate
  data: RankingRow[];
}

interface RankingsGridProps {
  rankings: Record<string, RankingGroup>;
}

// ==========================================================================
// ─── 2. MAIN COMPONENT
// ==========================================================================
export default function RankingsGrid({ rankings }: RankingsGridProps) {
  const rankingGroupKeys = Object.keys(rankings) as Array<keyof typeof rankings>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {rankingGroupKeys.map((groupKey) => {
        const rankingGroup = rankings[groupKey];

        return (
          <div 
            key={String(groupKey)} 
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col"
          >
            {/* Header หัวตารางจัดอันดับ */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <span className={`material-symbols-outlined text-[20px] ${rankingGroup.color}`}>
                {rankingGroup.icon}
              </span>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                {rankingGroup.title}
              </h2>
            </div>

            {/* เนื้อหาตารางจัดอันดับ */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                    <th className="py-3 px-4 w-16">Rank</th>
                    <th className="py-3 px-4">Location / Kiosk</th>
                    <th className="py-3 px-4 text-right">Votes</th>
                    <th className="py-3 px-4 text-right">CSAT Rate</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                  {rankingGroup.data.map((rankingItem, rowIndex) => (
                    <tr 
                      key={rowIndex} 
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className={`py-3 px-4 font-bold ${rankingGroup.rankColor}`}>
                        {rankingItem.rank}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {rankingItem.name}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-medium">
                        {rankingItem.votes}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${rankingGroup.badge}`}>
                          {rankingItem.rate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}