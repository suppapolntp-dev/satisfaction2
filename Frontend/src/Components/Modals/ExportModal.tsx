"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// ==========================================================================
// ─── 1. INTERFACES (Props สำหรับควบคุมหน้าต่าง Export Modal)
// ==========================================================================
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ==========================================================================
// ─── 2. MAIN EXPORT MODAL COMPONENT
// ==========================================================================
export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  // สเตตัสเช็ก Client-side Hydration เพื่อความปลอดภัยบน Next.js
  const [isComponentMounted, setIsComponentMounted] = useState<boolean>(false);

  // สเตตัสเก็บค่าตัวเลือกฟอร์มส่งออกรายงาน
  const [selectedFileFormat, setSelectedFileFormat] = useState<"excel" | "pdf">("excel");
  const [filterStartDate, setFilterStartDate] = useState<string>("2026-08-01");
  const [filterEndDate, setFilterEndDate] = useState<string>("2026-08-27");
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("All Companies");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("All Brands");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("All Branches");

  useEffect(() => {
    setIsComponentMounted(true);
    return () => setIsComponentMounted(false);
  }, []);

  if (!isOpen || !isComponentMounted) {
    return null;
  }

  // ฟังก์ชันจำลองการ Export ข้อมูล
  const handleFormSubmit = (formSubmitEvent: React.FormEvent<HTMLFormElement>) => {
    formSubmitEvent.preventDefault();

    const exportPayload = {
      format: selectedFileFormat,
      startDate: filterStartDate,
      endDate: filterEndDate,
      company: selectedCompanyFilter,
      brand: selectedBrandFilter,
      branch: selectedBranchFilter,
    };

    console.log("Generating and exporting CSAT Analytics report:", exportPayload);
    alert(`กำลังดาวน์โหลดรายงานสรุปคะแนน CSAT ในรูปแบบ ${selectedFileFormat.toUpperCase()}...`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      {/* กล่อง Modal Panel หลัก */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* ─── MODAL HEADER ─── */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-xl">file_download</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                ส่งออกรายงานสรุปผล (Export Report)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ดาวน์โหลดรายงานคะแนนความพึงพอใจ CSAT และผลการประเมินรายสาขา
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

        {/* ─── MODAL BODY & FORM ─── */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            
            {/* เลือกรูปแบบไฟล์ (File Format Selection) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                รูปแบบไฟล์เอกสาร (File Format)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Excel Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFileFormat("excel")}
                  className={`p-3.5 rounded-2xl text-left flex items-center gap-3 transition-all border-2 outline-none cursor-pointer ${
                    selectedFileFormat === "excel"
                      ? "border-blue-900 bg-blue-50/60 text-blue-900 shadow-xs" 
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    selectedFileFormat === "excel" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">table_chart</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs">Excel Spreadsheet (.xlsx)</div>
                    <div className="text-[11px] text-slate-500 truncate">ข้อมูลการประเมินดิบ (Raw Data)</div>
                  </div>
                </button>

                {/* PDF Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFileFormat("pdf")}
                  className={`p-3.5 rounded-2xl text-left flex items-center gap-3 transition-all border-2 outline-none cursor-pointer ${
                    selectedFileFormat === "pdf"
                      ? "border-blue-900 bg-blue-50/60 text-blue-900 shadow-xs" 
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    selectedFileFormat === "pdf" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs">PDF Document (.pdf)</div>
                    <div className="text-[11px] text-slate-500 truncate">รายงานสรุปผู้บริหาร (Summary)</div>
                  </div>
                </button>

              </div>
            </div>

            {/* กำหนดช่วงเวลา (Date Range) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ช่วงเวลาการประเมิน (Date Range)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">วันที่เริ่มต้น (Start Date)</span>
                  <input 
                    type="date"
                    value={filterStartDate}
                    onChange={(inputChangeEvent) => setFilterStartDate(inputChangeEvent.target.value)}
                    className="input-select w-full"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">วันที่สิ้นสุด (End Date)</span>
                  <input 
                    type="date"
                    value={filterEndDate}
                    onChange={(inputChangeEvent) => setFilterEndDate(inputChangeEvent.target.value)}
                    className="input-select w-full"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ตัวกรองหน่วยงาน (Organizational Scope) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ขอบเขตข้อมูล (Organizational Scope)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">กลุ่มธุรกิจ (Company)</span>
                  <select 
                    value={selectedCompanyFilter}
                    onChange={(selectChangeEvent) => setSelectedCompanyFilter(selectChangeEvent.target.value)}
                    className="input-select w-full truncate"
                  >
                    <option value="All Companies">ทุกกลุ่มธุรกิจ (All)</option>
                    <option value="CRG">กลุ่มธุรกิจ CRG</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">แบรนด์ (Brand)</span>
                  <select 
                    value={selectedBrandFilter}
                    onChange={(selectChangeEvent) => setSelectedBrandFilter(selectChangeEvent.target.value)}
                    className="input-select w-full truncate"
                  >
                    <option value="All Brands">ทุกแบรนด์ (All)</option>
                    <option value="KFC">KFC</option>
                    <option value="Mister Donut">Mister Donut</option>
                    <option value="Auntie Anne's">Auntie Anne's</option>
                    <option value="Arigato">Arigato</option>
                    <option value="Ootoya">Ootoya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">สาขา (Branch)</span>
                  <select 
                    value={selectedBranchFilter}
                    onChange={(selectChangeEvent) => setSelectedBranchFilter(selectChangeEvent.target.value)}
                    className="input-select w-full truncate"
                  >
                    <option value="All Branches">ทุกสาขา (All)</option>
                    <option value="สาขาเซ็นทรัลเวิลด์">สาขาเซ็นทรัลเวิลด์</option>
                    <option value="สาขาเซ็นทรัลลาดพร้าว">สาขาเซ็นทรัลลาดพร้าว</option>
                    <option value="สาขาสยามพารากอน">สาขาสยามพารากอน</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* ─── MODAL FOOTER ─── */}
          <div className="flex justify-end gap-3 p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
            <button 
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              className="btn-primary text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              ดาวน์โหลดรายงาน
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}