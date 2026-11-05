"use client";

import React from "react";
import { useLoginHero, UseLoginHeroOptions } from "./useLoginHero";

export interface LoginHeroSectionProps extends UseLoginHeroOptions {
  /** Optional custom container CSS classes */
  className?: string;
}

/**
 * 🌟 LoginHeroSection
 * 
 * Component แผงฝั่งซ้ายของหน้า Login ตาม Visual Reference สไตล์ Enterprise SaaS
 * โทนสี Slate 950 พร้อม Luminous Ribbon Wave & Cobalt Radial Gradient
 * ผูกค่าตัวแปรทั้งหมดกับ System Settings ผ่าน useLoginHero Hook เพื่อให้แก้ไขในอนาคตได้ทันที
 */
export default function LoginHeroSection({
  className = "",
  ...overrides
}: LoginHeroSectionProps) {
  const { config } = useLoginHero(overrides);

  return (
    <aside
      aria-label="Platform Highlights & Identity"
      className={`relative hidden lg:flex flex-col justify-between w-full h-full min-h-screen p-10 xl:p-16 bg-slate-950 text-white overflow-hidden select-none ${className}`}
    >
      {/* ─── 1. BACKGROUND GLOW & DECORATIVE LUMINOUS RIBBON WAVES ─── */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Cobalt / Azure Radial Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-600/10 blur-[80px]" />

        {/* Ambient Topographic / Ribbon Wave Vectors */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35"
          preserveAspectRatio="none"
          viewBox="0 0 800 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 250 C200 180 350 480 850 320 C1000 270 1100 450 1200 600"
            stroke="url(#azure-gradient-1)"
            strokeWidth="2.5"
            strokeDasharray="6 8"
          />
          <path
            d="M-50 450 C250 320 400 680 900 520 C1050 480 1150 700 1250 820"
            stroke="url(#azure-gradient-2)"
            strokeWidth="3"
          />
          <path
            d="M-80 620 C220 500 420 850 920 720"
            stroke="url(#azure-gradient-1)"
            strokeWidth="1.75"
          />
          <defs>
            <linearGradient id="azure-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="azure-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#1e40af" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Faded Brandmark Watermark in center-right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.03] scale-150 pointer-events-none">
          <svg width="480" height="480" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        </div>
      </div>

      {/* ─── 2. TOP HEADER: Brand Identity & Version Tag ─── */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <svg 
              className="w-5 h-5 text-blue-400" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>{config.brandName}</span>
              {config.badgeText && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {config.badgeText}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{config.platformSubtitle}</p>
          </div>
        </div>
      </header>

      {/* ─── 3. CENTER HERO: Value Proposition & Key Highlights ─── */}
      <div className="relative z-10 max-w-xl my-auto py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">{config.tagText}</span>
        </div>

        <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-[1.2] mb-4">
          {config.headline}
        </h1>

        <p className="text-sm xl:text-base text-slate-400 leading-relaxed max-w-lg mb-8">
          {config.subheadline}
        </p>

        {/* 3 Pillars of Architecture (Rendered Dynamically from Config Variables) */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80">
          {config.pillars.map((pillar) => (
            <div key={pillar.id} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-200">{pillar.title}</span>
              <span className="text-[11px] text-slate-500">{pillar.subtitle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. BOTTOM FOOTER: Legal & System Info ─── */}
      <footer className="relative z-10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-900">
        <small className="text-[11px] font-normal text-slate-500">
          {config.copyrightText}
        </small>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="hover:text-slate-400 transition-colors cursor-pointer">{config.privacyNoticeLabel}</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span className="hover:text-slate-400 transition-colors cursor-pointer">{config.securityAuditLabel}</span>
        </div>
      </footer>
    </aside>
  );
}
