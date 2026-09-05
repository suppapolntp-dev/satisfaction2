"use client";

import React, { useState, useEffect, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import GeneralSettingsSection, { GeneralSettingsState } from "@/Components/Forms/GeneralSettingsSection";
import DashboardSettingsSection, { DashboardSettingsState } from "@/Components/Forms/DashboardSettingsSection";
import SatisfactionSettingsSection from "@/Components/Forms/SatisfactionSettingsSection";
import ReportSettingsSection, { ReportSettingsState } from "@/Components/Forms/ReportSettingsSection";
import LocalizationSettingsSection, { LocalizationSettingsState } from "@/Components/Forms/LocalizationSettingsSection";
import { 
  SatisfactionConfig, 
  DEFAULT_SATISFACTION_CONFIG, 
  getStoredSatisfactionConfig, 
  saveStoredSatisfactionConfig 
} from "@/Lib/satisfactionSettings";
import { useModal } from "@/Context/ModalContext";

// ==========================================================================
// ─── 1. INTERFACES (นิยามประเภทแท็บการตั้งค่า)
// ==========================================================================

export type SettingsCategoryTab = "general" | "dashboard" | "satisfaction" | "reports" | "localization";

const DEFAULT_GENERAL_SETTINGS: GeneralSettingsState = {
  systemName: "Satisfaction Management",
  companyName: "Globex International",
  contactEmail: "admin@satisfaction-management.com",
  systemLogoUrl: "",
};

const DEFAULT_DASHBOARD_SETTINGS: DashboardSettingsState = {
  refreshInterval: "30s",
  enableRealtimeSound: false,
  benchmarkThreshold: 85,
};

const DEFAULT_REPORT_SETTINGS: ReportSettingsState = {
  pdfHeaderTitle: "Confidential - Executive CSAT Performance & Sentiment Report",
  pdfFooterNote: "Generated automatically by Enterprise CSAT Backoffice. All rights reserved.",
  defaultExportFormat: "excel",
  includeWatermark: true,
};

const DEFAULT_LOCALIZATION_SETTINGS: LocalizationSettingsState = {
  systemTimezone: "Asia/Bangkok (UTC+07:00)",
  dateFormatPattern: "DD/MM/YYYY",
  defaultLanguage: "Thai (ไทย)",
};

// ==========================================================================
// ─── 2. MAIN COMPONENT (Clean & Modular Layout)
// ==========================================================================

export default function SystemSettingsScreen() {
  const { showConfirm, showSuccess, showError } = useModal();

  // สเตตัสหมวดหมู่ที่เลือก (Active Tab)
  const [activeCategoryTab, setActiveCategoryTab] = useState<SettingsCategoryTab>("general");

  // สเตตัสฟอร์มแต่ละส่วน
  const [generalConfig, setGeneralConfig] = useState<GeneralSettingsState>(DEFAULT_GENERAL_SETTINGS);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardSettingsState>(DEFAULT_DASHBOARD_SETTINGS);
  const [satisfactionConfig, setSatisfactionConfig] = useState<SatisfactionConfig>(DEFAULT_SATISFACTION_CONFIG);
  const [reportConfig, setReportConfig] = useState<ReportSettingsState>(DEFAULT_REPORT_SETTINGS);
  const [localizationConfig, setLocalizationConfig] = useState<LocalizationSettingsState>(DEFAULT_LOCALIZATION_SETTINGS);

  // ดึงค่าการตั้งค่าแบบประเมินที่บันทึกไว้ใน LocalStorage เมื่อโหลดหน้าจอ
  useEffect(() => {
    const savedConfig = getStoredSatisfactionConfig();
    setSatisfactionConfig(savedConfig);
  }, []);

  // ข้อมูลสถิติ KPI สรุปสถานะการตั้งค่าระบบ
  const systemSettingStats: StatItem[] = useMemo(() => [
    { label: "Active Config Profile", value: "Production", change: "Live environment", isUp: true, icon: "tune", color: "text-blue-600" },
    { label: "Auto-Refresh Rate", value: dashboardConfig.refreshInterval, change: "Real-time polling", isUp: true, icon: "sync", color: "text-emerald-600" },
    { label: "Anti-Duplicate Window", value: `${satisfactionConfig.duplicateVoteMinutes} Mins`, change: "Active vote protection", isUp: true, icon: "security", color: "text-purple-600" },
    { label: "System Localization", value: "UTC+7 (TH/EN)", change: "Bilingual enabled", isUp: true, icon: "language", color: "text-amber-600" }
  ], [dashboardConfig.refreshInterval, satisfactionConfig.duplicateVoteMinutes]);

  // ฟังก์ชันบันทึกการตั้งค่าทั้งหมด (ซิงก์ลง LocalStorage ทันที)
  const handleSaveSettings = () => {
    try {
      saveStoredSatisfactionConfig(satisfactionConfig);
      showSuccess("บันทึกการตั้งค่าระบบและอัปเดตหน้าจอ Kiosk Satisfaction สำเร็จเรียบร้อยแล้ว!");
    } catch (err: any) {
      showError(err?.message || "ไม่สามารถบันทึกการตั้งค่าได้");
    }
  };

  // ฟังก์ชันรีเซ็ตค่ากลับเป็นค่าเริ่มต้น
  const handleResetToDefaults = () => {
    showConfirm({
      title: "ยืนยันการรีเซ็ตการตั้งค่า?",
      description: "คุณต้องการรีเซ็ตการตั้งค่าระบบทั้งหมดกลับเป็นค่ามาตรฐานเริ่มต้นหรือไม่?",
      variant: "warning",
      confirmText: "รีเซ็ตค่าเริ่มต้น",
      onConfirm: () => {
        setGeneralConfig(DEFAULT_GENERAL_SETTINGS);
        setDashboardConfig(DEFAULT_DASHBOARD_SETTINGS);
        setSatisfactionConfig(DEFAULT_SATISFACTION_CONFIG);
        setReportConfig(DEFAULT_REPORT_SETTINGS);
        setLocalizationConfig(DEFAULT_LOCALIZATION_SETTINGS);
        saveStoredSatisfactionConfig(DEFAULT_SATISFACTION_CONFIG);
        showSuccess("รีเซ็ตการตั้งค่าระบบกลับเป็นค่ามาตรฐานเรียบร้อยแล้ว");
      },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage core platform settings, localized content, survey rules, and default behaviors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="btn-secondary"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset Defaults
          </button>
          
          <button
            type="button"
            onClick={handleSaveSettings}
            className="btn-primary"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Changes
          </button>
        </div>
      </div>

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={systemSettingStats} />

      {/* ─── 3. VERTICAL TAB LAYOUT WORKSPACE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Settings Vertical Navigation Tabs (3 Cols) */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sticky top-24">
          <nav className="space-y-1 text-xs">
            
            <button
              type="button"
              onClick={() => setActiveCategoryTab("general")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-left cursor-pointer ${
                activeCategoryTab === "general"
                  ? "bg-blue-50 text-blue-950 font-bold border border-blue-200 shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeCategoryTab === "general" ? "text-blue-900" : "text-slate-400"}`}>
                tune
              </span>
              <span>General Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-left cursor-pointer ${
                activeCategoryTab === "dashboard"
                  ? "bg-blue-50 text-blue-950 font-bold border border-blue-200 shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeCategoryTab === "dashboard" ? "text-blue-900" : "text-slate-400"}`}>
                insert_chart
              </span>
              <span>Dashboard Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab("satisfaction")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-left cursor-pointer ${
                activeCategoryTab === "satisfaction"
                  ? "bg-blue-50 text-blue-950 font-bold border border-blue-200 shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeCategoryTab === "satisfaction" ? "text-blue-900" : "text-slate-400"}`}>
                mood
              </span>
              <span>Satisfaction Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab("reports")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-left cursor-pointer ${
                activeCategoryTab === "reports"
                  ? "bg-blue-50 text-blue-950 font-bold border border-blue-200 shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeCategoryTab === "reports" ? "text-blue-900" : "text-slate-400"}`}>
                description
              </span>
              <span>Report Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab("localization")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-left cursor-pointer ${
                activeCategoryTab === "localization"
                  ? "bg-blue-50 text-blue-950 font-bold border border-blue-200 shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeCategoryTab === "localization" ? "text-blue-900" : "text-slate-400"}`}>
                language
              </span>
              <span>Localization</span>
            </button>

          </nav>
        </aside>

        {/* Right Side: Modular Form Configuration Content (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {activeCategoryTab === "general" && (
            <GeneralSettingsSection
              generalConfig={generalConfig}
              onUpdateGeneralConfig={(fields) => setGeneralConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "dashboard" && (
            <DashboardSettingsSection
              dashboardConfig={dashboardConfig}
              onUpdateDashboardConfig={(fields) => setDashboardConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "satisfaction" && (
            <SatisfactionSettingsSection
              satisfactionConfig={satisfactionConfig}
              onUpdateSatisfactionConfig={(fields) => setSatisfactionConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "reports" && (
            <ReportSettingsSection
              reportConfig={reportConfig}
              onUpdateReportConfig={(fields) => setReportConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "localization" && (
            <LocalizationSettingsSection
              localizationConfig={localizationConfig}
              onUpdateLocalizationConfig={(fields) => setLocalizationConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}
        </div>

      </div>

    </div>
  );
}
