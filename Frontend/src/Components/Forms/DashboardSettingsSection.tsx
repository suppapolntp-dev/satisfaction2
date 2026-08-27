"use client";

import React from "react";

export interface DashboardSettingsState {
  refreshInterval: string;
  enableRealtimeSound: boolean;
  benchmarkThreshold: number;
}

interface DashboardSettingsSectionProps {
  dashboardConfig: DashboardSettingsState;
  onUpdateDashboardConfig: (updatedFields: Partial<DashboardSettingsState>) => void;
}

export default function DashboardSettingsSection({
  dashboardConfig,
  onUpdateDashboardConfig,
}: DashboardSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">insert_chart</span>
          Dashboard Settings (การตั้งค่าแดชบอร์ด)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure real-time polling rates, performance benchmarks, and monitoring rules.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Refresh Interval */}
        <div className="max-w-md space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Auto-Refresh Interval
          </label>
          <select
            value={dashboardConfig.refreshInterval}
            onChange={(selectEvent) => onUpdateDashboardConfig({ refreshInterval: selectEvent.target.value })}
            className="input-select w-full"
          >
            <option value="15s">Every 15 seconds (15 วินาที)</option>
            <option value="30s">Every 30 seconds (30 วินาที - แนะนำ)</option>
            <option value="1m">Every 1 minute (1 นาที)</option>
            <option value="5m">Every 5 minutes (5 นาที)</option>
            <option value="never">Manual refresh only (รีเฟรชด้วยตนเองเท่านั้น)</option>
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Faster polling rates provide instant vote updates but increase client network usage.
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* Benchmark Threshold */}
        <div className="max-w-md space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            CSAT Target Benchmark (%)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={50}
              max={100}
              value={dashboardConfig.benchmarkThreshold}
              onChange={(inputEvent) => onUpdateDashboardConfig({ benchmarkThreshold: Number(inputEvent.target.value) })}
              className="input-text w-28"
            />
            <span className="text-xs font-bold text-slate-600">% Target</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Terminals falling below this percentage will be flagged for inspection in underperforming lists.
          </p>
        </div>
      </div>
    </section>
  );
}

