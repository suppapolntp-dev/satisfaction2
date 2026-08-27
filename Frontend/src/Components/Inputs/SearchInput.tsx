"use client";

import React from "react";

// ==========================================================================
// ─── 1. INTERFACES (Props กำหนดคุณสมบัติกล่องค้นหา)
// ==========================================================================
interface SearchInputProps {
  value: string;
  onChange: (searchQuery: string) => void;
  placeholder?: string;
  className?: string;
}

// ==========================================================================
// ─── 2. MAIN SEARCH INPUT COMPONENT
// ==========================================================================
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "w-full sm:max-w-xs",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      {/* ไอคอนแว่นขยาย Material Symbol */}
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(inputChangeEvent) => onChange(inputChangeEvent.target.value)}
        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400"
      />
    </div>
  );
}