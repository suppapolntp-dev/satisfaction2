"use client";

import React, { useState } from "react";
import { UserAccessRecord } from "@/Types/dataAccess";
import {
  useDataAccessTable,
  DataAccessTableSortField,
} from "./useDataAccessTable";

export interface DataAccessTableProps {
  users: UserAccessRecord[];
  isLoading?: boolean;
  onAssignScope?: () => void;
  onEditUser?: (user: UserAccessRecord) => void;
  onDeleteUser?: (id: string) => void;
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
  field: DataAccessTableSortField;
  activeField: DataAccessTableSortField;
  direction: "asc" | "desc";
  onSort: (field: DataAccessTableSortField) => void;
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

function getTierBadgeClass(tier: string): string {
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
      return "bg-blue-50 text-blue-700 border-blue-200/80";
  }
}

export default function DataAccessTable({
  users = [],
  isLoading = false,
  onAssignScope,
  onEditUser,
  onDeleteUser,
  className = "",
}: DataAccessTableProps) {
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  const {
    searchKeyword,
    sortField,
    sortDirection,
    currentPage,
    totalItems,
    totalPages,
    paginatedUsers,
    handleSort,
    handleSearchChange,
    handlePageChange,
    handleResetFilters,
  } = useDataAccessTable({ users, initialPageSize: 8 });

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* ─── 1. TOOLBAR: SEARCH & ASSIGN SCOPE BUTTON (Exact Brand & Branch standard) ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
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
              placeholder="Search user, email, scope..."
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
        </div>

        {/* Counter Info & Assign Scope Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <span>
            Showing <strong className="font-semibold text-slate-700">{paginatedUsers.length}</strong> of{" "}
            <strong className="font-semibold text-slate-700">{totalItems}</strong> users
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
          {onAssignScope && (
            <button
              type="button"
              onClick={onAssignScope}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>+ กำหนดสิทธิ์ใหม่</span>
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
                label="Authorized User"
                field="userName"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="Tier Level"
                field="tierLevel"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Scope Coverage (แบรนด์ / สาขาที่ดูแล)
              </th>
              <SortHeaderCell
                label="Status"
                field="status"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {/* Loading Skeleton */}
            {isLoading && (
              <>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`loading-${idx}`} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-slate-200 rounded" />
                          <div className="w-20 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="w-24 h-5 bg-slate-200 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="w-40 h-4 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full mx-auto" /></td>
                    <td className="px-5 py-4 text-right"><div className="w-6 h-6 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))}
              </>
            )}

            {/* Empty State */}
            {!isLoading && paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">ไม่พบข้อมูลผู้ได้รับสิทธิ์ในสโคปนี้</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchKeyword
                      ? `ไม่มีผลลัพธ์ตรงกับ "${searchKeyword}"`
                      : 'ยังไม่มีผู้ใช้งานที่ได้รับมอบหมายในสโคปนี้ คลิก "+ กำหนดสิทธิ์ใหม่" เพื่อมอบหมายสิทธิ์ให้ผู้จัดการ (AM/RM)'}
                  </p>
                  {searchKeyword ? (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 text-xs font-semibold text-[var(--primary-container)] hover:underline"
                    >
                      ล้างการค้นหา
                    </button>
                  ) : onAssignScope ? (
                    <button
                      type="button"
                      onClick={onAssignScope}
                      className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--primary-container)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <span>+ กำหนดสิทธิ์ให้ User</span>
                    </button>
                  ) : null}
                </td>
              </tr>
            )}

            {/* User Rows */}
            {!isLoading &&
              paginatedUsers.map((user) => {
                const isActive = user.status === "Active";
                const initials = (user.userName || "").charAt(0).toUpperCase() || "U";
                const brands = user.assignedBrands || [];
                const branches = user.assignedBranches || [];

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 transition-colors duration-150"
                  >
                    {/* User Identity */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate leading-snug">
                            {user.userName || "-"}
                          </p>
                          <p className="text-xs text-slate-500 font-mono truncate leading-tight">
                            {user.userEmail || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tier Level */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTierBadgeClass(
                          user.tierLevel
                        )}`}
                      >
                        {user.tierLevel}
                      </span>
                    </td>

                    {/* Scope Coverage */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-1 max-w-xs">
                        <div className="flex flex-wrap items-center gap-1">
                          {brands.length === 0 ? (
                            <span className="text-xs text-slate-400">ทุกแบรนด์ (Global)</span>
                          ) : (
                            brands.map((b) => (
                              <span
                                key={b}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                              >
                                {b}
                              </span>
                            ))
                          )}
                        </div>
                        {branches.length > 0 && (
                          <p
                            className="text-[11px] text-slate-500 truncate max-w-[260px]"
                            title={branches.join(", ")}
                          >
                            สาขา: {branches.slice(0, 3).join(", ")}
                            {branches.length > 3 && ` (+${branches.length - 3})`}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                          isActive
                            ? "bg-[var(--accent-bg)] text-[var(--primary-container)] ring-[var(--accent-light)]"
                            : "bg-slate-100 text-slate-600 ring-slate-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            isActive ? "bg-[var(--primary-container)]" : "bg-slate-400"
                          }`}
                        />
                        {user.status || "Active"}
                      </span>
                    </td>

                    {/* Actions Menu (3 dots) */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuUserId(
                              activeMenuUserId === user.id ? null : user.id
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

                        {activeMenuUserId === user.id && (
                          <>
                            {/* Overlay to handle click away */}
                            <div
                              className="fixed inset-0 z-20 cursor-default"
                              onClick={() => setActiveMenuUserId(null)}
                            />

                            {/* Dropdown Options */}
                            <div className="absolute right-0 z-30 mt-1 w-32 origin-top-right rounded-xl bg-white border border-slate-200/90 shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuUserId(null);
                                  onEditUser?.(user);
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
                                <span>แก้ไขสิทธิ์</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuUserId(null);
                                  onDeleteUser?.(user.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group"
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
                                <span>เพิกถอนสิทธิ์</span>
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

      {/* ─── 3. PAGINATION CONTROLS ─── */}
      <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing page <strong className="font-semibold text-slate-700">{currentPage}</strong> of{" "}
          <strong className="font-semibold text-slate-700">{totalPages}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentPage === page
                  ? "bg-[var(--primary-container)] text-white shadow-xs"
                  : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-200"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
