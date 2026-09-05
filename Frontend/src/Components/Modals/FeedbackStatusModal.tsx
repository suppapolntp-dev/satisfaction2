"use client";

import React, { useEffect } from "react";

export type FeedbackType = "success" | "error" | "warning" | "info";

export interface FeedbackStatusModalProps {
  isOpen: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  buttonText?: string;
  autoCloseMs?: number; // ตัวเลือก: ปิดอัตโนมัติเมื่อครบเวลา
  onClose: () => void;
}

export function FeedbackStatusModal({
  isOpen,
  type,
  title,
  message,
  buttonText = "ตกลง",
  autoCloseMs,
  onClose,
}: FeedbackStatusModalProps) {
  useEffect(() => {
    if (!isOpen || !autoCloseMs) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: "check_circle",
      iconBg: "bg-emerald-50 border-emerald-100 text-emerald-600",
      buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
    },
    error: {
      icon: "cancel",
      iconBg: "bg-rose-50 border-rose-100 text-rose-600",
      buttonBg: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
    },
    warning: {
      icon: "error",
      iconBg: "bg-amber-50 border-amber-100 text-amber-600",
      buttonBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
    },
    info: {
      icon: "info",
      iconBg: "bg-blue-50 border-blue-100 text-blue-900",
      buttonBg: "bg-blue-900 hover:bg-blue-950 text-white shadow-blue-900/20",
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col items-center text-center gap-4 select-none animate-in zoom-in-95 duration-150">
        
        {/* Big Status Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner ${typeConfig.iconBg}`}>
          <span className="material-symbols-outlined text-[36px]">
            {typeConfig.icon}
          </span>
        </div>

        {/* Title & Message */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
            {message}
          </p>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all outline-none cursor-pointer mt-2 ${typeConfig.buttonBg}`}
        >
          {buttonText}
        </button>

      </div>
    </div>
  );
}

