import { apiClient } from "./apiClient";
import { AuditDiffDetail, AuditLogItem, ActivityAuditLog, ApiServiceHealth } from "@/Types/audit";

export type { AuditDiffDetail, AuditLogItem, ActivityAuditLog, ApiServiceHealth };

export const auditService = {
  async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const response = await apiClient.get<AuditLogItem[]>("/audit-logs");
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
    return [];
  },

  async getServiceHealth(): Promise<ApiServiceHealth[]> {
    try {
      const response = await apiClient.get<ApiServiceHealth[]>("/services/health");
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
    return [];
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
      console.log("[AuditService] Action logged:", newLog);
    }
  },
};
