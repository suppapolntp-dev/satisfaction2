export interface SystemNotificationItem {
  notificationId: string;
  notificationTitle: string;
  notificationType: "Alert" | "Feedback" | "System" | string;
  notificationTimeText: string;
  notificationDescription: string;
  isNotificationRead: boolean;
  targetBranchName: string;
  targetBranchCode: string;
  notificationPriority: "High" | "Medium" | "Low";
}

export type NotificationAlertItem = SystemNotificationItem;

