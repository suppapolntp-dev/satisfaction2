"use client";

import React from "react";
import { PermissionRow, PermissionKey } from "@/Types/role";

export type { PermissionRow, PermissionKey };

interface RolePermissionTableProps {
  permissionData: PermissionRow[];
  onPermissionChange: (moduleName: string, permissionField: PermissionKey) => void;
}

const PERMISSION_FIELD_KEYS: PermissionKey[] = ["view", "create", "update", "delete", "export"];

// ==========================================================================
// ─── 2. MAIN ROLE PERMISSION TABLE COMPONENT
// ==========================================================================
export default function RolePermissionTable({
  permissionData,
  onPermissionChange,
}: RolePermissionTableProps) {
  if (permissionData.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No permissions configured for this role
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
      <table className="w-full border-collapse text-left text-xs">
        {/* ─── TABLE HEADER ─── */}
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold text-[11px] uppercase tracking-wider select-none">
            <th className="p-3.5 pl-5">Module / Feature</th>
            {PERMISSION_FIELD_KEYS.map((permissionKey) => (
              <th key={permissionKey} className="p-3.5 text-center font-bold">
                {permissionKey}
              </th>
            ))}
          </tr>
        </thead>

        {/* ─── TABLE BODY ─── */}
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {permissionData.map((singlePermissionRow) => (
            <tr 
              key={singlePermissionRow.module} 
              className="hover:bg-slate-50/70 transition-colors"
            >
              <td className="p-3.5 pl-5 font-semibold text-slate-800">
                {singlePermissionRow.module}
              </td>
              {PERMISSION_FIELD_KEYS.map((permissionKey) => (
                <td key={permissionKey} className="p-3.5 text-center">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={singlePermissionRow[permissionKey]}
                      onChange={() => onPermissionChange(singlePermissionRow.module, permissionKey)}
                      aria-label={`${permissionKey} permission for ${singlePermissionRow.module}`}
                      className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900/20 cursor-pointer accent-blue-900 transition-all hover:scale-110"
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}