"use client";

import React from "react";
import { ApiServiceHealth } from "@/Types/audit";
import { useServiceHealthTable } from "./useServiceHealthTable";

export interface ServiceHealthTableProps {
  services?: ApiServiceHealth[] | null;
  isLoading?: boolean;
  onRefreshAll?: () => Promise<void> | void;
  className?: string;
}

export default function ServiceHealthTable({
  services,
  isLoading = false,
  onRefreshAll,
  className = "",
}: ServiceHealthTableProps) {
  const {
    filteredServices,
    summary,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    pingingServiceId,
    isRefreshing,
    pingNotification,
    handlePing,
    handleRefresh,
  } = useServiceHealthTable({ services, onRefreshAll });

  if (isLoading) {
    return (
      <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] p-8 text-center animate-pulse ${className}`}>
        <div className="h-6 bg-slate-200 rounded w-60 mx-auto mb-4" />
        <div className="h-4 bg-slate-100 rounded w-80 mx-auto" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden flex flex-col ${className}`}
    >
      {/* ─── 1. TOP HEADER & TELEMETRY CONTROLS ─── */}
      <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                  <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                  <line x1="6" x2="6.01" y1="6" y2="6" />
                  <line x1="6" x2="6.01" y1="18" y2="18" />
                </svg>
              </span>
              <span>API Microservices &amp; Ingestion Gateway Health</span>
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {summary.operational} / {summary.total} Operational
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ติดตามประสิทธิภาพ การตอบสนอง (Latency) และความพร้อมของระบบเชื่อมต่อแบบ Real-time
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
              placeholder="ค้นหาบริการหรือ Endpoint..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="Operational">Operational (ปกติ)</option>
            <option value="Degraded">Degraded (หน่วง)</option>
            <option value="Outage">Outage (ขัดข้อง)</option>
          </select>

          {/* Refresh All Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 select-none"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>{isRefreshing ? "กำลังรีเฟรช..." : "Refresh All"}</span>
          </button>
        </div>
      </div>

      {/* Ping Notification Toast */}
      {pingNotification && (
        <div className="bg-emerald-50 px-5 py-2.5 border-b border-emerald-100 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{pingNotification}</span>
          </div>
        </div>
      )}

      {/* ─── 2. TELEMETRY DATA TABLE ─── */}
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-5">Service Name &amp; Endpoint</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Uptime</th>
              <th className="py-3.5 px-4 text-center">Latency</th>
              <th className="py-3.5 px-4 text-center">Error Rate</th>
              <th className="py-3.5 px-4 text-center">Last Checked</th>
              <th className="py-3.5 px-5 text-right">Live Diagnostic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredServices.map((service) => {
              const isPinging = pingingServiceId === service.serviceId;

              return (
                <tr
                  key={service.serviceId}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Service Name & Endpoint */}
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-900">
                      {service.serviceName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {service.endpoint}
                    </div>
                  </td>

                  {/* Operational Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        service.status === "Operational"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : service.status === "Degraded"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          service.status === "Operational"
                            ? "bg-emerald-500"
                            : service.status === "Degraded"
                            ? "bg-amber-500 animate-pulse"
                            : "bg-rose-500"
                        }`}
                      />
                      {service.status}
                    </span>
                  </td>

                  {/* Uptime % */}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {service.uptimePercent !== undefined ? `${service.uptimePercent}%` : "-"}
                  </td>

                  {/* Latency ms */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`font-mono font-bold ${
                        service.latencyMs > 100
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {service.latencyMs !== undefined ? `${service.latencyMs} ms` : "-"}
                    </span>
                  </td>

                  {/* Error Rate % */}
                  <td className="py-3.5 px-4 text-center text-slate-500">
                    {service.errorRatePercent !== undefined ? `${service.errorRatePercent}%` : "-"}
                  </td>

                  {/* Last Checked */}
                  <td className="py-3.5 px-4 text-center text-[11px] text-slate-400 font-mono">
                    {service.lastChecked ?? "-"}
                  </td>

                  {/* Action: Ping Test */}
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handlePing(service.serviceId)}
                      disabled={isPinging}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-[11px] font-semibold text-slate-700 transition-all cursor-pointer disabled:opacity-50 select-none shadow-2xs"
                    >
                      <svg
                        className={`w-3.5 h-3.5 text-slate-500 ${isPinging ? "animate-spin" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                      <span>{isPinging ? "Testing..." : "Ping Test"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredServices.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-xs text-slate-400">
                  ไม่พบบริการ API ที่ตรงกับเงื่อนไขค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── 3. TABLE FOOTER SUMMARY ─── */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          เฉลี่ยระบบ: <span className="font-bold text-slate-700">{summary.avgLatency ?? "-"} ms Latency</span> • ความพร้อมเฉลี่ย: <span className="font-bold text-emerald-700">{summary.avgUptime ?? "-"}% Uptime</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Auto-refresh heartbeat active
        </div>
      </div>
    </div>
  );
}
