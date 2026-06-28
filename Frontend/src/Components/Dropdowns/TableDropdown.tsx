"use client";

import React, { useState, useEffect, useRef } from "react";

// นิยามโครงสร้างออปชันคำสั่งภายในเมนู Dropdown
export interface DropdownActionItem {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface TableDropdownProps {
  actions: DropdownActionItem[];
}

export default function TableDropdown({ actions }: TableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ตรวจจับการจิ้มนิ้วสัมผัสหรือคลิกภายนอกกล่อง เพื่อสั่งหุบเมนูอัตโนมัติ (iPad Friendly)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* ปุ่ม Trigger สามจุดจุดชนวนการเปิด */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center p-1.5 text-neutral-500 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-all outline-none touch-manipulation active:scale-95"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-[20px] select-none pointer-events-none">
          more_vert
        </span>
      </button>

      {/* กล่องแสดงรายการคำสั่ง (Actions List) */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-pop-in"
          style={{ transformOrigin: "top right" }}
        >
          <div className="py-1 flex flex-col" role="menu">
            {actions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                role="menuitem"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false); // ปิด Dropdown ทันทีเมื่อประมวลผลเสร็จ
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors outline-none touch-manipulation ${
                  action.variant === "danger"
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-neutral-700 hover:bg-slate-50 hover:text-blue-900"
                }`}
              >
                <span className="material-symbols-outlined text-[16px] select-none pointer-events-none">
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}