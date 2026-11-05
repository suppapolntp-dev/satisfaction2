"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { EventItem, EventCategory, EventStatus } from "@/Types/event";

export interface UseEventEditModalProps {
  isOpen: boolean;
  event: EventItem | null;
  onClose: () => void;
  onSave: (event: EventItem) => void | Promise<void>;
}

export const EVENT_CATEGORIES: { id: EventCategory; label: string; dot: string }[] = [
  { id: "CAMPAIGN", label: "แคมเปญการตลาด", dot: "bg-orange-500" },
  { id: "AUDIT", label: "ตรวจมาตรฐานสาขา", dot: "bg-emerald-500" },
  { id: "FIRMWARE", label: "อัปเดตระบบ Kiosk", dot: "bg-blue-500" },
  { id: "CALIBRATION", label: "คาริเบรตอุปกรณ์", dot: "bg-purple-500" },
  { id: "MAINTENANCE", label: "ซ่อมบำรุงประจำรอบ", dot: "bg-slate-500" },
];

export const COMMON_BRANDS = [
  "Mister Donut",
  "The Coffee Club",
  "Swensen's",
  "KFC",
  "Auntie Anne's",
  "Ootoya",
];

export function useEventEditModal({
  isOpen,
  event,
  onClose,
  onSave,
}: UseEventEditModalProps) {
  const [formData, setFormData] = useState<Partial<EventItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = Boolean(event);

  useEffect(() => {
    if (!isOpen) return;

    if (event) {
      setFormData({
        ...event,
        targetBranchNames: event.targetBranchNames ? [...event.targetBranchNames] : [],
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        eventId: `EVT-${Date.now()}`,
        eventName: "",
        eventDate: today,
        eventEndDate: null,
        startTime: "09:00",
        endTime: "17:00",
        brandScope: COMMON_BRANDS[0],
        eventCategory: "CAMPAIGN",
        eventStatus: "Active",
        eventLocation: "",
        description: "",
        targetBranchNames: [],
      });
    }
    setErrorMessage(null);
  }, [isOpen, event]);

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

  const handleChange = useCallback((field: keyof EventItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.eventName?.trim()) {
        setErrorMessage("กรุณากรอกชื่อกิจกรรม");
        return;
      }
      if (!formData.eventDate) {
        setErrorMessage("กรุณาระบุวันที่จัดกิจกรรม");
        return;
      }

      try {
        setIsSubmitting(true);
        setErrorMessage(null);
        await onSave(formData as EventItem);
        onClose();
      } catch (err: any) {
        setErrorMessage(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSave, onClose]
  );

  return {
    formData,
    isEditing,
    isSubmitting,
    errorMessage,
    handleChange,
    handleSubmit,
  };
}
