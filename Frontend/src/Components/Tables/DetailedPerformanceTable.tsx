"use client";

import React, { useState, useMemo, useEffect } from "react";
import { DetailedPerformanceRow } from "@/Types/dashboard";

export interface PerformanceTableProps {
  title: string;
  subtitle: string;
  icon: string;
  badgeText: string;
  badgeClass?: string;
  data: DetailedPerformanceRow[];
  nameColumnLabel: string;
  defaultPageSize?: number;
}

type SortField =
  | "name"
  | "satisfiedCount"
  | "neutralCount"
  | "unsatisfiedCount"
  | "totalVotes"
  | "csatRate";

type SortDirection = "asc" | "desc" | null;

export default function DetailedPerformanceTable({
  title,
  subtitle,
  icon,
  badgeText,
  badgeClass = "badge-live",
  data,
  nameColumnLabel,
  defaultPageSize = 5,
}: PerformanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");

  // Filter by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase().trim();
    return data.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.subLabel && r.subLabel.toLowerCase().includes(q))
    );
  }, [data, searchTerm]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === "string") {
        const comp = valA.localeCompare(valB, "th");
        return sortDirection === "asc" ? comp : -comp;
      }

      valA = valA || 0;
      valB = valB || 0;
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination calculations
  const totalItems = sortedData.length;
  const isAll = pageSize === -1;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset or clamp currentPage if data or pageSize changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setPageInput(String(totalPages));
    } else {
      setPageInput(String(currentPage));
    }
  }, [totalPages, currentPage]);

  const pagedData = useMemo(() => {
    if (isAll) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, isAll]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
    setPageInput("1");
  };

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    setPageInput(String(validPage));
  };

  const handlePageInputCommit = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed)) {
      handlePageChange(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <span className="material-symbols-outlined text-[14px] text-slate-300 group-hover:text-slate-500 transition-colors">
          unfold_more
        </span>
      );
    }
    return (
      <span className="material-symbols-outlined text-[15px] text-blue-900 font-bold">
        {sortDirection === "asc" ? "arrow_upward" : "arrow_downward"}
      </span>
    );
  };

  const startIndex = isAll ? 1 : (currentPage - 1) * pageSize + 1;
  const endIndex = isAll ? totalItems : Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      
      {/* ─── Table Header Card ─── */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-2xs shrink-0">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </div>
          <div>
            <h3 className="text-heading font-bold text-slate-900 text-sm">{title}</h3>
            <p className="text-sub text-slate-500 text-[11px] mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search inside Table */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setPageInput("1");
              }}
              placeholder="ค้นหาในตาราง..."
              className="pl-7 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 w-36 sm:w-44 transition-all"
            />
          </div>

          <span className={badgeClass}>{badgeText}</span>
        </div>
      </div>

      {/* ─── 2. Filter & Sort Control Bar ─── */}
      <div className="p-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-semibold">
          <span className="material-symbols-outlined text-blue-900 text-[16px]">tune</span>
          <span>ตัวกรองและจัดเรียงข้อมูล:</span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-500">เรียงตาม:</span>
          <select
            value={sortField && sortDirection ? `${sortField}:${sortDirection}` : ""}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setSortField(null);
                setSortDirection(null);
              } else {
                const [f, dir] = val.split(":");
                setSortField(f as SortField);
                setSortDirection(dir as SortDirection);
              }
              setCurrentPage(1);
              setPageInput("1");
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-900 cursor-pointer"
          >
            <option value="">ค่าเริ่มต้น (Default)</option>
            <option value="csatRate:desc">CSAT Score (สูงสุด → ต่ำสุด)</option>
            <option value="csatRate:asc">CSAT Score (ต่ำสุด → สูงสุด)</option>
            <option value="totalVotes:desc">Total Votes (มากสุด → น้อยสุด)</option>
            <option value="satisfiedCount:desc">Satisfied ดี (มากสุด → น้อยสุด)</option>
            <option value="unsatisfiedCount:desc">Unsatisfied แย่ (มากสุด → น้อยสุด)</option>
            <option value="name:asc">{nameColumnLabel} (ก → ฮ / A → Z)</option>
          </select>
        </div>
      </div>

      {/* ─── Responsive Table ─── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider select-none">
              
              {/* Name Column */}
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>{nameColumnLabel}</span>
                  {renderSortIcon("name")}
                </div>
              </th>

              {/* Satisfied */}
              <th
                onClick={() => handleSort("satisfiedCount")}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Satisfied (ดี)</span>
                  {renderSortIcon("satisfiedCount")}
                </div>
              </th>

              {/* Neutral */}
              <th
                onClick={() => handleSort("neutralCount")}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Neutral (กลาง)</span>
                  {renderSortIcon("neutralCount")}
                </div>
              </th>

              {/* Unsatisfied */}
              <th
                onClick={() => handleSort("unsatisfiedCount")}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Unsatisfied (แย่)</span>
                  {renderSortIcon("unsatisfiedCount")}
                </div>
              </th>

              {/* Total Votes */}
              <th
                onClick={() => handleSort("totalVotes")}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Total Votes</span>
                  {renderSortIcon("totalVotes")}
                </div>
              </th>

              {/* CSAT Score */}
              <th
                onClick={() => handleSort("csatRate")}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors group whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>CSAT Score</span>
                  {renderSortIcon("csatRate")}
                </div>
              </th>

              {/* Status / Trend */}
              <th className="py-3 px-4 text-center whitespace-nowrap">Status / Trend</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-body">
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                  {searchTerm ? `ไม่พบข้อมูลที่ตรงกับ "${searchTerm}"` : "ยังไม่มีข้อมูลผลการประเมินในขณะนี้"}
                </td>
              </tr>
            ) : (
              pagedData.map((row) => {
                const isExcellent = row.csatRate >= 92;
                const isNeedsCheck = row.csatRate < 88;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Name & Sub-details */}
                    <td className="py-3.5 px-4">
                      <div className="text-body font-bold text-slate-900">{row.name}</div>
                      {row.subLabel && (
                        <div className="text-sub font-mono text-[11px] text-slate-400 mt-0.5">
                          {row.subLabel}
                        </div>
                      )}
                    </td>

                    {/* Satisfied */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="text-body font-bold text-emerald-700">
                        {row.satisfiedCount ? row.satisfiedCount.toLocaleString() : "-"}
                      </span>
                      {row.totalVotes > 0 && (
                        <span className="text-sub text-[10px] text-slate-400 block">
                          ({((row.satisfiedCount / (row.totalVotes || 1)) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </td>

                    {/* Neutral */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="text-body font-bold text-amber-700">
                        {row.neutralCount ? row.neutralCount.toLocaleString() : "-"}
                      </span>
                      {row.totalVotes > 0 && (
                        <span className="text-sub text-[10px] text-slate-400 block">
                          ({((row.neutralCount / (row.totalVotes || 1)) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </td>

                    {/* Unsatisfied */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="text-body font-bold text-rose-700">
                        {row.unsatisfiedCount ? row.unsatisfiedCount.toLocaleString() : "-"}
                      </span>
                      {row.totalVotes > 0 && (
                        <span className="text-sub text-[10px] text-slate-400 block">
                          ({((row.unsatisfiedCount / (row.totalVotes || 1)) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </td>

                    {/* Total Votes */}
                    <td className="py-3.5 px-4 text-center text-body font-bold text-slate-900 whitespace-nowrap">
                      {row.totalVotes ? row.totalVotes.toLocaleString() : "-"}
                    </td>

                    {/* CSAT Score % */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`font-mono font-extrabold text-sm ${
                          isExcellent
                            ? "text-emerald-700"
                            : isNeedsCheck
                            ? "text-rose-600"
                            : "text-blue-900"
                        }`}
                      >
                        {row.csatRate ? `${row.csatRate}%` : "-"}
                      </span>
                    </td>

                    {/* Status & Trend */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {row.trendText ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            row.isUp
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {row.isUp ? "trending_up" : "trending_down"}
                          </span>
                          {row.trendText}
                        </span>
                      ) : (
                        <span className="text-sub text-slate-400">-</span>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination Footer ─── */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        
        {/* Left: Summary Info */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-500 whitespace-nowrap">
            {totalItems === 0 ? (
              "0 รายการ"
            ) : (
              <>
                แสดง <span className="font-bold text-slate-800">{startIndex} - {endIndex}</span> จากทั้งหมด{" "}
                <span className="font-bold text-slate-800">{totalItems.toLocaleString()}</span> รายการ
              </>
            )}
          </span>

          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 whitespace-nowrap">
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
              <option value={5}>5 แถว</option>
              <option value={10}>10 แถว</option>
              <option value={20}>20 แถว</option>
              <option value={50}>50 แถว</option>
              <option value={-1}>ทั้งหมด (All)</option>
            </select>
          </div>
        </div>

        {/* Right: Page Navigation with Jump-to-Page Input [ 2 ] / 99 */}
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

            {/* Jump-to-Page Input (e.g. 2 / 99) */}
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
                title="พิมพ์เลขหน้าแล้วกด Enter เพื่อเปลี่ยนหน้า"
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

    </div>
  );
}
