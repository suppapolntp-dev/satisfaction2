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
};
