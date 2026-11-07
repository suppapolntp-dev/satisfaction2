"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/Context/SidebarContext";
import { ApiModeProvider } from "@/Context/ApiModeContext";
import { ModalProvider } from "@/Context/ModalContext";
import Sidebar from "@/Components/Sidebars/Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import ApiModeToggle from "./ApiModeToggle";
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
    activeBreadcrumb,
    filteredPaletteActions,
    handleNavigate,
    handleInputKeyDown,
    handleOpenSearch,
    handleCloseSearch,
  } = useCommandPalette();

  // ponytail: Enter selects the first command-palette match; add roving ArrowUp/ArrowDown index only if power-user keyboard nav is requested.
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

          {/* Center: Search Trigger in Navbar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 flex justify-end sm:justify-center">
            <button
              type="button"
              onClick={handleOpenSearch}
              aria-keyshortcuts="Control+K Meta+K"
              className="hidden sm:flex items-center gap-2.5 w-full min-h-11 sm:min-h-10 px-4 bg-slate-100/90 hover:bg-slate-200/70 rounded-full text-slate-600 hover:text-slate-900 transition-colors duration-200 motion-reduce:transition-none shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer"
            >
              <svg aria-hidden="true" className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="truncate">Search pages, actions, modules...</span>
              <span className="ml-auto flex items-center gap-1 shrink-0">
                <kbd className="font-sans text-[10px] font-semibold text-slate-500 border border-slate-200/90 bg-white rounded px-1.5 py-0.5 shadow-2xs">
                  Ctrl K
                </kbd>
              </span>
            </button>

            <button
              type="button"
              onClick={handleOpenSearch}
              className="sm:hidden min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer"
              aria-label="Open quick search"
            >
              <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
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

      {/* Global Command Palette Overlay */}
      {isPaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-150 motion-reduce:animate-none"
          onClick={handleCloseSearch}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Quick navigation command palette"
            className="w-[min(540px,92vw)] bg-white border border-slate-200 rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-slate-200 px-4 flex items-center gap-2">
              <svg aria-hidden="true" className="w-5 h-5 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={paletteInputRef}
                type="text"
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                aria-label="Search pages and quick actions"
                placeholder="Search pages and quick actions..."
                className="w-full h-14 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400 font-medium"
              />
              {paletteQuery && (
                <button
                  type="button"
                  onClick={() => setPaletteQuery("")}
                  className="min-h-9 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filteredPaletteActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleNavigate(action.route)}
                  className="w-full min-h-11 px-3 rounded-xl flex items-center justify-between text-left text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer"
                >
                  <span className="truncate pr-2">{action.label}</span>
                  <kbd className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono shrink-0">
                    {action.shortcut}
                  </kbd>
                </button>
              ))}
              {filteredPaletteActions.length === 0 && (
                <div className="p-6 text-center flex flex-col items-center gap-2">
                  <p className="text-xs font-medium text-slate-500">
                    No matching pages or actions found.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPaletteQuery("")}
                    className="min-h-9 px-3 rounded-lg text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--accent-bg)] transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer"
                  >
                    Reset search
                  </button>
                </div>
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
    <ApiModeProvider>
      <SidebarProvider>
        <ModalProvider>
          <AdminLayoutInner>{children}</AdminLayoutInner>
        </ModalProvider>
      </SidebarProvider>
    </ApiModeProvider>
  );
}
