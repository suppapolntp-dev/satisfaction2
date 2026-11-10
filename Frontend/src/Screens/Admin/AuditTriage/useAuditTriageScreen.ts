"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";
import { ActivityAuditLog, ApiServiceHealth } from "@/Types/audit";
import { auditService } from "@/Services/auditService";
import { useApiMode } from "@/Context/ApiModeContext";

export type AuditTabType = "activity_logs" | "api_health";

export interface UseAuditTriageScreenOptions {
  initialTab?: AuditTabType;
}

export function useAuditTriageScreen({
  initialTab = "activity_logs",
}: UseAuditTriageScreenOptions = {}) {
  const { isApiEnabled } = useApiMode();
  const [activeTab, setActiveTab] = useState<AuditTabType>(initialTab);
  const [activityLogs, setActivityLogs] = useState<ActivityAuditLog[] | null>(null);
  const [apiServices, setApiServices] = useState<ApiServiceHealth[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Tab definitions for PageHeader
  const auditTabs: HeaderTabItem[] = useMemo(
    () => [
      {
        id: "activity_logs",
        label: "ประวัติการตรวจสอบ (Action Logs)",
        badge: activityLogs?.length,
      },
      {
        id: "api_health",
        label: "สถานะระบบ & API Health",
        badge: apiServices?.length,
      },
    ],
    [activityLogs?.length, apiServices?.length]
  );

  const loadAuditData = useCallback(async () => {
    try {
      // TODO: Connect API [get_audit_logs, get_service_health]
      const [logs, services] = await Promise.all([
        auditService.getAuditLogs(),
        auditService.getServiceHealth(),
      ]);
      setActivityLogs(Array.isArray(logs) ? logs : []);
      setApiServices(Array.isArray(services) ? services : []);
    } catch (error) {
      console.error("[useAuditTriageScreen] loadAuditData error:", error);
      setActivityLogs([]);
      setApiServices([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoading(true);
      await loadAuditData();
      if (isMounted) {
        setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [isApiEnabled, loadAuditData]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as AuditTabType);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadAuditData();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadAuditData]);

  const handleExportAuditLogs = useCallback(() => {
    // TODO: Connect API [export_audit_logs]
    console.log("[useAuditTriageScreen] Exporting audit logs...");
  }, []);

  const handleFilterMetrics = useCallback((filterType: string) => {
    if (filterType === "health") {
      setActiveTab("api_health");
    } else {
      setActiveTab("activity_logs");
    }
  }, []);

  return {
    activeTab,
    auditTabs,
    activityLogs,
    apiServices,
    isLoading,
    isRefreshing,
    handleTabChange,
    handleRefresh,
    handleExportAuditLogs,
    handleFilterMetrics,
  };
}
