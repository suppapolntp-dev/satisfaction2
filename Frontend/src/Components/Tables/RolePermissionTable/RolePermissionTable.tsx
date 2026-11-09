"use client";

import React from "react";
import { PermissionRow, PermissionKey } from "@/Types/role";
import { useRolePermissionTable, PermissionSortField } from "./useRolePermissionTable";

export interface RolePermissionTableProps {
  permissionData: PermissionRow[];
  onPermissionChange: (moduleName: string, permissionField: PermissionKey) => void;
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
  subLabel,
  field,
  activeField,
  direction,
  onSort,
  align = "center",
}: {
  label: string;
  subLabel?: string;
  field: PermissionSortField;
  activeField: PermissionSortField;
  direction: "asc" | "desc";
  onSort: (field: PermissionSortField) => void;
  align?: "left" | "right" | "center";
}) {
  const isActive = activeField === field;
  const alignmentClass =
    align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";

  return (
    <th
      scope="col"
      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 select-none cursor-pointer hover:text-slate-800 transition-colors ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      }`}
      onClick={() => onSort(field)}
    >
      <div className={`inline-flex items-center gap-1.5 ${alignmentClass}`}>
        <div className="flex flex-col items-center">
          <span>{label}</span>
          {subLabel && (
            <span className="text-[9px] font-normal text-slate-400 capitalize">
              {subLabel}
            </span>
          )}
        </div>
        <span
          className={`transition-opacity ${
            isActive ? "opacity-100 text-[var(--primary-container)]" : "opacity-30"
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

export default function RolePermissionTable({
  permissionData = [],
  onPermissionChange,
  isLoading = false,
  isSaving = false,
  readOnly = false,
  roleName = "Super Admin (ผู้ดูแลระบบสูงสุด)",
  roleCode,
  isSystemDefault = false,
  onToggleAll,
  onResetDefault,
  onSave,
  searchQuery: externalSearchQuery,
  className = "",
}: RolePermissionTableProps) {
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
    totalAvailablePermissions,
    grantedPermissionsCount,
    grantedPercentage,
  } = useRolePermissionTable({
    permissionData,
    searchQuery: externalSearchQuery,
  });

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {/* ─── 1. HEADER: ROLE INFO & ACTION CONTROLS ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[var(--primary-container)] shrink-0 shadow-2xs">
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
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                สิทธิ์การใช้งาน:{" "}
                <span className="text-blue-600 font-extrabold">{roleName}</span>
              </h3>
              {isSystemDefault && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                  System Default
                </span>
              )}
              {roleCode && (
                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {roleCode}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              เลือกทำเครื่องหมายเพื่อเปิดหรือปิดสิทธิ์เฉพาะแต่ละฟังก์ชันของระบบ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
          {onToggleAll && (
            <>
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onToggleAll(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                title="เลือกเปิดสิทธิ์ทั้งหมด"
              >
                Select All
              </button>

              <button
                type="button"
                disabled={readOnly}
                onClick={() => onToggleAll(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                title="ล้างสิทธิ์ทั้งหมด"
              >
                Clear All
              </button>
            </>
          )}

          {onResetDefault && (
            <button
              type="button"
              disabled={readOnly}
              onClick={onResetDefault}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="คืนค่าสิทธิ์เริ่มต้น"
            >
              Reset Default
            </button>
          )}

          {onSave && (
            <button
              type="button"
              disabled={isSaving || readOnly}
              onClick={onSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
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
      </div>

      {/* ─── 2. TOOLBAR: SEARCH & COUNTER (CONTAINER BACKOFFICE STYLE) ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5">
          {/* Pill Search Input */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by module, feature..."
              className="w-full pl-9.5 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Clear search"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Counter Info & Reset Filter */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <span>
            Showing <strong className="font-semibold text-slate-700">{filteredPermissions.length}</strong> of{" "}
            <strong className="font-semibold text-slate-700">{totalItems}</strong> modules
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
            >
              Reset search
            </button>
          )}
        </div>
      </div>

      {/* ─── 3. TABLE CONTENT ─── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80">
              <SortHeaderCell
                label="MODULE / FEATURE"
                field="module"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="left"
              />
              <SortHeaderCell
                label="VIEW"
                subLabel="ดูข้อมูล"
                field="view"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <SortHeaderCell
                label="CREATE"
                subLabel="สร้างใหม่"
                field="create"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <SortHeaderCell
                label="UPDATE"
                subLabel="แก้ไข"
                field="update"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <SortHeaderCell
                label="DELETE"
                subLabel="ลบ"
                field="delete"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <SortHeaderCell
                label="EXPORT"
                subLabel="ส่งออก"
                field="export"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {/* Loading Skeleton */}
            {isLoading && (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`perm-skeleton-${index}`} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                        <div className="w-48 h-3.5 bg-slate-200 rounded" />
                      </div>
                    </td>
                    {Array.from({ length: 5 }).map((__, colIdx) => (
                      <td key={`col-skel-${colIdx}`} className="px-5 py-4 text-center">
                        <div className="w-5 h-5 bg-slate-200 rounded-md mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}

            {/* Empty State */}
            {!isLoading && filteredPermissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {searchQuery ? "ไม่พบโมดูลที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลสิทธิ์ในบทบาทนี้"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery
                        ? "ลองเปลี่ยนคำค้นหา หรือกด Reset search ด้านบน"
                        : "กรุณาเลือกบทบาทอื่นจากรายการด้านซ้าย"}
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading &&
              filteredPermissions.map((singlePermissionRow) => {
                return (
                  <tr
                    key={singlePermissionRow.module}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Module Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors shrink-0" />
                        <span className="font-semibold text-slate-800 text-sm">
                          {singlePermissionRow.module}
                        </span>
                        {singlePermissionRow.moduleCode && (
                          <span className="font-mono text-[11px] text-slate-400 ml-1">
                            ({singlePermissionRow.moduleCode})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Checkbox Columns (VIEW, CREATE, UPDATE, DELETE, EXPORT) */}
                    {permissionFieldKeys.map((permissionKey) => {
                      const isChecked = Boolean(singlePermissionRow[permissionKey]);

                      return (
                        <td key={permissionKey} className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={isChecked}
                              aria-label={`${permissionKey} permission for ${singlePermissionRow.module}`}
                              disabled={readOnly}
                              onClick={() =>
                                onPermissionChange(singlePermissionRow.module, permissionKey)
                              }
                              className={`w-5 h-5 rounded-[5px] flex items-center justify-center transition-all cursor-pointer ${
                                isChecked
                                  ? "bg-blue-600 text-white shadow-2xs hover:bg-blue-700"
                                  : "bg-white border border-slate-300 hover:border-slate-400"
                              } ${readOnly ? "opacity-50 cursor-not-allowed" : "active:scale-90"}`}
                            >
                              {isChecked && (
                                <svg
                                  className="w-3.5 h-3.5 text-white stroke-[2.5]"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* ─── 4. SUMMARY FOOTER ─── */}
      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            สิทธิ์ที่เปิดใช้งาน:{" "}
            <strong className="font-semibold text-slate-800">
              {grantedPermissionsCount}
            </strong>{" "}
            / {totalAvailablePermissions} รายการ
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-medium text-blue-600">{grantedPercentage}% ครอบคลุม</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">
            คลิกที่ช่องทำเครื่องหมายเพื่อเปิดหรือปิดสิทธิ์เฉพาะแต่ละฟังก์ชัน
          </span>
        </div>
      </div>
    </div>
  );
}
