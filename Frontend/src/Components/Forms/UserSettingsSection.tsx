"use client";

import React from "react";

export interface UserSettingsState {
  pageTitle: string;
  pageSubtitle: string;
  defaultStaffPasswordPlaceholder: string;
  maxFailedLoginsBeforeLock: number;
  sessionIdleTimeoutMinutes: number;
  requirePasswordChangeOnFirstLogin: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettingsState = {
  pageTitle: "Staff & User Directory",
  pageSubtitle: "Provision user accounts, assign scope hierarchy tiers, and enforce multi-factor credentials.",
  defaultStaffPasswordPlaceholder: "Admin@123456",
  maxFailedLoginsBeforeLock: 5,
  sessionIdleTimeoutMinutes: 60,
  requirePasswordChangeOnFirstLogin: true,
};

interface UserSettingsSectionProps {
  userConfig: UserSettingsState;
  onUpdateUserConfig: (updatedFields: Partial<UserSettingsState>) => void;
}

export default function UserSettingsSection({
  userConfig,
  onUpdateUserConfig,
}: UserSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">group</span>
          User & Staff Management Settings (การตั้งค่าผู้ใช้และบุคลากร)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดรหัสผ่านเริ่มต้น, จำนวนครั้งการล็อกอินผิดพลาดก่อนล็อกบัญชี, และเวลานับถอยหลังหมดอายุ Session
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
              value={userConfig.pageTitle}
              onChange={(e) => onUpdateUserConfig({ pageTitle: e.target.value })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              คำอธิบายหน้าจอ (Page Subtitle)
            </label>
            <input
              type="text"
              value={userConfig.pageSubtitle}
              onChange={(e) => onUpdateUserConfig({ pageSubtitle: e.target.value })}
              className="input-text w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Default New Staff Password
            </label>
            <input
              type="text"
              value={userConfig.defaultStaffPasswordPlaceholder}
              onChange={(e) => onUpdateUserConfig({ defaultStaffPasswordPlaceholder: e.target.value })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Max Failed Logins
            </label>
            <input
              type="number"
              min={3}
              max={10}
              value={userConfig.maxFailedLoginsBeforeLock}
              onChange={(e) => onUpdateUserConfig({ maxFailedLoginsBeforeLock: Number(e.target.value) })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              min={15}
              max={480}
              value={userConfig.sessionIdleTimeoutMinutes}
              onChange={(e) => onUpdateUserConfig({ sessionIdleTimeoutMinutes: Number(e.target.value) })}
              className="input-text w-full"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={userConfig.requirePasswordChangeOnFirstLogin}
              onChange={(e) => onUpdateUserConfig({ requirePasswordChangeOnFirstLogin: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 font-medium">
              บังคับให้ผู้ใช้งานเปลี่ยนรหัสผ่านทันทีเมื่อเข้าสู่ระบบครั้งแรก (First-Login Password Reset)
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
