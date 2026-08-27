import { apiClient } from "./apiClient";
import { ScheduledEventItem } from "@/Types/event";

export type { ScheduledEventItem };

export const eventService = {
  async getEvents(): Promise<ScheduledEventItem[]> {
    try {
      const response = await apiClient.get<ScheduledEventItem[]>("/events");
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
    return [];
  },

  async getEventById(id: string): Promise<ScheduledEventItem | null> {
    try {
      const response = await apiClient.get<ScheduledEventItem>(`/events/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}
    return null;
  },

  async createEvent(eventData: Omit<ScheduledEventItem, "eventId">): Promise<ScheduledEventItem> {
    const newEvent: ScheduledEventItem = {
      ...eventData,
      eventId: `EVT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    };

    try {
      const response = await apiClient.post<ScheduledEventItem>("/events", newEvent);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return newEvent;
  },

  async updateEvent(eventId: string, eventData: Partial<ScheduledEventItem>): Promise<ScheduledEventItem> {
    try {
      const response = await apiClient.put<ScheduledEventItem>(`/events/${eventId}`, eventData);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return { ...eventData, eventId } as ScheduledEventItem;
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/events/${eventId}`);
      if (response.success) {
        return true;
      }
    } catch {}

    return true;
  },
};
