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
    <div className="modal-overlay animate-pop-in">
      {/* ชั้นเลเยอร์ Backdrop ปิดเมื่อคลิกนอกกล่อง */}
      <div className="modal-close-layer cursor-default" onClick={onClose} />

      {/* กล่อง Modal Panel หลัก */}
      <div className="modal-panel">
        
        {/* ─── MODAL HEADER ─── */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Export Analytics Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">Generate CSAT reports and raw survey data.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-full transition-colors outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ─── MODAL BODY & FORM ─── */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh] custom-scrollbar">
            
            {/* เลือกรูปแบบไฟล์ (File Format Selection) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Select Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Excel Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFileFormat("excel")}
                  className={`p-4 rounded-xl text-left flex items-center gap-3 transition-all border-2 outline-none cursor-pointer ${
                    selectedFileFormat === "excel"
                      ? "border-blue-900 bg-blue-50/60 text-blue-900 shadow-xs" 
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    selectedFileFormat === "excel" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">table_chart</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs">Excel File</div>
                    <div className="text-[11px] text-slate-500">Raw Survey Data (.xlsx)</div>
                  </div>
                </button>

                {/* PDF Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFileFormat("pdf")}
                  className={`p-4 rounded-xl text-left flex items-center gap-3 transition-all border-2 outline-none cursor-pointer ${
                    selectedFileFormat === "pdf"
                      ? "border-blue-900 bg-blue-50/60 text-blue-900 shadow-xs" 
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    selectedFileFormat === "pdf" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs">PDF Document</div>
                    <div className="text-[11px] text-slate-500">Executive Summary (.pdf)</div>
                  </div>
                </button>

              </div>
            </div>

            {/* กำหนดช่วงเวลา (Date Range) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Date Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-600">Start Date</span>
                  <input 
                    type="date"
                    value={filterStartDate}
                    onChange={(inputChangeEvent) => setFilterStartDate(inputChangeEvent.target.value)}
                    className="input-select w-full"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-600">End Date</span>
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Data Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select 
                  value={selectedCompanyFilter}
                  onChange={(selectChangeEvent) => setSelectedCompanyFilter(selectChangeEvent.target.value)}
                  className="input-select w-full"
                >
                  <option value="All Companies">All Companies</option>
                  <option value="Global Retail Inc.">Global Retail Inc.</option>
                  <option value="TechCorp Solutions">TechCorp Solutions</option>
                </select>

                <select 
                  value={selectedBrandFilter}
                  onChange={(selectChangeEvent) => setSelectedBrandFilter(selectChangeEvent.target.value)}
                  className="input-select w-full"
                >
                  <option value="All Brands">All Brands</option>
                  <option value="Luxe Retail">Luxe Retail</option>
                  <option value="Apex Retail">Apex Retail</option>
                </select>

                <select 
                  value={selectedBranchFilter}
                  onChange={(selectChangeEvent) => setSelectedBranchFilter(selectChangeEvent.target.value)}
                  className="input-select w-full"
                >
                  <option value="All Branches">All Branches</option>
                  <option value="T1 Gate 3">T1 Gate 3</option>
                  <option value="T2 Arrival Hall">T2 Arrival Hall</option>
                </select>
              </div>
            </div>

          </div>

          {/* ─── MODAL FOOTER ─── */}
          <div className="modal-footer">
            <button 
              type="button"
              onClick={onClose}
              className="modal-button-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="modal-button-primary"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download Report
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}