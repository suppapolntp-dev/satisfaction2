"use client";

import React from "react";
import StatsGrid from "@/Components/Grids/StatsGrid";
import GeneralSettingsSection from "@/Components/Forms/GeneralSettingsSection";
import AuthSettingsSection from "@/Components/Forms/AuthSettingsSection";
import DashboardSettingsSection from "@/Components/Forms/DashboardSettingsSection";
import SatisfactionSettingsSection from "@/Components/Forms/SatisfactionSettingsSection";
import BrandSettingsSection from "@/Components/Forms/BrandSettingsSection";
import EventSettingsSection from "@/Components/Forms/EventSettingsSection";
import UserSettingsSection from "@/Components/Forms/UserSettingsSection";
import RoleSettingsSection from "@/Components/Forms/RoleSettingsSection";
import AuditSettingsSection from "@/Components/Forms/AuditSettingsSection";
import NotificationSettingsSection from "@/Components/Forms/NotificationSettingsSection";
import ReportSettingsSection from "@/Components/Forms/ReportSettingsSection";
import LocalizationSettingsSection from "@/Components/Forms/LocalizationSettingsSection";
import { useSystemSettingsScreen, SettingsCategoryTab } from "./useSystemSettingsScreen";

// ==========================================================================
// ─── MAIN COMPONENT (Continuous Cards Layout with Scroll Navigation)
// ==========================================================================

export default function SystemSettingsScreen() {
  const {
    activeCategoryTab,
    scrollToSection,
    generalConfig,
    setGeneralConfig,
    authConfig,
    setAuthConfig,
    dashboardConfig,
    setDashboardConfig,
    satisfactionConfig,
    setSatisfactionConfig,
    brandConfig,
    setBrandConfig,
    eventConfig,
    setEventConfig,
    userConfig,
    setUserConfig,
    roleConfig,
    setRoleConfig,
    auditConfig,
    setAuditConfig,
    notificationConfig,
    setNotificationConfig,
    reportConfig,
    setReportConfig,
    localizationConfig,
    setLocalizationConfig,
    systemSettingStats,
    handleSaveSettings,
    handleResetToDefaults,
  } = useSystemSettingsScreen();

  const navGroups: { groupLabel: string; items: { id: SettingsCategoryTab; label: string; icon: string }[] }[] = [
    {
      groupLabel: "Core Experience",
      items: [
        { id: "general", label: "General & Branding", icon: "tune" },
        { id: "auth", label: "Login & Authentication", icon: "lock" },
        { id: "dashboard", label: "Dashboard & Analytics", icon: "insert_chart" },
        { id: "satisfaction", label: "Satisfaction Kiosk", icon: "mood" },
      ],
    },
    {
      groupLabel: "Operations & Hierarchy",
      items: [
        { id: "brand", label: "Brand & Branch Network", icon: "store" },
        { id: "events", label: "Campaign & Events", icon: "campaign" },
      ],
    },
    {
      groupLabel: "Access & Governance",
      items: [
        { id: "users", label: "Staff & Provisioning", icon: "group" },
        { id: "roles", label: "Roles & RBAC Matrix", icon: "security" },
        { id: "audit", label: "Audit Trail & Telemetry", icon: "verified_user" },
        { id: "notifications", label: "Incident Alerts & Triage", icon: "notifications_active" },
      ],
    },
    {
      groupLabel: "Output & Formatting",
      items: [
        { id: "reports", label: "Report Settings", icon: "description" },
        { id: "localization", label: "Localization & Timezone", icon: "language" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage core platform settings, authentication hero branding, survey rules, and default behaviors across all pages.
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
            Save All Changes
          </button>
        </div>
      </div>

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={systemSettingStats} />

      {/* ─── 3. VERTICAL NAV + CONTINUOUS SECTIONS WORKSPACE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Settings Sticky In-Page Navigation (3 Cols) */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sticky top-3 z-10 max-h-[calc(100vh-2rem)] overflow-y-auto [scrollbar-width:thin]">
          <nav className="space-y-4 text-xs" aria-label="Settings section navigation">
            {navGroups.map((group) => (
              <div key={group.groupLabel} className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {group.groupLabel}
                </span>
                {group.items.map((item) => {
                  const isActive = activeCategoryTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-semibold text-left cursor-pointer ${
                        isActive
                          ? "bg-blue-50 text-blue-950 font-bold border border-blue-200 shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${isActive ? "text-blue-900" : "text-slate-400"}`}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
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

          <div id="section-auth" className="scroll-mt-4">
            <AuthSettingsSection
              authConfig={authConfig}
              onUpdateAuthConfig={(fields) => setAuthConfig((prev) => ({ ...prev, ...fields }))}
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

          <div id="section-brand" className="scroll-mt-4">
            <BrandSettingsSection
              brandConfig={brandConfig}
              onUpdateBrandConfig={(fields) => setBrandConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>

          <div id="section-events" className="scroll-mt-4">
            <EventSettingsSection
              eventConfig={eventConfig}
              onUpdateEventConfig={(fields) => setEventConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>

          <div id="section-users" className="scroll-mt-4">
            <UserSettingsSection
              userConfig={userConfig}
              onUpdateUserConfig={(fields) => setUserConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>

          <div id="section-roles" className="scroll-mt-4">
            <RoleSettingsSection
              roleConfig={roleConfig}
              onUpdateRoleConfig={(fields) => setRoleConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>

          <div id="section-audit" className="scroll-mt-4">
            <AuditSettingsSection
              auditConfig={auditConfig}
              onUpdateAuditConfig={(fields) => setAuditConfig((prev) => ({ ...prev, ...fields }))}
            />
          </div>

          <div id="section-notifications" className="scroll-mt-4">
            <NotificationSettingsSection
              notificationConfig={notificationConfig}
              onUpdateNotificationConfig={(fields) => setNotificationConfig((prev) => ({ ...prev, ...fields }))}
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
