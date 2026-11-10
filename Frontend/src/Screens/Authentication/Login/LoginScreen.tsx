"use client";

import React from "react";
import { LoginHeroSection } from "@/Components/Auth/LoginHeroSection";
import { LoginForm } from "@/Components/Auth/LoginForm";
import { useLoginHero } from "@/Components/Auth/LoginHeroSection/useLoginHero";
import { useLoginScreen } from "./useLoginScreen";

export interface LoginScreenProps {
  /** Optional custom class for outer wrapper */
  className?: string;
}

/**
 * 🖥️ LoginScreen
 * 
 * Screen Component หลักสำหรับหน้า Authentication
 * แบ่งสัดส่วน 50/50 Desktop Split-Screen โดยผสาน LoginHeroSection (ซ้าย) และ LoginForm (ขวา)
 * พร้อมโหมด Mobile-Responsive Stack ตามมาตรฐาน Clean Architecture
 */
export default function LoginScreen({ className = "" }: LoginScreenProps) {
  const { handleLoginSubmit } = useLoginScreen();
  const { config } = useLoginHero();

  return (
    <main
      className={`min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 overflow-x-hidden ${className}`}
    >
      {/* ─── 1. MOBILE BRAND HEADER (แสดงเฉพาะหน้าจอมือถือ/แท็บเล็ตเล็ก) ─── */}
      <div className="lg:hidden flex items-center justify-between p-5 bg-slate-950 text-white border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <svg 
              className="w-4 h-4 text-blue-400" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight">{config.brandName}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {config.badgeText}
        </span>
      </div>

      {/* ─── 2. LEFT PANE: BRANDING & HERO BANNER (Desktop 50%) ─── */}
      <div className="hidden lg:block lg:w-1/2 xl:w-7/12 shrink-0">
        <LoginHeroSection />
      </div>

      {/* ─── 3. RIGHT PANE: AUTHENTICATION FORM CANVAS (Desktop 50%) ─── */}
      <section
        aria-label="User Authentication Section"
        className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-8 md:py-16 bg-slate-50 relative"
      >
        <LoginForm
          title={config.formTitle}
          subtitle={config.formSubtitle}
          submitLabel={config.submitButtonLabel}
          securityNotice={config.securityNoticeText}
          onSubmit={handleLoginSubmit}
        />
      </section>
    </main>
  );
}
