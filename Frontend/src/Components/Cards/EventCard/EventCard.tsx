"use client";

import React from "react";
import { useEventCard, UseEventCardProps } from "./useEventCard";

export type EventCardVariant = "detailed" | "compact";

export interface EventCardProps extends UseEventCardProps {
  variant?: EventCardVariant;
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

export default function EventCard({
  event,
  onClick,
  onMenuClick,
  onEdit,
  onDelete,
  variant = "detailed",
  className = "",
}: EventCardProps) {
  const {
    progressFillClass,
    compactStyleClass,
    progressPercent,
    visibleAssignees,
    hiddenAssigneeCount,
    isMenuOpen,
    menuRef,
    handleClick,
    toggleMenu,
    handleEdit,
    handleDelete,
  } = useEventCard({ event, onClick, onMenuClick, onEdit, onDelete });

  if (variant === "compact") {
    const leadAssignee = visibleAssignees[0];
    return (
      <button
        type="button"
        onClick={handleClick}
        title={event.eventName}
        className={`w-full min-h-9 px-2.5 py-1.5 rounded-md flex items-center gap-2 text-left text-xs font-semibold cursor-pointer transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] ${compactStyleClass} ${className}`}
      >
        {leadAssignee && (
          <span className="w-5 h-5 rounded-full bg-white/80 text-[10px] font-bold flex items-center justify-center overflow-hidden shrink-0">
            {leadAssignee.avatarUrl ? (
              <img src={leadAssignee.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              leadAssignee.name.trim().charAt(0).toUpperCase()
            )}
          </span>
        )}
        <span className="truncate">{event.eventName || "-"}</span>
      </button>
    );
  }

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

      {/* ─── 3. FOOTER: assignees (left) · menu (right) ─── */}
      <div className="flex items-center justify-between gap-2 mt-1">
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
        </div>

        <div ref={menuRef} className="relative z-20">
          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            aria-label={`ตัวเลือกเพิ่มเติม ${event.eventName ?? ""}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
          >
            <svg {...ICON_PROPS} fill="currentColor" stroke="none">
              <circle cx="5" cy="12" r="1.75" />
              <circle cx="12" cy="12" r="1.75" />
              <circle cx="19" cy="12" r="1.75" />
            </svg>
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              aria-label="การจัดการกิจกรรม"
              className="absolute right-0 bottom-full mb-1 z-50 w-36 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-lg animate-in fade-in zoom-in-95 select-none"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleEdit}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                <span>แก้ไขกิจกรรม</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100"
              >
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                <span>ลบกิจกรรม</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
