"use client";

import React from "react";

interface ExportButtonProps {
  onClick: () => void;
}

export default function ExportButton({ onClick }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={() => { console.log("ExportButton clicked"); onClick(); }} // debug log
      className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-all active:scale-95 outline-none touch-manipulation"
    >
      {/* 2. บังคับใส่ pointer-events-none ให้แท็กลูก เพื่อให้พิกัดนิ้วทะลุไปโดนปุ่มแม่ 100% บน iPad */}
      <span className="material-symbols-outlined text-[18px] pointer-events-none">
        download
      </span>
      <span className="pointer-events-none">Export</span>
    </button>
  );
}