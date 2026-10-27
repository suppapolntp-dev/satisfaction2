"use client";

import { useState } from "react";

export interface UseFavoriteOptions {
  initialFavorite?: boolean;
  onToggle?: (nextStarred: boolean) => void;
}

export function useFavorite(options: UseFavoriteOptions = {}) {
  const { initialFavorite = false, onToggle } = options;
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const toggleFavorite = () => {
    setIsFavorite((prev) => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  };

  return {
    isFavorite,
    toggleFavorite,
    setIsFavorite,
  };
}
