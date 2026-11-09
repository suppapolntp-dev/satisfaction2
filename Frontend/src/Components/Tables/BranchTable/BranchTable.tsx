"use client";

import React, { useState } from "react";
import { BranchModel } from "@/Types/branch";
import { useBranchTable, BranchTableSortField } from "./useBranchTable";

export interface BranchTableProps {
  branches: BranchModel[];
  isLoading?: boolean;
  onAddBranch?: () => void;
  onEditBranch?: (branch: BranchModel) => void;
  onDeleteBranch?: (branch: BranchModel) => void;
  scopeFilter?: { level: string; label: string };
  onClearScopeFilter?: () => void;
  className?: string;
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
  field: BranchTableSortField;
  activeField: BranchTableSortField;
  direction: "asc" | "desc";
  onSort: (field: BranchTableSortField) => void;
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
        <span className={`transition-opacity ${isActive ? "opacity-100 text-[var(--primary-container)]" : "opacity-30"}`}>
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

export default function BranchTable({
  branches = [],
  isLoading = false,
  onAddBranch,
  onEditBranch,
  onDeleteBranch,
  scopeFilter,
  onClearScopeFilter,
  className = "",
}: BranchTableProps) {
  const [activeMenuBranchId, setActiveMenuBranchId] = useState<string | null>(null);

  const {
    searchKeyword,
    sortField,
    sortDirection,
    currentPage,
    totalItems,
    totalPages,
    paginatedBranches,
    handleSort,
    handleSearchChange,
    handlePageChange,
    handleResetFilters,
  } = useBranchTable({ branches, initialPageSize: 8 });

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* ─── 1. TOOLBAR: SEARCH, SCOPE BADGE & ADD BRANCH BUTTON ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search branch name, code, brand..."
              className="w-full pl-9.5 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]/20 focus:border-[var(--primary-container)] text-slate-800 placeholder-slate-400 transition-all"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
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

          {/* Active Org Tree Filter Badge */}
          {scopeFilter && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/80 shadow-2xs">
              <span className="text-blue-500 font-semibold">{scopeFilter.level}:</span>
              <span className="font-semibold text-blue-950 max-w-[200px] truncate" title={scopeFilter.label}>
                {scopeFilter.label}
              </span>
              {onClearScopeFilter && (
                <button
                  type="button"
                  onClick={onClearScopeFilter}
                  className="ml-1 p-0.5 hover:bg-blue-200/70 rounded-md text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                  title="Clear filter (Show all branches)"
                  aria-label="Clear filter"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Counter Info, Reset Filter & Add Branch (Aligned Right) */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <span>
            Showing <strong className="font-semibold text-slate-700">{paginatedBranches.length}</strong> of{" "}
            <strong className="font-semibold text-slate-700">{totalItems}</strong> branches
          </span>
          {searchKeyword && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[var(--primary-container)] hover:text-[var(--primary-hover)] font-medium transition-colors cursor-pointer"
            >
              Reset search
            </button>
          )}

          {/* Add Branch Button (Pinned to Right) */}
          {onAddBranch && (
            <button
              type="button"
              onClick={onAddBranch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer shrink-0 ml-1"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Branch</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. TABLE CONTENT ─── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80">
              <SortHeaderCell
                label="Branch"
                field="name"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="Branch Code"
                field="code"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="Brand"
                field="brand"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="Province"
                field="province"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="Kiosks"
                field="kioskCount"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortHeaderCell
                label="STATUS"
                field="status"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <th scope="col" className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {/* Loading Skeleton */}
            {isLoading && (
              <>
                {Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`branch-skeleton-${index}`} className="animate-pulse">
                    <td className="px-5 py-4"><div className="w-36 h-4 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-3 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="w-24 h-5 bg-slate-200 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-3 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4 text-right"><div className="w-10 h-3 bg-slate-200 rounded ml-auto" /></td>
                    <td className="px-5 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full mx-auto" /></td>
                    <td className="px-5 py-4 text-right"><div className="w-8 h-8 bg-slate-200 rounded-lg ml-auto" /></td>
                  </tr>
                ))}
              </>
            )}

            {/* Empty State */}
            {!isLoading && paginatedBranches.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No branches found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchKeyword
                        ? "Try adjusting your search criteria."
                        : scopeFilter
                        ? `No branches found matching ${scopeFilter.level}: "${scopeFilter.label}".`
                        : "No branch locations registered yet."}
                    </p>
                    {scopeFilter && onClearScopeFilter && (
                      <button
                        type="button"
                        onClick={onClearScopeFilter}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                      >
                        <span>Show all branches</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading &&
              paginatedBranches.map((branch) => {
                const isActive = branch.status === "Active";

                return (
                  <tr
                    key={branch.id || branch.code}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Branch Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[var(--accent-bg)] text-[var(--primary-container)] flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate leading-snug">
                            {branch.name || "-"}
                          </p>
                          <p className="text-xs text-slate-400 truncate leading-tight">
                            {branch.region || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Branch Code */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-medium text-slate-700">
                        {branch.code || branch.id}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-700">
                        {branch.brand || "-"}
                      </span>
                    </td>

                    {/* Province */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                      {branch.province || "-"}
                    </td>

                    {/* Kiosks Count */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-700">
                      {(branch.kioskCount || 0).toLocaleString()}
                    </td>

                    {/* Status (Clean dot + text, no background badge) */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center text-xs font-semibold ${
                          isActive ? "text-blue-600" : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            isActive ? "bg-blue-600" : "bg-slate-400"
                          }`}
                        />
                        {branch.status || "Active"}
                      </span>
                    </td>

                    {/* Actions Menu (3 dots) */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuBranchId(
                              activeMenuBranchId === (branch.id || branch.code)
                                ? null
                                : (branch.id || branch.code)
                            )
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          aria-label="Actions menu"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                          </svg>
                        </button>

                        {activeMenuBranchId === (branch.id || branch.code) && (
                          <>
                            {/* Overlay */}
                            <div
                              className="fixed inset-0 z-20 cursor-default"
                              onClick={() => setActiveMenuBranchId(null)}
                            />

                            {/* Dropdown Options */}
                            <div className="absolute right-0 z-30 mt-1 w-32 origin-top-right rounded-xl bg-white border border-slate-200/90 shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuBranchId(null);
                                  onEditBranch?.(branch);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[var(--accent-bg)]/60 hover:text-[var(--primary-container)] transition-colors cursor-pointer group"
                              >
                                <svg
                                  className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-[var(--primary-container)]"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                                <span>แก้ไข</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuBranchId(null);
                                  onDeleteBranch?.(branch);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                              >
                                <svg
                                  className="w-3.5 h-3.5 shrink-0 text-rose-500"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                                <span>ลบ</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* ─── 3. PAGINATION FOOTER ─── */}
      {totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page <strong className="font-semibold text-slate-700">{currentPage}</strong> of{" "}
            <strong className="font-semibold text-slate-700">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                const isCurrent = pageNumber === currentPage;
                return (
                  <button
                    key={`branch-page-${pageNumber}`}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-7 h-7 text-xs font-semibold rounded-lg transition-colors ${
                      isCurrent
                        ? "bg-[var(--primary-container)] text-white shadow-2xs font-bold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
