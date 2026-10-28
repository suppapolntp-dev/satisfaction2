"use client";

import React from "react";
import {
  SentimentTimelinePoint,
  TimelineRangeOption,
  useSentimentTimelineChart,
} from "./useSentimentTimelineChart";

export interface SentimentTimelineChartProps {
  data?: SentimentTimelinePoint[] | null;
  ranges?: TimelineRangeOption[];
  defaultRangeId?: string;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function SentimentTimelineChart({
  data = null,
  ranges,
  defaultRangeId = "standard",
  isLoading = false,
  title = "Sentiment Score Timeline",
  subtitle = "Hourly satisfaction distribution across operating hours",
  className = "",
}: SentimentTimelineChartProps) {
  const {
    selectedRangeId,
    setSelectedRangeId,
    ranges: availableRanges,
    timelinePoints,
    isEmpty,
    summary,
    hoveredPointIndex,
    setHoveredPointIndex,
    getCoordinates,
  } = useSentimentTimelineChart({
    data,
    ranges,
    defaultRangeId,
    isLoading,
  });

  const width = 760;
  const height = 230;
  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 25;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const yTicks = [0, 25, 50, 75, 100];
  const stepX =
    timelinePoints.length > 1 ? chartWidth / (timelinePoints.length - 1) : 0;

  const happyCurve = getCoordinates(
    timelinePoints.map((p) => p.happy),
    chartWidth,
    chartHeight,
    paddingLeft,
    paddingTop,
    paddingBottom
  );

  const neutralCurve = getCoordinates(
    timelinePoints.map((p) => p.neutral),
    chartWidth,
    chartHeight,
    paddingLeft,
    paddingTop,
    paddingBottom
  );

  const sadCurve = getCoordinates(
    timelinePoints.map((p) => p.sad),
    chartWidth,
    chartHeight,
    paddingLeft,
    paddingTop,
    paddingBottom
  );

  const activePoint =
    hoveredPointIndex !== null ? timelinePoints[hoveredPointIndex] : null;

  return (
    <div
      className={`bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex flex-col justify-between ${className}`}
    >
      {/* ─── Header & Setting Controls ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
          <label
            htmlFor="timeline-range-select"
            className="text-[11px] font-medium text-slate-500 shrink-0"
          >
            Operating Hours:
          </label>
          <select
            id="timeline-range-select"
            value={selectedRangeId}
            onChange={(e) => setSelectedRangeId(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-1"
          >
            {availableRanges.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Legend & Summary Metrics ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-emerald-700">
            <span className="w-4 h-0.5 rounded-full bg-emerald-600" />
            <span>Happy (ดี)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-amber-700">
            <span className="w-4 h-0.5 rounded-full bg-amber-500" />
            <span>Neutral (ปานกลาง)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-rose-700">
            <span className="w-4 h-0.5 rounded-full bg-rose-600" />
            <span>Sad (ต้องปรับปรุง)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Average Score:{" "}
          <span className="text-emerald-600 font-semibold">
            {summary.avgHappy}
          </span>{" "}
          /{" "}
          <span className="text-amber-600 font-semibold">
            {summary.avgNeutral}
          </span>{" "}
          /{" "}
          <span className="text-rose-600 font-semibold">{summary.avgSad}</span>
        </div>
      </div>

      {/* ─── SVG Chart Area ─── */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-50/50 border border-slate-100 p-2">
        {isLoading ? (
          <div className="h-[230px] flex items-center justify-center text-xs text-slate-400">
            Loading timeline telemetry...
          </div>
        ) : isEmpty ? (
          <div className="h-[230px] flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-600">
              No Timeline Data Available
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Awaiting telemetry synchronization for current operating schedule
            </p>
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-[230px] overflow-visible"
            >
              {/* Grid Lines & Y-ticks */}
              {yTicks.map((tick) => {
                const y = paddingTop + chartHeight - (tick / 100) * chartHeight;
                return (
                  <g key={`y-${tick}`}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke={tick === 0 ? "#cbd5e1" : "#f1f5f9"}
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                      className="select-none font-mono"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Target Baseline Reference Line (80% CSAT Goal) */}
              <line
                x1={paddingLeft}
                y1={paddingTop + chartHeight - 0.8 * chartHeight}
                x2={width - paddingRight}
                y2={paddingTop + chartHeight - 0.8 * chartHeight}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />

              {/* X Time Labels */}
              {timelinePoints.map((point, i) => {
                const x = paddingLeft + i * stepX;
                return (
                  <text
                    key={`x-${point.time}`}
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#94a3b8"
                    className="select-none font-mono"
                  >
                    {point.time}
                  </text>
                );
              })}

              {/* Multi-line Paths */}
              {happyCurve.d && (
                <path
                  d={happyCurve.d}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {neutralCurve.d && (
                <path
                  d={neutralCurve.d}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {sadCurve.d && (
                <path
                  d={sadCurve.d}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points & Hover hit areas */}
              {timelinePoints.map((point, i) => {
                const x = paddingLeft + i * stepX;
                const happyY = happyCurve.points[i]?.y;
                const neutralY = neutralCurve.points[i]?.y;
                const sadY = sadCurve.points[i]?.y;

                return (
                  <g key={`hit-${point.time}`}>
                    {/* Transparent Hit Area for Easy Touch/Hover */}
                    <rect
                      x={x - (stepX > 0 ? stepX / 2 : 15)}
                      y={paddingTop}
                      width={stepX > 0 ? stepX : 30}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />

                    {/* Point Circles */}
                    {happyY !== undefined && (
                      <circle
                        cx={x}
                        cy={happyY}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#059669"
                        strokeWidth="2"
                        className="pointer-events-none"
                      />
                    )}
                    {neutralY !== undefined && (
                      <circle
                        cx={x}
                        cy={neutralY}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#d97706"
                        strokeWidth="2"
                        className="pointer-events-none"
                      />
                    )}
                    {sadY !== undefined && (
                      <circle
                        cx={x}
                        cy={sadY}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#dc2626"
                        strokeWidth="2"
                        className="pointer-events-none"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {activePoint && hoveredPointIndex !== null && (
              <div
                className="absolute bg-slate-900 text-white text-[11px] px-3 py-2 rounded-xl shadow-lg pointer-events-none transition-all duration-150 z-20"
                style={{
                  left: `${
                    ((paddingLeft + hoveredPointIndex * stepX) / width) * 100
                  }%`,
                  top: "16px",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="font-semibold text-slate-200 border-b border-slate-700/80 pb-1 mb-1.5 font-mono">
                  Time {activePoint.time}
                </div>
                <div className="flex flex-col gap-0.5 font-medium">
                  <div className="text-emerald-400">
                    Happy: {activePoint.happy ?? "-"}
                  </div>
                  <div className="text-amber-400">
                    Neutral: {activePoint.neutral ?? "-"}
                  </div>
                  <div className="text-rose-400">
                    Sad: {activePoint.sad ?? "-"}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
