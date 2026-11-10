"use client";

import React, { useMemo } from "react";
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
    notificationsList,
    filteredNotificationsList,
    activeNotification,
    selectedNotificationId,
    unreadCount,
    searchNotificationQuery,
    selectedTypeFilter,
    setSearchNotificationQuery,
    setSelectedTypeFilter,
    handleMarkAllAsRead,
    handleMarkCurrentAsRead,
    handleDismissNotification,
    handleSelectNotification,
  } = useNotificationTriageScreen({ initialTab });

  // ข้อมูลสถิติ KPI การแจ้งเตือน คำนวณจากข้อมูลจริงแบบ Real-time
  const totalCount = notificationsList.length;
  const highPriorityCount = useMemo(
    () => notificationsList.filter((n) => n.notificationPriority === "High").length,
    [notificationsList]
  );
  const unresolvedCount = useMemo(
    () => notificationsList.filter((n) => !n.isNotificationRead).length,
    [notificationsList]
  );

  return (
    <div className="space-y-6">
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Notification &amp; Alert Triage
            </h1>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ศูนย์กลางการติดตามเหตุการณ์แจ้งเตือน ความผิดปกติของตู้ Kiosk และข้อเสนอแนะความพึงพอใจ
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          className="btn-secondary self-start sm:self-auto cursor-pointer"
        >
          <svg
            className="w-4 h-4 shrink-0 text-slate-600"
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
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* ─── 2. STATS OVERVIEW SECTION (4-Card Grid ตรงตามต้นฉบับ) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Card 1: Total Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors w-full">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Alerts
            </span>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600">
              <svg
                className="w-5 h-5"
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
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            {totalCount > 0 ? totalCount : "-"}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">+4.2%</span>
            <span>จากสัปดาห์ก่อน</span>
          </div>
        </div>

        {/* Card 2: High Priority */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors w-full">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              High Priority
            </span>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-rose-600">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            {totalCount > 0 ? `${highPriorityCount} Spikes` : "-"}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="font-semibold text-rose-600">วิกฤต CSAT &lt; 80%</span>
          </div>
        </div>

        {/* Card 3: Unresolved Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors w-full">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Unresolved Queue
            </span>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-amber-600">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            {totalCount > 0 ? `${unresolvedCount} Pending` : "-"}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="font-semibold text-amber-600">รอเจ้าหน้าที่ดำเนินการ</span>
          </div>
        </div>

        {/* Card 4: Resolved Today */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors w-full">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resolved Today
            </span>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-600">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            0 Cases
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">สถานะปกติ</span>
          </div>
        </div>
      </div>

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