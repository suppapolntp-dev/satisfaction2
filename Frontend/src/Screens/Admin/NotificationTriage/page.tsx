"use client";

import React from "react";
import NotificationInboxList from "@/Components/Lists/NotificationInboxList";
import { useNotificationTriageScreen, NotificationTabType } from "./useNotificationTriageScreen";

export interface NotificationTriageScreenProps {
  initialTab?: NotificationTabType;
}

export default function NotificationTriageScreen({
  initialTab = "all",
}: NotificationTriageScreenProps = {}) {
  const {
    viewMode,
    setViewMode,
    expandedRowId,
    handleToggleExpandRow,
    activeTab,
    notificationsList,
    filteredNotificationsList,
    activeNotification,
    unreadCount,
    highPriorityCount,
    searchNotificationQuery,
    selectedTypeFilter,
    setSearchNotificationQuery,
    setSelectedTypeFilter,
    handleTabChange,
    handleMarkAllAsRead,
    handleToggleReadCurrent,
    handleToggleReadById,
    handleMarkCurrentAsRead,
    handleDismissNotification,
    handleSelectNotification,
  } = useNotificationTriageScreen({ initialTab });

  const totalCount = notificationsList.length;

  // Dynamic actions based on notification type
  const typeLower = (activeNotification?.notificationType || "").toLowerCase();
  const primaryActionLabel =
    typeLower === "feedback"
      ? "ดูประวัติความพึงพอใจ"
      : typeLower === "system"
      ? "เปิดหน้ารายงานสรุป"
      : "ตรวจสอบสถานะสาขา";

  const secondaryActionLabel =
    typeLower === "feedback"
      ? "บันทึกคำชมเชย"
      : typeLower === "system"
      ? "รับทราบแล้ว"
      : "ทำเครื่องหมายว่าตรวจสอบแล้ว";

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* ─── 1. TOP HEADER CARD ─── */}
      <header className="bg-white border-[0.8px] border-[#e2e8f0]/90 rounded-[24px] shadow-[0px_1px_3px_0px_rgba(15,23,42,0.03)] overflow-hidden">
        {/* Top Section */}
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-[#0f172b] tracking-[-0.5px] leading-7 flex items-center gap-2">
              Notification &amp; Alert Triage
            </h1>
            <p className="text-[12px] text-[#62748e] mt-1 leading-[19.5px]">
              ศูนย์กลางการติดตามเหตุการณ์แจ้งเตือน ความผิดปกติของตู้ Kiosk ตลอดจนข้อเสนอแนะความพึงพอใจ เพื่อการวิเคราะห์และแก้ไขปัญหาได้อย่างทันท่วงที
            </p>
          </div>
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98] transition-all text-white text-[14px] font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4.66667 11.3333L1.33333 8"
                  stroke="currentColor"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.6667 6.66667L9.66667 11.6667L8.66667 10.6667"
                  stroke="currentColor"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#f8fafc]/50 border-t-[0.8px] border-[#f1f5f9] px-6">
          <div className="flex items-center gap-2 h-12 overflow-x-auto">
            {/* Tab 1: All Alerts */}
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`h-full flex items-center gap-2 px-4 text-[14px] font-semibold whitespace-nowrap transition-colors border-b-[2px] cursor-pointer ${
                activeTab === "all"
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-[#62748e] hover:text-[#0f172b]"
              }`}
            >
              <span>การแจ้งเตือนทั้งหมด (All Alerts)</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === "all"
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "bg-[#e2e8f0] text-[#45556c]"
                }`}
              >
                {totalCount}
              </span>
            </button>

            {/* Tab 2: Unread Queue */}
            <button
              type="button"
              onClick={() => handleTabChange("unread")}
              className={`h-full flex items-center gap-2 px-4 text-[14px] font-semibold whitespace-nowrap transition-colors border-b-[2px] cursor-pointer ${
                activeTab === "unread"
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-[#62748e] hover:text-[#0f172b]"
              }`}
            >
              <span>ยังไม่ได้อ่าน (Unread Queue)</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === "unread"
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "bg-[#e2e8f0] text-[#45556c]"
                }`}
              >
                {unreadCount}
              </span>
            </button>

            {/* Tab 3: High Priority */}
            <button
              type="button"
              onClick={() => handleTabChange("priority")}
              className={`h-full flex items-center gap-2 px-4 text-[14px] font-semibold whitespace-nowrap transition-colors border-b-[2px] cursor-pointer ${
                activeTab === "priority" || activeTab === "high_priority"
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-[#62748e] hover:text-[#0f172b]"
              }`}
            >
              <span>เร่งด่วนพิเศษ (High Priority)</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === "priority" || activeTab === "high_priority"
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "bg-[#e2e8f0] text-[#45556c]"
                }`}
              >
                {highPriorityCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── 2. UNIFIED TABLE & GRID CONTAINER (รวม Search Bar + Table/Grid เป็นผืนเดียวกัน) ─── */}
      <section className="bg-white border-[0.8px] border-[#e2e8f0] rounded-[24px] shadow-[0px_1px_3px_0px_rgba(15,23,42,0.03)] overflow-hidden flex flex-col">
        {/* Integrated Top Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#f1f5f9] bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-[320px]">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90a1b9] pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={searchNotificationQuery}
                onChange={(e) => setSearchNotificationQuery(e.target.value)}
                placeholder="ค้นหาการแจ้งเตือน หรือชื่อสาขา..."
                className="w-full bg-[#f8fafc] hover:bg-white focus:bg-white border-[0.8px] border-[#e2e8f0] text-[12px] text-[#1d293d] placeholder-[#90a1b9] rounded-[16px] pl-9.5 pr-8 py-2.5 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all font-sans"
              />
              {searchNotificationQuery && (
                <button
                  type="button"
                  onClick={() => setSearchNotificationQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90a1b9] hover:text-[#0f172b] p-0.5 rounded cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-[260px]">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="w-full bg-[#f8fafc] hover:bg-white focus:bg-white border-[0.8px] border-[#e2e8f0] text-[12px] text-[#1d293d] rounded-[16px] px-4 py-2.5 appearance-none outline-none focus:border-[#2563eb] cursor-pointer transition-all"
              >
                <option value="all">ทุกประเภท (All Types)</option>
                <option value="alert">Alerts (แจ้งเตือนความผิดปกติ)</option>
                <option value="feedback">Feedback (ข้อเสนอแนะลูกค้า)</option>
                <option value="system">System (ระบบและรายงาน)</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#1d293d]">
                <svg
                  className="w-2.5 h-2"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Controls: Count & View Switcher */}
          <div className="flex items-center justify-between lg:justify-end gap-3.5 shrink-0">
            <span className="text-[12px] font-medium text-[#90a1b9]">
              แสดง <strong className="text-[#0f172b] font-semibold">{filteredNotificationsList.length}</strong> รายการ
            </span>

            {/* View Mode Toggle Switcher */}
            <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="ตารางเต็มรูปแบบ (Table View)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-[#2563eb] shadow-xs"
                    : "text-[#62748e] hover:text-[#0f172b]"
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
                <span>Table</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("split")}
                title="แยกหน้าจอสองฝั่ง (Split Grid View)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                  viewMode === "split"
                    ? "bg-white text-[#2563eb] shadow-xs"
                    : "text-[#62748e] hover:text-[#0f172b]"
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <line x1="9" x2="9" y1="3" y2="21" />
                </svg>
                <span>Split Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── VIEW 1: DATA TABLE VIEW (ตารางเดียวจบ ครบทุกข้อมูล พร้อมแถวขยายดู Diagnostic) ─── */}
        {viewMode === "table" && (
          <div className="overflow-x-auto">
            {filteredNotificationsList.length === 0 ? (
              <div className="p-12 text-center text-[#90a1b9] space-y-2 select-none flex flex-col items-center justify-center">
                <svg
                  className="w-10 h-10 text-[#cbd5e1]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
                <p className="text-[12px]">ไม่พบรายการแจ้งเตือนตามเงื่อนไขการค้นหา</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]/70 text-[11px] font-bold uppercase tracking-wider text-[#45556c]">
                    <th className="py-3 px-4 w-12 text-center">สถานะ</th>
                    <th className="py-3 px-4 w-32">ประเภท</th>
                    <th className="py-3 px-4">หัวข้อและรายละเอียดเหตุการณ์</th>
                    <th className="py-3 px-4 w-56">สาขา</th>
                    <th className="py-3 px-4 w-32">เวลา</th>
                    <th className="py-3 px-4 w-28 text-center">ระดับ</th>
                    <th className="py-3 px-4 w-36 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] text-[12px]">
                  {filteredNotificationsList.map((item) => {
                    const isExpanded = expandedRowId === item.notificationId;
                    const itemType = (item.notificationType || "").toLowerCase();
                    const isAlert = itemType === "alert";
                    const isFeedback = itemType === "feedback";

                    const badgeColor =
                      item.notificationPriority === "High"
                        ? "bg-[#fff1f2] border border-[#ffccd3] text-[#c70036]"
                        : "bg-[#eff6ff] border border-[#bedbff] text-[#1c398e]";

                    return (
                      <React.Fragment key={item.notificationId}>
                        <tr
                          className={`hover:bg-[#f8fafc]/80 transition-colors cursor-pointer ${
                            !item.isNotificationRead ? "bg-[#eff6ff]/30 font-medium" : "bg-white"
                          }`}
                          onClick={() => handleToggleExpandRow(item.notificationId)}
                        >
                          {/* Unread indicator / status */}
                          <td className="py-3.5 px-4 text-center">
                            {!item.isNotificationRead ? (
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full bg-[#155dfc] ring-2 ring-white"
                                title="ยังไม่ได้อ่าน"
                              />
                            ) : (
                              <span
                                className="inline-block w-2 h-2 rounded-full bg-[#cbd5e1]"
                                title="อ่านแล้ว"
                              />
                            )}
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {isAlert ? (
                                <div className="w-7 h-7 rounded-[14px] bg-[#fff1f2] border-[0.8px] border-[#ffccd3] flex items-center justify-center shrink-0">
                                  <svg className="w-3.5 h-3.5 text-[#ec003f]" viewBox="0 0 16 16" fill="none">
                                    <path d="M14.4867 12L9.15333 2.66667C9.03704 2.46147 8.8684 2.29079 8.66462 2.17205C8.46083 2.0533 8.22919 1.99074 7.99333 1.99074C7.75747 1.99074 7.52584 2.0533 7.32205 2.17205C7.11826 2.29079 6.94962 2.46147 6.83333 2.66667L1.5 12C1.38245 12.2036 1.32082 12.4346 1.32134 12.6697C1.32186 12.9047 1.38452 13.1355 1.50296 13.3385C1.62141 13.5416 1.79143 13.7097 1.9958 13.8259C2.20016 13.942 2.4316 14.0021 2.66667 14H13.3333C13.5673 13.9998 13.797 13.938 13.9995 13.8209C14.202 13.7037 14.3701 13.5354 14.487 13.3327C14.6039 13.1301 14.6654 12.9003 14.6653 12.6663C14.6652 12.4324 14.6036 12.2026 14.4867 12Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 6V8.66667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 11.3333H8.00667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              ) : isFeedback ? (
                                <div className="w-7 h-7 rounded-[14px] bg-[#eff6ff] border-[0.8px] border-[#bedbff] flex items-center justify-center shrink-0">
                                  <svg className="w-3.5 h-3.5 text-[#1c398e]" viewBox="0 0 16 16" fill="none">
                                    <path d="M14 10C14 10.3536 13.8595 10.6928 13.6095 10.9428C13.3594 11.1929 13.0203 11.3333 12.6667 11.3333H4.66667L2 14V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V10Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-[14px] bg-[#f1f5f9] border-[0.8px] border-[#e2e8f0] flex items-center justify-center shrink-0">
                                  <svg className="w-3.5 h-3.5 text-[#45556c]" viewBox="0 0 16 16" fill="none">
                                    <path d="M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              )}
                              <span
                                className={`text-[11px] font-bold uppercase tracking-wider ${
                                  isAlert ? "text-[#ec003f]" : isFeedback ? "text-[#1c398e]" : "text-[#62748e]"
                                }`}
                              >
                                {item.notificationType}
                              </span>
                            </div>
                          </td>

                          {/* Title & snippet */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0f172b] leading-[18px]">
                              {item.notificationTitle}
                            </div>
                            <div className="text-[11px] text-[#62748e] line-clamp-1 mt-0.5">
                              {item.notificationDescription}
                            </div>
                          </td>

                          {/* Branch */}
                          <td className="py-3.5 px-4 text-[#314158] text-[11px] font-medium">
                            {item.targetBranchName}
                          </td>

                          {/* Time */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#90a1b9]">
                            {item.notificationTimeText}
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}
                            >
                              {item.notificationPriority}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {/* Toggle Read */}
                              <button
                                type="button"
                                onClick={() => handleToggleReadById(item.notificationId)}
                                title={item.isNotificationRead ? "ทำเป็นยังไม่ได้อ่าน" : "ทำเครื่องหมายว่าอ่านแล้ว"}
                                className="p-1.5 rounded-lg text-[#62748e] hover:bg-[#f1f5f9] hover:text-[#0f172b] transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                  <path d="M14.6667 7V4C14.6667 3.64638 14.5262 3.30724 14.2761 3.05719C14.0261 2.80714 13.687 2.66667 13.3333 2.66667H2.66667C2.31304 2.66667 1.97391 2.80714 1.72386 3.05719C1.47381 3.30724 1.33333 3.64638 1.33333 4V12C1.33333 12.7333 1.93333 13.3333 2.66667 13.3333H8.66667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14.6667 4.66667L8.68667 8.46667C8.48085 8.59562 8.24288 8.66401 8 8.66401C7.75712 8.66401 7.51915 8.59562 7.31333 8.46667L1.33333 4.66667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M10.6667 12.6667L12 14L14.6667 11.3333" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>

                              {/* Expand Details */}
                              <button
                                type="button"
                                onClick={() => handleToggleExpandRow(item.notificationId)}
                                title={isExpanded ? "ย่อรายละเอียด" : "ขยายดูการวินิจฉัย"}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isExpanded
                                    ? "bg-[#2563eb] text-white"
                                    : "text-[#62748e] hover:bg-[#f1f5f9] hover:text-[#0f172b]"
                                }`}
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>

                              {/* Dismiss / Delete */}
                              <button
                                type="button"
                                onClick={() => handleDismissNotification(item.notificationId)}
                                title="ลบรายการ"
                                className="p-1.5 rounded-lg text-[#62748e] hover:bg-[#fff1f2] hover:text-[#ec003f] transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                  <path d="M2 4H14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Expandable Diagnostic Accordion */}
                        {isExpanded && (
                          <tr className="bg-[#f8fafc]/50">
                            <td colSpan={7} className="p-5 border-y border-[#e2e8f0]/80">
                              <div className="bg-white rounded-[20px] border border-[#e2e8f0]/90 p-5 space-y-4 shadow-xs animate-in fade-in duration-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f5f9] pb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-[#45556c] tracking-[0.6px] uppercase">
                                      Diagnostic Analysis &amp; Action Plan
                                    </span>
                                    <span className="font-mono text-[11px] text-[#90a1b9]">
                                      ID: {item.notificationId}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[#62748e]">
                                    สาขา: <strong className="text-[#0f172b]">{item.targetBranchName}</strong> ({item.targetBranchCode})
                                  </div>
                                </div>

                                <p className="text-[12px] text-[#314158] leading-[20px]">
                                  {item.notificationDescription}
                                </p>

                                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      alert(
                                        `กำลังดำเนินการ: ${
                                          isFeedback
                                            ? "ดูประวัติความพึงพอใจ"
                                            : itemType === "system"
                                            ? "เปิดหน้ารายงานสรุป"
                                            : "ตรวจสอบสถานะสาขา"
                                        } สำหรับ ${item.notificationTitle}`
                                      )
                                    }
                                    className="bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98] transition-all text-white text-[12px] font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                      <path d="M2.66667 2H13.3333C14.0697 2 14.6667 2.59695 14.6667 3.33333V10C14.6667 10.7364 14.0697 11.3333 13.3333 11.3333H2.66667C1.93029 11.3333 1.33333 10.7364 1.33333 10V3.33333C1.33333 2.59695 1.93029 2 2.66667 2Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M5.33333 14H10.6667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M8 11.3333V14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>
                                      {isFeedback
                                        ? "ดูประวัติความพึงพอใจ"
                                        : itemType === "system"
                                        ? "เปิดหน้ารายงานสรุป"
                                        : "ตรวจสอบสถานะสาขา"}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleReadById(item.notificationId)}
                                    className="bg-white hover:bg-[#f8fafc] active:scale-[0.98] transition-all border border-[#e2e8f0] text-[#314158] text-[12px] font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5 text-[#314158]" viewBox="0 0 16 16" fill="none">
                                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>
                                      {!item.isNotificationRead
                                        ? "ทำเครื่องหมายว่าอ่านแล้ว"
                                        : "ทำเป็นยังไม่ได้อ่าน"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ─── VIEW 2: SPLIT GRID VIEW (สองคอลัมน์เดิม แต่อยู่ใน Container ผืนเดียวกันกับ Search Bar) ─── */}
        {viewMode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* Left Column: Inbox Queue (4 cols on lg) */}
            <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#e2e8f0] flex flex-col bg-white">
              {/* Queue Header */}
              <div className="bg-[#f8fafc]/50 border-b-[0.8px] border-[#f1f5f9] px-4 py-3 flex items-center justify-between shrink-0">
                <span className="text-[12px] font-bold text-[#45556c] tracking-[0.6px] uppercase">
                  Inbox Queue
                </span>
                <span className="text-[11px] font-medium text-[#90a1b9]">
                  {filteredNotificationsList.length} รายการ
                </span>
              </div>

              {/* Notification List */}
              <NotificationInboxList
                notifications={filteredNotificationsList}
                activeNotificationId={activeNotification?.notificationId ?? null}
                onSelectNotification={handleSelectNotification}
              />
            </aside>

            {/* Right Column: Detail View (8 cols on lg) */}
            <section className="lg:col-span-8 flex flex-col bg-white">
              {activeNotification ? (
                <div className="flex-1 flex flex-col">
                  {/* Top Meta Bar */}
                  <div className="bg-[#f8fafc]/40 border-b-[0.8px] border-[#f1f5f9] px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          activeNotification.notificationPriority === "High"
                            ? "bg-[#fff1f2] border border-[#ffccd3] text-[#c70036] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                            : "bg-[#eff6ff] border border-[#bedbff] text-[#1c398e] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                        }
                      >
                        Priority: {activeNotification.notificationPriority}
                      </span>
                      <span className="font-mono text-[12px] text-[#90a1b9]">
                        ID: {activeNotification.notificationId}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleToggleReadCurrent}
                        title="สลับสถานะอ่านแล้ว"
                        className="p-2 rounded-xl text-[#62748e] hover:bg-[#f1f5f9] hover:text-[#0f172b] transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14.6667 7V4C14.6667 3.64638 14.5262 3.30724 14.2761 3.05719C14.0261 2.80714 13.687 2.66667 13.3333 2.66667H2.66667C2.31304 2.66667 1.97391 2.80714 1.72386 3.05719C1.47381 3.30724 1.33333 3.64638 1.33333 4V12C1.33333 12.7333 1.93333 13.3333 2.66667 13.3333H8.66667"
                            stroke="currentColor"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14.6667 4.66667L8.68667 8.46667C8.48085 8.59562 8.24288 8.66401 8 8.66401C7.75712 8.66401 7.51915 8.59562 7.31333 8.46667L1.33333 4.66667"
                            stroke="currentColor"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10.6667 12.6667L12 14L14.6667 11.3333"
                            stroke="currentColor"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissNotification(activeNotification.notificationId)}
                        title="ลบรายการ"
                        className="p-2 rounded-xl text-[#62748e] hover:bg-[#fff1f2] hover:text-[#ec003f] transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 4H14"
                            stroke="currentColor"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4"
                            stroke="currentColor"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4"
                            stroke="currentColor"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Detail Body */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-6">
                      {/* Header Info */}
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-[20px] flex items-center justify-center shrink-0 shadow-[0px_1px_1px_rgba(0,0,0,0.05)] ${
                            typeLower === "alert"
                              ? "bg-[#fff1f2] border border-[#ffccd3]"
                              : typeLower === "feedback"
                              ? "bg-[#eff6ff] border border-[#bedbff]"
                              : "bg-[#f1f5f9] border border-[#e2e8f0]"
                          }`}
                        >
                          {typeLower === "alert" ? (
                            <svg
                              className="w-5 h-5 text-[#ec003f]"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18.1083 15L11.4417 3.33333C11.2963 3.07684 11.0855 2.86349 10.8308 2.71506C10.576 2.56663 10.2865 2.48842 9.99167 2.48842C9.69684 2.48842 9.4073 2.56663 9.15256 2.71506C8.89783 2.86349 8.68703 3.07684 8.54167 3.33333L1.875 15C1.72807 15.2545 1.65102 15.5433 1.65167 15.8371C1.65233 16.1309 1.73065 16.4194 1.87871 16.6732C2.02676 16.927 2.23929 17.1372 2.49475 17.2824C2.7502 17.4276 3.03951 17.5026 3.33333 17.5H16.6667C16.9591 17.4997 17.2463 17.4225 17.4994 17.2761C17.7525 17.1297 17.9627 16.9192 18.1088 16.6659C18.2548 16.4126 18.3317 16.1253 18.3316 15.8329C18.3315 15.5405 18.2545 15.2532 18.1083 15Z"
                                stroke="currentColor"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 7.5V10.8333"
                                stroke="currentColor"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 14.1667H10.0083"
                                stroke="currentColor"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : typeLower === "feedback" ? (
                            <svg
                              className="w-5 h-5 text-[#1c398e]"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M17.5 12.5C17.5 12.942 17.3244 13.366 17.0118 13.6785C16.6993 13.9911 16.2754 14.1667 15.8333 14.1667H5.83333L2.5 17.5V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H15.8333C16.2754 2.5 16.6993 2.67559 17.0118 2.98816C17.3244 3.30072 17.5 3.72464 17.5 4.16667V12.5Z"
                                stroke="currentColor"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-[#45556c]"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z"
                                stroke="currentColor"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 13.3333V10"
                                stroke="currentColor"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 6.66667H10.0083"
                                stroke="currentColor"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-[18px] font-bold text-[#0f172b] leading-[22.5px]">
                            {activeNotification.notificationTitle}
                          </h2>
                          <p className="text-[12px] text-[#62748e]">
                            เวลา <span>{activeNotification.notificationTimeText}</span> ที่{" "}
                            <span className="font-semibold text-[#314158]">
                              {activeNotification.targetBranchName}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Diagnostic Card */}
                      <div className="bg-[#f8fafc] border-[0.8px] border-[#e2e8f0]/80 rounded-[24px] p-5 space-y-2">
                        <h3 className="text-[12px] font-bold text-[#45556c] tracking-[0.6px] uppercase">
                          Diagnostic Analysis &amp; Summary
                        </h3>
                        <p className="text-[12px] text-[#314158] leading-[19.5px]">
                          {activeNotification.notificationDescription}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div className="space-y-3 pt-4 border-t border-[#f1f5f9]">
                      <h3 className="text-[12px] font-bold text-[#45556c] tracking-[0.6px] uppercase">
                        Recommended Triage Actions
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Primary Button */}
                        <button
                          type="button"
                          onClick={() =>
                            alert(`กำลังดำเนินการ: ${primaryActionLabel} สำหรับ ${activeNotification.notificationTitle}`)
                          }
                          className="bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98] transition-all text-white text-[12px] font-semibold px-4 py-2.5 rounded-[16px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center gap-2 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2.66667 2H13.3333C14.0697 2 14.6667 2.59695 14.6667 3.33333V10C14.6667 10.7364 14.0697 11.3333 13.3333 11.3333H2.66667C1.93029 11.3333 1.33333 10.7364 1.33333 10V3.33333C1.33333 2.59695 1.93029 2 2.66667 2Z"
                              stroke="currentColor"
                              strokeWidth="1.33333"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.33333 14H10.6667"
                              stroke="currentColor"
                              strokeWidth="1.33333"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 11.3333V14"
                              stroke="currentColor"
                              strokeWidth="1.33333"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>{primaryActionLabel}</span>
                        </button>

                        {/* Secondary Button */}
                        <button
                          type="button"
                          onClick={handleMarkCurrentAsRead}
                          className="bg-white hover:bg-[#f8fafc] active:scale-[0.98] transition-all border-[0.8px] border-[#e2e8f0] text-[#314158] text-[12px] font-semibold px-4 py-2.5 rounded-[16px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center gap-2 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 text-[#314158]"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3333 4L6 11.3333L2.66667 8"
                              stroke="currentColor"
                              strokeWidth="1.33333"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>{secondaryActionLabel}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#90a1b9] space-y-2 select-none">
                  <svg
                    className="w-10 h-10 text-[#cbd5e1]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                  </svg>
                  <p className="text-[12px]">เลือกรายการแจ้งเตือนจาก Inbox Queue เพื่อดูรายละเอียด</p>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
