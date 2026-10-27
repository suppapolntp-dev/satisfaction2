"use client";

import React from "react";

export interface HeaderBackButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export default function HeaderBackButton({
  onClick,
  className = "",
  ariaLabel = "ย้อนกลับ (Go back)",
}: HeaderBackButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`w-9 h-9 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors shrink-0 shadow-2xs cursor-pointer ${className}`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}
