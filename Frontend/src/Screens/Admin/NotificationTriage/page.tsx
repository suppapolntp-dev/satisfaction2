"use client";

import React, { useState, useMemo, useEffect } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import SearchInput from "@/Components/Inputs/SearchInput";
import NotificationInboxList from "@/Components/Lists/NotificationInboxList";
import { SystemNotificationItem } from "@/Types/notification";
import { notificationService } from "@/Services/notificationService";
import { useApiMode } from "@/Context/ApiModeContext";

export default function NotificationTriageScreen() {
  const { isApiEnabled } = useApiMode();
  const [notificationsList, setNotificationsList] = useState<SystemNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchNotificationQuery, setSearchNotificationQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All Types");
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  // Load from notificationService on mount
  useEffect(() => {
    async function fetchNotificationsData() {
      try {
        setIsLoading(true);
        const data = await notificationService.getNotifications();
        setNotificationsList(data || []);
        if (data && data.length > 0) {
          setSelectedNotificationId(data[0].notificationId);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotificationsData();
  }, [isApiEnabled]);

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

  // กรองรายการแจ้งเตือน
  const filteredNotificationsList = useMemo(() => {
    return notificationsList.filter((notificationItem) => {
      const matchesSearch = 
        notificationItem.notificationTitle.toLowerCase().includes(searchNotificationQuery.toLowerCase()) ||
        notificationItem.targetBranchName.toLowerCase().includes(searchNotificationQuery.toLowerCase());

      const matchesType =
        selectedTypeFilter === "All Types" ||
        notificationItem.notificationType === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [notificationsList, searchNotificationQuery, selectedTypeFilter]);

  // ค้นหาการแจ้งเตือนที่กำลังเปิดดูอยู่
  const activeNotification = useMemo(() => {
    return notificationsList.find(
      (notificationItem) => notificationItem.notificationId === selectedNotificationId
    ) || null;
  }, [notificationsList, selectedNotificationId]);

  const unreadCount = useMemo(() => {
    return notificationsList.filter((item) => !item.isNotificationRead).length;
  }, [notificationsList]);

  // สั่งให้อ่านทั้งหมด
  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotificationsList((prevList) =>
      prevList.map((item) => ({ ...item, isNotificationRead: true }))
    );
  };

  const handleMarkCurrentAsRead = async () => {
    if (!selectedNotificationId) return;
    await notificationService.markAsRead(selectedNotificationId);
    setNotificationsList((prevList) =>
      prevList.map((item) =>
        item.notificationId === selectedNotificationId ? { ...item, isNotificationRead: true } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Notification & Alert Triage
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
          className="btn-secondary self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">done_all</span>
          Mark All as Read
        </button>
      </div>

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
            onSelectNotification={setSelectedNotificationId}
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
                    <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsList((prev) => prev.filter((item) => item.notificationId !== activeNotification.notificationId));
                      setSelectedNotificationId(null);
                    }}
                    title="Dismiss Notification"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Detail Content Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Title & Timestamp */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[22px]">warning</span>
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
                      <span className="material-symbols-outlined text-[16px]">monitoring</span>
                      ตรวจสอบสถานะสาขา
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkCurrentAsRead}
                      className="btn-secondary"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
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