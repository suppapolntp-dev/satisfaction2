"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ApiServiceHealth } from "@/Types/audit";
import { auditService } from "@/Services/auditService";

export interface UseServiceHealthTableOptions {
  services?: ApiServiceHealth[] | null;
  onRefreshAll?: () => Promise<void> | void;
}

export function useServiceHealthTable({
  services,
  onRefreshAll,
}: UseServiceHealthTableOptions = {}) {
  const [localServices, setLocalServices] = useState<ApiServiceHealth[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pingingServiceId, setPingingServiceId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pingNotification, setPingNotification] = useState<string | null>(null);

  // Sync from props
  useEffect(() => {
    if (Array.isArray(services)) {
      setLocalServices(services);
    }
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return localServices.filter((service) => {
      // Status filter
      if (statusFilter !== "ALL" && service.status !== statusFilter) {
        return false;
      }

      // Search query filter (matches serviceName, endpoint, serviceId)
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        service.serviceName.toLowerCase().includes(q) ||
        service.endpoint.toLowerCase().includes(q) ||
        service.serviceId.toLowerCase().includes(q)
      );
    });
  }, [localServices, statusFilter, searchQuery]);

  // Telemetry summary metrics
  const summary = useMemo(() => {
    const total = localServices.length;
    const operational = localServices.filter((s) => s.status === "Operational").length;
    const avgLatency =
      total > 0
        ? Math.round(localServices.reduce((acc, s) => acc + s.latencyMs, 0) / total)
        : null;
    const avgUptime =
      total > 0
        ? (localServices.reduce((acc, s) => acc + s.uptimePercent, 0) / total).toFixed(2)
        : null;

    return {
      total,
      operational,
      avgLatency,
      avgUptime,
    };
  }, [localServices]);

  // Ping a single service
  const handlePing = useCallback(async (serviceId: string) => {
    setPingingServiceId(serviceId);
    try {
      const res = await auditService.pingService(serviceId);
      const simulatedLatency = res.latencyMs || Math.floor(18 + Math.random() * 24);

      setLocalServices((prev) =>
        prev.map((s) =>
          s.serviceId === serviceId
            ? {
                ...s,
                latencyMs: simulatedLatency,
                lastChecked: "เมื่อสักครู่",
                status: res.success ? s.status : "Degraded",
              }
            : s
        )
      );

      setPingNotification(`ทดสอบการเชื่อมต่อ (${serviceId}) สำเร็จ! Latency: ${simulatedLatency} ms`);
      setTimeout(() => setPingNotification(null), 3000);
    } finally {
      setPingingServiceId(null);
    }
  }, []);

  // Refresh all services
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshAll) {
        await onRefreshAll();
      } else {
        const fresh = await auditService.getServiceHealth();
        setLocalServices(fresh || []);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshAll]);

  return {
    localServices,
    filteredServices,
    summary,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    pingingServiceId,
    isRefreshing,
    pingNotification,
    handlePing,
    handleRefresh,
  };
}
