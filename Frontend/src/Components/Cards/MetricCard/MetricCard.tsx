"use client";

import React from "react";

export type MetricTrend = "up" | "down" | "neutral";
export type MetricIconType = "votes" | "satisfaction" | "kiosks" | "speed" | "custom";

export interface MetricCardItem {
  id?: string;
  label: string;
  value: string | number;
  change?: string;
  trend?: MetricTrend;
  valueHighlight?: boolean;
  tag?: string;
  iconType?: MetricIconType;
  customIcon?: React.ReactNode;
  onClick?: () => void;
}

export interface MetricCardProps {
  item: MetricCardItem;
  className?: string;
}

function MetricIcon({ iconType, customIcon }: { iconType?: MetricIconType; customIcon?: React.ReactNode }) {
  if (customIcon) return <>{customIcon}</>;

  switch (iconType) {
    case "votes":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      );
    case "satisfaction":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
        </svg>
      );
    case "kiosks":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "speed":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
  }
}

export default function MetricCard({ item, className = "" }: MetricCardProps) {
  const {
    label,
    value,
    change,
    trend = "neutral",
    valueHighlight = false,
    tag,
    iconType,
    customIcon,
    onClick,
  } = item;

  return (
    <article
      onClick={onClick}
      className={`group relative flex-1 min-w-[200px] flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_6px_16px_-4px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_24px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300 select-none ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* ─── Top Row: Label, Icon Squircle & Tag ─── */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xs sm:text-sm font-medium text-slate-500 truncate group-hover:text-slate-800 transition-colors">
          {label}
        </h3>

        <div className="flex items-center gap-1.5 shrink-0">
          {tag && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              {tag}
            </span>
          )}
          {(iconType || customIcon) && (
            <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-100/90 text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50/70 group-hover:border-emerald-200/60 flex items-center justify-center transition-colors">
              <MetricIcon iconType={iconType} customIcon={customIcon} />
            </div>
          )}
        </div>
      </div>

      {/* ─── Center: Prominent Primary Value ─── */}
      <div className="my-1">
        <span
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            valueHighlight ? "text-emerald-700" : "text-slate-900"
          }`}
        >
          {value}
        </span>
      </div>
    </article>
  );
}
