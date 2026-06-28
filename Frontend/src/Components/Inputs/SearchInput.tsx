"use client";

import React from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // เปิดช่องให้ส่งคลาสปรับขนาดความกว้างจากหน้าต่าง ๆ ได้
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "w-full sm:max-w-xs", // ค่าเริ่มต้นล็อกความกว้างไว้ตามดีไซน์เดิมของคุณ
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      {/* ไอคอนแว่นขยายล็อกสถานะจิ้มไม่ติดกันแย่งอีเวนต์สัมผัส */}
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[18px] select-none pointer-events-none">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-neutral-400"
      />
    </div>
  );
}