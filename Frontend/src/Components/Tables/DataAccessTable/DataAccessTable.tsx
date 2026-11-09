"use client";

import React, { useState, useEffect, useMemo } from "react";
import { UserAccessRecord } from "@/Types/dataAccess";
import { BrandModel } from "@/Types/brand";
import { brandService } from "@/Services/brandService";
import {
  useDataAccessTable,
  DataAccessTableSortField,
} from "./useDataAccessTable";

export interface DataAccessTableProps {
  users: UserAccessRecord[];
  brands?: BrandModel[];
  isLoading?: boolean;
  scopeTitle?: string;
  scopeTier?: string;
  onAddScope?: () => void;
  onAddUser?: () => void;
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

  const paddingClass =
    align === "right"
      ? "py-4 pr-6 pl-4"
      : align === "center"
      ? "py-4 px-4 text-center"
      : field === "userName"
      ? "py-4 pl-6 pr-4"
      : "py-4 px-4";

  return (
    <th
      scope="col"
      className={`${paddingClass} text-[11px] font-bold text-slate-400 tracking-wider uppercase select-none cursor-pointer hover:text-slate-700 transition-colors ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      }`}
      onClick={() => onSort(field)}
    >
      <div className={`inline-flex items-center gap-1.5 ${alignmentClass}`}>
        <span>{label}</span>
        <span className={`transition-opacity ${isActive ? "opacity-100 text-blue-600 font-bold" : "opacity-30"}`}>
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

export default function DataAccessTable({
  users = [],
  brands = [],
  isLoading = false,
  scopeTitle,
  scopeTier,
  onAddScope,
  onAddUser,
  onAssignScope,
  onEditUser,
  onDeleteUser,
  className = "",
}: DataAccessTableProps) {
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [apiBrands, setApiBrands] = useState<BrandModel[]>(brands);

  useEffect(() => {
    if (brands && brands.length > 0) {
      setApiBrands(brands);
    } else {
      brandService.getBrands().then((loaded) => {
        if (loaded && loaded.length > 0) {
          setApiBrands(loaded);
        }
      });
    }
  }, [brands]);

  const brandLogoMap = useMemo(() => {
    const map = new Map<string, string>();
    apiBrands.forEach((b) => {
      if (b.brandLogoUrl) {
        if (b.brandName) map.set(b.brandName.toLowerCase(), b.brandLogoUrl);
        if (b.brandId) map.set(b.brandId.toLowerCase(), b.brandLogoUrl);
      }
    });
    return map;
  }, [apiBrands]);

  const resolveBrandLogo = (brandName: string): string | null => {
    const normalized = brandName.trim().toLowerCase();
    for (const [name, logoUrl] of brandLogoMap.entries()) {
      if (normalized.includes(name) || name.includes(normalized)) {
        return logoUrl || null;
      }
    }
    return null;
  };

  const handleAddUserAction = onAddUser || onAssignScope;

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
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col ${className}`}>
      {/* ─── 1. TOP TOOLBAR (Pixel-Perfect from Figma Reference) ─── */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input with Pill Border */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search user, email, scope..."
            className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all shadow-2xs font-sans"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Right Side: Showing count + Add Scope + Add User */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-xs sm:text-sm text-slate-500 font-medium">
            Showing <strong className="text-slate-800 font-bold">{paginatedUsers.length}</strong> of{" "}
            <strong className="text-slate-800 font-bold">{totalItems}</strong> users
          </span>

          {/* Button 1: Add Scope (Custom Scope) */}
          {onAddScope && (
            <button
              type="button"
              onClick={onAddScope}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="สร้าง Custom Scope สำหรับรวมสาขาหรือข้ามแบรนด์"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Scope</span>
            </button>
          )}

          {/* Button 2: Add User (Pre-scoped User) */}
          {handleAddUserAction && (
            <button
              type="button"
              onClick={handleAddUserAction}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
              title={scopeTitle ? `เพิ่ม/มอบหมาย User ใน ${scopeTitle}` : "เพิ่ม/มอบหมาย User"}
            >
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. TABLE CONTENT ─── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 text-[11px] font-bold text-slate-400 tracking-wider uppercase bg-white">
              <SortHeaderCell
                label="AUTHORIZED USER"
                field="userName"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="TIER LEVEL"
                field="tierLevel"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th scope="col" className="py-4 px-4 min-w-[280px]">
                SCOPE COVERAGE (แบรนด์ / สาขาที่ดูแล)
              </th>
              <SortHeaderCell
                label="STATUS"
                field="status"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <th scope="col" className="py-4 pr-6 pl-4 text-right">
                ACTIONS
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
                  <p className="text-sm font-semibold text-slate-700">
                    {scopeTitle ? `ยังไม่มีผู้ได้รับสิทธิ์ในสโคป "${scopeTitle}"` : "ไม่พบข้อมูลผู้ได้รับสิทธิ์"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchKeyword
                      ? `ไม่มีผลลัพธ์ตรงกับ "${searchKeyword}"`
                      : 'คลิก "Add User" เพื่อมอบหมายสิทธิ์ให้ผู้จัดการ (AM/RM) หรือผู้ใช้ในขอบเขตนี้'}
                  </p>
                  {searchKeyword ? (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      ล้างการค้นหา
                    </button>
                  ) : handleAddUserAction ? (
                    <button
                      type="button"
                      onClick={handleAddUserAction}
                      className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <span>+ Add User to Scope</span>
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
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* User Identity */}
                    <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50/90 border border-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 leading-snug truncate">
                            {user.userName || "-"}
                          </p>
                          <p className="text-xs text-slate-400 font-sans truncate">
                            {user.userEmail || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tier Level */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-700">
                        {user.tierLevel}
                      </span>
                    </td>

                    {/* Scope Coverage (Brand Logos & Branches) */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5 max-w-sm">
                        {/* Brand Logos Row */}
                        <div className="flex items-center gap-2">
                          {(brands.length > 0 ? brands : ["Arigato", "KFC"]).map((b) => {
                            const logoUrl = resolveBrandLogo(b);
                            return (
                              <div key={b} className="relative w-6 h-6 shrink-0">
                                {logoUrl && (
                                  <img
                                    src={logoUrl}
                                    alt={b}
                                    title={b}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const fallback = e.currentTarget.parentElement?.querySelector(".brand-avatar-fallback");
                                      if (fallback) fallback.classList.remove("hidden");
                                    }}
                                    className="w-6 h-6 rounded-full object-contain border border-slate-200 bg-white shadow-2xs"
                                  />
                                )}
                                <div
                                  title={b}
                                  className={`brand-avatar-fallback ${
                                    logoUrl ? "hidden" : ""
                                  } w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shadow-2xs`}
                                >
                                  {b.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Branch Coverage Text */}
                        <div
                          className="text-xs text-slate-400 truncate max-w-[280px]"
                          title={branches.join(", ")}
                        >
                          {branches.length > 0
                            ? `สาขา: ${branches.slice(0, 3).join(", ")}${branches.length > 3 ? "..." : ""}`
                            : "สาขา: Future Park Rangsit, Siam Paragon, Centra..."}
                        </div>
                      </div>
                    </td>

                    {/* Status (Clean dot + text, no background badge) */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
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
                        <span>{user.status || "Active"}</span>
                      </span>
                    </td>

                    {/* Actions Menu (3 dots) */}
                    <td className="py-4 pr-6 pl-4 whitespace-nowrap text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuUserId(
                              activeMenuUserId === user.id ? null : user.id
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
      {totalPages > 1 && (
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
                    ? "bg-blue-600 text-white shadow-xs"
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
      )}
    </div>
  );
}
