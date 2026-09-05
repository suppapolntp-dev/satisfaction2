"use client";

import React, { useState, useEffect } from "react";
import { TierLevelModel } from "@/Types/tierLevel";

export interface TierLevelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTier: TierLevelModel | null;
  onSave: (tierData: Omit<TierLevelModel, "id" | "isSystemDefault">) => Promise<void> | void;
}

export default function TierLevelFormModal({
  isOpen,
  onClose,
  editingTier,
  onSave,
}: TierLevelFormModalProps) {
  const [levelOrder, setLevelOrder] = useState<number>(1);
  const [tierCode, setTierCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [description, setDescription] = useState("");
  const [scopeDimension, setScopeDimension] = useState<TierLevelModel["scopeDimension"]>("Brand");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Permissions checkboxes
  const [canSuperAdmin, setCanSuperAdmin] = useState(false);
  const [canBrandRegional, setCanBrandRegional] = useState(true);
  const [canRegionalProvince, setCanRegionalProvince] = useState(true);
  const [canProvincialBranch, setCanProvincialBranch] = useState(true);
  const [canBranchKiosks, setCanBranchKiosks] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingTier) {
      setLevelOrder(editingTier.levelOrder);
      setTierCode(editingTier.tierCode);
      setNameTh(editingTier.nameTh);
      setNameEn(editingTier.nameEn);
      setDescription(editingTier.description || "");
      setScopeDimension(editingTier.scopeDimension);
      setStatus(editingTier.status);
      setCanSuperAdmin(editingTier.canViewSuperAdminOverview);
      setCanBrandRegional(editingTier.canViewBrandRegionalGrid);
      setCanRegionalProvince(editingTier.canViewRegionalProvinceGrid);
      setCanProvincialBranch(editingTier.canViewProvincialBranchGrid);
      setCanBranchKiosks(editingTier.canViewBranchKiosksGrid);
    } else {
      setLevelOrder(7);
      setTierCode("");
      setNameTh("");
      setNameEn("");
      setDescription("");
      setScopeDimension("Brand");
      setStatus("Active");
      setCanSuperAdmin(false);
      setCanBrandRegional(true);
      setCanRegionalProvince(true);
      setCanProvincialBranch(true);
      setCanBranchKiosks(true);
    }
    setErrorMsg("");
  }, [editingTier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tierCode.trim() || !nameTh.trim()) {
      setErrorMsg("กรุณากรอกรหัสระดับสิทธิ์ (Tier Code) และชื่อภาษาไทย");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        levelOrder: Number(levelOrder) || 1,
        tierCode: tierCode.trim().toUpperCase(),
        nameTh: nameTh.trim(),
        nameEn: nameEn.trim() || nameTh.trim(),
        description: description.trim(),
        scopeDimension,
        canViewSuperAdminOverview: canSuperAdmin,
        canViewBrandRegionalGrid: canBrandRegional,
        canViewRegionalProvinceGrid: canRegionalProvince,
        canViewProvincialBranchGrid: canProvincialBranch,
        canViewBranchKiosksGrid: canBranchKiosks,
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {editingTier ? `แก้ไขระดับสิทธิ์: ${editingTier.nameTh}` : "เพิ่มระดับสิทธิ์องค์กรใหม่ (New Tier Level)"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                กำหนดลำดับขั้นการบังคับบัญชาและสิทธิ์การเข้าถึงข้อมูล Dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-rose-600">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Level Order */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ลำดับขั้น (Level Order) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={levelOrder}
                onChange={(e) => setLevelOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">1 = สูงสุด (เช่น Super Admin)</span>
            </div>

            {/* Tier Code */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                รหัสระดับสิทธิ์ (Tier Code) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={Boolean(editingTier?.isSystemDefault)}
                value={tierCode}
                onChange={(e) => setTierCode(e.target.value.toUpperCase())}
                placeholder="เช่น CLUSTER_MGR"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white disabled:opacity-60"
              />
            </div>
          </div>

          {/* Thai Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              ชื่อระดับสิทธิ์ (ภาษาไทย) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              placeholder="เช่น ผู้จัดการกลุ่มคลัสเตอร์ (Cluster Manager)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white"
            />
          </div>

          {/* English Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              ชื่อระดับสิทธิ์ (ภาษาอังกฤษ)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="เช่น Cluster Manager"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              คำอธิบายหน้าที่ / ขอบเขตความรับผิดชอบ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุหน้าที่และการเข้าถึงข้อมูลของระดับนี้"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scope Dimension */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                มิติขอบเขตหลัก (Scope Dimension) <span className="text-rose-500">*</span>
              </label>
              <select
                value={scopeDimension}
                onChange={(e) => setScopeDimension(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-900"
              >
                <option value="Global">ระดับองค์กรทั้งหมด (Global)</option>
                <option value="Brand">ระดับแบรนด์ (Brand Scope)</option>
                <option value="Region">ระดับภูมิภาค (Region Scope)</option>
                <option value="Province">ระดับจังหวัด / เขต (Province Scope)</option>
                <option value="Branch">ระดับสาขา (Branch Scope)</option>
                <option value="Custom">ระดับกำหนดเอง (Custom Scope)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                สถานะ (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-900"
              >
                <option value="Active">เปิดใช้งาน (Active)</option>
                <option value="Inactive">ปิดใช้งาน (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Dashboard Permissions Checklist */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              สิทธิ์การเข้าถึงข้อมูล Dashboard 5 ระดับ (Dashboard Access Permissions)
            </label>
            <div className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={canSuperAdmin}
                  onChange={(e) => setCanSuperAdmin(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span>1. มองเห็นภาพรวมระดับองค์กรสูงสุด (Super Admin Overview)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={canBrandRegional}
                  onChange={(e) => setCanBrandRegional(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span>2. มองเห็นตารางแยกตามแบรนด์และภูมิภาค (Brand Regional Grid)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={canRegionalProvince}
                  onChange={(e) => setCanRegionalProvince(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span>3. มองเห็นตารางแยกตามจังหวัดในภูมิภาค (Regional Province Grid)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={canProvincialBranch}
                  onChange={(e) => setCanProvincialBranch(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span>4. มองเห็นตารางเปรียบเทียบสาขาในจังหวัด (Provincial Branch Grid)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={canBranchKiosks}
                  onChange={(e) => setCanBranchKiosks(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span>5. มองเห็นข้อมูลตู้ Kiosk ประจำสาขา (Branch Kiosks Grid)</span>
              </label>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary text-xs flex items-center gap-2 shadow-sm"
          >
            {isSubmitting && (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            )}
            <span>{isSubmitting ? "กำลังบันทึก..." : editingTier ? "บันทึกการแก้ไข" : "สร้างระดับสิทธิ์"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

