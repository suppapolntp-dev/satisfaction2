"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/Context/SidebarContext";
import { ApiModeProvider } from "@/Context/ApiModeContext";
import { ModalProvider } from "@/Context/ModalContext";
import Sidebar from "@/Components/Sidebars/sidebar";
import ProfileDropdown from "./ProfileDropdown";
import ApiModeToggle from "./ApiModeToggle";
import NavbarSearchDropdown from "./NavbarSearchDropdown";
import { useBreadcrumb } from "./useBreadcrumb";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutShellProps) {
  const { openMobile } = useSidebar();
  const activeBreadcrumb = useBreadcrumb();

  return (
    <div className="h-screen h-dvh flex overflow-hidden bg-[var(--background)] text-[var(--on-surface)] antialiased font-[var(--font-inter)]">
      {/* ─── 1. Floating Reusable Neo-Mint Sidebar ─── */}
      <Sidebar />

      {/* ─── 2. Responsive Main Workspace ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Floating Bento Top App Bar (Navbar) */}
        <header className="shrink-0 z-20 mx-3 mt-3 min-h-16 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_6px_16px_-4px_rgba(15,23,42,0.04)] px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors duration-200 motion-reduce:transition-none">
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            {/* Mobile Hamburger Toggle (44x44px touch target) */}
            <button
              type="button"
              onClick={openMobile}
              className="md:hidden min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer"
              aria-label="Open mobile navigation"
            >
              <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Dynamic Route Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <li className="text-slate-500 hidden sm:inline truncate">
                  {activeBreadcrumb.groupName}
                </li>
                <li aria-hidden="true" className="hidden sm:inline-flex items-center text-slate-400">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </li>
                <li aria-current="page" className="text-slate-900 font-bold truncate">
                  {activeBreadcrumb.pageLabel}
                </li>
              </ol>
            </nav>
          </div>

          {/* Center: Direct Inline Search Dropdown in Navbar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 flex justify-end sm:justify-center">
            <NavbarSearchDropdown />
          </div>

          {/* Header Right Profile & API Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <ApiModeToggle />
            <ProfileDropdown />
          </div>
        </header>

        {/* Dynamic Nested Content Outlet */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:thin]">
          <div className="w-full pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <ApiModeProvider>
      <SidebarProvider>
        <ModalProvider>
          <AdminLayoutInner>{children}</AdminLayoutInner>
        </ModalProvider>
      </SidebarProvider>
    </ApiModeProvider>
  );
}
