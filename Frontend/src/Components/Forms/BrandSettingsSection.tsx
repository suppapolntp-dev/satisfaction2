"use client";

import React from "react";

export interface BrandSettingsState {
  pageTitle: string;
  pageSubtitle: string;
  defaultBranchCodePrefix: string;
  allowAutoGenerateBranchCode: boolean;
  maxBranchesPerBrand: number;
  defaultBrandActiveStatus: boolean;
}

export const DEFAULT_BRAND_SETTINGS: BrandSettingsState = {
  pageTitle: "Brand & Branch Directory",
  pageSubtitle: "Manage restaurant brands, regional hierarchies, and retail branch networks.",
  defaultBranchCodePrefix: "BR-",
  allowAutoGenerateBranchCode: true,
  maxBranchesPerBrand: 500,
  defaultBrandActiveStatus: true,
};

interface BrandSettingsSectionProps {
  brandConfig: BrandSettingsState;
  onUpdateBrandConfig: (updatedFields: Partial<BrandSettingsState>) => void;
}

export default function BrandSettingsSection({
  brandConfig,
  onUpdateBrandConfig,
}: BrandSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">store</span>
          Brand & Branch Operations Settings (การตั้งค่าแบรนด์และสาขา)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดข้อความหัวข้อหน้าจอ, รูปแบบรหัสสาขาอัตโนมัติ, และข้อจำกัดเชิงโครงสร้างสาขา
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
              value={brandConfig.pageTitle}
              onChange={(e) => onUpdateBrandConfig({ pageTitle: e.target.value })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              คำอธิบายหน้าจอ (Page Subtitle)
            </label>
            <input
              type="text"
              value={brandConfig.pageSubtitle}
              onChange={(e) => onUpdateBrandConfig({ pageSubtitle: e.target.value })}
              className="input-text w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Branch Code Prefix
            </label>
            <input
              type="text"
              value={brandConfig.defaultBranchCodePrefix}
              onChange={(e) => onUpdateBrandConfig({ defaultBranchCodePrefix: e.target.value })}
              className="input-text w-full"
              placeholder="e.g., BR-"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Max Branches per Brand
            </label>
            <input
              type="number"
              value={brandConfig.maxBranchesPerBrand}
              onChange={(e) => onUpdateBrandConfig({ maxBranchesPerBrand: Number(e.target.value) })}
              className="input-text w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Auto Code Generation
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={brandConfig.allowAutoGenerateBranchCode}
                onChange={(e) => onUpdateBrandConfig({ allowAutoGenerateBranchCode: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700 font-medium">เปิดใช้งานการสร้างรหัสสาขาอัตโนมัติ</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
