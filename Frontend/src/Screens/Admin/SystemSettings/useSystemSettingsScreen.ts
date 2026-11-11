"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { StatItem } from "@/Components/Grids/StatsGrid";
import { GeneralSettingsState } from "@/Components/Forms/GeneralSettingsSection";
import { DashboardSettingsState } from "@/Components/Forms/DashboardSettingsSection";
import { ReportSettingsState } from "@/Components/Forms/ReportSettingsSection";
import { LocalizationSettingsState } from "@/Components/Forms/LocalizationSettingsSection";
import { 
  AuthHeroConfig, 
  DEFAULT_AUTH_HERO_CONFIG, 
  getStoredAuthHeroConfig, 
  saveStoredAuthHeroConfig 
} from "@/Lib/authSettings";
import { 
  SatisfactionConfig, 
  DEFAULT_SATISFACTION_CONFIG, 
  getStoredSatisfactionConfig, 
  saveStoredSatisfactionConfig 
} from "@/Lib/satisfactionSettings";
import {
  DashboardConfig,
  DEFAULT_DASHBOARD_CONFIG,
  getStoredDashboardConfig,
  saveStoredDashboardConfig,
} from "@/Lib/dashboardSettings";
import { BrandSettingsState, DEFAULT_BRAND_SETTINGS } from "@/Components/Forms/BrandSettingsSection";
import { EventSettingsState, DEFAULT_EVENT_SETTINGS } from "@/Components/Forms/EventSettingsSection";
import { UserSettingsState, DEFAULT_USER_SETTINGS } from "@/Components/Forms/UserSettingsSection";
import { RoleSettingsState, DEFAULT_ROLE_SETTINGS } from "@/Components/Forms/RoleSettingsSection";
import { AuditSettingsState, DEFAULT_AUDIT_SETTINGS } from "@/Components/Forms/AuditSettingsSection";
import { NotificationSettingsState, DEFAULT_NOTIFICATION_SETTINGS } from "@/Components/Forms/NotificationSettingsSection";
import { useModal } from "@/Context/ModalContext";
import {
  getStoredAuditConfig,
  saveStoredAuditConfig,
  getStoredBrandConfig,
  saveStoredBrandConfig,
  getStoredEventConfig,
  saveStoredEventConfig,
  getStoredNotificationConfig,
  saveStoredNotificationConfig,
  getStoredRoleConfig,
  saveStoredRoleConfig,
  getStoredUserSettingsConfig,
  saveStoredUserSettingsConfig,
} from "@/Lib/pageHeaderSettings";

export type SettingsCategoryTab = 
  | "all"
  | "dashboard" 
  | "satisfaction" 
  | "general" 
  | "auth" 
  | "brand" 
  | "events" 
  | "governance"
  | "users" 
  | "roles" 
  | "audit" 
  | "notifications" 
  | "reports" 
  | "localization";

