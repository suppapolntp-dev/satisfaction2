"use client";

import React, { useState, useRef, useEffect } from "react";
import { PermissionRow, PermissionKey } from "@/Types/role";
import { useRolePermissionTable, PermissionSortField } from "./useRolePermissionTable";

export interface RolePermissionTableProps {
  permissionData: PermissionRow[];
  onPermissionChange: (identifier: string, permissionField: PermissionKey) => void;
  isLoading?: boolean;
  isSaving?: boolean;
  readOnly?: boolean;
  roleName?: string;
  roleCode?: string;
  isSystemDefault?: boolean;
  onToggleAll?: (checked: boolean) => void;
  onResetDefault?: () => void;
  onSave?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

function SortHeaderCell({
  label,
  field,
  activeField,
  direction,
  onSort,
  align = "center",
  widthClass = "",
}: {
  label: string;
  field: PermissionSortField;
  activeField: PermissionSortField;
  direction: "asc" | "desc";
  onSort: (field: PermissionSortField) => void;
  align?: "left" | "right" | "center";
  widthClass?: string;
}) {
  const isActive = activeField === field;
  const alignmentClass =
    align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";

  return (
    <th
      scope="col"
      className={`py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none cursor-pointer hover:text-slate-700 transition-colors ${
        align === "left" ? "px-6 text-left" : "px-4 text-center"
      } ${widthClass}`}
      onClick={() => onSort(field)}
    >
      <div className={`inline-flex items-center gap-1.5 ${alignmentClass}`}>
        <span>{label}</span>
        <span
          className={`transition-opacity ${
            isActive ? "opacity-100 text-blue-600" : "opacity-30"
          }`}
        >
          {isActive && direction === "desc" ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m18 15-6-6-6 6" />
            </svg>
          )}
        </span>
      </div>
    </th>
  );
}

