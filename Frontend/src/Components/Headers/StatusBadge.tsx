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
    dot: "bg-[var(--success)]",
    pill: "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success)]",
  },
  warning: {
    dot: "bg-[var(--warning)]",
    pill: "bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning)]",
  },
  danger: {
    dot: "bg-[var(--error)]",
    pill: "bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error)]",
  },
  info: {
    dot: "bg-[var(--primary-container)]",
    pill: "bg-[var(--accent-bg)] border-[var(--accent-light)] text-[var(--primary-container)]",
  },
  neutral: {
    dot: "bg-[var(--outline)]",
    pill: "bg-[var(--surface-variant)] border-[var(--outline-variant)] text-[var(--on-surface-variant)]",
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
