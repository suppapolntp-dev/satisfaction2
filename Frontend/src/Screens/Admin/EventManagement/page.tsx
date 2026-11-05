"use client";

import React from "react";
import PageHeader from "@/Components/Headers/PageHeader";
import EventCalendar from "@/Components/Calendars/EventCalendar";
import EventTable from "@/Components/Tables/EventTable";
import EventDetailModal from "@/Components/Modals/EventDetailModal";
import EventEditModal from "@/Components/Modals/EventEditModal";
import ConfirmDialogModal from "@/Components/Modals/ConfirmDialogModal";
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
    editingEvent,
    isEditModalOpen,
    deletingEvent,
    isDeleteConfirmOpen,
    handleCloseSelectedEvent,
    handleTabChange,
    handleSelectDate,
    handleSelectEvent,
    handleEditEvent,
    handleCloseEditModal,
    handleSaveEvent,
    handleRequestDelete,
    handleCloseDeleteConfirm,
    handleConfirmDelete,
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
          onDeleteEvent={handleRequestDelete}
        />
      )}

      {/* ─── TAB 2: EVENTS & CAMPAIGNS (TABLE VIEW) ─── */}
      {activeTab === "events" && (
        <EventTable
          events={events || []}
          isLoading={isLoading}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleRequestDelete}
        />
      )}

      {/* ─── MODAL 1: EVENT DETAILS POPUP ─── */}
      <EventDetailModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={handleCloseSelectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleRequestDelete}
      />

      {/* ─── MODAL 2: EVENT CREATE / EDIT MODAL (ข้อ 8) ─── */}
      <EventEditModal
        isOpen={isEditModalOpen}
        event={editingEvent}
        onClose={handleCloseEditModal}
        onSave={handleSaveEvent}
      />

      {/* ─── MODAL 3: REUSABLE DELETE CONFIRM MODAL (ข้อ 9) ─── */}
      <ConfirmDialogModal
        isOpen={isDeleteConfirmOpen}
        title="ยืนยันการลบกิจกรรม"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรม "${deletingEvent?.eventName || "กิจกรรมนี้"}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ยืนยันการลบ"
        cancelLabel="ยกเลิก"
        variant="danger"
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
