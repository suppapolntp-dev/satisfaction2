"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import EventCalendar from "@/Components/Calendars/EventCalendar";
import EventCard from "@/Components/Cards/EventCard";
import {
  useEventManagementScreen,
  EventManagementTab,
} from "./useEventManagementScreen";

export interface EventManagementScreenProps {
  initialTab?: EventManagementTab;
}

export default function EventManagementScreen({
  initialTab = "calendar",
}: EventManagementScreenProps = {}) {
  const {
    activeTab,
    eventTabs,
    events,
    isLoading,
    selectedEvent,
    handleTabChange,
    handleSelectDate,
    handleSelectEvent,
    handleCloseSelectedEvent,
    handleCreateEvent,
  } = useEventManagementScreen({ initialTab });

  return (
    <div className="space-y-6">
      {/* ─── 1. MODULAR PAGE HEADER WITH TABS & ACTIONS ─── */}
      <PageHeader
        title="Event & Campaigns"
        description="Enterprise calendar scheduling, CSAT survey campaigns, and branch kiosk operations management"
        tabs={eventTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        primaryAction={{
          label: "Add Event",
          variant: "primary",
          icon: (
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          ),
          onClick: handleCreateEvent,
        }}
      />

      {/* ─── TAB 1: CALENDAR VIEW ─── */}
      {activeTab === "calendar" && (
        <EventCalendar
          events={events}
          isLoading={isLoading}
          onSelectDate={handleSelectDate}
          onSelectEvent={handleSelectEvent}
        />
      )}

      {/* ─── TAB 2: EVENTS & CAMPAIGNS (CARDS VIEW) ─── */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Active Campaigns & Scheduled Events
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                รายการกิจกรรม CSAT, แคมเปญการประเมิน, และการซ่อมบำรุงตู้ Kiosk
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {events?.length || 0} รายการ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center pt-2">
            {events?.map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                brandLogoUrl="/images/brands/mister-donut.svg"
                onClick={handleSelectEvent}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
