"use client";

import React from "react";
import { ActivityAuditLog } from "@/Types/audit";
import { useAuditLogTable } from "./useAuditLogTable";

export interface AuditLogTableProps {
  logs?: ActivityAuditLog[] | null;
  isLoading?: boolean;
  onVerifyLog?: (logId: string) => void;
  className?: string;
}

export default function AuditLogTable({
  logs,
  isLoading = false,
  onVerifyLog,
  className = "",
}: AuditLogTableProps) {
  const {
    searchQuery,
    setSearchQuery,
    actionFilter,
    setActionFilter,
    availableActionTypes,
    filteredLogs,
    activeSelectedLog,
    copiedId,
    handleSelectLog,
    handleCopyLogId,
    handleVerify,
  } = useAuditLogTable({ logs, onVerifyLog });

  if (isLoading) {
    return (
      <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] p-8 text-center animate-pulse ${className}`}>
        <div className="h-5 bg-slate-200 rounded w-48 mx-auto mb-4" />
        <div className="h-4 bg-slate-100 rounded w-64 mx-auto" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] ${className}`}
    >
      {/* ─── 1. LEFT SIDE: AUDIT QUEUE & FILTER LIST (5 COLS) ─── */}
      <div className="lg:col-span-5 border-r border-slate-200/80 flex flex-col bg-slate-50/40">
        
        {/* Queue Header & Filters */}
        <div className="p-4 border-b border-slate-200/80 bg-white space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Audit Logs Queue
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({filteredLogs.length})
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Live Feed
            </span>
          </div>

          {/* Search Bar with SVG */}
          <div className="relative">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา Action, ชื่อผู้ทำรายการ, เป้าหมาย..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Action Filter Pills */}
          {availableActionTypes.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] pt-0.5">
              <button
                type="button"
                onClick={() => setActionFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                  actionFilter === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                }`}
              >
                ทั้งหมด
              </button>
              {availableActionTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActionFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                    actionFilter === type
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Queue Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 [scrollbar-width:thin]">
          {filteredLogs.map((log) => {
            const isSelected = activeSelectedLog?.id === log.id;

            return (
              <button
                key={log.id}
                type="button"
                onClick={() => handleSelectLog(log.id)}
                className={`w-full text-left p-4 transition-all block border-l-4 cursor-pointer select-none ${
                  isSelected
                    ? "bg-blue-50/80 border-slate-900 shadow-xs"
                    : "bg-white hover:bg-slate-50/80 border-transparent"
                }`}
              >
                <div className="flex justify-between items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {log.actionType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {log.timestamp}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                  {log.targetEntity}
                </h4>

                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  โดย: <span className="font-medium text-slate-700">{log.actorName}</span> • {log.actorRole}
                </p>
              </button>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="py-16 text-center text-xs text-slate-400">
              ไม่พบประวัติรายการ Audit ที่ตรงกับเงื่อนไขค้นหา
            </div>
          )}
        </div>
      </div>

      {/* ─── 2. RIGHT SIDE: DATA DIFF INSPECTOR (7 COLS) ─── */}
      <div className="lg:col-span-7 flex flex-col bg-white">
        {activeSelectedLog ? (
          <div className="flex-1 flex flex-col justify-between p-6 space-y-6">
            
            {/* Header Telemetry Info */}
            <div className="border-b border-slate-100 pb-5 space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    Log ID: {activeSelectedLog.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyLogId(activeSelectedLog.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                    title="คัดลอก Log ID"
                  >
                    {copiedId === activeSelectedLog.id ? (
                      <span className="text-[11px] text-emerald-600 font-semibold">คัดลอกแล้ว</span>
                    ) : (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>IP: {activeSelectedLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {activeSelectedLog.targetEntity}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activeSelectedLog.description}
                </p>
              </div>
            </div>

            {/* Actor Snapshot Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {activeSelectedLog.actorName ? activeSelectedLog.actorName.slice(0, 2).toUpperCase() : "AD"}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {activeSelectedLog.actorName}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {activeSelectedLog.actorRole} • เวลา {activeSelectedLog.timestamp}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center text-xs font-semibold text-slate-700 shrink-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    activeSelectedLog.status === "SUCCESS" || activeSelectedLog.status === "Success"
                      ? "bg-emerald-500"
                      : activeSelectedLog.status === "FAILED"
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  }`}
                />
                {activeSelectedLog.status}
              </span>
            </div>

            {/* Data Diff Changes Inspector Table */}
            {activeSelectedLog.diffDetails && activeSelectedLog.diffDetails.length > 0 ? (
              <div className="space-y-2 flex-1">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 3h5v5" />
                    <path d="M8 21H3v-5" />
                    <path d="M21 3l-7 7" />
                    <path d="M3 21l7-7" />
                  </svg>
                  <span>รายละเอียดความเปลี่ยนแปลงของข้อมูล (Data Diff Changes):</span>
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="p-3">Field (ฟิลด์)</th>
                        <th className="p-3 text-rose-700">Before (ค่าเดิม)</th>
                        <th className="p-3 text-emerald-800">After (ค่าใหม่)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {activeSelectedLog.diffDetails.map((diff, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-700">
                            {diff.field}
                          </td>
                          <td className="p-3 text-rose-600 font-mono">
                            {diff.beforeValue ?? "-"}
                          </td>
                          <td className="p-3 text-emerald-700 font-mono font-medium">
                            {diff.afterValue ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <svg className="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-xs font-semibold text-slate-600">
                  บันทึกประวัติกิจกรรมแบบ Snapshot สมบูรณ์
                </span>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  รายการนี้ไม่มีการแก้ไขข้อมูลฟิลด์ย่อย (Sub-field Mutation)
                </p>
              </div>
            )}

            {/* Verification Footer Action */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => handleVerify(activeSelectedLog.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer select-none"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>รับรองการตรวจสอบ (Verify Log)</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">
            เลือกรายการ Log จากแถบด้านซ้ายเพื่อดูรายละเอียด
          </div>
        )}
      </div>

    </div>
  );
}
