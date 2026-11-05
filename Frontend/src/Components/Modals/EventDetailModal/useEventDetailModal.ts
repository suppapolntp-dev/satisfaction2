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
      return `${event.eventDate} ถึง ${event.eventEndDate}`;
    }
    return event.eventDate || "-";
  }, [event]);

  const timeFormatted = useMemo(() => {
    if (!event) return "-";
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime} น.`;
    }
    return event.startTime || "ตลอดทั้งวัน (All-day)";
  }, [event]);

  const progressPercent = useMemo(() => {
    if (!event) return 0;
    const isCompleted = (event.eventStatus || "").toUpperCase() === "COMPLETED";
    return Math.min(100, Math.max(0, event.progressPercent ?? (isCompleted ? 100 : 0)));
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
    progressPercent,
    handleEditClick,
    handleDeleteClick,
  };
}
