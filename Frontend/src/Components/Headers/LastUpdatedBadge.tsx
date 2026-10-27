"use client";

import React from "react";

export interface LastUpdatedBadgeProps {
  text: string;
  className?: string;
}

export default function LastUpdatedBadge({
  text,
  className = "",
}: LastUpdatedBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 text-xs font-medium text-slate-500 bg-white shadow-2xs shrink-0 ${className}`}
    >
      <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{text}</span>
    </div>
  );
}
