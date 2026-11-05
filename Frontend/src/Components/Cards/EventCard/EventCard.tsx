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
  columnSpan,
  onClick,
  onMenuClick,
  onEdit,
  onDelete,
  variant = "detailed",
  className = "",
}: EventCardProps) {
  const {
    compactStyleClass,
    visibleAssignees,
    hiddenAssigneeCount,
    daySpan,
    displayTitle,
    brandLogoUrl,
    isMenuOpen,
    menuRef,
    handleClick,
    toggleMenu,
    handleEdit,
    handleDelete,
  } = useEventCard({ event, columnSpan, onClick, onMenuClick, onEdit, onDelete });

  // ponytail: title button's ::after stretches over the card (single focus target); the menu button sits above via z-10.
  // 1-day cards show title + 3-dot menu; multi-day cards show title + brand/assignees + 3-dot menu.
  return (
    <article
      className={`relative w-full flex flex-col justify-between gap-2 p-3 sm:p-4 rounded-lg bg-white border border-slate-200/80 shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow duration-200 motion-reduce:transition-none hover:shadow-[0_8px_16px_rgba(15,23,42,0.10)] has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-[var(--primary-container)] ${className}`}
    >
      {/* ─── 1. TITLE (stretched click target) ─── */}
      <h3 className="min-w-0">
        <button
          type="button"
          onClick={handleClick}
          title={event.eventName}
          className="block w-full text-left text-xs sm:text-sm font-semibold text-slate-900 leading-snug truncate whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {displayTitle}
        </button>
      </h3>

      {/* ─── 2. FOOTER: assignees & brand logo (if wide) · menu (right) ─── */}
      <div className={`flex items-center gap-2 mt-1 ${daySpan > 1 ? "justify-between" : "justify-end"}`}>
        {/* If card is small (1-day), hide avatars and show only 3-dot menu */}
        {daySpan > 1 && (
          <div className="flex items-center gap-1.5">
            {event.brandScope && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                <img
                  src={brandLogoUrl}
                  alt={event.brandScope}
                  className="w-3.5 h-3.5 rounded-full object-contain shrink-0"
                />
                <span className="truncate max-w-[65px]">{event.brandScope}</span>
              </span>
            )}
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
                <li className="w-5 h-5 sm:w-6 sm:h-6 rounded-full ring-2 ring-white bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] font-semibold flex items-center justify-center">
                  +{hiddenAssigneeCount}
                </li>
              )}
            </ul>
            )}
          </div>
        )}

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
