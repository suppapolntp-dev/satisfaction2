"use client";

import { useState, useMemo, useCallback } from "react";

export interface SentimentTimelinePoint {
  time: string;
  happy: number;
  neutral: number;
  sad: number;
}

export interface ComputedTimelinePoint extends SentimentTimelinePoint {
  total: number;
  happyPct: number;
  neutralPct: number;
  sadPct: number;
}

export type TimelineMetricMode = "count" | "percent";

export interface TimelineRangeOption {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
}

export const DEFAULT_TIMELINE_RANGES: TimelineRangeOption[] = [
  {
    id: "all",
    label: "08:00 - 21:00 (ทุกช่วงเวลาทำการ)",
    startHour: 8,
    endHour: 21,
  },
  {
    id: "standard",
    label: "08:00 - 17:00 (เวลาทำการมาตรฐาน)",
    startHour: 8,
    endHour: 17,
  },
  {
    id: "retail",
    label: "09:00 - 19:00 (สาขาค้าปลีก)",
    startHour: 9,
    endHour: 19,
  },
  {
    id: "mall",
    label: "10:00 - 21:00 (สาขาในห้าง)",
    startHour: 10,
    endHour: 21,
  },
];

export interface UseSentimentTimelineChartProps {
  data?: SentimentTimelinePoint[] | null;
  ranges?: TimelineRangeOption[];
  defaultRangeId?: string;
  defaultMetricMode?: TimelineMetricMode;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export interface PointCoordinates {
  x: number;
  y: number;
}

export interface CurvePathResult {
  d: string;
  points: PointCoordinates[];
}

export type SentimentFocusSeries = "happy" | "neutral" | "sad" | null;

export interface DonutSlice {
  key: "happy" | "neutral" | "sad";
  label: string;
  value: number;
  percentage: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

export interface TimelineSummary {
  totalVotes: number;
  totalHappy: number;
  totalNeutral: number;
  totalSad: number;
  avgHappy: string;
  avgNeutral: string;
  avgSad: string;
  overallScore: string;
  donutSlices: DonutSlice[];
}

export function useSentimentTimelineChart({
  data = null,
  ranges = DEFAULT_TIMELINE_RANGES,
  defaultRangeId = "all",
  defaultMetricMode = "count",
  isLoading = false,
  errorMessage = null,
}: UseSentimentTimelineChartProps = {}) {
  const [selectedRangeId, setSelectedRangeId] = useState<string>(defaultRangeId);
  const [metricMode, setMetricMode] = useState<TimelineMetricMode>(defaultMetricMode);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [focusedSeries, setFocusedSeries] = useState<SentimentFocusSeries>(null);

  const toggleFocusSeries = useCallback((series: "happy" | "neutral" | "sad" | null) => {
    if (series === null) {
      setFocusedSeries(null);
      return;
    }
    setFocusedSeries((prev) => (prev === series ? null : series));
  }, []);

  const activeRange = useMemo(() => {
    return (
      ranges.find((r) => r.id === selectedRangeId) ??
      ranges[0] ??
      DEFAULT_TIMELINE_RANGES[0]
    );
  }, [ranges, selectedRangeId]);

  const expectedHours = useMemo(() => {
    const list: string[] = [];
    for (let h = activeRange.startHour; h <= activeRange.endHour; h++) {
      list.push(`${String(h).padStart(2, "0")}:00`);
    }
    return list;
  }, [activeRange]);

  const timelinePoints = useMemo<ComputedTimelinePoint[]>(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const dataMap = new Map<string, SentimentTimelinePoint>();
    data.forEach((p) => {
      dataMap.set(p.time, p);
    });

    return expectedHours.map((hour) => {
      const match = dataMap.get(hour);
      const happy = match?.happy ?? 0;
      const neutral = match?.neutral ?? 0;
      const sad = match?.sad ?? 0;
      const total = happy + neutral + sad;
      const denom = total > 0 ? total : 1;

      return {
        time: hour,
        happy,
        neutral,
        sad,
        total,
        happyPct: total > 0 ? Number(((happy / denom) * 100).toFixed(1)) : 0,
        neutralPct: total > 0 ? Number(((neutral / denom) * 100).toFixed(1)) : 0,
        sadPct: total > 0 ? Number(((sad / denom) * 100).toFixed(1)) : 0,
      };
    });
  }, [data, expectedHours]);

  const isEmpty =
    timelinePoints.length === 0 ||
    timelinePoints.every((p) => p.happy === 0 && p.neutral === 0 && p.sad === 0);

