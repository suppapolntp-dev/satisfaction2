"use client";

import React, { useState, useMemo, useEffect } from "react";
import TableDropdown, { DropdownActionItem } from "@/Components/Dropdowns/TableDropdown";

// ==========================================================================
// ─── 1. INTERFACES (นิยามโครงสร้างคอลัมน์และคำสั่งท้ายแถว)
// ==========================================================================

export interface TableColumn<T> {
  key: keyof T | "actions";               // คีย์ฟิลด์ใน Object หรือระบุเป็นช่อง actions
  label: string;                          // ข้อความพาดหัวคอลัมน์
  sortable?: boolean;                     // สิทธิ์ในการคลิกเพื่อจัดเรียงข้อมูล
  render?: (rowItem: T) => React.ReactNode; // สล็อตฟังก์ชันสำหรับเรนเดอร์ UI Custom (Badge, Avatar)
}

export interface TableAction<T> {
  label: string;                          // ข้อความบนเมนูคำสั่ง
  icon: string;                           // ชื่อ Material Symbol Icon
  onClick: (selectedRow: T) => void;      // ฟังก์ชัน Callback เมื่อคลิกคำสั่ง
  variant?: "default" | "danger";         // สีและรูปแบบของปุ่มคำสั่ง
}

export interface DataTableProps<T> {
  // ─── 1. HEAD SECTION (ชื่อ, search, actions) ───
  title?: string;
  subtitle?: string;
  icon?: string;
  badge?: React.ReactNode;
  headerActions?: React.ReactNode;
  
  // Search Control
  searchable?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;

  // ─── 2. FILTER BAR (title ที่กรองได้โดยที่มี dropdown อย่างเรียง filter) ───
  filters?: React.ReactNode;
  showSortDropdown?: boolean;

  // ─── 3. TABLE DATA (ข้อมูล) ───
  columns: TableColumn<T>[];
  data: T[];
  actions?: TableAction<T>[];
  emptyMessage?: string;

  // ─── 4. FOOTER TABLE (แสดงกี่แถว, เลือกหน้าได้ 2/99) ───
  defaultPageSize?: number;
  pagination?: boolean;
  pageSizeOptions?: number[];
}

