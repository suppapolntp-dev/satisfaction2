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
          ? "คลิกเพื่อปิด API: ดูพรีวิวหน้าเปล่า (Empty State) โดยไม่โหลดข้อมูล"
          : "คลิกเพื่อเปิด API: ดึงข้อมูลและเชื่อมต่อ API ตามปกติ"
      }
      onClick={toggleApiMode}
      className={`group relative inline-flex items-center gap-2 min-h-11 min-w-11 sm:min-h-10 px-3 sm:px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 motion-reduce:transition-none shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer select-none ${
        isApiEnabled
          ? "bg-emerald-50/90 hover:bg-emerald-100/80 text-emerald-900 border-emerald-200/90 active:scale-[0.98]"
          : "bg-slate-100/95 hover:bg-slate-200/80 text-slate-700 border-slate-300/80 active:scale-[0.98]"
      } ${className}`}
    >
      {/* Status Indicator Dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        {isApiEnabled && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isApiEnabled ? "bg-emerald-600" : "bg-slate-400"
          }`}
        />
      </span>

      {/* Mode SVG Icon */}
      {isApiEnabled ? (
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-emerald-600 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Server / Cloud Database Active Icon */}
          <rect width="20" height="8" x="2" y="3" rx="2" />
          <rect width="20" height="8" x="2" y="13" rx="2" />
          <line x1="6" x2="6.01" y1="7" y2="7" />
          <line x1="6" x2="6.01" y1="17" y2="17" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-slate-500 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Server / Cloud Database Disabled Icon with Slash */}
          <path d="M2 3h20" />
          <path d="M21 3v6a2 2 0 0 1-2 2H5" />
          <path d="M3 13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
      )}

      {/* Mode Text Label */}
      <div className="flex items-center gap-1.5 leading-none">
        <span className="font-semibold tracking-tight text-[12px]">
          {isApiEnabled ? "API: เปิด" : "API: ปิด"}
        </span>
        <span
          className={`hidden sm:inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${
            isApiEnabled
              ? "bg-emerald-100/80 text-emerald-700 border-emerald-200"
              : "bg-slate-200/80 text-slate-600 border-slate-300"
          }`}
        >
          {isApiEnabled ? "มีข้อมูล" : "หน้าเปล่า"}
        </span>
      </div>

      {/* Visual Switch Pill Mini Slider */}
      <span
        aria-hidden="true"
        className={`ml-0.5 hidden xs:inline-flex w-7 h-4 rounded-full p-0.5 transition-colors duration-200 ${
          isApiEnabled ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform duration-200 ${
            isApiEnabled ? "translate-x-3" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
