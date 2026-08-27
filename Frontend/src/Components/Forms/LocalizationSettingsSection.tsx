"use client";

import React from "react";

export interface LocalizationSettingsState {
  systemTimezone: string;
  dateFormatPattern: string;
  defaultLanguage: string;
}

interface LocalizationSettingsSectionProps {
  localizationConfig: LocalizationSettingsState;
  onUpdateLocalizationConfig: (updatedFields: Partial<LocalizationSettingsState>) => void;
}

export default function LocalizationSettingsSection({
  localizationConfig,
  onUpdateLocalizationConfig,
}: LocalizationSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">language</span>
          Localization & Regional Settings (การตั้งค่าภาษาและภูมิภาค)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Set server timezones, date display formats, and primary console language.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* System Timezone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              System Timezone
            </label>
            <select
              value={localizationConfig.systemTimezone}
              onChange={(selectEvent) => onUpdateLocalizationConfig({ systemTimezone: selectEvent.target.value })}
              className="input-select w-full"
            >
              <option value="Asia/Bangkok (UTC+07:00)">Asia/Bangkok (UTC+07:00)</option>
              <option value="Asia/Singapore (UTC+08:00)">Asia/Singapore (UTC+08:00)</option>
              <option value="Asia/Tokyo (UTC+09:00)">Asia/Tokyo (UTC+09:00)</option>
              <option value="Europe/London (UTC+00:00)">Europe/London (UTC+00:00)</option>
              <option value="America/New_York (UTC-05:00)">America/New_York (UTC-05:00)</option>
            </select>
          </div>

          {/* Date Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Date Display Format
            </label>
            <select
              value={localizationConfig.dateFormatPattern}
              onChange={(selectEvent) => onUpdateLocalizationConfig({ dateFormatPattern: selectEvent.target.value })}
              className="input-select w-full"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 27/08/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/27/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-27)</option>
            </select>
          </div>

        </div>

        {/* Console Language */}
        <div className="max-w-md space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Default Backoffice Language
          </label>
          <select
            value={localizationConfig.defaultLanguage}
            onChange={(selectEvent) => onUpdateLocalizationConfig({ defaultLanguage: selectEvent.target.value })}
            className="input-select w-full"
          >
            <option value="Thai (ไทย)">Thai (ไทย)</option>
            <option value="English (US)">English (US)</option>
          </select>
        </div>

      </div>
    </section>
  );
}

