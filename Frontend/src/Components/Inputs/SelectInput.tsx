"use client";

import React from "react";

// ==========================================================================
// ─── 1. INTERFACES (นิยามตัวเลือก Dropdown Option)
// ==========================================================================
export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: string;
  onChange: (selectedValue: string) => void;
  options: SelectOption[];
  label?: string;
}

// ==========================================================================
// ─── 2. MAIN SELECT INPUT COMPONENT
// ==========================================================================
export default function SelectInput({ 
  value, 
  onChange, 
  options, 
  label 
}: SelectInputProps) {
  return (
    <div className="flex items-center gap-1.5 select-none">
      {label && (
        <span className="text-xs text-slate-500 font-medium">
          {label}
        </span>
      )}
      <div className="relative inline-block">
        <select
          value={value}
          onChange={(selectChangeEvent) => onChange(selectChangeEvent.target.value)}
          className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 appearance-none cursor-pointer font-medium transition-all"
        >
          {options.map((optionItem) => (
            <option key={optionItem.value} value={optionItem.value}>
              {optionItem.label}
            </option>
          ))}
        </select>
        {/* ลูกศร Dropdown Indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
          <span className="material-symbols-outlined text-[16px]">
            keyboard_arrow_down
          </span>
        </div>
      </div>
    </div>
  );
}