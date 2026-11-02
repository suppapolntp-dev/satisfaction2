"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { EventItem } from "@/Types/event";
import { eventService } from "@/Services/eventService";
import { formatToYYYYMMDD } from "@/Components/Calendars/EventCalendar";

export type EventManagementTab = "calendar" | "events";

export interface UseEventManagementScreenProps {
  initialTab?: EventManagementTab;
}

// Helper สร้างข้อมูลจำลองสำหรับวันพรุ่งนี้ เพื่อให้ทดสอบและปรับแต่ง UI ได้ทันที
function createTomorrowSampleEvents(): EventItem[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatToYYYYMMDD(tomorrow);

  return [
    {
      eventId: "EVT-TOMORROW-001",
      eventName: "แคมเปญแจกไอศกรีมและของขวัญ",
      eventDate: tomorrowStr,
      startTime: "10:00",
      endTime: "16:00",
      brandScope: "The Coffee Club",
      brandId: null,
      eventLocation: "ทุกสาขากรุงเทพฯ และปริมณฑล",
      eventCategory: "CAMPAIGN",
      eventStatus: "Upcoming",
      description: "กิจกรรมประเมินความพึงพอใจและแจกคูปองพิเศษ",
      kioskThemeOverride: "summer_theme",
      targetBranchIds: [],
      targetBranchNames: ["Central World", "Siam Paragon"],
    },
    {
      eventId: "EVT-TOMORROW-002",
      eventName: "ตรวจมาตรฐานความสะอาดและสุขอนามัย Q1",
      eventDate: tomorrowStr,
      startTime: "14:00",
      endTime: "17:30",
      brandScope: "Swensen's",
      brandId: null,
      eventLocation: "สาขาโซนภาคกลางและนนทบุรี",
      eventCategory: "AUDIT",
      eventStatus: "Upcoming",
      description: "ตรวจสอบอุปกรณ์ Kiosk และสุขอนามัยประจำไตรมาส",
      kioskThemeOverride: null,
      targetBranchIds: [],
      targetBranchNames: ["Mega Bangna"],
    },
    {
      eventId: "EVT-COMPLETED-003",
      eventName: "อัปเดต Firmware ระบบตู้ Kiosk ประจำสาขา",
      eventDate: tomorrowStr,
      startTime: "08:00",
      endTime: "10:00",
      brandScope: "Sizzler",
      brandId: null,
      eventLocation: "Central World ชั้น 3",
      eventCategory: "FIRMWARE",
      eventStatus: "Completed",
      description: "อัปเกรดระบบสัมผัสและปรับปรุงเซนเซอร์วัดความพึงพอใจ",
      kioskThemeOverride: null,
      targetBranchIds: [],
      targetBranchNames: ["Central World"],
    },
  ];
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
        const tomorrowSamples = createTomorrowSampleEvents();

        if (isMounted) {
          if (data && data.length > 0) {
            // รวมอีเวนต์จาก API กับตัวแปรจำลองวันพรุ่งนี้
            setEvents([...data, ...tomorrowSamples]);
          } else {
            setEvents(tomorrowSamples);
          }
        }
      } catch (error) {
        console.error("[useEventManagementScreen] loadEvents error:", error);
        if (isMounted) {
          setEvents(createTomorrowSampleEvents());
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

  const handleCloseSelectedEvent = useCallback(() => {
    setSelectedEvent(null);
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
    handleCloseSelectedEvent,
    handleCreateEvent,
  };
}
