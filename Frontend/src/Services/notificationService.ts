import { apiClient } from "./apiClient";
import { SystemNotificationItem } from "@/Types/notification";

export type NotificationAlertItem = SystemNotificationItem;
export type { SystemNotificationItem };

export const notificationService = {
  async getNotifications(): Promise<SystemNotificationItem[]> {
    try {
      const response = await apiClient.get<SystemNotificationItem[]>("/notifications");
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
    return [];
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await apiClient.put<boolean>(`/notifications/${notificationId}/read`, {});
      if (response.success) {
        return true;
      }
    } catch {}
    return true;
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await apiClient.put<boolean>("/notifications/read-all", {});
      if (response.success) {
        return true;
      }
    } catch {}
    return true;
  },
};
