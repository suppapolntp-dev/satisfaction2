"use client";

import React, { useState, useEffect } from "react";
import { BranchModel } from "@/Types/branch";

export interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBranch: BranchModel | null;
  masterBrands: string[];
  onSave: (branchData: {
    code: string;
    name: string;
    brand: string;
    brands: string[];
    region: string;
    province: string;
    kioskCount: number;
    status: "Active" | "Inactive";
  }) => Promise<void> | void;
}

export default function BranchModal({
  isOpen,
  onClose,
  editingBranch,
  masterBrands,
  onSave,
}: BranchModalProps) {
  const [formBranchName, setFormBranchName] = useState("");
  const [formBranchCode, setFormBranchCode] = useState("");
  const [formBrandsList, setFormBrandsList] = useState<string[]>([]);
  const [formRegion, setFormRegion] = useState("ภาคเหนือ");
  const [formProvince, setFormProvince] = useState("เชียงใหม่");
  const [formKioskCount, setFormKioskCount] = useState(1);
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    if (editingBranch) {
      setFormBranchName(editingBranch.name || "");
      setFormBranchCode(editingBranch.code || "");
      setFormBrandsList(editingBranch.brands && editingBranch.brands.length > 0 ? editingBranch.brands : [editingBranch.brand]);
      setFormRegion(editingBranch.region || "ภาคเหนือ");
      setFormProvince(editingBranch.province || "");
      setFormKioskCount(editingBranch.kioskCount || 1);
      setFormStatus(editingBranch.status || "Active");
    } else {
      setFormBranchName("");
      setFormBranchCode(`CRG-BR-${Math.floor(10 + Math.random() * 80)}`);
      setFormBrandsList([]);
      setFormRegion("ภาคเหนือ");
      setFormProvince("");
      setFormKioskCount(1);
      setFormStatus("Active");
    }
  }, [editingBranch, isOpen]);

  if (!isOpen) return null;

  const toggleBrandCheckbox = (brand: string) => {
    if (formBrandsList.includes(brand)) {
      setFormBrandsList(formBrandsList.filter((b) => b !== brand));
    } else {
      setFormBrandsList([...formBrandsList, brand]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBranchName.trim() || !formBranchCode.trim()) return;

    const brandDisplay = formBrandsList.join(" + ") || "CRG Brand";

    await onSave({
      code: formBranchCode.trim(),
      name: formBranchName.trim(),
      brand: brandDisplay,
      brands: formBrandsList,
      region: formRegion,
      province: formProvince.trim(),
      kioskCount: formKioskCount,
      status: formStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-xl">
                {editingBranch ? "edit_location_alt" : "add_location_alt"}
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {editingBranch ? "แก้ไขข้อมูลสาขา (Edit Branch)" : "เพิ่มสาขาใหม่ (New Branch)"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                จัดการข้อมูลสาขาและเครือข่าย Co-Location ร้านค้าในเครือ CRG
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          
          {/* Branch Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">ชื่อสาขา (Branch Name) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formBranchName}
              onChange={(e) => setFormBranchName(e.target.value)}
              placeholder="e.g. KFC เซ็นทรัล เชียงใหม่ แอร์พอร์ต"
              className="input-text w-full font-semibold"
            />
          </div>

          {/* Branch Code */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">รหัสสาขา (Branch Code) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formBranchCode}
              onChange={(e) => setFormBranchCode(e.target.value)}
              placeholder="e.g. KFC-CNX-01 หรือ MD-ARI-01"
              className="input-text w-full font-mono text-slate-700 font-bold uppercase"
            />
          </div>

          {/* Multi-Brand Selection (Dual-Brand Support) */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-800 block flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-900 text-base">store</span>
                แบรนด์ประจำสาขา (เลือกได้มากกว่า 1 แบรนด์)
              </label>
              <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                เลือก {formBrandsList.length} แบรนด์
              </span>
            </div>

            {masterBrands.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                ยังไม่มีข้อมูลแบรนด์ในระบบ
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {masterBrands.map((brand) => {
                  const isChecked = formBrandsList.includes(brand);
                  return (
                    <label
                      key={brand}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-semibold ${
                        isChecked
                          ? "bg-blue-50/80 border-blue-300 text-blue-900"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBrandCheckbox(brand)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900/20 cursor-pointer accent-blue-900"
                      />
                      <span className="truncate">{brand}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Region & Province */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">ภูมิภาค (Region)</label>
              <select
                value={formRegion}
                onChange={(e) => setFormRegion(e.target.value)}
                className="input-select w-full"
              >
                <option value="ภาคเหนือ">ภาคเหนือ</option>
                <option value="ภาคตะวันออก">ภาคตะวันออก</option>
                <option value="กรุงเทพฯ และปริมณฑล">กรุงเทพฯ และปริมณฑล</option>
                <option value="ภาคใต้">ภาคใต้</option>
                <option value="ภาคตะวันออกเฉียงเหนือ">ภาคตะวันออกเฉียงเหนือ</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">จังหวัด (Province)</label>
              <input
                type="text"
                required
                value={formProvince}
                onChange={(e) => setFormProvince(e.target.value)}
                placeholder="e.g. เชียงใหม่"
                className="input-text w-full font-medium"
              />
            </div>
          </div>

          {/* Kiosk Count & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">จำนวนตู้ Kiosk ประจำสาขา</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={formKioskCount}
                onChange={(e) => setFormKioskCount(parseInt(e.target.value) || 1)}
                className="input-text w-full font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">สถานะสาขา (Status)</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                className="input-select w-full font-bold"
              >
                <option value="Active">Active (เปิดให้บริการ)</option>
                <option value="Inactive">Inactive (ปิดปรับปรุง)</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              บันทึกข้อมูลสาขา
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

