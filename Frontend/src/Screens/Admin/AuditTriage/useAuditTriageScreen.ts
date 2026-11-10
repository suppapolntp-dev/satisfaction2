"use client";

import { useState, useCallback, useMemo } from "react";
import { HeaderTabItem } from "@/Components/Headers/PageHeader";

export type AuditTabType = "activity_logs" | "api_health";

export interface UseAuditTriageScreenOptions {
  initialTab?: AuditTabType;
}

export function useAuditTriageScreen({
  initialTab = "activity_logs",
}: UseAuditTriageScreenOptions = {}) {
  const [activeTab, setActiveTab] = useState<AuditTabType>(initialTab);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab definitions for PageHeader
  const auditTabs: HeaderTabItem[] = useMemo(
    () => [
      {
        id: "activity_logs",
        label: "ประวัติการตรวจสอบ (Action Logs)",
      },
      {
        id: "api_health",
        label: "สถานะระบบ & API Health",
      },
    ],
    []
  );

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as AuditTabType);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // TODO: Connect API [refresh_audit_telemetry]
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleExportAuditLogs = useCallback(() => {
    // TODO: Connect API [export_audit_logs]
    console.log("[useAuditTriageScreen] Exporting audit logs...");
  }, []);

  return {
    activeTab,
    auditTabs,
    isRefreshing,
    handleTabChange,
    handleRefresh,
    handleExportAuditLogs,
  };
}
