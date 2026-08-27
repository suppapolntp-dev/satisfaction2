"use client";

import React, { useState, useEffect } from "react";
import { BrandModel } from "@/Types/brand";

export interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBrand: BrandModel | null;
  onSave: (brandData: {
    brandId: string;
    brandName: string;
    brandLogoUrl?: string;
    parentCompanyName: string;
    category: string;
    brandIconName: string;
    status: "Active" | "Inactive";
  }) => Promise<void> | void;
}

export default function BrandModal({
  isOpen,
  onClose,
  editingBrand,
  onSave,
}: BrandModalProps) {
  const [formBrandName, setFormBrandName] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formBrandLogoUrl, setFormBrandLogoUrl] = useState("");
  const [formParentCompany, setFormParentCompany] = useState("Central Restaurants Group (CRG)");
  const [formCategory, setFormCategory] = useState("Fast Food (QSR)");
  const [formIcon, setFormIcon] = useState("restaurant");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    if (editingBrand) {
      setFormBrandName(editingBrand.brandName || "");
      setFormBrandId(editingBrand.brandId || "");
      setFormBrandLogoUrl(editingBrand.brandLogoUrl || "");
      setFormParentCompany(editingBrand.parentCompanyName || "Central Restaurants Group (CRG)");
      setFormCategory(editingBrand.category || "Fast Food (QSR)");
      setFormIcon(editingBrand.brandIconName || "restaurant");
      setFormStatus(editingBrand.status || "Active");
    } else {
      setFormBrandName("");
      setFormBrandId(`CRG-BRD-${Math.floor(100 + Math.random() * 900)}`);
      setFormBrandLogoUrl("");
      setFormParentCompany("Central Restaurants Group (CRG)");
      setFormCategory("Fast Food (QSR)");
      setFormIcon("restaurant");
      setFormStatus("Active");
    }
  }, [editingBrand, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBrandName.trim()) return;

    await onSave({
      brandId: formBrandId.trim(),
      brandName: formBrandName.trim(),
      brandLogoUrl: formBrandLogoUrl.trim() || undefined,
      parentCompanyName: formParentCompany,
      category: formCategory,
      brandIconName: formIcon,
      status: formStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-2xl">
              {editingBrand ? "edit_square" : "add_circle"}
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              {editingBrand ? "Edit Brand Details" : "Add New Brand"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">ชื่อแบรนด์ (Brand Name) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formBrandName}
              onChange={(e) => setFormBrandName(e.target.value)}
              placeholder="e.g., KFC Thailand, Mister Donut"
              className="input-text w-full font-semibold"
            />
          </div>

          {/* Brand Logo URL Input & Preview */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-800 block flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-900 text-[18px]">image</span>
              รูปภาพหรือโลโก้แบรนด์ (Logo URL / Image)
            </label>
            <input
              type="url"
              value={formBrandLogoUrl}
              onChange={(e) => setFormBrandLogoUrl(e.target.value)}
              placeholder="https://example.com/brand-logo.png"
              className="input-text w-full bg-white font-mono text-[11px]"
            />
            
            {formBrandLogoUrl && (
              <div className="pt-2 flex items-center gap-3">
                <img
                  src={formBrandLogoUrl}
                  alt="Brand Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-[11px] text-emerald-700 font-bold">พรีวิวโลโก้แบรนด์พร้อมใช้งาน</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">รหัสแบรนด์ (Brand ID)</label>
              <input
                type="text"
                value={formBrandId}
                onChange={(e) => setFormBrandId(e.target.value)}
                placeholder="CRG-BRD-001"
                className="input-text w-full font-mono text-slate-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">สถานะ (Status)</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                className="input-select w-full font-bold"
              >
                <option value="Active">Active (เปิดใช้งาน)</option>
                <option value="Inactive">Inactive (ปิดใช้งาน)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">กลุ่มธุรกิจ / บริษัทแม่ (Parent Company)</label>
            <select
              value={formParentCompany}
              onChange={(e) => setFormParentCompany(e.target.value)}
              className="input-select w-full"
            >
              <option value="Central Restaurants Group (CRG)">Central Restaurants Group (CRG)</option>
              <option value="Global Retail Inc.">Global Retail Inc.</option>
              <option value="Hospitality Group">Hospitality Group</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">หมวดหมู่ (Category)</label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. Fast Food (QSR)"
                className="input-text w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">ไอคอนสัญลักษณ์สำรอง</label>
              <select
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="input-select w-full"
              >
                <option value="restaurant">restaurant (อาหาร)</option>
                <option value="bakery_dining">bakery_dining (เบเกอรี่/โดนัท)</option>
                <option value="coffee">coffee (กาแฟ/เครื่องดื่ม)</option>
                <option value="lunch_dining">lunch_dining (สแน็ค/ฟาสต์ฟู้ด)</option>
                <option value="ramen_dining">ramen_dining (อาหารญี่ปุ่น)</option>
                <option value="shopping_bag">shopping_bag (ช้อปปิ้ง)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
              {editingBrand ? "Save Changes" : "Create Brand"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

