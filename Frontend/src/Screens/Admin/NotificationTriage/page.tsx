"use client";

import React, { useState, useMemo } from "react";
import SearchInput from "@/Components/Inputs/SearchInput";
import NotificationInboxList, { SystemNotificationItem } from "@/Components/Lists/NotificationInboxList";

// ชุดข้อมูลจำลองเกี่ยวกับแจ้งเตือนตู้คีออสสนามบิน (Descriptive Mock Data)
const MOCK_AIRPORT_NOTIFICATIONS: SystemNotificationItem[] = [
  {
    notificationId: "ALRT-2026-1001",
    notificationTitle: "High Unsatisfied Rate at T1 Gate 3",
    notificationType: "Alert",
    notificationTimeText: "10 mins ago",
    notificationDescription: "Passport Control Kiosk at Terminal 1 Gate 3 has received 5 consecutive unsatisfied feedback entries within the last 15 minutes. Immediate floor inspection is highly recommended.",
    isNotificationRead: false,
    targetBranchName: "T1 Gate 3 (Passport Control)",
    targetBranchCode: "KIOSK-T1-G3",
    notificationPriority: "High"
  },
  {
    notificationId: "ALRT-2026-1002",
    notificationTitle: "Kiosk Offline Warning - Baggage Claim C",
    notificationType: "System",
    notificationTimeText: "45 mins ago",
    notificationDescription: "Baggage Claim Zone C Kiosk has lost network heartbeat connection for over 20 minutes. Please check the power supply and local router configuration.",
    isNotificationRead: false,
    targetBranchName: "Baggage Claim Zone C",
    targetBranchCode: "KIOSK-T2-BC",
    notificationPriority: "Medium"
  },
  {
    notificationId: "FEED-2026-1003",
    notificationTitle: "New Feedback Text Received - Arrival Exit A",
    notificationType: "Feedback",
    notificationTimeText: "2 hours ago",
    notificationDescription: "A passenger submitted a text feedback at Terminal 2 Arrival Hall Exit A stating: 'The screen touch responsiveness is slightly delayed but overall clean UI.'",
    isNotificationRead: true,
    targetBranchName: "T2 Arrival Hall Exit A",
    targetBranchCode: "KIOSK-T2-EXA",
    notificationPriority: "Low"
  }
];

