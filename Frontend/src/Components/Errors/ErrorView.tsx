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
  className?: string;
}

/**
 * 😊 Satisfaction Smiley Icon for Error States
 * (ดึงไอคอนจากระบบตู้ Kiosk Satisfaction: แย่/ปานกลาง/ดี ขนาดกะทัดรัด พร้อมเงาสะท้อนด้านล่าง)
 */
function SatisfactionErrorIcon({ statusCode }: { statusCode: number | string }) {
  const codeStr = String(statusCode);

  const config =
    codeStr === "404"
      ? {
          icon: "sentiment_neutral",
          color: "#d97706",
          bgColor: "bg-amber-50/70",
          borderColor: "border-amber-400/30",
          ringColor: "ring-amber-200/50",
          label: "ปานกลาง",
        }
      : codeStr === "403"
      ? {
          icon: "sentiment_dissatisfied",
          color: "#475569",
          bgColor: "bg-slate-100",
          borderColor: "border-slate-300",
          ringColor: "ring-slate-200",
          label: "ปฏิเสธสิทธิ์",
          badge: "lock",
        }
      : {
          icon: "sentiment_dissatisfied",
          color: "#dc3545",
          bgColor: "bg-red-50/70",
          borderColor: "border-red-400/30",
          ringColor: "ring-red-200/50",
          label: "แย่",
        };

  return (
    <div className="flex flex-col items-center justify-center select-none py-1">
      {/* วงกลมไอคอนยิ้มขนาดกะทัดรัด (เล็กลงตามสั่ง) */}
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 ${config.borderColor} ${config.bgColor} ring-4 ${config.ringColor} flex items-center justify-center relative shadow-sm transition-transform hover:scale-105 duration-200`}
        style={{ color: config.color }}
      >
        <span
          className="material-symbols-outlined leading-none select-none"
          style={{
            fontSize: "54px",
            fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 48",
          }}
        >
          {config.icon}
        </span>

        {/* ตราสัญลักษณ์เสริม เช่น แม่กุญแจสำหรับ 403 */}
        {"badge" in config && (
          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0F2231] text-white flex items-center justify-center text-[15px] border-2 border-white shadow-xs">
            <span className="material-symbols-outlined text-[15px]">lock</span>
          </span>
        )}
      </div>

      {/* เงา Ground Shadow ด้านล่างไอคอน */}
      <div className="w-24 h-2 bg-slate-200/70 rounded-full mt-3 blur-[1px]" />
    </div>
  );
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
  className = "",
}: ErrorViewProps) {
  const is404 = String(statusCode) === "404";
  const is403 = String(statusCode) === "403";

  const defaultTitle = is403
    ? "Oops! ปฏิเสธการเข้าถึง (403)"
    : is404
    ? "Oops! ไม่พบหน้าที่ต้องการ (404)"
    : "Oops something went wrong!";

  const defaultDescription = is403
    ? "คุณไม่มีสิทธิ์ระดับ Role หรือ Data Access Tier ที่จำเป็นในการเข้าถึงหน้านี้ หากต้องการใช้งานกรุณาติดต่อผู้ดูแลระบบ"
    : is404
    ? "หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่พร้อมใช้งานชั่วคราวในระบบ Enterprise CSAT"
    : "ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้งเพื่อกู้คืนการประมวลผล หรือกลับสู่หน้าหลัก";

  const defaultErrorCode =
    errorCode ||
    (error?.digest
      ? error.digest
      : is403
      ? "403-FORBIDDEN"
      : is404
      ? "404-NOT-FOUND"
      : "51FC-3D73");

  const resolvedTitle = title || defaultTitle;
  const resolvedDescription = description || defaultDescription;

  return (
    <div
      className={`min-h-[82vh] w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0C2B3A] via-[#0E3547] to-[#0A2431] text-slate-800 relative select-none ${className}`}
    >
      {/* Background Decorative Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#149B9E]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-slate-500/10 blur-3xl" />
      </div>

      {/* ─── Main Modal Card (Adam Fard Style: 2px Dark Border, Rounded-3xl, White Card) ─── */}
      <div className="max-w-[400px] w-full bg-white rounded-3xl border-2 border-[#0F2231] p-6 sm:p-8 text-center shadow-2xl relative z-10 transition-all">
        {/* ─── 1. รูป icons ยิ้มจากปุ่ม Satisfaction (เล็กลง วางเด่นด้านบนก่อนเข้าสู่หัวข้อ) ─── */}
        <div className="w-full flex items-center justify-center mb-4">
          <SatisfactionErrorIcon statusCode={statusCode} />
        </div>

        {/* ─── 2. Text Block: Heading + Description ─── */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F2231] tracking-tight mb-2">
          {resolvedTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 px-2">
          {resolvedDescription}
        </p>

        {/* ─── 3. Action Buttons (Layout ปุ่มเดิม: แนวนอนเรียงคู่กัน) ─── */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center w-full mt-6">
          {/* Primary Action (ลองใหม่อีกครั้ง) */}
          {reset ? (
            <button
              onClick={reset}
              className="w-full sm:w-auto flex-1 bg-[#F95C2C] hover:bg-[#E04B1D] text-white font-semibold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>{primaryAction?.label || "ลองใหม่อีกครั้ง"}</span>
            </button>
          ) : primaryAction?.onClick ? (
            <button
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto flex-1 bg-[#F95C2C] hover:bg-[#E04B1D] text-white font-semibold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {primaryAction.icon || "refresh"}
              </span>
              <span>{primaryAction.label}</span>
            </button>
          ) : null}

          {/* Secondary Action (กลับสู่หน้า Dashboard) */}
          <Link
            href={secondaryAction?.href || "/dashboard"}
            className="w-full sm:w-auto flex-1 bg-white border border-slate-300 hover:border-[#0F2231] hover:text-[#0F2231] text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {secondaryAction?.icon || "dashboard"}
            </span>
            <span>{secondaryAction?.label || "กลับสู่หน้า Dashboard"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

