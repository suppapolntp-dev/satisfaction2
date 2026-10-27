"use client";

import React from "react";
import { useFavorite } from "./useFavorite";

export interface FavoriteButtonProps {
  isFavorite?: boolean;
  onToggle?: () => void;
  className?: string;
  ariaLabel?: string;
}

export default function FavoriteButton({
  isFavorite: controlledFavorite,
  onToggle,
  className = "",
  ariaLabel,
}: FavoriteButtonProps) {
  const { isFavorite: internalFavorite, toggleFavorite } = useFavorite();
  const isStarred = controlledFavorite !== undefined ? controlledFavorite : internalFavorite;

  const handleStarClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      toggleFavorite();
    }
  };

  const defaultLabel = isStarred ? "Remove from favorites" : "Add to favorites";

  return (
    <button
      type="button"
      onClick={handleStarClick}
      aria-label={ariaLabel || defaultLabel}
      className={`p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors cursor-pointer ${className}`}
    >
      <svg
        className={`w-5 h-5 transition-transform active:scale-125 ${
          isStarred ? "text-amber-400 fill-amber-400" : "text-slate-300 hover:text-amber-400"
        }`}
        viewBox="0 0 24 24"
        fill={isStarred ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
