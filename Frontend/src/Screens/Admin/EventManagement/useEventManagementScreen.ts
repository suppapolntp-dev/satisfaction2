"use client";

import { useState, useCallback, useMemo } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";

export type EventManagementTab = "events" | "calendar";

export interface UseEventManagementScreenProps {
  initialTab?: EventManagementTab;
}

export function useEventManagementScreen({
  initialTab = "events",
}: UseEventManagementScreenProps = {}) {
  const [activeTab, setActiveTab] = useState<EventManagementTab>(initialTab);

  const eventTabs: HeaderTabItem[] = useMemo(
    () => [
      { id: "events", label: "Events & Campaigns" },
      { id: "calendar", label: "Calendar View" },
    ],
    []
  );

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as EventManagementTab);
  }, []);

  const handleCreateEvent = useCallback(() => {
    console.log("[useEventManagementScreen] handleCreateEvent triggered");
    // TODO: Connect API / Modal for creating an event
  }, []);

  return {
    activeTab,
    eventTabs,
    handleTabChange,
    handleCreateEvent,
  };
}
