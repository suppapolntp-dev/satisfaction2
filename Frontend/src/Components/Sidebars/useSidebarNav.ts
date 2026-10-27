"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useSidebar } from "@/Context/SidebarContext";

export function useSidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const {
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileOpen,
    closeMobile,
  } = useSidebar();

  const handleNavigate = (route: string) => {
    closeMobile();
    startTransition(() => {
      router.push(route);
    });
  };

  const isItemActive = (route: string, exact?: boolean) => {
    if (exact || route === "/dashboard") {
      return pathname === route;
    }
    return pathname === route || (pathname ? pathname.startsWith(`${route}/`) : false);
  };

  return {
    pathname,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileOpen,
    closeMobile,
    handleNavigate,
    isItemActive,
  };
}
