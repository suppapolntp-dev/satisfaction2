"use client";

import React from "react";

export interface ProgressBarBadgeProps {
  value: number;
  label?: string;
  barColor?: string;
  trackColor?: string;
  className?: string;
}

export default function ProgressBarBadge({
  value,
  label,
  barColor = "bg-[#006e2f]",
  trackColor = "bg-slate-200/90",
  className = "",
}: ProgressBarBadgeProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-slate-50/80 border border-slate-200/80 text-xs font-medium text-slate-600 shrink-0 ${className}`}
    >
      <div className={`w-16 sm:w-20 h-1.5 ${trackColor} rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-slate-500">
        {label || `${clampedValue}%`}
      </span>
    </div>
  );
}
