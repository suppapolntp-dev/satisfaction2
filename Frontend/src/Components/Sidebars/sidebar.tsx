"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/Context/SidebarContext";
import { useAuth } from "@/Context/AuthContext";

// ==========================================================================
// ─── 1. NAVIGATION CATEGORIES & ITEMS WITH MODULE CODES
// ==========================================================================

interface NavigationMenuItem {
  menuTitle: string;
  targetPath: string;
  materialIconName: string;
  moduleCode?: string; // รหัสโมดูลสำหรับตรวจสิทธิ์
}

interface NavigationCategory {
  categoryTitle: string;
  items: NavigationMenuItem[];
}

const ADMIN_NAVIGATION_SECTIONS: NavigationCategory[] = [
  {
    categoryTitle: "Analytics & Monitoring",
    items: [
      { menuTitle: "Dashboard", targetPath: "/dashboard", materialIconName: "dashboard", moduleCode: "DASHBOARD" },
      { menuTitle: "Notifications", targetPath: "/notifications", materialIconName: "notifications", moduleCode: "NOTIFICATIONS" },
    ],
  },
  {
    categoryTitle: "Operations & Structure",
    items: [
      { menuTitle: "Brand Management", targetPath: "/brand", materialIconName: "corporate_fare", moduleCode: "BRANDS" },
      { menuTitle: "Branch Management", targetPath: "/branch", materialIconName: "storefront", moduleCode: "BRANCHES" },
      { menuTitle: "Event & Campaigns", targetPath: "/event", materialIconName: "event", moduleCode: "EVENTS" },
    ],
  },
  {
    categoryTitle: "Security & Governance",
    items: [
      { menuTitle: "User Management", targetPath: "/usermanagement", materialIconName: "manage_accounts", moduleCode: "USERS" },
      { menuTitle: "Data Access Scope", targetPath: "/dataaccess", materialIconName: "lock_person", moduleCode: "DATA_ACCESS" },
      { menuTitle: "Roles & Permissions", targetPath: "/roles", materialIconName: "admin_panel_settings", moduleCode: "ROLES" },
      { menuTitle: "Audit Logs", targetPath: "/audit", materialIconName: "gavel", moduleCode: "AUDIT_LOGS" },
    ],
  },
  {
    categoryTitle: "Configuration",
    items: [
      { menuTitle: "System Settings", targetPath: "/settings", materialIconName: "settings", moduleCode: "SYSTEM_SETTINGS" },
    ],
  },
];

// ==========================================================================
// ─── 2. MAIN SIDEBAR COMPONENT
// ==========================================================================

export default function Sidebar() {
  const router = useRouter();
  const currentPathname = usePathname();
  const [isPendingTransition, startNavigationTransition] = useTransition();
  const { isSidebarCollapsed, toggleSidebarCollapse } = useSidebar();
  const { user, logout, hasPermission } = useAuth();

  const handleMenuNavigation = (targetPath: string) => {
    startNavigationTransition(() => {
      router.push(targetPath);
    });
  };

  const handleSignOut = async () => {
    if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
      await logout();
    }
  };

  return (
    <aside 
      className={`h-screen bg-slate-900 text-slate-300 fixed left-0 top-0 flex flex-col py-5 border-r border-slate-800 z-40 select-none transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? "w-[76px]" : "w-[260px]"
      }`}
    >
      
      {/* ─── 1. BRAND LOGO ─── */}
      <div className={`mb-4 flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          title={isSidebarCollapsed ? "ขยายแถบเมนู (Expand Sidebar)" : "ย่อแถบเมนู (Collapse Sidebar)"}
          className="flex items-center gap-3 overflow-hidden text-left outline-none cursor-pointer group rounded-xl transition-all duration-150 active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-900 group-hover:bg-blue-800 flex items-center justify-center border border-blue-700 shadow-md shadow-blue-950/40 shrink-0 transition-colors">
            <span className="material-symbols-outlined text-white text-[22px]">
              sentiment_satisfied
            </span>
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="font-bold text-sm text-white tracking-wide truncate group-hover:text-blue-200 transition-colors">Satisfaction</div>
              <div className="text-[11px] text-slate-400 font-medium truncate">Enterprise CSAT Platform</div>
            </div>
          )}
        </button>
      </div>

      {/* ─── 2. CATEGORIZED NAVIGATION MENU LIST ─── */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-4 custom-scrollbar">
        {ADMIN_NAVIGATION_SECTIONS.map((section, sectionIdx) => {
          // กรองเฉพาะเมนูที่ User คนนี้มีสิทธิ์มองเห็น (Role-Based & Tier-Based Filter)
          const visibleItems = section.items.filter((item) => {
            if (!item.moduleCode) return true;
            return hasPermission(item.moduleCode, "canView");
          });

          if (visibleItems.length === 0)  return null;

          return (
            <div key={sectionIdx} className="space-y-1">
              
              {/* Category Header Label */}
              {!isSidebarCollapsed ? (
                <div className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
                  {section.categoryTitle}
                </div>
              ) : sectionIdx > 0 ? (
                <div className="h-px bg-slate-800 my-2 mx-2 select-none" />
              ) : null}

              {/* Menu Items */}
              {visibleItems.map((menuItem) => {
                const isCurrentRouteActive = currentPathname === menuItem.targetPath;

                return (
                  <button
                    key={menuItem.targetPath}
                    type="button"
                    disabled={isPendingTransition}
                    onClick={() => handleMenuNavigation(menuItem.targetPath)}
                    title={isSidebarCollapsed ? menuItem.menuTitle : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 outline-none group text-left cursor-pointer ${
                      isSidebarCollapsed ? "justify-center px-2" : ""
                    } ${
                      isCurrentRouteActive
                        ? "bg-blue-900 text-white shadow-xs border border-blue-800"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-colors shrink-0 ${
                        isCurrentRouteActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {menuItem.materialIconName}
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="flex-1 truncate">{menuItem.menuTitle}</span>
                    )}
                  </button>
                );
              })}

            </div>
          );
        })}
      </nav>

      {/* ─── 4. FOOTER ACTIONS ─── */}
      <div className="mt-auto px-3 pt-3 border-t border-slate-800 space-y-1">
        <button
          type="button"
          onClick={() => handleMenuNavigation("/docs")}
          title={isSidebarCollapsed ? "API Documentation" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer ${
            isSidebarCollapsed ? "justify-center px-2" : ""
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">description</span>
          {!isSidebarCollapsed && <span>API Documentation</span>}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          title={isSidebarCollapsed ? "Sign Out" : undefined}
          className={`w-full mt-2 bg-slate-800 text-slate-300 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-900 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-700 active:scale-95 flex justify-center items-center gap-2 cursor-pointer ${
            isSidebarCollapsed ? "px-2" : ""
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">logout</span>
          {!isSidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>

    </aside>
  );
}