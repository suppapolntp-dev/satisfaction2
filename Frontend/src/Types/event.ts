export type EventCategory = 
  | "CAMPAIGN" 
  | "MAINTENANCE" 
  | "FIRMWARE" 
  | "CALIBRATION" 
  | "AUDIT";

export interface EventItem {
  eventId: string;
  eventName: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  brandScope: string;
  eventLocation: string;
  eventCategory: EventCategory;
  eventStatus: "LIVE" | "UPCOMING" | "COMPLETED" | "Active" | "Upcoming" | "Completed";
  description?: string;
  isCustomSurveyTheme?: boolean;
  customThemeName?: string;
  customGreeting?: string;
  customThankYou?: string;
  kioskThemeOverride?: string;
}

export type ScheduledEventItem = EventItem;

export interface CalendarCell {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: EventItem[];
}

