"use client";

import React from "react";

export interface EventSettingsState {
  pageTitle: string;
  pageSubtitle: string;
  defaultCsatBenchmark: number;
  autoArchiveCompletedDays: number;
  allowOverlappingCampaigns: boolean;
}

export const DEFAULT_EVENT_SETTINGS: EventSettingsState = {
  pageTitle: "Event & Campaign Management",
  pageSubtitle: "Organize marketing campaigns, promotional CSAT targets, and feedback collection drives.",
  defaultCsatBenchmark: 80,
  autoArchiveCompletedDays: 30,
  allowOverlappingCampaigns: true,
};

interface EventSettingsSectionProps {
  eventConfig: EventSettingsState;
  onUpdateEventConfig: (updatedFields: Partial<EventSettingsState>) => void;
}

export default function EventSettingsSection({
  eventConfig,
  onUpdateEventConfig,
}: EventSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">campaign</span>
          Event & Campaign Settings (การตั้งค่าแคมเปญและอีเวนต์)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดเป้าหมายคะแนน CSAT ขั้นต่ำ, ระยะเวลาจัดเก็บแคมเปญที่สิ้นสุด, และนโยบายแคมเปญ
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
              value={eventConfig.pageTitle}
              onChange={(e) => onUpdateEventConfig({ pageTitle: e.target.value })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              คำอธิบายหน้าจอ (Page Subtitle)
            </label>
            <input
              type="text"
              value={eventConfig.pageSubtitle}
              onChange={(e) => onUpdateEventConfig({ pageSubtitle: e.target.value })}
              className="input-text w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Default CSAT Target (%)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={eventConfig.defaultCsatBenchmark}
              onChange={(e) => onUpdateEventConfig({ defaultCsatBenchmark: Number(e.target.value) })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Auto Archive After (Days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={eventConfig.autoArchiveCompletedDays}
              onChange={(e) => onUpdateEventConfig({ autoArchiveCompletedDays: Number(e.target.value) })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Overlapping Campaigns
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={eventConfig.allowOverlappingCampaigns}
                onChange={(e) => onUpdateEventConfig({ allowOverlappingCampaigns: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700 font-medium">อนุญาตให้แคมเปญซ้อนทับกันได้</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
