"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/Context/SidebarContext";
import Sidebar from "@/Components/Sidebars/Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import { useCommandPalette } from "./useCommandPalette";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutShellProps) {
  const { openMobile } = useSidebar();
  const {
    isPaletteOpen,
    paletteQuery,
    setPaletteQuery,
    paletteInputRef,
    filteredPaletteActions,
    handleNavigate,
    handleOpenSearch,
    handleCloseSearch,
  } = useCommandPalette();

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--on-surface)] antialiased font-[var(--font-inter)]">
      {/* ─── 1. Floating Reusable Neo-Mint Sidebar ─── */}
      <Sidebar />

      {/* ─── 2. Responsive Main Workspace ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Floating Bento Top App Bar */}
        <header className="sticky top-3 z-30 mx-3 mt-3 h-16 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_6px_16px_-4px_rgba(15,23,42,0.04)] px-4 sm:px-6 flex items-center justify-between gap-3 transition-all">
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={openMobile}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-container)] cursor-pointer"
              aria-label="Open mobile navigation"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-slate-400 hidden sm:inline">Satisfaction</span>
              <svg className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
              <span className="text-slate-900 font-bold">Dashboard &amp; Operations</span>
            </div>
          </div>

          {/* Center: Search Trigger in Navbar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <button
              type="button"
              onClick={handleOpenSearch}
              className="hidden sm:flex items-center gap-2.5 w-full h-10 px-3.5 bg-slate-100/90 hover:bg-slate-200/70 rounded-full text-slate-500 hover:text-slate-900 transition-colors shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)] text-xs font-medium cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="truncate">Search pages, actions, modules...</span>
              <span className="ml-auto flex items-center gap-1">
                <kbd className="font-sans text-[10px] font-medium text-slate-400 border border-slate-200/90 bg-white/90 rounded px-1.5 py-0.5 shadow-2xs">
                  Ctrl K
                </kbd>
              </span>
            </button>

            <button
              type="button"
              onClick={handleOpenSearch}
              className="sm:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-container)] cursor-pointer"
              aria-label="Search"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>

          {/* Header Right Profile Actions */}
          <div className="flex items-center shrink-0">
            <ProfileDropdown />
          </div>
        </header>

        {/* Dynamic Nested Content Outlet */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Command Palette Overlay */}
      {isPaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={handleCloseSearch}
        >
          <div
            className="w-[min(540px,92vw)] bg-white border border-slate-200 rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-slate-200 px-4 flex items-center">
              <svg className="w-5 h-5 text-slate-400 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={paletteInputRef}
                type="text"
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Search pages and quick actions..."
                className="w-full h-14 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400 font-medium"
              />
              {paletteQuery && (
                <button
                  type="button"
                  onClick={() => setPaletteQuery("")}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filteredPaletteActions.map((action) => (
                <div
                  key={action.label}
                  onClick={() => handleNavigate(action.route)}
                  className="flex items-center justify-between h-10 px-3 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <span>{action.label}</span>
                  <kbd className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                    {action.shortcut}
                  </kbd>
                </div>
              ))}
              {filteredPaletteActions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">No results found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <SidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
  );
}
