"use client";

import React, { useState, useEffect } from "react";
import { SystemRoleItem } from "@/Types/role";

export interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRole: SystemRoleItem | null;
  existingRoles: SystemRoleItem[];
  onSave: (roleData: {
    roleId: string;
    roleName: string;
    roleDescription: string;
    roleStatus: "Active" | "Inactive";
    cloneFromRole?: string;
  }) => Promise<void> | void;
}

export default function RoleModal({
  isOpen,
  onClose,
  editingRole,
  existingRoles,
  onSave,
}: RoleModalProps) {
  const [formRoleName, setFormRoleName] = useState("");
  const [formRoleId, setFormRoleId] = useState("");
  const [formRoleDescription, setFormRoleDescription] = useState("");
  const [formCloneFromRole, setFormCloneFromRole] = useState(existingRoles[0]?.roleId || "");
  const [formRoleStatus, setFormRoleStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    if (editingRole) {
      setFormRoleName(editingRole.roleName || "");
      setFormRoleId(editingRole.roleId || "");
      setFormRoleDescription(editingRole.roleDescription || "");
      setFormRoleStatus(editingRole.roleStatus || "Active");
    } else {
      setFormRoleName("");
      setFormRoleId(`ROLE_${Date.now()}`);
      setFormRoleDescription("");
      setFormCloneFromRole(existingRoles[0]?.roleId || "");
      setFormRoleStatus("Active");
    }
  }, [editingRole, isOpen, existingRoles]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName.trim()) return;

    await onSave({
      roleId: editingRole ? editingRole.roleId : (formRoleId.trim() || `ROLE_${Date.now()}`),
      roleName: formRoleName.trim(),
      roleDescription: formRoleDescription.trim(),
      roleStatus: formRoleStatus,
      cloneFromRole: !editingRole ? formCloneFromRole : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-2xl">
              {editingRole ? "edit_moderator" : "add_moderator"}
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              {editingRole ? "Edit Role Details" : "Create New System Role"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
          
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">ชื่อบทบาท (Role Name) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formRoleName}
              onChange={(e) => setFormRoleName(e.target.value)}
              placeholder="e.g., Terminal Operations Supervisor"
              className="input-text w-full font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">รหัสบทบาท (Role Code / ID)</label>
              <input
                type="text"
                value={formRoleId}
                disabled={!!editingRole}
                onChange={(e) => setFormRoleId(e.target.value)}
                placeholder="ROLE_SUPERVISOR"
                className="input-text w-full font-mono text-slate-600"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">สถานะ (Status)</label>
              <select
                value={formRoleStatus}
                onChange={(e) => setFormRoleStatus(e.target.value as "Active" | "Inactive")}
                className="input-select w-full font-bold"
              >
                <option value="Active">Active (เปิดใช้งาน)</option>
                <option value="Inactive">Inactive (ปิดใช้งาน)</option>
              </select>
            </div>
          </div>

          {!editingRole && existingRoles.length > 0 && (
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="font-bold text-slate-800 block">คัดลอกสิทธิ์เริ่มต้นจากบทบาทอื่น (Copy Permissions From)</label>
              <select
                value={formCloneFromRole}
                onChange={(e) => setFormCloneFromRole(e.target.value)}
                className="input-select w-full bg-white font-semibold"
              >
                {existingRoles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName} ({r.roleId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">คำอธิบายหน้าที่ความรับผิดชอบ (Description)</label>
            <textarea
              rows={2}
              value={formRoleDescription}
              onChange={(e) => setFormRoleDescription(e.target.value)}
              placeholder="ระบุหน้าที่และขอบเขตความรับผิดชอบของบทบาทนี้..."
              className="input-text w-full leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary shadow-xs"
            >
              {editingRole ? "Save Changes" : "Create Role"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

