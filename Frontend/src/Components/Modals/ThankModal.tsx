"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ThankModal({ isOpen }: { isOpen: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-panel modal-panel-sm text-center">
        <span className="material-symbols-outlined mb-4 text-[60px] text-emerald-500 block leading-none">
          check_circle
        </span>
        <h5 className="text-xl font-bold text-neutral-800 mb-2">
          ขอบคุณค่ะ
        </h5>
        <p className="text-sm text-neutral-500 leading-relaxed">
          การประเมินของคุณมีความสำคัญต่อการพัฒนาบริการของเรา
        </p>
      </div>
    </div>,
    document.body
  );
}