"use client";

import React from "react";
import { PermissionRow, PermissionKey } from "@/Types/role";
import { useRolePermissionTable } from "./useRolePermissionTable";

export interface RolePermissionTableProps {
  permissionData: PermissionRow[];
  onPermissionChange: (moduleName: string, permissionField: PermissionKey) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export default function RolePermissionTable({
  permissionData,
  onPermissionChange,
  isLoading = false,
  readOnly = false,
  searchQuery,
  className = "",
}: RolePermissionTableProps) {
  const { filteredPermissions, permissionFieldKeys } = useRolePermissionTable({
    permissionData,
    searchQuery,
  });

  // ─── 1. LOADING STATE (Skeleton Rows) ───
  if (isLoading) {
    return (
      <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs ${className}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`perm-skeleton-${index}`} className="flex items-center justify-between p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-48" />
              <div className="flex gap-8">
                {Array.from({ length: 5 }).map((__, colIdx) => (
                  <div key={`col-skel-${colIdx}`} className="w-5 h-5 bg-slate-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── 2. EMPTY STATE ───
  if (permissionData.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <svg
          className="w-10 h-10 mx-auto text-slate-300 mb-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <p className="font-semibold text-slate-600">ยังไม่มีข้อมูลสิทธิ์ในบทบาทนี้</p>
        <p className="text-slate-400 mt-1">กรุณาเลือกบทบาทอื่นจากรายการด้านซ้าย หรือสร้างบทบาทใหม่</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs ${className}`}>
      <table className="w-full border-collapse text-left text-xs">
        {/* ─── TABLE HEADER ─── */}
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold text-[11px] uppercase tracking-wider select-none">
            <th className="p-3.5 pl-5 min-w-[220px]">
              Module / Feature (โมดูลและฟังก์ชัน)
            </th>
            {permissionFieldKeys.map((permissionKey) => (
              <th key={permissionKey} className="p-3.5 text-center font-bold min-w-[90px]">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="capitalize">{permissionKey}</span>
                  <span className="text-[9px] font-normal text-slate-400 lowercase">
                    {permissionKey === "view" && "ดูข้อมูล"}
                    {permissionKey === "create" && "สร้างใหม่"}
                    {permissionKey === "update" && "แก้ไข"}
                    {permissionKey === "delete" && "ลบ"}
                    {permissionKey === "export" && "ส่งออก"}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* ─── TABLE BODY ─── */}
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {filteredPermissions.map((singlePermissionRow) => (
            <tr
              key={singlePermissionRow.module}
              className="hover:bg-slate-50/70 transition-colors group"
            >
              <td className="p-3.5 pl-5 font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-900 transition-colors" />
                  <span>{singlePermissionRow.module}</span>
                </div>
              </td>

              {permissionFieldKeys.map((permissionKey) => {
                const isChecked = Boolean(singlePermissionRow[permissionKey]);

                return (
                  <td key={permissionKey} className="p-3.5 text-center">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={readOnly}
                        onChange={() => onPermissionChange(singlePermissionRow.module, permissionKey)}
                        aria-label={`${permissionKey} permission for ${singlePermissionRow.module}`}
                        className={`w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900/20 accent-blue-900 transition-all ${
                          readOnly
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:scale-110 active:scale-95"
                        }`}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}

          {filteredPermissions.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-400">
                ไม่พบโมดูลที่ตรงกับคำค้นหา
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
