"use client";

import React from "react";

// นิยามโครงสร้างตัวเลือกแบบคู่คุณสมบัติ (Generic Option Mapping)
export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string; // ข้อความกำกับหน้ารายการเลือก (Optional)
}

export default function SelectInput({ value, onChange, options, label }: SelectInputProps) {
  return (
    <div className="flex items-center gap-1.5 select-none">
      {label && <span className="text-xs text-neutral-500 font-medium">{label}</span>}
      <div className="relative inline-block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 appearance-none cursor-pointer font-medium transition-all"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* ลูกศร SVG ประจำระบบ จัดการระยะคลุมพิกเซลกันผิวสีและขอบเพี้ยนบน iPad */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-neutral-400">
          <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
        </div>
      </div>
    </div>
  );
}