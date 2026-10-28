"use client";

import { useState, useMemo, useCallback } from "react";

export interface SentimentTimelinePoint {
  time: string;
  happy: number;
  neutral: number;
  sad: number;
}

export interface TimelineRangeOption {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
}

export const DEFAULT_TIMELINE_RANGES: TimelineRangeOption[] = [
  {
    id: "standard",
    label: "08:00 - 17:00 (เวลามาตรฐาน Default)",
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
    label: "10:00 - 22:00 (สาขาในห้าง)",
    startHour: 10,
    endHour: 22,
  },
];

export interface UseSentimentTimelineChartProps {
  data?: SentimentTimelinePoint[] | null;
  ranges?: TimelineRangeOption[];
  defaultRangeId?: string;
  isLoading?: boolean;
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
  avgHappy: string;
  avgNeutral: string;
  avgSad: string;
  overallScore: string;
  donutSlices: DonutSlice[];
}

export function useSentimentTimelineChart({
  data = null,
  ranges = DEFAULT_TIMELINE_RANGES,
  defaultRangeId = "standard",
  isLoading = false,
}: UseSentimentTimelineChartProps = {}) {
  const [selectedRangeId, setSelectedRangeId] = useState<string>(defaultRangeId);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [focusedSeries, setFocusedSeries] = useState<SentimentFocusSeries>(null);

  const toggleFocusSeries = useCallback((series: "happy" | "neutral" | "sad") => {
    setFocusedSeries((prev) => (prev === series ? null : series));
  }, []);

  const activeRange = useMemo(() => {
    return (
      ranges.find((r) => r.id === selectedRangeId) ??
      ranges[0] ??
      DEFAULT_TIMELINE_RANGES[0]
    );
  }, [ranges, selectedRangeId]);

  // Generate hourly slots based on active range
  const expectedHours = useMemo(() => {
    const list: string[] = [];
    for (let h = activeRange.startHour; h <= activeRange.endHour; h++) {
      list.push(`${String(h).padStart(2, "0")}:00`);
    }
    return list;
  }, [activeRange]);

  // Map incoming data to expected hours with safe defaults
  // TODO: Connect API [sentiment_timeline_hourly]
  const timelinePoints = useMemo<SentimentTimelinePoint[]>(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const dataMap = new Map<string, SentimentTimelinePoint>();
    data.forEach((p) => {
      dataMap.set(p.time, p);
    });

    return expectedHours.map((hour) => {
      const match = dataMap.get(hour);
      if (match) {
        return match;
      }
      return {
        time: hour,
        happy: 0,
        neutral: 0,
        sad: 0,
      };
    });
  }, [data, expectedHours]);

  const isEmpty = timelinePoints.length === 0;

  // Calculate summary metrics & donut slices with null safety
  const summary = useMemo<TimelineSummary>(() => {
    if (isEmpty) {
      return {
        avgHappy: "-",
        avgNeutral: "-",
        avgSad: "-",
        overallScore: "-",
        donutSlices: [],
      };
    }

    const totalHappy = timelinePoints.reduce((acc, p) => acc + (p.happy ?? 0), 0);
    const totalNeutral = timelinePoints.reduce((acc, p) => acc + (p.neutral ?? 0), 0);
    const totalSad = timelinePoints.reduce((acc, p) => acc + (p.sad ?? 0), 0);
    const count = timelinePoints.length;

    const avgHappyNum = totalHappy / count;
    const avgNeutralNum = totalNeutral / count;
    const avgSadNum = totalSad / count;
    const sumAll = avgHappyNum + avgNeutralNum + avgSadNum || 1;

    const happyPercent = (avgHappyNum / sumAll) * 100;
    const neutralPercent = (avgNeutralNum / sumAll) * 100;
    const sadPercent = (avgSadNum / sumAll) * 100;

    // SVG Donut calculation with Radius = 46, Circumference = 2 * pi * 46 ≈ 289.027
    const circumference = 2 * Math.PI * 46;
    const happyLen = (happyPercent / 100) * circumference;
    const neutralLen = (neutralPercent / 100) * circumference;
    const sadLen = (sadPercent / 100) * circumference;

    const donutSlices: DonutSlice[] = [
      {
        key: "happy",
        label: "ดี",
        value: Number(avgHappyNum.toFixed(1)),
        percentage: Number(happyPercent.toFixed(1)),
        color: "var(--success)",
        dashArray: `${happyLen} ${circumference}`,
        dashOffset: 0,
      },
      {
        key: "neutral",
        label: "ปานกลาง",
        value: Number(avgNeutralNum.toFixed(1)),
        percentage: Number(neutralPercent.toFixed(1)),
        color: "var(--warning)",
        dashArray: `${neutralLen} ${circumference}`,
        dashOffset: -happyLen,
      },
      {
        key: "sad",
        label: "ปรับปรุง",
        value: Number(avgSadNum.toFixed(1)),
        percentage: Number(sadPercent.toFixed(1)),
        color: "var(--error)",
        dashArray: `${sadLen} ${circumference}`,
        dashOffset: -(happyLen + neutralLen),
      },
    ];

    return {
      avgHappy: avgHappyNum.toFixed(1),
      avgNeutral: avgNeutralNum.toFixed(1),
      avgSad: avgSadNum.toFixed(1),
      overallScore: `${avgHappyNum.toFixed(1)}%`,
      donutSlices,
    };
  }, [timelinePoints, isEmpty]);

  // Dimension helpers for responsive SVG calculation
  const getCoordinates = useCallback(
    (
      values: number[],
      chartWidth: number,
      chartHeight: number,
      paddingLeft: number,
      paddingTop: number,
      paddingBottom: number
    ): CurvePathResult => {
      if (values.length === 0) return { d: "", points: [] };

      const stepX = values.length > 1 ? chartWidth / (values.length - 1) : 0;
      const points = values.map((val, i) => {
        const clamped = Math.max(0, Math.min(100, val ?? 0));
        return {
          x: paddingLeft + i * stepX,
          y: paddingTop + chartHeight - (clamped / 100) * chartHeight,
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
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }

      return { d, points };
    },
    []
  );

  return {
    selectedRangeId,
    setSelectedRangeId,
    ranges,
    activeRange,
    expectedHours,
    timelinePoints,
    isEmpty,
    isLoading,
    summary,
    hoveredPointIndex,
    setHoveredPointIndex,
    focusedSeries,
    setFocusedSeries,
    toggleFocusSeries,
    getCoordinates,
  };
}
