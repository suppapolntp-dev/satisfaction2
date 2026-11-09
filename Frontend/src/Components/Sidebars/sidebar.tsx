"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSidebarNav } from "./useSidebarNav";
import { useProfileMenu } from "./useProfileMenu";

// ==========================================================================
// ─── TYPES & NAV CONFIGURATION (Neo-Mint Design System)
// ==========================================================================

export type IconType =
  | "dashboard"
  | "notifications"
  | "brands"
  | "events"
  | "staff"
  | "access"
  | "roles"
  | "settings";

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  route: string;
  exact?: boolean;
  iconType: IconType;
  shortcut?: string;
}

export interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const DEFAULT_NAV_GROUPS: NavGroup[] = [
  {
    groupName: "Analytics & Monitoring",
    items: [
      {
        id: "dashboard",
        label: "Overview",
        shortLabel: "Overview",
        route: "/dashboard",
        exact: true,
        iconType: "dashboard",
        shortcut: "1",
      },
      {
        id: "notifications",
        label: "Notifications",
        shortLabel: "Alerts",
        route: "/notifications",
        iconType: "notifications",
        shortcut: "2",
      },
    ],
  },
  {
    groupName: "Operations & Structure",
    items: [
      {
        id: "brand",
        label: "Brand & Branch",
        shortLabel: "Brands",
        route: "/brand",
        iconType: "brands",
        shortcut: "3",
      },
      {
        id: "event",
        label: "Event & Campaigns",
        shortLabel: "Events",
        route: "/event",
        iconType: "events",
        shortcut: "4",
      },
    ],
  },
  {
    groupName: "Security & Governance",
    items: [
      {
        id: "usermanagement",
        label: "User Management",
        shortLabel: "Users",
        route: "/usermanagement",
        iconType: "staff",
        shortcut: "5",
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        shortLabel: "Roles",
        route: "/roles",
        iconType: "roles",
        shortcut: "6",
      },
      {
        id: "settings",
        label: "System Settings",
        shortLabel: "Settings",
        route: "/settings",
        iconType: "settings",
        shortcut: "7",
      },
    ],
  },
];

// ==========================================================================
// ─── NAV ICON RENDERER (Clean Crisp SVG)
// ==========================================================================

