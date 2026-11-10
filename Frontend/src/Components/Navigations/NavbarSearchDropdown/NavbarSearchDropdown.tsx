"use client";

import React from "react";
import { NavbarSearchDropdownProps } from "./types";
import { useNavbarSearchDropdown } from "./useNavbarSearchDropdown";

export default function NavbarSearchDropdown({
  className = "",
  placeholder = "Search pages, actions, modules...",
}: NavbarSearchDropdownProps) {
  const {
    isOpen,
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    containerRef,
    inputRef,
    filteredActions,
    handleNavigate,
    handleInputKeyDown,
    handleClear,
    openSpotlightSearch,
    closeSpotlightSearch,
  } = useNavbarSearchDropdown();

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {/* ─── Left Search Bar Pill (Figma Node 31:18) ─── */}
      <div
        onClick={openSpotlightSearch}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openSpotlightSearch();
          }
        }}
        className="group w-full h-10 bg-[#f1f5f9]/90 hover:bg-[#f1f5f9] border border-[#e1e8f0]/90 hover:border-blue-300 rounded-full px-3.5 flex items-center justify-between gap-2.5 cursor-pointer transition-all shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
        role="button"
        tabIndex={0}
        aria-label={placeholder}
      >
        {/* Search Icon (Figma Node 31:19) */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <svg
            className="w-4 h-4 text-[#90a1b9] group-hover:text-blue-600 transition-colors shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {/* Search Placeholder (Figma Node 31:23) */}
          <span className="text-[12px] font-medium text-[#90a1b9] group-hover:text-slate-600 truncate transition-colors select-none">
            {placeholder}
          </span>
        </div>

        {/* Kbd Badge (Figma Node 31:25) */}
        <div className="bg-white border border-[#e2e8f0]/90 shadow-2xs rounded px-1.5 py-0.5 shrink-0 flex items-center">
          <kbd className="font-mono text-[10px] font-semibold text-[#62748e] tracking-tight">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* ─── Spotlight Command Palette Search Modal (Figma Modal) ─── */}
      {isOpen && (
        <div
          id="spotlightModal"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 sm:pt-24 px-4 animate-in fade-in duration-150"
          onClick={closeSpotlightSearch}
          role="dialog"
          aria-modal="true"
          aria-label="Spotlight Command Search"
        >
          <div
            className="bg-white w-full max-w-xl rounded-2xl shadow-spotlight border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-slate-400 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                id="spotlightSearchInput"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="ค้นหาหน้า, แอ็กชัน, สาขา หรือโมดูล..."
                className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800 bg-transparent font-medium"
                autoFocus
                aria-autocomplete="list"
              />
              {query ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Clear search input"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
                  ESC
                </kbd>
              )}
            </div>

            {/* Search List & Suggested Navigation */}
            <div className="p-2 space-y-1 text-xs max-h-[60vh] overflow-y-auto [scrollbar-width:thin]">
              {!query.trim() && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Suggested Navigation
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/notifications")}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left text-slate-700 transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <svg
                        className="w-4 h-4 text-blue-500 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        Notification &amp; Alert Triage
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      Jump to
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/satisfaction")}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left text-slate-700 transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <svg
                        className="w-4 h-4 text-emerald-500 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M7 7h10M7 12h10M7 17h10" />
                      </svg>
                      <span className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                        Branch Satisfaction Kiosk Feed
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      Jump to
                    </span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    All Available Pages &amp; Modules
                  </div>
                </>
              )}

              {filteredActions.map((action, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={action.id || action.route}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleNavigate(action.route)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 text-blue-900 font-semibold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <svg
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? "text-blue-600" : "text-slate-400"
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-slate-400 font-medium truncate">
                          {action.groupName}
                        </span>
                        <span className="text-xs truncate font-medium text-slate-900">
                          {action.itemName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">Jump to</span>
                      <kbd className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono shadow-2xs">
                        {action.shortcut}
                      </kbd>
                    </div>
                  </button>
                );
              })}

              {filteredActions.length === 0 && (
                <div className="p-6 text-center flex flex-col items-center gap-2">
                  <p className="text-xs font-medium text-slate-500">
                    ไม่พบหน้าหรือแอ็กชันที่ตรงกับคำค้นหา
                  </p>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    ล้างการค้นหา
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