export default function NotificationTriageScreen() {
  const [notificationList, setNotificationList] = useState<SystemNotificationItem[]>(MOCK_AIRPORT_NOTIFICATIONS);

  // States สำหรับระเบียบควบคุมฟิลเตอร์คัดกรองข้อมูลหน้าร้าน
  const [searchNotificationQuery, setSearchNotificationQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All Types");
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>("ALRT-2026-1001");

  // ตรรกะพื้นฐานสำหรับค้นหาและคัดกรองข้อมูล (Junior แกะอ่านเข้าใจง่าย)
  const filteredNotifications = useMemo(() => {
    return notificationList.filter((individualNotification) => {
      const matchesSearch = individualNotification.notificationTitle
        .toLowerCase()
        .includes(searchNotificationQuery.toLowerCase());

      const matchesType =
        selectedTypeFilter === "All Types" ||
        individualNotification.notificationType === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [notificationList, searchNotificationQuery, selectedTypeFilter]);

  // ค้นหาวัตถุแจ้งเตือนปัจจุบันที่ผู้ใช้จิ้มเลือกดูรายละเอียดฝั่งขวา
  const activeSelectedNotification = useMemo(() => {
    return notificationList.find(
      (individualNotification) => individualNotification.notificationId === selectedNotificationId
    ) || null;
  }, [notificationList, selectedNotificationId]);

  return (
    <main className="flex-1 overflow-hidden w-full flex flex-col bg-[var(--surface-variant)] text-[var(--on-surface)] antialiased">
      <div className="max-w-7xl w-full mx-auto px-6 pt-6 pb-4 flex flex-col gap-4 h-full">
        
        {/* 🗺️ SECTION 1: PAGE HEADER */}
        <div className="flex items-end justify-between border-b border-[var(--outline-variant)] pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-[var(--on-surface)]">Triage View</h2>
              <span className="bg-[var(--error)] text-[var(--on-error)] px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center justify-center h-6">
                {notificationList.filter(item => !item.isNotificationRead).length} Unread
              </span>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Quickly review and action incoming alerts from terminal kiosks.
            </p>
          </div>
        </div>

        {/* 🗂️ SECTION 2: ACTIONS & FILTER BAR */}
        <div className="flex items-center justify-between bg-[var(--surface)] p-2 rounded-lg border border-[var(--outline-variant)] shadow-sm shrink-0">
          <div className="flex items-center gap-3 w-full max-w-lg">
            
            {/* เรียกเสียบใช้งาน SearchInput คอมโพเนนต์กลางของทีม */}
            <SearchInput
              value={searchNotificationQuery}
              onChange={setSearchNotificationQuery}
              placeholder="Search notifications..."
            />

            {/* กล่องเลือกประเภทคัดกรอง ผูกตามคลาสสากลของโปรเจกต์ */}
            <div className="relative w-48">
              <select
                value={selectedTypeFilter}
                onChange={(event) => setSelectedTypeFilter(event.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-[var(--surface)] border border-[var(--outline-variant)] rounded text-sm text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--primary-container)] focus:outline-none appearance-none cursor-pointer font-medium"
              >
                <option value="All Types">All Types</option>
                <option value="Alert">Alerts</option>
                <option value="Feedback">Feedback</option>
                <option value="System">System</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => console.log("Mark all notifications as read")}
            className="px-4 py-1.5 text-xs font-semibold text-[var(--primary-container)] border border-[var(--outline-variant)] hover:bg-[var(--surface-variant)] transition-colors rounded"
          >
            Mark all as read
          </button>
        </div>

        {/* 🛠️ SECTION 3: UNIFIED SINGLE CARD BOARD (รวมแผงซ้ายขวาในกระดานเดียวเด็ดขาดด้วย Grid 12 ช่อง) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 bg-[var(--surface)] rounded-xl border border-[var(--outline-variant)] shadow-sm min-h-0 overflow-hidden mb-4 divide-y md:divide-y-0 md:divide-x divide-[var(--outline-variant)]">
          
          {/* บล็อกฝั่งซ้าย: Sidebar รายชื่อแจ้งเตือน ( col-span-4 แคบกระชับได้สัดส่วน ) */}
          <div className="col-span-1 md:col-span-4 lg:col-span-3 flex flex-col min-h-0 overflow-hidden">
            <div className="p-3 border-b border-[var(--outline-variant)] bg-[var(--surface-variant)] text-sm text-[var(--on-surface-variant)] font-bold shrink-0">
              Inbox List
            </div>
            
            {/* เรียกคอมโพเนนต์ลูกที่เราสกัดแยกไว้ส่งต่อ Props ปลอดภัย ไร้ Error */}
            <NotificationInboxList
              notifications={filteredNotifications}
              activeNotificationId={selectedNotificationId}
              onSelectNotification={setSelectedNotificationId}
            />
          </div>

          {/* บล็อกฝั่งขวา: แผงเนื้อหารายละเอียดเจาะลึก ( col-span-8 แผ่กว้างเต็มกระดานอย่างโปรโปรแกรมเมอร์ ) */}
          <div className="col-span-1 md:col-span-8 lg:col-span-9 flex flex-col min-h-0 overflow-hidden">
            {activeSelectedNotification ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* แผงปุ่มมินิมอลควบคุมหัวตาราง */}
                <div className="p-3 border-b border-[var(--outline-variant)] bg-[var(--surface-variant)] flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    className="p-1.5 rounded text-[var(--on-surface-variant)] hover:text-[var(--primary-container)] hover:bg-[var(--secondary-container)] transition-colors"
                    title="Mark as Read"
                  >
                    <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded text-[var(--on-surface-variant)] hover:text-[var(--error)] hover:bg-[var(--error-container)] transition-colors"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>

                {/* เนื้อความดีไซน์บอร์ดจำลองสถานการณ์ตู้ Kiosk */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-[var(--error-container)] text-[var(--error)] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">warning</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-1">
                          {activeSelectedNotification.notificationTitle}
                        </h3>
                        <p className="text-xs text-[var(--on-surface-variant)]">
                          Alert triggered {activeSelectedNotification.notificationTimeText}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[var(--surface-variant)] rounded-lg p-6 mb-8 border border-[var(--outline-variant)]">
                      <h4 className="text-base font-bold text-[var(--on-surface)] mb-3">Description</h4>
                      <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
                        {activeSelectedNotification.notificationDescription}
                      </p>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-base font-bold text-[var(--on-surface)] mb-4">Recommended Actions</h4>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-container)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm active:scale-95 touch-manipulation"
                        >
                          <span className="material-symbols-outlined text-[20px]">insert_chart</span>
                          View Kiosk Report
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-2 px-5 py-2.5 border border-[var(--outline)] text-[var(--on-surface)] bg-[var(--surface)] rounded-lg text-sm font-semibold hover:bg-[var(--surface-variant)] transition-colors active:scale-95 touch-manipulation"
                        >
                          <span className="material-symbols-outlined text-[20px]">person</span>
                          Contact Station Staff
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[var(--on-surface)] mb-4">Metadata System</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[var(--surface-variant)] p-4 rounded-lg border border-[var(--outline-variant)] text-sm text-[var(--on-surface-variant)]">
                        <div>
                          <span className="font-semibold text-[var(--on-surface)]">Source:</span> CSAT Core Engine
                        </div>
                        <div>
                          <span className="font-semibold text-[var(--on-surface)]">Priority:</span>{" "}
                          <span className="text-[var(--error)] font-bold">{activeSelectedNotification.notificationPriority}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[var(--on-surface)]">ID Log:</span> {activeSelectedNotification.notificationId}
                        </div>
                        <div>
                          <span className="font-semibold text-[var(--on-surface)]">Location:</span> {activeSelectedNotification.targetBranchName} ({activeSelectedNotification.targetBranchCode})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--on-surface-variant)] opacity-60 p-8">
                <span className="material-symbols-outlined text-4xl mb-2">wysiwyg</span>
                <p className="text-sm">Select a notification from the inbox list to view details.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}