function NavIcon({
  iconType,
  isActive,
  isCollapsed,
}: {
  iconType: IconType;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center shrink-0 transition-all ${
        isCollapsed
          ? "w-5 h-5 text-current"
          : `w-8 h-8 rounded-xl ${
              isActive
                ? "bg-[var(--primary-container)] text-white shadow-[0_1px_3px_rgba(37,99,235,0.28)]"
                : "text-slate-500 group-hover:text-slate-900"
            }`
      }`}
    >
      {iconType === "dashboard" && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      )}
      {iconType === "notifications" && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      )}
      {iconType === "brands" && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )}
      {iconType === "events" && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )}
      {iconType === "staff" && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
        </svg>
      )}
      {iconType === "access" && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
      {iconType === "roles" && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )}
      {iconType === "settings" && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )}
    </div>
  );
}

// ==========================================================================
// ─── MAIN SIDEBAR COMPONENT
// ==========================================================================

export default function Sidebar() {
  const {
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileOpen,
    closeMobile,
    handleNavigate,
    isItemActive,
  } = useSidebarNav();

  const {
    isProfileOpen,
    profileRef,
    toggleProfile,
    closeProfile,
  } = useProfileMenu();

  // Keyboard shortcut (Ctrl+B for sidebar toggle, Escape for profile)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMeta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (isMeta && key === "b") {
        event.preventDefault();
        toggleSidebarCollapse();
      } else if (key === "escape") {
        closeProfile();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebarCollapse, closeProfile]);

  return (
    <>
      {/* Tooltip CSS for collapsed rail mode */}
      <style>{`
        .sidebar-rail [data-tip]::after {
          content: attr(data-tip);
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%) scale(0.95);
          padding: 5px 9px;
          border-radius: 8px;
          background: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease, transform 0.15s ease;
          z-index: 60;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
        }
        .sidebar-rail [data-tip]:hover::after {
          opacity: 1;
          transform: translateY(-50%) scale(1);
          transition-delay: 0.05s;
        }
      `}</style>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside Container */}
      <aside
        id="side"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 md:relative md:top-0 md:m-3 md:h-[calc(100dvh-24px)] flex flex-col bg-white border border-slate-200/80 rounded-3xl shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_6px_16px_-4px_rgba(15,23,42,0.04)] transition-[width,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] select-none md:translate-x-0 shrink-0 min-w-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          isSidebarCollapsed
            ? "sidebar-rail w-[72px] min-w-[72px] max-w-[72px] px-2 py-3"
            : "w-[264px] min-w-[264px] max-w-[264px] p-2.5"
        }`}
      >
        {/* Top & Navigation Section */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* 1. Header: Brand Logo & Collapse Toggle */}
          <div
            className={`h-12 flex items-center shrink-0 mb-2 ${
              isSidebarCollapsed ? "justify-center" : "justify-between px-1"
            }`}
          >
            {isSidebarCollapsed ? (
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="w-11 h-11 rounded-2xl bg-[var(--primary-container)] text-white flex items-center justify-center font-black shadow-sm shadow-blue-500/25 hover:shadow-md hover:scale-[1.03] transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-container)] cursor-pointer"
                data-tip="Expand sidebar (Ctrl+B)"
                aria-label="Expand sidebar"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </button>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 min-w-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-container)] rounded-xl px-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary-container)] text-white flex items-center justify-center font-black shrink-0 shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>

                  <div className="min-w-0 leading-tight">
                    <b className="block font-bold text-sm tracking-tight text-[#131b2e] truncate">
                      Satisfaction
                    </b>
                    <span className="text-[11px] text-slate-500 font-medium truncate block">
                      Enterprise Backoffice
                    </span>
                  </div>
                </Link>

                {/* Collapse Toggle Button */}
                <button
                  type="button"
                  onClick={toggleSidebarCollapse}
                  className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-container)] shrink-0 cursor-pointer"
                  aria-label="Collapse sidebar (Ctrl+B)"
                  title="Collapse sidebar (Ctrl+B)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <path d="M9 3v18" />
                    <path d="m14 9-3 3 3 3" />
                  </svg>
                </button>

                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={closeMobile}
                  className="md:hidden ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* 2. Navigation List */}
          <nav
            id="nav"
            className="relative flex-1 overflow-y-auto overflow-x-hidden space-y-2 mt-1 [scrollbar-width:thin]"
            aria-label="Main navigation links"
          >
            {DEFAULT_NAV_GROUPS.map((group) => (
              <div key={group.groupName} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <div className="h-6 px-3 flex items-center text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-2 mb-0.5">
                    {group.groupName}
                  </div>
                ) : (
                  <div className="h-px bg-slate-200/80 my-2 mx-1.5" />
                )}

                {group.items.map((item) => {
                  const active = isItemActive(item.route, item.exact);

                  if (isSidebarCollapsed) {
                    return (
                      <div key={item.id} className="relative">
                        <Link
                          href={item.route}
                          onClick={closeMobile}
                          data-tip={item.label}
                          className={`w-11 h-11 mx-auto rounded-2xl flex items-center justify-center transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 cursor-pointer ${
                            active
                              ? "bg-[var(--accent-bg)] text-[var(--primary-container)] shadow-[0_1px_3px_rgba(37,99,235,0.1),inset_0_0_0_1px_rgba(37,99,235,0.35)]"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                          }`}
                        >
                          <NavIcon
                            iconType={item.iconType}
                            isActive={active}
                            isCollapsed={true}
                          />
                        </Link>
                      </div>
                    );
                  }

                  return (
                    <div key={item.id} className="relative">
                      <Link
                        href={item.route}
                        onClick={closeMobile}
                        className={`group w-full h-10 px-1.5 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 cursor-pointer ${
                          active
                            ? "bg-[var(--accent-bg)]/70 text-[var(--primary-container)] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.3)] font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                        }`}
                      >
                        <NavIcon
                          iconType={item.iconType}
                          isActive={active}
                          isCollapsed={false}
                        />
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Section: Expand toggle & Profile Popover */}
        <div
          ref={profileRef}
          className="relative mt-auto pt-2 border-t border-slate-200/80 flex flex-col gap-1 shrink-0"
        >
          {isSidebarCollapsed ? (
            <>
              {/* Expand Sidebar Button in Rail Mode */}
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="w-11 h-11 mx-auto rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 cursor-pointer"
                data-tip="Expand sidebar (Ctrl+B)"
                aria-label="Expand sidebar"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M9 3v18" />
                  <path d="m12 9 3 3-3 3" />
                </svg>
              </button>

              {/* Profile Button Trigger in Rail Mode */}
              <button
                type="button"
                onClick={toggleProfile}
                className="w-11 h-11 mx-auto rounded-2xl flex items-center justify-center relative hover:bg-slate-100/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
                data-tip="Guy (SuperAdmin)"
                aria-haspopup="menu"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 relative shadow-2xs">
                  G
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-2 ring-white" />
                </div>
              </button>
            </>
          ) : (
            /* Profile Button Trigger in Expanded Mode */
            <button
              type="button"
              onClick={toggleProfile}
              className="w-full h-11 px-1.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 text-left cursor-pointer"
              aria-haspopup="menu"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 relative shadow-2xs">
                G
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--primary-container)] ring-2 ring-white" />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <b className="block font-semibold text-xs text-slate-900 truncate">
                  Guy Suppapol
                </b>
                <span className="text-[11px] text-slate-500 truncate block">
                  Lead Architect &middot; SuperAdmin
                </span>
              </div>
              <svg className="w-4 h-4 text-slate-400 mr-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
              </svg>
            </button>
          )}

          {/* Profile Popover */}
          {isProfileOpen && (
            <div
              className="absolute z-50 left-[calc(100%+12px)] bottom-0 w-60 p-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_36px_-12px_rgba(15,23,42,0.2)] animate-in fade-in zoom-in-95 duration-150"
              role="menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2.5 border-b border-slate-100 mb-1.5 text-xs text-slate-500">
                <b className="block font-semibold text-sm text-slate-900">Guy Suppapol</b>
                <span className="text-[11px] text-slate-400 truncate block">
                  guy@satisfaction.local
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate("/dashboard")}
                className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                role="menuitem"
              >
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                <span>Workspace Profile</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate("/test")}
                className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                role="menuitem"
              >
                <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                <span>Dev Playground</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate("/login")}
                className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                role="menuitem"
              >
                <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
