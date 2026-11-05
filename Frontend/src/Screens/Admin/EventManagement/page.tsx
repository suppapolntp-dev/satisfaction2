"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import EventCalendar from "@/Components/Calendars/EventCalendar";
import EventTable from "@/Components/Tables/EventTable";
import EventDetailModal from "@/Components/Modals/EventDetailModal";
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
    handleCloseSelectedEvent,
    handleTabChange,
    handleSelectDate,
    handleSelectEvent,
    handleEditEvent,
    handleDeleteEvent,
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
          onCreateEvent={handleCreateEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {/* ─── TAB 2: EVENTS & CAMPAIGNS (TABLE VIEW) ─── */}
      {activeTab === "events" && (
        <EventTable
          events={events || []}
          isLoading={isLoading}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {/* ─── MODAL: EVENT DETAILS POPUP ─── */}
      <EventDetailModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={handleCloseSelectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
