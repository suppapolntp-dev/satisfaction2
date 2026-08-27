"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ThankModalProps {
  isOpen: boolean;
  onClose?: () => void;
  thankYouMessageTh?: string;
  thankYouMessageEn?: string;
  autoResetSeconds?: number;
  modalMaxWidth?: number;
  thankYouIconSize?: number;
  thankYouFontSizeTh?: number;
  thankYouFontSizeEn?: number;
}

export function ThankModal({
  isOpen,
  onClose,
  thankYouMessageTh = "ขอขอบคุณสำหรับความคิดเห็นอันมีค่าของคุณ เพื่อการพัฒนาบริการให้ดียิ่งขึ้นนะคะ",
  thankYouMessageEn = "Thank you for your valuable feedback! We appreciate your visit.",
  autoResetSeconds = 4,
  modalMaxWidth = 650,
  thankYouIconSize = 80,
  thankYouFontSizeTh = 28,
  thankYouFontSizeEn = 16,
}: ThankModalProps) {
  const [mounted, setMounted] = useState(false);
  
  // แปลงค่าเวลาเป็นตัวเลขที่ถูกต้อง (รองรับทั้ง 1, 2, 3, 4, 5... วินาที)
  const totalDurationSeconds = Math.max(1, Number(autoResetSeconds) || 4);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalDurationSeconds);
  const [progressPercent, setProgressPercent] = useState<number>(100);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // ตัวนับเวลาแบบเรียลไทม์ (Smooth Precision Countdown & Progress Bar)
  useEffect(() => {
    if (!isOpen) {
      setRemainingSeconds(totalDurationSeconds);
      setProgressPercent(100);
      return;
    }

    setRemainingSeconds(totalDurationSeconds);
    setProgressPercent(100);

    const startTime = Date.now();
    const totalDurationMs = totalDurationSeconds * 1000;

    const precisionTimer = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const remainingMs = Math.max(0, totalDurationMs - elapsedMs);
      const currentSeconds = Math.ceil(remainingMs / 1000);
      const currentPercent = Math.max(0, (remainingMs / totalDurationMs) * 100);

      setRemainingSeconds(currentSeconds);
      setProgressPercent(currentPercent);

      // เมื่อครบเวลาตามที่ตั้งไว้ (วิ่งถึง 0% พอดีเป๊ะ)
      if (remainingMs <= 0) {
        clearInterval(precisionTimer);
        if (onClose) {
          onClose();
        }
      }
    }, 40); // อัปเดตเฟรมทุก 40ms ทำให้แถบเส้นวิ่งลดลงอย่างสมูทและหมดเวลาตรงตามตัวแปร 100%

    return () => clearInterval(precisionTimer);
  }, [isOpen, totalDurationSeconds, onClose]);

  if (!isOpen || !mounted) return null;

  const dynamicModalWidth = Number(modalMaxWidth) || 650;
  const dynamicIconSize = Number(thankYouIconSize) || 80;
  const dynamicFontTh = Number(thankYouFontSizeTh) || 28;
  const dynamicFontEn = Number(thankYouFontSizeEn) || 16;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      
      {/* ─── Spacious & Airy Thank You Modal Card (ขยายความกว้าง ไม่กระจุกตัว) ─── */}
      <div 
        className="relative w-full bg-white rounded-3xl p-8 sm:p-12 md:p-14 shadow-2xl border border-slate-100 flex flex-col items-center text-center transform transition-all duration-300"
        style={{
          maxWidth: `${dynamicModalWidth}px`,
        }}
      >
        
        {/* 1. ไอคอนภาพขีดเส้นขอบคุณ (volunteer_activism - ลบขอบสีเขียวออก สะอาดตา มินิมอล) */}
        <div className="mb-6 flex justify-center items-center">
          <span
            className="material-symbols-outlined text-emerald-600 block leading-none select-none transition-all"
            style={{
              fontSize: `${dynamicIconSize}px`,
              fontVariationSettings: "'FILL' 0, 'wght' 250, 'GRAD' 0, 'opsz' 48",
            }}
          >
            volunteer_activism
          </span>
        </div>

        {/* 2. ข้อความขอบคุณภาษาไทย (ขนาดฟอนต์ปรับได้จากระบบ) */}
        <h2 
          className="font-bold text-slate-800 leading-relaxed mb-3 tracking-tight px-4 max-w-full"
          style={{
            fontSize: `${dynamicFontTh}px`,
          }}
        >
          {thankYouMessageTh}
        </h2>

        {/* 3. ข้อความขอบคุณภาษาอังกฤษ (ขนาดฟอนต์ปรับได้จากระบบ) */}
        <p 
          className="text-slate-500 italic leading-relaxed mb-8 px-4 max-w-full"
          style={{
            fontSize: `${dynamicFontEn}px`,
          }}
        >
          "{thankYouMessageEn}"
        </p>

        {/* 4. ข้อความนับถอยหลัง: หน้าต่างนี้จะปิดใน X วินาที... */}
        <div className="text-xs sm:text-sm font-semibold text-slate-400 mb-4 select-none flex items-center gap-1.5 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
          <span className="material-symbols-outlined text-[18px] text-slate-400">schedule</span>
          <span>หน้าต่างนี้จะปิดใน {remainingSeconds} วินาที...</span>
        </div>

        {/* 5. เส้นถอยหลัง (Progress Bar - วิ่งถอยหลังสมูทและหมดเวลาที่ 0% พอดีเป๊ะ) */}
        <div className="w-full max-w-md h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-75 ease-linear"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>

      </div>

    </div>,
    document.body
  );
}