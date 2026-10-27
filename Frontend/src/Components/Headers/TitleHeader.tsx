"use client";

import React from "react";

export interface TitleHeaderProps {
  /**
   * Optional category or system badge text (e.g. "Satisfaction Console")
   * or a custom ReactNode badge component
   */
  badge?: React.ReactNode;

  /**
   * Optional SLA / benchmark / status text (e.g. "Customer Satisfaction Target: 90.0%")
   */
  slaText?: React.ReactNode;

  /**
   * Divider between badge and slaText (default: true)
   */
  badgeDivider?: boolean;

  /**
   * Icon element or Material Symbol name
   */
  icon?: React.ReactNode;

  /**
   * Background color class for the icon tile (default: "bg-[#006e2f]")
   */
  iconBgColor?: string;

  /**
   * Main title of the page or section
   */
  title: React.ReactNode;

  /**
   * Subtitle / description below the title
   */
  subtitle?: React.ReactNode;

  /**
   * Action buttons, dropdowns, filters, or toolbar controls rendered on the right side
   */
  actions?: React.ReactNode;

  /**
   * Alternative to actions slot (renders in the toolbar section if provided)
   */
  children?: React.ReactNode;

  /**
   * Additional custom CSS classes for the card container
   */
  className?: string;
}

/**
 * TitleHeader Component
 * 
 * Reusable Card-based Page Header Component adhering to Neo-Mint / Clean SaaS standards.
 * Wraps title, badge metadata, and action toolbars inside an elevated card container.
 */
export default function TitleHeader({
  badge,
  slaText,
  badgeDivider = true,
  icon,
  iconBgColor = "bg-[#006e2f]",
  title,
  subtitle,
  actions,
  children,
  className = "",
}: TitleHeaderProps) {
  const toolbarContent = actions || children;

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-5 transition-all ${className}`}
    >
      {/* ─── Left Column: Badge, Title & Subtitle ─── */}
      <div className="flex-1 min-w-0">
        {(badge || slaText) && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {badge && (
              typeof badge === "string" ? (
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006e2f] border border-emerald-200/80 shadow-2xs">
                  {badge}
                </span>
              ) : (
                badge
              )
            )}
            {badge && slaText && badgeDivider && (
              <span className="text-[10px] font-semibold text-slate-300 select-none">|</span>
            )}
            {slaText && (
              typeof slaText === "string" ? (
                <span className="text-[11px] font-medium text-slate-500">
                  {slaText}
                </span>
              ) : (
                slaText
              )
            )}
          </div>
        )}

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          {icon && (
            <div
              className={`w-8 h-8 rounded-xl ${iconBgColor} text-white flex items-center justify-center shadow-xs shrink-0`}
            >
              {typeof icon === "string" ? (
                <span className="text-sm font-bold">{icon}</span>
              ) : (
                icon
              )}
            </div>
          )}
          <span className="truncate">{title}</span>
        </h1>

        {subtitle && (
          typeof subtitle === "string" ? (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {subtitle}
            </p>
          ) : (
            subtitle
          )
        )}
      </div>

      {/* ─── Right Column: Actions / Toolbar Controls ─── */}
      {toolbarContent && (
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto mt-1 xl:mt-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100">
          {toolbarContent}
        </div>
      )}
    </div>
  );
}
