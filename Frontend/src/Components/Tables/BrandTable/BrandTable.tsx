"use client";

import React from "react";
import { BrandModel } from "@/Types/brand";
import { useBrandTable, BrandTableSortField } from "./useBrandTable";

export interface BrandTableProps {
  brands: BrandModel[];
  isLoading?: boolean;
  onEditBrand?: (brand: BrandModel) => void;
  onViewBrand?: (brand: BrandModel) => void;
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
  field: BrandTableSortField;
  activeField: BrandTableSortField;
  direction: "asc" | "desc";
  onSort: (field: BrandTableSortField) => void;
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
        <span className={`transition-opacity ${isActive ? "opacity-100 text-emerald-600" : "opacity-30"}`}>
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

export default function BrandTable({
  brands = [],
  isLoading = false,
  onEditBrand,
  onViewBrand,
  className = "",
}: BrandTableProps) {
  const {
    searchKeyword,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedBrands,
    handleSort,
    handleSearchChange,
    handlePageChange,
    handleResetFilters,
  } = useBrandTable({ brands, initialPageSize: 8 });

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* ─── 1. TOOLBAR: SEARCH CONTROLS ─── */}
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
              placeholder="Search by brand name, code..."
              className="w-full pl-9.5 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
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

        {/* Counter Info & Reset Filter */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <span>
            Showing <strong className="font-semibold text-slate-700">{paginatedBrands.length}</strong> of{" "}
            <strong className="font-semibold text-slate-700">{totalItems}</strong> brands
          </span>
          {searchKeyword && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Reset search
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
                label="Brand"
                field="brandName"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortHeaderCell
                label="Brand ID"
                field="brandId"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Category
              </th>
              <SortHeaderCell
                label="Branches"
                field="totalBranchesCount"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
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
                {Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`loading-skeleton-${index}`} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-slate-200 rounded" />
                          <div className="w-20 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="w-16 h-3 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="w-24 h-5 bg-slate-200 rounded-full" /></td>
                    <td className="px-5 py-4 text-right"><div className="w-10 h-3 bg-slate-200 rounded ml-auto" /></td>
                    <td className="px-5 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full mx-auto" /></td>
                    <td className="px-5 py-4 text-right"><div className="w-8 h-8 bg-slate-200 rounded-lg ml-auto" /></td>
                  </tr>
                ))}
              </>
            )}

            {/* Empty State */}
            {!isLoading && paginatedBrands.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No brands found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchKeyword
                        ? "Try adjusting your search criteria or resetting filters."
                        : "No corporate brands registered yet."}
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading &&
              paginatedBrands.map((brand) => {
                const isActive = brand.status === "Active";
                const initialLetter = (brand.brandName || "B").charAt(0).toUpperCase();

                return (
                  <tr
                    key={brand.id || brand.brandId}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Brand Name & Parent */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0 overflow-hidden">
                          {brand.brandLogoUrl ? (
                            <img
                              src={brand.brandLogoUrl}
                              alt={brand.brandName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{initialLetter}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate leading-snug">
                            {brand.brandName || "-"}
                          </p>
                          <p className="text-xs text-slate-500 truncate leading-tight">
                            {brand.parentCompanyName || "Enterprise Group"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Brand ID / Code */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {brand.brandId || brand.id}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {brand.category || "General"}
                      </span>
                    </td>

                    {/* Total Branches */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-700">
                      {(brand.totalBranchesCount || 0).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : "bg-slate-100 text-slate-600 ring-slate-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {brand.status || "Active"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onViewBrand && (
                          <button
                            type="button"
                            onClick={() => onViewBrand(brand)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        )}
                        {onEditBrand && (
                          <button
                            type="button"
                            onClick={() => onEditBrand(brand)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit brand"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </button>
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
                    key={`page-${pageNumber}`}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                      isCurrent
                        ? "bg-emerald-600 text-white"
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
