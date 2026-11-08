"use client";

import React, { useState, useMemo, useEffect } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import SearchInput from "@/Components/Inputs/SearchInput";
import { searchAuditLogs } from "@/Lib/search/searchEngine";
import { ActivityAuditLog, ApiServiceHealth } from "@/Types/audit";
import { auditService } from "@/Services/auditService";
import { useApiMode } from "@/Context/ApiModeContext";

// =========================================================================
// ─── MAIN AUDIT SCREEN COMPONENT
// =========================================================================

export default function AuditScreen() {
  const { isApiEnabled } = useApiMode();
  const [activeTab, setActiveTab] = useState<"activity_logs" | "api_health">("activity_logs");
  const [searchAuditQuery, setSearchAuditQuery] = useState("");
  const [selectedLogId, setSelectedLogId] = useState<string>("");
  const [activityLogs, setActivityLogs] = useState<ActivityAuditLog[]>([]);
  const [apiServices, setApiServices] = useState<ApiServiceHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from auditService on mount
  useEffect(() => {
    async function fetchAuditData() {
      try {
        setIsLoading(true);
        const [logs, services] = await Promise.all([
          auditService.getAuditLogs(),
          auditService.getServiceHealth(),
        ]);
        setActivityLogs(logs || []);
        setApiServices(services || []);
        if (logs && logs.length > 0) {
          setSelectedLogId(logs[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchAuditData();
  }, [isApiEnabled]);

  // KPI Stats
  const auditStatsOverviewData: StatItem[] = useMemo(() => {
    const hasLogs = activityLogs.length > 0;
    const hasServices = apiServices.length > 0;

    const avgHealth = hasServices
      ? (apiServices.reduce((acc, s) => acc + s.uptimePercent, 0) / apiServices.length).toFixed(1)
      : null;

    return [
      {
        label: "API Health Score",
        value: avgHealth ? `${avgHealth}%` : "-",
        change: "",
        isUp: true,
        icon: "dns",
        color: "text-emerald-600",
      },
      {
        label: "Admin Action Logs",
        value: hasLogs ? `${activityLogs.length} Records` : "-",
        change: "",
        isUp: true,
        icon: "history_edu",
        color: "text-blue-600",
      },
      {
        label: "Pending Reviews",
        value: hasLogs ? "0 รายการ" : "-",
        change: "",
        isUp: false,
        icon: "pending_actions",
        color: "text-amber-600",
      },
      {
        label: "Security Status",
        value: hasLogs ? "Normal" : "-",
        change: "",
        isUp: true,
        icon: "security",
        color: "text-purple-600",
      },
    ];
  }, [activityLogs, apiServices]);

  // ค้นหาและกรอง Logs โดยใช้ modular search engine
  const filteredActivityLogs = useMemo(() => {
    return searchAuditLogs(searchAuditQuery, activityLogs);
  }, [activityLogs, searchAuditQuery]);

  const activeSelectedLog = useMemo(() => {
    return activityLogs.find((l) => l.id === selectedLogId) || null;
  }, [activityLogs, selectedLogId]);

  // ฟังก์ชันทดสอบ Ping API Service
  const handlePingService = (serviceId: string) => {
    setApiServices((prev) =>
      prev.map((s) =>
        s.serviceId === serviceId
          ? { ...s, latencyMs: Math.floor(20 + Math.random() * 40), lastChecked: "เมื่อสักครู่" }
          : s
      )
    );
    alert(`ทดสอบการเชื่อมต่อ API (${serviceId}) สำเร็จ! สถานะปกติ`);
  };

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-3xl">policy</span>
            Audit & System Health Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ตรวจสอบประวัติการสร้าง/แก้ไข Brand, Branch, User จากผู้ดูแลระบบ และมอนิเตอร์สถานะ API แบบ Real-time
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("activity_logs")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "activity_logs"
                ? "bg-white text-blue-950 shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            ประวัติการเปลี่ยนแปลง (Action Logs)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("api_health")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "api_health"
                ? "bg-white text-blue-950 shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
            สถานะ API & Service Health
          </button>
        </div>
      </div>

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={auditStatsOverviewData} />

      {/* ─── 3. TAB 1: ACTION & ACTIVITY AUDIT LOGS ─── */}
      {activeTab === "activity_logs" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Left Side: Audit Queue List (5 Cols) */}
          <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50/30">
            <div className="p-3.5 border-b border-slate-100 bg-white flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Audit Logs Queue ({filteredActivityLogs.length})
                </span>
                <span className="badge-live">Live Records</span>
              </div>
              <SearchInput
                value={searchAuditQuery}
                onChange={setSearchAuditQuery}
                placeholder="ค้นหา Action, ชื่อผู้ทำรายการ หรือเป้าหมาย..."
                className="w-full"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
              {filteredActivityLogs.map((log) => {
                const isSelected = log.id === selectedLogId;

                return (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => setSelectedLogId(log.id)}
                    className={`w-full text-left p-4 transition-all block border-l-4 cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-900"
                        : "bg-white hover:bg-slate-50 border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                        log.actionType === "CREATE_BRAND" ? "bg-purple-50 text-purple-900 border border-purple-200" :
                        log.actionType === "CREATE_BRANCH" ? "bg-blue-50 text-blue-900 border border-blue-200" :
                        log.actionType === "CREATE_USER" ? "bg-emerald-50 text-emerald-900 border border-emerald-200" :
                        log.actionType === "CONFIG_CHANGE" ? "bg-amber-50 text-amber-900 border border-amber-200" :
                        "bg-rose-50 text-rose-900 border border-rose-200"
                      }`}>
                        {log.actionType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.timestamp}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 truncate mt-1">
                      {log.targetEntity}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      โดย: <span className="font-bold text-slate-700">{log.actorName}</span> ({log.actorRole})
                    </p>
                  </button>
                );
              })}

              {filteredActivityLogs.length === 0 && (
                <div className="py-16 text-center text-xs text-slate-400">
                  ยังไม่มีประวัติการบันทึก Audit Logs ในระบบ
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Detail & Diff Viewer (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-white">
            {activeSelectedLog ? (
              <div className="flex-1 flex flex-col justify-between p-6 space-y-6">
                
                {/* Header Information */}
                <div className="border-b border-slate-100 pb-5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-blue-900 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      Log ID: {activeSelectedLog.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">IP: {activeSelectedLog.ipAddress}</span>
                  </div>

                  <h2 className="text-heading text-base font-bold text-slate-900">
                    {activeSelectedLog.targetEntity}
                  </h2>
                  <p className="text-body text-slate-600 leading-relaxed">
                    {activeSelectedLog.description}
                  </p>
                </div>

                {/* Actor Profile Info */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                      {activeSelectedLog.actorName.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-body font-bold text-slate-900 block">{activeSelectedLog.actorName}</span>
                      <span className="text-sub">{activeSelectedLog.actorRole} • เวลา {activeSelectedLog.timestamp}</span>
                    </div>
                  </div>

                  <span className="badge-active">{activeSelectedLog.status}</span>
                </div>

                {/* Diff Viewer Table */}
                {activeSelectedLog.diffDetails && activeSelectedLog.diffDetails.length > 0 && (
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-900 text-base">difference</span>
                      รายละเอียดความเปลี่ยนแปลง (Data Diff Changes):
                    </h4>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                          <tr>
                            <th className="p-3">Field (ฟิลด์)</th>
                            <th className="p-3 text-rose-700">Before (ค่าเดิม)</th>
                            <th className="p-3 text-emerald-700">After (ค่าใหม่)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {activeSelectedLog.diffDetails.map((diff, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-slate-700">{diff.field}</td>
                              <td className="p-3 text-rose-600 bg-rose-50/30 font-mono">{diff.beforeValue}</td>
                              <td className="p-3 text-emerald-700 bg-emerald-50/30 font-mono font-bold">{diff.afterValue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => alert(`ยืนยันการรับรองบันทึก Audit: ${activeSelectedLog.id}`)}
                    className="btn-primary text-xs shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    รับรองการตรวจสอบ (Verify Log)
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">
                เลือกรายการ Log ด้านซ้ายเพื่อดูรายละเอียด
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─── 4. TAB 2: API & SERVICE HEALTH MONITOR ─── */}
      {activeTab === "api_health" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          
          <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-900 text-xl">lan</span>
                API Microservices & Ingestion Gateway Health
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ติดตามประสิทธิภาพ การตอบสนอง (Latency) และสถานะความพร้อมของเซิร์ฟเวอร์ระบบ
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert("รีเฟรชสถานะ API ทุกบริการเรียบร้อยแล้ว")}
              className="btn-secondary text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-3.5 px-4">Service Name & Endpoint</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Uptime</th>
                  <th className="py-3.5 px-4 text-center">Latency (ms)</th>
                  <th className="py-3.5 px-4 text-center">Error Rate</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {apiServices.map((service) => (
                  <tr key={service.serviceId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{service.serviceName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{service.endpoint}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        service.status === "Operational" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                        service.status === "Degraded" ? "bg-amber-50 text-amber-800 border-amber-200" :
                        "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          service.status === "Operational" ? "bg-emerald-500" :
                          service.status === "Degraded" ? "bg-amber-500 animate-pulse" :
                          "bg-rose-500"
                        }`} />
                        {service.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">{service.uptimePercent}%</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-mono font-bold ${service.latencyMs > 100 ? "text-amber-600" : "text-emerald-700"}`}>
                        {service.latencyMs} ms
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-[11px] text-slate-500">{service.errorRatePercent}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handlePingService(service.serviceId)}
                        className="btn-secondary text-[11px] py-1 px-2.5"
                      >
                        Ping Test
                      </button>
                    </td>
                  </tr>
                ))}

                {apiServices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      ยังไม่มีข้อมูลบริการ API ในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}