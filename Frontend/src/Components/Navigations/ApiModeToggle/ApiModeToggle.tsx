"use client";

import React from "react";
import { useApiMode } from "@/Context/ApiModeContext";

export interface ApiModeToggleProps {
  className?: string;
}

export default function ApiModeToggle({ className = "" }: ApiModeToggleProps) {
  const { isApiEnabled, toggleApiMode } = useApiMode();

  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${className}`}
      role="group"
      aria-label="API Data Mode Controls"
    >
      {/* ─── 1. Status Indicator Pill Badge ─── */}
      <button
        type="button"
        onClick={toggleApiMode}
        title={
          isApiEnabled
            ? "โหมดปัจจุบัน: เปิด API (มีข้อมูล) — คลิกเพื่อดูพรีวิวหน้าเปล่า"
            : "โหมดปัจจุบัน: ปิด API (หน้าเปล่า) — คลิกเพื่อเชื่อมต่อข้อมูลจริง"
        }
        className={`hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] ${
          isApiEnabled
            ? "bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-900 border-emerald-200/90 active:scale-[0.98]"
            : "bg-slate-100/95 hover:bg-slate-200/80 text-slate-700 border-slate-300/80 active:scale-[0.98]"
        }`}
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

        {/* Server / Cloud Database Active or Slash Icon */}
        {isApiEnabled ? (
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5 text-emerald-600 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="8" x="2" y="3" rx="2" />
            <rect width="20" height="8" x="2" y="13" rx="2" />
            <line x1="6" x2="6.01" y1="7" y2="7" />
            <line x1="6" x2="6.01" y1="17" y2="17" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5 text-slate-500 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h20" />
            <path d="M21 3v6a2 2 0 0 1-2 2H5" />
            <path d="M3 13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        )}

        <span className="font-semibold text-[11px] sm:text-xs">
          {isApiEnabled ? "API: เปิด" : "API: ปิด"}
        </span>

        <span
          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
            isApiEnabled
              ? "bg-emerald-100/90 text-emerald-700 border-emerald-200"
              : "bg-slate-200/80 text-slate-600 border-slate-300"
          }`}
        >
          {isApiEnabled ? "มีข้อมูล" : "หน้าเปล่า"}
        </span>
      </button>

      {/* ─── 2. Switch Button (iOS / Modern Design System Toggle Switch) ─── */}
      <button
        type="button"
        role="switch"
        aria-checked={isApiEnabled}
        aria-label={isApiEnabled ? "โหมด API: เปิด (มีข้อมูล)" : "โหมด API: ปิด (หน้าเปล่า)"}
        title={
          isApiEnabled
            ? "คลิก Switch เพื่อปิดโหมด API (พรีวิวหน้าเปล่า)"
            : "คลิก Switch เพื่อเปิดโหมด API (เชื่อมต่อข้อมูล)"
        }
        onClick={toggleApiMode}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 border-2 transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] active:scale-95 ${
          isApiEnabled
            ? "bg-emerald-600 border-emerald-600 shadow-xs shadow-emerald-500/20"
            : "bg-slate-300 border-slate-300 hover:bg-slate-400/80 hover:border-slate-400/80"
        }`}
      >
        <span className="sr-only">Toggle API Mode</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
            isApiEnabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
