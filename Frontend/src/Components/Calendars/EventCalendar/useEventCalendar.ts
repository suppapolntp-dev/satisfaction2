"use client";

import { useState, useMemo, useCallback } from "react";
import { EventItem, CalendarCell } from "@/Types/event";

export type CalendarViewMode = "Month" | "Week" | "Day";

export interface UseEventCalendarProps {
  events?: EventItem[] | null;
  initialDate?: Date;
  onSelectDate?: (dateString: string) => void;
  onSelectEvent?: (event: EventItem) => void;
}

export function formatToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CALENDAR_WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function useEventCalendar({
  events = [],
  initialDate,
  onSelectDate,
  onSelectEvent,
}: UseEventCalendarProps = {}) {
  const [currentDate, setCurrentDate] = useState<Date>(() => initialDate || new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("Month");

  const safeEvents = useMemo(() => events || [], [events]);

  const todayStr = useMemo(() => formatToYYYYMMDD(new Date()), []);
  const currentDateStr = useMemo(() => formatToYYYYMMDD(currentDate), [currentDate]);

  // ─── 1. Month View Cells Calculation ───
  const monthCalendarCells = useMemo<CalendarCell[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: CalendarCell[] = [];

    // Prev month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const dStr = formatToYYYYMMDD(d);
      cells.push({
        date: d,
        dateString: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        events: safeEvents.filter((e) => e.eventDate === dStr),
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dStr = formatToYYYYMMDD(d);
      cells.push({
        date: d,
        dateString: dStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        events: safeEvents.filter((e) => e.eventDate === dStr),
      });
    }

    // Next month trailing days (pad to 35 or 42)
    const targetTotal = cells.length <= 35 ? 35 : 42;
    const remaining = targetTotal - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      const dStr = formatToYYYYMMDD(d);
      cells.push({
        date: d,
        dateString: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        events: safeEvents.filter((e) => e.eventDate === dStr),
      });
    }

    return cells;
  }, [currentDate, safeEvents, todayStr]);

  // ─── 2. Week View Days Calculation ───
  const weekCalendarDays = useMemo<CalendarCell[]>(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const days: CalendarCell[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = formatToYYYYMMDD(d);
      days.push({
        date: d,
        dateString: dStr,
        dayNumber: d.getDate(),
        isCurrentMonth: d.getMonth() === currentDate.getMonth(),
        isToday: dStr === todayStr,
        events: safeEvents.filter((e) => e.eventDate === dStr),
      });
    }

    return days;
  }, [currentDate, safeEvents, todayStr]);

  // ─── 3. Day View Events ───
  const dayEvents = useMemo(() => {
    return safeEvents.filter((e) => e.eventDate === currentDateStr);
  }, [safeEvents, currentDateStr]);

  // ─── Navigation Handlers ───
  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "Month") {
        d.setMonth(d.getMonth() - 1);
      } else if (viewMode === "Week") {
        d.setDate(d.getDate() - 7);
      } else {
        d.setDate(d.getDate() - 1);
      }
      return d;
    });
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "Month") {
        d.setMonth(d.getMonth() + 1);
      } else if (viewMode === "Week") {
        d.setDate(d.getDate() + 7);
      } else {
        d.setDate(d.getDate() + 1);
      }
      return d;
    });
  }, [viewMode]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const monthYearLabel = useMemo(() => {
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [currentDate]);

  return {
    currentDate,
    currentDateStr,
    viewMode,
    setViewMode,
    monthCalendarCells,
    weekCalendarDays,
    dayEvents,
    monthYearLabel,
    handlePrev,
    handleNext,
    handleToday,
    onSelectDate,
    onSelectEvent,
  };
}
