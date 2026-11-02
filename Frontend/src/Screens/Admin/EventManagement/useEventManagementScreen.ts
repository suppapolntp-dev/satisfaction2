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

// Helper สร้างข้อมูลจำลอง (รองรับหลายแบรนด์จัดกิจกรรมในวันเดียวกันได้ โดยแยกคอลัมน์/แถวประจำแบรนด์)
function createSampleEvents(): EventItem[] {
  const today = new Date();
  const todayStr = formatToYYYYMMDD(today);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatToYYYYMMDD(tomorrow);

  return [
    // ─── วันนี้: 3 แบรนด์จัดกิจกรรมพร้อมกัน (แยกตามแถว/คอลัมน์ของแบรนด์) ───
    {
      eventId: "EVT-TODAY-001",
      eventName: "อัปเดต Firmware ระบบตู้ Kiosk ประจำสาขา",
      eventDate: todayStr,
      startTime: "08:30",
      endTime: "11:30",
      brandScope: "The Coffee Club",
      brandId: null,
      brandLogoUrl: "/images/brands/mister-donut.svg",
      eventLocation: "Central World ชั้น 3",
      eventCategory: "FIRMWARE",
      eventStatus: "Completed",
      description: "อัปเกรดระบบสัมผัสและปรับปรุงเซนเซอร์วัดความพึงพอใจ",
      kioskThemeOverride: null,
      targetBranchIds: [],
      targetBranchNames: ["Central World"],
    },
    {
      eventId: "EVT-TODAY-002",
      eventName: "แคมเปญวันเด็ก แจกโดนัทและของขวัญ",
      eventDate: todayStr,
      startTime: "10:00",
      endTime: "16:00",
      brandScope: "Mister Donut",
      brandId: null,
      brandLogoUrl: "/images/brands/mister-donut.svg",
      eventLocation: "ทุกสาขากรุงเทพฯ และปริมณฑล",
      eventCategory: "CAMPAIGN",
      eventStatus: "Upcoming",
      description: "กิจกรรมประเมินความพึงพอใจและแจกคูปองโดนัทฟรี",
      kioskThemeOverride: "summer_theme",
      targetBranchIds: [],
      targetBranchNames: ["Central World", "Siam Paragon"],
    },
    {
      eventId: "EVT-TODAY-003",
      eventName: "ตรวจมาตรฐานความสะอาดและสุขอนามัย Q1",
      eventDate: todayStr,
      startTime: "13:00",
      endTime: "17:00",
      brandScope: "Swensen's",
      brandId: null,
      brandLogoUrl: "/images/brands/mister-donut.svg",
      eventLocation: "สาขาโซนภาคกลางและนนทบุรี",
      eventCategory: "AUDIT",
      eventStatus: "Upcoming",
      description: "ตรวจสอบอุปกรณ์ Kiosk และสุขอนามัยประจำไตรมาส",
      kioskThemeOverride: null,
      targetBranchIds: [],
      targetBranchNames: ["Mega Bangna"],
    },
    // ─── วันพรุ่งนี้ ───
    {
      eventId: "EVT-TOMORROW-004",
      eventName: "แคมเปญแลกรับเครื่องดื่มต้อนรับสมาชิกใหม่",
      eventDate: tomorrowStr,
      startTime: "09:00",
      endTime: "15:00",
      brandScope: "The Coffee Club",
      brandId: null,
      brandLogoUrl: "/images/brands/mister-donut.svg",
      eventLocation: "Siam Paragon ชั้น G",
      eventCategory: "CAMPAIGN",
      eventStatus: "Upcoming",
      description: "ประเมินระดับความพึงพอใจและรับกาแฟฟรี 1 แก้ว",
      kioskThemeOverride: null,
      targetBranchIds: [],
      targetBranchNames: ["Siam Paragon"],
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
        const samples = createSampleEvents();

        if (isMounted) {
          if (data && data.length > 0) {
            setEvents([...data, ...samples]);
          } else {
            setEvents(samples);
          }
        }
      } catch (error) {
        console.error("[useEventManagementScreen] loadEvents error:", error);
        if (isMounted) {
          setEvents(createSampleEvents());
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
