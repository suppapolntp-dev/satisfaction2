"use client";

import React from "react";
import { useLoginForm, LoginCredentials, UseLoginFormOptions } from "./useLoginForm";

export interface LoginFormProps extends UseLoginFormOptions {
  /** Form heading */
  title?: string;
  /** Form subtitle */
  subtitle?: string;
  /** Custom submit button label */
  submitLabel?: string;
  /** Security notice displayed at bottom */
  securityNotice?: string;
  /** Optional custom container CSS classes */
  className?: string;
}

/**
 * 🔐 LoginForm
 * 
 * Component แบบฟอร์มล็อกอินระดับองค์กรสำหรับระบบ CSAT / CRG
 * ดีไซน์ Clean Minimal ตามมาตรฐาน 60-30-10, 8pt Grid, รองรับ 5 สถานะครบถ้วน
 * พร้อม Password Visibility Toggle และการตรวจสอบข้อมูลแบบ Strict API-Ready
 */
export default function LoginForm({
  title = "Welcome back",
  subtitle = "กรอกรหัสประจำตัวองค์กรเพื่อเข้าสู่ระบบงาน",
  submitLabel = "Sign In to Console",
  securityNotice = "ระบบสงวนสิทธิ์เฉพาะบุคลากรที่ได้รับมอบหมาย บัญชีผู้ใช้งานถูกสร้างและกำหนดสิทธิ์โดย Admin / Brand Manager ประจำสายงาน (Role-based Provisioning)",
  initialCorporateId = "",
  initialPassword = "",
  onSubmit,
  className = "",
}: LoginFormProps) {
  const {
    corporateId,
    setCorporateId,
    password,
    setPassword,
    isPasswordVisible,
    togglePasswordVisibility,
    isLoading,
    errorMessage,
    fieldErrors,
    handleSubmit,
  } = useLoginForm({ initialCorporateId, initialPassword, onSubmit });

  return (
    <div
      className={`w-full max-w-md mx-auto p-6 sm:p-10 bg-white rounded-3xl sm:border sm:border-slate-200/90 sm:shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] flex flex-col gap-6 ${className}`}
    >
      {/* ─── 1. FORM HEADER ─── */}
      <div className="flex flex-col gap-1.5 text-left">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Secure Authentication
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* ─── 2. ERROR CALLOUT BANNER ─── */}
      {errorMessage && (
        <div 
          role="alert"
          className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-3.5 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
        >
          <svg
            className="w-4 h-4 text-rose-500 shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* ─── 3. FORM FIELDS ─── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Corporate ID Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-corporate-id"
            className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between"
          >
            <span>Corporate ID</span>
            {fieldErrors.corporateId && (
              <span className="text-[11px] font-medium text-rose-600 lowercase">
                {fieldErrors.corporateId}
              </span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              id="login-corporate-id"
              type="text"
              autoComplete="username"
              required
              disabled={isLoading}
              placeholder="e.g. CRG-88201"
              value={corporateId}
              onChange={(e) => setCorporateId(e.target.value)}
              className={`w-full h-12 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white ${
                fieldErrors.corporateId
                  ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                  : "border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              }`}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-password"
            className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between"
          >
            <span>Password</span>
            {fieldErrors.password && (
              <span className="text-[11px] font-medium text-rose-600 lowercase">
                {fieldErrors.password}
              </span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              id="login-password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={isLoading}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full h-12 pl-10 pr-12 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 font-mono outline-none transition-all duration-200 focus:bg-white ${
                fieldErrors.password
                  ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                  : "border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              }`}
            />
            <button
              type="button"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
            >
              {isPasswordVisible ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 select-none"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>กำลังตรวจสอบสิทธิ์...</span>
            </>
          ) : (
            <>
              <span>{submitLabel}</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* ─── 4. SECURITY & COMPLIANCE FOOTER ─── */}
      <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5">
        <svg
          className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {securityNotice}
        </p>
      </div>
    </div>
  );
}
