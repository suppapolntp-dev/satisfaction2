"use client";

import { useState, useTransition } from "react";
import { ThankModal } from "../Modals/ThankModal";

// ==========================================
// CONFIG / CONSTANTS
// ==========================================
const SENTIMENT_COLORS = {
  sad: {
    color: "#ff6b6b",
    hoverBg: "rgba(255,107,107,0.08)",
    icon: "sentiment_very_dissatisfied",
    label: "ไม่พอใจ",
  },
  neutral: {
    color: "#f0ad4e",
    hoverBg: "rgba(240,173,78,0.08)",
    icon: "sentiment_neutral",
    label: "เฉยๆ",
  },
  happy: {
    color: "#51cf66",
    hoverBg: "rgba(81,207,102,0.08)",
    icon: "sentiment_very_satisfied",
    label: "พึงพอใจมาก",
  },
} as const;

type SentimentType = keyof typeof SENTIMENT_COLORS;

// ==========================================
// COMPONENT
// ==========================================
export function BtnSatisfaction() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<SentimentType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = (value: SentimentType) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setSelected(value);

    // จำลองการบันทึกข้อมูลคะแนนความพึงพอใจ
    setTimeout(() => {
      setIsOpen(true);
      setSelected(null);
      
      setTimeout(() => {
        setIsOpen(false);
        setIsProcessing(false);
      }, 3500);
    }, 1500);
  };

  return (
    <>
      {/* 1. หน้าจอหลัก: ปุ่มประเมินความพึงพอใจสำหรับตู้ Kiosk */}
      <div
        className="grid grid-cols-3 gap-4 md:gap-8 w-full max-w-4xl px-4 mb-12 mx-auto"
        style={{ pointerEvents: isProcessing ? "none" : "auto" }}
      >
        {(Object.keys(SENTIMENT_COLORS) as SentimentType[]).map((type) => {
          const isSelected = selected === type;
          const config = SENTIMENT_COLORS[type];

          // แยกสไตล์ของปุ่มออกเป็นชุดตัวแปร เพื่อให้อ่านแท็กปุ่มด้านล่างได้ง่ายขึ้น
          const baseButtonClass = "w-full flex flex-col items-center justify-center gap-4 p-6 md:p-10 rounded-3xl border-4 bg-white text-neutral-400 select-none cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm group touch-manipulation";
          const activeClass = "scale-108 text-white border-[var(--sentiment-color)] bg-[var(--sentiment-color)] shadow-xl z-50";
          const hoverClass = "border-slate-100 md:hover:-translate-y-1 md:hover:bg-[var(--sentiment-hover-bg)] md:hover:text-[var(--sentiment-color)] md:hover:border-[var(--sentiment-color)] active:-translate-y-1 active:bg-[var(--sentiment-hover-bg)] active:text-[var(--sentiment-color)] active:border-[var(--sentiment-color)] focus-visible:-translate-y-1 focus-visible:bg-[var(--sentiment-hover-bg)] focus-visible:text-[var(--sentiment-color)] focus-visible:border-[var(--sentiment-color)]";

          return (
            <div key={type} className="w-full">
              <button
                type="button"
                onClick={() => handleClick(type)}
                className={`${baseButtonClass} ${isSelected ? activeClass : hoverClass}`}
                style={{
                  "--sentiment-color": config.color,
                  "--sentiment-hover-bg": config.hoverBg,
                  WebkitTapHighlightColor: "transparent",
                } as React.CSSProperties}
              >
                {/* ไอคอนอีโมจิ */}
                <span className="material-symbols-outlined pointer-events-none text-7xl md:text-8xl lg:text-9xl group-hover:text-inherit group-active:text-inherit group-focus-visible:text-inherit leading-none mb-2">
                  {config.icon}
                </span>

                {/* ข้อความกำกับภาษาไทย */}
                <span className="font-bold pointer-events-none text-sm md:text-base lg:text-lg group-hover:text-inherit group-active:text-inherit group-focus-visible:text-inherit text-neutral-500">
                  {config.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {isOpen && <ThankModal isOpen={isOpen} />}
    </>
  );
}