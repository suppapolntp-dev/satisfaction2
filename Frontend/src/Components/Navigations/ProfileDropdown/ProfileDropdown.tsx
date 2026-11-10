"use client";

import React from "react";
import Link from "next/link";
import { ProfileDropdownProps } from "./types";
import { useProfileDropdown } from "./useProfileDropdown";

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

  const [imageError, setImageError] = React.useState(false);
  const hasBrandLogo = Boolean(profile?.brandLogoUrl && !imageError);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Trigger Button (44px min target on touch, accessible focus ring) */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={profile?.fullName ? `Account menu for ${profile.fullName}` : "Account menu"}
        className="flex items-center gap-2.5 min-h-11 min-w-11 sm:min-h-10 p-1.5 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 transition-colors duration-200 motion-reduce:transition-none shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer"
      >
        {/* Avatar Container: Brand Logo or Guest Profile */}
        {hasBrandLogo ? (
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200/90 shadow-2xs p-1 flex items-center justify-center shrink-0 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile?.brandLogoUrl}
              alt={profile?.brandName || "Brand logo"}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain select-none"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/90 text-slate-500 flex items-center justify-center shrink-0 relative shadow-2xs overflow-hidden">
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--primary-container)] ring-2 ring-white"
            />
          </div>
        )}

        {isLoading && !profile ? (
          <div aria-hidden="true" className="hidden sm:flex flex-col gap-1 w-20">
            <span className="h-3 w-16 rounded bg-slate-200 animate-pulse motion-reduce:animate-none" />
            <span className="h-2.5 w-12 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
          </div>
        ) : (
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
              {profile?.fullName ?? "-"}
            </span>
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
              {profile?.roleName ?? "-"}
            </span>
          </div>
        )}

        <svg
          aria-hidden="true"
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
            isOpen ? "rotate-180 text-slate-700" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Profile Dropdown Popover */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-label="User account options"
          className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_36px_-12px_rgba(15,23,42,0.18)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
        >
          {/* User Information Card (Loading / Error / Default States) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 mb-2">
            {isLoading && !profile ? (
              <div className="flex items-center gap-2.5" role="status" aria-label="Loading profile">
                <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse motion-reduce:animate-none shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-slate-200 animate-pulse motion-reduce:animate-none" />
                  <div className="h-2.5 w-32 rounded bg-slate-200 animate-pulse motion-reduce:animate-none" />
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
                  className="min-h-8 px-2.5 rounded-lg text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--accent-bg)] transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  {hasBrandLogo ? (
                    <div className="w-9 h-9 rounded-full bg-white border border-slate-200/90 shadow-2xs p-1 flex items-center justify-center shrink-0 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile?.brandLogoUrl}
                        alt={profile?.brandName || "Brand logo"}
                        className="w-full h-full object-contain select-none"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                      />
                    </div>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/90 text-slate-500 flex items-center justify-center shrink-0 relative shadow-2xs"
                    >
                      <svg
                        aria-hidden="true"
                        className="w-4.5 h-4.5 text-slate-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--primary-container)] ring-2 ring-white"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {profile?.fullName ?? "-"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {profile?.email ?? "-"}
                    </p>
                    {profile?.brandName && (
                      <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded mt-1">
                        {profile.brandName}
                      </span>
                    )}
                  </div>
                </div>
                {profile?.roleName && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      Role
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
                      {profile.roleName}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Featured Action: Open Kiosk (Relocated into Profile) */}
          <div className="mb-1.5">
            <Link
              href="/satisfaction"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeDropdown}
              role="menuitem"
              className="flex items-center justify-between w-full min-h-11 sm:min-h-10 px-3 rounded-xl bg-[var(--accent-bg)] hover:bg-[var(--primary-container)]/15 text-[var(--primary-container)] transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--primary-container)] group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 text-[var(--primary-container)] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="18" height="12" x="3" y="4" rx="2" />
                  <line x1="2" x2="22" y1="20" y2="20" />
                  <line x1="12" x2="12" y1="16" y2="20" />
                </svg>
                <span className="text-xs font-bold">Open Kiosk</span>
              </div>
              <svg
                aria-hidden="true"
                className="w-3.5 h-3.5 text-[var(--primary-container)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150 motion-reduce:transition-none shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          </div>

          {/* Quick Menu Actions */}
          <div className="space-y-0.5 border-t border-slate-100 pt-1.5">
            <Link
              href="/test"
              onClick={closeDropdown}
              role="menuitem"
              className="flex items-center gap-2.5 w-full min-h-11 sm:min-h-10 px-2.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--primary-container)]"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-slate-500 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>Dev Playground</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={closeDropdown}
              role="menuitem"
              className="flex items-center gap-2.5 w-full min-h-11 sm:min-h-10 px-2.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--primary-container)]"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-slate-500 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              <span>Workspace Profile</span>
            </Link>
          </div>

          {/* Sign Out Action */}
          <div className="border-t border-slate-100 pt-1.5 mt-1">
            <button
              type="button"
              onClick={handleSignOut}
              role="menuitem"
              className="flex items-center gap-2.5 w-full min-h-11 sm:min-h-10 px-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-600 cursor-pointer"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-rose-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
