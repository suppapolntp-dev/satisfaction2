"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AuthHeroConfig,
  DEFAULT_AUTH_HERO_CONFIG,
  getStoredAuthHeroConfig,
  AUTH_SETTINGS_UPDATED_EVENT,
} from "@/Lib/authSettings";

export interface UseLoginHeroOptions {
  brandName?: string;
  badgeText?: string;
  platformSubtitle?: string;
  tagText?: string;
  headline?: string;
  subheadline?: string;
  copyrightText?: string;
  privacyNoticeLabel?: string;
  securityAuditLabel?: string;
}

/**
 * 🪝 useLoginHero
 * 
 * Colocated Hook สำหรับ LoginHeroSection
 * ซิงก์ค่าตัวแปรจากระบบการตั้งค่า (System Settings) แบบ Reactive
 * และรองรับการ Override ค่าผ่าน Props ได้อย่างยืดหยุ่น
 */
export function useLoginHero(overrides: UseLoginHeroOptions = {}) {
  const [storedConfig, setStoredConfig] = useState<AuthHeroConfig>(DEFAULT_AUTH_HERO_CONFIG);

  useEffect(() => {
    // โหลดค่าการตั้งค่าจาก LocalStorage เมื่อรันฝั่ง Client
    setStoredConfig(getStoredAuthHeroConfig());

    const handleUpdate = () => {
      setStoredConfig(getStoredAuthHeroConfig());
    };

    window.addEventListener(AUTH_SETTINGS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(AUTH_SETTINGS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // รวมค่าการตั้งค่าจากระบบเข้ากับ Props ที่ส่งเข้ามา Override (หากมี)
  const config = useMemo<AuthHeroConfig>(() => {
    return {
      brandName: overrides.brandName ?? storedConfig.brandName,
      badgeText: overrides.badgeText ?? storedConfig.badgeText,
      platformSubtitle: overrides.platformSubtitle ?? storedConfig.platformSubtitle,
      tagText: overrides.tagText ?? storedConfig.tagText,
      headline: overrides.headline ?? storedConfig.headline,
      subheadline: overrides.subheadline ?? storedConfig.subheadline,
      pillars: storedConfig.pillars,
      copyrightText: overrides.copyrightText ?? storedConfig.copyrightText,
      privacyNoticeLabel: overrides.privacyNoticeLabel ?? storedConfig.privacyNoticeLabel,
      securityAuditLabel: overrides.securityAuditLabel ?? storedConfig.securityAuditLabel,
    };
  }, [storedConfig, overrides]);

  return { config };
}
