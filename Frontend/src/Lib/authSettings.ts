// ==========================================================================
// ─── 1. INTERFACES (นิยามตัวแปรการตั้งค่าส่วนแสดงผล Auth & Branding)
// ==========================================================================

export interface AuthPillarItem {
  id: string;
  title: string;
  subtitle: string;
}

export interface AuthHeroConfig {
  // ─── 1. ข้อมูลแบรนด์และเวอร์ชัน (Brand Header) ───
  brandName: string;
  badgeText: string;
  platformSubtitle: string;

  // ─── 2. ป้ายกำกับและข้อความสื่อสารหลัก (Center Hero) ───
  tagText: string;
  headline: string;
  subheadline: string;

  // ─── 3. เสาหลักสถาปัตยกรรม 3 ประการ (Architecture Pillars) ───
  pillars: AuthPillarItem[];

  // ─── 4. ข้อมูลลิขสิทธิ์และส่วนท้าย (Legal & Footer) ───
  copyrightText: string;
  privacyNoticeLabel: string;
  securityAuditLabel: string;

  // ─── 5. ข้อมูลแบบฟอร์มล็อกอิน (Login Form Texts) ───
  formTitle: string;
  formSubtitle: string;
  submitButtonLabel: string;
  securityNoticeText: string;
}

export const DEFAULT_AUTH_HERO_CONFIG: AuthHeroConfig = {
  // Header
  brandName: "Satisfaction Console",
  badgeText: "Enterprise Tier",
  platformSubtitle: "Multi-Tier Analytics Platform",

  // Center Hero
  tagText: "Operational Intelligence 2.0",
  headline: "The platform empowering enterprise brands with real-time operational satisfaction analytics.",
  subheadline: "The trusted choice of multi-tier restaurant operations, regional managers, and executive leadership.",

  // 3 Pillars
  pillars: [
    {
      id: "pillar-1",
      title: "5-Tier Scoping",
      subtitle: "Strict Data Isolation",
    },
    {
      id: "pillar-2",
      title: "Real-Time CSAT",
      subtitle: "Kiosk Vote Ingestion",
    },
    {
      id: "pillar-3",
      title: "2FA Protected",
      subtitle: "Zero-Trust Access",
    },
  ],

  // Footer
  copyrightText: "Copyright © 2026 Central Restaurants Group (CRG). All rights reserved.",
  privacyNoticeLabel: "Privacy Notice",
  securityAuditLabel: "Security Audit",

  // Login Form
  formTitle: "Welcome back",
  formSubtitle: "กรอกรหัสประจำตัวองค์กรเพื่อเข้าสู่ระบบงาน",
  submitButtonLabel: "Sign In to Console",
  securityNoticeText: "ระบบสงวนสิทธิ์เฉพาะบุคลากรที่ได้รับมอบหมาย บัญชีผู้ใช้งานถูกสร้างและกำหนดสิทธิ์โดย Admin / Brand Manager ประจำสายงาน (Role-based Provisioning)",
};

// ==========================================================================
// ─── 2. LOCAL STORAGE SYNC (ซิงก์ค่าระหว่าง Admin System Settings กับหน้า Login)
// ==========================================================================

const AUTH_SETTINGS_STORAGE_KEY = "csat_auth_hero_settings";
export const AUTH_SETTINGS_UPDATED_EVENT = "csat_auth_hero_settings_updated";

/**
 * ดึงค่าการตั้งค่าหน้า Login Hero จาก LocalStorage (หากไม่มีจะใช้ค่าเริ่มต้น)
 */
export function getStoredAuthHeroConfig(): AuthHeroConfig {
  if (typeof window === "undefined") {
    return DEFAULT_AUTH_HERO_CONFIG;
  }
  try {
    const rawData = localStorage.getItem(AUTH_SETTINGS_STORAGE_KEY);
    if (!rawData) {
      return DEFAULT_AUTH_HERO_CONFIG;
    }
    const parsed = JSON.parse(rawData);
    return {
      ...DEFAULT_AUTH_HERO_CONFIG,
      ...parsed,
      brandName: parsed.brandName || DEFAULT_AUTH_HERO_CONFIG.brandName,
      badgeText: parsed.badgeText || DEFAULT_AUTH_HERO_CONFIG.badgeText,
      platformSubtitle: parsed.platformSubtitle || DEFAULT_AUTH_HERO_CONFIG.platformSubtitle,
      tagText: parsed.tagText || DEFAULT_AUTH_HERO_CONFIG.tagText,
      headline: parsed.headline || DEFAULT_AUTH_HERO_CONFIG.headline,
      subheadline: parsed.subheadline || DEFAULT_AUTH_HERO_CONFIG.subheadline,
      pillars: Array.isArray(parsed.pillars) && parsed.pillars.length > 0
        ? parsed.pillars
        : DEFAULT_AUTH_HERO_CONFIG.pillars,
      copyrightText: parsed.copyrightText || DEFAULT_AUTH_HERO_CONFIG.copyrightText,
      privacyNoticeLabel: parsed.privacyNoticeLabel || DEFAULT_AUTH_HERO_CONFIG.privacyNoticeLabel,
      securityAuditLabel: parsed.securityAuditLabel || DEFAULT_AUTH_HERO_CONFIG.securityAuditLabel,
      formTitle: parsed.formTitle || DEFAULT_AUTH_HERO_CONFIG.formTitle,
      formSubtitle: parsed.formSubtitle || DEFAULT_AUTH_HERO_CONFIG.formSubtitle,
      submitButtonLabel: parsed.submitButtonLabel || DEFAULT_AUTH_HERO_CONFIG.submitButtonLabel,
      securityNoticeText: parsed.securityNoticeText || DEFAULT_AUTH_HERO_CONFIG.securityNoticeText,
    };
  } catch (error) {
    console.error("Error reading auth hero config from localStorage:", error);
    return DEFAULT_AUTH_HERO_CONFIG;
  }
}

/**
 * บันทึกการตั้งค่าหน้า Login Hero ลง LocalStorage และกระจาย Event ให้อัปเดตทันที
 */
export function saveStoredAuthHeroConfig(config: AuthHeroConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_SETTINGS_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event(AUTH_SETTINGS_UPDATED_EVENT));
  } catch (error) {
    console.error("Error writing auth hero config to localStorage:", error);
  }
}
