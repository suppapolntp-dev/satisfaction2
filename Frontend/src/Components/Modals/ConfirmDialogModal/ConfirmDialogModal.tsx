"use client";

import React from "react";
import { useConfirmDialogModal } from "./useConfirmDialogModal";

export type ConfirmVariant = "danger" | "warning" | "primary";

export interface ConfirmDialogModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  className?: string;
}

export function ConfirmDialogModal({
  isOpen,
  title = "ยืนยันการทำรายการ",
  description = "คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
  confirmLabel = "ยืนยันการลบ",
  cancelLabel = "ยกเลิก",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
  className = "",
}: ConfirmDialogModalProps) {
  const { handleConfirmClick } = useConfirmDialogModal({
    isOpen,
    onClose,
    onConfirm,
  });

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={`relative z-10 w-full max-w-md rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200 space-y-4 ${className}`}
      >
        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${
              isDanger
                ? "bg-rose-50 border-rose-100 text-rose-600 ring-4 ring-rose-50/60"
                : "bg-amber-50 border-amber-100 text-amber-600 ring-4 ring-amber-50/60"
            }`}
          >
            {isDanger ? (
              <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3 id="confirm-dialog-title" className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-snug">
              {title}
            </h3>
            <p id="confirm-dialog-description" className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
                : "bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
            }`}
          >
            {isLoading ? (
              <span>กำลังดำเนินการ...</span>
            ) : (
              <>
                <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialogModal;
