"use client";

import React from "react";

export interface NotificationSettingsState {
  pageTitle: string;
  pageSubtitle: string;
  slackWebhookUrl: string;
  enableCriticalSmsAlerts: boolean;
  enableDailyDigestEmail: boolean;
  lowCsatAlertThreshold: number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsState = {
  pageTitle: "Incident & Notification Triage",
  pageSubtitle: "Dispatch operational alerts, trigger escalation protocols, and monitor critical threshold events.",
  slackWebhookUrl: "https://hooks.slack.com/services/CRG/OPS/SATISFACTION",
  enableCriticalSmsAlerts: true,
  enableDailyDigestEmail: true,
  lowCsatAlertThreshold: 70,
};

interface NotificationSettingsSectionProps {
  notificationConfig: NotificationSettingsState;
  onUpdateNotificationConfig: (updatedFields: Partial<NotificationSettingsState>) => void;
}

export default function NotificationSettingsSection({
  notificationConfig,
  onUpdateNotificationConfig,
}: NotificationSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">notifications_active</span>
          Notification & Alert Dispatch Settings (การตั้งค่าการแจ้งเตือนและข้อความแจ้งเหตุ)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดเกณฑ์แจ้งเตือนคะแนนความพึงพอใจต่ำ, ลิงก์ Webhook เชื่อมต่อ Slack/Teams, และอีเมลสรุปประจำวัน
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
              value={notificationConfig.pageTitle}
              onChange={(e) => onUpdateNotificationConfig({ pageTitle: e.target.value })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              คำอธิบายหน้าจอ (Page Subtitle)
            </label>
            <input
              type="text"
              value={notificationConfig.pageSubtitle}
              onChange={(e) => onUpdateNotificationConfig({ pageSubtitle: e.target.value })}
              className="input-text w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Slack/Teams Webhook URL
            </label>
            <input
              type="url"
              value={notificationConfig.slackWebhookUrl}
              onChange={(e) => onUpdateNotificationConfig({ slackWebhookUrl: e.target.value })}
              className="input-text w-full text-xs font-mono"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Trigger Alert When CSAT Drops Below (%)
            </label>
            <input
              type="number"
              min={10}
              max={95}
              value={notificationConfig.lowCsatAlertThreshold}
              onChange={(e) => onUpdateNotificationConfig({ lowCsatAlertThreshold: Number(e.target.value) })}
              className="input-text w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationConfig.enableCriticalSmsAlerts}
              onChange={(e) => onUpdateNotificationConfig({ enableCriticalSmsAlerts: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 font-medium">
              ส่งข้อความด่วน (SMS Alert) ไปยัง Area Manager เมื่อสาขามี CSAT ตกต่ำวิกฤต
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationConfig.enableDailyDigestEmail}
              onChange={(e) => onUpdateNotificationConfig({ enableDailyDigestEmail: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 font-medium">
              ส่งอีเมลสรุปภาพรวมคะแนนความพึงพอใจรายวัน (Daily CSAT Executive Digest)
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
