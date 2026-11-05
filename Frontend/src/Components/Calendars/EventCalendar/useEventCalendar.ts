"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { EventItem, CalendarCell, CalendarWeek, CalendarEventSegment } from "@/Types/event";

export type CalendarViewMode = "Day" | "Week" | "Month";

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

function getEventEndDate(event: EventItem): string {
  return event.eventEndDate && event.eventEndDate >= event.eventDate ? event.eventEndDate : event.eventDate;
}

function isEventOnDate(event: EventItem, dateString: string): boolean {
  return event.eventDate <= dateString && dateString <= getEventEndDate(event);
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

export const THAI_MONTH_NAMES = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const MINI_WEEKDAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export const THAI_DAY_NAMES: Record<number, { full: string; short: string }> = {
  0: { full: "วันอาทิตย์", short: "อาทิตย์" },
  1: { full: "วันจันทร์", short: "จันทร์" },
  2: { full: "วันอังคาร", short: "อังคาร" },
  3: { full: "วันพุธ", short: "พุธ" },
  4: { full: "วันพฤหัสบดี", short: "พฤหัส" },
  5: { full: "วันศุกร์", short: "ศุกร์" },
  6: { full: "วันเสาร์", short: "เสาร์" },
};

export function useEventCalendar({
  events = [],
  initialDate,
  onSelectDate,
  onSelectEvent,
}: UseEventCalendarProps = {}) {
  const [currentDate, setCurrentDate] = useState<Date>(() => initialDate || new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("Week");
  const [miniDate, setMiniDate] = useState<Date>(() => initialDate || new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const safeEvents = useMemo(() => events || [], [events]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    safeEvents.forEach((e) => {
      if (e.brandScope?.trim()) set.add(e.brandScope.trim());
    });
    return Array.from(set);
  }, [safeEvents]);

  const toggleBrandFilter = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  const selectAllBrands = useCallback(() => {
    setSelectedBrands([]);
  }, []);

  const toggleCategoryFilter = useCallback((category: string) => {
    const catUpper = category.toUpperCase();
    setSelectedCategories((prev) =>
      prev.includes(catUpper) ? prev.filter((c) => c !== catUpper) : [...prev, catUpper]
    );
  }, []);

  const selectAllCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSearchQuery("");
  }, []);

  const isFiltered = useMemo(() => {
    return Boolean(
      searchQuery.trim() || selectedBrands.length > 0 || selectedCategories.length > 0
    );
  }, [searchQuery, selectedBrands.length, selectedCategories.length]);

  const filteredEvents = useMemo(() => {
    let list = safeEvents;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.eventName.toLowerCase().includes(q) ||
          e.brandScope.toLowerCase().includes(q) ||
          (e.eventLocation && e.eventLocation.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q))
      );
    }
    if (selectedBrands.length > 0) {
      list = list.filter((e) => selectedBrands.includes(e.brandScope));
    }
    if (selectedCategories.length > 0) {
      list = list.filter((e) =>
        selectedCategories.includes((e.eventCategory || "").toUpperCase())
      );
    }
    return list;
  }, [safeEvents, searchQuery, selectedBrands, selectedCategories]);

  const todayStr = useMemo(() => formatToYYYYMMDD(new Date()), []);
  const currentDateStr = useMemo(() => formatToYYYYMMDD(currentDate), [currentDate]);

  // ─── Mini Calendar Calculations (Google Calendar Sidebar) ───
  const miniYear = miniDate.getFullYear();
  const miniMonth = miniDate.getMonth();

  const miniMonthYearThLabel = useMemo(() => {
    return `${THAI_MONTH_NAMES[miniMonth]} ${miniYear}`;
  }, [miniMonth, miniYear]);

  const handlePrevMiniMonth = useCallback(() => {
    setMiniDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMiniMonth = useCallback(() => {
    setMiniDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const miniCalendarCells = useMemo(() => {
    const daysInMonth = new Date(miniYear, miniMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(miniYear, miniMonth, 0).getDate();
    const firstDayOfWeek = new Date(miniYear, miniMonth, 1).getDay(); // 0 is Sunday

    const cells: {
      date: Date;
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Prev month trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const d = new Date(miniYear, miniMonth - 1, dNum);
      const dStr = formatToYYYYMMDD(d);
      cells.push({
        date: d,
        dateString: dStr,
        dayNumber: dNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === currentDateStr,
      });
    }

    // Current month days
    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const d = new Date(miniYear, miniMonth, dNum);
      const dStr = formatToYYYYMMDD(d);
      cells.push({
        date: d,
        dateString: dStr,
        dayNumber: dNum,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === currentDateStr,
      });
    }

    // Next month trailing days (pad to 35 or 42)
    const targetTotal = cells.length <= 35 ? 35 : 42;
    const remaining = targetTotal - cells.length;
    for (let dNum = 1; dNum <= remaining; dNum++) {
      const d = new Date(miniYear, miniMonth + 1, dNum);
      const dStr = formatToYYYYMMDD(d);
      cells.push({
        date: d,
        dateString: dStr,
        dayNumber: dNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === currentDateStr,
      });
    }

    return cells;
  }, [miniYear, miniMonth, todayStr, currentDateStr]);

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
        events: filteredEvents.filter((e) => isEventOnDate(e, dStr)),
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
        events: filteredEvents.filter((e) => isEventOnDate(e, dStr)),
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
        events: filteredEvents.filter((e) => isEventOnDate(e, dStr)),
      });
    }

    return cells;
  }, [currentDate, filteredEvents, todayStr]);

  // ─── 1b. Month rows with multi-day event segments (lane-packed) ───
  const monthWeeks = useMemo<CalendarWeek[]>(() => {
    const weeks: CalendarWeek[] = [];
    for (let offset = 0; offset < monthCalendarCells.length; offset += 7) {
      const cells = monthCalendarCells.slice(offset, offset + 7);
      const firstDay = cells[0].dateString;
      const lastDay = cells[cells.length - 1].dateString;

      const candidates = filteredEvents
        .filter((e) => e.eventDate <= lastDay && getEventEndDate(e) >= firstDay)
        .map((event) => {
          const endDate = getEventEndDate(event);
          const startIndex = cells.findIndex((c) => c.dateString >= event.eventDate);
          const endIndex = cells.filter((c) => c.dateString <= endDate).length - 1;
          return { event, startIndex, endIndex, isMultiDay: endDate > event.eventDate };
        })
        .sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex);

      const laneEndIndexes: number[] = [];
      const segments: CalendarEventSegment[] = candidates.map(({ event, startIndex, endIndex, isMultiDay }) => {
        let laneIndex = laneEndIndexes.findIndex((laneEnd) => laneEnd < startIndex);
        if (laneIndex === -1) laneIndex = laneEndIndexes.length;
        laneEndIndexes[laneIndex] = endIndex;
        return { event, startColumn: startIndex + 1, columnSpan: endIndex - startIndex + 1, laneIndex, isMultiDay };
      });

      weeks.push({ cells, segments });
    }
    return weeks;
  }, [monthCalendarCells, filteredEvents]);

  // ─── 2. Week View Days Calculation (Monday to Sunday, Fireart style) ───
  const weekCalendarDays = useMemo<CalendarCell[]>(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 is Sun, 1 is Mon...
    const mondayOffset = (dayOfWeek + 6) % 7; // 0 for Mon, 6 for Sun
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - mondayOffset);

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
        events: filteredEvents.filter((e) => isEventOnDate(e, dStr)),
      });
    }

    return days;
  }, [currentDate, filteredEvents, todayStr]);

  // ─── 2b. Week View Event Segments (Multi-Day Lane-Packed) ───
  const weekSegments = useMemo<CalendarEventSegment[]>(() => {
    if (weekCalendarDays.length === 0) return [];
    const cells = weekCalendarDays;
    const firstDay = cells[0].dateString;
    const lastDay = cells[cells.length - 1].dateString;

    const candidates = filteredEvents
      .filter((e) => e.eventDate <= lastDay && getEventEndDate(e) >= firstDay)
      .map((event) => {
        const endDate = getEventEndDate(event);
        const startIndex = Math.max(0, cells.findIndex((c) => c.dateString >= event.eventDate));
        const endIndex = cells.filter((c) => c.dateString <= endDate).length - 1;
        return { event, startIndex, endIndex: Math.max(startIndex, endIndex), isMultiDay: endDate > event.eventDate };
      })
      .sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex);

    const laneEndIndexes: number[] = [];
    return candidates.map(({ event, startIndex, endIndex, isMultiDay }) => {
      let laneIndex = laneEndIndexes.findIndex((laneEnd) => laneEnd < startIndex);
      if (laneIndex === -1) laneIndex = laneEndIndexes.length;
      laneEndIndexes[laneIndex] = endIndex;
      return { event, startColumn: startIndex + 1, columnSpan: Math.max(1, endIndex - startIndex + 1), laneIndex, isMultiDay };
    });
  }, [weekCalendarDays, filteredEvents]);

  const weekLaneCount = useMemo(() => {
    const maxLane = weekSegments.reduce((max, s) => Math.max(max, s.laneIndex + 1), 0);
    return Math.max(4, maxLane);
  }, [weekSegments]);

  const weekRangeLabel = useMemo(() => {
    if (weekCalendarDays.length === 0) return "";
    const first = weekCalendarDays[0].date;
    const last = weekCalendarDays[6].date;
    const firstThMonth = THAI_MONTH_NAMES[first.getMonth()];
    const lastThMonth = THAI_MONTH_NAMES[last.getMonth()];
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} - ${last.getDate()} ${firstThMonth} ${first.getFullYear()}`;
    }
    return `${first.getDate()} ${firstThMonth} - ${last.getDate()} ${lastThMonth} ${last.getFullYear()}`;
  }, [weekCalendarDays]);

  // ─── 3. Day View Events (Filtered by Search Query & Category) ───
  const dayEvents = useMemo(() => {
    return filteredEvents.filter((e) => isEventOnDate(e, currentDateStr));
  }, [filteredEvents, currentDateStr]);

  const dayTitleLabel = useMemo(() => {
    const dayIndex = currentDate.getDay();
    const thai = THAI_DAY_NAMES[dayIndex] || { full: "" };
    const thMonth = THAI_MONTH_NAMES[currentDate.getMonth()];
    return `${thai.full}ที่ ${currentDate.getDate()} ${thMonth} ${currentDate.getFullYear() + 543}`;
  }, [currentDate]);

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
    const now = new Date();
    setCurrentDate(now);
    setMiniDate(now);
  }, []);

  const monthYearLabel = useMemo(() => {
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [currentDate]);

  const isCurrentDateToday = useMemo(
    () => currentDateStr === todayStr,
    [currentDateStr, todayStr]
  );

  const currentDayInfo = useMemo(() => {
    const dayIndex = currentDate.getDay();
    const thai = THAI_DAY_NAMES[dayIndex] || { full: "", short: "" };
    const englishShort = CALENDAR_WEEK_DAYS[dayIndex] || "";
    return {
      dayOfWeekThShort: thai.short,
      dayOfWeekThFull: thai.full,
      dayOfWeekEn: englishShort,
      dayNumber: currentDate.getDate(),
      isToday: isCurrentDateToday,
    };
  }, [currentDate, isCurrentDateToday]);

  const selectDate = useCallback(
    (dateString: string) => {
      const [y, m, d] = dateString.split("-").map(Number);
      if (y && m && d) {
        const nextDate = new Date(y, m - 1, d);
        setCurrentDate(nextDate);
        setMiniDate(new Date(y, m - 1, 1));
      }
      if (onSelectDate) onSelectDate(dateString);
    },
    [onSelectDate]
  );

  return {
    currentDate,
    currentDateStr,
    isCurrentDateToday,
    currentDayInfo,
    viewMode,
    setViewMode,
    miniMonthYearThLabel,
    miniCalendarCells,
    handlePrevMiniMonth,
    handleNextMiniMonth,
    searchQuery,
    setSearchQuery,
    selectedBrands,
    availableBrands,
    toggleBrandFilter,
    selectAllBrands,
    selectedCategories,
    toggleCategoryFilter,
    selectAllCategories,
    resetFilters,
    isFiltered,
    monthCalendarCells,
    monthWeeks,
    weekCalendarDays,
    weekSegments,
    weekLaneCount,
    weekRangeLabel,
    dayEvents,
    dayTitleLabel,
    monthYearLabel,
    handlePrev,
    handleNext,
    handleToday,
    selectDate,
    onSelectDate,
    onSelectEvent,
  };
}
