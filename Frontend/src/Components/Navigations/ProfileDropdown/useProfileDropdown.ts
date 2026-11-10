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
  brandId?: string;
  brandName?: string;
  brandLogoUrl?: string;
  brandScopes?: string[];
}

const KNOWN_BRAND_LOGOS: Record<string, { brandName: string; logoUrl: string }> = {
  kfc: { brandName: "KFC", logoUrl: "/images/brands/kfc.svg" },
  "b-1": { brandName: "KFC", logoUrl: "/images/brands/kfc.svg" },
  "mister donut": { brandName: "Mister Donut", logoUrl: "/images/brands/mister-donut.svg" },
  mister_donut: { brandName: "Mister Donut", logoUrl: "/images/brands/mister-donut.svg" },
  "mister-donut": { brandName: "Mister Donut", logoUrl: "/images/brands/mister-donut.svg" },
  mdo: { brandName: "Mister Donut", logoUrl: "/images/brands/mister-donut.svg" },
  "b-2": { brandName: "Mister Donut", logoUrl: "/images/brands/mister-donut.svg" },
  ootoya: { brandName: "Ootoya", logoUrl: "/images/brands/ootoya.svg" },
  "b-3": { brandName: "Ootoya", logoUrl: "/images/brands/ootoya.svg" },
  "pepper lunch": { brandName: "Pepper Lunch", logoUrl: "/images/brands/pepper-lunch.svg" },
  pepper_lunch: { brandName: "Pepper Lunch", logoUrl: "/images/brands/pepper-lunch.svg" },
  "pepper-lunch": { brandName: "Pepper Lunch", logoUrl: "/images/brands/pepper-lunch.svg" },
  "b-4": { brandName: "Pepper Lunch", logoUrl: "/images/brands/pepper-lunch.svg" },
  "auntie anne's": { brandName: "Auntie Anne's", logoUrl: "/images/brands/auntie-annes.svg" },
  auntie_annes: { brandName: "Auntie Anne's", logoUrl: "/images/brands/auntie-annes.svg" },
  "auntie-annes": { brandName: "Auntie Anne's", logoUrl: "/images/brands/auntie-annes.svg" },
  "b-5": { brandName: "Auntie Anne's", logoUrl: "/images/brands/auntie-annes.svg" },
  arigato: { brandName: "Arigato", logoUrl: "/images/brands/arigato.svg" },
  "b-6": { brandName: "Arigato", logoUrl: "/images/brands/arigato.svg" },
};

export function resolveBrandInfo(source: any): { brandName?: string; brandLogoUrl?: string } {
  if (!source) return {};

  if (source.brandLogoUrl) {
    return { brandName: source.brandName, brandLogoUrl: source.brandLogoUrl };
  }

  if (source.avatarUrl && typeof source.avatarUrl === "string" && source.avatarUrl.includes("/brands/")) {
    return { brandName: source.brandName, brandLogoUrl: source.avatarUrl };
  }

  const candidates: string[] = [];
  if (source.brandId) candidates.push(String(source.brandId).toLowerCase().trim());
  if (source.brandCode) candidates.push(String(source.brandCode).toLowerCase().trim());
  if (source.brandName) candidates.push(String(source.brandName).toLowerCase().trim());
  if (Array.isArray(source.brandScopes)) {
    source.brandScopes.forEach((s: any) => candidates.push(String(s).toLowerCase().trim()));
  }
  if (source.email) {
    candidates.push(String(source.email).split("@")[0].toLowerCase());
  }
  if (source.roleName) {
    candidates.push(String(source.roleName).toLowerCase());
  }

  for (const candidate of candidates) {
    for (const [key, match] of Object.entries(KNOWN_BRAND_LOGOS)) {
      if (candidate === key || candidate.includes(key)) {
        return { brandName: match.brandName, brandLogoUrl: match.logoUrl };
      }
    }
  }

  return {};
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

    const brandInfo = resolveBrandInfo(parsed);
    const brandLogoUrl = parsed.brandLogoUrl || brandInfo.brandLogoUrl;
    const brandName = parsed.brandName || brandInfo.brandName;

    return {
      id: parsed.id,
      fullName: fullName || "-",
      email: parsed.email || "-",
      roleName: parsed.roleName || parsed.roleCode || "-",
      avatarUrl: parsed.avatarUrl,
      brandName,
      brandLogoUrl,
      isGuest: !brandLogoUrl,
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
        const brandInfo = resolveBrandInfo(dto);
        const brandLogoUrl = dto.brandLogoUrl || brandInfo.brandLogoUrl;
        const brandName = dto.brandName || brandInfo.brandName;

        const resolvedProfile: UserProfile = {
          id: dto.id,
          fullName:
            dto.fullName ||
            `${dto.firstName || ""} ${dto.lastName || ""}`.trim() ||
            "-",
          email: dto.email || "-",
          roleName: dto.roleName || dto.roleCode || "-",
          avatarUrl: dto.avatarUrl,
          brandName,
          brandLogoUrl,
          isGuest: !brandLogoUrl,
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
