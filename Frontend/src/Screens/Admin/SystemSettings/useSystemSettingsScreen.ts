"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { StatItem } from "@/Components/Grids/StatsGrid";
import { GeneralSettingsState } from "@/Components/Forms/GeneralSettingsSection";
import { DashboardSettingsState } from "@/Components/Forms/DashboardSettingsSection";
import { ReportSettingsState } from "@/Components/Forms/ReportSettingsSection";
import { LocalizationSettingsState } from "@/Components/Forms/LocalizationSettingsSection";
import { 
  SatisfactionConfig, 
  DEFAULT_SATISFACTION_CONFIG, 
  getStoredSatisfactionConfig, 
  saveStoredSatisfactionConfig 
} from "@/Lib/satisfactionSettings";
import { useModal } from "@/Context/ModalContext";

export type SettingsCategoryTab = "general" | "dashboard" | "satisfaction" | "reports" | "localization";

export const DEFAULT_GENERAL_SETTINGS: GeneralSettingsState = {
  systemName: "Satisfaction Management",
  companyName: "Globex International",
  contactEmail: "admin@satisfaction-management.com",
  systemLogoUrl: "",
};

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettingsState = {
  refreshInterval: "30s",
  enableRealtimeSound: false,
  benchmarkThreshold: 85,
};

export const DEFAULT_REPORT_SETTINGS: ReportSettingsState = {
  pdfHeaderTitle: "Confidential - Executive CSAT Performance & Sentiment Report",
  pdfFooterNote: "Generated automatically by Enterprise CSAT Backoffice. All rights reserved.",
  defaultExportFormat: "excel",
  includeWatermark: true,
};

export const DEFAULT_LOCALIZATION_SETTINGS: LocalizationSettingsState = {
  systemTimezone: "Asia/Bangkok (UTC+07:00)",
  dateFormatPattern: "DD/MM/YYYY",
  defaultLanguage: "Thai (ไทย)",
};

export function useSystemSettingsScreen() {
  const { showConfirm, showSuccess, showError } = useModal();

  // Active Category Tab (for sidebar indicator and scroll target)
  const [activeCategoryTab, setActiveCategoryTab] = useState<SettingsCategoryTab>("general");

  // Form states
  const [generalConfig, setGeneralConfig] = useState<GeneralSettingsState>(DEFAULT_GENERAL_SETTINGS);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardSettingsState>(DEFAULT_DASHBOARD_SETTINGS);
  const [satisfactionConfig, setSatisfactionConfig] = useState<SatisfactionConfig>(DEFAULT_SATISFACTION_CONFIG);
  const [reportConfig, setReportConfig] = useState<ReportSettingsState>(DEFAULT_REPORT_SETTINGS);
  const [localizationConfig, setLocalizationConfig] = useState<LocalizationSettingsState>(DEFAULT_LOCALIZATION_SETTINGS);

  // Load stored satisfaction config on mount
  useEffect(() => {
    const savedConfig = getStoredSatisfactionConfig();
    setSatisfactionConfig(savedConfig);
  }, []);

  // Smooth scroll to target section and update active tab
  const scrollToSection = useCallback((tab: SettingsCategoryTab) => {
    setActiveCategoryTab(tab);
    const element = document.getElementById(`section-${tab}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // ScrollSpy via IntersectionObserver to track visible section while scrolling
  useEffect(() => {
    const sectionIds: SettingsCategoryTab[] = ["general", "dashboard", "satisfaction", "reports", "localization"];
    const observerOptions = {
      root: null,
      rootMargin: "-15% 0px -65% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const tab = entry.target.id.replace("section-", "") as SettingsCategoryTab;
          if (sectionIds.includes(tab)) {
            setActiveCategoryTab(tab);
          }
        }
      });
    }, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(`section-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Stats KPI overview
  const systemSettingStats: StatItem[] = useMemo(() => [
    { label: "Active Config Profile", value: "Production", change: "Live environment", isUp: true, icon: "tune", color: "text-blue-600" },
    { label: "Auto-Refresh Rate", value: dashboardConfig.refreshInterval, change: "Real-time polling", isUp: true, icon: "sync", color: "text-emerald-600" },
    { label: "Anti-Duplicate Window", value: `${satisfactionConfig.duplicateVoteMinutes} Mins`, change: "Active vote protection", isUp: true, icon: "security", color: "text-purple-600" },
    { label: "System Localization", value: "UTC+7 (TH/EN)", change: "Bilingual enabled", isUp: true, icon: "language", color: "text-amber-600" },
  ], [dashboardConfig.refreshInterval, satisfactionConfig.duplicateVoteMinutes]);

  // Save all settings
  const handleSaveSettings = () => {
    try {
      saveStoredSatisfactionConfig(satisfactionConfig);
      showSuccess("บันทึกการตั้งค่าระบบและอัปเดตหน้าจอ Kiosk Satisfaction สำเร็จเรียบร้อยแล้ว!");
    } catch (err: any) {
      showError(err?.message || "ไม่สามารถบันทึกการตั้งค่าได้");
    }
  };

  // Reset to defaults
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

  return {
    activeCategoryTab,
    setActiveCategoryTab,
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
  };
}
