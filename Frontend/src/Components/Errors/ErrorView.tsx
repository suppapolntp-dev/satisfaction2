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
 * 🎨 Dribbble Milestone & Error Vector Illustration
 * Recreated 1:1 in pure vector SVG directly from reference (image_d88fef.png):
 * - Leaping celebrating figure with vibrant orange ponytail (#f85d2e)
 * - Off-white / pale-lavender sweater (#dfe8f4)
 * - Dark navy pants (#0f2939) & orange boots (#f86337)
 * - Tropical teal foliage (#1a7b8c) with white dashed ribs (.vein)
 * - Soft oval ground shadow (#ebf0f7) with dark soil puddles (#0b2535)
 */
function DribbbleHeroIllustration() {
  return (
    <svg
      className="w-full h-auto max-h-[175px] mx-auto select-none"
      viewBox="0 0 500 390"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <style>{`
          .vein-dashed { stroke: #ffffff; stroke-width: 1.6; stroke-linecap: round; stroke-dasharray: 4, 4; fill: none; opacity: 0.9; }
        `}</style>
      </defs>

      {/* 1. Ground Shadow & Soil Puddles */}
      <g id="ground-shadow">
        <ellipse cx="255" cy="350" rx="150" ry="32" fill="#ebf0f7" />
        <path d="M 158 344 C 170 340 205 340 212 346 C 215 352 195 355 180 354 C 165 354 152 350 158 344 Z" fill="#0b2535" />
        <path d="M 300 360 C 310 356 325 356 330 361 C 332 366 320 369 312 368 C 304 368 296 364 300 360 Z" fill="#0b2535" />
      </g>

      {/* 2. Left Plant / Foliage with Dashed White Veins */}
      <g id="left-plant">
        {/* Central Tall Lobe */}
        <path d="M 185 345 C 165 260 160 160 180 95 C 198 160 205 260 185 345 Z" fill="#1a7b8c" />
        {/* Left Outer Lobe */}
        <path d="M 182 320 C 145 270 130 220 135 180 C 152 175 175 220 183 270 Z" fill="#1a7b8c" />
        {/* Right Inner Lobe */}
        <path d="M 185 300 C 200 250 220 205 230 200 C 235 220 215 265 186 330 Z" fill="#1a7b8c" />
        {/* Dashed Ribs */}
        <path className="vein-dashed" d="M 181 330 C 175 250 174 160 180 102" />
        <path className="vein-dashed" d="M 177 220 C 160 200 145 188 138 185" />
        <path className="vein-dashed" d="M 179 245 C 195 230 212 215 225 205" />
      </g>

      {/* 3. Character: Back Leg (Behind Right Plant) */}
      <g id="character-back-leg">
        <path d="M 245 195 C 265 225 285 260 305 285 L 290 292 C 270 265 252 230 236 200 Z" fill="#0f2939" />
      </g>

      {/* 4. Right Plant / Foliage with Dashed White Veins */}
      <g id="right-plant">
        {/* Main Leaf */}
        <path d="M 314 362 C 290 300 292 220 310 185 C 326 220 326 300 314 362 Z" fill="#1a7b8c" />
        {/* Side Leaf */}
        <path d="M 314 350 C 330 310 345 265 342 240 C 332 240 322 280 314 330 Z" fill="#1a7b8c" />
        {/* Dashed Ribs */}
        <path className="vein-dashed" d="M 314 350 C 305 295 305 230 310 192" />
        <path className="vein-dashed" d="M 310 280 C 322 265 334 250 338 245" />
      </g>

      {/* 5. Character: Body, Torso, Ponytail, Arms & Boots */}
      <g id="character-body">
        {/* Vibrant Orange Ponytail flying right */}
        <path d="M 255 118 C 262 105 272 108 276 122 C 282 145 295 185 300 190 C 290 195 275 180 268 155 C 262 140 258 128 255 118 Z" fill="#f85d2e" />

        {/* Front Leg & Orange Boot */}
        <path d="M 226 195 C 228 245 238 285 244 308 L 256 306 C 248 275 240 235 238 195 Z" fill="#0f2939" />
        <path d="M 244 305 L 256 304 C 255 320 258 335 262 344 C 255 352 248 350 245 342 C 243 330 243 318 244 305 Z" fill="#f86337" />

        {/* Torso / Off-white Sweater */}
        <path d="M 224 195 C 220 170 216 142 215 136 C 226 134 254 130 260 134 C 256 148 248 175 246 195 C 238 198 230 198 224 195 Z" fill="#dfe8f4" />

        {/* Neck & Face */}
        <path d="M 239 135 C 241 125 244 118 248 112 L 254 115 C 250 122 247 128 246 135 Z" fill="#fca892" />
        <path d="M 247 114 C 244 106 248 98 254 97 C 260 97 263 103 259 112 C 254 117 249 117 247 114 Z" fill="#fca892" />

        {/* Left Arm & Orange Cuff */}
        <path d="M 216 137 L 194 98 L 202 93 L 225 133 Z" fill="#dfe8f4" />
        <path d="M 194 98 L 186 82 C 188 79 194 80 197 85 L 202 93 Z" fill="#f86337" />

        {/* Right Arm & Orange Cuff */}
        <path d="M 255 135 L 298 116 L 303 124 L 260 141 Z" fill="#dfe8f4" />
        <path d="M 298 116 L 311 101 C 315 103 314 110 308 116 L 303 124 Z" fill="#f86337" />
      </g>
    </svg>
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

      {/* ─── Main Modal Card (1:1 Reference Styling from image_d88fef.png) ─── */}
      <div className="max-w-[360px] w-full bg-white rounded-2xl border-2 border-[#0d1b2a] p-8 text-center shadow-2xl relative z-10 transition-all">
        {/* 1. Vector Illustration (Exact 1:1 Vector from Dribbble Shot) */}
        <div className="w-full flex items-center justify-center mb-4">
          <DribbbleHeroIllustration />
        </div>

        {/* 2. Heading (Bold Navy) */}
        <h2 className="text-2xl font-extrabold text-[#0b1a2d] tracking-tight mb-2.5">
          {resolvedTitle}
        </h2>

        {/* 3. Description (Muted Slate) */}
        <p className="text-sm text-[#5c728a] leading-relaxed mb-6 px-1">
          {resolvedDescription}
        </p>

        {/* 4. Action Buttons (Solid Orange Button matching Got It from Reference) */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center w-full">
          {/* Primary Action (Solid Orange Button - Got It / ลองใหม่อีกครั้ง) */}
          {reset ? (
            <button
              onClick={reset}
              className="w-full sm:w-auto flex-1 bg-[#f26430] hover:bg-[#e0531f] text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-all duration-150 active:scale-95 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>{primaryAction?.label || "ลองใหม่อีกครั้ง"}</span>
            </button>
          ) : primaryAction?.onClick ? (
            <button
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto flex-1 bg-[#f26430] hover:bg-[#e0531f] text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-all duration-150 active:scale-95 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {primaryAction.icon || "check"}
              </span>
              <span>{primaryAction.label}</span>
            </button>
          ) : (
            <Link
              href={primaryAction?.href || "/dashboard"}
              className="w-full sm:w-auto flex-1 bg-[#f26430] hover:bg-[#e0531f] text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-all duration-150 active:scale-95 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {primaryAction?.icon || "check"}
              </span>
              <span>{primaryAction?.label || "Got It"}</span>
            </Link>
          )}

          {/* Secondary Action (Optional Dashboard Link if provided) */}
          {secondaryAction && (
            secondaryAction.onClick ? (
              <button
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto flex-1 bg-white border border-slate-300 hover:border-[#0d1b2a] hover:text-[#0d1b2a] text-slate-700 font-semibold py-2.5 px-4 rounded-lg text-sm transition-all duration-150 active:scale-95 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {secondaryAction.icon || "dashboard"}
                </span>
                <span>{secondaryAction.label}</span>
              </button>
            ) : (
              <Link
                href={secondaryAction.href || "/dashboard"}
                className="w-full sm:w-auto flex-1 bg-white border border-slate-300 hover:border-[#0d1b2a] hover:text-[#0d1b2a] text-slate-700 font-semibold py-2.5 px-4 rounded-lg text-sm transition-all duration-150 active:scale-95 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {secondaryAction.icon || "dashboard"}
                </span>
                <span>{secondaryAction.label || "Dashboard"}</span>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}

