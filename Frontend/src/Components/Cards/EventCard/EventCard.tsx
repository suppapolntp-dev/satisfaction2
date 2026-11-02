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
      className={`relative w-full max-w-[340px] h-[450px] rounded-[32px] overflow-hidden border border-slate-700/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)] flex flex-col justify-between p-6 bg-gradient-to-b from-slate-800 via-slate-900 to-[#0c100a] group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] select-none ${className}`}
    >
      {/* ─── Ambient Glow Gradients ─── */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* ─── 1. TOP HERO AREA: Brand Logo & Scope ─── */}
      <div className="relative z-10 flex flex-col items-center pt-2">
        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-2.5 shadow-inner flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          {brandLogoUrl ? (
            <img
              src={brandLogoUrl}
              alt={event.brandScope || "Brand"}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-white/5 flex items-center justify-center">
              <span className="text-2xl font-black text-white/90">
                {brandInitial}
              </span>
            </div>
          )}
        </div>

        <span className="text-[11px] font-semibold text-white/70 uppercase tracking-widest mt-2.5 truncate max-w-[200px]">
          {event.brandScope || "Enterprise Brand"}
        </span>
      </div>

      {/* ─── 2. BOTTOM CONTENT AREA (Cabin Booking Card UI Style) ─── */}
      <div className="relative z-10 flex flex-col">
        {/* Title ("หัวข้อ") */}
        <h3 className="text-xl sm:text-[22px] font-bold text-white tracking-tight leading-snug line-clamp-2 mb-2 group-hover:text-amber-200 transition-colors">
          {event.eventName}
        </h3>

        {/* Details ("รายละเอียด") */}
        <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-4">
          {event.description ||
            (event.eventLocation
              ? `สถานที่จัดกิจกรรม: ${event.eventLocation}`
              : "ไม่มีรายละเอียดเพิ่มเติม")}
        </p>

        {/* Badge Row (Status Pill + Time/Category Pill) */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Status Badge: เขียว (ทำเสร็จแล้ว) vs เหลือง (รอทำ / รอถึงวัน) */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all ${statusConfig.pillClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
            <span>{statusConfig.badgeLabel}</span>
          </span>

          {/* Time Span Badge */}
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/15 text-white/90 border border-white/20 backdrop-blur-md">
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

        {/* Action Button: ทรง Pill เต็มความกว้าง ปรับสีตามสถานะ */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`w-full h-11 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${statusConfig.buttonClass}`}
        >
          {statusConfig.variant === "completed" ? (
            <>
              <svg
                className="w-4 h-4 shrink-0"
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
                className="w-4 h-4 shrink-0"
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
