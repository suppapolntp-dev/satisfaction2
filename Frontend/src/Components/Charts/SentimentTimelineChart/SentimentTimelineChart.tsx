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
    focusedSeries,
    toggleFocusSeries,
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
      {/* ─── Header: Title (Left) & Focus Buttons (Right - "วงซ้ายย้ายไปชิดขวา") ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Legend Focus Buttons ("วงซ้ายย้ายไปชิดขวา") */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => toggleFocusSeries("happy")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all border cursor-pointer ${
              focusedSeries === "happy"
                ? "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-border)] font-semibold shadow-xs"
                : "text-slate-600 hover:text-[var(--success)] hover:bg-[var(--success-bg)]/50 border-slate-200/70"
            }`}
          >
            <span className="w-3.5 h-1 rounded-full bg-[var(--success)]" />
            <span>ดี</span>
          </button>

          <button
            type="button"
            onClick={() => toggleFocusSeries("neutral")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all border cursor-pointer ${
              focusedSeries === "neutral"
                ? "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-border)] font-semibold shadow-xs"
                : "text-slate-600 hover:text-[var(--warning)] hover:bg-[var(--warning-bg)]/50 border-slate-200/70"
            }`}
          >
            <span className="w-3.5 h-1 rounded-full bg-[var(--warning)]" />
            <span>ปานกลาง</span>
          </button>

          <button
            type="button"
            onClick={() => toggleFocusSeries("sad")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all border cursor-pointer ${
              focusedSeries === "sad"
                ? "bg-[var(--error-bg)] text-[var(--error)] border-[var(--error-border)] font-semibold shadow-xs"
                : "text-slate-600 hover:text-[var(--error)] hover:bg-[var(--error-bg)]/50 border-slate-200/70"
            }`}
          >
            <span className="w-3.5 h-1 rounded-full bg-[var(--error)]" />
            <span>ปรับปรุง</span>
          </button>

          {focusedSeries && (
            <button
              type="button"
              onClick={() => toggleFocusSeries(focusedSeries)}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1 cursor-pointer"
            >
              แสดงทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* ─── Main Content Grid: Line Chart (Left) + Donut Breakdown (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ─── Left: Multi-line Timeline Chart ─── */}
        <div className="lg:col-span-8 xl:col-span-9 relative w-full overflow-hidden rounded-2xl bg-slate-50/50 border border-slate-100 p-2 flex flex-col justify-center">
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
                stroke="var(--success)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
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

              {/* Multi-line Paths with Dynamic Series Focus */}
              {happyCurve.d && (
                <path
                  d={happyCurve.d}
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth={focusedSeries === "happy" ? 3.5 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={
                    !focusedSeries || focusedSeries === "happy" ? 1 : 0.15
                  }
                  className="transition-all duration-200"
                />
              )}
              {neutralCurve.d && (
                <path
                  d={neutralCurve.d}
                  fill="none"
                  stroke="var(--warning)"
                  strokeWidth={focusedSeries === "neutral" ? 3.5 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={
                    !focusedSeries || focusedSeries === "neutral" ? 1 : 0.15
                  }
                  className="transition-all duration-200"
                />
              )}
              {sadCurve.d && (
                <path
                  d={sadCurve.d}
                  fill="none"
                  stroke="var(--error)"
                  strokeWidth={focusedSeries === "sad" ? 3.5 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={!focusedSeries || focusedSeries === "sad" ? 1 : 0.15}
                  className="transition-all duration-200"
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
                    {happyY !== undefined &&
                      (!focusedSeries || focusedSeries === "happy") && (
                        <circle
                          cx={x}
                          cy={happyY}
                          r={focusedSeries === "happy" ? 4.5 : 3.5}
                          fill="#ffffff"
                          stroke="var(--success)"
                          strokeWidth={focusedSeries === "happy" ? 2.5 : 2}
                          className="pointer-events-none transition-all duration-200"
                        />
                      )}
                    {neutralY !== undefined &&
                      (!focusedSeries || focusedSeries === "neutral") && (
                        <circle
                          cx={x}
                          cy={neutralY}
                          r={focusedSeries === "neutral" ? 4.5 : 3.5}
                          fill="#ffffff"
                          stroke="var(--warning)"
                          strokeWidth={focusedSeries === "neutral" ? 2.5 : 2}
                          className="pointer-events-none transition-all duration-200"
                        />
                      )}
                    {sadY !== undefined &&
                      (!focusedSeries || focusedSeries === "sad") && (
                        <circle
                          cx={x}
                          cy={sadY}
                          r={focusedSeries === "sad" ? 4.5 : 3.5}
                          fill="#ffffff"
                          stroke="var(--error)"
                          strokeWidth={focusedSeries === "sad" ? 2.5 : 2}
                          className="pointer-events-none transition-all duration-200"
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
                  <div
                    className={`text-[var(--success)] transition-opacity ${
                      focusedSeries && focusedSeries !== "happy"
                        ? "opacity-40"
                        : "opacity-100 font-semibold"
                    }`}
                  >
                    ดี: {activePoint.happy ?? "-"}
                  </div>
                  <div
                    className={`text-[var(--warning)] transition-opacity ${
                      focusedSeries && focusedSeries !== "neutral"
                        ? "opacity-40"
                        : "opacity-100 font-semibold"
                    }`}
                  >
                    ปานกลาง: {activePoint.neutral ?? "-"}
                  </div>
                  <div
                    className={`text-[var(--error)] transition-opacity ${
                      focusedSeries && focusedSeries !== "sad"
                        ? "opacity-40"
                        : "opacity-100 font-semibold"
                    }`}
                  >
                    ปรับปรุง: {activePoint.sad ?? "-"}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>

        {/* ─── Right: Donut Chart Breakdown ("วงขวาทำลงมาเป็นกราฟโดนัท แทน") ─── */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between p-4 rounded-2xl bg-slate-50/60 border border-slate-100/90">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800">
                คะแนนเฉลี่ยภาพรวม
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                CSAT Metric
              </span>
            </div>

            {/* SVG Donut Centerpiece */}
            <div className="relative flex items-center justify-center my-3">
              <svg
                width="130"
                height="130"
                viewBox="0 0 120 120"
                className="transform -rotate-90 overflow-visible"
              >
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                />

                {/* Slices */}
                {summary.donutSlices.map((slice) => {
                  const isSliceFocused = focusedSeries === slice.key;
                  const isAnyFocused = focusedSeries !== null;
                  const sliceOpacity = isAnyFocused
                    ? isSliceFocused
                      ? 1
                      : 0.2
                    : 1;
                  const sliceStrokeWidth = isSliceFocused ? 14 : 11;

                  return (
                    <circle
                      key={`donut-${slice.key}`}
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={sliceStrokeWidth}
                      strokeDasharray={slice.dashArray}
                      strokeDashoffset={slice.dashOffset}
                      strokeLinecap="round"
                      opacity={sliceOpacity}
                      className="transition-all duration-200 cursor-pointer"
                      onClick={() => toggleFocusSeries(slice.key)}
                    />
                  );
                })}
              </svg>

              {/* Centered CSAT Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-lg font-bold text-slate-800 leading-tight tracking-tight">
                  {summary.overallScore}
                </span>
                <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                  ความพึงพอใจ
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Stat Rows */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
            {summary.donutSlices.length > 0 ? (
              summary.donutSlices.map((slice) => {
                const isSelected = focusedSeries === slice.key;
                return (
                  <div
                    key={`stat-${slice.key}`}
                    onClick={() => toggleFocusSeries(slice.key)}
                    className={`flex items-center justify-between p-1.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white shadow-xs border border-slate-200/80 font-medium"
                        : "hover:bg-slate-100/70 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {slice.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 font-mono">
                        {slice.value}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded-md bg-slate-100">
                        {slice.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-3 text-center text-xs text-slate-400">
                ไม่มีข้อมูลแสดงผล
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
