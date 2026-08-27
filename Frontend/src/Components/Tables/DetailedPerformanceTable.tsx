"use client";

import React from "react";
import { DetailedPerformanceRow } from "@/Types/dashboard";

export interface PerformanceTableProps {
  title: string;
  subtitle: string;
  icon: string;
  badgeText: string;
  badgeClass?: string;
  data: DetailedPerformanceRow[];
  nameColumnLabel: string;
}

export default function DetailedPerformanceTable({
  title,
  subtitle,
  icon,
  badgeText,
  badgeClass = "badge-live",
  data,
  nameColumnLabel,
}: PerformanceTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      
      {/* Table Header Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-2xs">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </div>
          <div>
            <h3 className="text-heading">{title}</h3>
            <p className="text-sub mt-0.5">{subtitle}</p>
          </div>
        </div>
        <span className={badgeClass}>{badgeText}</span>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-sub font-bold uppercase tracking-wider">
              <th className="py-3 px-4">{nameColumnLabel}</th>
              <th className="py-3 px-4 text-center">Satisfied (ดี)</th>
              <th className="py-3 px-4 text-center">Neutral (กลาง)</th>
              <th className="py-3 px-4 text-center">Unsatisfied (แย่)</th>
              <th className="py-3 px-4 text-center">Total Votes</th>
              <th className="py-3 px-4 text-center">CSAT Score</th>
              <th className="py-3 px-4 text-center">Status / Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-body">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400 font-medium">
                  ยังไม่มีข้อมูลผลการประเมินในขณะนี้
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isExcellent = row.csatRate >= 92;
                const isNeedsCheck = row.csatRate < 88;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Name & Sub-details */}
                    <td className="py-3.5 px-4">
                      <div className="text-body font-bold text-slate-900">{row.name}</div>
                      {row.subLabel && <div className="text-sub font-mono mt-0.5">{row.subLabel}</div>}
                    </td>

                    {/* Satisfied */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-body font-bold text-emerald-700">{row.satisfiedCount ? row.satisfiedCount.toLocaleString() : "-"}</span>
                      {row.totalVotes > 0 && (
                        <span className="text-sub block">
                          ({((row.satisfiedCount / (row.totalVotes || 1)) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </td>

                    {/* Neutral */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-body font-bold text-amber-700">{row.neutralCount ? row.neutralCount.toLocaleString() : "-"}</span>
                      {row.totalVotes > 0 && (
                        <span className="text-sub block">
                          ({((row.neutralCount / (row.totalVotes || 1)) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </td>

                    {/* Unsatisfied */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-body font-bold text-rose-700">{row.unsatisfiedCount ? row.unsatisfiedCount.toLocaleString() : "-"}</span>
                      {row.totalVotes > 0 && (
                        <span className="text-sub block">
                          ({((row.unsatisfiedCount / (row.totalVotes || 1)) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </td>

                    {/* Total Votes */}
                    <td className="py-3.5 px-4 text-center text-body font-bold text-slate-900">
                      {row.totalVotes ? row.totalVotes.toLocaleString() : "-"}
                    </td>

                    {/* CSAT Score % */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-mono font-extrabold text-sm ${
                        isExcellent ? "text-emerald-700" : isNeedsCheck ? "text-rose-600" : "text-blue-900"
                      }`}>
                        {row.csatRate ? `${row.csatRate}%` : "-"}
                      </span>
                    </td>

                    {/* Status & Trend */}
                    <td className="py-3.5 px-4 text-center">
                      {row.trendText ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sub font-bold ${
                          row.isUp ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {row.isUp ? "trending_up" : "trending_down"}
                          </span>
                          {row.trendText}
                        </span>
                      ) : (
                        <span className="text-sub text-slate-400">-</span>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

