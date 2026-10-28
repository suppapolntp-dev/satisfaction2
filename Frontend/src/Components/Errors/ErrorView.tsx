"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface ErrorViewProps {
  statusCode?: number | string;
  title?: string;
  description?: string;
  errorCode?: string;
  error?: Error & { digest?: string };
  reset?: () => void;
  primaryAction?: {
    label: string;
    icon?: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    icon?: string;
    onClick?: () => void;
    href?: string;
  };
  systemStatus?: string;
}

export function ErrorView({
  statusCode = 500,
  title,
  description,
  errorCode,
  error,
  reset,
  primaryAction,
  secondaryAction,
  systemStatus = "Operational",
}: ErrorViewProps) {
  const [showDetails, setShowDetails] = useState(false);

  const is404 = String(statusCode) === "404";
  const defaultTitle = is404 ? "404 - ไม่พบหน้าที่ต้องการ" : "เกิดข้อผิดพลาดในการทำงาน";
  const defaultDescription = is404
    ? "หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่พร้อมใช้งานชั่วคราว"
    : "ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง หรือกลับไปยังหน้าหลัก";
  const defaultErrorCode = errorCode || (is404 ? "ERR_404_NOT_FOUND" : "ERR_INTERNAL_SERVER_ERROR");

  const resolvedTitle = title || defaultTitle;
  const resolvedDescription = description || defaultDescription;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-[#f7f9fb] text-slate-800 relative overflow-hidden select-none">
      {/* Background Decorative Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
        <span
          className="material-symbols-outlined text-[320px] md:text-[460px] text-[var(--primary-container)]"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
        >
          {is404 ? "route" : "warning"}
        </span>
      </div>

      {/* Main Card Container */}
      <div className="max-w-2xl w-full flex flex-col items-center text-center relative z-10 bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* SVG Illustration */}
        <div className="mb-6 md:mb-8 w-40 h-40 md:w-48 md:h-48 relative flex items-center justify-center">
          <svg
            className="w-full h-full text-[var(--primary-container)]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            viewBox="0 0 200 200"
          >
            {/* Left Node */}
            <circle cx="40" cy="100" fill="currentColor" fillOpacity="0.1" r="16" />
            <circle cx="40" cy="100" fill="currentColor" r="6" />

            {/* Right Node */}
            <circle cx="160" cy="100" fill="currentColor" fillOpacity="0.1" r="16" />
            <circle cx="160" cy="100" fill="currentColor" r="6" />

            {/* Broken Path Left */}
            <path className="text-blue-700 opacity-80" d="M56 100 L90 100" strokeDasharray="8 4" />

            {/* Broken Path Right */}
            <path className="text-blue-700 opacity-80" d="M110 100 L144 100" strokeDasharray="8 4" />

            {/* Error Icon in Middle */}
            <g className={is404 ? "text-amber-500" : "text-red-500"} transform="translate(88, 88)">
              <circle cx="12" cy="12" fill="currentColor" fillOpacity="0.1" r="14" stroke="none" />
              {is404 ? (
                <text
                  x="12"
                  y="17"
                  textAnchor="middle"
                  fill="currentColor"
                  stroke="none"
                  fontSize="16"
                  fontWeight="bold"
                >
                  ?
                </text>
              ) : (
                <>
                  <path d="M8 8 L16 16 M16 8 L8 16" stroke="currentColor" strokeWidth="3" />
                </>
              )}
            </g>

            {/* Abstract Background Grid Elements */}
            <path className="opacity-10" d="M 20 40 L 180 40 M 20 160 L 180 160" stroke="currentColor" strokeWidth="1" />
            <path className="opacity-10" d="M 40 20 L 40 180 M 160 20 L 160 180" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
          {resolvedTitle}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
          {resolvedDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center w-full max-w-md">
          {/* Primary Action */}
          {reset ? (
            <button
              onClick={reset}
              className="w-full sm:w-auto flex-1 bg-[var(--primary-container)] text-white hover:bg-[var(--primary-hover)] transition-all py-3 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              {primaryAction?.label || "ลองใหม่อีกครั้ง"}
            </button>
          ) : primaryAction?.onClick ? (
            <button
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto flex-1 bg-[var(--primary-container)] text-white hover:bg-[var(--primary-hover)] transition-all py-3 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-[20px]">{primaryAction.icon || "arrow_back"}</span>
              {primaryAction.label}
            </button>
          ) : (
            <Link
              href={primaryAction?.href || "/dashboard"}
              className="w-full sm:w-auto flex-1 bg-[var(--primary-container)] text-white hover:bg-[var(--primary-hover)] transition-all py-3 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-[20px]">{primaryAction?.icon || "dashboard"}</span>
              {primaryAction?.label || "กลับสู่หน้า Dashboard"}
            </Link>
          )}

          {/* Secondary Action */}
          {secondaryAction?.onClick ? (
            <button
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto flex-1 bg-transparent border border-slate-300 hover:border-[var(--primary-container)] hover:text-[var(--primary-container)] text-slate-600 transition-all py-3 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-[20px]">{secondaryAction.icon || "support_agent"}</span>
              {secondaryAction.label}
            </button>
          ) : (
            <Link
              href={secondaryAction?.href || "/login"}
              className="w-full sm:w-auto flex-1 bg-transparent border border-slate-300 hover:border-[var(--primary-container)] hover:text-[var(--primary-container)] text-slate-600 transition-all py-3 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-[20px]">{secondaryAction?.icon || "login"}</span>
              {secondaryAction?.label || "กลับสู่หน้าเข้าสู่ระบบ"}
            </Link>
          )}
        </div>

        {/* Technical Error Details (Collapsible for debugging) */}
        {error && (
          <div className="w-full mt-6 text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <span>{showDetails ? "ซ่อนรายละเอียดทางเทคนิค" : "ดูรายละเอียดทางเทคนิค"}</span>
              <span className="material-symbols-outlined text-[14px]">
                {showDetails ? "expand_less" : "expand_more"}
              </span>
            </button>

            {showDetails && (
              <div className="mt-3 p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-48">
                <p className="text-red-400 font-semibold mb-1">{error.name}: {error.message}</p>
                {error.digest && <p className="text-slate-400 mb-1">Digest: {error.digest}</p>}
                {error.stack && (
                  <pre className="text-[11px] text-slate-300 whitespace-pre-wrap mt-2">{error.stack}</pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Card Footer */}
        <div className="mt-8 pt-5 border-t border-slate-100 w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
            <span>Status: {systemStatus}</span>
          </div>
          <div>
            <span>Code: <code className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{defaultErrorCode}</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}

