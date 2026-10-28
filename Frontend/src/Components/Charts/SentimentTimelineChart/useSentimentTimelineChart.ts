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

export function useSentimentTimelineChart({
  data = null,
  ranges = DEFAULT_TIMELINE_RANGES,
  defaultRangeId = "standard",
  isLoading = false,
}: UseSentimentTimelineChartProps = {}) {
  const [selectedRangeId, setSelectedRangeId] = useState<string>(defaultRangeId);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

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

  // Calculate summary metrics with null safety
  const summary = useMemo(() => {
    if (isEmpty) {
      return {
        avgHappy: "-",
        avgNeutral: "-",
        avgSad: "-",
      };
    }

    const totalHappy = timelinePoints.reduce((acc, p) => acc + (p.happy ?? 0), 0);
    const totalNeutral = timelinePoints.reduce((acc, p) => acc + (p.neutral ?? 0), 0);
    const totalSad = timelinePoints.reduce((acc, p) => acc + (p.sad ?? 0), 0);
    const count = timelinePoints.length;

    return {
      avgHappy: (totalHappy / count).toFixed(1),
      avgNeutral: (totalNeutral / count).toFixed(1),
      avgSad: (totalSad / count).toFixed(1),
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
    getCoordinates,
  };
}
