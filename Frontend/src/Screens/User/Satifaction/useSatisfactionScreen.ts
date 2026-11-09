"use client";

import { useState, useEffect } from "react";
import {
  SatisfactionConfig,
  DEFAULT_SATISFACTION_CONFIG,
  getStoredSatisfactionConfig,
} from "@/Lib/satisfactionSettings";

export interface UseSatisfactionScreenReturn {
  satisfactionConfig: SatisfactionConfig;
  dynamicQuestionTitle: string;
  dynamicQuestionFontSize: number;
  dynamicSubtitle: string;
  dynamicSubtitleFontSize: number;
}

/**
 * 🪝 useSatisfactionScreen
 * 
 * Colocated Hook ประจำหน้าจอ SatisfactionScreen (Kiosk UI)
 * จัดการโหลดและดักจับการเปลี่ยนแปลง Configuration ของแบบสอบถามความพึงพอใจ
 */
export function useSatisfactionScreen(): UseSatisfactionScreenReturn {
  const [satisfactionConfig, setSatisfactionConfig] = useState<SatisfactionConfig>(
    DEFAULT_SATISFACTION_CONFIG
  );

  useEffect(() => {
    const loadConfig = () => {
      setSatisfactionConfig(getStoredSatisfactionConfig());
    };

    loadConfig();

    const handleSettingsUpdated = () => loadConfig();
    window.addEventListener("csat_satisfaction_settings_updated", handleSettingsUpdated);

    return () => {
      window.removeEventListener("csat_satisfaction_settings_updated", handleSettingsUpdated);
    };
  }, []);

  const dynamicQuestionTitle =
    satisfactionConfig.questionTitle || "ท่านมีความพึงพอใจกับการบริการในวันนี้อย่างไร?";
  const dynamicQuestionFontSize = Number(satisfactionConfig.questionFontSize) || 36;

  const dynamicSubtitle =
    satisfactionConfig.questionSubtitle || "โปรดประเมินความพึงพอใจจากตัวเลือกด้านล่าง";
  const dynamicSubtitleFontSize = Number(satisfactionConfig.subtitleFontSize) || 18;

  return {
    satisfactionConfig,
    dynamicQuestionTitle,
    dynamicQuestionFontSize,
    dynamicSubtitle,
    dynamicSubtitleFontSize,
  };
}
