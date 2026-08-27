"use client";

import React from "react";
import { EventItem } from "@/Types/event";

export interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function EventDetailModal({
  event,
  onClose,
  onDelete,
}: EventDetailModalProps) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-900 text-2xl">event_note</span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{event.eventName}</h3>
              <span className="text-[10px] text-slate-400 font-mono">{event.eventId}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">วันที่จัดกิจกรรม</span>
              <span className="font-bold text-slate-800">{event.eventDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">เวลา</span>
              <span className="font-bold text-slate-800">{event.startTime} - {event.endTime} น.</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">แบรนด์ที่จัด</span>
              <span className="font-bold text-blue-900">{event.brandScope}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">สถานะ</span>
              <span className="badge-live">{event.eventStatus}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-bold">สถานที่ / สาขา</span>
            <span className="font-medium text-slate-800">{event.eventLocation}</span>
          </div>

          {event.description && (
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">รายละเอียด</span>
              <p className="text-slate-600 leading-relaxed">{event.description}</p>
            </div>
          )}

          {event.isCustomSurveyTheme && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-900 block">ธีม Kiosk พิเศษ: {event.customThemeName}</span>
              {event.customGreeting && (
                <span className="text-[11px] text-slate-600 block">"{event.customGreeting}"</span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onDelete(event.eventId)}
              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              ลบกิจกรรม
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

