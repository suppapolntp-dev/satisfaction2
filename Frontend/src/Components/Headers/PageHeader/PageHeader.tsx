"use client";

import React from "react";
import HeaderTabs, { HeaderTabsProps, HeaderTabItem } from "./HeaderTabs";

export { HeaderTabs };
export type { HeaderTabsProps, HeaderTabItem };

export interface PrimaryActionConfig {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "emerald" | "dark";
}

export interface PageHeaderProps {
  /** Page / Project Title */
  title: string | React.ReactNode;

  /** Details & Metadata description */
  description?: string | React.ReactNode;

  /** Custom badges or status elements rendered next to title */
  badges?: React.ReactNode;

  /** Action Buttons or right-side toolbar */
  primaryAction?: PrimaryActionConfig | React.ReactNode;
  secondaryActions?: React.ReactNode;

  /** Sub-Navigation Tabs */
  tabs?: HeaderTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  className?: string;
}

export default function PageHeader({
  title,
  description,
  badges,
  primaryAction,
  secondaryActions,
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] transition-all overflow-hidden ${className}`}
    >
      {/* ─── 1. TOP TIER: Identity, Metadata & Actions ─── */}
      <div className="p-4 sm:p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Left Side: Title + Badges + Description */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0 w-full xl:w-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
          </div>

          {badges}

          {description && (
            <p className="w-full text-xs text-slate-500 mt-0.5 leading-relaxed hidden xl:block">
              {description}
            </p>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full xl:w-auto justify-between xl:justify-end pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100">
          {secondaryActions && (
            <div className="flex items-center gap-2">{secondaryActions}</div>
          )}

          {(() => {
            if (!primaryAction) return null;
            if (React.isValidElement(primaryAction)) return primaryAction;
            if (typeof primaryAction === "object" && "label" in primaryAction) {
              const action = primaryAction as PrimaryActionConfig;
              const btnBg =
                action.variant === "emerald" || !action.variant
                  ? "bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white shadow-xs"
                  : action.variant === "dark"
                  ? "bg-slate-900 hover:bg-slate-800 text-white"
                  : "bg-slate-700 hover:bg-slate-800 text-white";

              return (
                <button
                  type="button"
                  onClick={action.onClick}
                  className={`inline-flex items-center justify-center gap-2 px-4 min-h-11 sm:min-h-10 rounded-full ${btnBg} active:scale-95 font-semibold text-xs sm:text-sm transition-all duration-200 motion-reduce:transition-none motion-reduce:active:scale-100 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]`}
                >
                  {action.icon}
                  <span className="font-medium">{action.label}</span>
                </button>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Description for mobile/smaller screens */}
      {description && (
        <div className="px-4 pb-3 sm:px-5 xl:hidden text-xs text-slate-500 border-t border-slate-100 pt-2">
          {description}
        </div>
      )}

      {/* ─── 2. BOTTOM TIER: Sub-Navigation Tabs ─── */}
      {tabs && tabs.length > 0 && (
        <HeaderTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}
    </header>
  );
}
