"use client";

import React from "react";

export interface HeaderTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface HeaderTabsProps {
  tabs: HeaderTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export default function HeaderTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: HeaderTabsProps) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className={`px-4 sm:px-6 border-t border-slate-100 bg-slate-50/50 ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto [scrollbar-width:none] pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? "text-[var(--primary-container)] border-[var(--primary-container)] font-bold"
                  : "text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-300"
              }`}
            >
              {tab.icon && (
                <span className={isActive ? "text-[var(--primary-container)]" : "text-slate-400"}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? "bg-[var(--accent-bg)] text-[var(--primary-container)]"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
