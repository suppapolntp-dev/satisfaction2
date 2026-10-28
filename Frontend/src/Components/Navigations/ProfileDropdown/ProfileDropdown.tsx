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
    dropdownRef,
    toggleDropdown,
    closeDropdown,
    handleSignOut,
  } = useProfileDropdown(initialProfile);

  const userInitial = profile?.fullName
    ? profile.fullName.trim().charAt(0).toUpperCase()
    : "U";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-container)] cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 relative shadow-2xs overflow-hidden">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{userInitial}</span>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--primary-container)] ring-2 ring-white" />
        </div>

        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
            {profile?.fullName ?? "-"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
            {profile?.roleName ?? "-"}
          </span>
        </div>

        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-slate-600" : ""
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
          className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_36px_-12px_rgba(15,23,42,0.18)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Information Card */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {profile?.fullName ?? "-"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {profile?.email ?? "-"}
                </p>
              </div>
            </div>
            {profile?.roleName && (
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Role
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
                  {profile.roleName}
                </span>
              </div>
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
              className="flex items-center justify-between w-full h-10 px-3 rounded-xl bg-[var(--primary-container)]/10 hover:bg-[var(--primary-container)]/20 text-[var(--primary-container)] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 text-[var(--primary-container)]"
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
                className="w-3.5 h-3.5 text-[var(--primary-container)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
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
              className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <svg
                className="w-4 h-4 text-slate-400"
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
              className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <svg
                className="w-4 h-4 text-slate-400"
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
              className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4 text-rose-500"
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
