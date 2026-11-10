"use client";

import React from "react";
import { useApiMode } from "@/Context/ApiModeContext";

export interface ApiModeToggleProps {
  className?: string;
}

export default function ApiModeToggle({ className = "" }: ApiModeToggleProps) {
  const { isApiEnabled, toggleApiMode } = useApiMode();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isApiEnabled}
      aria-label={isApiEnabled ? "โหมด API: เปิด (มีข้อมูล)" : "โหมด API: ปิด (หน้าเปล่า)"}
      title={
        isApiEnabled
          ? "โหมด API: เปิด (มีข้อมูล) — คลิกเพื่อดูพรีวิวหน้าเปล่า"
          : "โหมด API: ปิด (หน้าเปล่า) — คลิกเพื่อเชื่อมต่อข้อมูลจริง"
      }
      onClick={toggleApiMode}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 border-2 transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] active:scale-95 select-none ${
        isApiEnabled
          ? "bg-[var(--primary-container)] border-[var(--primary-container)] shadow-xs shadow-blue-500/25"
          : "bg-slate-300 border-slate-300 hover:bg-slate-400/80 hover:border-slate-400/80"
      } ${className}`}
    >
      <span className="sr-only">
        {isApiEnabled ? "โหมด API: เปิด" : "โหมด API: ปิด"}
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
          isApiEnabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
