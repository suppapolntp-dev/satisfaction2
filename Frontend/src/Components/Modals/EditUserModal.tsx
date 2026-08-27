"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SelectInput from "@/Components/Inputs/SelectInput";
import { DashboardTierPermissions } from "@/Lib/dataAccessContext";
import { EditableUserModel } from "@/Types/user";

export type { EditableUserModel };

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EditableUserModel | null;
  availableBrands?: string[];
  availableBranches?: string[];
  availableRegions?: string[];
  availableProvinces?: string[];
  onUserUpdated: (updatedUser: EditableUserModel) => void;
}

// ==========================================================================
// ─── 2. MAIN MODAL COMPONENT
// ==========================================================================
export default function EditUserModal({
  isOpen,
  onClose,
  user,
  availableBrands = [],
  availableBranches = [],
  availableRegions = [],
  availableProvinces = [],
  onUserUpdated,
}: EditUserModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedTier, setSelectedTier] = useState<EditableUserModel["tierLevel"]>("Area Manager (AM)");
  const [selectedRole, setSelectedRole] = useState<EditableUserModel["role"]>("Manager");
  const [isAccountActive, setIsAccountActive] = useState(true);

  // Multi-Select Checkboxes Arrays
  const [formBrands, setFormBrands] = useState<string[]>([]);
  const [formRegions, setFormRegions] = useState<string[]>([]);
  const [formProvinces, setFormProvinces] = useState<string[]>([]);
  const [formBranches, setFormBranches] = useState<string[]>([]);
  
  const [formPerms, setFormPerms] = useState<DashboardTierPermissions>({
    canViewSuperAdminOverview: false,
    canViewBrandRegionalGrid: false,
    canViewRegionalProvinceGrid: false,
    canViewProvincialBranchGrid: true,
    canViewBranchKiosksGrid: true,
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // โหลดข้อมูลผู้ใช้ที่ถูกเลือกเข้าฟอร์มเมื่อ Modal เปิด
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmailAddress(user.email || "");
      setPhoneNumber(user.phone || "");
      setSelectedTier((user.tierLevel as any) || "Area Manager (AM)");
      setSelectedRole((user.role as any) || "Manager");
      setIsAccountActive(user.status === "Active");

      setFormBrands(user.assignedBrands && user.assignedBrands.length > 0 ? user.assignedBrands : user.brand && user.brand !== "-" ? [user.brand] : []);
      setFormRegions(user.assignedRegions && user.assignedRegions.length > 0 ? user.assignedRegions : user.region && user.region !== "-" ? [user.region] : []);
      setFormProvinces(user.assignedProvinces && user.assignedProvinces.length > 0 ? user.assignedProvinces : user.province && user.province !== "-" ? [user.province] : []);
      setFormBranches(user.assignedBranches && user.assignedBranches.length > 0 ? user.assignedBranches : user.branch && user.branch !== "-" ? [user.branch] : []);

      if (user.permissions) {
        setFormPerms(user.permissions);
      }
    }
  }, [user]);

  if (!isOpen || !isMounted || !user) {
    return null;
  }

  const toggleCheckbox = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const computedPerms: DashboardTierPermissions = (() => {
      switch (selectedTier) {
        case "Super Admin":
          return { canViewSuperAdminOverview: true, canViewBrandRegionalGrid: true, canViewRegionalProvinceGrid: true, canViewProvincialBranchGrid: true, canViewBranchKiosksGrid: true };
        case "Brand Owner":
          return { canViewSuperAdminOverview: false, canViewBrandRegionalGrid: true, canViewRegionalProvinceGrid: true, canViewProvincialBranchGrid: true, canViewBranchKiosksGrid: true };
        case "Regional Manager (RM)":
          return { canViewSuperAdminOverview: false, canViewBrandRegionalGrid: false, canViewRegionalProvinceGrid: true, canViewProvincialBranchGrid: true, canViewBranchKiosksGrid: true };
        case "Area Manager (AM)":
          return { canViewSuperAdminOverview: false, canViewBrandRegionalGrid: false, canViewRegionalProvinceGrid: false, canViewProvincialBranchGrid: true, canViewBranchKiosksGrid: true };
        case "Branch Staff":
        case "Custom Scope":
        default:
          return { canViewSuperAdminOverview: false, canViewBrandRegionalGrid: false, canViewRegionalProvinceGrid: false, canViewProvincialBranchGrid: false, canViewBranchKiosksGrid: true };
      }
    })();

    const updatedUserObj: EditableUserModel = {
      ...user,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: emailAddress.trim(),
      phone: phoneNumber.trim() || "",
      tierLevel: selectedTier,
      role: selectedRole,
      status: isAccountActive ? "Active" : "Inactive",
      brand: formBrands.join(", ") || "-",
      assignedBrands: formBrands,
      region: formRegions.join(", ") || "-",
      assignedRegions: formRegions,
      province: formProvinces.join(", ") || "-",
      assignedProvinces: formProvinces,
      branch: formBranches.join(", ") || "-",
      assignedBranches: formBranches,
      permissions: computedPerms,
    };

    onUserUpdated(updatedUserObj);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* ─── MODAL HEADER ─── */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Edit User Profile & Scopes</h2>
            <p className="text-xs text-slate-500 mt-0.5">แก้ไขข้อมูลผู้ใช้และปรับเปลี่ยนขอบเขตแบรนด์/สาขา</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ─── MODAL BODY & FORM ─── */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* First Name Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                ชื่อ (First Name) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-text w-full font-semibold" 
                required 
              />
            </div>

            {/* Last Name Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                นามสกุล (Last Name) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-text w-full font-semibold" 
                required 
              />
            </div>

            {/* Email Address Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                อีเมล (Email Address) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="email" 
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="input-text w-full" 
                required 
              />
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                เบอร์โทรศัพท์
              </label>
              <input 
                type="tel" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+66 (0) 81 234 5678" 
                className="input-text w-full font-mono" 
              />
            </div>

            {/* 5-Tier Hierarchy Level */}
            <div className="space-y-1 sm:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-900 mb-1">
                ระดับขอบเขตสิทธิ์องค์กร (Data Access Tier Level) <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as EditableUserModel["tierLevel"])}
                className="input-select w-full bg-white font-semibold"
              >
                <option value="Super Admin">Super Administrator (ผู้ดูแลระบบระดับองค์กร)</option>
                <option value="Brand Owner">Brand Manager / Owner (ผู้บริหารระดับแบรนด์)</option>
                <option value="Regional Manager (RM)">Regional Manager / RM (ผู้จัดการระดับภูมิภาค)</option>
                <option value="Area Manager (AM)">Area Manager / AM (ผู้จัดการระดับเขต)</option>
                <option value="Branch Staff">Branch Officer / Staff (เจ้าหน้าที่ประจำสาขา)</option>
                <option value="Custom Scope">Custom Scope (กำหนดขอบเขตเฉพาะบุคคล)</option>
              </select>
            </div>

            {/* System Role */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                บทบาทระบบ (System Role) <span className="text-rose-500">*</span>
              </label>
              <SelectInput
                value={selectedRole}
                onChange={(val) => setSelectedRole(val as EditableUserModel["role"])}
                options={[
                  { value: "Administrator", label: "Administrator (ควบคุมระบบ)" },
                  { value: "Manager", label: "Manager (ผู้จัดการ AM / RM)" },
                  { value: "Agent", label: "Agent (เจ้าหน้าที่ปฏิบัติการ Kiosk)" },
                  { value: "Read Only", label: "Read Only (ตรวจสอบรายงานอย่างเดียว)" }
                ]}
              />
            </div>

          </div>

          {/* ─── 1. CHECKBOXES: แบรนด์ที่ดูแล (BRANDS) ─── */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center">
              <label className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-900 text-base">store</span>
                แบรนด์ที่ดูแล (Brands Scope):
              </label>
              {availableBrands.length > 0 && (
                <div className="flex gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFormBrands(availableBrands)}
                    className="text-blue-900 font-bold hover:underline cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormBrands([])}
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
                  const isChecked = formBrands.includes(brandName);
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
                        onChange={() => toggleCheckbox(formBrands, setFormBrands, brandName)}
                        className="w-3.5 h-3.5 rounded text-blue-900 accent-blue-900 cursor-pointer"
                      />
                      <span className="text-[11px] truncate">{brandName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── 2. CHECKBOXES: ภาคที่ดูแล (REGIONS) ─── */}
          {availableRegions.length > 0 && (
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-700 text-base">map</span>
                  ภูมิภาคที่ดูแล (Regions Scope):
                </label>
                <div className="flex gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFormRegions(availableRegions)}
                    className="text-blue-900 font-bold hover:underline cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRegions([])}
                    className="text-slate-400 font-bold hover:underline cursor-pointer"
                  >
                    ล้าง
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {availableRegions.map((regionName) => {
                  const isChecked = formRegions.includes(regionName);
                  return (
                    <label
                      key={regionName}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-colors ${
                        isChecked ? "bg-emerald-50 border-emerald-200 text-emerald-950 font-bold" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckbox(formRegions, setFormRegions, regionName)}
                        className="w-3.5 h-3.5 rounded text-emerald-700 accent-emerald-700 cursor-pointer"
                      />
                      <span className="text-[11px] truncate">{regionName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── 3. CHECKBOXES: สาขาที่ดูแล (BRANCHES) ─── */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <label className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-900 text-base">storefront</span>
                  สาขาที่ดูแล (Branches Scope):
                </label>
              </div>
              {availableBranches.length > 0 && (
                <div className="flex gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFormBranches(availableBranches)}
                    className="text-blue-900 font-bold hover:underline cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormBranches([])}
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
                  const isChecked = formBranches.includes(branchName);
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
                        onChange={() => toggleCheckbox(formBranches, setFormBranches, branchName)}
                        className="w-3.5 h-3.5 rounded text-blue-900 accent-blue-900 cursor-pointer shrink-0"
                      />
                      <span className="text-[11px] truncate">{branchName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Toggle Account Status */}
          <div className="pt-2 border-t border-slate-100">
            <label className="inline-flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isAccountActive} 
                onChange={(e) => setIsAccountActive(e.target.checked)} 
                className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900/20 cursor-pointer accent-blue-900"
              />
              <span className="text-xs font-bold text-slate-700">Account is Active immediately</span>
            </label>
          </div>

          {/* ─── MODAL FOOTER ─── */}
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
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}
