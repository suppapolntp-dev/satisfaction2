"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { EventItem, EventCategory, EventStatus } from "@/Types/event";

export interface UseEventEditModalProps {
  isOpen: boolean;
  event: EventItem | null;
  onClose: () => void;
  onSave: (event: EventItem) => void | Promise<void>;
}

export interface BranchScopeNode {
  id: string;
  name: string;
  brand: string;
  region: string;
  province: string;
  kioskCount: number;
}

export const MASTER_BRANCH_NODES: BranchScopeNode[] = [
  { id: "BR-01", name: "Central World ชั้น 3", brand: "Mister Donut", region: "กรุงเทพฯ และปริมณฑล", province: "กรุงเทพมหานคร", kioskCount: 4 },
  { id: "BR-02", name: "Siam Paragon ชั้น G", brand: "Mister Donut", region: "กรุงเทพฯ และปริมณฑล", province: "กรุงเทพมหานคร", kioskCount: 3 },
  { id: "BR-03", name: "Future Park รังสิต", brand: "Mister Donut", region: "กรุงเทพฯ และปริมณฑล", province: "ปทุมธานี", kioskCount: 5 },
  { id: "BR-04", name: "Mega Bangna ชั้น 1", brand: "Mister Donut", region: "กรุงเทพฯ และปริมณฑล", province: "สมุทรปราการ", kioskCount: 4 },
  { id: "BR-05", name: "Central World ชั้น 2", brand: "The Coffee Club", region: "กรุงเทพฯ และปริมณฑล", province: "กรุงเทพมหานคร", kioskCount: 2 },
  { id: "BR-06", name: "Siam Paragon ชั้น 3", brand: "The Coffee Club", region: "กรุงเทพฯ และปริมณฑล", province: "กรุงเทพมหานคร", kioskCount: 3 },
  { id: "BR-07", name: "Central Festival เชียงใหม่", brand: "The Coffee Club", region: "ภาคเหนือ", province: "เชียงใหม่", kioskCount: 2 },
  { id: "BR-08", name: "Central World โซน Beacon", brand: "Swensen's", region: "กรุงเทพฯ และปริมณฑล", province: "กรุงเทพมหานคร", kioskCount: 4 },
  { id: "BR-09", name: "Mega Bangna โซน FoodWalk", brand: "Swensen's", region: "กรุงเทพฯ และปริมณฑล", province: "สมุทรปราการ", kioskCount: 3 },
  { id: "BR-10", name: "Central Rama 9", brand: "Swensen's", region: "กรุงเทพฯ และปริมณฑล", province: "กรุงเทพมหานคร", kioskCount: 3 },
  { id: "BR-11", name: "Siam Center ชั้น 2", brand: "KFC", region: "กรุงเทพฯ และปริมณฑล", province: "กรุงเทพมหานคร", kioskCount: 6 },
  { id: "BR-12", name: "Future Park รังสิต ชั้น B", brand: "KFC", region: "กรุงเทพฯ และปริมณฑล", province: "ปทุมธานี", kioskCount: 5 },
  { id: "BR-13", name: "Central Festival พัทยา", brand: "KFC", region: "ภาคตะวันออก", province: "ชลบุรี", kioskCount: 4 },
];

export const EVENT_CATEGORIES: { id: EventCategory; label: string; dot: string }[] = [
  { id: "CAMPAIGN", label: "แคมเปญการตลาด", dot: "bg-orange-500" },
  { id: "AUDIT", label: "ตรวจมาตรฐานสาขา", dot: "bg-emerald-500" },
  { id: "FIRMWARE", label: "อัปเดตระบบ Kiosk", dot: "bg-blue-500" },
  { id: "CALIBRATION", label: "คาริเบรตอุปกรณ์", dot: "bg-purple-500" },
  { id: "MAINTENANCE", label: "ซ่อมบำรุงประจำรอบ", dot: "bg-slate-500" },
];

// Helper คำนวณ 2 สถานะอัตโนมัติ: "รอวันมาถึง" กับ "จบแล้ว" โดยตรวจจากวันเวลา
export function computeEventStatus(eventDate?: string, eventEndDate?: string | null) {
  if (!eventDate) {
    return {
      status: "Upcoming" as EventStatus,
      label: "รอวันมาถึง",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      dotClass: "bg-emerald-500 animate-pulse",
    };
  }
  const today = new Date().toISOString().split("T")[0];
  const finalEndDate = eventEndDate && eventEndDate >= eventDate ? eventEndDate : eventDate;
  if (finalEndDate < today) {
    return {
      status: "Completed" as EventStatus,
      label: "จบแล้ว",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      dotClass: "bg-slate-400",
    };
  }
  return {
    status: "Upcoming" as EventStatus,
    label: "รอวันมาถึง",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    dotClass: "bg-emerald-500 animate-pulse",
  };
}

