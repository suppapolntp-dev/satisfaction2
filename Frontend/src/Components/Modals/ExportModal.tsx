"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 1. ดึงฟังก์ชัน Portal ของ React มาใช้งาน

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  // 2. สร้างสเตตัสเช็กการ Hydration ของ Next.js ฝั่ง Client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // debug: log render state
  console.log("ExportModal state", { isOpen, mounted });

  const [format, setFormat] = useState<"excel" | "pdf">("excel");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // เงื่อนไข: ถ้าไม่ได้สั่งเปิด หรือระบบฝั่ง Client ยังโหลดไม่เสร็จ ห้ามเรนเดอร์เด็ดขาด
  if (!isOpen || !mounted) return null;

  // 3. ใช้ createPortal ครอบโครงสร้างทั้งหมด แล้วสั่งส่งตัวไปแปะที่ document.body
  return createPortal(
    <div className="modal-overlay p-4">
      {/* ม่านฉากหลังโปร่งแสง คลิกพื้นที่ว่างรอบๆ เพื่อสั่งปิดหน้าต่าง */}
      <div className="modal-close-layer" onClick={onClose} />

      {/* กล่องเนื้อหาหลัก (ถอดคลาสแอนิเมชันดิบที่ยังไม่ได้ลงทะเบียนออกชั่วคราว เพื่อเทสเลเยอร์) */}
      <div className="modal-panel max-h-[90vh] z-10 flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50/50 dark:bg-neutral-900/50">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Export Report</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <span className="material-symbols-outlined block text-[22px] pointer-events-none">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Format Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
              Select Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all outline-none ${
                  format === "excel"
                    ? "border-blue-900 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/20"
                    : "border-slate-200 hover:border-slate-300 dark:border-neutral-800 dark:hover:border-neutral-700"
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  format === "excel" ? "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-300" : "bg-slate-100 text-neutral-500 dark:bg-neutral-800"
                }`}>
                  <span className="material-symbols-outlined text-[22px] pointer-events-none">table_chart</span>
                </div>
                <div>
                  <div className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">Excel File</div>
                  <div className="text-xs text-neutral-400">Raw Data (.xlsx)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all outline-none ${
                  format === "pdf"
                    ? "border-blue-900 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/20"
                    : "border-slate-200 hover:border-slate-300 dark:border-neutral-800 dark:hover:border-neutral-700"
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  format === "pdf" ? "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-300" : "bg-slate-100 text-neutral-500 dark:bg-neutral-800"
                }`}>
                  <span className="material-symbols-outlined text-[22px] pointer-events-none">picture_as_pdf</span>
                </div>
                <div>
                  <div className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">PDF Document</div>
                  <div className="text-xs text-neutral-400">Dashboard Summary</div>
                </div>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
              Date Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-slate-200 dark:border-neutral-800 rounded-lg py-2 px-3 bg-slate-50 dark:bg-neutral-800/50 text-sm text-neutral-800 dark:text-neutral-200 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-slate-200 dark:border-neutral-800 rounded-lg py-2 px-3 bg-slate-50 dark:bg-neutral-800/50 text-sm text-neutral-800 dark:text-neutral-200 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="modal-button-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              console.log("Form Export Submitted!");
              onClose();
            }}
            className="modal-button-primary flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] pointer-events-none">download</span>
            Export Report
          </button>
        </div>
      </div>
    </div>,
    document.body // จุดปลายทางในการส่งตัวโค้ดออกไปวาง (ต่อท้ายแท็ก body ชั้นนอกสุด)
  );
}