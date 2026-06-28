"use client";

import React from "react";

// นิยามโครงสร้างข้อมูลไอเทม (พิมพ์เต็มคำ สื่อความหมายชัดเจน)
export interface SystemNotificationItem {
  notificationId: string;
  notificationTitle: string;
  notificationType: "Alert" | "Feedback" | "System";
  notificationTimeText: string;
  notificationDescription: string;
  isNotificationRead: boolean;
  targetBranchName: string;
  targetBranchCode: string;
  notificationPriority: "High" | "Medium" | "Low";
}

interface NotificationInboxListProps {
  notifications: SystemNotificationItem[];
  activeNotificationId: string | null;
  onSelectNotification: (notificationId: string) => void;
}

export default function NotificationInboxList({
  notifications,
  activeNotificationId,
  onSelectNotification,
}: NotificationInboxListProps) {
  
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[var(--on-surface-variant)]">
        No notifications found
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 no-scrollbar">
      {notifications.map((individualNotification) => {
        const isCurrentItemActive =
          individualNotification.notificationId === activeNotificationId;

        return (
          <button
            key={individualNotification.notificationId}
            type="button"
            onClick={() => onSelectNotification(individualNotification.notificationId)}
            className={`w-full text-left relative flex items-center gap-3 p-3 border-b border-[var(--outline-variant)] transition-all outline-none duration-75 ${
              isCurrentItemActive ? "bg-[var(--secondary-container)]" : "hover:bg-[var(--surface-variant)]"
            }`}
          >
            {isCurrentItemActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-container)]" />
            )}
            
            <div className="w-8 h-8 rounded-full bg-[var(--error-container)] text-[var(--error)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">
                {individualNotification.notificationType === "Alert" ? "warning" : "chat"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--on-surface)] truncate mb-0.5">
                {individualNotification.notificationTitle}
              </h4>
              <span className="text-xs text-[var(--on-surface-variant)]">
                {individualNotification.notificationTimeText}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}