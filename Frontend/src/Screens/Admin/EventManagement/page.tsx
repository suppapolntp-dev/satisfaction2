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
                onClick={handleSelectEvent}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── EVENT DETAIL PREVIEW MODAL ─── */}
      {selectedEvent && (
        <div
          onClick={handleCloseSelectedEvent}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseSelectedEvent}
              className="absolute -top-12 right-0 sm:-right-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-all active:scale-95"
              aria-label="Close Preview"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <EventCard event={selectedEvent} onClick={handleCloseSelectedEvent} />
          </div>
        </div>
      )}
    </div>
  );
}
