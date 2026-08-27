"use client";

import React from "react";

interface ExportButtonProps {
  onClick: () => void;
  label?: string;
}

export default function ExportButton({ onClick, label = "Export" }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-primary flex items-center gap-1.5"
    >
      <span className="material-symbols-outlined text-[16px]">
        download
      </span>
      <span>{label}</span>
    </button>
  );
}