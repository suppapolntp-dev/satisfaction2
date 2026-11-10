"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/Context/SidebarContext";
import { ApiModeProvider } from "@/Context/ApiModeContext";
import { ModalProvider } from "@/Context/ModalContext";
import Sidebar from "@/Components/Sidebars/sidebar";
import ProfileDropdown from "./ProfileDropdown";
import NavbarSearchDropdown from "./NavbarSearchDropdown";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutShellProps) {
  const { openMobile } = useSidebar();

  return (
    <div className="h-screen h-dvh flex overflow-hidden bg-[var(--background)] text-[var(--on-surface)] antialiased font-[var(--font-inter)]">
      {/* ─── 1. Floating Reusable Neo-Mint Sidebar ─── */}
      <Sidebar />

      {/* ─── 2. Responsive Main Workspace ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Floating Bento Top App Bar (Navbar - Figma Node 31:2) */}
        <header
          id="mainNavbar"
          className="shrink-0 z-40 mx-3 mt-3 sm:mx-6 sm:mt-4 h-16 bg-white/95 backdrop-blur-[12px] border border-slate-200/80 rounded-[24px] shadow-figma-navbar px-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-200 motion-reduce:transition-none"
        >
          {/* Left: Mobile Toggle (sm screens) + Search Bar Pill (Figma Node 31:18) */}
          <div className="flex items-center gap-3 flex-1 max-w-[448px] min-w-0">
            {/* Mobile Hamburger Toggle (44x44px touch target) */}
            <button
              type="button"
              onClick={openMobile}
              className="md:hidden min-w-10 min-h-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer shrink-0"
              aria-label="Open mobile navigation"
            >
              <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Search Bar Pill & Spotlight Command Palette */}
            <NavbarSearchDropdown className="flex-1" />
          </div>

          {/* Right: User Account Menu Button (Figma Node 31:33) */}
          <div className="relative shrink-0">
            <ProfileDropdown />
          </div>
        </header>

        {/* Dynamic Nested Content Outlet */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 [scrollbar-width:thin]">
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
