"use client";

import { useState, useEffect } from "react";
import { satisfactionService } from "@/Services/satisfactionService";
import {
  SatisfactionConfig,
  DEFAULT_SATISFACTION_CONFIG,
  getStoredSatisfactionConfig,
} from "@/Lib/satisfactionSettings";

export type SentimentLevel = "sad" | "neutral" | "happy";

export function useSatisfactionVote() {
  const [satisfactionConfig, setSatisfactionConfig] = useState<SatisfactionConfig>(DEFAULT_SATISFACTION_CONFIG);
  const [isThankModalOpen, setIsThankModalOpen] = useState<boolean>(false);
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentLevel | null>(null);
  const [isProcessingVote, setIsProcessingVote] = useState<boolean>(false);
  const [hoveredLevel, setHoveredLevel] = useState<SentimentLevel | null>(null);

  // โหลดค่า config และ sync เมื่อมีการตั้งค่าใหม่จากหลังบ้าน
  useEffect(() => {
    const loadConfig = () => setSatisfactionConfig(getStoredSatisfactionConfig());
    loadConfig();

    window.addEventListener("csat_satisfaction_settings_updated", loadConfig);
    return () => window.removeEventListener("csat_satisfaction_settings_updated", loadConfig);
  }, []);

  // บันทึกผลคะแนนและเปิดหน้าต่างขอบคุณ
  const handleVoteClick = (level: SentimentLevel) => {
    setIsProcessingVote(true);
    setSelectedSentiment(level);

    // Map: happy -> 1, neutral -> 2, sad -> 3
    const sentimentNumber = level === "happy" ? 1 : level === "neutral" ? 2 : 3;

    void satisfactionService.submitVote({
      sentiment: sentimentNumber,
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      setIsThankModalOpen(true);
    }, 200);
  };

  const handleCloseModal = () => {
    setIsThankModalOpen(false);
    setSelectedSentiment(null);
    setIsProcessingVote(false);
  };

  const sentimentLabels: Record<SentimentLevel, string> = {
    sad: satisfactionConfig.labelSad || "แย่",
    neutral: satisfactionConfig.labelNeutral || "ปานกลาง",
    happy: satisfactionConfig.labelHappy || "ดีเยี่ยม",
  };

  const sentimentIcons: Record<SentimentLevel, string> = {
    sad: satisfactionConfig.iconSad || "sentiment_dissatisfied",
    neutral: satisfactionConfig.iconNeutral || "sentiment_neutral",
    happy: satisfactionConfig.iconHappy || "sentiment_satisfied",
  };

  return {
    satisfactionConfig,
    isThankModalOpen,
    selectedSentiment,
    isProcessingVote,
    hoveredLevel,
    setHoveredLevel,
    handleVoteClick,
    handleCloseModal,
    dynamicEmojiSize: Number(satisfactionConfig.emojiSize) || 160,
    dynamicFontSize: Number(satisfactionConfig.labelFontSize) || 20,
    dynamicGridWidth: Number(satisfactionConfig.gridMaxWidth) || 900,
    sentimentLabels,
    sentimentIcons,
  };
}
