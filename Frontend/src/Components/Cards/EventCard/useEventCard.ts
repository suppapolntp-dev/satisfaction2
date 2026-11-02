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
  // วิเคราะห์สถานะจากตัวแปร: เขียว (ทำเสร็จแล้ว) vs เหลือง (รอทำ / รอถึงวัน)
  const statusConfig = useMemo<StatusConfig>(() => {
    const rawStatus = (event.eventStatus || "").toUpperCase();
    const isCompleted = rawStatus === "COMPLETED";

    if (isCompleted) {
      return {
        variant: "completed",
        badgeLabel: "ทำเสร็จแล้ว",
        buttonLabel: "เสร็จสิ้นกิจกรรม",
        pillClass: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
        dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]",
        buttonClass: "bg-white hover:bg-slate-100 text-slate-950",
      };
    }

    // Default: รอทำหรือรอถึงวัน (สีเหลือง)
    return {
      variant: "upcoming",
      badgeLabel: "รอถึงวัน",
      buttonLabel: "รอจัดกิจกรรม",
      pillClass: "bg-amber-500/25 text-amber-200 border-amber-400/40",
      dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse",
      buttonClass: "bg-white hover:bg-slate-100 text-slate-950",
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

  const effectiveBrandLogoUrl = useMemo(() => {
    return event.brandLogoUrl || brandLogoUrl || "/images/brands/mister-donut.svg";
  }, [event.brandLogoUrl, brandLogoUrl]);

  return {
    statusConfig,
    brandInitial,
    timeRangeLabel,
    brandLogoUrl: effectiveBrandLogoUrl,
    handleClick,
  };
}
