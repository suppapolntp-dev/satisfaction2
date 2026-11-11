"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/Components/Headers/PageHeader";
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
// ─── NAV GROUP DEFINITIONS WITH SEARCHABLE BILINGUAL METADATA & SVG ICONS
// ==========================================================================

interface NavItem {
  id: SettingsCategoryTab;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export default function SystemSettingsScreen() {
  const {
    activeCategoryTab,
    setActiveCategoryTab,
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

  const [searchQuery, setSearchQuery] = useState("");

  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        groupLabel: "Core Experience (ประสบการณ์หลัก)",
        items: [
          {
            id: "general",
            label: "General & Branding",
            subLabel: "ข้อมูลระบบ, ชื่อบริษัท, โลโก้แบรนด์",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            ),
          },
          {
            id: "auth",
            label: "Login & Authentication",
            subLabel: "ความปลอดภัย, รหัสผ่าน, Hero Banner หน้าล็อกอิน",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ),
          },
          {
            id: "dashboard",
            label: "Dashboard & Analytics",
            subLabel: "ความสูงกราฟ, สไตล์เส้น, รอบรีเฟรช, CSAT Benchmark",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            ),
          },
          {
            id: "satisfaction",
            label: "Satisfaction Kiosk",
            subLabel: "หน้าจอ Kiosk, คำถาม, ฟอนต์, ปุ่มอิโมจิ, คูลดาวน์",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            ),
          },
        ],
      },
      {
        groupLabel: "Operations & Hierarchy (การดำเนินงาน)",
        items: [
          {
            id: "brand",
            label: "Brand & Branch Network",
            subLabel: "แบรนด์ในเครือ, รหัสสาขา, เขตพื้นที่",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ),
          },
          {
            id: "events",
            label: "Campaign & Events",
            subLabel: "แคมเปญพิเศษ, ข้อความต้อนรับตามเทศกาล",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ),
          },
        ],
      },
      {
        groupLabel: "Access & Governance (สิทธิ์ & การกำกับดูแล)",
        items: [
          {
            id: "users",
            label: "Staff & Provisioning",
            subLabel: "บัญชีผู้ใช้, พนักงาน, อีเมล, ขอบเขตสิทธิ์",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
          },
          {
            id: "roles",
            label: "Roles & RBAC Matrix",
            subLabel: "สิทธิ์การเข้าถึง 5 ระดับ, สิทธิ์รายโมดูล",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ),
          },
          {
            id: "audit",
            label: "Audit Trail & Telemetry",
            subLabel: "บันทึกประวัติการแก้ไข, System Logs",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            ),
          },
          {
            id: "notifications",
            label: "Incident Alerts & Triage",
            subLabel: "แจ้งเตือนคะแนนตก, ช่องทางรับข้อความ",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            ),
          },
        ],
      },
      {
        groupLabel: "Output & Formatting (รายงาน & รูปแบบ)",
        items: [
          {
            id: "reports",
            label: "Report Settings",
            subLabel: "รูปแบบ PDF, Excel, ลายน้ำ, ท้ายกระดาษ",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            ),
          },
          {
            id: "localization",
            label: "Localization & Timezone",
            subLabel: "ภาษาเริ่มต้น, รูปแบบวันที่, เขตเวลา UTC+7",
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            ),
          },
        ],
      },
    ],
    []
  );

  // In-Page Filter for Sidebar Items
  const filteredNavGroups = useMemo(() => {
    if (!searchQuery.trim()) return navGroups;
    const q = searchQuery.toLowerCase().trim();
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.subLabel.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery, navGroups]);

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER (Clean, Unified Header without TabPills) ─── */}
      <PageHeader
        title="Settings"
        description="ศูนย์กลางการตั้งค่าสถาปัตยกรรมระบบ รูปแบบหน้าจอ แบบสำรวจ Kiosk เกณฑ์มาตรฐาน และความปลอดภัยทั่วทั้งแพลตฟอร์ม"
        secondaryActions={
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="btn-header-secondary"
          >
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>รีเซ็ตค่าเริ่มต้น (Reset Defaults)</span>
          </button>
        }
        primaryAction={{
          label: "บันทึกการตั้งค่าทั้งหมด (Save All Changes)",
          variant: "primary",
          icon: (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          ),
          onClick: handleSaveSettings,
        }}
      />

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={systemSettingStats} />

      {/* ─── 3. WORKSPACE LAYOUT (Searchable Sidebar Navigation + Focused Form Card) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Searchable Sticky Sidebar Navigation (4 Cols on LG / 3 Cols on XL) */}
        <aside className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sticky top-4 z-10 max-h-[calc(100vh-2rem)] flex flex-col">
          
          {/* In-Page Quick Search Input */}
          <div className="relative mb-3 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาการตั้งค่า... (Search)"
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Clear search"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-4 text-xs overflow-y-auto [scrollbar-width:thin] pr-1" aria-label="Settings navigation">
            {filteredNavGroups.length === 0 ? (
              <div className="py-8 px-2 text-center">
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-700">ไม่พบเมนูตั้งค่า</p>
                <p className="text-[11px] text-slate-400 mt-0.5">ลองค้นหาด้วยคำอื่น เช่น กราฟ, kiosk, auth</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-[11px] font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                >
                  ล้างคำค้นหา
                </button>
              </div>
            ) : (
              filteredNavGroups.map((group) => (
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
                        onClick={() => setActiveCategoryTab(item.id)}
                        className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
                          isActive
                            ? "bg-blue-50 text-[var(--primary)] font-bold border border-blue-200/80 shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }`}
                      >
                        <span className={`w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center ${isActive ? "text-[var(--primary)]" : "text-slate-400"}`}>
                          {item.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`truncate ${isActive ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate font-normal mt-0.5">
                            {item.subLabel}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </nav>
        </aside>

        {/* Right Side: Single Focused Configuration Form (8 Cols on LG / 9 Cols on XL) */}
        <div className="lg:col-span-8 xl:col-span-9 min-w-0">
          {activeCategoryTab === "general" && (
            <GeneralSettingsSection
              generalConfig={generalConfig}
              onUpdateGeneralConfig={(fields) => setGeneralConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "auth" && (
            <AuthSettingsSection
              authConfig={authConfig}
              onUpdateAuthConfig={(fields) => setAuthConfig((prev) => ({ ...prev, ...fields }))}
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

          {activeCategoryTab === "brand" && (
            <BrandSettingsSection
              brandConfig={brandConfig}
              onUpdateBrandConfig={(fields) => setBrandConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "events" && (
            <EventSettingsSection
              eventConfig={eventConfig}
              onUpdateEventConfig={(fields) => setEventConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "users" && (
            <UserSettingsSection
              userConfig={userConfig}
              onUpdateUserConfig={(fields) => setUserConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "roles" && (
            <RoleSettingsSection
              roleConfig={roleConfig}
              onUpdateRoleConfig={(fields) => setRoleConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "audit" && (
            <AuditSettingsSection
              auditConfig={auditConfig}
              onUpdateAuditConfig={(fields) => setAuditConfig((prev) => ({ ...prev, ...fields }))}
            />
          )}

          {activeCategoryTab === "notifications" && (
            <NotificationSettingsSection
              notificationConfig={notificationConfig}
              onUpdateNotificationConfig={(fields) => setNotificationConfig((prev) => ({ ...prev, ...fields }))}
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
