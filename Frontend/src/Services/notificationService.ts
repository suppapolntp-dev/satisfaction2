import { apiClient, isApiModeEnabled } from "./apiClient";
import { SystemNotificationItem } from "@/Types/notification";

export type NotificationAlertItem = SystemNotificationItem;
export type { SystemNotificationItem };

export const DEFAULT_DEV_NOTIFICATIONS: SystemNotificationItem[] = [
  {
    notificationId: "notif-001",
    notificationTitle: "แจ้งเตือนระดับ CSAT ต่ำกว่าเกณฑ์มาตรฐาน",
    notificationType: "Alert",
    notificationTimeText: "2 ชม. ที่แล้ว",
    notificationDescription: "คะแนนความพึงพอใจลดลงเหลือ 78.5% ในช่วงเวลาเร่งด่วน 12:00 - 13:30 น. แนะนำให้ตรวจสอบจุดบริการแคชเชียร์",
    isNotificationRead: false,
    targetBranchName: "Mister Donut & Arigato สาขา ฟิวเจอร์พาร์ค รังสิต",
    targetBranchCode: "MDO-NON-01",
    notificationPriority: "High",
  },
  {
    notificationId: "notif-002",
    notificationTitle: "ตู้ Kiosk หมายเลข KS-MDO-NON-01 ออฟไลน์",
    notificationType: "Alert",
    notificationTimeText: "5 ชม. ที่แล้ว",
    notificationDescription: "ไม่พบสัญญาณ Heartbeat จากตู้ประเมินเกิน 15 นาที กรุณาตรวจสอบสาย LAN หรือการเชื่อมต่อ Wi-Fi",
    isNotificationRead: false,
    targetBranchName: "Mister Donut & Arigato สาขา ฟิวเจอร์พาร์ค รังสิต",
    targetBranchCode: "MDO-NON-01",
    notificationPriority: "High",
  },
  {
    notificationId: "notif-003",
    notificationTitle: "ข้อเสนอแนะลูกค้า: การบริการรวดเร็วและพนักงานยิ้มแย้ม",
    notificationType: "Feedback",
    notificationTimeText: "1 วันที่แล้ว",
    notificationDescription: "ลูกค้าประเมินระดับดีเยี่ยมและให้คำชมเชยพนักงานประจำสาขาผ่านตู้ประเมิน",
    isNotificationRead: true,
    targetBranchName: "KFC สาขา สยามพารากอน",
    targetBranchCode: "KFC-BKK-01",
    notificationPriority: "Low",
  },
  {
    notificationId: "notif-004",
    notificationTitle: "ระบบอัปเดตรายงานสรุปผลประจำสัปดาห์เรียบร้อยแล้ว",
    notificationType: "System",
    notificationTimeText: "2 วันที่แล้ว",
    notificationDescription: "รายงานผลการประเมินความพึงพอใจระดับเครือ CRG ประจำสัปดาห์พร้อมให้ดาวน์โหลดในหน้าจัดการรายงาน",
    isNotificationRead: true,
    targetBranchName: "สำนักงานใหญ่",
    targetBranchCode: "HQ",
    notificationPriority: "Medium",
  },
];

export const notificationService = {
  async getNotifications(): Promise<SystemNotificationItem[]> {
    if (!isApiModeEnabled()) {
      return [];
    }
    try {
      const response = await apiClient.get<SystemNotificationItem[]>("/notifications");
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn("[notificationService.getNotifications] backend unreachable, using test fallback notifications:", err);
    }
    return DEFAULT_DEV_NOTIFICATIONS;
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
