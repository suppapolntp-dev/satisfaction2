"use client";

import React from "react";

export interface AuditSettingsState {
  pageTitle: string;
  pageSubtitle: string;
  retentionDays: number;
  maxExportLimitRows: number;
  realtimeTelemetryIntervalSec: number;
  enableTamperAuditAlerts: boolean;
}

export const DEFAULT_AUDIT_SETTINGS: AuditSettingsState = {
  pageTitle: "Audit Trail & System Diagnostics",
  pageSubtitle: "Immutable system activity log, cryptographic tamper detection, and service health telemetry.",
  retentionDays: 90,
  maxExportLimitRows: 10000,
  realtimeTelemetryIntervalSec: 10,
  enableTamperAuditAlerts: true,
};

interface AuditSettingsSectionProps {
  auditConfig: AuditSettingsState;
  onUpdateAuditConfig: (updatedFields: Partial<AuditSettingsState>) => void;
}

export default function AuditSettingsSection({
  auditConfig,
  onUpdateAuditConfig,
}: AuditSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">verified_user</span>
          Audit Trail & Telemetry Settings (การตั้งค่าบันทึกประวัติและตรวจสอบระบบ)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดอายุการเก็บรักษาประวัติกิจกรรม (Retention), จำนวนแถวสูงสุดในการ Export, และรอบ Ping สุขภาพระบบ
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              หัวข้อหน้าจอ (Page Title)
            </label>
            <input
              type="text"
              value={auditConfig.pageTitle}
              onChange={(e) => onUpdateAuditConfig({ pageTitle: e.target.value })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              คำอธิบายหน้าจอ (Page Subtitle)
            </label>
            <input
              type="text"
              value={auditConfig.pageSubtitle}
              onChange={(e) => onUpdateAuditConfig({ pageSubtitle: e.target.value })}
              className="input-text w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Log Retention (Days)
            </label>
            <input
              type="number"
              min={30}
              max={365}
              value={auditConfig.retentionDays}
              onChange={(e) => onUpdateAuditConfig({ retentionDays: Number(e.target.value) })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Max Export Limit (Rows)
            </label>
            <input
              type="number"
              min={1000}
              max={50000}
              step={1000}
              value={auditConfig.maxExportLimitRows}
              onChange={(e) => onUpdateAuditConfig({ maxExportLimitRows: Number(e.target.value) })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Live Telemetry Ping (Seconds)
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={auditConfig.realtimeTelemetryIntervalSec}
              onChange={(e) => onUpdateAuditConfig({ realtimeTelemetryIntervalSec: Number(e.target.value) })}
              className="input-text w-full"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={auditConfig.enableTamperAuditAlerts}
              onChange={(e) => onUpdateAuditConfig({ enableTamperAuditAlerts: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 font-medium">
              เปิดการแจ้งเตือนทันทีหากตรวจพบความพยายามแก้ไขข้อมูลย้อนหลัง (Cryptographic Hash Tamper Alerts)
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
