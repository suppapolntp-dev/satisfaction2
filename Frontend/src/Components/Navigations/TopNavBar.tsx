"use client";

import React from "react";

interface TopNavBarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
}

export default function TopNavBar({
  searchQuery = "",
  onSearchChange,
  placeholder = "Search brands, companies...",
}: TopNavBarProps) {
  return (
    /* [จุดแก้ไขสไตล์สำคัญ] 
      เปลี่ยนจาก bg-surface เป็น bg-white (หรือใช้คลาส bg-surface-container-lowest ของคุณองค์กร)
      เพื่อล็อกให้ในโหมดปกติเป็นสีขาวบริสุทธิ์เด่นชัด และสลับเป็น bg-slate-900/90 ในโหมดมืด
    */
    <header className="flex justify-between items-center w-full h-16 px-6 bg-white backdrop-blur-md border-b border-slate-200/80 z-10 sticky top-0 transition-colors duration-200">
      
      {/* SECTION ฝั่งซ้าย: ช่องพิมพ์ค้นหาข้อมูล (กล่องอินพุตปรับสีให้เข้าคู่กับผิวขาว) */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* SECTION ฝั่งขวา: กลุ่มปุ่มกดสั่งการระบบควบคุม */}
      <div className="flex items-center gap-3 ml-auto">
        
        {/* ปุ่มระบบแจ้งเตือน */}
        <button 
          type="button" 
          className="text-neutral-500 hover:bg-slate-100 rounded-full p-2 transition-colors relative outline-none flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px] select-none pointer-events-none">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* ปุ่มศูนย์ช่วยเหลือ */}
        <button 
          type="button" 
          className="text-neutral-500 hover:bg-slate-100 rounded-full p-2 transition-colors outline-none flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px] select-none pointer-events-none">help_outline</span>
        </button>

        {/* เส้นคั่นสัดส่วน Layout */}
        <div className="h-5 w-[1px] bg-slate-200 mx-1 select-none pointer-events-none"></div>

        {/* รูปภาพโปรไฟล์แอดมินองค์กร */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0 cursor-pointer shadow-sm">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYPL8A2bMaheSculb-VosBemw6XZS7Fbj0y5vt_mmrVoZ4VovrCT6Xd8fanyEG4VqqmMdTt27NrUEZp6tgeA-3-WT-bDIk2AJpU68QHniLGhEbipg-GI1vrNRaTG7u4LIy72PouqqHrXh6Vw2zFRLdqfQ9dHnzCt-YMbAWfjfq_ZsngjMhkTI5eLPi773rqwdkrPcgR7CLZOj_GltTLA2PQqSmKOGdejsO99JbHPtRZtzGk1of1GbXkFvvY57GSIMLWd-XDSpHy8s"
            alt="Administrator Profile"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        </div>
        
      </div>
    </header>
  );
}