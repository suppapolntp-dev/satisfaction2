"use client";

import React, { useState, useMemo, useEffect } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import SearchInput from "@/Components/Inputs/SearchInput";
import SelectInput from "@/Components/Inputs/SelectInput";
import EventModal from "@/Components/Modals/EventModal";
import EventDetailModal from "@/Components/Modals/EventDetailModal";
import { searchEvents } from "@/Lib/search/searchEngine";
import { EventItem, EventCategory, CalendarCell } from "@/Types/event";
import { eventService } from "@/Services/eventService";
import { brandService } from "@/Services/brandService";

// ==========================================================================
// ─── HELPER FUNCTIONS FOR CALENDAR DATES
// ==========================================================================

function formatToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CALENDAR_WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS_TIMELINE = Array.from({ length: 15 }, (_, idx) => idx + 7); // 07:00 to 21:00

// สีประจำหมวดหมู่กิจกรรม
const CATEGORY_STYLES: Record<EventCategory, { label: string; badgeClass: string; dotClass: string }> = {
  CAMPAIGN: {
    label: "แคมเปญการประเมิน",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100",
    dotClass: "bg-amber-500",
  },
  MAINTENANCE: {
    label: "ซ่อมบำรุงฮาร์ดแวร์",
    badgeClass: "bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100",
    dotClass: "bg-rose-500",
  },
  FIRMWARE: {
    label: "อัปเดตระบบ Kiosk",
    badgeClass: "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100",
    dotClass: "bg-blue-500",
  },
  CALIBRATION: {
    label: "ตั้งค่าเซนเซอร์",
    badgeClass: "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100",
    dotClass: "bg-purple-500",
  },
  AUDIT: {
    label: "ตรวจสอบคุณภาพ CSAT",
    badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
};

// ==========================================================================
// ─── MAIN EVENT MANAGEMENT SCREEN COMPONENT
// ==========================================================================

export default function EventManagementScreen() {
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from services on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [events, brands] = await Promise.all([
          eventService.getEvents(),
          brandService.getBrands(),
        ]);
        setEventsList((events as any) || []);
        setAvailableBrands(brands ? brands.map((b) => b.brandName) : []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // ระบบปฏิทินจริงเริ่มต้นที่วันที่ของระบบปัจจุบัน (Real System Date)
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [calendarViewMode, setCalendarViewMode] = useState<"Month" | "Week" | "Day">("Month");
  
  // ตัวกรอง
  const [searchEventQuery, setSearchEventQuery] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("All Brands");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All Categories");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Modal States
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [addModalInitialDate, setAddModalInitialDate] = useState<string | undefined>(undefined);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);

  // ─── การคำนวณสถิติ KPI ───
  const eventStatsConfigurations: StatItem[] = useMemo(() => {
    const total = eventsList.length;
    const liveCount = eventsList.filter((e) => e.eventStatus === "Active" || e.eventStatus === "LIVE").length;
    const completedCount = eventsList.filter((e) => e.eventStatus === "Completed" || e.eventStatus === "COMPLETED").length;
    const upcomingCount = eventsList.filter((e) => e.eventStatus === "Upcoming" || e.eventStatus === "UPCOMING").length;

    const hasData = total > 0;

    return [
      { label: "Total Events", value: hasData ? `${total} รายการ` : "-", change: "", isUp: true, icon: "event", color: "text-blue-600" },
      { label: "Live / In-Progress", value: hasData ? `${liveCount} กิจกรรม` : "-", change: "", isUp: true, icon: "schedule", color: "text-emerald-600" },
      { label: "Upcoming Events", value: hasData ? `${upcomingCount} รายการ` : "-", change: "", isUp: true, icon: "celebration", color: "text-purple-600" },
      { label: "Completed", value: hasData ? `${completedCount} งาน` : "-", change: "", isUp: true, icon: "check_circle", color: "text-amber-600" },
    ];
  }, [eventsList]);

  // ─── 1. Month View Cells ───
  const monthCalendarCells = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = formatToYYYYMMDD(new Date());
    const cells: CalendarCell[] = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dNum);
      const dStr = formatToYYYYMMDD(d);
      cells.push({
        date: d,
        dateString: dStr,
        dayNumber: dNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        events: eventsList.filter((e) => e.eventDate === dStr),
      });
    }

    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const d = new Date(year, month, dNum);
      const dStr = formatToYYYYMMDD(d);
      cells.push({
        date: d,
        dateString: dStr,
        dayNumber: dNum,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        events: eventsList.filter((e) => e.eventDate === dStr),
      });
    }

    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let dNum = 1; dNum <= remaining; dNum++) {
      const d = new Date(year, month + 1, dNum);
      const dStr = formatToYYYYMMDD(d);
      cells.push({
        date: d,
        dateString: dStr,
        dayNumber: dNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        events: eventsList.filter((e) => e.eventDate === dStr),
      });
    }

    return cells;
  }, [currentCalendarDate, eventsList]);

  // ─── 2. Week View Days ───
  const weekCalendarDays = useMemo(() => {
    const curr = new Date(currentCalendarDate);
    const dayOfWeek = curr.getDay();
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const todayStr = formatToYYYYMMDD(new Date());
    const days: CalendarCell[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = formatToYYYYMMDD(d);
      days.push({
        date: d,
        dateString: dStr,
        dayNumber: d.getDate(),
        isCurrentMonth: d.getMonth() === currentCalendarDate.getMonth(),
        isToday: dStr === todayStr,
        events: eventsList.filter((e) => e.eventDate === dStr),
      });
    }

    return days;
  }, [currentCalendarDate, eventsList]);

  // ─── 3. Filtered Events for List View ───
  const filteredEvents = useMemo(() => {
    let result = searchEvents(searchEventQuery, eventsList);

    if (selectedBrandFilter !== "All Brands") {
      result = result.filter(
        (e) => e.brandScope.includes(selectedBrandFilter) || e.brandScope.includes("ทุกแบรนด์")
      );
    }
    if (selectedCategoryFilter !== "All Categories") {
      result = result.filter((e) => e.eventCategory === selectedCategoryFilter);
    }
    if (selectedDateFilter) {
      result = result.filter((e) => e.eventDate === selectedDateFilter);
    }

    return result;
  }, [eventsList, searchEventQuery, selectedBrandFilter, selectedCategoryFilter, selectedDateFilter]);

  // ─── Calendar Navigation ───
  const handlePrevMonth = () => {
    setCurrentCalendarDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleToday = () => {
    setCurrentCalendarDate(new Date());
  };

  // ─── Modal Handlers ───
  const handleOpenAddModal = (initialDate?: string) => {
    setAddModalInitialDate(initialDate || formatToYYYYMMDD(currentCalendarDate));
    setIsAddEventModalOpen(true);
  };

  const handleSaveNewEvent = async (eventData: any) => {
    const created = await eventService.createEvent(eventData);
    setEventsList((prev) => [created as any, ...prev]);
    setIsAddEventModalOpen(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("คุณต้องการลบกิจกรรมนี้ออกจากปฏิทินหรือไม่?")) {
      await eventService.deleteEvent(id);
      setEventsList((prev) => prev.filter((e) => e.eventId !== id));
      if (selectedEventForDetail?.eventId === id) {
        setSelectedEventForDetail(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PAGE HEADER SECTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-3xl">calendar_month</span>
            Enterprise Calendar & Event Campaigns
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ระบบปฏิทินองค์กร จัดการตารางกิจกรรม CSAT แคมเปญพิเศษ และการซ่อมบำรุงตู้ Kiosk ประจำสาขา
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button" 
            onClick={() => handleOpenAddModal(formatToYYYYMMDD(currentCalendarDate))}
            className="btn-primary shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            + สร้างกิจกรรมใหม่ (Add Event)
          </button>
        </div>
      </div>

      {/* ─── 2. KPI STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={eventStatsConfigurations} />

      {/* ─── 3. FILTER CONTROLS BAR ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <SearchInput
            value={searchEventQuery}
            onChange={setSearchEventQuery}
            placeholder="ค้นหากิจกรรม, แบรนด์, รหัส หรือสาขา..."
          />

          <div className="w-48">
            <SelectInput
              value={selectedBrandFilter}
              onChange={setSelectedBrandFilter}
              options={[
                { value: "All Brands", label: "ทุกแบรนด์ (All Brands)" },
                ...availableBrands.map((b) => ({ value: b, label: b })),
              ]}
            />
          </div>

          <div className="w-44">
            <SelectInput
              value={selectedCategoryFilter}
              onChange={setSelectedCategoryFilter}
              options={[
                { value: "All Categories", label: "ทุกหมวดหมู่" },
                { value: "CAMPAIGN", label: "แคมเปญการประเมิน" },
                { value: "MAINTENANCE", label: "ซ่อมบำรุงฮาร์ดแวร์" },
                { value: "FIRMWARE", label: "อัปเดตระบบ Kiosk" },
                { value: "CALIBRATION", label: "ตั้งค่าเซนเซอร์" },
                { value: "AUDIT", label: "ตรวจสอบคุณภาพ CSAT" },
              ]}
            />
          </div>
        </div>

        {/* Calendar View Mode Buttons */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          {(["Month", "Week", "Day"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCalendarViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                calendarViewMode === mode
                  ? "bg-white text-blue-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mode} View
            </button>
          ))}
        </div>
      </div>

      {/* ─── 4. CALENDAR WORKSPACE ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        
        {/* Calendar Navigation Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {MONTH_NAMES[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
            </h2>

            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* ─── MONTH VIEW ─── */}
        {calendarViewMode === "Month" && (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center py-2 text-xs font-bold text-slate-600">
              {CALENDAR_WEEK_DAYS.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs">
              {monthCalendarCells.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenAddModal(cell.dateString)}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer hover:bg-blue-50/30 ${
                    cell.isCurrentMonth ? "bg-white" : "bg-slate-50/40 text-slate-400"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                        cell.isToday
                          ? "bg-blue-900 text-white shadow-xs"
                          : "text-slate-700"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.events.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-100">
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 overflow-hidden">
                    {cell.events.slice(0, 3).map((evt) => {
                      const style = CATEGORY_STYLES[evt.eventCategory] || CATEGORY_STYLES.CAMPAIGN;
                      return (
                        <div
                          key={evt.eventId}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventForDetail(evt);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border truncate flex items-center gap-1 transition-all ${style.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotClass}`} />
                          <span className="truncate">{evt.eventName}</span>
                        </div>
                      );
                    })}
                    {cell.events.length > 3 && (
                      <div className="text-[9px] font-bold text-slate-500 pl-1">
                        +{cell.events.length - 3} รายการเพิ่มเติม
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── WEEK VIEW ─── */}
        {calendarViewMode === "Week" && (
          <div className="flex-1 flex flex-col overflow-x-auto">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center py-2 text-xs font-bold text-slate-600 min-w-[700px]">
              {weekCalendarDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span>{CALENDAR_WEEK_DAYS[idx]}</span>
                  <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] mt-0.5 ${
                    day.isToday ? "bg-blue-900 text-white font-bold" : "text-slate-700"
                  }`}>
                    {day.dayNumber}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-slate-100 min-w-[700px] min-h-[400px]">
              {weekCalendarDays.map((day, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenAddModal(day.dateString)}
                  className="p-2 space-y-1.5 cursor-pointer hover:bg-blue-50/30 transition-colors"
                >
                  {day.events.map((evt) => {
                    const style = CATEGORY_STYLES[evt.eventCategory] || CATEGORY_STYLES.CAMPAIGN;
                    return (
                      <div
                        key={evt.eventId}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventForDetail(evt);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-bold space-y-1 ${style.badgeClass}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotClass}`} />
                          <span className="truncate">{evt.eventName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {evt.startTime} - {evt.endTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── DAY VIEW ─── */}
        {calendarViewMode === "Day" && (
          <div className="p-4 space-y-3">
            <div className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
              กิจกรรมประจำวันที่ {formatToYYYYMMDD(currentCalendarDate)}
            </div>
            
            {eventsList.filter((e) => e.eventDate === formatToYYYYMMDD(currentCalendarDate)).length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">ไม่มีกิจกรรมที่บันทึกไว้ในวันนี้</p>
            ) : (
              <div className="space-y-2">
                {eventsList
                  .filter((e) => e.eventDate === formatToYYYYMMDD(currentCalendarDate))
                  .map((evt) => {
                    const style = CATEGORY_STYLES[evt.eventCategory] || CATEGORY_STYLES.CAMPAIGN;
                    return (
                      <div
                        key={evt.eventId}
                        onClick={() => setSelectedEventForDetail(evt)}
                        className={`p-3 rounded-2xl border cursor-pointer flex justify-between items-center ${style.badgeClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${style.dotClass}`} />
                          <div>
                            <div className="font-bold text-slate-900">{evt.eventName}</div>
                            <div className="text-xs text-slate-500">{evt.brandScope} • {evt.eventLocation}</div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-xs text-slate-700">
                          {evt.startTime} - {evt.endTime}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ─── 5. ADD / CREATE EVENT MODAL ─── */}
      <EventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        initialDate={addModalInitialDate}
        availableBrands={availableBrands}
        onSave={handleSaveNewEvent}
      />

      {/* ─── 6. EVENT DETAIL MODAL ─── */}
      <EventDetailModal
        event={selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onDelete={handleDeleteEvent}
      />

    </div>
  );
}