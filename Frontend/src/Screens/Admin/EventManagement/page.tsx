"use client";

import React, { useState, useMemo } from "react";
import StatsGrid, { StatItem } from "@/Components/Grids/StatsGrid";
import SearchInput from "@/Components/Inputs/SearchInput";
import SelectInput from "@/Components/Inputs/SelectInput";

// ─── 1. นิยามโครงสร้างข้อมูลเต็มคำชัดเจน (Descriptive Interfaces) ───
interface UpcomingEventItem {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventStatus: "LIVE" | "UPCOMING" | "COMPLETED";
}

interface CalendarDayItem {
  dayNumber: number;
  isCurrentMonth: boolean;
  eventTitle?: string;
  eventColor?: "green" | "gray" | "blue";
}

// ─── 2. ข้อมูลจำลองพอดีคำเพื่อทดสอบหน้าจอ (Descriptive Mock Data) ───
const MOCK_UPCOMING_EVENTS: UpcomingEventItem[] = [
  {
    eventId: "EVENT_OCT_01",
    eventName: "T1 Gate 3 Kiosk System Sync",
    eventDate: "Oct 12, 2026",
    eventLocation: "Terminal 1 - Passport Control",
    eventStatus: "LIVE",
  },
  {
    eventId: "EVENT_OCT_02",
    eventName: "iPadOS UX Audit & Calibration",
    eventDate: "Oct 18, 2026",
    eventLocation: "Terminal 2 - Arrival Hall Exit A",
    eventStatus: "UPCOMING",
  },
  {
    eventId: "EVENT_OCT_03",
    eventName: "Quarterly Enterprise CSAT Review",
    eventDate: "Oct 25, 2026",
    eventLocation: "Headquarters - Conference Room B",
    eventStatus: "COMPLETED",
  },
];

const MOCK_CALENDAR_DAYS: CalendarDayItem[] = [
  { dayNumber: 27, isCurrentMonth: false },
  { dayNumber: 28, isCurrentMonth: false },
  { dayNumber: 29, isCurrentMonth: false },
  { dayNumber: 30, isCurrentMonth: false },
  { dayNumber: 1, isCurrentMonth: true },
  { dayNumber: 2, isCurrentMonth: true },
  { dayNumber: 3, isCurrentMonth: true },
  { dayNumber: 4, isCurrentMonth: true },
  { dayNumber: 5, isCurrentMonth: true },
  { dayNumber: 6, isCurrentMonth: true },
  { dayNumber: 7, isCurrentMonth: true },
  { dayNumber: 8, isCurrentMonth: true },
  { dayNumber: 9, isCurrentMonth: true },
  { dayNumber: 10, isCurrentMonth: true },
  { dayNumber: 11, isCurrentMonth: true },
  { dayNumber: 12, isCurrentMonth: true, eventTitle: "Kiosk Sync", eventColor: "green" },
  { dayNumber: 13, isCurrentMonth: true },
  { dayNumber: 14, isCurrentMonth: true },
  { dayNumber: 15, isCurrentMonth: true },
  { dayNumber: 16, isCurrentMonth: true },
  { dayNumber: 17, isCurrentMonth: true },
  { dayNumber: 18, isCurrentMonth: true, eventTitle: "iPadOS Audit", eventColor: "blue" },
  { dayNumber: 19, isCurrentMonth: true },
  { dayNumber: 20, isCurrentMonth: true },
  { dayNumber: 21, isCurrentMonth: true },
  { dayNumber: 22, isCurrentMonth: true },
  { dayNumber: 23, isCurrentMonth: true },
  { dayNumber: 24, isCurrentMonth: true },
  { dayNumber: 25, isCurrentMonth: true, eventTitle: "CSAT Review", eventColor: "gray" },
  { dayNumber: 26, isCurrentMonth: true },
  { dayNumber: 27, isCurrentMonth: true },
  { dayNumber: 28, isCurrentMonth: true },
  { dayNumber: 29, isCurrentMonth: true },
  { dayNumber: 30, isCurrentMonth: true },
  { dayNumber: 31, isCurrentMonth: true },
];

