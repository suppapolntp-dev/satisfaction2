"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useTransition,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_NAV_GROUPS, NavGroup, NavItem } from "@/Components/Sidebars/sidebar";
import { SearchActionItem } from "./types";

export function useNavbarSearchDropdown() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allActions = useMemo<SearchActionItem[]>(() => {
    const list: SearchActionItem[] = [];
    DEFAULT_NAV_GROUPS.forEach((g: NavGroup) => {
      g.items.forEach((item: NavItem) => {
        list.push({
          id: item.id,
          label: `${g.groupName} / ${item.label}`,
          groupName: g.groupName,
          itemName: item.label,
          route: item.route,
          shortcut: item.id.slice(0, 1).toUpperCase(),
        });
      });
    });
    list.push({
      id: "developer-playground",
      label: "Developer Tools / Developer Playground",
      groupName: "Developer Tools",
      itemName: "Developer Playground",
      route: "/test",
      shortcut: "T",
    });
    list.push({
      id: "customer-kiosk",
      label: "Customer Experience / Kiosk Screen",
      groupName: "Customer Experience",
      itemName: "Customer Kiosk Screen",
      route: "/satisfaction",
      shortcut: "K",
    });
    return list;
  }, []);

  const filteredActions = useMemo<SearchActionItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allActions;
    return allActions.filter(
      (action) =>
        action.label.toLowerCase().includes(q) ||
        action.route.toLowerCase().includes(q) ||
        action.itemName.toLowerCase().includes(q) ||
        action.groupName.toLowerCase().includes(q)
    );
  }, [allActions, query]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleNavigate = useCallback(
    (route: string) => {
      setIsOpen(false);
      setQuery("");
      startTransition(() => {
        router.push(route);
      });
    },
    [router]
  );

  const openSpotlightSearch = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
  }, []);

  const closeSpotlightSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      const isMeta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (isMeta && key === "k") {
        event.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setTimeout(() => inputRef.current?.focus(), 60);
          }
          return next;
        });
      } else if (key === "escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (filteredActions.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (filteredActions.length > 0) {
        setSelectedIndex(
          (prev) => (prev - 1 + filteredActions.length) % filteredActions.length
        );
      }
    } else if (event.key === "Enter") {
      if (filteredActions.length > 0 && selectedIndex < filteredActions.length) {
        event.preventDefault();
        handleNavigate(filteredActions[selectedIndex].route);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeSpotlightSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return {
    isOpen,
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    containerRef,
    inputRef,
    filteredActions,
    handleNavigate,
    handleInputKeyDown,
    handleClear,
    openSpotlightSearch,
    closeSpotlightSearch,
    setIsOpen,
  };
}
