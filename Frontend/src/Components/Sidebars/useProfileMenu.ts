"use client";

import { useState, useEffect, useRef } from "react";

export function useProfileMenu() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleProfile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsProfileOpen((prev) => !prev);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  return {
    isProfileOpen,
    profileRef,
    toggleProfile,
    closeProfile,
  };
}
