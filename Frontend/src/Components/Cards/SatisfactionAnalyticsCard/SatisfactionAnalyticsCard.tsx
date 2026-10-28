"use client";

import React, { useState, useEffect } from "react";
import { SentimentLevel } from "@/Components/Buttons/SatifactionButton";
import {
  SentimentVoteSummary,
  useSatisfactionDashboardCard,
} from "./useSatisfactionDashboardCard";
import {
  SatisfactionConfig,
  DEFAULT_SATISFACTION_CONFIG,
  getStoredSatisfactionConfig,
} from "@/Lib/satisfactionSettings";

export interface SatisfactionAnalyticsCardProps {
  initialVotes?: SentimentVoteSummary;
  scopeTitle?: string;
  scopeTier?: string;
  className?: string;
}

interface SentimentCardConfig {
  level: SentimentLevel;
  sublabel: string;
  color: string;
  bgLight: string;
  borderLight: string;
  badgeBg: string;
  badgeText: string;
}

const SENTIMENT_CARDS: Record<SentimentLevel, SentimentCardConfig> = {
  sad: {
    level: "sad",
    sublabel: "Needs Attention",
    color: "var(--error)",
    bgLight: "bg-[var(--error-bg)]/70",
    borderLight: "border-[var(--error-border)]/80",
    badgeBg: "bg-[var(--error-bg)]",
    badgeText: "text-[var(--error)]",
  },
  neutral: {
    level: "neutral",
    sublabel: "Standard Service",
    color: "var(--warning)",
    bgLight: "bg-[var(--warning-bg)]/70",
    borderLight: "border-[var(--warning-border)]/80",
    badgeBg: "bg-[var(--warning-bg)]",
    badgeText: "text-[var(--warning)]",
  },
  happy: {
    level: "happy",
    sublabel: "Target Standard",
    color: "var(--success)",
    bgLight: "bg-[var(--success-bg)]/70",
    borderLight: "border-[var(--success-border)]/80",
    badgeBg: "bg-[var(--success-bg)]",
    badgeText: "text-[var(--success)]",
  },
};

export default function SatisfactionAnalyticsCard({
  initialVotes,
  scopeTitle = "All Organizations",
  scopeTier = "Tier 1 (SuperAdmin)",
  className = "",
}: SatisfactionAnalyticsCardProps) {
  const { votes } = useSatisfactionDashboardCard(initialVotes);
  const [satisfactionConfig, setSatisfactionConfig] = useState<SatisfactionConfig>(DEFAULT_SATISFACTION_CONFIG);

  useEffect(() => {
    const loadConfig = () => setSatisfactionConfig(getStoredSatisfactionConfig());
    loadConfig();

    window.addEventListener("csat_satisfaction_settings_updated", loadConfig);
    return () => window.removeEventListener("csat_satisfaction_settings_updated", loadConfig);
  }, []);

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

  const keys: SentimentLevel[] = ["sad", "neutral", "happy"];

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] p-5 sm:p-6 space-y-6 ${className}`}
    >
      {/* ─── Header: Card Title & Scope Context ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary-container)] animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Customer Feedback Pulse (Live Kiosk Stream)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            สรุปคะแนนประเมินความพึงพอใจแต่ละระดับ พร้อมยอดรวมสะสม
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-bg)] text-[var(--primary-container)] border border-[var(--accent-light)]">
            {scopeTitle}
          </span>
          {scopeTier && (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              {scopeTier.replace(/Tier\s*\d+\s*\((.*?)\)/, "$1").replace(/Tier\s*\d+/, "").trim() || scopeTier}
            </span>
          )}
        </div>
      </div>

      {/* ─── 4 Dashboard Analytics Summary Cards (Total + 3 Sentiments) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Votes Card */}
        <div
          className="relative flex flex-col justify-between p-5 rounded-2xl border select-none cursor-default bg-slate-50/80 border-slate-200/80"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-700">
              ยอดประเมินทั้งหมด (Total)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              100%
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-white/80 flex items-center justify-center text-slate-700">
              <span
                className="material-symbols-outlined text-3xl select-none leading-none"
                style={{
                  fontVariationSettings: "'FILL' 0, 'wght' 250, 'GRAD' 0, 'opsz' 48",
                }}
              >
                how_to_vote
              </span>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {(votes.totalVotes ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {keys.map((level) => {
          const cfg = SENTIMENT_CARDS[level];
          const count = votes[level] ? votes[level] : 0;
          const total = votes.totalVotes ? votes.totalVotes : 0;
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

          return (
            <div
              key={level}
              className={`relative flex flex-col justify-between p-5 rounded-2xl border select-none cursor-default ${cfg.bgLight} ${cfg.borderLight}`}
            >
              {/* Top Row: Label & Percentage Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-700">
                  {sentimentLabels[level]}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}
                >
                  {percentage}%
                </span>
              </div>

              {/* Center: Dynamic Icon from Settings & Prominent Count */}
              <div className="flex items-center justify-between py-2">
                <div
                  className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-white/80 flex items-center justify-center"
                  style={{ color: cfg.color }}
                >
                  <span
                    className="material-symbols-outlined text-3xl select-none leading-none"
                    style={{
                      fontVariationSettings: "'FILL' 0, 'wght' 250, 'GRAD' 0, 'opsz' 48",
                    }}
                  >
                    {sentimentIcons[level]}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {count.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
