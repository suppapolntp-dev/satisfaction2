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
        pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
        dotClass: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]",
        buttonClass: "bg-[#111111] hover:bg-black text-white",
      };
    }

    // Default: รอทำหรือรอถึงวัน (สีเหลือง)
    return {
      variant: "upcoming",
      badgeLabel: "รอถึงวัน",
      buttonLabel: "รอจัดกิจกรรม",
      pillClass: "bg-amber-50 text-amber-800 border-amber-200/90",
      dotClass: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-pulse",
      buttonClass: "bg-[#111111] hover:bg-black text-white",
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