// Helper to parse module name into Title and Thai description
function parseModuleLabel(label: string, fallbackDesc?: string) {
  const match = label.match(/^([^(]+)(?:\s*\((.*)\))?$/);
  if (match) {
    const title = match[1].trim();
    const desc = match[2]?.trim() || fallbackDesc;
    return { title, desc: desc ? `(${desc})` : "" };
  }
  return { title: label, desc: fallbackDesc ? `(${fallbackDesc})` : "" };
}

// Icon helper per module
function getModuleIcon(moduleId?: string, moduleName?: string) {
  const str = `${moduleId || ""} ${moduleName || ""}`.toLowerCase();
  if (str.includes("dashboard") || str.includes("แดชบอร์ด")) {
    return (
      <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    );
  }
  if (str.includes("event") || str.includes("ปฏิทิน") || str.includes("แคมเปญ")) {
    return (
      <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  if (str.includes("satisfaction") || str.includes("โหวต") || str.includes("พึงพอใจ")) {
    return (
      <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    );
  }
  if (str.includes("brand") || str.includes("แบรนด์") || str.includes("สาขา")) {
    return (
      <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }
  if (str.includes("user") || str.includes("ผู้ใช้")) {
    return (
      <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (str.includes("role") || str.includes("บทบาท") || str.includes("สิทธิ์")) {
    return (
      <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (str.includes("audit") || str.includes("ประวัติ")) {
    return (
      <svg className="w-4 h-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function RolePermissionTable({
  permissionData = [],
  onPermissionChange,
  isLoading = false,
  isSaving = false,
  readOnly = false,
  roleName = "Brand Manager",
  roleCode,
  isSystemDefault = false,
  onToggleAll,
  onResetDefault,
  onSave,
  searchQuery: externalSearchQuery,
  className = "",
}: RolePermissionTableProps) {
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  const kebabRef = useRef<HTMLDivElement>(null);

  const {
    filteredPermissions,
    totalItems,
    permissionFieldKeys,
    searchQuery,
    handleSearchChange,
    handleResetFilters,
    sortField,
    sortDirection,
    handleSort,
    expandedRows,
    toggleExpand,
    expandAll,
    collapseAll,
    isAllExpanded,
    totalAvailablePermissions,
    grantedPermissionsCount,
    totalFeatures,
  } = useRolePermissionTable({
    permissionData,
    searchQuery: externalSearchQuery,
  });

  // Handle click outside to close the kebab dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (kebabRef.current && !kebabRef.current.contains(event.target as Node)) {
        setIsKebabOpen(false);
      }
    }
    if (isKebabOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isKebabOpen]);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {/* ─── 1. HEADER: ROLE INFO & SAVE BUTTON ─── */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
            <svg
              className="w-5 h-5 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-800 leading-snug">
                สิทธิ์การใช้งาน: <span className="text-blue-600 font-bold">{roleName}</span>
              </h1>
              {isSystemDefault && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                  System Default
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              กำหนดสิทธิ์ระดับหมวดหมู่และเจาะลึกฟังก์ชันย่อย
            </p>
          </div>
        </div>

        {/* Primary Save Button */}
        {onSave && (
          <button
            type="button"
            disabled={isSaving || readOnly}
            onClick={onSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 self-end sm:self-auto"
          >
            {isSaving ? (
              <span>กำลังบันทึก...</span>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Save Permissions</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* ─── 2. TOOLBAR: PILL SEARCH & KEBAB MENU ─── */}
      <div className="px-5 sm:px-6 pb-4 flex items-center justify-between gap-3">
        {/* Pill Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by module, feature (e.g. filter, timeline)..."
            className="w-full px-5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* 3-Dot Kebab Menu (Select All, Clear All, Reset Default, Expand/Collapse) */}
        <div className="relative inline-block text-left" ref={kebabRef}>
          <button
            type="button"
            onClick={() => setIsKebabOpen(!isKebabOpen)}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-lg leading-none shadow-2xs"
            aria-label="More options"
            aria-expanded={isKebabOpen}
          >
            ⋮
          </button>

          {isKebabOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
              {onToggleAll && (
                <>
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => {
                      setIsKebabOpen(false);
                      onToggleAll(true);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>เลือกเปิดสิทธิ์ทั้งหมด</span>
                  </button>
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => {
                      setIsKebabOpen(false);
                      onToggleAll(false);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>ล้างสิทธิ์ทั้งหมด</span>
                  </button>
                </>
              )}

              {onResetDefault && (
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => {
                    setIsKebabOpen(false);
                    onResetDefault();
                  }}
                  className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100"
                >
                  <span>คืนค่าสิทธิ์เริ่มต้น</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsKebabOpen(false);
                  if (isAllExpanded) {
                    collapseAll();
                  } else {
                    expandAll();
                  }
                }}
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100"
              >
                <span>{isAllExpanded ? "ยุบทุกหมวดหมู่ (Collapse)" : "ขยายทุกหมวดหมู่ (Expand)"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── 3. TREE PERMISSIONS TABLE CONTENT ─── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-t border-b border-slate-200/80 bg-white">
              <SortHeaderCell
                label="MODULE / FEATURE"
                field="module"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="left"
                widthClass="w-[45%]"
              />
              <SortHeaderCell
                label="VIEW"
                field="view"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
                widthClass="w-[11%]"
              />
              <SortHeaderCell
                label="CREATE"
                field="create"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
                widthClass="w-[11%]"
              />
              <SortHeaderCell
                label="UPDATE"
                field="update"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
                widthClass="w-[11%]"
              />
              <SortHeaderCell
                label="DELETE"
                field="delete"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
                widthClass="w-[11%]"
              />
              <SortHeaderCell
                label="EXPORT"
                field="export"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
                widthClass="w-[11%]"
              />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {/* Loading Skeleton */}
            {isLoading && (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`perm-skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-slate-200 rounded" />
                        <div className="w-48 h-3.5 bg-slate-200 rounded" />
                      </div>
                    </td>
                    {Array.from({ length: 5 }).map((__, colIdx) => (
                      <td key={`col-skel-${colIdx}`} className="px-4 py-4 text-center">
                        <div className="w-16 h-3 bg-slate-200 rounded-full mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}

            {/* Empty State */}
            {!isLoading && filteredPermissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {searchQuery ? "ไม่พบโมดูลหรือฟังก์ชันที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลสิทธิ์ในบทบาทนี้"}
                    </p>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                      >
                        ล้างคำค้นหา
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading &&
              filteredPermissions.map((parentRow) => {
                const parentKey = parentRow.id || parentRow.module;
                const isExpanded = expandedRows[parentKey] !== false;
                const children = parentRow.children || [];
                const hasChildren = children.length > 0;
                const { title: parentTitle, desc: parentDesc } = parseModuleLabel(parentRow.module, parentRow.description);

                return (
                  <React.Fragment key={`parent-${parentKey}`}>
                    {/* ─── PARENT MODULE ROW ─── */}
                    <tr className="bg-white hover:bg-slate-50/60 transition-colors border-t border-slate-100">
                      {/* Parent Module Label */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          {/* Chevron Toggle Button */}
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(parentKey)}
                              className="w-5 h-5 rounded flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                              aria-label={isExpanded ? "Collapse module" : "Expand module"}
                            >
                              <svg
                                className={`w-3 h-3 text-blue-600 transition-transform duration-150 ${
                                  isExpanded ? "rotate-0" : "-rotate-90"
                                }`}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 15.5l-6-7h12l-6 7z" />
                              </svg>
                            </button>
                          ) : (
                            <div className="w-5 shrink-0" />
                          )}

                          {/* Module Category Icon */}
                          <div className="w-5 h-5 flex items-center justify-center shrink-0">
                            {getModuleIcon(parentRow.id, parentRow.module)}
                          </div>

                          {/* Module Title & Thai Description */}
                          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {parentTitle}
                            </span>
                            {parentDesc && (
                              <span className="font-normal text-slate-400 text-xs">
                                {parentDesc}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Parent Aggregated Checkboxes */}
                      {permissionFieldKeys.map((permissionKey) => {
                        let isAllChecked = false;
                        let isIndeterminate = false;

                        if (hasChildren) {
                          const checkedCount = children.filter((c) => Boolean(c[permissionKey])).length;
                          isAllChecked = checkedCount === children.length && children.length > 0;
                          isIndeterminate = checkedCount > 0 && checkedCount < children.length;
                        } else {
                          isAllChecked = Boolean(parentRow[permissionKey]);
                        }

                        return (
                          <td key={`parent-col-${permissionKey}`} className="px-4 py-3 text-center align-middle">
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={isIndeterminate ? "mixed" : isAllChecked}
                                aria-label={`Toggle all ${permissionKey} for ${parentTitle}`}
                                disabled={readOnly}
                                onClick={() => onPermissionChange(parentKey, permissionKey)}
                                title={
                                  isAllChecked
                                    ? `คลิกเพื่อปิดสิทธิ์ ${permissionKey} ทั้งหมดในหมวดนี้`
                                    : `คลิกเพื่อเปิดสิทธิ์ ${permissionKey} ทั้งหมดในหมวดนี้`
                                }
                                className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-[4px] flex items-center justify-center transition-all cursor-pointer ${
                                  isAllChecked
                                    ? "bg-blue-600 text-white shadow-2xs hover:bg-blue-700"
                                    : isIndeterminate
                                    ? "bg-blue-100 border border-blue-300 text-blue-600 hover:bg-blue-200 font-bold"
                                    : "bg-white border-2 border-slate-300 hover:border-slate-400"
                                } ${readOnly ? "opacity-50 cursor-not-allowed" : "active:scale-90"}`}
                              >
                                {isAllChecked && (
                                  <svg
                                    className="w-3 h-3 text-white stroke-[2.5]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                                {isIndeterminate && (
                                  <svg
                                    className="w-3 h-3 text-blue-600 stroke-[3]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* ─── CHILD SUB-FEATURE ROWS ─── */}
                    {isExpanded &&
                      children.map((childRow, childIndex) => {
                        const childKey = childRow.id || childRow.module;
                        const isLastChild = childIndex === children.length - 1;

                        return (
                          <tr
                            key={`child-${childKey}`}
                            className="bg-white hover:bg-slate-50/70 transition-colors group"
                          >
                            {/* Child Feature Label with Tree Indentation */}
                            <td className="py-2.5 pl-10 pr-4 sm:pl-12">
                              <div className="flex items-center gap-1.5">
                                {/* Tree branch symbol */}
                                <span className="font-mono text-slate-300 text-xs select-none mr-1.5">
                                  {isLastChild ? "└─" : "├─"}
                                </span>
                                <span className="font-bold text-slate-800 text-xs sm:text-[13px]">
                                  {childRow.module}
                                </span>
                                {childRow.description && (
                                  <span className="text-slate-400 text-xs font-normal ml-1">
                                    ({childRow.description})
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Child Permissions: Rounded Blue Pill if Checked, Flat Gray Dash if Unchecked */}
                            {permissionFieldKeys.map((permissionKey) => {
                              const isChecked = Boolean(childRow[permissionKey]);

                              return (
                                <td key={`child-col-${permissionKey}`} className="px-4 py-2 text-center align-middle">
                                  <div className="flex items-center justify-center">
                                    {isChecked ? (
                                      <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={true}
                                        aria-label={`Disable ${permissionKey} for ${childRow.module}`}
                                        disabled={readOnly}
                                        onClick={() => onPermissionChange(childKey, permissionKey)}
                                        className="w-16 h-3.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center shadow-2xs cursor-pointer disabled:opacity-50 mx-auto"
                                        title={`คลิกเพื่อปิดสิทธิ์ ${permissionKey}`}
                                      >
                                        <svg
                                          className="w-2.5 h-2.5 text-white stroke-[3]"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={false}
                                        aria-label={`Enable ${permissionKey} for ${childRow.module}`}
                                        disabled={readOnly}
                                        onClick={() => onPermissionChange(childKey, permissionKey)}
                                        className="w-16 h-6 flex items-center justify-center group cursor-pointer disabled:opacity-50 mx-auto"
                                        title={`คลิกเพื่อเปิดสิทธิ์ ${permissionKey}`}
                                      >
                                        <span className="w-16 h-0.5 bg-slate-200 group-hover:bg-blue-400 rounded-full transition-colors block" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* ─── 4. SUMMARY FOOTER ─── */}
      <div className="px-5 sm:px-6 py-4 border-t border-slate-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>สิทธิ์ที่เปิดใช้งาน:</span>
          <strong className="font-bold text-slate-900">
            {grantedPermissionsCount} / {totalAvailablePermissions} สิทธิ์
          </strong>
          <span className="text-slate-400">•</span>
        </div>

        <div className="text-slate-400 text-xs text-center sm:text-right">
          คลิกที่กล่องหัวโมดูลเพื่อเลือกสิทธิ์ทั้งหมวด หรือคลิกที่ข้อย่อยเพื่อกำหนดรายฟังก์ชัน
        </div>
      </div>
    </div>
  );
}
