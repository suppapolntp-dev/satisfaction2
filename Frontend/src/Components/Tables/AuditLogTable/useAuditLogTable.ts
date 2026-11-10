"use client";

import { useState, useMemo, useCallback } from "react";
import { ActivityAuditLog } from "@/Types/audit";

export interface UseAuditLogTableOptions {
  logs?: ActivityAuditLog[] | null;
  onVerifyLog?: (logId: string) => void;
}

export function useAuditLogTable({
  logs,
  onVerifyLog,
}: UseAuditLogTableOptions = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique action types for filter dropdown
  const availableActionTypes = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return [];
    const types = new Set<string>();
    logs.forEach((log) => {
      if (log.actionType) types.add(log.actionType);
    });
    return Array.from(types);
  }, [logs]);

  // Filter logs based on search query and action filter
  const filteredLogs = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return [];

    return logs.filter((log) => {
      // Action type filter
      if (actionFilter !== "ALL" && log.actionType !== actionFilter) {
        return false;
      }

      // Search query filter (matches ID, Actor, Role, Target, Description)
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        log.id.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.actorRole.toLowerCase().includes(q) ||
        log.targetEntity.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q)
      );
    });
  }, [logs, actionFilter, searchQuery]);

  // Currently selected log item
  const activeSelectedLog = useMemo(() => {
    if (filteredLogs.length === 0) return null;
    if (selectedLogId) {
      const match = filteredLogs.find((l) => l.id === selectedLogId);
      if (match) return match;
    }
    return filteredLogs[0] ?? null;
  }, [filteredLogs, selectedLogId]);

  const handleSelectLog = useCallback((id: string) => {
    setSelectedLogId(id);
  }, []);

  const handleCopyLogId = useCallback((id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleVerify = useCallback(
    (id: string) => {
      if (onVerifyLog) {
        onVerifyLog(id);
      } else {
        alert(`ยืนยันการรับรองบันทึก Audit ID: ${id} เรียบร้อยแล้ว`);
      }
    },
    [onVerifyLog]
  );

  return {
    searchQuery,
    setSearchQuery,
    actionFilter,
    setActionFilter,
    availableActionTypes,
    filteredLogs,
    activeSelectedLog,
    copiedId,
    handleSelectLog,
    handleCopyLogId,
    handleVerify,
  };
}
