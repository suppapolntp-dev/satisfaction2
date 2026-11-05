"use client";

import React from "react";
import { useEventCard, UseEventCardProps } from "./useEventCard";

export interface EventCardProps extends UseEventCardProps {
  className?: string;
}

const ICON_PROPS = {
  "aria-hidden": true,
  className: "w-4 h-4 shrink-0",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export default function EventCard({ event, onClick, onMenuClick, className = "" }: EventCardProps) {
  const {
    progressFillClass,
    progressPercent,
    commentCount,
    attachmentCount,
    visibleAssignees,
    hiddenAssigneeCount,
    handleClick,
    handleMenuClick,
  } = useEventCard({ event, onClick, onMenuClick });

  // ponytail: title button's ::after stretches over the card (single focus target); the menu button sits above via z-10.
  // Add a compact single-day variant when the calendar needs it.
  return (
    <article
      className={`relative w-full flex flex-col gap-2 p-4 rounded-lg bg-white border border-slate-200/80 shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow duration-200 motion-reduce:transition-none hover:shadow-[0_8px_16px_rgba(15,23,42,0.10)] has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-[var(--primary-container)] ${className}`}
    >
      {/* ─── 1. PROGRESS PILL ─── */}
      <div
        role="progressbar"
        aria-label="ความคืบหน้ากิจกรรม"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercent}
        className="w-12 h-1 rounded-full bg-slate-200 overflow-hidden"
      >
        <div className={`h-full rounded-full ${progressFillClass}`} style={{ width: `${progressPercent}%` }} />
      </div>

      {/* ─── 2. TITLE (stretched click target) ─── */}
      <h3 className="min-w-0">
        <button
          type="button"
          onClick={handleClick}
          className="block w-full text-left text-sm font-semibold text-slate-900 leading-snug line-clamp-2 cursor-pointer after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {event.eventName || "-"}
        </button>
      </h3>

      {/* ─── 3. FOOTER: metrics (left) · assignees + menu (right) ─── */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-4 text-xs text-slate-600 tabular-nums">
          <span className="inline-flex items-center gap-1" aria-label={`ความคิดเห็น ${commentCount}`}>
            <svg {...ICON_PROPS}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {commentCount}
          </span>
          <span className="inline-flex items-center gap-1" aria-label={`ไฟล์แนบ ${attachmentCount}`}>
            <svg {...ICON_PROPS}>
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            {attachmentCount}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {visibleAssignees.length > 0 && (
            <ul className="flex items-center -space-x-1.5" aria-label="ผู้รับผิดชอบ">
              {visibleAssignees.map((assignee) => (
                <li
                  key={assignee.name}
                  title={assignee.name}
                  className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center overflow-hidden"
                >
                  {assignee.avatarUrl ? (
                    <img src={assignee.avatarUrl} alt={assignee.name} className="w-full h-full object-cover" />
                  ) : (
                    <span aria-label={assignee.name}>{assignee.name.trim().charAt(0).toUpperCase()}</span>
                  )}
                </li>
              ))}
              {hiddenAssigneeCount > 0 && (
                <li className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center">
                  +{hiddenAssigneeCount}
                </li>
              )}
            </ul>
          )}

          <button
            type="button"
            onClick={handleMenuClick}
            aria-label={`ตัวเลือกเพิ่มเติม ${event.eventName ?? ""}`}
            className="relative z-10 inline-flex items-center justify-center w-11 h-11 -my-2 -mr-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
          >
            <svg {...ICON_PROPS} fill="currentColor" stroke="none">
              <circle cx="5" cy="12" r="1.75" />
              <circle cx="12" cy="12" r="1.75" />
              <circle cx="19" cy="12" r="1.75" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
