"use client";

import React from "react";
import { SentimentLevel } from "@/Components/Buttons/SatifactionButton";
import {
  SentimentVoteSummary,
  useSatisfactionDashboardCard,
} from "./useSatisfactionDashboardCard";

export interface SatisfactionAnalyticsCardProps {
  initialVotes?: SentimentVoteSummary;
  scopeTitle?: string;
  scopeTier?: string;
  className?: string;
}

interface SentimentCardConfig {
  level: SentimentLevel;
  label: string;
  sublabel: string;
  color: string;
  bgLight: string;
  borderLight: string;
  glow: string;
  badgeBg: string;
  badgeText: string;
}

const SENTIMENT_CARDS: Record<SentimentLevel, SentimentCardConfig> = {
  sad: {
    level: "sad",
    label: "แย่ (Dissatisfied)",
    sublabel: "Needs Attention",
    color: "#dc3545",
    bgLight: "bg-rose-50/70",
    borderLight: "border-rose-200/80",
    glow: "hover:shadow-[0_8px_24px_-4px_rgba(220,53,69,0.25)]",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
  },
  neutral: {
    level: "neutral",
    label: "ปานกลาง (Neutral)",
    sublabel: "Standard Service",
    color: "#d97706",
    bgLight: "bg-amber-50/70",
    borderLight: "border-amber-200/80",
    glow: "hover:shadow-[0_8px_24px_-4px_rgba(217,119,6,0.25)]",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
  },
  happy: {
    level: "happy",
    label: "ดี (Satisfied)",
    sublabel: "Target Standard",
    color: "#006e2f",
    bgLight: "bg-emerald-50/70",
    borderLight: "border-emerald-200/80",
    glow: "hover:shadow-[0_8px_24px_-4px_rgba(0,110,47,0.25)]",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
};

export default function SatisfactionAnalyticsCard({
  initialVotes,
  scopeTitle = "All Organizations",
  scopeTier = "Tier 1 (SuperAdmin)",
  className = "",
}: SatisfactionAnalyticsCardProps) {
  const { votes, activeSentiment, simulateVote } =
    useSatisfactionDashboardCard(initialVotes);

  const keys: SentimentLevel[] = ["sad", "neutral", "happy"];

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] p-5 sm:p-6 space-y-6 ${className}`}
    >
      {/* ─── Header: Card Title & Scope Context ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Customer Feedback Pulse (Live Kiosk Stream)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            จำลองและสรุปคะแนนประเมินหน้า Kiosk แบบเรียลไทม์ พร้อมยอดรวมสะสม
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            {scopeTitle}
          </span>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
            {scopeTier}
          </span>
        </div>
      </div>

      {/* ─── 3 Buttons as Dashboard Analytics Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {keys.map((level) => {
          const cfg = SENTIMENT_CARDS[level];
          const count = votes[level];
          const percentage = votes.totalVotes > 0
            ? ((count / votes.totalVotes) * 100).toFixed(1)
            : "0.0";
          const isActive = activeSentiment === level;

          return (
            <div
              key={level}
              onClick={() => simulateVote(level)}
              className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none ${cfg.bgLight} ${cfg.borderLight} ${cfg.glow} ${
                isActive ? "scale-98 ring-2 ring-emerald-500" : "hover:-translate-y-1"
              }`}
            >
              {/* Top Row: Label & Percentage Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-700">
                  {cfg.label}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}
                >
                  {percentage}%
                </span>
              </div>

              {/* Center: Emoji SVG & Prominent Count */}
              <div className="flex items-center justify-between py-2">
                <div
                  className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-white/80 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ color: cfg.color }}
                >
                  {level === "sad" && (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                    </svg>
                  )}
                  {level === "neutral" && (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="8" y1="15" x2="16" y2="15" />
                      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                    </svg>
                  )}
                  {level === "happy" && (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                    </svg>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {count.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    กดไปแล้ว (Votes)
                  </span>
                </div>
              </div>

              {/* Bottom: Sublabel hint */}
              <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>{cfg.sublabel}</span>
                <span className="text-[10px] font-semibold opacity-70 group-hover:text-slate-800">
                  แตะเพื่อทดสอบ +1 &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Bottom Footer: Total Aggregation Summary ─── */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
            CSAT
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              ยอดรวมการประเมินทั้งหมด (Total Aggregated CSAT)
            </span>
            <div className="text-sm font-bold text-slate-900">
              {votes.totalVotes.toLocaleString()} ครั้ง &middot; Net Satisfaction Score{" "}
              <span className="text-emerald-700 font-extrabold">{votes.csatPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Benchmark Target
            </span>
            <span className="font-semibold text-emerald-700">90.0% SLA Exceeded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
