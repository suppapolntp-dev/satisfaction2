"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserManagementConfig,
  DEFAULT_USER_CONFIG,
  getStoredUserConfig,
  saveStoredUserConfig,
  USER_SETTINGS_UPDATED_EVENT,
} from "./userSettings";

export function useUserSettings() {
  const [userConfig, setUserConfig] = useState<UserManagementConfig>(DEFAULT_USER_CONFIG);

  useEffect(() => {
    // Initial read on mount
    setUserConfig(getStoredUserConfig());

    const handleUpdate = () => {
      setUserConfig(getStoredUserConfig());
    };

    window.addEventListener(USER_SETTINGS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(USER_SETTINGS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateConfig = useCallback((newConfig: Partial<UserManagementConfig>) => {
    const updated = {
      ...getStoredUserConfig(),
      ...newConfig,
    };
    saveStoredUserConfig(updated);
    setUserConfig(updated);
  }, []);

  return {
    userConfig,
    updateConfig,
  };
}
