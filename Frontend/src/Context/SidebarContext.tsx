"use client";

import React, { createContext, useContext, useState } from "react";

// ==========================================================================
// ─── 1. INTERFACES (นิยามประเภทข้อมูลสำหรับ Sidebar State)
// ==========================================================================
export interface SidebarContextType {
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// ==========================================================================
// ─── 2. PROVIDER COMPONENT
// ==========================================================================
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // ฟังก์ชันสลับสถานะการย่อ/ขยาย
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((previousState) => !previousState);
  };

  const setSidebarCollapsed = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarCollapsed,
        toggleSidebarCollapse,
        setSidebarCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// ==========================================================================
// ─── 3. CUSTOM HOOK สำหรับเรียกใช้งาน
// ==========================================================================
export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

