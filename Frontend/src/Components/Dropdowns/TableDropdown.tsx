"use client";

import React, { useState, useEffect, useRef } from "react";

// ==========================================================================
// ─── 1. INTERFACES (นิยามโครงสร้างออปชันเมนูคำสั่ง)
// ==========================================================================
export interface DropdownActionItem {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface TableDropdownProps {
  actions: DropdownActionItem[];
}

// ==========================================================================
// ─── 2. MAIN COMPONENT
// ==========================================================================
export default function TableDropdown({ actions }: TableDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  // ตรวจจับการคลิกนอกกล่องเพื่อปิดเมนูอัตโนมัติ (Click Outside Handler)
  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleDocumentClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownContainerRef}>
      {/* ปุ่มกดจุด 3 จุด (Trigger Button) */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-all outline-none touch-manipulation active:scale-95 cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
      >
        <span className="material-symbols-outlined text-[18px]">
          more_vert
        </span>
      </button>

      {/* กล่องเมนูคำสั่งย่อย (Pop-in Menu Panel) */}
      {isDropdownOpen && (
        <div 
          className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-pop-in"
          style={{ transformOrigin: "top right" }}
        >
          <div className="py-1 flex flex-col" role="menu">
            {actions.map((actionItem, actionIndex) => (
              <button
                key={actionIndex}
                type="button"
                role="menuitem"
                onClick={() => {
                  actionItem.onClick();
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors outline-none cursor-pointer ${
                  actionItem.variant === "danger"
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-slate-700 hover:bg-slate-50 hover:text-blue-900"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {actionItem.icon}
                </span>
                <span>{actionItem.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}