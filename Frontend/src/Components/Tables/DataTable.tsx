"use client";

import React, { useState, useMemo } from "react";
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

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: TableAction<T>[];
  emptyMessage?: string;
}

// ==========================================================================
// ─── 2. MAIN COMPONENT (DataTable สากลของโปรเจกต์)
// ==========================================================================
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  actions,
  emptyMessage = "ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา",
}: DataTableProps<T>) {
  
  // สถานะเก็บการจัดเรียง (Sorting State)
  const [sortConfiguration, setSortConfiguration] = useState<{
    columnKey: keyof T | null;
    sortDirection: "asc" | "desc" | null;
  }>({ columnKey: null, sortDirection: null });

  // ฟังก์ชันสลับทิศทางการเรียงลำดับ: asc -> desc -> reset
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
  };

  // รวมคอลัมน์ Actions ให้อัตโนมัติ หากผู้ใช้ส่ง props actions มาแต่ไม่ได้เพิ่ม column actions เอง
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

  // ระบบคำนวณการจัดเรียงข้อมูล (Client-side Smart Sorting)
  const sortedTableData = useMemo(() => {
    if (!sortConfiguration.columnKey || !sortConfiguration.sortDirection) {
      return data;
    }

    return [...data].sort((itemA, itemB) => {
      const valueA = itemA[sortConfiguration.columnKey!];
      const valueB = itemB[sortConfiguration.columnKey!];

      if (valueA === valueB) return 0;
      
      const sortMultiplier = sortConfiguration.sortDirection === "asc" ? 1 : -1;
      
      // เปรียบเทียบกรณีตัวเลข
      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * sortMultiplier;
      }
      
      // เปรียบเทียบกรณีตัวอักษร
      return String(valueA ?? "").localeCompare(String(valueB ?? "")) * sortMultiplier;
    });
  }, [data, sortConfiguration]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        {/* ─── TABLE HEADER ─── */}
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider select-none">
            {finalEffectiveColumns.map((tableColumn, columnIndex) => (
              <th
                key={String(tableColumn.key) || columnIndex}
                className={`py-3.5 px-4 ${tableColumn.key === "actions" ? "text-right w-16" : ""}`}
              >
                {tableColumn.sortable && tableColumn.key !== "actions" ? (
                  <button
                    type="button"
                    onClick={() => handleToggleSort(tableColumn.key as keyof T)}
                    className="inline-flex items-center gap-1 hover:text-blue-900 transition-colors outline-none cursor-pointer font-bold"
                  >
                    {tableColumn.label}
                    <span className="material-symbols-outlined text-[14px]">
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
        
        {/* ─── TABLE BODY ─── */}
        <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
          {sortedTableData.length > 0 ? (
            sortedTableData.map((rowRecord, rowIndex) => (
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
  );
}