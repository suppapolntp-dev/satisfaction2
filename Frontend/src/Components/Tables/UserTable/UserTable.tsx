"use client";

import React, { useRef, useEffect } from "react";
import { UserModel, UserTierLevel, UserStatus } from "@/Types/user";
import {
  useUserTable,
  UserTableSortField,
  USER_TABLE_COLUMNS,
  UserTableColumnKey,
} from "./useUserTable";

export interface UserTableProps {
  users?: UserModel[];
  isLoading?: boolean;
  onAddUser?: () => void;
  onEditUser?: (user: UserModel) => void;
  onToggleStatus?: (user: UserModel) => void;
  onDeleteUser?: (user: UserModel) => void;
  className?: string;
}

function getTierBadgeClass(tier: UserTierLevel): string {
  switch (tier) {
    case "Super Admin":
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    case "Brand Owner":
      return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    case "Regional Manager (RM)":
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    case "Area Manager (AM)":
      return "bg-teal-50 text-teal-700 border-teal-200/80";
    case "Branch Staff":
      return "bg-slate-50 text-slate-700 border-slate-200/80";
    case "Custom Scope":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200/80";
  }
}

function SortHeaderCell({
  label,
  field,
  activeField,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  field: UserTableSortField;
  activeField: UserTableSortField;
  direction: "asc" | "desc";
  onSort: (field: UserTableSortField) => void;
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
        <span>{label}</span>
        <span className={`transition-opacity ${isActive ? "opacity-100 text-blue-600" : "opacity-30"}`}>
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

export default function UserTable({
  users = [],
  isLoading = false,
  onAddUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  className = "",
}: UserTableProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const columnsMenuRef = useRef<HTMLDivElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    userConfig,
    searchKeyword,
    setSearchKeyword,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedUsers,
    activeMenuUserId,
    setActiveMenuUserId,
    hasActiveFilters,
    visibleColumns,
    isColumnsMenuOpen,
    setIsColumnsMenuOpen,
    isExportMenuOpen,
    setIsExportMenuOpen,
    toggleColumnVisibility,
    resetColumnVisibility,
    selectedUserIds,
    toggleSelectUser,
    toggleSelectAll,
    clearSelection,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    exportData,
    handleSort,
    handlePageChange,
    handleResetFilters,
  } = useUserTable({ users, initialPageSize: 8 });

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuUserId(null);
      }
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(event.target as Node)) {
        setIsColumnsMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setActiveMenuUserId, setIsColumnsMenuOpen, setIsExportMenuOpen]);

  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;

  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeCurrentPageSelected;
    }
  }, [isSomeCurrentPageSelected]);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* ─── 1. TOP TOOLBAR: SEARCH, COLUMNS SELECTOR, EXPORT, & ADD USER (Fardo Design) ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Buscar por usuario, email, rol o sucursal..."
            className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Action Controls: Column Selector, Export Dropdown, Add User */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Column Visibility Selector Dropdown (Columns ▾) */}
          <div className="relative" ref={columnsMenuRef}>
            <button
              type="button"
              onClick={() => setIsColumnsMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
              </svg>
              <span>Columns</span>
              <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isColumnsMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 text-[11px] font-bold text-slate-700">
                  <span>Visible Columns</span>
                  <button
                    type="button"
                    onClick={resetColumnVisibility}
                    className="text-blue-600 hover:underline font-normal text-[10px]"
                  >
                    Reset Default
                  </button>
                </div>
                {USER_TABLE_COLUMNS.map((col) => {
                  const isChecked = visibleColumns[col.key] !== false;
                  return (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 text-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleColumnVisibility(col.key)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="truncate">{col.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export Dropdown Button (Export ▾ - True WYSIWYG) */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
              {selectedUserIds.size > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-500 text-white rounded-full text-[10px] font-bold">
                  {selectedUserIds.size}
                </span>
              )}
              <svg className="w-3 h-3 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100 text-[11px] text-slate-500">
                  {selectedUserIds.size > 0 ? (
                    <span>
                      Exporting <strong className="text-slate-800">{selectedUserIds.size}</strong> selected users
                    </span>
                  ) : (
                    <span>
                      Exporting <strong className="text-slate-800">{totalItems}</strong> users (active filters)
                    </span>
                  )}
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {visibleColumnCount} visible columns included
                  </span>
                </div>

                {/* CSV */}
                <button
                  type="button"
                  onClick={() => exportData("csv")}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    CSV
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-800">CSV Spreadsheet (.csv)</span>
                    <span className="block text-[10px] text-slate-400">Excel & Google Sheets (UTF-8 BOM)</span>
                  </div>
                </button>

                {/* XLSX */}
                <button
                  type="button"
                  onClick={() => exportData("xlsx")}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    XLS
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-800">Excel Workbook (.xls)</span>
                    <span className="block text-[10px] text-slate-400">Microsoft Excel Spreadsheet</span>
                  </div>
                </button>

                {/* JSON */}
                <button
                  type="button"
                  onClick={() => exportData("json")}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                    {`{}`}
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-800">JSON Dataset (.json)</span>
                    <span className="block text-[10px] text-slate-400">Clean REST API Object Tree</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Add User Button */}
          {onAddUser && (
            <button
              type="button"
              onClick={onAddUser}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. DATA TABLE AREA WITH DYNAMIC COLUMNS & ROW SELECTION ─── */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full border-collapse text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              {/* Checkbox Select All */}
              <th scope="col" className="px-4 py-3.5 w-10 text-center">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={isAllCurrentPageSelected}
                  onChange={toggleSelectAll}
                  aria-label="Seleccionar todos"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                />
              </th>

              {visibleColumns.userCode && (
                <SortHeaderCell
                  label="User ID"
                  field="userCode"
                  activeField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              )}

              {visibleColumns.tierLevel && (
                <SortHeaderCell
                  label="Tier Level"
                  field="tierLevel"
                  activeField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              )}

              {visibleColumns.name && (
                <SortHeaderCell
                  label="Full Name & Account"
                  field="name"
                  activeField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              )}

              {visibleColumns.role && (
                <SortHeaderCell
                  label="Role"
                  field="role"
                  activeField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              )}

              {visibleColumns.scope && (
                <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Assigned Scope
                </th>
              )}

              {visibleColumns.status && (
                <SortHeaderCell
                  label="Status"
                  field="status"
                  activeField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              )}

              <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Loading Skeleton State */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`user-skeleton-${index}`} className="animate-pulse">
                  <td className="px-4 py-4 text-center">
                    <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                  </td>
                  {visibleColumns.userCode && (
                    <td className="px-5 py-4">
                      <div className="h-4 bg-slate-200 rounded w-20" />
                    </td>
                  )}
                  {visibleColumns.tierLevel && (
                    <td className="px-5 py-4">
                      <div className="h-5 bg-slate-200 rounded-md w-24" />
                    </td>
                  )}
                  {visibleColumns.name && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-4 bg-slate-200 rounded w-32" />
                          <div className="h-3 bg-slate-100 rounded w-24" />
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.role && (
                    <td className="px-5 py-4">
                      <div className="h-5 bg-slate-200 rounded-md w-24" />
                    </td>
                  )}
                  {visibleColumns.scope && (
                    <td className="px-5 py-4">
                      <div className="h-4 bg-slate-200 rounded w-36" />
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="px-5 py-4">
                      <div className="h-5 bg-slate-200 rounded-full w-16" />
                    </td>
                  )}
                  <td className="px-5 py-4 text-right">
                    <div className="h-7 w-7 bg-slate-200 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))}

            {/* Empty State */}
            {!isLoading && paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={visibleColumnCount + 2} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="18" y1="8" x2="23" y2="13" />
                        <line x1="23" y1="8" x2="18" y2="13" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-1">
                      {hasActiveFilters ? "No matching users found" : "No users available"}
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      {hasActiveFilters
                        ? "Try adjusting your search criteria or clear your active filters."
                        : "Get started by creating the first system user account."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading &&
              paginatedUsers.map((user) => {
                const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
                const isMenuOpen = activeMenuUserId === user.id;
                const isActiveStatus = user.status === "Active";
                const isRowSelected = selectedUserIds.has(user.id);

                const brandsCount = user.assignedBrands?.length ?? 0;
                const branchesCount = user.assignedBranches?.length ?? 0;

                return (
                  <tr
                    key={user.id}
                    className={`transition-colors group ${
                      isRowSelected ? "bg-blue-50/50 hover:bg-blue-50/80" : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isRowSelected}
                        onChange={() => toggleSelectUser(user.id)}
                        aria-label={`Seleccionar ${user.firstName}`}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                    </td>

                    {/* User ID */}
                    {visibleColumns.userCode && (
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md inline-block">
                          {user.userCode ?? "-"}
                        </span>
                      </td>
                    )}

                    {/* Tier Level */}
                    {visibleColumns.tierLevel && (
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getTierBadgeClass(
                            user.tierLevel
                          )}`}
                        >
                          {user.tierLevel ?? "-"}
                        </span>
                      </td>
                    )}

                    {/* Name & Account */}
                    {visibleColumns.name && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono truncate">
                              {user.email ?? "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Role */}
                    {visibleColumns.role && (
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                          {user.role ?? "-"}
                        </span>
                      </td>
                    )}

                    {/* Assigned Scope */}
                    {visibleColumns.scope && (
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="font-medium text-slate-400">Brand:</span>
                            <span className="truncate max-w-[160px] text-slate-700 font-medium">
                              {brandsCount > 0 ? user.assignedBrands!.join(", ") : user.brand ?? "All"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="font-medium text-slate-400">Branch:</span>
                            <span className="truncate max-w-[160px] text-slate-700 font-medium">
                              {branchesCount > 0 ? `${branchesCount} สาขา` : user.branch ?? "All"}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Status Badge */}
                    {visibleColumns.status && (
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            isActiveStatus
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                              : "bg-slate-100 text-slate-600 border-slate-200/80"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActiveStatus ? "bg-emerald-600" : "bg-slate-400"
                            }`}
                          />
                          {user.status ?? "-"}
                        </span>
                      </td>
                    )}

                    {/* Actions Menu */}
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block" ref={isMenuOpen ? dropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setActiveMenuUserId(isMenuOpen ? null : user.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          aria-label="User actions"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-20 text-left">
                            {onEditUser && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuUserId(null);
                                  onEditUser(user);
                                }}
                                className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                <span>Edit Profile</span>
                              </button>
                            )}

                            {onToggleStatus && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuUserId(null);
                                  onToggleStatus(user);
                                }}
                                className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
                                  <circle cx={isActiveStatus ? "16" : "8"} cy="12" r="3" />
                                </svg>
                                <span>{isActiveStatus ? "Deactivate" : "Activate"}</span>
                              </button>
                            )}

                            {onDeleteUser && (
                              <>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    onDeleteUser(user);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                  <span>Delete User</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* ─── 4. TABLE FOOTER (Fardo Summary & Pagination) ─── */}
      <div className="p-4 sm:px-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {selectedUserIds.size > 0 ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/70">
                {selectedUserIds.size} users selected ({selectedUserIds.size} รายการที่เลือก)
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-slate-400 hover:text-slate-700 font-medium hover:underline cursor-pointer"
              >
                Clear Selection (ล้างการเลือก)
              </button>
            </div>
          ) : totalItems > 0 ? (
            <span>
              Showing{" "}
              <strong className="text-slate-800 font-semibold">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-800 font-semibold">
                {Math.min(currentPage * pageSize, totalItems)}
              </strong>{" "}
              of <strong className="text-slate-800 font-semibold">{totalItems}</strong> entries
            </span>
          ) : (
            <span>0 entries</span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <span className="px-2.5 py-1 font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
