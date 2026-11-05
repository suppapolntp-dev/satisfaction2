"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { EventAssignee, EventItem } from "@/Types/event";

const MAX_VISIBLE_ASSIGNEES = 3;

// สีหลอด Progress ตามหมวดหมู่กิจกรรม
const PROGRESS_FILL_BY_CATEGORY: Record<string, string> = {
  CAMPAIGN: "bg-orange-400",
  AUDIT: "bg-emerald-400",
  FIRMWARE: "bg-blue-600",
  CALIBRATION: "bg-purple-400",
  MAINTENANCE: "bg-slate-500",
};
const DEFAULT_PROGRESS_FILL = "bg-slate-400";

const COMPACT_STYLE_BY_CATEGORY: Record<string, string> = {
  CAMPAIGN: "bg-orange-100/90 text-orange-950 hover:bg-orange-200/80",
  AUDIT: "bg-emerald-100/90 text-emerald-950 hover:bg-emerald-200/80",
  FIRMWARE: "bg-blue-100/90 text-blue-950 hover:bg-blue-200/80",
  CALIBRATION: "bg-purple-100/90 text-purple-950 hover:bg-purple-200/80",
  MAINTENANCE: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
};
const DEFAULT_COMPACT_STYLE = "bg-emerald-100/90 text-emerald-950 hover:bg-emerald-200/80";

export interface UseEventCardProps {
  event: EventItem;
  onClick?: (event: EventItem) => void;
  onMenuClick?: (event: EventItem) => void;
  onEdit?: (event: EventItem) => void;
  onDelete?: (event: EventItem) => void;
}

export function useEventCard({ event, onClick, onMenuClick, onEdit, onDelete }: UseEventCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);
  const progressFillClass = useMemo(
    () => PROGRESS_FILL_BY_CATEGORY[(event.eventCategory || "").toUpperCase()] ?? DEFAULT_PROGRESS_FILL,
    [event.eventCategory]
  );

  const compactStyleClass = useMemo(
    () => COMPACT_STYLE_BY_CATEGORY[(event.eventCategory || "").toUpperCase()] ?? DEFAULT_COMPACT_STYLE,
    [event.eventCategory]
  );

  const progressPercent = useMemo(() => {
    const isCompleted = (event.eventStatus || "").toUpperCase() === "COMPLETED";
    const rawPercent = event.progressPercent ?? (isCompleted ? 100 : 0);
    return Math.min(100, Math.max(0, rawPercent));
  }, [event.progressPercent, event.eventStatus]);

  const commentCount = event.commentCount ?? 0;
  const attachmentCount = event.attachmentCount ?? 0;

  const { visibleAssignees, hiddenAssigneeCount } = useMemo(() => {
    const assignees: EventAssignee[] = event.assignees ?? [];
    return {
      visibleAssignees: assignees.slice(0, MAX_VISIBLE_ASSIGNEES),
      hiddenAssigneeCount: Math.max(assignees.length - MAX_VISIBLE_ASSIGNEES, 0),
    };
  }, [event.assignees]);

  const handleClick = () => onClick?.(event);

  const toggleMenu = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMenuOpen((prev) => !prev);
    onMenuClick?.(event);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit?.(event);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete?.(event);
  };

  return {
    progressFillClass,
    compactStyleClass,
    progressPercent,
    commentCount,
    attachmentCount,
    visibleAssignees,
    hiddenAssigneeCount,
    isMenuOpen,
    menuRef,
    handleClick,
    toggleMenu,
    handleEdit,
    handleDelete,
  };
}