  // Dynamic Y-Axis ceiling calculation (fixes Blocker 1 clamping at 100)
  const yMax = useMemo<number>(() => {
    if (metricMode === "percent") {
      return 100;
    }
    if (timelinePoints.length === 0) {
      return 100;
    }
    const maxRaw = Math.max(
      ...timelinePoints.map((p) => Math.max(p.happy, p.neutral, p.sad)),
      10
    );
    return Math.max(50, Math.ceil((maxRaw * 1.1) / 50) * 50);
  }, [metricMode, timelinePoints]);

  const yTicks = useMemo<number[]>(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(ratio * yMax));
  }, [yMax]);

  // Calculate accurate summary metrics & donut slices (fixes Blocker 2)
  const summary = useMemo<TimelineSummary>(() => {
    if (isEmpty) {
      return {
        totalVotes: 0,
        totalHappy: 0,
        totalNeutral: 0,
        totalSad: 0,
        avgHappy: "-",
        avgNeutral: "-",
        avgSad: "-",
        overallScore: "0.0%",
        donutSlices: [],
      };
    }

    const totalHappy = timelinePoints.reduce((acc, p) => acc + (p.happy ?? 0), 0);
    const totalNeutral = timelinePoints.reduce((acc, p) => acc + (p.neutral ?? 0), 0);
    const totalSad = timelinePoints.reduce((acc, p) => acc + (p.sad ?? 0), 0);
    const totalVotes = totalHappy + totalNeutral + totalSad;
    const sumAll = totalVotes > 0 ? totalVotes : 1;

    const happyPercent = (totalHappy / sumAll) * 100;
    const neutralPercent = (totalNeutral / sumAll) * 100;
    const sadPercent = (totalSad / sumAll) * 100;

    const circumference = 2 * Math.PI * 46;
    const happyLen = (happyPercent / 100) * circumference;
    const neutralLen = (neutralPercent / 100) * circumference;
    const sadLen = (sadPercent / 100) * circumference;

    const donutSlices: DonutSlice[] = [
      {
        key: "happy",
        label: "ดี (Satisfied)",
        value: totalHappy,
        percentage: Number(happyPercent.toFixed(1)),
        color: "var(--success)",
        dashArray: `${happyLen} ${circumference}`,
        dashOffset: 0,
      },
      {
        key: "neutral",
        label: "ปานกลาง (Neutral)",
        value: totalNeutral,
        percentage: Number(neutralPercent.toFixed(1)),
        color: "var(--warning)",
        dashArray: `${neutralLen} ${circumference}`,
        dashOffset: -happyLen,
      },
      {
        key: "sad",
        label: "ปรับปรุง (Unsatisfied)",
        value: totalSad,
        percentage: Number(sadPercent.toFixed(1)),
        color: "var(--error)",
        dashArray: `${sadLen} ${circumference}`,
        dashOffset: -(happyLen + neutralLen),
      },
    ];

    const count = timelinePoints.length || 1;

    return {
      totalVotes,
      totalHappy,
      totalNeutral,
      totalSad,
      avgHappy: (totalHappy / count).toFixed(1),
      avgNeutral: (totalNeutral / count).toFixed(1),
      avgSad: (totalSad / count).toFixed(1),
      overallScore: `${happyPercent.toFixed(1)}%`,
      donutSlices,
    };
  }, [timelinePoints, isEmpty]);

  // Dimension helpers for responsive SVG calculation with dynamic maxY and curve tension
  const getCoordinates = useCallback(
    (
      values: number[],
      chartWidth: number,
      chartHeight: number,
      paddingLeft: number,
      paddingTop: number,
      maxScale: number = 100,
      curveType: "smooth" | "straight" = "smooth"
    ): CurvePathResult => {
      if (values.length === 0) return { d: "", points: [] };

      const safeMax = maxScale > 0 ? maxScale : 100;
      const stepX = values.length > 1 ? chartWidth / (values.length - 1) : 0;
      const points = values.map((val, i) => {
        const clamped = Math.max(0, Math.min(safeMax, val ?? 0));
        return {
          x: paddingLeft + i * stepX,
          y: paddingTop + chartHeight - (clamped / safeMax) * chartHeight,
        };
      });

      if (points.length === 1) {
        return {
          d: `M ${points[0].x} ${points[0].y}`,
          points,
        };
      }

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        if (curveType === "straight") {
          d += ` L ${p1.x} ${p1.y}`;
        } else {
          const cpx = p0.x + (p1.x - p0.x) / 2;
          d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
        }
      }

      return { d, points };
    },
    []
  );

  return {
    selectedRangeId,
    setSelectedRangeId,
    metricMode,
    setMetricMode,
    ranges,
    activeRange,
    expectedHours,
    timelinePoints,
    isEmpty,
    isLoading,
    errorMessage,
    yMax,
    yTicks,
    summary,
    hoveredPointIndex,
    setHoveredPointIndex,
    focusedSeries,
    setFocusedSeries,
    toggleFocusSeries,
    getCoordinates,
  };
}
