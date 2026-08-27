"use client";

import React from "react";
import Sidebar from "@/Components/Sidebars/sidebar";
import TopNavBar from "@/Components/Navigations/TopNavBar";
import { SidebarProvider, useSidebar } from "@/Context/SidebarContext";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutShellProps) {
  const { isSidebarCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 antialiased font-[var(--font-inter)]">
      {/* ─── 1. Collapsible Fixed Sidebar Navigation ─── */}
      <Sidebar />

      {/* ─── 2. Responsive Main Workspace (ขยายพื้นที่ตาม Sidebar อัตโนมัติ) ─── */}
      <div 
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "pl-[76px]" : "pl-[260px]"
        }`}
      >
        {/* Sticky Top Navigation Bar */}
        <TopNavBar />

        {/* Dynamic Page Content Shell */}
        <main className="flex-1 w-full p-6 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <SidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
  );
}
