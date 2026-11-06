// ==========================================================================
// ─── 1. INTERFACES (นิยามโครงสร้างข้อมูลการตั้งค่าแบบประเมิน Kiosk)
// ==========================================================================

export interface SatisfactionConfig {
  // ─── 1. หัวข้อและคำอธิบายหน้าจอประเมิน (Header & Subtitle) ───
  questionTitle: string;        // ข้อความคำถามหลัก (เช่น "ท่านมีความพึงพอใจกับการบริการในวันนี้อย่างไร?")
  questionFontSize: number;     // ขนาดฟอนต์คำถามหลัก (px) - ค่าตั้งต้น 36px
  questionSubtitle: string;     // ข้อความคำอธิบายย่อย (เช่น "โปรดประเมินความพึงพอใจจากตัวเลือกด้านล่าง")
  subtitleFontSize: number;     // ขนาดฟอนต์คำอธิบายย่อย (px) - ค่าตั้งต้น 18px

  // ─── 2. การตั้งค่าปุ่มกด Kiosk (Button Grid) ───
  emojiSize: number;            // ขนาดไอคอนอิโมจิปุ่มกด (px) - ค่าตั้งต้น 160px
  labelFontSize: number;        // ขนาดตัวอักษรป้ายกำกับ แย่/ปานกลาง/ดี (px) - ค่าตั้งต้น 20px
  gridMaxWidth: number;         // ความกว้างสูงสุดของแถวปุ่มกด (px) - ค่าตั้งต้น 900px
  duplicateVoteMinutes: number; // เวลาคูลดาวน์กันการกดโหวตซ้ำ (นาที) - ค่าตั้งต้น 30 นาที

  // ─── 3. การตั้งค่าหน้าต่างขอบคุณ (Thank You Modal) ───
  autoResetSeconds: number;     // เวลานับถอยหลังรีเซ็ตหน้าจอขอบคุณ (วินาที) - ค่าตั้งต้น 4 วินาที
  modalMaxWidth: number;        // ความกว้างสูงสุดของหน้าต่างขอบคุณ (px) - ค่าตั้งต้น 650px
  thankYouIconSize: number;     // ขนาดไอคอนขอบคุณ (px) - ค่าตั้งต้น 80px
  thankYouMessageTh: string;    // ข้อความขอบคุณภาษาไทย
  thankYouFontSizeTh: number;   // ขนาดตัวหนังสือภาษาไทย (px) - ค่าตั้งต้น 28px
  thankYouMessageEn: string;    // ข้อความขอบคุณภาษาอังกฤษ
  thankYouFontSizeEn: number;   // ขนาดตัวหนังสือภาษาอังกฤษ (px) - ค่าตั้งต้น 16px

  // ─── ตัวแปรเสริมสำหรับเชื่อมโยงกับ Event Management ในอนาคต ───
  eventOverrideEnabled?: boolean;
  eventGreetingTh?: string;
  eventGreetingEn?: string;
  eventThankYouTh?: string;
  eventThankYouEn?: string;
  labelSad?: string;
  labelNeutral?: string;
  labelHappy?: string;
  iconSad?: string;
  iconNeutral?: string;
  iconHappy?: string;
}

export const DEFAULT_SATISFACTION_CONFIG: SatisfactionConfig = {
  // หัวข้อคำถามและคำอธิบาย
  questionTitle: "ท่านมีความพึงพอใจกับการบริการในวันนี้อย่างไร?",
  questionFontSize: 36,
  questionSubtitle: "โปรดประเมินความพึงพอใจจากตัวเลือกด้านล่าง",
  subtitleFontSize: 18,

  // ปุ่มกด
  emojiSize: 160,
  labelFontSize: 20,
  gridMaxWidth: 900,
  duplicateVoteMinutes: 30,

  // หน้าต่างขอบคุณ
  autoResetSeconds: 4,
  modalMaxWidth: 650,
  thankYouIconSize: 80,
  thankYouMessageTh: "ขอขอบคุณสำหรับความคิดเห็นอันมีค่าของคุณ เพื่อการพัฒนาบริการให้ดียิ่งขึ้นนะคะ",
  thankYouFontSizeTh: 28,
  thankYouMessageEn: "Thank you for your valuable feedback! We appreciate your visit.",
  thankYouFontSizeEn: 16,
  eventOverrideEnabled: false,
};

// ==========================================================================
// ─── 2. LOCAL STORAGE SYNC (ซิงก์ค่าระหว่าง Admin System Settings กับหน้า Kiosk)
// ==========================================================================

const STORAGE_KEY = "csat_satisfaction_settings";

/**
 * ดึงค่าการตั้งค่าแบบประเมินจาก LocalStorage (หากไม่มีจะใช้ค่าเริ่มต้น)
 */
export function getStoredSatisfactionConfig(): SatisfactionConfig {
  if (typeof window === "undefined") {
    return DEFAULT_SATISFACTION_CONFIG;
  }
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return DEFAULT_SATISFACTION_CONFIG;
    }
    const parsed = JSON.parse(rawData);
    return {
      ...DEFAULT_SATISFACTION_CONFIG,
      ...parsed,
      questionTitle: parsed.questionTitle || DEFAULT_SATISFACTION_CONFIG.questionTitle,
      questionFontSize: typeof parsed.questionFontSize === "number" ? parsed.questionFontSize : 36,
      questionSubtitle: parsed.questionSubtitle || DEFAULT_SATISFACTION_CONFIG.questionSubtitle,
      subtitleFontSize: typeof parsed.subtitleFontSize === "number" ? parsed.subtitleFontSize : 18,
      emojiSize: typeof parsed.emojiSize === "number" ? parsed.emojiSize : 160,
      labelFontSize: typeof parsed.labelFontSize === "number" ? parsed.labelFontSize : 20,
      gridMaxWidth: typeof parsed.gridMaxWidth === "number" ? parsed.gridMaxWidth : 900,
      duplicateVoteMinutes: typeof parsed.duplicateVoteMinutes === "number" ? parsed.duplicateVoteMinutes : 30,
      autoResetSeconds: typeof parsed.autoResetSeconds === "number" ? parsed.autoResetSeconds : 4,
      modalMaxWidth: typeof parsed.modalMaxWidth === "number" ? parsed.modalMaxWidth : 650,
      thankYouIconSize: typeof parsed.thankYouIconSize === "number" ? parsed.thankYouIconSize : 80,
      thankYouFontSizeTh: typeof parsed.thankYouFontSizeTh === "number" ? parsed.thankYouFontSizeTh : 28,
      thankYouFontSizeEn: typeof parsed.thankYouFontSizeEn === "number" ? parsed.thankYouFontSizeEn : 16,
    };
  } catch (error) {
    console.error("Error reading satisfaction config from localStorage:", error);
    return DEFAULT_SATISFACTION_CONFIG;
  }
}

/**
 * บันทึกการตั้งค่าแบบประเมินลง LocalStorage และกระจาย Event ให้หน้า Kiosk อัปเดตทันที
 */
export function saveStoredSatisfactionConfig(config: SatisfactionConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("csat_satisfaction_settings_updated"));
  } catch (error) {
    console.error("Error writing satisfaction config to localStorage:", error);
  }
}
