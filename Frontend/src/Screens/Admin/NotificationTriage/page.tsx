"use client";

import React, { useMemo } from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import SearchInput from "@/Components/Inputs/SearchInput";
import NotificationInboxList from "@/Components/Lists/NotificationInboxList";
import { useNotificationTriageScreen, NotificationTabType } from "./useNotificationTriageScreen";

export interface NotificationTriageScreenProps {
  initialTab?: NotificationTabType;
}

export default function NotificationTriageScreen({
  initialTab = "all",
}: NotificationTriageScreenProps = {}) {
  const {
    activeTab,
    notificationTabs,
    notificationsList,
    filteredNotificationsList,
    activeNotification,
    selectedNotificationId,
    unreadCount,
    isLoading,
    isRefreshing,
    searchNotificationQuery,
    selectedTypeFilter,
    setSearchNotificationQuery,
    setSelectedTypeFilter,
    handleTabChange,
    handleRefresh,
    handleMarkAllAsRead,
    handleMarkCurrentAsRead,
    handleDismissNotification,
    handleSelectNotification,
  } = useNotificationTriageScreen({ initialTab });

  // ข้อมูลสถิติ KPI การแจ้งเตือน
  const notificationStatsData: StatItem[] = useMemo(() => {
    const total = notificationsList.length;
    const highCount = notificationsList.filter((n) => n.notificationPriority === "High").length;
    const unresolvedCount = notificationsList.filter((n) => !n.isNotificationRead).length;

    const hasData = total > 0;

    return [
      {
        label: "Total Alerts",
        value: hasData ? `${total}` : "-",
        change: "",
        isUp: true,
        icon: "notifications_active",
        color: "text-blue-600",
      },
      {
        label: "High Priority",
        value: hasData ? `${highCount} Spikes` : "-",
        change: "",
        isUp: false,
        icon: "error",
        color: "text-rose-600",
      },
      {
        label: "Unresolved Queue",
        value: hasData ? `${unresolvedCount} Pending` : "-",
        change: "",
        isUp: false,
        icon: "pending_actions",
        color: "text-amber-600",
      },
      {
        label: "Resolved Today",
        value: hasData ? "0 Cases" : "-",
        change: "",
        isUp: true,
        icon: "check_circle",
        color: "text-emerald-600",
      },
    ];
  }, [notificationsList]);



  return (
    <div className="space-y-6">
      
      {/* ─── 1. MODULAR STANDARDIZED PAGE HEADER COMPONENT ─── */}
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </span>
            <span>Notification &amp; Alert Triage</span>
          </span>
        }
        description="ศูนย์กลางการติดตามเหตุการณ์แจ้งเตือน ความผิดปกติของตู้ Kiosk ตลอดจนข้อเสนอแนะความพึงพอใจ เพื่อการวิเคราะห์และแก้ไขปัญหาได้อย่างทันท่วงที"
        tabs={notificationTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryAction={{
          label: "Mark All as Read",
          variant: "dark",
          icon: (
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 7 17l-5-5" />
              <path d="m22 10-7.5 7.5L13 16" />
            </svg>
          ),
          onClick: handleMarkAllAsRead,
        }}
        secondaryActions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 select-none"
          >
            <svg
              className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>{isRefreshing ? "กำลังรีเฟรช..." : "Refresh Telemetry"}</span>
          </button>
        }
      />

      {/* ─── 2. STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={notificationStatsData} />

      {/* ─── 3. SEARCH & FILTER CONTROLS ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={searchNotificationQuery}
            onChange={setSearchNotificationQuery}
            placeholder="ค้นหาการแจ้งเตือน หรือชื่อสาขา..."
          />

          <div className="relative">
            <select
              value={selectedTypeFilter}
              onChange={(selectEvent) => setSelectedTypeFilter(selectEvent.target.value)}
              className="input-select pr-8"
            >
              <option value="All Types">ทุกประเภท (All Types)</option>
              <option value="Alert">แจ้งเตือนเร่งด่วน (Alerts Only)</option>
              <option value="Feedback">ข้อเสนอแนะลูกค้า (Customer Feedback)</option>
              <option value="System">ระบบและฮาร์ดแวร์ (System & Hardware)</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium select-none">
          แสดง {filteredNotificationsList.length} รายการ
        </span>
      </div>

      {/* ─── 4. SPLIT-PANE TRIAGE BOARD ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
        
        {/* Left Side: Inbox List (4 Cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col min-h-0">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Inbox Queue
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {filteredNotificationsList.length} รายการ
            </span>
          </div>

          <NotificationInboxList
            notifications={filteredNotificationsList}
            activeNotificationId={selectedNotificationId}
            onSelectNotification={handleSelectNotification}
          />
        </div>

        {/* Right Side: Detail & Action Panel (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {activeNotification ? (
            <div className="flex-1 flex flex-col">
              
              {/* Header Bar */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeNotification.notificationPriority === "High"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    Priority: {activeNotification.notificationPriority}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {activeNotification.notificationId}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleMarkCurrentAsRead}
                    title="Mark as Read"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      <path d="m16 19 2 2 4-4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismissNotification(activeNotification.notificationId)}
                    title="Dismiss Notification"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Detail Content Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Title & Timestamp */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      {activeNotification.notificationTitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      เวลา {activeNotification.notificationTimeText} ที่ <span className="font-semibold text-slate-700">{activeNotification.targetBranchName}</span>
                    </p>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Diagnostic Analysis & Summary
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeNotification.notificationDescription}
                  </p>
                </div>

                {/* Recommended Next Steps */}
                <div>
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Recommended Triage Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => alert(`ตรวจสอบรายงานเรียลไทม์ของ ${activeNotification.targetBranchCode}`)}
                      className="btn-primary"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="14" x="2" y="3" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                      </svg>
                      ตรวจสอบสถานะสาขา
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkCurrentAsRead}
                      className="btn-secondary"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      ทำเครื่องหมายว่าตรวจสอบแล้ว
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">
              เลือกรายการแจ้งเตือนด้านซ้ายเพื่อดูรายละเอียด
            </div>
          )}
        </div>

      </div>

    </div>
  );
}