"use client";

import React from "react";
import { LiveVoteItem } from "@/Types/dashboard";

export interface LiveKioskVoteFeedListProps {
  items: LiveVoteItem[];
  isLoading?: boolean;
  canViewFeed?: boolean;
  scopeLabel?: string;
  maxItems?: number;
  className?: string;
}

export default function LiveKioskVoteFeedList({
  items,
  isLoading = false,
  canViewFeed = true,
  scopeLabel = "All Branches",
  maxItems = 5,
  className = "",
}: LiveKioskVoteFeedListProps) {
  return (
    <div
      className={`bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex flex-col justify-between h-full ${className}`}
    >
      <div>
        {/* ─── Header ─── */}
        <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Real-Time Kiosk Vote Stream
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              รายการผลโหวตล่าสุดจากหน้าจอตู้ Kiosk ภายใต้สิทธิ์ ({scopeLabel})
            </p>
          </div>
        </div>

        {/* ─── Body (Permission Check / Loading / Empty / Feed List) ─── */}
        {!canViewFeed ? (
          <div className="py-10 px-4 text-center rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-medium text-slate-700">
              บัญชีนี้ไม่มีสิทธิ์เข้าถึงฟีดผลโหวตระดับตู้ Kiosk
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              ต้องการสิทธิ์ <code className="font-mono">canViewBranchKiosksGrid</code> หรือโมดูล <code className="font-mono">DASHBOARD</code>
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2.5 animate-pulse">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-14 w-full rounded-xl bg-slate-100 border border-slate-200/50"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 px-4 text-center rounded-xl bg-slate-50/60 border border-slate-100">
            <p className="text-xs font-medium text-slate-600">
              ยังไม่มีรายการโหวตสดในขอบเขตที่เลือก
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              เมื่อลูกค้ากดโหวตที่หน้าตู้ Kiosk รายการจะแสดงที่นี่ทันที
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.slice(0, maxItems).map((item) => {
              const isSatisfied = item.sentiment === "satisfied";
              const isNeutral = item.sentiment === "neutral";

              const sentimentColor = isSatisfied
                ? "text-emerald-700"
                : isNeutral
                ? "text-amber-700"
                : "text-rose-700";

              const dotColor = isSatisfied
                ? "bg-emerald-500"
                : isNeutral
                ? "bg-amber-500"
                : "bg-rose-500";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 transition-colors duration-150"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-900 truncate">
                        {item.branchName}
                      </span>
                      {item.brandName && (
                        <span className="text-[11px] font-medium text-slate-500 shrink-0">
                          · {item.brandName}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5 truncate">
                      {item.kioskCode || "Kiosk"} · {item.time ? `${item.time} น.` : "เมื่อสักครู่"}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium ${sentimentColor}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    <span>{item.scoreText}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Footer Meta ─── */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          กรองตามสิทธิ์ <span className="font-medium text-slate-700">{scopeLabel}</span>
        </span>
        <span className="font-mono tabular-nums">
          แสดง {Math.min(items.length, 6)} รายการล่าสุด
        </span>
      </div>
    </div>
  );
}
