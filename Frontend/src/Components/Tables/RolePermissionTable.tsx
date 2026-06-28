"use client";

import React from "react";

export interface PermissionRow {
  module: string;
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
}

export type PermissionKey = keyof Omit<PermissionRow, "module">;

interface RolePermissionTableProps {
  permissionData: PermissionRow[];
  onPermissionChange: (moduleName: string, field: PermissionKey) => void;
}

const PERMISSION_FIELDS: PermissionKey[] = ["view", "create", "update", "delete", "export"];

export default function RolePermissionTable({
  permissionData,
  onPermissionChange,
}: RolePermissionTableProps) {
  if (permissionData.length === 0) {
    return (
      <div className="p-12 text-center text-sm text-[var(--on-surface-variant)] bg-[var(--surface-container-low)]/50 rounded-xl border border-dashed border-[var(--outline-variant)]">
        No permissions configured for this role
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--outline-variant)] bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-variant)]/40 text-[var(--on-surface-variant)] font-semibold text-xs uppercase tracking-wider">
            <th className="p-4 pl-6">Module / Feature</th>
            {PERMISSION_FIELDS.map((field) => (
              <th key={field} className="p-4 text-center font-bold">
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--outline-variant)] text-[var(--on-surface)]">
          {permissionData.map((singleRow) => (
            <tr 
              key={singleRow.module} 
              className="hover:bg-[var(--primary-container)]/[0.02] transition-colors duration-150"
            >
              <td className="p-4 pl-6 font-medium text-gray-800">{singleRow.module}</td>
              {PERMISSION_FIELDS.map((field) => (
                <td key={field} className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={singleRow[field]}
                      onChange={() => onPermissionChange(singleRow.module, field)}
                      aria-label={`${field} ${singleRow.module}`}
                      className="w-4 h-4 rounded border-[var(--outline)] text-[var(--primary-container)] focus:ring-[var(--primary-container)] focus:ring-offset-0 cursor-pointer accent-[var(--primary-container)] transition-all shadow-sm hover:scale-105"
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