// ==========================================================================
// ─── 2. MAIN COMPONENT (DataTable สากลของโปรเจกต์)
// ==========================================================================
export default function DataTable<T extends Record<string, any>>({
  // Head
  title,
  subtitle,
  icon = "table_chart",
  badge,
  headerActions,
  searchable = true,
  searchPlaceholder = "ค้นหาข้อมูลในตาราง...",
  searchQuery,
  onSearchChange,

  // Filters
  filters,
  showSortDropdown = true,

  // Data
  columns,
  data,
  actions,
  emptyMessage = "ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา",

  // Footer & Pagination
  defaultPageSize = 10,
  pagination = true,
  pageSizeOptions = [5, 10, 20, 50, -1],
}: DataTableProps<T>) {
  
  // Internal search state (fallback if uncontrolled)
  const [internalSearch, setInternalSearch] = useState("");
  const activeSearch = searchQuery !== undefined ? searchQuery : internalSearch;

  const handleSearchInput = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
    setCurrentPage(1);
    setPageInput("1");
  };

  // Sorting State
  const [sortConfiguration, setSortConfiguration] = useState<{
    columnKey: keyof T | null;
    sortDirection: "asc" | "desc" | null;
  }>({ columnKey: null, sortDirection: null });

  // Pagination State
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");

  // Toggle sort on column header click: asc -> desc -> reset
  const handleToggleSort = (targetColumnKey: keyof T) => {
    let nextDirection: "asc" | "desc" | null = "asc";
    if (sortConfiguration.columnKey === targetColumnKey && sortConfiguration.sortDirection === "asc") {
      nextDirection = "desc";
    } else if (sortConfiguration.columnKey === targetColumnKey && sortConfiguration.sortDirection === "desc") {
      nextDirection = null;
    }
    setSortConfiguration({ 
      columnKey: nextDirection ? targetColumnKey : null, 
      sortDirection: nextDirection 
    });
    setCurrentPage(1);
    setPageInput("1");
  };

  // Sort dropdown change
  const handleSortDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setSortConfiguration({ columnKey: null, sortDirection: null });
    } else {
      const [colKey, dir] = val.split(":");
      setSortConfiguration({
        columnKey: colKey as keyof T,
        sortDirection: dir as "asc" | "desc",
      });
    }
    setCurrentPage(1);
    setPageInput("1");
  };

  // Combine actions column if actions prop is passed
  const finalEffectiveColumns = useMemo(() => {
    const hasExistingActionsColumn = columns.some((column) => column.key === "actions");
    if (actions && actions.length > 0 && !hasExistingActionsColumn) {
      return [
        ...columns,
        {
          key: "actions" as const,
          label: "Actions",
          sortable: false,
        },
      ];
    }
    return columns;
  }, [columns, actions]);

  // List sortable columns for the sort dropdown
  const sortableColumns = useMemo(() => {
    return columns.filter((c) => c.sortable && c.key !== "actions");
  }, [columns]);

  // Client-side search filtering (if uncontrolled)
  const filteredData = useMemo(() => {
    if (searchQuery !== undefined || !internalSearch.trim()) {
      return data;
    }
    const q = internalSearch.toLowerCase().trim();
    return data.filter((item) => {
      return Object.values(item).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "string" || typeof val === "number") {
          return String(val).toLowerCase().includes(q);
        }
        if (Array.isArray(val)) {
          return val.some((subVal) => String(subVal).toLowerCase().includes(q));
        }
        return false;
      });
    });
  }, [data, searchQuery, internalSearch]);

  // Client-side Smart Sorting
  const sortedTableData = useMemo(() => {
    if (!sortConfiguration.columnKey || !sortConfiguration.sortDirection) {
      return filteredData;
    }

    return [...filteredData].sort((itemA, itemB) => {
      const valueA = itemA[sortConfiguration.columnKey!];
      const valueB = itemB[sortConfiguration.columnKey!];

      if (valueA === valueB) return 0;
      
      const sortMultiplier = sortConfiguration.sortDirection === "asc" ? 1 : -1;
      
      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * sortMultiplier;
      }
      
      return String(valueA ?? "").localeCompare(String(valueB ?? ""), "th") * sortMultiplier;
    });
  }, [filteredData, sortConfiguration]);

  // Pagination calculations
  const totalItems = sortedTableData.length;
  const isAll = pageSize === -1 || !pagination;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp current page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setPageInput(String(totalPages));
    } else {
      setPageInput(String(currentPage));
    }
  }, [totalPages, currentPage]);

  // Paged Data slice
  const pagedData = useMemo(() => {
    if (isAll) return sortedTableData;
    const start = (currentPage - 1) * pageSize;
    return sortedTableData.slice(start, start + pageSize);
  }, [sortedTableData, currentPage, pageSize, isAll]);

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    setPageInput(String(validPage));
  };

  const handlePageInputCommit = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      handlePageChange(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const startIndex = isAll ? 1 : (currentPage - 1) * pageSize + 1;
  const endIndex = isAll ? totalItems : Math.min(currentPage * pageSize, totalItems);

  const currentSortValue = sortConfiguration.columnKey && sortConfiguration.sortDirection
    ? `${String(sortConfiguration.columnKey)}:${sortConfiguration.sortDirection}`
    : "";

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col w-full">
      
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ─── 1. HEAD (ชื่อตาราง, search input, actions) ─── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {(title || searchable || headerActions) && (
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: ชื่อตาราง + Icon + Badge */}
          {title ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-2xs shrink-0">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{title}</h3>
                  {badge}
                </div>
                {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Right: Search Input + Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
            {searchable && (
              <div className="relative flex-1 md:flex-none">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={activeSearch}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full md:w-64 pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 shadow-2xs transition-all"
                />
                {activeSearch && (
                  <button
                    type="button"
                    onClick={() => handleSearchInput("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {headerActions}
          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ─── 2. FILTER BAR (title ที่กรองได้โดยที่มี dropdown อย่างเรียง filter) ─── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {(filters || (showSortDropdown && sortableColumns.length > 0)) && (
        <div className="p-3 border-b border-slate-100 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          
          {/* Custom Filters Slot (แบรนด์, ภูมิภาค, สถานะ ฯลฯ) */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-blue-900">filter_list</span>
              <span>ตัวกรอง:</span>
            </span>
            {filters}
          </div>

          {/* Sort By Dropdown (เรียงลำดับ) */}
          {showSortDropdown && sortableColumns.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center pl-2 lg:border-l lg:border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">เรียงตาม:</span>
              <select
                value={currentSortValue}
                onChange={handleSortDropdownChange}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-900 cursor-pointer"
              >
                <option value="">ค่าเริ่มต้น (Default)</option>
                {sortableColumns.map((col) => (
                  <React.Fragment key={String(col.key)}>
                    <option value={`${String(col.key)}:asc`}>{col.label} (น้อย → มาก / A → Z)</option>
                    <option value={`${String(col.key)}:desc`}>{col.label} (มาก → น้อย / Z → A)</option>
                  </React.Fragment>
                ))}
              </select>
            </div>
          )}

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ─── 3. ข้อมูล (TABLE BODY) ─── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* ─── TABLE HEADER ─── */}
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider select-none">
              {finalEffectiveColumns.map((tableColumn, columnIndex) => (
                <th
                  key={String(tableColumn.key) || columnIndex}
                  className={`py-3.5 px-4 whitespace-nowrap ${tableColumn.key === "actions" ? "text-right w-16" : ""}`}
                >
                  {tableColumn.sortable && tableColumn.key !== "actions" ? (
                    <button
                      type="button"
                      onClick={() => handleToggleSort(tableColumn.key as keyof T)}
                      className="inline-flex items-center gap-1 hover:text-blue-900 transition-colors outline-none cursor-pointer font-bold group"
                    >
                      <span>{tableColumn.label}</span>
                      <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-blue-900 transition-colors">
                        {sortConfiguration.columnKey === tableColumn.key
                          ? sortConfiguration.sortDirection === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </button>
                  ) : (
                    tableColumn.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* ─── TABLE ROWS ─── */}
          <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
            {pagedData.length > 0 ? (
              pagedData.map((rowRecord, rowIndex) => (
                <tr
                  key={rowRecord.id || rowRecord.key || rowIndex}
                  className={`hover:bg-slate-50/80 transition-colors h-14 ${
                    rowIndex % 2 === 1 ? "bg-slate-50/30" : "bg-white"
                  }`}
                >
                  {finalEffectiveColumns.map((tableColumn, columnIndex) => (
                    <td
                      key={String(tableColumn.key) || columnIndex}
                      className={`py-2 px-4 ${tableColumn.key === "actions" ? "text-right" : ""}`}
                    >
                      {/* กรณีเป็น Actions Column */}
                      {tableColumn.key === "actions" && actions ? (
                        <TableDropdown
                          actions={actions.map((singleAction) => ({
                            label: singleAction.label,
                            icon: singleAction.icon,
                            variant: singleAction.variant,
                            onClick: () => singleAction.onClick(rowRecord),
                          }))}
                        />
                      ) : tableColumn.render ? (
                        /* กรณีมี Custom Render Slot */
                        tableColumn.render(rowRecord)
                      ) : (
                        /* แสดงผลข้อความปกติ */
                        <span className="font-medium text-slate-800">
                          {String(rowRecord[tableColumn.key as string] ?? "")}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              /* กรณีไม่มีข้อมูลตรงตามฟิลเตอร์ */
              <tr>
                <td
                  colSpan={finalEffectiveColumns.length}
                  className="py-12 text-center text-xs font-medium text-slate-400 select-none"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-2xl text-slate-300">
                      inbox
                    </span>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ─── 4. FOOTER TABLE (แสดงกี่แถว, เลือกหน้าได้แบบ 2/99) ─── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {pagination && (
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none">
          
          {/* Left: รายละเอียดจำนวนแถว & ตัวเลือกจำนวนต่อหน้า */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500">
              {totalItems === 0 ? (
                "0 รายการ"
              ) : (
                <>
                  แสดง <span className="font-bold text-slate-800">{startIndex} - {endIndex}</span> จากทั้งหมด{" "}
                  <span className="font-bold text-slate-800">{totalItems.toLocaleString()}</span> รายการ
                </>
              )}
            </span>

            {/* Rows per page selector (ดูกี่แถว) */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-slate-400">แสดง:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPageSize(val);
                  setCurrentPage(1);
                  setPageInput("1");
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-900 cursor-pointer"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === -1 ? "ทั้งหมด (All)" : `${opt} แถว`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: ปุ่มเปลี่ยนหน้าแบบ 2/99 (Jump-to-Page Input) */}
          {!isAll && totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Prev Button */}
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                title="หน้าก่อนหน้า"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              {/* Jump-to-Page Input (เช่น 2 / 99) */}
              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[11px]">หน้า</span>
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePageInputCommit();
                  }}
                  onBlur={handlePageInputCommit}
                  className="w-9 text-center py-0.5 text-xs font-bold text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded"
                  title="พิมพ์เลขหน้าแล้วกด Enter เพื่อเปลี่ยนหน้าทันที"
                />
                <span className="text-slate-400 font-semibold text-[11px]">/ {totalPages}</span>
              </div>

              {/* Next Button */}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                title="หน้าถัดไป"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}