"use client";

import { useState, useEffect, useRef, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_NAV_GROUPS, NavGroup, NavItem } from "@/Components/Sidebars/Sidebar";

export function useCommandPalette() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const paletteInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K to open, Escape to close
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMeta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (isMeta && key === "k") {
        event.preventDefault();
        setIsPaletteOpen(true);
        setPaletteQuery("");
        setTimeout(() => paletteInputRef.current?.focus(), 50);
      } else if (key === "escape") {
        setIsPaletteOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allPaletteActions = useMemo(() => {
    const list: { label: string; route: string; shortcut: string }[] = [];
    DEFAULT_NAV_GROUPS.forEach((g: NavGroup) => {
      g.items.forEach((item: NavItem) => {
        list.push({
          label: `${g.groupName} / ${item.label}`,
          route: item.route,
          shortcut: item.id.slice(0, 1).toUpperCase(),
        });
      });
    });
    list.push({ label: "Developer Playground", route: "/test", shortcut: "T" });
    list.push({ label: "Customer Kiosk Screen", route: "/satisfaction", shortcut: "K" });
    return list;
  }, []);

  const filteredPaletteActions = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    if (!q) return allPaletteActions;
    return allPaletteActions.filter((a) => a.label.toLowerCase().includes(q));
  }, [allPaletteActions, paletteQuery]);

  const handleNavigate = (route: string) => {
    setIsPaletteOpen(false);
    startTransition(() => {
      router.push(route);
    });
  };

  const handleOpenSearch = () => {
    setIsPaletteOpen(true);
    setPaletteQuery("");
    setTimeout(() => paletteInputRef.current?.focus(), 50);
  };

  const handleCloseSearch = () => {
    setIsPaletteOpen(false);
  };

  return {
    isPaletteOpen,
    paletteQuery,
    setPaletteQuery,
    paletteInputRef,
    filteredPaletteActions,
    handleNavigate,
    handleOpenSearch,
    handleCloseSearch,
  };
}
