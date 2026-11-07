"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isApiModeEnabled, setApiModeEnabled as saveApiMode } from "@/Lib/apiClient";

interface ApiModeContextType {
  isApiEnabled: boolean;
  toggleApiMode: () => void;
  setApiEnabled: (enabled: boolean) => void;
}

const ApiModeContext = createContext<ApiModeContextType>({
  isApiEnabled: true,
  toggleApiMode: () => {},
  setApiEnabled: () => {},
});

export function ApiModeProvider({ children }: { children: React.ReactNode }) {
  const [isApiEnabled, setIsApiEnabledState] = useState<boolean>(true);

  useEffect(() => {
    // Initial read from client localStorage
    setIsApiEnabledState(isApiModeEnabled());

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (typeof customEvent.detail?.enabled === "boolean") {
        setIsApiEnabledState(customEvent.detail.enabled);
      } else {
        setIsApiEnabledState(isApiModeEnabled());
      }
    };

    window.addEventListener("satisfaction:api-mode-change", handleModeChange);
    return () => {
      window.removeEventListener("satisfaction:api-mode-change", handleModeChange);
    };
  }, []);

  const setApiEnabled = useCallback((enabled: boolean) => {
    setIsApiEnabledState(enabled);
    saveApiMode(enabled);
  }, []);

  const toggleApiMode = useCallback(() => {
    setIsApiEnabledState((prev) => {
      const next = !prev;
      saveApiMode(next);
      return next;
    });
  }, []);

  return (
    <ApiModeContext.Provider value={{ isApiEnabled, toggleApiMode, setApiEnabled }}>
      {children}
    </ApiModeContext.Provider>
  );
}

export function useApiMode() {
  return useContext(ApiModeContext);
}
