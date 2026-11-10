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
    isMobileExpanded,
    containerRef,
    inputRef,
    mobileInputRef,
    filteredActions,
    handleNavigate,
    handleInputKeyDown,
    handleFocus,
    handleClear,
    toggleMobileSearch,
  } = useNavbarSearchDropdown();

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* ─── Desktop Search Input Bar ─── */}
      <div className="hidden sm:relative sm:flex sm:items-center w-full">
        <div
          className={`flex items-center gap-2.5 w-full min-h-10 px-3.5 rounded-full border transition-all duration-200 motion-reduce:transition-none ${
            isOpen
              ? "bg-white border-slate-300 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.08)] ring-2 ring-[var(--primary-container)]/15"
              : "bg-slate-100/90 border-slate-200/80 hover:bg-slate-200/70 hover:border-slate-300/80"
          }`}
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-slate-500 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            className="w-full bg-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />

          {query ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search input"
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors duration-150 cursor-pointer shrink-0"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <span className="hidden md:flex items-center gap-1 shrink-0">
              <kbd className="font-sans text-[10px] font-semibold text-slate-500 border border-slate-200/90 bg-white rounded px-1.5 py-0.5 shadow-2xs">
                Ctrl K
              </kbd>
            </span>
          )}
        </div>
      </div>

      {/* ─── Mobile Search Trigger Button ─── */}
      <div className="sm:hidden flex justify-end">
        <button
          type="button"
          onClick={toggleMobileSearch}
          aria-expanded={isMobileExpanded}
          aria-label="Toggle search dropdown"
          className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] cursor-pointer"
        >
          <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>

      {/* ─── Mobile Search Input Drawer (appears right below navbar, no full-screen modal) ─── */}
      {isMobileExpanded && (
        <div className="sm:hidden absolute top-full left-0 right-0 mt-2 z-50 p-2 bg-white border border-slate-200 rounded-2xl shadow-[0_12px_32px_-4px_rgba(15,23,42,0.16)]">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
            <svg aria-hidden="true" className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={mobileInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={placeholder}
              aria-label={placeholder}
              className="w-full bg-transparent outline-none text-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear mobile search"
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── The Direct Dropdown Menu (Inline Popover under Search Bar) ─── */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Navigation search results"
          className="absolute left-0 right-0 top-full mt-2 sm:mt-1.5 w-full bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_36px_-6px_rgba(15,23,42,0.14)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 motion-reduce:animate-none"
        >
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5 [scrollbar-width:thin]">
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
                  className={`w-full min-h-10 px-3 py-2 rounded-xl flex items-center justify-between text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer ${
                    isSelected
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      {action.groupName}
                    </span>
                    <span className="text-xs truncate font-medium">
                      {action.itemName}
                    </span>
                  </div>

                  <kbd className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono shrink-0 shadow-2xs">
                    {action.shortcut}
                  </kbd>
                </button>
              );
            })}

            {filteredActions.length === 0 && (
              <div className="p-5 text-center flex flex-col items-center gap-2">
                <p className="text-xs font-medium text-slate-500">
                  No matching pages or actions found.
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--accent-bg)] transition-colors duration-150 cursor-pointer"
                >
                  Reset search
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
