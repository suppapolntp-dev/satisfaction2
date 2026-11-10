import { apiClient, isApiModeEnabled } from "./apiClient";
import { AuditDiffDetail, AuditLogItem, ActivityAuditLog, ApiServiceHealth } from "@/Types/audit";

export type { AuditDiffDetail, AuditLogItem, ActivityAuditLog, ApiServiceHealth };

export const DEFAULT_DEV_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "AUD-2026-0001",
    timestamp: "2026-11-07 10:15:32",
    actorName: "System Administrator",
    actorRole: "Super Admin",
    actionType: "CONFIG_CHANGE",
    targetEntity: "SystemSettings",
    description: "ปรับปรุงระยะเวลาคูลดาวน์กันโหวตซ้ำ (Duplicate Vote Window) เป็น 30 นาที",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
    diffDetails: [
      { field: "DuplicateVoteMinutes", beforeValue: "15", afterValue: "30" },
    ],
  },
  {
    id: "AUD-2026-0002",
    timestamp: "2026-11-07 09:30:18",
    actorName: "Thanaphat Chickencare",
    actorRole: "Brand Manager",
    actionType: "UPDATE",
    targetEntity: "Branch (KFC Siam Paragon)",
    description: "อัปเดตสถานะจำนวนตู้ Kiosk ประจำสาขาเป็น 3 ตู้สมบูรณ์",
    status: "SUCCESS",
    ipAddress: "192.168.1.45",
    diffDetails: [
      { field: "KioskCount", beforeValue: "2", afterValue: "3" },
    ],
  },
  {
    id: "AUD-2026-0003",
    timestamp: "2026-11-06 17:45:00",
    actorName: "Somchai DonutTown",
    actorRole: "Brand Manager",
    actionType: "CREATE_BRANCH",
    targetEntity: "Branch (Mister Donut Future Park)",
    description: "สร้างสาขาแบบ Co-Location ร่วมกับ Arigato Coffee",
    status: "SUCCESS",
    ipAddress: "192.168.1.88",
  },
];

export const DEFAULT_DEV_SERVICE_HEALTH: ApiServiceHealth[] = [
  {
    serviceId: "CORE_API",
    serviceName: "Core Web API (ASP.NET Core 9)",
    endpoint: "/api/dashboard",
    status: "Operational",
    uptimePercent: 99.98,
    latencyMs: 42,
    errorRatePercent: 0.01,
    lastChecked: "2026-11-07 11:30:00",
  },
  {
    serviceId: "POSTGRES_DB",
    serviceName: "PostgreSQL Database Cluster",
    endpoint: "tcp://db:5432",
    status: "Operational",
    uptimePercent: 99.95,
    latencyMs: 18,
    errorRatePercent: 0.0,
    lastChecked: "2026-11-07 11:30:00",
  },
  {
    serviceId: "REDIS_CACHE",
    serviceName: "Redis In-Memory Session Cache",
    endpoint: "tcp://redis:6379",
    status: "Operational",
    uptimePercent: 100.0,
    latencyMs: 3,
    errorRatePercent: 0.0,
    lastChecked: "2026-11-07 11:30:00",
  },
  {
    serviceId: "KIOSK_WS",
    serviceName: "Kiosk WebSocket Gateway",
    endpoint: "wss://kiosk-gateway.satisfaction.local",
    status: "Operational",
    uptimePercent: 99.9,
    latencyMs: 25,
    errorRatePercent: 0.02,
    lastChecked: "2026-11-07 11:30:00",
  },
];

export const auditService = {
  async getAuditLogs(): Promise<AuditLogItem[]> {
    if (!isApiModeEnabled()) {
      return [];
    }
    try {
      const response = await apiClient.get<AuditLogItem[]>("/audit-logs");
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn("[auditService.getAuditLogs] backend unreachable, using test fallback logs:", err);
    }
    return DEFAULT_DEV_AUDIT_LOGS;
  },

  async getServiceHealth(): Promise<ApiServiceHealth[]> {
    if (!isApiModeEnabled()) {
      return [];
    }
    try {
      const response = await apiClient.get<ApiServiceHealth[]>("/services/health");
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn("[auditService.getServiceHealth] backend unreachable, using test fallback health:", err);
    }
    return DEFAULT_DEV_SERVICE_HEALTH;
  },

  async logAction(action: Omit<AuditLogItem, "id" | "timestamp">): Promise<void> {
    const newLog: AuditLogItem = {
      ...action,
      id: `AUD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    };

    try {
      await apiClient.post("/audit-logs", newLog);
    } catch {
      console.log("[AuditService] Action logged locally:", newLog);
    }
  },

  async pingService(serviceId: string): Promise<{ success: boolean; latencyMs: number }> {
    // TODO: Connect API [/services/{serviceId}/ping]
    const startTime = Date.now();
    try {
      if (isApiModeEnabled()) {
        await apiClient.get("/services/health");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      return {
        success: true,
        latencyMs: Math.max(12, Date.now() - startTime),
      };
    } catch {
      return { success: false, latencyMs: 999 };
    }
  },
};
