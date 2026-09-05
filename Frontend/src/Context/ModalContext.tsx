"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ConfirmDialogModal, ConfirmVariant } from "@/Components/Modals/ConfirmDialogModal";
import { FeedbackStatusModal, FeedbackType } from "@/Components/Modals/FeedbackStatusModal";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
}

interface FeedbackOptions {
  type: FeedbackType;
  title: string;
  message: string;
  buttonText?: string;
  autoCloseMs?: number;
}

interface ModalContextType {
  showConfirm: (options: ConfirmOptions) => void;
  showSuccess: (message: string, title?: string, autoCloseMs?: number) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  // ─── 1. State สำหรับ Confirm Modal ───
  const [confirmConfig, setConfirmConfig] = useState<ConfirmOptions | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // ─── 2. State สำหรับ Feedback Status Modal (Success / Error / Warning) ───
  const [feedbackConfig, setFeedbackConfig] = useState<FeedbackOptions | null>(null);

  // ฟังก์ชันเปิด Confirm Modal
  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmConfig(options);
  }, []);

  // ฟังก์ชันเปิด Success Modal (เขียว)
  const showSuccess = useCallback((message: string, title: string = "ดำเนินการสำเร็จ", autoCloseMs?: number) => {
    setFeedbackConfig({
      type: "success",
      title,
      message,
      autoCloseMs,
    });
  }, []);

  // ฟังก์ชันเปิด Error Modal (แดง)
  const showError = useCallback((message: string, title: string = "เกิดข้อผิดพลาด") => {
    setFeedbackConfig({
      type: "error",
      title,
      message,
    });
  }, []);

  // ฟังก์ชันเปิด Warning Modal (ส้ม)
  const showWarning = useCallback((message: string, title: string = "แจ้งเตือนข้อควรระวัง") => {
    setFeedbackConfig({
      type: "warning",
      title,
      message,
    });
  }, []);

  const closeModal = useCallback(() => {
    setConfirmConfig(null);
    setFeedbackConfig(null);
    setIsConfirmLoading(false);
  }, []);

  const handleExecuteConfirm = async () => {
    if (!confirmConfig?.onConfirm) return;

    try {
      setIsConfirmLoading(true);
      await confirmConfig.onConfirm();
      setConfirmConfig(null);
    } catch (error: any) {
      setConfirmConfig(null);
      showError(error?.message || "การดำเนินการไม่สำเร็จ โปรดลองใหม่อีกครั้ง");
    } finally {
      setIsConfirmLoading(false);
    }
  };

  return (
    <ModalContext.Provider
      value={{
        showConfirm,
        showSuccess,
        showError,
        showWarning,
        closeModal,
      }}
    >
      {children}

      {/* Global Confirmation Modal */}
      <ConfirmDialogModal
        isOpen={Boolean(confirmConfig)}
        title={confirmConfig?.title || ""}
        description={confirmConfig?.description}
        confirmText={confirmConfig?.confirmText}
        cancelText={confirmConfig?.cancelText}
        variant={confirmConfig?.variant || "primary"}
        isLoading={isConfirmLoading}
        onConfirm={handleExecuteConfirm}
        onCancel={() => setConfirmConfig(null)}
      />

      {/* Global Feedback Status Modal (Success / Error / Warning) */}
      <FeedbackStatusModal
        isOpen={Boolean(feedbackConfig)}
        type={feedbackConfig?.type || "info"}
        title={feedbackConfig?.title || ""}
        message={feedbackConfig?.message || ""}
        buttonText={feedbackConfig?.buttonText}
        autoCloseMs={feedbackConfig?.autoCloseMs}
        onClose={() => setFeedbackConfig(null)}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

