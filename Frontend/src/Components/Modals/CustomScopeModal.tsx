"use client";

import React, { useState, useEffect } from "react";
import { CustomScopeGroup } from "@/Types/dataAccess";

export interface CustomScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingScope: CustomScopeGroup | null;
  availableBrands?: string[];
  availableBranches?: string[];
  onSave: (scopeData: {
    name: string;
    description: string;
    brands: string[];
    branches: string[];
  }) => Promise<void> | void;
}

export default function CustomScopeModal({
  isOpen,
  onClose,
  editingScope,
  availableBrands = [],
  availableBranches = [],
  onSave,
}: CustomScopeModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingScope) {
      setName(editingScope.name);
      setDescription(editingScope.description || "");
      setSelectedBrands(editingScope.brands || []);
      setSelectedBranches(editingScope.branches || []);
    } else {
      setName("");
      setDescription("");
      setSelectedBrands([]);
      setSelectedBranches([]);
    }
    setErrorMsg("");
  }, [editingScope, isOpen]);

  if (!isOpen) return null;

  const toggleBrand = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };

  const toggleBranch = (branchName: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branchName) ? prev.filter((b) => b !== branchName) : [...prev, branchName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("กรุณากรอกชื่อกลุ่มสโคป");
      return;
    }
    if (selectedBrands.length === 0) {
      setErrorMsg("กรุณาเลือกแบรนด์อย่างน้อย 1 แบรนด์ (หรือเลือก 2+ แบรนด์สำหรับสาขา Co-location)");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        description: description.trim(),
        brands: selectedBrands,
        branches: selectedBranches,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {editingScope ? "แก้ไขกลุ่มสโคปกำหนดเอง" : "สร้างกลุ่มสโคปกำหนดเอง (Custom Scope)"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                รวมแบรนด์และสาขาที่อยู่ร่วมกัน (Co-Location / Dual-Brand เช่น Mister Donut + Arigato)
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-rose-600">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Scope Group Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              ชื่อกลุ่มสโคป (Scope Group Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Co-location สาขาเซ็นทรัล (KFC + Pizza Hut)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              รายละเอียด / วัตถุประสงค์ (Description)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น กลุ่มสาขา 2 แบรนด์ในจุดบริการเดียวกันสำหรับผู้จัดการพื้นที่"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition-all"
            />
          </div>

          {/* Brands Selection (Multi-select checkboxes) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-900">branding_watermark</span>
                <span>เลือกแบรนด์ในกลุ่มนี้ (Brands in Scope)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                เลือกแล้ว {selectedBrands.length} แบรนด์
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 max-h-36 overflow-y-auto">
              {availableBrands.map((brandName) => {
                const isChecked = selectedBrands.includes(brandName);
                return (
                  <button
                    key={brandName}
                    type="button"
                    onClick={() => toggleBrand(brandName)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border text-left transition-all cursor-pointer ${
                      isChecked
                        ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="truncate">{brandName}</span>
                    <span className="material-symbols-outlined text-[16px] shrink-0 ml-1">
                      {isChecked ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Branches Selection (Multi-select checkboxes) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-900">storefront</span>
                <span>เลือกสาขาที่อยู่ร่วมกัน (Branches in Scope)</span>
              </label>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                เลือกแล้ว {selectedBranches.length} สาขา
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 max-h-44 overflow-y-auto">
              {availableBranches.length === 0 ? (
                <p className="text-xs text-slate-400 p-2 col-span-2 text-center">ไม่มีข้อมูลสาขา</p>
              ) : (
                availableBranches.map((branchName) => {
                  const isChecked = selectedBranches.includes(branchName);
                  return (
                    <button
                      key={branchName}
                      type="button"
                      onClick={() => toggleBranch(branchName)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between border text-left transition-all cursor-pointer ${
                        isChecked
                          ? "bg-blue-50 text-blue-900 border-blue-200 font-bold"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="truncate">{branchName}</span>
                      <span className="material-symbols-outlined text-[16px] shrink-0 ml-1">
                        {isChecked ? "check_box" : "check_box_outline_blank"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
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
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            )}
            <span>{isSubmitting ? "กำลังบันทึก..." : editingScope ? "บันทึกการแก้ไข" : "สร้างกลุ่มสโคป"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

