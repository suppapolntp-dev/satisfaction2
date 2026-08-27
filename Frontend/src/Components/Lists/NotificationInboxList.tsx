"use client";

import React from "react";
import { SystemNotificationItem } from "@/Types/notification";

export type { SystemNotificationItem };

interface NotificationInboxListProps {
  notifications: SystemNotificationItem[];
  activeNotificationId: string | null;
  onSelectNotification: (selectedId: string) => void;
}

// ==========================================================================
// ─── 2. MAIN NOTIFICATION INBOX LIST COMPONENT
// ==========================================================================
export default function NotificationInboxList({
  notifications,
  activeNotificationId,
  onSelectNotification,
}: NotificationInboxListProps) {
  
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 select-none">
        <span className="material-symbols-outlined text-2xl block mb-1 text-slate-300">
          notifications_off
        </span>
        ยังไม่มีรายการแจ้งเตือนในระบบ
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 custom-scrollbar divide-y divide-slate-100">
      {notifications.map((notificationItem) => {
        const isCurrentItemActive = notificationItem.notificationId === activeNotificationId;
        const isAlert = notificationItem.notificationType === "Alert";
        const isFeedback = notificationItem.notificationType === "Feedback";

        return (
          <button
            key={notificationItem.notificationId}
            type="button"
            onClick={() => onSelectNotification(notificationItem.notificationId)}
            className={`w-full text-left relative flex items-start gap-3 p-3.5 transition-all outline-none cursor-pointer ${
              isCurrentItemActive 
                ? "bg-blue-50/80 border-l-4 border-blue-900" 
                : "bg-white hover:bg-slate-50 border-l-4 border-transparent"
            }`}
          >
            {/* Notification Icon Badge */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isAlert 
                ? "bg-rose-50 text-rose-600 border border-rose-200" 
                : isFeedback
                ? "bg-blue-50 text-blue-800 border border-blue-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {isAlert ? "warning" : isFeedback ? "chat" : "info"}
              </span>
            </div>

            {/* Notification Summary */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className={`text-sub font-bold uppercase tracking-wider ${
                  isAlert ? "text-rose-600" : isFeedback ? "text-blue-900" : "text-slate-500"
                }`}>
                  {notificationItem.notificationType}
                </span>
                <span className="text-sub font-mono">
                  {notificationItem.notificationTimeText}
                </span>
              </div>
              <h4 className="text-body font-bold text-slate-900 truncate">
                {notificationItem.notificationTitle}
              </h4>
              <p className="text-sub truncate mt-0.5">
                {notificationItem.targetBranchName}
              </p>
            </div>

            {/* Unread Dot Indicator */}
            {!notificationItem.isNotificationRead && (
              <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5 ring-2 ring-white"></div>
            )}
          </button>
        );
      })}
    </div>
  );
}