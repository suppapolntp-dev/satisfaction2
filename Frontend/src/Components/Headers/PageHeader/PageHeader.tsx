"use client";

import React from "react";
import HeaderBackButton, { HeaderBackButtonProps } from "../HeaderBackButton";
import FavoriteButton, { FavoriteButtonProps } from "../FavoriteButton";
import StatusBadge, { StatusBadgeProps, StatusBadgeVariant } from "../StatusBadge";
import ProgressBarBadge, { ProgressBarBadgeProps } from "../ProgressBarBadge";
import LastUpdatedBadge, { LastUpdatedBadgeProps } from "../LastUpdatedBadge";
import CollaboratorStack, { CollaboratorStackProps, CollaboratorUser } from "../CollaboratorStack";
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

  /** Optional back navigation trigger */
  showBack?: boolean;
  onBack?: () => void;
  backButtonProps?: Partial<HeaderBackButtonProps>;

  /** Favorite / Bookmark star state */
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;

  /** Details & Metadata Badges */
  description?: string | React.ReactNode;

  /** Status Badge */
  status?: {
    label: string;
    variant?: StatusBadgeVariant;
    dotColor?: string;
  };

  /** Progress Bar Indicator */
  progress?: {
    value: number;
    label?: string;
    color?: string;
  };

  /** Last Updated badge */
  lastUpdated?: string;

  /** Slot for custom metadata badges */
  customBadges?: React.ReactNode;

  /** Collaborator avatars */
  collaborators?: {
    label?: string;
    users: CollaboratorUser[];
    overflowCount?: number;
  };

  /** Action Buttons */
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
  showBack = false,
  onBack,
  backButtonProps,
  showFavorite = false,
  isFavorite,
  onToggleFavorite,
  description,
  status,
  progress,
  lastUpdated,
  customBadges,
  collaborators,
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
        {/* Left Side: Back Button + Title + Details */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0 w-full xl:w-auto">
          {showBack && (
            <HeaderBackButton onClick={onBack} {...backButtonProps} />
          )}

          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
            {showFavorite && (
              <FavoriteButton
                isFavorite={isFavorite}
                onToggle={onToggleFavorite}
              />
            )}
          </div>

          {status && (
            <StatusBadge
              label={status.label}
              variant={status.variant}
              dotColor={status.dotColor}
            />
          )}

          {progress && (
            <ProgressBarBadge
              value={progress.value}
              label={progress.label}
              barColor={progress.color}
            />
          )}

          {lastUpdated && <LastUpdatedBadge text={lastUpdated} />}

          {customBadges}

          {description && (
            <p className="w-full text-xs text-slate-500 mt-0.5 leading-relaxed hidden xl:block">
              {description}
            </p>
          )}
        </div>

        {/* Right Side: Collaborators & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full xl:w-auto justify-between xl:justify-end pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100">
          {collaborators && (
            <CollaboratorStack
              label={collaborators.label}
              users={collaborators.users}
              overflowCount={collaborators.overflowCount}
            />
          )}

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
                  ? "bg-[#006e2f] hover:bg-[#005a26] text-white shadow-xs"
                  : action.variant === "dark"
                  ? "bg-slate-900 hover:bg-slate-800 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white";

              return (
                <button
                  type="button"
                  onClick={action.onClick}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ${btnBg} active:scale-95 font-semibold text-xs sm:text-sm transition-all cursor-pointer select-none`}
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
