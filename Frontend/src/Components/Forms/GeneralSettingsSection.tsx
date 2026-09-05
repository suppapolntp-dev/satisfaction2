"use client";

import React from "react";

export interface GeneralSettingsState {
  systemName: string;
  companyName: string;
  contactEmail: string;
  systemLogoUrl: string;
}

interface GeneralSettingsSectionProps {
  generalConfig: GeneralSettingsState;
  onUpdateGeneralConfig: (updatedFields: Partial<GeneralSettingsState>) => void;
}

export default function GeneralSettingsSection({
  generalConfig,
  onUpdateGeneralConfig,
}: GeneralSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">tune</span>
          General Settings (การตั้งค่าทั่วไป)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Basic identification and corporate branding for your CSAT instance.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              System Name
            </label>
            <input
              type="text"
              value={generalConfig.systemName}
              onChange={(inputEvent) => onUpdateGeneralConfig({ systemName: inputEvent.target.value })}
              className="input-text w-full"
              placeholder="e.g., Satisfaction Management"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Company Name
            </label>
            <input
              type="text"
              value={generalConfig.companyName}
              onChange={(inputEvent) => onUpdateGeneralConfig({ companyName: inputEvent.target.value })}
              className="input-text w-full"
              placeholder="e.g., Globex International"
            />
          </div>
        </div>

        {/* Contact Email */}
        <div className="space-y-1.5 max-w-md">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Support Contact Email
          </label>
          <input
            type="email"
            value={generalConfig.contactEmail}
            onChange={(inputEvent) => onUpdateGeneralConfig({ contactEmail: inputEvent.target.value })}
            className="input-text w-full"
            placeholder="admin@csat-enterprise.com"
          />
        </div>

        <hr className="border-slate-100" />

        {/* System Logo */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            System Logo
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
              <span className="material-symbols-outlined text-4xl text-blue-900">
                sentiment_satisfied
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => alert("เปิดหน้าต่างเลือกไฟล์รูปภาพโลโก้...")}
                  className="btn-secondary text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  Upload New
                </button>
                <button
                  type="button"
                  onClick={() => alert("ลบโลโก้ปัจจุบัน")}
                  className="btn-ghost text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Recommended format: PNG or SVG with transparent background (256x256px). Max file size: 2MB.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

