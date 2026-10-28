"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookies } from "@/Lib/apiClient";
import { UserProfile } from "./types";

const defaultUserProfile: UserProfile = {
  fullName: "Guy Suppapol",
  email: "guy@satisfaction.local",
  roleName: "SuperAdmin",
};

export function useProfileDropdown(initialProfile?: UserProfile | null) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile ?? null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      return;
    }

    try {
      const stored = localStorage.getItem("satisfaction_user_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          fullName:
            parsed.fullName ||
            `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() ||
            defaultUserProfile.fullName,
          email: parsed.email || defaultUserProfile.email,
          roleName: parsed.roleName || defaultUserProfile.roleName,
          avatarUrl: parsed.avatarUrl,
        });
        return;
      }
    } catch {
      // Fallback silently if storage parsing fails
    }

    setProfile(defaultUserProfile);
  }, [initialProfile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleSignOut = () => {
    closeDropdown();
    clearAuthCookies();
    router.push("/login");
  };

  return {
    isOpen,
    profile,
    dropdownRef,
    toggleDropdown,
    closeDropdown,
    handleSignOut,
  };
}
