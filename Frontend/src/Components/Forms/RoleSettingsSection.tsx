"use client";

import React from "react";

export interface RoleSettingsState {
  pageTitle: string;
  pageSubtitle: string;
  enforceMfaOnTiers1To4: boolean;
  allowCustomRoleCreation: boolean;
  defaultAssignedRoleCode: string;
  logPermissionModifications: boolean;
}

export const DEFAULT_ROLE_SETTINGS: RoleSettingsState = {
  pageTitle: "Roles & Permissions Matrix",
  pageSubtitle: "Define functional scopes, configure access control lists, and enforce RBAC policies.",
  enforceMfaOnTiers1To4: true,
  allowCustomRoleCreation: true,
  defaultAssignedRoleCode: "STAFF",
  logPermissionModifications: true,
};

interface RoleSettingsSectionProps {
  roleConfig: RoleSettingsState;
  onUpdateRoleConfig: (updatedFields: Partial<RoleSettingsState>) => void;
}

export default function RoleSettingsSection({
  roleConfig,
  onUpdateRoleConfig,
}: RoleSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">security</span>
          Roles & RBAC Governance Settings (การตั้งค่าบทบาทและสิทธิ์)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดนโยบายความปลอดภัย 2FA ตามระดับ Tier, สิทธิ์การสร้าง Role แบบ Custom, และการตรวจสอบสิทธิ์
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
              value={roleConfig.pageTitle}
              onChange={(e) => onUpdateRoleConfig({ pageTitle: e.target.value })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              คำอธิบายหน้าจอ (Page Subtitle)
            </label>
            <input
              type="text"
              value={roleConfig.pageSubtitle}
              onChange={(e) => onUpdateRoleConfig({ pageSubtitle: e.target.value })}
              className="input-text w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Default Auto-Assigned Role
            </label>
            <input
              type="text"
              value={roleConfig.defaultAssignedRoleCode}
              onChange={(e) => onUpdateRoleConfig({ defaultAssignedRoleCode: e.target.value })}
              className="input-text w-full"
              placeholder="e.g., STAFF"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Security Enforcement Rules
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roleConfig.enforceMfaOnTiers1To4}
                  onChange={(e) => onUpdateRoleConfig({ enforceMfaOnTiers1To4: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  บังคับใช้งาน 2-Step SMS OTP สำหรับ Tier 1-4 (Admin, Brand, RM, AM)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roleConfig.allowCustomRoleCreation}
                  onChange={(e) => onUpdateRoleConfig({ allowCustomRoleCreation: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  อนุญาตให้สร้าง Custom Role นอกเหนือจาก System Roles หลัก
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
