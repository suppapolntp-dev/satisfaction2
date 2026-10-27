"use client";

import React from "react";

export type StatusBadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  dotColor?: string;
  className?: string;
}

const VARIANT_STYLES: Record<StatusBadgeVariant, { dot: string; pill: string }> = {
  success: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50/80 border-emerald-200/90 text-emerald-800",
  },
  warning: {
    dot: "bg-amber-500",
    pill: "bg-amber-50/60 border-amber-200/80 text-amber-800",
  },
  danger: {
    dot: "bg-rose-500",
    pill: "bg-rose-50/60 border-rose-200/80 text-rose-800",
  },
  info: {
    dot: "bg-blue-500",
    pill: "bg-blue-50/60 border-blue-200/80 text-blue-800",
  },
  neutral: {
    dot: "bg-slate-400",
    pill: "bg-slate-50 border-slate-200 text-slate-600",
  },
};

export default function StatusBadge({
  label,
  variant = "success",
  dotColor,
  className = "",
}: StatusBadgeProps) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border shadow-2xs shrink-0 ${styles.pill} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor || styles.dot}`} />
      <span>{label}</span>
    </div>
  );
}
