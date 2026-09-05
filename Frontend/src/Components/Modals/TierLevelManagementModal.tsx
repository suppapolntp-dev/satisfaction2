"use client";

import React, { useState } from "react";
import { TierLevelModel } from "@/Types/tierLevel";

export interface TierLevelManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierLevels: TierLevelModel[];
  onOpenCreate: () => void;
  onOpenEdit: (tier: TierLevelModel) => void;
  onDelete: (tier: TierLevelModel) => void;
}

export default function TierLevelManagementModal({
  isOpen,
  onClose,
  tierLevels,
  onOpenCreate,
  onOpenEdit,
  onDelete,
}: TierLevelManagementModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filtered = tierLevels.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.nameTh.toLowerCase().includes(q) ||
      t.nameEn.toLowerCase().includes(q) ||
      t.tierCode.toLowerCase().includes(q) ||
      t.scopeDimension.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">military_tech</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                จัดการระดับสิทธิ์องค์กร (Tier Level Governance)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                กำหนดลำดับสิทธิ์การเข้าถึงข้อมูล 5 ระดับเดิม พร้อมรองรับการเพิ่มระดับสิทธิ์ใหม่ในอนาคต
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCreate}
              className="btn-primary text-xs flex items-center gap-1.5 shadow-xs py-1.5 px-3"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>+ เพิ่มระดับสิทธิ์ใหม่</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาระดับสิทธิ์..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-900 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            ทั้งหมด <span className="font-bold text-slate-900">{filtered.length}</span> ระดับ
          </span>
        </div>

        {/* Content Table / Cards */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              ไม่พบระดับสิทธิ์ที่ค้นหา
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
              {filtered.map((tier) => (
                <div
                  key={tier.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Level Order Circle Badge */}
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                      Lv.{tier.levelOrder}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{tier.nameTh}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.2 rounded border border-slate-200">
                          {tier.tierCode}
                        </span>
                        {tier.isSystemDefault && (
                          <span className="text-[9px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                            System Default
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            tier.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {tier.status}
                        </span>
                      </div>

                      {tier.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{tier.description}</p>
                      )}

                      {/* Scope & Permissions tags */}
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-600 pt-1">
                        <span className="font-bold text-slate-700">มิติหลัก:</span>
                        <span className="bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200 font-medium">
                          {tier.scopeDimension} Scope
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-slate-700">สิทธิ์ Dashboard:</span>
                        {tier.canViewSuperAdminOverview && <span className="bg-slate-100 px-1 rounded">Super Admin</span>}
                        {tier.canViewBrandRegionalGrid && <span className="bg-slate-100 px-1 rounded">Brand/Region</span>}
                        {tier.canViewRegionalProvinceGrid && <span className="bg-slate-100 px-1 rounded">Province</span>}
                        {tier.canViewProvincialBranchGrid && <span className="bg-slate-100 px-1 rounded">Branch</span>}
                        {tier.canViewBranchKiosksGrid && <span className="bg-slate-100 px-1 rounded">Kiosks</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(tier)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                      title="แก้ไขระดับสิทธิ์"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    {!tier.isSystemDefault ? (
                      <button
                        type="button"
                        onClick={() => onDelete(tier)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="ลบระดับสิทธิ์"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    ) : (
                      <span
                        className="p-1.5 text-slate-300 cursor-not-allowed"
                        title="ระดับสิทธิ์หลักของระบบไม่สามารถลบได้"
                      >
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}

