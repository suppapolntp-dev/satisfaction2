"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { SystemNotificationItem } from "@/Types/notification";
import { notificationService } from "@/Services/notificationService";
import { useApiMode } from "@/Context/ApiModeContext";

export type NotificationTabType = "all" | "unread" | "high_priority";

export interface UseNotificationTriageScreenOptions {
  initialTab?: NotificationTabType;
}

export function useNotificationTriageScreen({
  initialTab = "all",
}: UseNotificationTriageScreenOptions = {}) {
  const { isApiEnabled } = useApiMode();
  const [activeTab, setActiveTab] = useState<NotificationTabType>(initialTab);
  const [notificationsList, setNotificationsList] = useState<SystemNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchNotificationQuery, setSearchNotificationQuery] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All Types");
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  // Load notifications from API / Service
  const loadNotificationsData = useCallback(async () => {
    try {
      // TODO: Connect API [get_notifications]
      const data = await notificationService.getNotifications();
      const safeData = Array.isArray(data) ? data : [];
      setNotificationsList(safeData);

      // Auto-select first item if current selection is invalid
      setSelectedNotificationId((prevSelectedId) => {
        if (prevSelectedId && safeData.some((item) => item.notificationId === prevSelectedId)) {
          return prevSelectedId;
        }
        return safeData.length > 0 ? safeData[0].notificationId : null;
      });
    } catch (error) {
      console.error("[useNotificationTriageScreen] loadNotificationsData error:", error);
      setNotificationsList([]);
      setSelectedNotificationId(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoading(true);
      await loadNotificationsData();
      if (isMounted) {
        setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [isApiEnabled, loadNotificationsData]);

  // Tab definitions with dynamic badge counts for PageHeader
  const unreadCount = useMemo(() => {
    return notificationsList.filter((item) => !item.isNotificationRead).length;
  }, [notificationsList]);

  const highPriorityCount = useMemo(() => {
    return notificationsList.filter((item) => item.notificationPriority === "High").length;
  }, [notificationsList]);

  const notificationTabs: HeaderTabItem[] = useMemo(
    () => [
      {
        id: "all",
        label: "การแจ้งเตือนทั้งหมด (All Alerts)",
        badge: notificationsList.length,
      },
      {
        id: "unread",
        label: "ยังไม่ได้อ่าน (Unread Queue)",
        badge: unreadCount,
      },
      {
        id: "high_priority",
        label: "เร่งด่วนพิเศษ (High Priority)",
        badge: highPriorityCount,
      },
    ],
    [notificationsList.length, unreadCount, highPriorityCount]
  );

  // Filtered notifications list based on Search, Type, and Active Tab
  const filteredNotificationsList = useMemo(() => {
    return notificationsList.filter((notificationItem) => {
      // Tab filter
      if (activeTab === "unread" && notificationItem.isNotificationRead) {
        return false;
      }
      if (activeTab === "high_priority" && notificationItem.notificationPriority !== "High") {
        return false;
      }

      // Type filter
      if (selectedTypeFilter !== "All Types" && notificationItem.notificationType !== selectedTypeFilter) {
        return false;
      }

      // Search query
      if (searchNotificationQuery.trim()) {
        const query = searchNotificationQuery.toLowerCase();
        const matchesTitle = notificationItem.notificationTitle.toLowerCase().includes(query);
        const matchesBranch = notificationItem.targetBranchName.toLowerCase().includes(query);
        const matchesDesc = notificationItem.notificationDescription.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBranch && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [notificationsList, activeTab, selectedTypeFilter, searchNotificationQuery]);

  // Currently focused notification item
  const activeNotification = useMemo(() => {
    return (
      notificationsList.find(
        (notificationItem) => notificationItem.notificationId === selectedNotificationId
      ) ?? null
    );
  }, [notificationsList, selectedNotificationId]);

  // Actions & Handlers
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as NotificationTabType);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadNotificationsData();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadNotificationsData]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotificationsList((prevList) =>
        prevList.map((item) => ({ ...item, isNotificationRead: true }))
      );
    } catch (error) {
      console.error("[useNotificationTriageScreen] handleMarkAllAsRead error:", error);
    }
  }, []);

  const handleMarkCurrentAsRead = useCallback(async () => {
    if (!selectedNotificationId) return;
    try {
      await notificationService.markAsRead(selectedNotificationId);
      setNotificationsList((prevList) =>
        prevList.map((item) =>
          item.notificationId === selectedNotificationId
            ? { ...item, isNotificationRead: true }
            : item
        )
      );
    } catch (error) {
      console.error("[useNotificationTriageScreen] handleMarkCurrentAsRead error:", error);
    }
  }, [selectedNotificationId]);

  const handleDismissNotification = useCallback((notificationId: string) => {
    setNotificationsList((prev) => prev.filter((item) => item.notificationId !== notificationId));
    setSelectedNotificationId((prevSelected) =>
      prevSelected === notificationId ? null : prevSelected
    );
  }, []);

  const handleSelectNotification = useCallback((notificationId: string) => {
    setSelectedNotificationId(notificationId);
  }, []);

  return {
    activeTab,
    notificationTabs,
    notificationsList,
    filteredNotificationsList,
    activeNotification,
    selectedNotificationId,
    unreadCount,
    highPriorityCount,
    isLoading,
    isRefreshing,
    searchNotificationQuery,
    selectedTypeFilter,
    setSearchNotificationQuery,
    setSelectedTypeFilter,
    handleTabChange,
    handleRefresh,
    handleMarkAllAsRead,
    handleMarkCurrentAsRead,
    handleDismissNotification,
    handleSelectNotification,
  };
}
