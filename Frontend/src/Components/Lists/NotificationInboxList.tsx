"use client";

import React from "react";
import { SystemNotificationItem } from "@/Types/notification";

export type { SystemNotificationItem };

interface NotificationInboxListProps {
  notifications: SystemNotificationItem[];
  activeNotificationId: string | null;
  onSelectNotification: (selectedId: string) => void;
}

export default function NotificationInboxList({
  notifications,
  activeNotificationId,
  onSelectNotification,
}: NotificationInboxListProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-[#90a1b9] space-y-2 select-none flex flex-col items-center justify-center">
        <svg
          className="w-9 h-9 text-[#cbd5e1]"
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
        <p className="text-[12px]">ไม่พบรายการแจ้งเตือนตามเงื่อนไข</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#f1f5f9] overflow-y-auto max-h-[620px] custom-scroll flex-1">
      {notifications.map((item) => {
        const isSelected = item.notificationId === activeNotificationId;
        const activeClass = isSelected
          ? "bg-[#eff6ff]/80 border-l-4 border-[#1c398e]"
          : "bg-white border-l-4 border-transparent hover:bg-[#f8fafc]";

        const typeLower = (item.notificationType || "").toLowerCase();
        const isAlert = typeLower === "alert";
        const isFeedback = typeLower === "feedback";

        const typeColorClass = isAlert
          ? "text-[#ec003f]"
          : isFeedback
          ? "text-[#1c398e]"
          : "text-[#62748e]";

        return (
          <div
            key={item.notificationId}
            onClick={() => onSelectNotification(item.notificationId)}
            className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${activeClass}`}
          >
            {/* Category Icon */}
            <div className="pt-0.5">
              {isAlert ? (
                <div className="w-8 h-8 rounded-[16px] bg-[#fff1f2] border-[0.8px] border-[#ffccd3] flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-[#ec003f]"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.4867 12L9.15333 2.66667C9.03704 2.46147 8.8684 2.29079 8.66462 2.17205C8.46083 2.0533 8.22919 1.99074 7.99333 1.99074C7.75747 1.99074 7.52584 2.0533 7.32205 2.17205C7.11826 2.29079 6.94962 2.46147 6.83333 2.66667L1.5 12C1.38245 12.2036 1.32082 12.4346 1.32134 12.6697C1.32186 12.9047 1.38452 13.1355 1.50296 13.3385C1.62141 13.5416 1.79143 13.7097 1.9958 13.8259C2.20016 13.942 2.4316 14.0021 2.66667 14H13.3333C13.5673 13.9998 13.797 13.938 13.9995 13.8209C14.202 13.7037 14.3701 13.5354 14.487 13.3327C14.6039 13.1301 14.6654 12.9003 14.6653 12.6663C14.6652 12.4324 14.6036 12.2026 14.4867 12Z"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 6V8.66667"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 11.3333H8.00667"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : isFeedback ? (
                <div className="w-8 h-8 rounded-[16px] bg-[#eff6ff] border-[0.8px] border-[#bedbff] flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-[#1c398e]"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 10C14 10.3536 13.8595 10.6928 13.6095 10.9428C13.3594 11.1929 13.0203 11.3333 12.6667 11.3333H4.66667L2 14V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V10Z"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-[16px] bg-[#f1f5f9] border-[0.8px] border-[#e2e8f0] flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-[#45556c]"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10.6667V8"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5.33333H8.00667"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${typeColorClass}`}>
                  {item.notificationType}
                </span>
                <span className="font-mono text-[11px] text-[#90a1b9]">
                  {item.notificationTimeText}
                </span>
              </div>
              <h4 className="text-[12px] font-bold text-[#0f172b] leading-[18px] truncate">
                {item.notificationTitle}
              </h4>
              <p className="text-[11px] text-[#90a1b9] truncate mt-0.5">
                {item.targetBranchName}
              </p>
            </div>

            {/* Unread Dot */}
            <div className="pt-1.5 shrink-0">
              {!item.isNotificationRead ? (
                <span className="inline-block w-2 h-2 rounded-full bg-[#155dfc] ring-2 ring-white"></span>
              ) : (
                <span className="w-2 h-2 inline-block"></span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
