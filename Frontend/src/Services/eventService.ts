import { apiClient, isApiModeEnabled } from "./apiClient";
import { EventItem } from "@/Types/event";

export interface GetEventsParams {
  brand?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const DEFAULT_DEV_EVENTS: EventItem[] = [
  {
    eventId: "EVT-2026-0001",
    eventName: "แคมเปญวันเด็ก แจกไอศกรีมและของขวัญ",
    eventDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "18:00",
    brandScope: "KFC, Mister Donut",
    eventLocation: "ทุกสาขากรุงเทพฯ และปริมณฑล",
    eventCategory: "CAMPAIGN",
    eventStatus: "Upcoming",
    description: "จัดกิจกรรมวันเด็ก มอบชุดของขวัญและไอศกรีมฟรีสำหรับน้องๆ ที่มาใช้บริการพร้อมครอบครัว",
    kioskThemeOverride: "KIDS_DAY",
    targetBranchNames: ["Siam Paragon", "Central World", "Future Park Rangsit"],
  },
  {
    eventId: "EVT-2026-0002",
    eventName: "ตรวจมาตรฐานความสะอาดและสุขอนามัย Q1",
    eventDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "16:00",
    brandScope: "ทุกแบรนด์",
    eventLocation: "สาขาโซนภาคกลางและนนทบุรี",
    eventCategory: "AUDIT",
    eventStatus: "Upcoming",
    description: "ทีม QA และ Auditor เข้าตรวจเช็กสุขอนามัย อุปกรณ์ และระบบประเมินความพึงพอใจ",
    kioskThemeOverride: null,
    targetBranchNames: ["Future Park Rangsit", "Mega Bangna"],
  },
  {
    eventId: "EVT-2026-0003",
    eventName: "อัปเดต Firmware ตู้ Kiosk ประจำสาขาเซ็นทรัลเวิลด์",
    eventDate: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    startTime: "22:00",
    endTime: "23:30",
    brandScope: "Mister Donut, Ootoya",
    eventLocation: "Central World ชั้น 3",
    eventCategory: "FIRMWARE",
    eventStatus: "Completed",
    description: "อัปเกรดระบบปฏิบัติการตู้ Kiosk เป็นเวอร์ชัน v2.4.1 พร้อมปรับปรุงการตอบสนองระบบสัมผัส",
    kioskThemeOverride: null,
    targetBranchNames: ["Central World"],
  },
];

export const eventService = {
  // TODO: Connect API [get_events]
  async getEvents(params?: GetEventsParams): Promise<EventItem[]> {
    if (!isApiModeEnabled()) {
      return [];
    }
    try {
      let url = "/events";
      if (params) {
        const searchParams = new URLSearchParams();
        if (params.brand) searchParams.set("brand", params.brand);
        if (params.category) searchParams.set("category", params.category);
        if (params.status) searchParams.set("status", params.status);
        if (params.startDate) searchParams.set("startDate", params.startDate);
        if (params.endDate) searchParams.set("endDate", params.endDate);
        const query = searchParams.toString();
        if (query) url += `?${query}`;
      }
      const response = await apiClient.get<EventItem[]>(url);
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
      console.warn("[eventService.getEvents] backend unreachable, using test seed events:", error);
    }
    return DEFAULT_DEV_EVENTS;
  },

  // TODO: Connect API [create_event]
  async createEvent(event: Partial<EventItem>): Promise<EventItem | null> {
    try {
      const response = await apiClient.post<EventItem>("/events", event);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn("[eventService.createEvent] backend unreachable, fallback to local create:", error);
    }

    const fallbackEvent: EventItem = {
      eventId: event.eventId || `EVT-${Date.now().toString().slice(-4)}`,
      eventName: event.eventName || "New Campaign",
      eventDate: event.eventDate || new Date().toISOString().split("T")[0],
      startTime: event.startTime || "09:00",
      endTime: event.endTime || "18:00",
      brandScope: event.brandScope || "ทุกแบรนด์",
      eventLocation: event.eventLocation || "สาขาในเครือ",
      eventCategory: event.eventCategory || "CAMPAIGN",
      eventStatus: event.eventStatus || "Upcoming",
      description: event.description || "",
      targetBranchNames: event.targetBranchNames || [],
    };
    return fallbackEvent;
  },

  // TODO: Connect API [update_event]
  async updateEvent(eventId: string, event: Partial<EventItem>): Promise<EventItem | null> {
    try {
      const response = await apiClient.put<EventItem>(`/events/${eventId}`, event);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn("[eventService.updateEvent] backend unreachable, fallback to local update:", error);
    }
    return { ...event, eventId } as EventItem;
  },

  // TODO: Connect API [delete_event]
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/events/${eventId}`);
      if (response.success) return true;
    } catch (error) {
      console.warn("[eventService.deleteEvent] backend call failed:", error);
    }
    return true; // optimistic
  },
};
