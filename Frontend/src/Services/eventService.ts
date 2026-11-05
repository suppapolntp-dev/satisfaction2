import { apiClient } from "./apiClient";
import { EventItem } from "@/Types/event";

export interface GetEventsParams {
  brand?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const eventService = {
  // TODO: Connect API [get_events]
  async getEvents(params?: GetEventsParams): Promise<EventItem[]> {
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
      console.error("[eventService.getEvents] error:", error);
    }
    return [];
  },

  // TODO: Connect API [create_event]
  async createEvent(event: Partial<EventItem>): Promise<EventItem | null> {
    try {
      const response = await apiClient.post<EventItem>("/events", event);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("[eventService.createEvent] error:", error);
    }
    return null;
  },

  // TODO: Connect API [update_event]
  async updateEvent(eventId: string, event: Partial<EventItem>): Promise<EventItem | null> {
    try {
      const response = await apiClient.put<EventItem>(`/events/${eventId}`, event);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("[eventService.updateEvent] error:", error);
    }
    return null;
  },

  // TODO: Connect API [delete_event]
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/events/${eventId}`);
      return Boolean(response.success);
    } catch (error) {
      console.error("[eventService.deleteEvent] error:", error);
    }
    return false;
  },
};
