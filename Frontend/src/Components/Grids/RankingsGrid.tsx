"use client";

import React from "react";

// นิยาม Type สำหรับข้อมูลตารางให้รองรับ TypeScript อย่างสมบูรณ์
export interface RankingRow {
  rank: string;
  name: string;
  votes: string;
  rate: string;
}

export interface RankingGroup {
  title: string;
  icon: string;
  color: string;
  rankColor: string;
  badge: string;
  data: RankingRow[];
}

interface RankingsGridProps {
  rankings: Record<string, RankingGroup>;
}

export default function RankingsGrid({ rankings }: RankingsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {(Object.keys(rankings) as Array<keyof typeof rankings>).map((key) => {
        const group = rankings[key];
        return (
          <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* หัวตาราง */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-md font-bold text-neutral-800 flex items-center gap-2">
                <span className={`material-symbols-outlined ${group.color}`}>{group.icon}</span>
                {group.title}
              </h2>
            </div>
            {/* ตารางข้อมูล */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-16">Rank</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">Votes</th>
                    <th className="py-3 px-4 text-right">CSAT</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-neutral-700 divide-y divide-slate-100">
                  {group.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className={`py-3 px-4 font-bold ${group.rankColor}`}>{row.rank}</td>
                      <td className="py-3 px-4 font-medium">{row.name}</td>
                      <td className="py-3 px-4 text-right">{row.votes}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`${group.badge} px-2 py-0.5 rounded-md text-xs font-bold`}>
                          {row.rate}
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