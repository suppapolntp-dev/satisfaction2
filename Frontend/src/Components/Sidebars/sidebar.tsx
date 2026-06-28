"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

// นิยามโครงสร้างข้อมูลของเมนู
interface MenuItem {
  title: string;
  path: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { title: "Brand Management", path: "/brand", icon: "business" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (path: string) => {
    // ใช้ startTransition ควบคู่เพื่อช่วยให้ UI ฝั่งแอดมินลื่นไหลยิ่งขึ้นเวลาสลับเพจ
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <aside className="w-[260px] h-screen bg-neutral-900 text-slate-300 fixed left-0 top-0 flex flex-col py-6 border-r border-neutral-800 z-40 select-none">
      {/* Brand Header */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center border border-blue-500 shadow-lg shadow-blue-600/20">
            <span className="material-symbols-outlined text-white text-[20px]">analytics</span>
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-wide">Enterprise CSAT</div>
            <div className="text-[11px] text-neutral-500 font-medium">Admin Console</div>
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          // ตรวจสอบว่าเมนูนี้คือหน้าปัจจุบันที่ยูสเซอร์เปิดอยู่หรือไม่
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              type="button"
              disabled={isPending}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 outline-none group text-left ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-colors ${
                  isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto px-3 pt-4 border-t border-neutral-800/60 space-y-1">
        <button
          type="button"
          onClick={() => handleNavigation("/support")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          Support
        </button>
        <button
          type="button"
          onClick={() => handleNavigation("/docs")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">description</span>
          Documentation
        </button>
        
        <button className="w-full mt-4 bg-neutral-800 text-neutral-300 hover:bg-rose-950/40 hover:text-rose-400 py-2 rounded-xl text-xs font-bold transition-all border border-neutral-800 active:scale-95 flex justify-center items-center gap-2">
          Logout
        </button>
      </div>
    </aside>
  );
}