export const DEFAULT_GENERAL_SETTINGS: GeneralSettingsState = {
  systemName: "Satisfaction Management",
  companyName: "Globex International",
  contactEmail: "admin@satisfaction-management.com",
  systemLogoUrl: "",
};

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettingsState = DEFAULT_DASHBOARD_CONFIG;

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

  // Active Category Tab (for in-page sidebar indicator and scroll target)
  const [activeCategoryTab, setActiveCategoryTab] = useState<SettingsCategoryTab>("general");

  // Form states for all pages
  const [generalConfig, setGeneralConfig] = useState<GeneralSettingsState>(DEFAULT_GENERAL_SETTINGS);
  const [authConfig, setAuthConfig] = useState<AuthHeroConfig>(DEFAULT_AUTH_HERO_CONFIG);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardSettingsState>(DEFAULT_DASHBOARD_SETTINGS);
  const [satisfactionConfig, setSatisfactionConfig] = useState<SatisfactionConfig>(DEFAULT_SATISFACTION_CONFIG);
  const [brandConfig, setBrandConfig] = useState<BrandSettingsState>(DEFAULT_BRAND_SETTINGS);
  const [eventConfig, setEventConfig] = useState<EventSettingsState>(DEFAULT_EVENT_SETTINGS);
  const [userConfig, setUserConfig] = useState<UserSettingsState>(DEFAULT_USER_SETTINGS);
  const [roleConfig, setRoleConfig] = useState<RoleSettingsState>(DEFAULT_ROLE_SETTINGS);
  const [auditConfig, setAuditConfig] = useState<AuditSettingsState>(DEFAULT_AUDIT_SETTINGS);
  const [notificationConfig, setNotificationConfig] = useState<NotificationSettingsState>(DEFAULT_NOTIFICATION_SETTINGS);
  const [reportConfig, setReportConfig] = useState<ReportSettingsState>(DEFAULT_REPORT_SETTINGS);
  const [localizationConfig, setLocalizationConfig] = useState<LocalizationSettingsState>(DEFAULT_LOCALIZATION_SETTINGS);

  // Load stored configs on client mount
  useEffect(() => {
    setSatisfactionConfig(getStoredSatisfactionConfig());
    setAuthConfig(getStoredAuthHeroConfig());
    setDashboardConfig(getStoredDashboardConfig());
    setAuditConfig(getStoredAuditConfig());
    setBrandConfig(getStoredBrandConfig());
    setEventConfig(getStoredEventConfig());
    setNotificationConfig(getStoredNotificationConfig());
    setRoleConfig(getStoredRoleConfig());
    setUserConfig(getStoredUserSettingsConfig());
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
    const sectionIds: SettingsCategoryTab[] = [
      "general",
      "auth",
      "dashboard",
      "satisfaction",
      "brand",
      "events",
      "users",
      "roles",
      "audit",
      "notifications",
      "reports",
      "localization"
    ];

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

  // Save all settings across all pages
  const handleSaveSettings = () => {
    try {
      saveStoredSatisfactionConfig(satisfactionConfig);
      saveStoredAuthHeroConfig(authConfig);
      saveStoredDashboardConfig(dashboardConfig);
      saveStoredAuditConfig(auditConfig);
      saveStoredBrandConfig(brandConfig);
      saveStoredEventConfig(eventConfig);
      saveStoredNotificationConfig(notificationConfig);
      saveStoredRoleConfig(roleConfig);
      saveStoredUserSettingsConfig(userConfig);
      showSuccess("บันทึกการตั้งค่าระบบและข้อความทุกหน้าจอสำเร็จเรียบร้อยแล้ว!");
    } catch (err: any) {
      showError(err?.message || "ไม่สามารถบันทึกการตั้งค่าได้");
    }
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    showConfirm({
      title: "ยืนยันการรีเซ็ตการตั้งค่า?",
      description: "คุณต้องการรีเซ็ตการตั้งค่าระบบและข้อความทุกหน้าจอกลับเป็นค่ามาตรฐานเริ่มต้นหรือไม่?",
      variant: "warning",
      confirmText: "รีเซ็ตค่าเริ่มต้น",
      onConfirm: () => {
        setGeneralConfig(DEFAULT_GENERAL_SETTINGS);
        setAuthConfig(DEFAULT_AUTH_HERO_CONFIG);
        setDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
        setSatisfactionConfig(DEFAULT_SATISFACTION_CONFIG);
        setBrandConfig(DEFAULT_BRAND_SETTINGS);
        setEventConfig(DEFAULT_EVENT_SETTINGS);
        setUserConfig(DEFAULT_USER_SETTINGS);
        setRoleConfig(DEFAULT_ROLE_SETTINGS);
        setAuditConfig(DEFAULT_AUDIT_SETTINGS);
        setNotificationConfig(DEFAULT_NOTIFICATION_SETTINGS);
        setReportConfig(DEFAULT_REPORT_SETTINGS);
        setLocalizationConfig(DEFAULT_LOCALIZATION_SETTINGS);

        saveStoredSatisfactionConfig(DEFAULT_SATISFACTION_CONFIG);
        saveStoredAuthHeroConfig(DEFAULT_AUTH_HERO_CONFIG);
        saveStoredDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
        saveStoredAuditConfig(DEFAULT_AUDIT_SETTINGS);
        saveStoredBrandConfig(DEFAULT_BRAND_SETTINGS);
        saveStoredEventConfig(DEFAULT_EVENT_SETTINGS);
        saveStoredNotificationConfig(DEFAULT_NOTIFICATION_SETTINGS);
        saveStoredRoleConfig(DEFAULT_ROLE_SETTINGS);
        saveStoredUserSettingsConfig(DEFAULT_USER_SETTINGS);
        showSuccess("รีเซ็ตการตั้งค่าทุกหน้าจอกลับเป็นค่ามาตรฐานเรียบร้อยแล้ว");
      },
    });
  };

  return {
    activeCategoryTab,
    setActiveCategoryTab,
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
  };
}
