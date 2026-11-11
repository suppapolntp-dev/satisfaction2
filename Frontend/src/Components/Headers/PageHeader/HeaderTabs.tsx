"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

export interface HeaderTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface HeaderTabsProps {
  tabs: HeaderTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export default function HeaderTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: HeaderTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  // ตรวจสอบสถานะการ Scroll ซ้าย-ขวา เพื่อแสดง/ซ่อนปุ่มลูกศร
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [tabs, updateScrollState]);

  // เลื่อนหา Tab ที่กำลัง Active ให้มาอยู่ตรงกลางสายตาอัตโนมัติ
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !activeTab) return;
    const activeEl = el.querySelector<HTMLButtonElement>(`[data-tab-id="${activeTab}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeTab]);

  // ฟังก์ชันเลื่อนซ้าย-ขวาเมื่อกดปุ่มลูกศร
  const handleScrollStep = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const offset = direction === "left" ? -280 : 280;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  // หมุน Mouse Wheel เพื่อเลื่อน TabPills ในแนวนอน
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      updateScrollState();
    }
  };

  // รองรับ Mouse Drag-to-Scroll บน Desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    el.scrollLeft = dragScrollLeft.current - walk;
    updateScrollState();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  if (!tabs || tabs.length === 0) return null;

  return (
    <div className={`relative px-2 sm:px-4 border-t border-slate-100 bg-slate-50/60 ${className}`}>
      {/* ─── LEFT SCROLL ARROW BUTTON WITH FADE ─── */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 pl-1 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent">
          <button
            type="button"
            aria-label="Scroll tabs left"
            onClick={() => handleScrollStep("left")}
            className="w-7 h-7 rounded-full bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-all active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
      )}

      {/* ─── TABPILLS SCROLL CONTAINER ─── */}
      <div
        ref={scrollRef}
        role="tablist"
        onScroll={updateScrollState}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-center gap-1 sm:gap-1.5 overflow-x-auto scroll-smooth pt-2 pb-1.5 [scrollbar-width:thin] select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 min-h-[38px] text-xs font-semibold whitespace-nowrap rounded-xl transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--primary)] ${
                isActive
                  ? "bg-white text-[var(--primary)] font-bold border border-slate-200/90 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent"
              }`}
            >
              {tab.icon && (
                <span
                  aria-hidden="true"
                  className={`w-4 h-4 shrink-0 flex items-center justify-center ${
                    isActive ? "text-[var(--primary)]" : "text-slate-400"
                  }`}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? "bg-[var(--accent-bg)] text-[var(--primary)]"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── RIGHT SCROLL ARROW BUTTON WITH FADE ─── */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 pr-1 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent">
          <button
            type="button"
            aria-label="Scroll tabs right"
            onClick={() => handleScrollStep("right")}
            className="w-7 h-7 rounded-full bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-all active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
