"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient, clearAuthCookies, getAuthToken } from "@/Lib/apiClient";
import { UserProfile } from "./types";

interface AuthMeDto {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  roleName?: string;
  roleCode?: string;
  avatarUrl?: string;
}

function readCachedProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("satisfaction_user_profile");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const fullName =
      parsed.fullName ||
      `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim();
    if (!fullName && !parsed.email) return null;
    return {
      id: parsed.id,
      fullName: fullName || "-",
      email: parsed.email || "-",
      roleName: parsed.roleName || parsed.roleCode || "-",
      avatarUrl: parsed.avatarUrl,
    };
  } catch {
    return null;
  }
}

export function useProfileDropdown(initialProfile?: UserProfile | null) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialProfile);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchProfile = useCallback(async () => {
    setError(null);
    const cached = readCachedProfile();
    if (cached) {
      setProfile(cached);
    }

    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get<AuthMeDto>("/auth/me");
      if (response.success && response.data) {
        const dto = response.data;
        const resolvedProfile: UserProfile = {
          id: dto.id,
          fullName:
            dto.fullName ||
            `${dto.firstName || ""} ${dto.lastName || ""}`.trim() ||
            "-",
          email: dto.email || "-",
          roleName: dto.roleName || dto.roleCode || "-",
          avatarUrl: dto.avatarUrl,
        };
        setProfile(resolvedProfile);
        try {
          localStorage.setItem(
            "satisfaction_user_profile",
            JSON.stringify(resolvedProfile)
          );
        } catch {
          // Ignore storage quota errors
        }
      } else if (!cached) {
        setError(response.message || "Unable to load profile");
      }
    } catch {
      if (!cached) {
        setError("Unable to load profile");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialProfile !== undefined) {
      setProfile(initialProfile);
      setIsLoading(false);
      return;
    }
    fetchProfile();
  }, [initialProfile, fetchProfile]);

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
    setIsOpen((prev) => {
      const next = !prev;
      if (next && !profile && !isLoading) {
        fetchProfile();
      }
      return next;
    });
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
    isLoading,
    error,
    dropdownRef,
    toggleDropdown,
    closeDropdown,
    retryFetchProfile: fetchProfile,
    handleSignOut,
  };
}
