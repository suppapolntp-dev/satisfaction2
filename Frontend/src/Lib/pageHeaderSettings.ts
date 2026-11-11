"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AuditSettingsState,
  DEFAULT_AUDIT_SETTINGS,
} from "@/Components/Forms/AuditSettingsSection";
import {
  BrandSettingsState,
  DEFAULT_BRAND_SETTINGS,
} from "@/Components/Forms/BrandSettingsSection";
import {
  EventSettingsState,
  DEFAULT_EVENT_SETTINGS,
} from "@/Components/Forms/EventSettingsSection";
import {
  NotificationSettingsState,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/Components/Forms/NotificationSettingsSection";
import {
  RoleSettingsState,
  DEFAULT_ROLE_SETTINGS,
} from "@/Components/Forms/RoleSettingsSection";
import {
  UserSettingsState,
  DEFAULT_USER_SETTINGS,
} from "@/Components/Forms/UserSettingsSection";

// Storage keys
export const AUDIT_SETTINGS_KEY = "csat_audit_settings";
export const BRAND_SETTINGS_KEY = "csat_brand_settings";
export const EVENT_SETTINGS_KEY = "csat_event_settings";
export const NOTIFICATION_SETTINGS_KEY = "csat_notification_settings";
export const ROLE_SETTINGS_KEY = "csat_role_settings";
export const USER_SETTINGS_KEY = "csat_user_system_settings";

export const SETTINGS_UPDATED_EVENT = "csat_settings_updated";

// Helper to safely broadcast settings update across tabs and components
function broadcastUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
  }
}

// ─── 1. AUDIT SETTINGS ───
export function getStoredAuditConfig(): AuditSettingsState {
  if (typeof window === "undefined") return DEFAULT_AUDIT_SETTINGS;
  try {
    const raw = localStorage.getItem(AUDIT_SETTINGS_KEY);
    if (!raw) return DEFAULT_AUDIT_SETTINGS;
    return { ...DEFAULT_AUDIT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUDIT_SETTINGS;
  }
}

export function saveStoredAuditConfig(config: AuditSettingsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUDIT_SETTINGS_KEY, JSON.stringify(config));
    broadcastUpdate();
  } catch (e) {
    console.error("Failed to save audit settings:", e);
  }
}

export function useAuditSettings() {
  const [config, setConfig] = useState<AuditSettingsState>(getStoredAuditConfig);

  useEffect(() => {
    const handleSync = () => setConfig(getStoredAuditConfig());
    handleSync();
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSync);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSync);
  }, []);

  const updateConfig = useCallback((updated: Partial<AuditSettingsState>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      saveStoredAuditConfig(next);
      return next;
    });
  }, []);

  return { config, updateConfig };
}

// ─── 2. BRAND SETTINGS ───
export function getStoredBrandConfig(): BrandSettingsState {
  if (typeof window === "undefined") return DEFAULT_BRAND_SETTINGS;
  try {
    const raw = localStorage.getItem(BRAND_SETTINGS_KEY);
    if (!raw) return DEFAULT_BRAND_SETTINGS;
    return { ...DEFAULT_BRAND_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BRAND_SETTINGS;
  }
}

export function saveStoredBrandConfig(config: BrandSettingsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BRAND_SETTINGS_KEY, JSON.stringify(config));
    broadcastUpdate();
  } catch (e) {
    console.error("Failed to save brand settings:", e);
  }
}

export function useBrandSettings() {
  const [config, setConfig] = useState<BrandSettingsState>(getStoredBrandConfig);

  useEffect(() => {
    const handleSync = () => setConfig(getStoredBrandConfig());
    handleSync();
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSync);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSync);
  }, []);

  const updateConfig = useCallback((updated: Partial<BrandSettingsState>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      saveStoredBrandConfig(next);
      return next;
    });
  }, []);

  return { config, updateConfig };
}

// ─── 3. EVENT SETTINGS ───
export function getStoredEventConfig(): EventSettingsState {
  if (typeof window === "undefined") return DEFAULT_EVENT_SETTINGS;
  try {
    const raw = localStorage.getItem(EVENT_SETTINGS_KEY);
    if (!raw) return DEFAULT_EVENT_SETTINGS;
    return { ...DEFAULT_EVENT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EVENT_SETTINGS;
  }
}

export function saveStoredEventConfig(config: EventSettingsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENT_SETTINGS_KEY, JSON.stringify(config));
    broadcastUpdate();
  } catch (e) {
    console.error("Failed to save event settings:", e);
  }
}

