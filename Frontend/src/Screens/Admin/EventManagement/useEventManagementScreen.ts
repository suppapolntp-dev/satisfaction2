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

  const eventTabs: HeaderTabItem[] = useMemo(
    () => [
      { id: "calendar", label: "Calendar View" },
      { id: "events", label: "Events & Campaigns" },
    ],
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        const data = await eventService.getEvents();
        if (isMounted) {
          setEvents(data);
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
    console.log("[useEventManagementScreen] Date selected:", dateString);
    setSelectedDate(dateString);
  }, []);

  const handleSelectEvent = useCallback((event: EventItem) => {
    console.log("[useEventManagementScreen] Event selected:", event);
    setSelectedEvent(event);
  }, []);

  const handleCreateEvent = useCallback(() => {
    console.log("[useEventManagementScreen] handleCreateEvent triggered");
    // TODO: Connect API / Modal for creating an event
  }, []);

  return {
    activeTab,
    eventTabs,
    events,
    isLoading,
    selectedDate,
    selectedEvent,
    handleTabChange,
    handleSelectDate,
    handleSelectEvent,
    handleCreateEvent,
  };
}
