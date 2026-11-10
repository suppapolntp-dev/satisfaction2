"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProfileDropdownProps } from "./types";
import { useProfileDropdown } from "./useProfileDropdown";
import { useApiMode } from "@/Context/ApiModeContext";

export default function ProfileDropdown({
  initialProfile,
  className = "",
}: ProfileDropdownProps) {
  const {
    isOpen,
    profile,
    isLoading,
    error,
    dropdownRef,
    toggleDropdown,
    closeDropdown,
    retryFetchProfile,
    handleSignOut,
  } = useProfileDropdown(initialProfile);

  const { isApiEnabled, toggleApiMode } = useApiMode();
  const [imageError, setImageError] = useState(false);
  const hasBrandLogo = Boolean(profile?.brandLogoUrl && !imageError);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* ─── Trigger Button (Figma Node 31:33) ─── */}
      <button
        id="accountMenuBtn"
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={
          profile?.fullName ? `Account menu for ${profile.fullName}` : "Account menu"
        }
        className="group bg-white hover:bg-slate-50 active:bg-slate-100 border border-[#e2e8f0]/90 rounded-full pl-1.5 pr-3 py-1 min-h-[40px] flex items-center gap-2.5 shadow-2xs hover:shadow-xs transition-all outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
      >
        {/* Avatar Container with Active Status Dot (Figma Node 31:34, 31:35, 31:38) */}
        <div className="relative size-8 rounded-full bg-[#f1f5f9] border border-[#e2e8f0]/90 flex items-center justify-center shrink-0 shadow-2xs overflow-visible">
          {hasBrandLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile?.brandLogoUrl}
              alt={profile?.brandName || "Brand logo"}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain p-1 select-none rounded-full"
            />
          ) : (
            <svg
              className="w-4 h-4 text-slate-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
          {/* Blue Online Status Dot */}
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#2563eb] ring-2 ring-white" />
        </div>

        {/* Account Text Details (Figma Node 31:39) */}
        <div className="text-left max-w-[130px] truncate hidden sm:block">
          {isLoading && !profile ? (
            <div className="space-y-1">
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-2 w-12 bg-slate-100 rounded animate-pulse" />
            </div>
          ) : (
            <>
              {/* Name (Figma Node 31:41) */}
              <div className="text-[12px] font-semibold text-[#0f172b] leading-tight truncate">
                {profile?.fullName || "System Administrator"}
              </div>
              {/* Role (Figma Node 31:44) */}
              <div className="text-[10px] font-medium text-[#62748e] leading-tight truncate mt-0.5">
                {profile?.roleName || "Super Admin (ผู้ดูแลระบบสูงสุด)"}
              </div>
            </>
          )}
        </div>

        {/* Chevron Down Icon (Figma Node 31:46) */}
        <div
          id="dropdownChevron"
          className={`size-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* ─── User Account Options Menu (Figma Node 31:49) ─── */}
      {isOpen && (
        <div
          id="accountDropdownMenu"
          role="menu"
          aria-label="User Account Options"
          className="absolute right-0 mt-3 w-64 bg-white border border-[#e2e8f0]/90 rounded-2xl shadow-figma-dropdown p-2 z-50 transition-all origin-top-right animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* User Profile Card (Figma Node 31:50) */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0]/70 rounded-2xl p-3 space-y-2.5">
            {isLoading && !profile ? (
              <div className="flex items-center gap-2.5" role="status" aria-label="Loading profile">
                <div className="size-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-2.5 w-32 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ) : error && !profile ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-rose-600 font-medium truncate">
                  {error}
                </span>
                <button
                  type="button"
                  onClick={retryFetchProfile}
                  className="min-h-8 px-2.5 rounded-lg text-xs font-semibold text-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Avatar & Details (Figma Node 31:51) */}
                <div className="flex items-center gap-2.5">
                  <div className="relative size-9 rounded-full bg-[#f1f5f9] border border-[#e2e8f0]/90 flex items-center justify-center shrink-0 shadow-2xs overflow-visible">
                    {hasBrandLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile?.brandLogoUrl}
                        alt={profile?.brandName || "Brand logo"}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-contain p-1 select-none rounded-full"
                      />
                    ) : (
                      <svg
                        className="w-4 h-4 text-slate-700"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#2563eb] ring-2 ring-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Name (Figma Node 31:59) */}
                    <div className="text-[12px] font-bold text-[#0f172b] truncate">
                      {profile?.fullName || "System Administrator"}
                    </div>
                    {/* Email (Figma Node 31:62) */}
                    <div className="text-[11px] font-mono text-[#62748e] truncate">
                      {profile?.email || "admin@satisfaction.local"}
                    </div>
                    {profile?.brandName && (
                      <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded mt-1">
                        {profile.brandName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Role Section (Figma Node 31:64) */}
                <div className="border-t border-[#e2e8f0]/60 pt-2 flex items-center justify-between">
                  {/* Label: ROLE (Figma Node 31:66) */}
                  <span className="text-[10px] font-bold text-[#62748e] uppercase tracking-wider">
                    ROLE
                  </span>
                  {/* Role Badge (Figma Node 31:69) */}
                  <span className="text-[10px] font-semibold text-[#314158] bg-white border border-[#e2e8f0]/80 px-2 py-0.5 rounded-full shadow-2xs truncate max-w-[150px]">
                    {profile?.roleName || "Super Admin (ผู้ดูแลระบบสูงสุด)"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ─── Section 1: Open Kiosk & API Mode (Figma Node 31:72 & 31:111) ─── */}
          <div className="pt-2 space-y-1">
            {/* Menu Item: Open Kiosk (Figma Node 31:73) */}
            <Link
              href="/satisfaction"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeDropdown}
              className="w-full h-10 px-3 rounded-xl bg-[#eff6ff] hover:bg-blue-100/70 text-[#2563eb] flex items-center justify-between transition-colors text-[12px] font-semibold group cursor-pointer"
              role="menuitem"
            >
              <div className="flex items-center gap-2.5">
                {/* Kiosk Screen Icon (Figma Node 31:75) */}
                <svg
                  className="w-4 h-4 text-[#2563eb]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect width="20" height="14" x="2" y="3" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>Open Kiosk</span>
              </div>
              {/* External Arrow Icon (Figma Node 31:81) */}
              <svg
                className="w-3.5 h-3.5 text-blue-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </Link>

            {/* Menu Item: API Toggle Switch (Figma Node 31:112 & 31:133) */}
            <button
              type="button"
              onClick={toggleApiMode}
              className="w-full h-10 px-3 rounded-xl bg-[#eff6ff] hover:bg-blue-100/70 text-[#2563eb] flex items-center justify-between cursor-pointer transition-colors text-[12px] font-semibold select-none text-left"
              role="menuitem"
              aria-checked={isApiEnabled}
              title={
                isApiEnabled
                  ? "โหมด API: เปิด (เชื่อมต่อ API จริง)"
                  : "โหมด API: ปิด (โหมดจำลอง)"
              }
            >
              <div className="flex items-center gap-2.5">
                {/* API Cloud Icon (Figma Node 31:114) */}
                <svg
                  className="w-4 h-4 text-[#2563eb]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9m-4-4 4 4 4-4" />
                </svg>
                <span>API</span>
              </div>

              {/* Switch Pill (Figma Node 31:133) */}
              <div
                id="apiTogglePill"
                className={`w-11 h-6 rounded-full p-0.5 transition-colors relative shadow-2xs border ${
                  isApiEnabled
                    ? "bg-[#2563eb] border-[#2563eb]"
                    : "bg-slate-300 border-slate-300"
                }`}
              >
                {/* Switch Thumb (Figma Node 31:135) */}
                <div
                  id="apiToggleThumb"
                  className={`size-4.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                    isApiEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Divider (Figma Node 31:85) */}
          <div className="border-t border-[#f1f5f9] my-1.5" />

          {/* ─── Section 2: Dev Playground & Workspace Profile (Figma Node 31:85) ─── */}
          <div className="space-y-0.5 text-[12px]">
            {/* Menu Item: Dev Playground (Figma Node 31:86) */}
            <Link
              href="/test"
              onClick={closeDropdown}
              className="w-full h-10 px-2.5 rounded-xl hover:bg-slate-50 text-[#314158] hover:text-slate-900 flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
              role="menuitem"
            >
              {/* Code Icon (Figma Node 31:87) */}
              <svg
                className="w-4 h-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>Dev Playground</span>
            </Link>

            {/* Menu Item: Workspace Profile (Figma Node 31:93) */}
            <Link
              href="/dashboard"
              onClick={closeDropdown}
              className="w-full h-10 px-2.5 rounded-xl hover:bg-slate-50 text-[#314158] hover:text-slate-900 flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
              role="menuitem"
            >
              {/* Settings/Sliders Icon (Figma Node 31:94) */}
              <svg
                className="w-4 h-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Workspace Profile</span>
            </Link>
          </div>

          {/* Divider (Figma Node 31:100) */}
          <div className="border-t border-[#f1f5f9] my-1.5" />

          {/* ─── Section 3: Sign Out (Figma Node 31:101) ─── */}
          <div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full h-10 px-2.5 rounded-xl hover:bg-rose-50 text-[#ec003f] flex items-center justify-start gap-2.5 transition-colors text-[12px] font-semibold group cursor-pointer"
              role="menuitem"
            >
              {/* Logout Icon (Figma Node 31:102) */}
              <svg
                className="w-4 h-4 text-[#ec003f]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {/* Text (Figma Node 31:105) */}
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
