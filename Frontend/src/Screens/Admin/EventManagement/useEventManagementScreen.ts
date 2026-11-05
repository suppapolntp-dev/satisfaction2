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

  const inTwoDays = new Date(today);
  inTwoDays.setDate(today.getDate() + 2);
  const inTwoDaysStr = formatToYYYYMMDD(inTwoDays);

  const inThreeDays = new Date(today);
  inThreeDays.setDate(today.getDate() + 3);
  const inThreeDaysStr = formatToYYYYMMDD(inThreeDays);

  const inFiveDays = new Date(today);
  inFiveDays.setDate(today.getDate() + 5);
  const inFiveDaysStr = formatToYYYYMMDD(inFiveDays);

  return [
    // ─── 1. Single-day: Compact Variant (พาสเทลแถบเดี่ยว) ───
    {
      eventId: "EVT-TODAY-001",
      eventName: "อัปเดต Firmware ระบบตู้ Kiosk ประจำสาขา",
      eventDate: todayStr,
      eventEndDate: null,
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
      progressPercent: 100,
      commentCount: 4,
      attachmentCount: 1,
      assignees: [{ name: "Krit P." }],
    },
    // ─── 2. Multi-day Spanning (วันนี้ - อีก 2 วัน): Detailed White Card ───
    {
      eventId: "EVT-TODAY-002",
      eventName: "แคมเปญวันเด็ก แจกโดนัทและของขวัญ",
      eventDate: todayStr,
      eventEndDate: inTwoDaysStr,
      startTime: "10:00",
      endTime: "16:00",
      brandScope: "Mister Donut",
      brandId: null,
      brandLogoUrl: "/images/brands/mister-donut.svg",
      eventLocation: "ทุกสาขากรุงเทพฯ และปริมณฑล",
      eventCategory: "CAMPAIGN",
      eventStatus: "Active",
      description: "กิจกรรมประเมินความพึงพอใจและแจกคูปองโดนัทฟรี",
      kioskThemeOverride: "summer_theme",
      targetBranchIds: [],
      targetBranchNames: ["Central World", "Siam Paragon"],
      assignees: [
        { name: "Anan K." },
        { name: "Somchai T." },
        { name: "Ploy M." },
      ],
    },
    // ─── 3. Single-day Compact ───
    {
      eventId: "EVT-TODAY-003",
      eventName: "ตรวจมาตรฐานความสะอาดและสุขอนามัย Q1",
      eventDate: todayStr,
      eventEndDate: null,
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
      assignees: [{ name: "Ploy M." }],
    },
    // ─── 4. Multi-day Spanning (อีก 3 วัน - อีก 5 วัน): Detailed White Card ───
    {
      eventId: "EVT-FUTURE-004",
      eventName: "แคมเปญแลกรับเครื่องดื่มต้อนรับสมาชิกใหม่",
      eventDate: inThreeDaysStr,
      eventEndDate: inFiveDaysStr,
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
      progressPercent: 35,
      commentCount: 16,
      attachmentCount: 2,
      assignees: [
        { name: "Beam S." },
        { name: "Nut R." },
      ],
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

  const handleEditEvent = useCallback((event: EventItem) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
  }, []);

  const handleSaveEvent = useCallback((savedEvent: EventItem) => {
    setEvents((prev) => {
      if (!prev) return [savedEvent];
      const exists = prev.some((e) => e.eventId === savedEvent.eventId);
      if (exists) {
        return prev.map((e) => (e.eventId === savedEvent.eventId ? savedEvent : e));
      }
      return [savedEvent, ...prev];
    });
    setIsEditModalOpen(false);
    setEditingEvent(null);
  }, []);

  const handleRequestDelete = useCallback((event: EventItem) => {
    setDeletingEvent(event);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeletingEvent(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deletingEvent) {
      setEvents((prev) => (prev ? prev.filter((e) => e.eventId !== deletingEvent.eventId) : []));
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
