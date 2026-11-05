"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { EventItem } from "@/Types/event";
import { eventService } from "@/Services/eventService";

export type EventManagementTab = "calendar" | "events";

export interface UseEventManagementScreenProps {
  initialTab?: EventManagementTab;
}

export function useEventManagementScreen({
  initialTab = "calendar",
}: UseEventManagementScreenProps = {}) {
  const [activeTab, setActiveTab] = useState<EventManagementTab>(initialTab);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const eventTabs: HeaderTabItem[] = useMemo(
    () => [
      { id: "calendar", label: "Calendar View" },
      { id: "events", label: "Events & Campaigns", badge: events?.length || undefined },
    ],
    [events?.length]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        // TODO: Connect API [get_events]
        const data = await eventService.getEvents();
        if (isMounted) {
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("[useEventManagementScreen] loadEvents error:", error);
        if (isMounted) {
          setEvents([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as EventManagementTab);
  }, []);

  const handleSelectDate = useCallback((dateString: string) => {
    setSelectedDate(dateString);
  }, []);

  const handleSelectEvent = useCallback((event: EventItem) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseSelectedEvent = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleEditEvent = useCallback((event: EventItem) => {
    setSelectedEvent(null);
    setEditingEvent(event);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
  }, []);

  const handleSaveEvent = useCallback(
    async (savedEvent: EventItem) => {
      try {
        if (editingEvent) {
          // TODO: Connect API [update_event]
          const updated = await eventService.updateEvent(savedEvent.eventId, savedEvent);
          const finalItem = updated || savedEvent;
          setEvents((prev) =>
            prev ? prev.map((e) => (e.eventId === finalItem.eventId ? finalItem : e)) : [finalItem]
          );
        } else {
          // TODO: Connect API [create_event]
          const created = await eventService.createEvent(savedEvent);
          const finalItem = created || savedEvent;
          setEvents((prev) => (prev ? [finalItem, ...prev] : [finalItem]));
        }
      } catch (error) {
        console.error("[useEventManagementScreen] handleSaveEvent error:", error);
        setEvents((prev) =>
          prev
            ? prev.some((e) => e.eventId === savedEvent.eventId)
              ? prev.map((e) => (e.eventId === savedEvent.eventId ? savedEvent : e))
              : [savedEvent, ...prev]
            : [savedEvent]
        );
      } finally {
        setIsEditModalOpen(false);
        setEditingEvent(null);
      }
    },
    [editingEvent]
  );

  const handleRequestDelete = useCallback((event: EventItem) => {
    setSelectedEvent(null);
    setDeletingEvent(event);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeletingEvent(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deletingEvent) {
      try {
        // TODO: Connect API [delete_event]
        await eventService.deleteEvent(deletingEvent.eventId);
        setEvents((prev) => (prev ? prev.filter((e) => e.eventId !== deletingEvent.eventId) : []));
      } catch (error) {
        console.error("[useEventManagementScreen] handleConfirmDelete error:", error);
        setEvents((prev) => (prev ? prev.filter((e) => e.eventId !== deletingEvent.eventId) : []));
      }
    }
    setIsDeleteConfirmOpen(false);
    setDeletingEvent(null);
    setSelectedEvent(null);
  }, [deletingEvent]);

  const handleCreateEvent = useCallback(() => {
    setEditingEvent(null);
    setIsEditModalOpen(true);
  }, []);

  return {
    activeTab,
    eventTabs,
    events,
    isLoading,
    selectedDate,
    selectedEvent,
    editingEvent,
    isEditModalOpen,
    deletingEvent,
    isDeleteConfirmOpen,
    handleTabChange,
    handleSelectDate,
    handleSelectEvent,
    handleCloseSelectedEvent,
    handleEditEvent,
    handleCloseEditModal,
    handleSaveEvent,
    handleRequestDelete,
    handleCloseDeleteConfirm,
    handleConfirmDelete,
    handleCreateEvent,
  };
}
