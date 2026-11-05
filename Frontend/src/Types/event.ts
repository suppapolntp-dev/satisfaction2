export type EventCategory =
  | "CAMPAIGN"
  | "MAINTENANCE"
  | "FIRMWARE"
  | "CALIBRATION"
  | "AUDIT";

export type EventStatus = "Upcoming" | "Active" | "Completed" | "LIVE" | "UPCOMING" | "COMPLETED";

export interface EventAssignee {
  name: string;
  avatarUrl?: string | null;
}

export interface EventItem {
  eventId: string;
  eventName: string;
  eventDate: string; // YYYY-MM-DD
  eventEndDate?: string | null; // YYYY-MM-DD; null/undefined = single-day
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  brandScope: string;
  brandId?: string | null;
  brandLogoUrl?: string | null;
  eventLocation: string;
  eventCategory: EventCategory | string;
  eventStatus: EventStatus;
  description?: string | null;
  kioskThemeOverride?: string | null;
  targetBranchIds?: string[];
  targetBranchNames?: string[];
  progressPercent?: number | null; // 0-100
  commentCount?: number | null;
  attachmentCount?: number | null;
  assignees?: EventAssignee[];
}

export interface CalendarCell {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: EventItem[];
}

export interface CalendarEventSegment {
  event: EventItem;
  startColumn: number; // 1-based grid column within the week row
  columnSpan: number;
  laneIndex: number; // 0-based grid row within the week row
  isMultiDay: boolean;
}

export interface CalendarWeek {
  cells: CalendarCell[];
  segments: CalendarEventSegment[];
}
