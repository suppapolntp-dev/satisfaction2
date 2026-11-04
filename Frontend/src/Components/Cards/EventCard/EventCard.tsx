"use client";

import React from "react";
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
    brandLogoUrl: effectiveBrandLogoUrl,
    handleClick,
  } = useEventCard({ event, brandLogoUrl, onClick });

  // ponytail: the action button's ::after stretches over the card, so the whole card is one
  // keyboard-focusable target (no nested interactive elements). Add a skeleton when a card grid needs one.
  return (
    <article
      className={`relative w-full max-w-[340px] rounded-[32px] overflow-hidden border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] bg-white flex flex-col group transition-shadow duration-300 motion-reduce:transition-none hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--primary-container)] select-none ${className}`}
    >
      {/* ─── 1. TOP MEDIA SECTION: Brand Logo / Photo Frame ─── */}
      <div className="relative w-full h-44 bg-orange-50 flex items-center justify-center p-6 overflow-hidden border-b border-slate-100">
        {effectiveBrandLogoUrl ? (
          <img
            src={effectiveBrandLogoUrl}
            alt=""
            className="w-full h-full object-contain transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div aria-hidden="true" className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
            <span className="text-3xl font-black text-amber-900">{brandInitial}</span>
          </div>
        )}

        {/* Brand Scope Tag on Top Left */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-2xs border border-slate-200/60 text-xs font-bold text-slate-700 uppercase tracking-wider">
          {event.brandScope || "-"}
        </div>
      </div>

      {/* ─── 2. CONTENT BODY ─── */}
      <div className="p-6 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-[var(--primary-container)] transition-colors motion-reduce:transition-none">
            {event.eventName}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-1 mt-1 leading-relaxed">
            {event.description ||
              (event.eventLocation
                ? `สถานที่: ${event.eventLocation}`
                : "ไม่มีรายละเอียดเพิ่มเติม")}
          </p>

          {event.eventLocation && (
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100 truncate">
              <svg aria-hidden="true" className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{event.eventLocation}</span>
            </div>
          )}
        </div>

        {/* ─── 3. ACTION BUTTON (stretched over the whole card) ─── */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleClick}
            className={`w-full min-h-11 rounded-full font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 motion-reduce:transition-none after:absolute after:inset-0 after:content-[''] ${statusConfig.buttonClass}`}
          >
            {statusConfig.variant === "completed" ? (
              <svg aria-hidden="true" className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            )}
            <span>{statusConfig.buttonLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
