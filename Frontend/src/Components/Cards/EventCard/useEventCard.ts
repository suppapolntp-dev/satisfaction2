"use client";

import { useMemo } from "react";
import { EventItem } from "@/Types/event";

export type EventStatusVariant = "completed" | "upcoming";

export interface StatusConfig {
  variant: EventStatusVariant;
  badgeLabel: string;
  buttonLabel: string;
  pillClass: string;
  dotClass: string;
  buttonClass: string;
}

export interface UseEventCardProps {
  event: EventItem;
  brandLogoUrl?: string;
  onClick?: (event: EventItem) => void;
}

export function useEventCard({ event, brandLogoUrl, onClick }: UseEventCardProps) {
  // วิเคราะห์สถานะ: เขียว (ทำเสร็จแล้ว) vs เหลือง (รอทำ / รอถึงวัน)
  const statusConfig = useMemo<StatusConfig>(() => {
    const rawStatus = (event.eventStatus || "").toUpperCase();
    const isCompleted = rawStatus === "COMPLETED";

    if (isCompleted) {
      return {
        variant: "completed",
        badgeLabel: "ทำเสร็จแล้ว",
        buttonLabel: "เสร็จสิ้นกิจกรรม",
        pillClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
        dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
        buttonClass:
          "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-950/40",
      };
    }

    // Default เป็นรอทำหรือรอถึงวัน (สีเหลือง)
    return {
      variant: "upcoming",
      badgeLabel: "รอถึงวัน",
      buttonLabel: "รอจัดกิจกรรม",
      pillClass: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse",
      buttonClass:
        "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/30",
    };
  }, [event.eventStatus]);

  const brandInitial = useMemo(() => {
    return (event.brandScope || "B").trim().charAt(0).toUpperCase();
  }, [event.brandScope]);

  const timeRangeLabel = useMemo(() => {
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    }
    return event.startTime || "All-day";
  }, [event.startTime, event.endTime]);

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  return {
    statusConfig,
    brandInitial,
    timeRangeLabel,
    brandLogoUrl,
    handleClick,
  };
}