export function useEventEditModal({
  isOpen,
  event,
  onClose,
  onSave,
}: UseEventEditModalProps) {
  const [formData, setFormData] = useState<Partial<EventItem>>({});
  const [branchSearchQuery, setBranchSearchQuery] = useState("");
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({
    "Mister Donut": true,
    "The Coffee Club": true,
    "Swensen's": true,
    "KFC": true,
  });
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
        brandScope: "Mister Donut",
        eventCategory: "CAMPAIGN",
        eventStatus: "Upcoming",
        eventLocation: "",
        description: "",
        targetBranchNames: ["Central World ชั้น 3", "Siam Paragon ชั้น G"],
      });
    }
    setBranchSearchQuery("");
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

  const toggleBranch = useCallback((branchName: string) => {
    setFormData((prev) => {
      const current = prev.targetBranchNames || [];
      const updated = current.includes(branchName)
        ? current.filter((b) => b !== branchName)
        : [...current, branchName];

      // Auto-derive brandScope from selected branch
      let newBrand = prev.brandScope;
      if (updated.length > 0) {
        const found = MASTER_BRANCH_NODES.find((b) => b.name === updated[0]);
        if (found) newBrand = found.brand;
      }

      return {
        ...prev,
        brandScope: newBrand,
        targetBranchNames: updated,
      };
    });
  }, []);

  const selectAllBranches = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      targetBranchNames: MASTER_BRANCH_NODES.map((b) => b.name),
    }));
  }, []);

  const clearAllBranches = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      targetBranchNames: [],
    }));
  }, []);

  const toggleBrandExpand = useCallback((brandName: string) => {
    setExpandedBrands((prev) => ({
      ...prev,
      [brandName]: !prev[brandName],
    }));
  }, []);

  // Filtered branch hierarchy for the left sidebar
  const filteredBranches = useMemo(() => {
    let list = MASTER_BRANCH_NODES;
    if (branchSearchQuery.trim()) {
      const q = branchSearchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.brand.toLowerCase().includes(q) ||
          b.province.toLowerCase().includes(q) ||
          b.region.toLowerCase().includes(q)
      );
    }
    return list;
  }, [branchSearchQuery]);

  // Grouped by brand for the left tree view
  const branchesByBrand = useMemo(() => {
    const map: Record<string, BranchScopeNode[]> = {};
    filteredBranches.forEach((b) => {
      if (!map[b.brand]) map[b.brand] = [];
      map[b.brand].push(b);
    });
    return map;
  }, [filteredBranches]);

  // คำนวณ 2 สถานะอัตโนมัติ (รอวันมาถึง / จบแล้ว)
  const computedStatus = useMemo(() => {
    return computeEventStatus(formData.eventDate, formData.eventEndDate);
  }, [formData.eventDate, formData.eventEndDate]);

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

        // Auto-assign computed status
        const finalStatus = computeEventStatus(formData.eventDate, formData.eventEndDate).status;

        // Auto-derive brandScope if empty
        let finalBrand = formData.brandScope || "Mister Donut";
        if (formData.targetBranchNames && formData.targetBranchNames.length > 0) {
          const matchBranch = MASTER_BRANCH_NODES.find((b) => b.name === formData.targetBranchNames![0]);
          if (matchBranch) finalBrand = matchBranch.brand;
        }

        const payload: EventItem = {
          ...(formData as EventItem),
          brandScope: finalBrand,
          eventStatus: finalStatus,
          startTime: formData.startTime || "09:00",
          endTime: formData.endTime || "17:00",
          eventLocation: formData.targetBranchNames?.length
            ? `${formData.targetBranchNames.length} สาขาในเครือ`
            : "",
        };

        await onSave(payload);
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
    branchSearchQuery,
    setBranchSearchQuery,
    branchesByBrand,
    expandedBrands,
    toggleBrandExpand,
    toggleBranch,
    selectAllBranches,
    clearAllBranches,
    computedStatus,
    handleChange,
    handleSubmit,
  };
}
