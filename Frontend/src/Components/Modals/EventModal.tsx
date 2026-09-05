"use client";

import React, { useState, useEffect } from "react";
import { EventCategory, ScheduledEventItem } from "@/Types/event";

function formatToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  availableBrands: string[];
  onSave: (eventData: {
    eventName: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    brandScope: string;
    eventLocation: string;
    eventCategory: EventCategory;
    eventStatus: "Upcoming" | "Active" | "Completed";
    description: string;
    isCustomSurveyTheme: boolean;
    customThemeName?: string;
    customGreeting?: string;
    customThankYou?: string;
    kioskThemeOverride?: string;
  }) => Promise<void> | void;
}

export default function EventModal({
  isOpen,
  onClose,
  initialDate,
  availableBrands,
  onSave,
}: EventModalProps) {
  const [formEventName, setFormEventName] = useState("");
  const [formEventDate, setFormEventDate] = useState(initialDate || formatToYYYYMMDD(new Date()));
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("18:00");
  const [formBrandScope, setFormBrandScope] = useState(availableBrands[0] || "");
  const [formLocation, setFormLocation] = useState("");
  const [formCategory, setFormCategory] = useState<EventCategory>("CAMPAIGN");
  const [formStatus, setFormStatus] = useState<"UPCOMING" | "LIVE" | "COMPLETED">("UPCOMING");
  const [formDescription, setFormDescription] = useState("");
  const [formIsOverrideSurvey, setFormIsOverrideSurvey] = useState(false);
  const [formSurveyTheme, setFormSurveyTheme] = useState("");
  const [formGreeting, setFormGreeting] = useState("");
  const [formThankYou, setFormThankYou] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormEventName("");
      setFormEventDate(initialDate || formatToYYYYMMDD(new Date()));
      setFormStartTime("09:00");
      setFormEndTime("18:00");
      setFormBrandScope(availableBrands[0] || "");
      setFormLocation("");
      setFormCategory("CAMPAIGN");
      setFormStatus("UPCOMING");
      setFormDescription("");
      setFormIsOverrideSurvey(false);
      setFormSurveyTheme("");
      setFormGreeting("");
      setFormThankYou("");
    }
  }, [isOpen, initialDate, availableBrands]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEventName.trim()) return;

    await onSave({
      eventName: formEventName.trim(),
      eventDate: formEventDate,
      startTime: formStartTime,
      endTime: formEndTime,
      brandScope: formBrandScope || "ทุกแบรนด์ในเครือ",
      eventLocation: formLocation.trim() || "-",
      eventCategory: formCategory,
      eventStatus: formStatus === "UPCOMING" ? "Upcoming" : formStatus === "LIVE" ? "Active" : "Completed",
      description: formDescription.trim(),
      isCustomSurveyTheme: formIsOverrideSurvey,
      customThemeName: formIsOverrideSurvey ? formSurveyTheme : undefined,
      customGreeting: formIsOverrideSurvey ? formGreeting : undefined,
      customThankYou: formIsOverrideSurvey ? formThankYou : undefined,
      kioskThemeOverride: formIsOverrideSurvey ? formSurveyTheme : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-xl">
                event
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                สร้างกิจกรรมใหม่ (Add New Event)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                กำหนดตารางเวลากิจกรรม แคมเปญ หรือการซ่อมบำรุงตู้ Kiosk ในสาขา
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          
          {/* Event Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">ชื่อกิจกรรม / แคมเปญ (Event Name) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formEventName}
              onChange={(e) => setFormEventName(e.target.value)}
              placeholder="e.g. เทศกาลอาหารพิเศษประจำปี หรือ งานซ่อมบำรุงตู้ Kiosk"
              className="input-text w-full font-semibold"
            />
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">วันที่จัดกิจกรรม (Date)</label>
              <input
                type="date"
                required
                value={formEventDate}
                onChange={(e) => setFormEventDate(e.target.value)}
                className="input-text w-full font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">เวลาเริ่มต้น (Start)</label>
              <input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="input-text w-full font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">เวลาสิ้นสุด (End)</label>
              <input
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="input-text w-full font-mono text-xs"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">หมวดหมู่ (Category)</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                className="input-select w-full"
              >
                <option value="CAMPAIGN">แคมเปญการประเมิน (Campaign)</option>
                <option value="MAINTENANCE">ซ่อมบำรุงฮาร์ดแวร์ (Maintenance)</option>
                <option value="FIRMWARE">อัปเดตระบบ Kiosk (Firmware)</option>
                <option value="CALIBRATION">ตั้งค่าเซนเซอร์ (Calibration)</option>
                <option value="AUDIT">ตรวจสอบคุณภาพ CSAT (Audit)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">สถานะ (Status)</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "UPCOMING" | "LIVE" | "COMPLETED")}
                className="input-select w-full font-bold"
              >
                <option value="UPCOMING">UPCOMING (กำลังจะมาถึง)</option>
                <option value="LIVE">LIVE (กำลังดำเนินการ)</option>
                <option value="COMPLETED">COMPLETED (เสร็จสิ้นแล้ว)</option>
              </select>
            </div>
          </div>

          {/* Brand & Location Scoping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">ขอบเขตแบรนด์ (Brand Scope)</label>
              {availableBrands.length === 0 ? (
                <div className="input-text w-full bg-white text-slate-400 font-medium">
                  ยังไม่มีข้อมูลแบรนด์ในระบบ
                </div>
              ) : (
                <select
                  value={formBrandScope}
                  onChange={(e) => setFormBrandScope(e.target.value)}
                  className="input-select w-full bg-white font-semibold"
                >
                  <option value="ทุกแบรนด์ในเครือ">ทุกแบรนด์ในเครือ (All Brands)</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">จุดติดตั้ง / สาขาที่จัดกิจกรรม</label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. ทุกสาขา หรือ สาขาที่ระบุ"
                className="input-text w-full bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">รายละเอียดกิจกรรม (Description)</label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="ระบุรายละเอียดของแคมเปญ หรือเป้าหมายการประเมิน..."
              className="input-text w-full text-xs"
            />
          </div>

          {/* Kiosk Custom Theme & Override Section */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formIsOverrideSurvey}
                onChange={(e) => setFormIsOverrideSurvey(e.target.checked)}
                className="w-4 h-4 rounded text-amber-700 accent-amber-600 cursor-pointer"
              />
              <span className="font-extrabold text-amber-950 text-xs">
                เปิดใช้งานธีม Kiosk และข้อความประเมินพิเศษสำหรับกิจกรรมนี้
              </span>
            </label>

            {formIsOverrideSurvey && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block text-[11px]">ชื่อธีม (Theme Name)</label>
                  <input
                    type="text"
                    value={formSurveyTheme}
                    onChange={(e) => setFormSurveyTheme(e.target.value)}
                    placeholder="เช่น แคมเปญต้อนรับเทศกาล"
                    className="input-text w-full bg-white text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">ข้อความต้อนรับบนจอ Kiosk</label>
                    <input
                      type="text"
                      value={formGreeting}
                      onChange={(e) => setFormGreeting(e.target.value)}
                      placeholder="ยินดีต้อนรับค่ะ..."
                      className="input-text w-full bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">ข้อความขอบคุณหลังกดประเมิน</label>
                    <input
                      type="text"
                      value={formThankYou}
                      onChange={(e) => setFormThankYou(e.target.value)}
                      placeholder="ขอบคุณสำหรับคำประเมินค่ะ..."
                      className="input-text w-full bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              บันทึกกิจกรรม
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