export function useEventSettings() {
  const [config, setConfig] = useState<EventSettingsState>(getStoredEventConfig);

  useEffect(() => {
    const handleSync = () => setConfig(getStoredEventConfig());
    handleSync();
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSync);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSync);
  }, []);

  const updateConfig = useCallback((updated: Partial<EventSettingsState>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      saveStoredEventConfig(next);
      return next;
    });
  }, []);

  return { config, updateConfig };
}

// ─── 4. NOTIFICATION SETTINGS ───
export function getStoredNotificationConfig(): NotificationSettingsState {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveStoredNotificationConfig(config: NotificationSettingsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(config));
    broadcastUpdate();
  } catch (e) {
    console.error("Failed to save notification settings:", e);
  }
}

export function useNotificationSettings() {
  const [config, setConfig] = useState<NotificationSettingsState>(getStoredNotificationConfig);

  useEffect(() => {
    const handleSync = () => setConfig(getStoredNotificationConfig());
    handleSync();
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSync);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSync);
  }, []);

  const updateConfig = useCallback((updated: Partial<NotificationSettingsState>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      saveStoredNotificationConfig(next);
      return next;
    });
  }, []);

  return { config, updateConfig };
}

// ─── 5. ROLE SETTINGS ───
export function getStoredRoleConfig(): RoleSettingsState {
  if (typeof window === "undefined") return DEFAULT_ROLE_SETTINGS;
  try {
    const raw = localStorage.getItem(ROLE_SETTINGS_KEY);
    if (!raw) return DEFAULT_ROLE_SETTINGS;
    return { ...DEFAULT_ROLE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ROLE_SETTINGS;
  }
}

export function saveStoredRoleConfig(config: RoleSettingsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROLE_SETTINGS_KEY, JSON.stringify(config));
    broadcastUpdate();
  } catch (e) {
    console.error("Failed to save role settings:", e);
  }
}

export function useRoleSettings() {
  const [config, setConfig] = useState<RoleSettingsState>(getStoredRoleConfig);

  useEffect(() => {
    const handleSync = () => setConfig(getStoredRoleConfig());
    handleSync();
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSync);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSync);
  }, []);

  const updateConfig = useCallback((updated: Partial<RoleSettingsState>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      saveStoredRoleConfig(next);
      return next;
    });
  }, []);

  return { config, updateConfig };
}

// ─── 6. USER SETTINGS ───
export function getStoredUserSettingsConfig(): UserSettingsState {
  if (typeof window === "undefined") return DEFAULT_USER_SETTINGS;
  try {
    const raw = localStorage.getItem(USER_SETTINGS_KEY);
    if (!raw) return DEFAULT_USER_SETTINGS;
    return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
}

export function saveStoredUserSettingsConfig(config: UserSettingsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(config));

    // Also sync to user management config so both hooks stay identical
    try {
      const rawLegacy = localStorage.getItem("csat_user_management_config");
      const legacy = rawLegacy ? JSON.parse(rawLegacy) : {};
      legacy.pageTitle = config.pageTitle;
      legacy.pageDescription = config.pageSubtitle;
      localStorage.setItem("csat_user_management_config", JSON.stringify(legacy));
      window.dispatchEvent(new Event("csat_user_management_settings_updated"));
    } catch {
      // Ignore legacy sync errors
    }

    broadcastUpdate();
  } catch (e) {
    console.error("Failed to save user settings:", e);
  }
}

export function useAdminUserSettings() {
  const [config, setConfig] = useState<UserSettingsState>(getStoredUserSettingsConfig);

  useEffect(() => {
    const handleSync = () => setConfig(getStoredUserSettingsConfig());
    handleSync();
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSync);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSync);
  }, []);

  const updateConfig = useCallback((updated: Partial<UserSettingsState>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      saveStoredUserSettingsConfig(next);
      return next;
    });
  }, []);

  return { config, updateConfig };
}
