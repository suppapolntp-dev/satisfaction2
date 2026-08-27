"use client";

import React, { useState, useEffect } from "react";
import { UserAccessRecord } from "@/Types/dataAccess";

export interface DataAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: UserAccessRecord | null;
  availableBrands?: string[];
  availableBranches?: string[];
  availableRegions?: string[];
  availableProvinces?: string[];
  onSave: (userData: {
    id?: string;
    userId?: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    tierLevel: UserAccessRecord["tierLevel"];
    assignedBrands: string[];
    assignedRegions: string[];
    assignedProvinces: string[];
    assignedBranches: string[];
    status: "Active" | "Inactive";
  }) => Promise<void> | void;
}

export default function DataAccessModal({
  isOpen,
  onClose,
  editingUser,
  availableBrands = [],
  availableBranches = [],
  availableRegions = [],
  availableProvinces = [],
  onSave,
}: DataAccessModalProps) {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formTier, setFormTier] = useState<UserAccessRecord["tierLevel"]>("Area Manager (AM)");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");

  // Multi-Checkbox Arrays
  const [formSelectedBrands, setFormSelectedBrands] = useState<string[]>([]);
  const [formSelectedRegions, setFormSelectedRegions] = useState<string[]>([]);
  const [formSelectedProvinces, setFormSelectedProvinces] = useState<string[]>([]);
  const [formSelectedBranches, setFormSelectedBranches] = useState<string[]>([]);

  useEffect(() => {
    if (editingUser) {
      setFormName(editingUser.userName || "");
      setFormEmail(editingUser.userEmail || "");
      setFormPhone(editingUser.userPhone || "");
      setFormTier(editingUser.tierLevel || "Area Manager (AM)");
      setFormStatus(editingUser.status || "Active");
      setFormSelectedBrands(editingUser.assignedBrands || []);
      setFormSelectedRegions(editingUser.assignedRegions || []);
      setFormSelectedProvinces(editingUser.assignedProvinces || []);
      setFormSelectedBranches(editingUser.assignedBranches || []);
    } else {
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormTier("Area Manager (AM)");
      setFormStatus("Active");
      setFormSelectedBrands([]);
      setFormSelectedRegions([]);
      setFormSelectedProvinces([]);
      setFormSelectedBranches([]);
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const toggleCheckboxItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    await onSave({
      id: editingUser?.id,
      userId: editingUser?.userId,
      userName: formName.trim(),
      userEmail: formEmail.trim(),
      userPhone: formPhone.trim() || "+66 80 000 0000",
      tierLevel: formTier,
      assignedBrands: formSelectedBrands,
      assignedRegions: formSelectedRegions,
      assignedProvinces: formSelectedProvinces,
      assignedBranches: formSelectedBranches,
      status: formStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-2xl">
              {editingUser ? "edit_square" : "person_add"}
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              {editingUser ? "แก้ไขการกำหนดสิทธิ์ Data Access" : "กำหนดสิทธิ์ผู้ใช้ใหม่ (Assign Data Scope)"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">ชื่อ-นามสกุล <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. สมชาย เกียรติสกุล"
              className="input-text w-full font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">อีเมลบัญชีผู้ใช้ <span className="text-rose-500">*</span></label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="somchai@company.com"
                className="input-text w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">ระดับสิทธิ์องค์กร (Tier Level)</label>
              <select
                value={formTier}
                onChange={(e) => setFormTier(e.target.value as UserAccessRecord["tierLevel"])}
                className="input-select w-full font-bold"
              >
                <option value="Super Admin">Super Administrator</option>
                <option value="Brand Owner">Brand Manager / Owner</option>
                <option value="Regional Manager (RM)">Regional Manager (RM)</option>
                <option value="Area Manager (AM)">Area Manager (AM)</option>
                <option value="Branch Staff">Branch Officer / Staff</option>
              </select>
            </div>
          </div>

          {/* Brands Scope */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-900 text-base">store</span>
                ขอบเขตแบรนด์ที่ดูแล (Brands Scope):
              </label>
              {availableBrands.length > 0 && (
                <div className="flex gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFormSelectedBrands(availableBrands)}
                    className="text-blue-900 font-bold hover:underline cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSelectedBrands([])}
                    className="text-slate-400 font-bold hover:underline cursor-pointer"
                  >
                    ล้าง
                  </button>
                </div>
              )}
            </div>

            {availableBrands.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">ยังไม่มีข้อมูลแบรนด์ในระบบ</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {availableBrands.map((brandName) => {
                  const isChecked = formSelectedBrands.includes(brandName);
                  return (
                    <label
                      key={brandName}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-colors ${
                        isChecked ? "bg-blue-50 border-blue-200 text-blue-950 font-bold" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckboxItem(formSelectedBrands, setFormSelectedBrands, brandName)}
                        className="w-3.5 h-3.5 rounded text-blue-900 accent-blue-900 cursor-pointer"
                      />
                      <span className="text-[11px] truncate">{brandName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Regions Scope */}
          {availableRegions.length > 0 && (
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-slate-700 text-base">map</span>
                  ขอบเขตภูมิภาคที่ดูแล (Regions Scope):
                </label>
                <div className="flex gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFormSelectedRegions(availableRegions)}
                    className="text-blue-900 font-bold hover:underline cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSelectedRegions([])}
                    className="text-slate-400 font-bold hover:underline cursor-pointer"
                  >
                    ล้าง
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {availableRegions.map((regionName) => {
                  const isChecked = formSelectedRegions.includes(regionName);
                  return (
                    <label
                      key={regionName}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-colors ${
                        isChecked ? "bg-slate-100 border-slate-300 text-slate-950 font-bold" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckboxItem(formSelectedRegions, setFormSelectedRegions, regionName)}
                        className="w-3.5 h-3.5 rounded text-slate-900 accent-slate-900 cursor-pointer"
                      />
                      <span className="text-[11px] truncate">{regionName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Branches Scope */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <label className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-900 text-base">storefront</span>
                  สาขาเฉพาะเจาะจงที่ดูแล (Branches Scope):
                </label>
              </div>
              {availableBranches.length > 0 && (
                <div className="flex gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFormSelectedBranches(availableBranches)}
                    className="text-blue-900 font-bold hover:underline cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSelectedBranches([])}
                    className="text-slate-400 font-bold hover:underline cursor-pointer"
                  >
                    ล้าง
                  </button>
                </div>
              )}
            </div>

            {availableBranches.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">ยังไม่มีข้อมูลสาขาในระบบ</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-40 overflow-y-auto custom-scrollbar p-1">
                {availableBranches.map((branchName) => {
                  const isChecked = formSelectedBranches.includes(branchName);
                  return (
                    <label
                      key={branchName}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-colors ${
                        isChecked ? "bg-blue-50 border-blue-200 text-blue-950 font-bold shadow-2xs" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckboxItem(formSelectedBranches, setFormSelectedBranches, branchName)}
                        className="w-3.5 h-3.5 rounded text-blue-900 accent-blue-900 cursor-pointer shrink-0"
                      />
                      <span className="text-[11px] truncate">{branchName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
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
              บันทึกสิทธิ์
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

