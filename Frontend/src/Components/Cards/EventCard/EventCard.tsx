"use client";

import React from "react";
import { EventItem } from "@/Types/event";
import { useEventCard, UseEventCardProps } from "./useEventCard";

export interface EventCardProps extends UseEventCardProps {
  className?: string;
}

export default function EventCard({
  event,
  brandLogoUrl,
  onClick,
  className = "",
}: EventCardProps) {
  const {
    statusConfig,
    brandInitial,
    timeRangeLabel,
    handleClick,
  } = useEventCard({ event, brandLogoUrl, onClick });

  return (
    <article
      onClick={handleClick}
      className={`relative w-full max-w-[340px] rounded-[32px] overflow-hidden border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] bg-white flex flex-col group cursor-pointer transition-all duration-300 hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-1 select-none ${className}`}
    >
      {/* ─── 1. TOP MEDIA SECTION: Brand Logo / Photo Frame ─── */}
      <div className="relative w-full h-[180px] bg-[#fff6ee] flex items-center justify-center p-6 overflow-hidden border-b border-slate-100">
        {brandLogoUrl ? (
          <img
            src={brandLogoUrl}
            alt={event.brandScope || "Brand Logo"}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-amber-100/70 flex items-center justify-center">
            <span className="text-3xl font-black text-amber-900">{brandInitial}</span>
          </div>
        )}

        {/* Brand Scope Tag on Top Left */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-2xs border border-slate-200/60 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
          {event.brandScope || "Brand"}
        </div>
      </div>

      {/* ─── 2. CONTENT BODY (Flight Destination Card Style) ─── */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Title ("หัวข้อ") */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors">
            {event.eventName}
          </h3>

          {/* Subtitle / Description ("รายละเอียด") */}
          <p className="text-xs text-slate-500 line-clamp-1 mt-1 leading-relaxed">
            {event.description ||
              (event.eventLocation
                ? `สถานที่: ${event.eventLocation}`
                : "ไม่มีรายละเอียดเพิ่มเติม")}
          </p>

          {/* Location Line */}
          {event.eventLocation && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100 truncate">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{event.eventLocation}</span>
            </div>
          )}
        </div>

        {/* ─── 3. BOTTOM ACTION BUTTON (Full Width) ─── */}
        <div className="mt-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-full h-11 rounded-full bg-[#111111] hover:bg-black text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            {statusConfig.variant === "completed" ? (
              <>
                <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{statusConfig.buttonLabel}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{statusConfig.buttonLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
