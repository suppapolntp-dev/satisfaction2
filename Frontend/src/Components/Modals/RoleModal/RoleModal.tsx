"use client";

import React from "react";
import { SystemRoleItem } from "@/Types/role";
import { useRoleModal, RoleFormData } from "./useRoleModal";

export interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRole: SystemRoleItem | null;
  existingRoles: SystemRoleItem[];
  onSave: (roleData: RoleFormData) => Promise<void> | void;
}

export default function RoleModal({
  isOpen,
  onClose,
  editingRole,
  existingRoles,
  onSave,
}: RoleModalProps) {
  const {
    formRoleName,
    setFormRoleName,
    formRoleCode,
    setFormRoleCode,
    formRoleDescription,
    setFormRoleDescription,
    formCloneFromRole,
    setFormCloneFromRole,
    formRoleStatus,
    setFormRoleStatus,
    isSubmitting,
    validationError,
    handleSubmit,
  } = useRoleModal({
    isOpen,
    editingRole,
    existingRoles,
    onSave,
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col z-10">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 id="role-modal-title" className="text-base font-extrabold text-slate-900">
                {editingRole ? "แก้ไขบทบาทระบบ (Edit Role)" : "สร้างบทบาทใหม่ (Create New Role)"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                กำหนดชื่อ รหัส และหน้าที่ความรับผิดชอบของบทบาทผู้ใช้งานในระบบ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[calc(85vh-140px)] flex-1">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {validationError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">
              ชื่อบทบาท (Role Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formRoleName}
              onChange={(e) => setFormRoleName(e.target.value)}
              placeholder="เช่น Terminal Operations Supervisor"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                รหัสบทบาท (Role Code / ID)
              </label>
              <input
                type="text"
                value={formRoleCode}
                disabled={!!editingRole}
                onChange={(e) => setFormRoleCode(e.target.value.toUpperCase())}
                placeholder="ROLE_SUPERVISOR"
                className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400 ${
                  editingRole ? "bg-slate-100 cursor-not-allowed opacity-75" : "bg-white"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">สถานะ (Status)</label>
              <select
                value={formRoleStatus}
                onChange={(e) => setFormRoleStatus(e.target.value as "Active" | "Inactive")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
              >
                <option value="Active">Active (เปิดใช้งาน)</option>
                <option value="Inactive">Inactive (ปิดใช้งาน)</option>
              </select>
            </div>
          </div>

          {!editingRole && existingRoles.length > 0 && (
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label className="font-bold text-slate-800 block">
                คัดลอกสิทธิ์เริ่มต้นจากบทบาทอื่น (Copy Permissions From)
              </label>
              <select
                value={formCloneFromRole}
                onChange={(e) => setFormCloneFromRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
              >
                {existingRoles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName} ({r.roleCode || r.roleId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              คำอธิบายหน้าที่ความรับผิดชอบ (Description)
            </label>
            <textarea
              rows={2}
              value={formRoleDescription}
              onChange={(e) => setFormRoleDescription(e.target.value)}
              placeholder="ระบุหน้าที่และขอบเขตความรับผิดชอบของบทบาทนี้..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>{editingRole ? "บันทึกการแก้ไข" : "สร้างบทบาทใหม่"}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
