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
      className={`relative w-full max-w-[340px] h-[450px] rounded-[32px] overflow-hidden border border-slate-700/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] flex flex-col justify-end group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.55)] select-none bg-[#fff5ea] ${className}`}
    >
      {/* ─── 1. FULL CARD BACKGROUND: Brand Logo Image ─── */}
      <div className="absolute inset-0 flex items-center justify-center p-8 bg-[#fff5ea] overflow-hidden">
        {brandLogoUrl ? (
          <img
            src={brandLogoUrl}
            alt={event.brandScope || "Brand Logo"}
            className="w-full h-full object-contain -translate-y-10 opacity-95 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-24 h-24 rounded-3xl bg-slate-200 flex items-center justify-center">
            <span className="text-4xl font-black text-slate-700">{brandInitial}</span>
          </div>
        )}
      </div>

      {/* ─── 2. BOTTOM SCRIM: Blurred Gradient Overlay (Cabin Booking Style) ─── */}
      <div className="relative z-10 p-6 backdrop-blur-md bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-12 flex flex-col justify-end">
        {/* Title ("หัวข้อ") */}
        <h3 className="text-xl sm:text-[22px] font-bold text-white tracking-tight leading-snug line-clamp-2 mb-2 group-hover:text-amber-200 transition-colors drop-shadow-sm">
          {event.eventName}
        </h3>

        {/* Details ("รายละเอียด") */}
        <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-4">
          {event.description ||
            (event.eventLocation
              ? `สถานที่จัดกิจกรรม: ${event.eventLocation}`
              : "ไม่มีรายละเอียดเพิ่มเติม")}
        </p>

        {/* Badge Row (Status Pill + Time/Category Pill) */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Status Badge: เขียว (ทำเสร็จแล้ว) vs เหลือง (รอทำ / รอถึงวัน) */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xs transition-all ${statusConfig.pillClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
            <span>{statusConfig.badgeLabel}</span>
          </span>

          {/* Time Span Badge */}
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/15 text-white/90 border border-white/20 backdrop-blur-md shadow-xs">
            <svg
              className="w-3.5 h-3.5 text-white/70 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{timeRangeLabel}</span>
          </span>
        </div>

        {/* Action Button: ปุ่มสีขาวตามตัวแปรดีไซน์ Dribbble */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="w-full h-11 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-black/40"
        >
          {statusConfig.variant === "completed" ? (
            <>
              <svg
                className="w-4 h-4 text-emerald-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{statusConfig.buttonLabel}</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 text-amber-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
    </article>
  );
}
