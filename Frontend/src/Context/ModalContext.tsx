"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import ExportModal from "@/Components/Modals/ExportModal";

type ModalType = "export" | null;

interface ModalContextValue {
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<ModalType>(null);

  // const openModal = useCallback((modal: ModalType) => setCurrent(modal), []);
  const closeModal = useCallback(() => setCurrent(null), []);
  const openModal = useCallback((modal: ModalType) => {
  console.log("openModal called with:", modal); // ← เพิ่มบรรทัดนี้
  setCurrent(modal);
}, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {/* Render modal ที่ระดับ Root — document.body แน่นอน */}
      <ExportModal
        isOpen={current === "export"}
        onClose={closeModal}
      />
    </ModalContext.Provider>
  );
}