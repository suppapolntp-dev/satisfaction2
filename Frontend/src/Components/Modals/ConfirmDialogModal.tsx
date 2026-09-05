"use client";

import React from "react";

export type ConfirmVariant = "danger" | "warning" | "primary" | "info";

export interface ConfirmDialogModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialogModal({
  isOpen,
  title,
  description,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogModalProps) {
  if (!isOpen) return null;

  // ตั้งค่าธีมสีและไอคอนตามประเภท (Danger = แดง, Warning = ส้ม, Primary = น้ำเงิน)
  const variantStyles = {
    danger: {
      icon: "delete",
      iconBg: "bg-rose-50 border-rose-100 text-rose-600",
      buttonBg: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
    },
    warning: {
      icon: "warning",
      iconBg: "bg-amber-50 border-amber-100 text-amber-600",
      buttonBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
    },
    primary: {
      icon: "help",
      iconBg: "bg-blue-50 border-blue-100 text-blue-900",
      buttonBg: "bg-blue-900 hover:bg-blue-950 text-white shadow-blue-900/20",
    },
    info: {
      icon: "info",
      iconBg: "bg-sky-50 border-sky-100 text-sky-600",
      buttonBg: "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-5 select-none animate-in zoom-in-95 duration-150">
        
        {/* Header with Icon */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 shadow-inner ${variantStyles.iconBg}`}>
            <span className="material-symbols-outlined text-[26px]">
              {variantStyles.icon}
            </span>
          </div>
          
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors outline-none cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all outline-none cursor-pointer flex items-center gap-2 disabled:opacity-50 ${variantStyles.buttonBg}`}
          >
            {isLoading && (
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            )}
            <span>{isLoading ? "กำลังดำเนินการ..." : confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

