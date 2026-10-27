"use client";

import { useState } from "react";
import { HeaderTabItem } from "./HeaderTabs";

export interface UsePageHeaderOptions {
  initialTab?: string;
  tabs?: HeaderTabItem[];
  onTabChange?: (tabId: string) => void;
  initialFavorite?: boolean;
  onToggleFavorite?: (starred: boolean) => void;
}

export function usePageHeader(options: UsePageHeaderOptions = {}) {
  const {
    initialTab,
    tabs = [],
    onTabChange,
    initialFavorite = false,
    onToggleFavorite,
  } = options;

  const [activeTab, setActiveTab] = useState<string>(
    initialTab || (tabs.length > 0 ? tabs[0].id : "")
  );
  const [isFavorite, setIsFavorite] = useState<boolean>(initialFavorite);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => {
      const next = !prev;
      onToggleFavorite?.(next);
      return next;
    });
  };

  return {
    activeTab,
    handleTabChange,
    isFavorite,
    handleToggleFavorite,
    setIsFavorite,
  };
}
