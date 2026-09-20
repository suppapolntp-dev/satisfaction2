"use client";

import React, { useState, useEffect } from "react";
import { ThankModal } from "../Modals/ThankModal";
import { satisfactionService } from "@/Services/satisfactionService";
import { 
  SatisfactionConfig, 
  DEFAULT_SATISFACTION_CONFIG, 
  getStoredSatisfactionConfig 
} from "@/Lib/satisfactionSettings";

// ==========================================================================
// ─── 1. CONFIG & SENTIMENT DEFINITIONS (ภาพขีดมินิมอล ปรับขนาดได้จากระบบ)
// ==========================================================================

export type SentimentLevel = "sad" | "neutral" | "happy";

interface SentimentStyleConfig {
  level: SentimentLevel;
  label: string;
  materialIcon: string;
  themeColor: string;
  hoverBg: string;
  glowClass: string;
  textColor: string;
  borderColor: string;
}

const SENTIMENT_STYLES: Record<SentimentLevel, SentimentStyleConfig> = {
  sad: {
    level: "sad",
    label: "แย่",
    materialIcon: "sentiment_dissatisfied",
    themeColor: "#dc3545",
    hoverBg: "#fff5f5",
    glowClass: "hover:shadow-[0_0_35px_rgba(220,53,69,0.35)] active:shadow-[0_0_50px_rgba(220,53,69,0.55)]",
    textColor: "text-[#dc3545]",
    borderColor: "border-[#dc3545]/30 hover:border-[#dc3545] active:border-[#dc3545]",
  },
  neutral: {
    level: "neutral",
    label: "ปานกลาง",
    materialIcon: "sentiment_neutral",
    themeColor: "#ffc107",
    hoverBg: "#fffdf0",
    glowClass: "hover:shadow-[0_0_35px_rgba(255,193,7,0.4)] active:shadow-[0_0_50px_rgba(255,193,7,0.6)]",
    textColor: "text-[#d97706]",
    borderColor: "border-[#ffc107]/40 hover:border-[#ffc107] active:border-[#ffc107]",
  },
  happy: {
    level: "happy",
    label: "ดี",
    materialIcon: "sentiment_satisfied",
    themeColor: "#10b981",
    hoverBg: "#f0fdf4",
    glowClass: "hover:shadow-[0_0_35px_rgba(16,185,129,0.35)] active:shadow-[0_0_50px_rgba(16,185,129,0.55)]",
    textColor: "text-[#10b981]",
    borderColor: "border-[#10b981]/30 hover:border-[#10b981] active:border-[#10b981]",
  },
};

const SENTIMENT_KEYS: SentimentLevel[] = ["sad", "neutral", "happy"];

// ==========================================================================
// ─── 2. MAIN SATISFACTION BUTTON COMPONENT
// ==========================================================================

