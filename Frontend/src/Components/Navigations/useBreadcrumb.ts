"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_NAV_GROUPS } from "@/Components/Sidebars/sidebar";

export interface BreadcrumbInfo {
  groupName: string;
  pageLabel: string;
}

export function useBreadcrumb(): BreadcrumbInfo {
  const pathname = usePathname();

  return useMemo<BreadcrumbInfo>(() => {
    for (const group of DEFAULT_NAV_GROUPS) {
      for (const item of group.items) {
        const isMatch =
          item.exact || item.route === "/dashboard"
            ? pathname === item.route
            : pathname === item.route || (pathname ? pathname.startsWith(`${item.route}/`) : false);
        if (isMatch) {
          return { groupName: group.groupName, pageLabel: item.label };
        }
      }
    }
    return { groupName: "Workspace", pageLabel: "Overview" };
  }, [pathname]);
}
