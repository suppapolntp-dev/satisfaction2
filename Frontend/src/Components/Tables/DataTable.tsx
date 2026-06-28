"use client";

import React, { useState, useMemo } from "react";
// เชื่อมต่อโมดูลปุ่มคำสั่งย่อยท้ายตารางที่เราแยกชิ้นส่วนไว้ด้านบน
import TableDropdown, { DropdownActionItem } from "@/Components/Dropdowns/TableDropdown";

// พิมพ์เขียวดีไซน์โครงสร้างคอลัมน์ของหัวตาราง (Item 3)
export interface TableColumn<T> {
  key: keyof T | "actions"; // คีย์ข้อมูลในวัตถุ หรือระบุเป็นช่อง actions พิเศษ
  label: string;            // ข้อความพาดหัว
  sortable?: boolean;       // เปิด-ปิดสิทธิ์การกดจัดเรียงข้อมูลประจำเลน
  render?: (row: T) => React.ReactNode; // สล็อตสำหรับแต่ง UI คัสตอม (เช่น รูป หรือ Badge)
}

// พิมพ์เขียวสัญญานปุ่มควบคุมคำสั่งย่อยประจำแถว
export interface TableAction<T> {
  label: string;
  icon: string;
  onClick: (row: T) => void;
  variant?: "default" | "danger";
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: TableAction<T>[]; // หากหน้าใดส่งปุ่มสั่งการมา ระบบจะเบิกล็อกเลนขวาสุดให้ทันที
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  actions,
  emptyMessage = "ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา",
}: DataTableProps<T>) {
  
  // สถานะสเตตัสการจำลองและจดจำตรรกะระบบคัดกรองเรียงลำดับข้อมูล (Item 1: Sorting States)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });

  // ฟังก์ชันสลับสถานะของ ปุ่ม Sort (สลับ 3 จังหวะ: น้อยไปมาก -> มากไปน้อย -> ปิดระบบ)
  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  // ตรรกะอัจฉริยะประมวลผลคัดแยกสลับลำดับตัวอักษรและตัวเลข (Smart Alphanumeric Sorting Engine)
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];

      if (aVal === bVal) return 0;
      
      const modifier = sortConfig.direction === "asc" ? 1 : -1;
      
      // กรณีข้อมูลเป็นตัวเลขความสูงต่ำ (Numbers)
      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * modifier;
      }
      
      // กรณีข้อมูลเป็นตัวอักษรข้อความทั่วไป (Strings)
      return String(aVal).localeCompare(String(bVal)) * modifier;
    });
  }, [data, sortConfig]);

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider select-none">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3 px-4 ${col.key === "actions" ? "text-right w-16" : ""}`}
              >
                {/* ชิ้นที่ 1: ตรวจเช็กเงื่อนไขหากเลนนี้ได้รับสิทธิ์ sortable ให้ขึ้นรูปปุ่มจัดเรียงลำดับ */}
                {col.sortable && col.key !== "actions" ? (
                  <button
                    type="button"
                    onClick={() => handleSort(col.key as keyof T)}
                    className="inline-flex items-center gap-1 hover:text-blue-900 transition-colors outline-none cursor-pointer touch-manipulation font-bold"
                  >
                    {col.label}
                    <span className="material-symbols-outlined text-[14px] font-bold">
                      {sortConfig.key === col.key
                        ? sortConfig.direction === "asc"
                          ? "arrow_upward"
                          : "arrow_downward"
                        : "unfold_more"}
                    </span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="text-xs text-neutral-700 divide-y divide-slate-100">
          {sortedData.length > 0 ? (
            sortedData.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className={`hover:bg-slate-50/80 transition-colors h-14 ${
                  rowIdx % 2 === 1 ? "bg-slate-50/30" : "bg-white"
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-2 px-4 ${col.key === "actions" ? "text-right" : ""}`}
                  >
                    {/* กรณีระบุคีย์ช่องเป็น Actions พิเศษ ให้ดึง TableDropdown สวมทำงานประกบท้ายแถว */}
                    {col.key === "actions" && actions ? (
                      <TableDropdown
                        actions={actions.map((act) => ({
                          label: act.label,
                          icon: act.icon,
                          variant: act.variant,
                          onClick: () => act.onClick(row), // ส่งวัตถุข้อมูลแถวนั้นกลับคืนไปให้ฟังชันหลักใช้งาน
                        }))}
                      />
                    ) : col.render ? (
                      /* กรณีมีการส่ง Layout คัสตอมเฉพาะเลนเข้ามาสวม */
                      col.render(row)
                    ) : (
                      /* กรณีแสดงผลข้อความ Text ธรรมดาทั่วไปตาม Key */
                      <span className="font-medium text-neutral-800">{row[col.key as string]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            /* กรณีคัดกรองพิมพ์ค้นหาแล้วไม่มีข้อมูลตกถึงตาราง */
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-xs font-medium text-neutral-400 select-none"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}   