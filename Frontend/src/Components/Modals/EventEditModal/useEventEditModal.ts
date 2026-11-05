"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { EventItem, EventCategory, EventStatus } from "@/Types/event";
import { branchService } from "@/Services/branchService";

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
  const [branches, setBranches] = useState<BranchScopeNode[]>([]);
  const [isBranchesLoading, setIsBranchesLoading] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState("");
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = Boolean(event);

  // Load organizational branch scope from branchService
  useEffect(() => {
    let isMounted = true;

    async function loadBranches() {
      try {
        setIsBranchesLoading(true);
        // TODO: Connect API [get_branches]
        const data = await branchService.getBranches();
        if (isMounted) {
          const mapped: BranchScopeNode[] = data.map((b) => ({
            id: b.id,
            name: b.name,
            brand: b.brand,
            region: b.region,
            province: b.province,
            kioskCount: b.kioskCount || 0,
          }));
          setBranches(mapped);

          // Auto expand available brand groups
          const brandsMap: Record<string, boolean> = {};
          mapped.forEach((b) => {
            if (b.brand) brandsMap[b.brand] = true;
          });
          setExpandedBrands(brandsMap);
        }
      } catch (err) {
        console.error("[useEventEditModal] loadBranches error:", err);
      } finally {
        if (isMounted) {
          setIsBranchesLoading(false);
        }
      }
    }

    if (isOpen) {
      loadBranches();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Clean initial state (Strict API-Ready Mode)
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
        eventName: "",
        eventDate: today,
        eventEndDate: null,
        startTime: "09:00",
        endTime: "17:00",
        brandScope: "",
        eventCategory: "CAMPAIGN",
        eventStatus: "Upcoming",
        eventLocation: "",
        description: "",
        targetBranchNames: [],
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
      let newBrand = prev.brandScope || "";
      if (updated.length > 0) {
        const found = branches.find((b) => b.name === updated[0]);
        if (found) newBrand = found.brand;
      }

      return {
        ...prev,
        brandScope: newBrand,
        targetBranchNames: updated,
      };
    });
  }, [branches]);

  const selectAllBranches = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      targetBranchNames: branches.map((b) => b.name),
    }));
  }, [branches]);

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
    let list = branches;
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
  }, [branches, branchSearchQuery]);

  // Grouped by brand for the left tree view
  const branchesByBrand = useMemo(() => {
    const map: Record<string, BranchScopeNode[]> = {};
    filteredBranches.forEach((b) => {
      const brandKey = b.brand || "CRG Brand";
      if (!map[brandKey]) map[brandKey] = [];
      map[brandKey].push(b);
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

        const finalStatus = computeEventStatus(formData.eventDate, formData.eventEndDate).status;

        let finalBrand = formData.brandScope || "";
        if (formData.targetBranchNames && formData.targetBranchNames.length > 0) {
          const matchBranch = branches.find((b) => b.name === formData.targetBranchNames![0]);
          if (matchBranch) finalBrand = matchBranch.brand;
        }

        const payload: EventItem = {
          eventId: formData.eventId || `EVT-${Date.now()}`,
          eventName: formData.eventName.trim(),
          eventDate: formData.eventDate,
          eventEndDate: formData.eventEndDate || null,
          startTime: formData.startTime || "09:00",
          endTime: formData.endTime || "17:00",
          brandScope: finalBrand,
          brandId: formData.brandId || null,
          brandLogoUrl: formData.brandLogoUrl || null,
          eventCategory: formData.eventCategory || "CAMPAIGN",
          eventStatus: finalStatus,
          eventLocation: formData.targetBranchNames?.length
            ? `${formData.targetBranchNames.length} สาขาในเครือ`
            : "",
          description: formData.description || null,
          kioskThemeOverride: formData.kioskThemeOverride || null,
          targetBranchIds: formData.targetBranchIds || [],
          targetBranchNames: formData.targetBranchNames || [],
          progressPercent: formData.progressPercent || 0,
          commentCount: formData.commentCount || 0,
          attachmentCount: formData.attachmentCount || 0,
          assignees: formData.assignees || [],
        };

        await onSave(payload);
        onClose();
      } catch (err: any) {
        setErrorMessage(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, branches, onSave, onClose]
  );

  return {
    formData,
    isEditing,
    isSubmitting,
    isBranchesLoading,
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
