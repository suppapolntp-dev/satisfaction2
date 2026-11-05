"use client";

import { useMemo, useEffect, useCallback } from "react";
import { EventItem } from "@/Types/event";

export interface UseEventDetailModalProps {
  isOpen: boolean;
  event: EventItem | null;
  onClose: () => void;
  onEdit?: (event: EventItem) => void;
  onDelete?: (event: EventItem) => void;
}

const THAI_MONTH_ABBR = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatThaiDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;
  return `${d} ${THAI_MONTH_ABBR[m] || ""} ${y + 543}`;
}

export function useEventDetailModal({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
}: UseEventDetailModalProps) {
  // Close on Escape key
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

  const dateRangeFormatted = useMemo(() => {
    if (!event) return "-";
    if (event.eventEndDate && event.eventEndDate > event.eventDate) {
      return `${formatThaiDateDisplay(event.eventDate)} – ${formatThaiDateDisplay(event.eventEndDate)}`;
    }
    return formatThaiDateDisplay(event.eventDate);
  }, [event]);

  const timeFormatted = useMemo(() => {
    if (!event) return "-";
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime} น.`;
    }
    return event.startTime || "ตลอดทั้งวัน (All-day)";
  }, [event]);

  const handleEditClick = useCallback(() => {
    if (event && onEdit) {
      onClose();
      onEdit(event);
    }
  }, [event, onEdit, onClose]);

  const handleDeleteClick = useCallback(() => {
    if (event && onDelete) {
      onClose();
      onDelete(event);
    }
  }, [event, onDelete, onClose]);

  return {
    dateRangeFormatted,
    timeFormatted,
    handleEditClick,
    handleDeleteClick,
  };
}
