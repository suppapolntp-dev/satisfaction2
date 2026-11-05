"use client";

import { useEffect, useCallback } from "react";

export interface UseConfirmDialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function useConfirmDialogModal({
  isOpen,
  onClose,
  onConfirm,
}: UseConfirmDialogModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleConfirmClick = useCallback(async () => {
    await onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return {
    handleConfirmClick,
  };
}
