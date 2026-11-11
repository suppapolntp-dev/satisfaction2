"use client";

import React from "react";
import SelectInput from "@/Components/Inputs/SelectInput";
import {
  SentimentTimelinePoint,
  TimelineRangeOption,
  TimelineMetricMode,
  useSentimentTimelineChart,
} from "./useSentimentTimelineChart";

export interface SentimentTimelineChartProps {
  data?: SentimentTimelinePoint[] | null;
  ranges?: TimelineRangeOption[];
  defaultRangeId?: string;
  defaultMetricMode?: TimelineMetricMode;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
  height?: number;
  curveType?: "smooth" | "straight";
  showGridLines?: boolean;
  showDataLabels?: boolean;
  className?: string;
}

export default function SentimentTimelineChart({
  data = null,
  ranges,
  defaultRangeId = "all",
  defaultMetricMode = "count",
  isLoading = false,
  errorMessage = null,
  onRetry,
  title = "Sentiment Score Timeline",
  subtitle = "การกระจายตัวของผลโหวตความพึงพอใจรายชั่วโมงเทียบกับเกณฑ์มาตรฐานองค์กร (Target CSAT ≥ 80%)",
  height = 260,
  curveType = "smooth",
  showGridLines = true,
  showDataLabels = false,
  className = "",
}: SentimentTimelineChartProps) {
  const {
    selectedRangeId,
    setSelectedRangeId,
    metricMode,
    setMetricMode,
    ranges: availableRanges,
    timelinePoints,
    isEmpty,
    yMax,
    yTicks,
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
    defaultMetricMode,
    isLoading,
    errorMessage,
  });

  const width = 760;
  const paddingLeft = 48;
  const paddingRight = 28;
  const paddingTop = 24;
  const paddingBottom = 32;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = Math.max(120, height - paddingTop - paddingBottom);

  const isPercentMode = metricMode === "percent";
  const stepX =
    timelinePoints.length > 1 ? chartWidth / (timelinePoints.length - 1) : 0;

  const happyCurve = getCoordinates(
    timelinePoints.map((p) => (isPercentMode ? p.happyPct : p.happy)),
    chartWidth,
    chartHeight,
    paddingLeft,
    paddingTop,
    yMax,
    curveType
  );

  const neutralCurve = getCoordinates(
    timelinePoints.map((p) => (isPercentMode ? p.neutralPct : p.neutral)),
    chartWidth,
    chartHeight,
    paddingLeft,
    paddingTop,
    yMax,
    curveType
  );

  const sadCurve = getCoordinates(
    timelinePoints.map((p) => (isPercentMode ? p.sadPct : p.sad)),
    chartWidth,
    chartHeight,
    paddingLeft,
    paddingTop,
    yMax,
    curveType
  );

  const activePoint =
    hoveredPointIndex !== null ? timelinePoints[hoveredPointIndex] : null;

  const focusedSlice = summary.donutSlices.find(
    (s) => s.key === focusedSeries
  );
  const centerTitle = focusedSlice
    ? `${focusedSlice.percentage}%`
    : summary.overallScore;
  const centerSubLabel = focusedSlice
    ? focusedSlice.label.split(" ")[0]
    : "ความพึงพอใจรวม";

  const rangeOptions = availableRanges.map((r) => ({
    value: r.id,
    label: r.label,
  }));

  // Clamp tooltip horizontal position so first/last hours never clip at edges
  const rawTooltipLeftPct =
    hoveredPointIndex !== null
      ? ((paddingLeft + hoveredPointIndex * stepX) / width) * 100
      : 50;
  const clampedTooltipLeftPct = Math.max(14, Math.min(86, rawTooltipLeftPct));

  return (
    <section
      className={`bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex flex-col justify-between ${className}`}
    >
      {/* ─── Header: Title (Left) & Controls Toolbar (Right) ─── */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Right Controls: Series Legend + Metric Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
          {/* Series Legend (Matching reference layout: ดี, ปานกลาง, ปรับปรุง) */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => toggleFocusSeries("happy")}
              className={`inline-flex items-center gap-1.5 cursor-pointer transition-opacity ${
                focusedSeries && focusedSeries !== "happy" ? "opacity-30" : "opacity-100"
              }`}
            >
              <span className="w-3.5 h-0.5 bg-[var(--success)] rounded-full" />
              <span>ดี</span>
            </button>
            <button
              type="button"
              onClick={() => toggleFocusSeries("neutral")}
              className={`inline-flex items-center gap-1.5 cursor-pointer transition-opacity ${
                focusedSeries && focusedSeries !== "neutral" ? "opacity-30" : "opacity-100"
              }`}
            >
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-[var(--warning)]" />
              <span>ปานกลาง</span>
            </button>
            <button
              type="button"
              onClick={() => toggleFocusSeries("sad")}
              className={`inline-flex items-center gap-1.5 cursor-pointer transition-opacity ${
                focusedSeries && focusedSeries !== "sad" ? "opacity-30" : "opacity-100"
              }`}
            >
              <span className="w-3.5 h-0.5 border-b-2 border-dotted border-[var(--error)]" />
              <span>ปรับปรุง</span>
            </button>
          </div>

          {/* Metric Mode Switcher (Count vs %) */}
          <div
            className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70"
            role="group"
            aria-label="สลับหน่วยแกน Y"
          >
            <button
              type="button"
              onClick={() => setMetricMode("count")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
                metricMode === "count"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              จำนวนโหวต
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("percent")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
                metricMode === "percent"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              สัดส่วน (%)
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid: Line Chart (Left) + Donut Breakdown (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ─── Left: Multi-line Timeline Chart (5 Complete UI States) ─── */}
        <div className="lg:col-span-8 xl:col-span-9 relative w-full rounded-xl bg-slate-50/50 border border-slate-100 p-3 sm:p-4 flex flex-col justify-between min-h-[270px]">
          {isLoading ? (
            /* STATE 2: SKELETON LOADING */
            <div className="h-[240px] flex flex-col justify-between p-2 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-3 w-32 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200" />
              </div>
              <div className="space-y-6 my-auto">
                <div className="h-px w-full bg-slate-200" />
                <div className="h-24 w-full rounded-lg bg-slate-200/70" />
                <div className="h-px w-full bg-slate-200" />
              </div>
              <div className="flex justify-between">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="h-3 w-8 rounded bg-slate-200" />
                ))}
              </div>
            </div>
          ) : errorMessage ? (
            /* STATE 5: ERROR STATE WITH RETRY */
            <div className="h-[240px] flex flex-col items-center justify-center text-center p-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                ไม่สามารถดึงข้อมูลกราฟแนวโน้มได้ชั่วคราว
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {errorMessage}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--primary-container)] text-white hover:bg-[var(--primary-hover)] transition-colors duration-150 cursor-pointer"
                >
                  ลองดึงข้อมูลใหม่อีกครั้ง
                </button>
              )}
            </div>
          ) : isEmpty ? (
            /* STATE 4: EMPTY STATE */
            <div className="h-[240px] flex flex-col items-center justify-center text-center p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">
                ยังไม่มีผลโหวตในช่วงเวลาที่เลือก
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ลองเปลี่ยนช่วงเวลาทำการ หรือเลือกตัวกรองวันที่อื่น
              </p>
            </div>
          ) : (
            /* STATE 1 & 3: DEFAULT & HOVER/FOCUS INTERACTIVE CHART */
            <>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                style={{ height: `${height}px` }}
                className="w-full overflow-visible select-none"
              >
                {/* Horizontal Grid Lines & Dynamic Y-Ticks */}
                {yTicks.map((tick) => {
                  const y =
                    paddingTop + chartHeight - (tick / yMax) * chartHeight;
                  return (
                    <g key={`y-${tick}`}>
                      {showGridLines && (
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={width - paddingRight}
                          y2={y}
                          stroke={tick === 0 ? "#cbd5e1" : "#e2e8f0"}
                          strokeWidth="1"
                        />
                      )}
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="10"
                        fill="#64748b"
                        className="font-mono tabular-nums"
                      >
                        {isPercentMode ? `${tick}%` : tick.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* Target Baseline Reference Line (80% CSAT Goal — shown in % mode) */}
                {isPercentMode && (
                  <g>
                    <line
                      x1={paddingLeft}
                      y1={paddingTop + chartHeight - 0.8 * chartHeight}
                      x2={width - paddingRight}
                      y2={paddingTop + chartHeight - 0.8 * chartHeight}
                      stroke="var(--success)"
                      strokeWidth="1.25"
                      strokeDasharray="5 4"
                      opacity="0.75"
                    />
                    <text
                      x={width - paddingRight - 4}
                      y={paddingTop + chartHeight - 0.8 * chartHeight - 5}
                      textAnchor="end"
                      fontSize="9.5"
                      fontWeight="600"
                      fill="var(--success)"
                    >
                      Target Goal 80%
                    </text>
                  </g>
                )}

                {/* Active Hover Vertical Guide Line */}
                {hoveredPointIndex !== null && (
                  <line
                    x1={paddingLeft + hoveredPointIndex * stepX}
                    y1={paddingTop}
                    x2={paddingLeft + hoveredPointIndex * stepX}
                    y2={paddingTop + chartHeight}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* X-Axis Time Labels */}
                {timelinePoints.map((point, i) => {
                  const x = paddingLeft + i * stepX;
                  return (
                    <text
                      key={`x-${point.time}`}
                      x={x}
                      y={height - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                      className="font-mono tabular-nums"
                    >
                      {point.time}
                    </text>
                  );
                })}

                {/* 3 Distinct Line Styles (Solid / Dashed / Dotted) for WCAG Accessibility */}
                {happyCurve.d && (
                  <path
                    d={happyCurve.d}
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth={focusedSeries === "happy" ? 3 : 2.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={
                      !focusedSeries || focusedSeries === "happy" ? 1 : 0.15
                    }
                    className="transition-opacity duration-150"
                  />
                )}
                {neutralCurve.d && (
                  <path
                    d={neutralCurve.d}
                    fill="none"
                    stroke="var(--warning)"
                    strokeWidth={focusedSeries === "neutral" ? 3 : 2.25}
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={
                      !focusedSeries || focusedSeries === "neutral" ? 1 : 0.15
                    }
                    className="transition-opacity duration-150"
                  />
                )}
                {sadCurve.d && (
                  <path
                    d={sadCurve.d}
                    fill="none"
                    stroke="var(--error)"
                    strokeWidth={focusedSeries === "sad" ? 3 : 2.25}
                    strokeDasharray="2 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={
                      !focusedSeries || focusedSeries === "sad" ? 1 : 0.15
                    }
                    className="transition-opacity duration-150"
                  />
                )}

                {/* Data Points & Keyboard-Accessible Hit Columns */}
                {timelinePoints.map((point, i) => {
                  const x = paddingLeft + i * stepX;
                  const happyY = happyCurve.points[i]?.y;
                  const neutralY = neutralCurve.points[i]?.y;
                  const sadY = sadCurve.points[i]?.y;
                  const isHovered = hoveredPointIndex === i;

                  return (
                    <g key={`hit-${point.time}`}>
                      {happyY !== undefined &&
                        (!focusedSeries || focusedSeries === "happy") && (
                          <>
                            <circle
                              cx={x}
                              cy={happyY}
                              r={isHovered || focusedSeries === "happy" ? 4.5 : 3.25}
                              fill="#ffffff"
                              stroke="var(--success)"
                              strokeWidth="2"
                              className="pointer-events-none"
                            />
                            {showDataLabels && (
                              <text
                                x={x}
                                y={happyY - 7}
                                textAnchor="middle"
                                fontSize="9"
                                fill="var(--success)"
                                fontWeight="600"
                                className="font-mono pointer-events-none select-none"
                              >
                                {isPercentMode ? `${point.happyPct}%` : point.happy}
                              </text>
                            )}
                          </>
                        )}
                      {neutralY !== undefined &&
                        (!focusedSeries || focusedSeries === "neutral") && (
                          <circle
                            cx={x}
                            cy={neutralY}
                            r={isHovered || focusedSeries === "neutral" ? 4.5 : 3.25}
                            fill="#ffffff"
                            stroke="var(--warning)"
                            strokeWidth="2"
                            className="pointer-events-none"
                          />
                        )}
                      {sadY !== undefined &&
                        (!focusedSeries || focusedSeries === "sad") && (
                          <circle
                            cx={x}
                            cy={sadY}
                            r={isHovered || focusedSeries === "sad" ? 4.5 : 3.25}
                            fill="#ffffff"
                            stroke="var(--error)"
                            strokeWidth="2"
                            className="pointer-events-none"
                          />
                        )}

                      {/* Keyboard & Pointer Accessible Column Hit Box */}
                      <rect
                        x={x - (stepX > 0 ? stepX / 2 : 16)}
                        y={paddingTop}
                        width={stepX > 0 ? stepX : 32}
                        height={chartHeight}
                        fill="transparent"
                        tabIndex={0}
                        role="button"
                        aria-label={`เวลา ${point.time} ดี ${point.happy} ปานกลาง ${point.neutral} ปรับปรุง ${point.sad}`}
                        className="cursor-pointer outline-none focus-visible:stroke-blue-600"
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        onFocus={() => setHoveredPointIndex(i)}
                        onBlur={() => setHoveredPointIndex(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Clamped Hover Tooltip Overlay */}
              {activePoint && hoveredPointIndex !== null && (
                <div
                  className="absolute bg-slate-900/95 text-white text-[11px] px-3.5 py-2.5 rounded-xl shadow-lg pointer-events-none z-20 min-w-[180px] border border-slate-700"
                  style={{
                    left: `${clampedTooltipLeftPct}%`,
                    top: "12px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-1 mb-1.5 font-mono tabular-nums">
                    <span className="font-semibold text-slate-200">
                      เวลา {activePoint.time} น.
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                      CSAT {activePoint.happyPct}%
                    </span>
                  </div>
                  <div className="space-y-1 font-mono tabular-nums">
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>ดี:</span>
                      <span className="font-semibold">
                        {activePoint.happy.toLocaleString()} ({activePoint.happyPct}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-amber-400">
                      <span>ปานกลาง:</span>
                      <span className="font-semibold">
                        {activePoint.neutral.toLocaleString()} ({activePoint.neutralPct}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-rose-400">
                      <span>ปรับปรุง:</span>
                      <span className="font-semibold">
                        {activePoint.sad.toLocaleString()} ({activePoint.sadPct}%)
                      </span>
                    </div>
                    <div className="pt-1 mt-1 border-t border-slate-800 flex justify-between text-slate-300 text-[10px]">
                      <span>โหวตรวมชั่วโมงนี้:</span>
                      <span className="font-semibold">
                        {activePoint.total.toLocaleString()} โหวต
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Meta Caption */}
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>
                  ชี้เมาส์หรือกด{" "}
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">
                    Tab
                  </kbd>{" "}
                  บนจุดกราฟเพื่อดูรายละเอียดรายชั่วโมง
                </span>
                <span className="font-mono tabular-nums">
                  เพดานแกน Y:{" "}
                  <strong className="font-semibold text-slate-700">
                    {isPercentMode ? "100%" : `${yMax.toLocaleString()} โหวต`}
                  </strong>
                </span>
              </div>
            </>
          )}
        </div>

        {/* ─── Right: Corrected Donut Chart Breakdown ─── */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-slate-50/50 border border-slate-100 min-h-[270px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-between h-full py-2 animate-pulse">
              <div className="h-4 w-36 rounded bg-slate-200 self-start" />
              <div className="w-32 h-32 rounded-full bg-slate-200 my-4" />
              <div className="w-full space-y-2">
                <div className="h-7 w-full rounded-lg bg-slate-200" />
                <div className="h-7 w-full rounded-lg bg-slate-200" />
                <div className="h-7 w-full rounded-lg bg-slate-200" />
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800">
                    สัดส่วนความพึงพอใจรวม
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {summary.totalVotes.toLocaleString()} โหวต
                  </span>
                </div>

                {/* SVG Donut Centerpiece */}
                <div className="relative flex items-center justify-center my-3">
                  <svg
                    width="132"
                    height="132"
                    viewBox="0 0 120 120"
                    className="transform -rotate-90 overflow-visible"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="11"
                    />

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
                          opacity={sliceOpacity}
                          className="transition-opacity duration-150 cursor-pointer"
                          onClick={() => toggleFocusSeries(slice.key)}
                        />
                      );
                    })}
                  </svg>

                  {/* Centered True CSAT Percentage */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xl font-semibold text-slate-900 leading-tight tracking-tight font-mono tabular-nums">
                      {centerTitle}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                      {centerSubLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown Stat Rows (Total Vote Count + True Share %) */}
              <div className="space-y-1.5 pt-2.5 border-t border-slate-200/70 text-xs">
                {summary.donutSlices.length > 0 ? (
                  summary.donutSlices.map((slice) => {
                    const isSelected = focusedSeries === slice.key;
                    return (
                      <button
                        type="button"
                        key={`stat-${slice.key}`}
                        onClick={() => toggleFocusSeries(slice.key)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? "bg-white shadow-2xs border border-slate-200/90 font-medium"
                            : "hover:bg-white/70 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: slice.color }}
                          />
                          <span className="text-xs text-slate-700">
                            {slice.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono tabular-nums">
                          <span className="text-xs font-semibold text-slate-900">
                            {slice.value.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 min-w-[46px] text-right">
                            {slice.percentage}%
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-3 text-center text-xs text-slate-400">
                    ไม่มีข้อมูลแสดงผล
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