const CALENDAR_WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EventManagementScreen() {
  // ─── 3. ระบบควบคุมสถานะตัวกรองหน้าร้าน (Controlled States) ───
  const [searchEventQuery, setSearchEventQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  // ─── 4. เตรียมข้อมูลส่งผ่าน Props เข้าหาคอมโพเนนต์กลาง StatsGrid ───
  const eventStatsConfigurations: StatItem[] = useMemo(() => {
    return [
      { label: "Total Events", value: "1,248", change: "+12% vs last month", isUp: true, icon: "trending_up", color: "text-primary" },
      { label: "Active Events", value: "42", change: "Live right now", isUp: true, icon: "circle", color: "text-primary" },
      { label: "Completed Events", value: "1,180", change: "Year to date", isUp: true, icon: "check_circle", color: "text-secondary" },
      { label: "Avg. Satisfaction", value: "4.8/5", change: "Based on 12k votes", isUp: true, icon: "star", color: "text-primary-container" },
    ];
  }, []);

  // ─── 5. ระบบกรองข้อมูลกิจกรรมฝั่ง Client-Side Search ───
  const filteredUpcomingEvents = useMemo(() => {
    const lowercaseQuery = searchEventQuery.toLowerCase();
    return MOCK_UPCOMING_EVENTS.filter((individualEvent) => {
      return (
        individualEvent.eventName.toLowerCase().includes(lowercaseQuery) ||
        individualEvent.eventLocation.toLowerCase().includes(lowercaseQuery)
      );
    });
  }, [searchEventQuery]);

  const handleClearAllFilters = () => {
    setSearchEventQuery("");
    setSelectedCompany("All Companies");
    setSelectedBrand("All Brands");
    setSelectedBranch("All Branches");
  };

  return (
    <div className="flex-1 p-[var(--spacing-lg)] flex flex-col gap-[var(--spacing-lg)] bg-slate-50">
      
      {/* ─── 5.1 PAGE HEADER SECTION ─── */}
      <header className="card p-[var(--spacing-lg)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[var(--spacing-md)]">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--on-surface)] tracking-tight">Event Management</h2>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">Schedule timelines, manage locations, and track attendee satisfaction</p>
        </div>
        <div className="flex flex-wrap items-center gap-[var(--spacing-sm)] w-full sm:w-auto justify-end">
          <SearchInput
            value={searchEventQuery}
            onChange={setSearchEventQuery}
            placeholder="Search events..."
          />
          <button type="button" className="btn btn-secondary">
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
          <button type="button" className="btn btn-primary">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Event
          </button>
        </div>
      </header>

      {/* ─── 5.2 KPI STATS OVERVIEW SECTION ─── */}
      <StatsGrid data={eventStatsConfigurations} />

      {/* ─── 5.3 FILTER CONTROLS BAR ─── */}
      <div className="card p-[var(--spacing-md)] flex flex-col md:flex-row gap-[var(--spacing-md)] items-center justify-between">
        <div className="flex flex-wrap gap-[var(--spacing-sm)] items-center w-full md:w-auto">
          <span className="material-symbols-outlined text-[var(--on-surface-variant)]">filter_list</span>
          
          <SelectInput
            value={selectedCompany}
            onChange={setSelectedCompany}
            options={[
              { value: "All Companies", label: "All Companies" },
              { value: "Acme Corp", label: "Acme Corp" },
              { value: "Global Tech", label: "Global Tech" },
            ]}
          />

          <SelectInput
            value={selectedBrand}
            onChange={setSelectedBrand}
            options={[
              { value: "All Brands", label: "All Brands" },
              { value: "Brand A", label: "Brand A" },
              { value: "Brand B", label: "Brand B" },
            ]}
          />

          <SelectInput
            value={selectedBranch}
            onChange={setSelectedBranch}
            options={[
              { value: "All Branches", label: "All Branches" },
              { value: "North America", label: "North America" },
              { value: "EMEA", label: "EMEA" },
            ]}
          />
        </div>

        <button
          type="button"
          onClick={handleClearAllFilters}
          className="btn-ghost text-xs font-bold w-full md:w-auto text-right"
        >
          Clear Filters
        </button>
      </div>

      {/* ─── 5.4 MONTHLY CALENDAR VIEW ─── */}
      <div className="card overflow-hidden flex flex-col">
        {/* หัวปฏิทิน */}
        <div className="flex items-center justify-between p-[var(--spacing-md)] border-b border-[var(--outline-variant)] bg-slate-50/50">
          <div className="flex items-center gap-[var(--spacing-sm)]">
            <h3 className="text-sm font-bold text-[var(--on-surface)]">October 2026</h3>
            <div className="flex gap-0.5">
              <button type="button" className="p-1 hover:bg-slate-200/60 rounded-md transition-colors">
                <span className="material-symbols-outlined block text-sm">chevron_left</span>
              </button>
              <button type="button" className="p-1 hover:bg-slate-200/60 rounded-md transition-colors">
                <span className="material-symbols-outlined block text-sm">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-bold">
            <button type="button" className="px-2.5 py-1 bg-white rounded-md shadow-xs text-[var(--on-surface)]">Month</button>
            <button type="button" className="px-2.5 py-1 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">Week</button>
            <button type="button" className="px-2.5 py-1 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">Day</button>
          </div>
        </div>

        {/* แผงตารางกริดปฏิทิน */}
        <div className="grid grid-cols-7 bg-[var(--outline-variant)] gap-[1px]">
          {CALENDAR_WEEK_DAYS.map((dayName) => (
            <div key={dayName} className="bg-slate-50 p-2 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
              {dayName}
            </div>
          ))}

          {MOCK_CALENDAR_DAYS.map((calendarDay, dayIndex) => (
            <div
              key={dayIndex}
              className={`${
                calendarDay.isCurrentMonth ? "bg-white" : "bg-slate-50/60"
              } p-2 flex flex-col justify-between min-h-[80px] transition-colors`}
            >
              <span className={`text-right text-xs font-bold block ${calendarDay.isCurrentMonth ? "text-[var(--on-surface)]" : "text-slate-400"}`}>
                {calendarDay.dayNumber}
              </span>
              
              {calendarDay.eventTitle && (
                <div className={`calendar-event mt-1 ${
                  calendarDay.eventColor === "green" ? "calendar-event-green" :
                  calendarDay.eventColor === "blue" ? "calendar-event-blue" :
                  "calendar-event-gray"
                }`}>
                  {calendarDay.eventTitle}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5.5 UPCOMING EVENTS LIST VIEW ─── */}
      <div className="card overflow-hidden">
        <div className="p-[var(--spacing-md)] border-b border-[var(--outline-variant)] bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-[var(--on-surface)]">Upcoming Events</h3>
          <button type="button" className="btn-ghost text-xs font-bold">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50/30 border-b border-[var(--outline-variant)]">
                <th className="table-header">Event Name</th>
                <th className="table-header">Date</th>
                <th className="table-header">Location / Branch</th>
                <th className="table-header text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {filteredUpcomingEvents.map((individualEvent) => (
                <tr key={individualEvent.eventId} className="table-row">
                  <td className="table-cell">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--on-surface)]">{individualEvent.eventName}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{individualEvent.eventId}</span>
                    </div>
                  </td>
                  <td className="table-cell text-[var(--on-surface-variant)]">{individualEvent.eventDate}</td>
                  <td className="table-cell text-[var(--on-surface-variant)]">{individualEvent.eventLocation}</td>
                  <td className="table-cell text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      individualEvent.eventStatus === "LIVE" ? "badge-live" :
                      individualEvent.eventStatus === "UPCOMING" ? "badge-upcoming" :
                      "badge-completed"
                    }`}>
                      {individualEvent.eventStatus}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredUpcomingEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 text-xs">
                    No upcoming events found matching your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}