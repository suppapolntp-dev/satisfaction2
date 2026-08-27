export interface AuditDiffDetail {
  field: string;
  beforeValue: string;
  afterValue: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType: "CREATE" | "UPDATE" | "DELETE" | "SECURITY" | "EXPORT" | "CREATE_BRAND" | "CREATE_BRANCH" | "CREATE_USER" | "UPDATE_ROLE" | "DELETE_ENTITY" | "CONFIG_CHANGE";
  targetEntity: string;
  description: string;
  status: "SUCCESS" | "FAILED" | "WARNING" | "Success" | "Pending Review" | "Warning / Flagged";
  ipAddress: string;
  diffDetails?: AuditDiffDetail[];
}

export type ActivityAuditLog = AuditLogItem;

export interface ApiServiceHealth {
  serviceId: string;
  serviceName: string;
  endpoint: string;
  status: "Operational" | "Degraded" | "Outage" | "Maintenance";
  uptimePercent: number;
  latencyMs: number;
  lastChecked: string;
  errorRatePercent: number;
}

