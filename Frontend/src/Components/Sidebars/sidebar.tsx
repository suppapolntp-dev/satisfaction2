"use client";

import React from "react";
import { useSidebarNav } from "./useSidebarNav";

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
  | "audit"
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
        id: "audit",
        label: "Audit Trail",
        shortLabel: "Audit",
        route: "/audit",
        iconType: "audit",
        shortcut: "7",
      },
      {
        id: "settings",
        label: "System Settings",
        shortLabel: "Settings",
        route: "/settings",
        iconType: "settings",
        shortcut: "8",
      },
    ],
  },
];

// ==========================================================================
// ─── SKELETON SIDEBAR COMPONENT (Step 1 Clean Baseline)
// ==========================================================================

export default function Sidebar() {
  const {
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileOpen,
    closeMobile,
  } = useSidebarNav();

  return (
    <>
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
            ? "w-[72px] min-w-[72px] max-w-[72px] px-2 py-3"
            : "w-[264px] min-w-[264px] max-w-[264px] p-3"
        }`}
      >
        {/* Step 1 Skeleton Header */}
        <div
          className={`h-12 flex items-center shrink-0 mb-3 border-b border-slate-100 ${
            isSidebarCollapsed ? "justify-center" : "justify-between px-2"
          }`}
        >
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            S
          </button>

          {!isSidebarCollapsed && (
            <div className="flex-1 ml-3 min-w-0">
              <span className="block font-bold text-sm text-slate-800 truncate">
                Satisfaction
              </span>
              <span className="block text-[11px] text-slate-400 font-medium truncate">
                Backoffice
              </span>
            </div>
          )}
        </div>

        {/* Step 1 Skeleton Body Placeholder */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse mb-2" />
          {!isSidebarCollapsed && (
            <p className="text-xs text-slate-400 font-medium">
              Sidebar Skeleton Ready
              <br />
              <span className="text-[10px] text-slate-300">
                (Waiting for Step 2)
              </span>
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
