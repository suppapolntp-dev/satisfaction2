"use client";

import React from "react";
import StatsGrid from "@/Components/Grids/StatsGrid";
import GeneralSettingsSection from "@/Components/Forms/GeneralSettingsSection";
import DashboardSettingsSection from "@/Components/Forms/DashboardSettingsSection";
import SatisfactionSettingsSection from "@/Components/Forms/SatisfactionSettingsSection";
import ReportSettingsSection from "@/Components/Forms/ReportSettingsSection";
import LocalizationSettingsSection from "@/Components/Forms/LocalizationSettingsSection";
import { useSystemSettingsScreen } from "./useSystemSettingsScreen";

// ==========================================================================
// ─── MAIN COMPONENT (Continuous Cards Layout with Scroll Navigation)
// ==========================================================================

export default function SystemSettingsScreen() {
  const {
    activeCategoryTab,
    scrollToSection,
    generalConfig,
    setGeneralConfig,
    dashboardConfig,
    setDashboardConfig,
    satisfactionConfig,
    setSatisfactionConfig,
    reportConfig,
    setReportConfig,
    localizationConfig,
    setLocalizationConfig,
    systemSettingStats,
    handleSaveSettings,
    handleResetToDefaults,
  } = useSystemSettingsScreen();

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

      {/* ─── 3. VERTICAL NAV + CONTINUOUS SECTIONS WORKSPACE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Settings Sticky In-Page Navigation (3 Cols) */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sticky top-3 z-10">
          <nav className="space-y-1 text-xs" aria-label="Settings section navigation">
            
            <button
              type="button"
              onClick={() => scrollToSection("general")}
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
              onClick={() => scrollToSection("dashboard")}
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
              onClick={() => scrollToSection("satisfaction")}
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
              onClick={() => scrollToSection("reports")}
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
              onClick={() => scrollToSection("localization")}
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

        {/* Right Side: Continuous Form Configuration Sections (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          <div id="section-general" className="scroll-mt-4">
            <GeneralSettingsSection
              generalConfig={generalConfig}
              onUpdateGeneralConfig={(fields) => setGeneralConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>

          <div id="section-dashboard" className="scroll-mt-4">
            <DashboardSettingsSection
              dashboardConfig={dashboardConfig}
              onUpdateDashboardConfig={(fields) => setDashboardConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>

          <div id="section-satisfaction" className="scroll-mt-4">
            <SatisfactionSettingsSection
              satisfactionConfig={satisfactionConfig}
              onUpdateSatisfactionConfig={(fields) => setSatisfactionConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>

          <div id="section-reports" className="scroll-mt-4">
            <ReportSettingsSection
              reportConfig={reportConfig}
              onUpdateReportConfig={(fields) => setReportConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>

          <div id="section-localization" className="scroll-mt-4">
            <LocalizationSettingsSection
              localizationConfig={localizationConfig}
              onUpdateLocalizationConfig={(fields) => setLocalizationConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>
        </div>

      </div>

    </div>
  );
}