export function BtnSatisfaction() {
  const [satisfactionConfig, setSatisfactionConfig] = useState<SatisfactionConfig>(DEFAULT_SATISFACTION_CONFIG);
  const [isThankModalOpen, setIsThankModalOpen] = useState<boolean>(false);
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentLevel | null>(null);
  const [isProcessingVote, setIsProcessingVote] = useState<boolean>(false);
  const [hoveredLevel, setHoveredLevel] = useState<SentimentLevel | null>(null);

  // ดึงค่าการตั้งค่าจาก LocalStorage และรับการอัปเดตแบบเรียลไทม์
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

  // ฟังก์ชันเมื่อผู้ใช้แตะปุ่มประเมิน
  const handleVoteClick = async (level: SentimentLevel) => {
    setIsProcessingVote(true);
    setSelectedSentiment(level);

    // Map level: "happy" -> 1 (Positive), "neutral" -> 2 (Neutral), "sad" -> 3 (Negative)
    const sentimentNumber = level === "happy" ? 1 : level === "neutral" ? 2 : 3;

    try {
      await satisfactionService.submitVote({
        sentiment: sentimentNumber,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to submit vote:", err);
    }

    setTimeout(() => {
      setIsThankModalOpen(true);
    }, 200);
  };

  const handleCloseModal = () => {
    setIsThankModalOpen(false);
    setSelectedSentiment(null);
    setIsProcessingVote(false);
  };

  const dynamicEmojiSize = Number(satisfactionConfig.emojiSize) || 160;
  const dynamicFontSize = Number(satisfactionConfig.labelFontSize) || 20;
  const dynamicGridWidth = Number(satisfactionConfig.gridMaxWidth) || 900;

  return (
    <>
      {/* ─── Grid 3 ปุ่มกดความพึงพอใจสัดส่วนลงตัว (ความกว้างกำหนดได้จากระบบ) ─── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 w-full px-4 mx-auto"
        style={{ 
          maxWidth: `${dynamicGridWidth}px`,
          pointerEvents: isProcessingVote ? "none" : "auto" 
        }}
      >
        {SENTIMENT_KEYS.map((level) => {
          const config = SENTIMENT_STYLES[level];
          const isSelected = selectedSentiment === level;
          const isHovered = hoveredLevel === level;

          return (
            <div key={level} className="w-full flex justify-center">
              <button
                type="button"
                onClick={() => handleVoteClick(level)}
                onMouseEnter={() => setHoveredLevel(level)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`w-full flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 rounded-3xl border-3 bg-white select-none cursor-pointer transition-all duration-300 group touch-manipulation relative overflow-hidden ${
                  config.borderColor
                } ${config.glowClass} ${
                  isSelected
                    ? "scale-95 ring-4 shadow-2xl"
                    : isHovered
                    ? "-translate-y-2 scale-102"
                    : "hover:-translate-y-1.5"
                }`}
                style={{
                  backgroundColor: isSelected || isHovered ? config.hoverBg : "#ffffff",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* ไอคอนภาพขีดเส้น Material Minimalist Icon ปรับขนาดตรงตามพิกเซล (ค่าตั้งต้น 160px) */}
                <div className="mb-4 pointer-events-none flex items-center justify-center flex-1">
                  <span
                    className={`material-symbols-outlined transition-all duration-300 leading-none block select-none ${
                      isSelected || isHovered ? config.textColor : "text-neutral-400 group-hover:" + config.textColor
                    }`}
                    style={{
                      fontSize: `${dynamicEmojiSize}px`,
                      fontVariationSettings: "'FILL' 0, 'wght' 250, 'GRAD' 0, 'opsz' 48",
                      color: isSelected || isHovered ? config.themeColor : undefined,
                    }}
                  >
                    {config.materialIcon}
                  </span>
                </div>

                {/* ข้อความกำกับ: แย่ / ปานกลาง / ดี ขนาดตรงตามพิกเซล (ค่าตั้งต้น 20px) */}
                <span
                  className={`font-bold tracking-tight transition-colors duration-300 select-none ${
                    isSelected || isHovered ? config.textColor : "text-neutral-600"
                  }`}
                  style={{
                    fontSize: `${dynamicFontSize}px`,
                    color: isSelected || isHovered ? config.themeColor : undefined,
                  }}
                >
                  {config.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* ─── Thank You Modal (ส่งค่าทั้งหมดจาก System Settings) ─── */}
      <ThankModal
        isOpen={isThankModalOpen}
        onClose={handleCloseModal}
        thankYouMessageTh={satisfactionConfig.thankYouMessageTh}
        thankYouMessageEn={satisfactionConfig.thankYouMessageEn}
        autoResetSeconds={satisfactionConfig.autoResetSeconds}
        modalMaxWidth={satisfactionConfig.modalMaxWidth}
        thankYouIconSize={satisfactionConfig.thankYouIconSize}
        thankYouFontSizeTh={satisfactionConfig.thankYouFontSizeTh}
        thankYouFontSizeEn={satisfactionConfig.thankYouFontSizeEn}
      />
    </>
  );
}