"use client";

import React from "react";
import { SatisfactionConfig } from "@/Lib/satisfactionSettings";

interface SatisfactionSettingsSectionProps {
  satisfactionConfig: SatisfactionConfig;
  onUpdateSatisfactionConfig: (updatedFields: Partial<SatisfactionConfig>) => void;
}

export default function SatisfactionSettingsSection({
  satisfactionConfig,
  onUpdateSatisfactionConfig,
}: SatisfactionSettingsSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">mood</span>
          Satisfaction & Kiosk Survey Settings (การตั้งค่าแบบประเมินและหน้าต่างขอบคุณ)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          พิมพ์กำหนดข้อความหัวข้อคำถาม, คำอธิบายย่อย, ขนาดฟอนต์, ขนาดไอคอน, และขนาดหน้าต่างขอบคุณ
        </p>
      </div>

      <div className="p-6 space-y-6">
        
        {/* ─── 1. KIOSK HEADER & SUBTITLE CONFIGURATION (หัวข้อและคำอธิบาย) ─── */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900 text-[18px]">title</span>
            หัวข้อคำถามและคำอธิบายหน้าจอ (Header & Subtitle Settings)
          </h3>

          {/* Question Title */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 block">
                ข้อความหัวข้อคำถามหลัก (Question Title)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">ขนาดฟอนต์หัวข้อ:</span>
                <input
                  type="number"
                  min={18}
                  max={72}
                  value={satisfactionConfig.questionFontSize ?? 36}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ questionFontSize: Number(inputEvent.target.value) })}
                  className="input-text w-20 py-1 bg-white font-bold text-xs"
                />
                <span className="text-xs text-slate-500">px</span>
              </div>
            </div>
            <input
              type="text"
              value={satisfactionConfig.questionTitle ?? "ท่านมีความพึงพอใจกับการบริการในวันนี้อย่างไร?"}
              onChange={(inputEvent) => onUpdateSatisfactionConfig({ questionTitle: inputEvent.target.value })}
              className="input-text w-full bg-white"
              placeholder="ท่านมีความพึงพอใจกับการบริการในวันนี้อย่างไร?"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 block">
                ข้อความคำอธิบายย่อย (Subtitle)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">ขนาดฟอนต์ย่อย:</span>
                <input
                  type="number"
                  min={12}
                  max={40}
                  value={satisfactionConfig.subtitleFontSize ?? 18}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ subtitleFontSize: Number(inputEvent.target.value) })}
                  className="input-text w-20 py-1 bg-white font-bold text-xs"
                />
                <span className="text-xs text-slate-500">px</span>
              </div>
            </div>
            <input
              type="text"
              value={satisfactionConfig.questionSubtitle ?? "โปรดประเมินความพึงพอใจจากตัวเลือกด้านล่าง"}
              onChange={(inputEvent) => onUpdateSatisfactionConfig({ questionSubtitle: inputEvent.target.value })}
              className="input-text w-full bg-white"
              placeholder="โปรดประเมินความพึงพอใจจากตัวเลือกด้านล่าง"
            />
          </div>
        </div>

        {/* ─── 2. KIOSK BUTTONS GRID CONFIGURATION ─── */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900 text-[18px]">grid_view</span>
            การตั้งค่าปุ่มประเมิน Kiosk (Satisfaction Button Grid)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            
            {/* Emoji Icon Size (px) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ขนาดไอคอนอิโมจิ (Emoji Size)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={40}
                  max={300}
                  value={satisfactionConfig.emojiSize ?? 160}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ emojiSize: Number(inputEvent.target.value) })}
                  className="input-text w-28 bg-white font-bold text-slate-800"
                  placeholder="160"
                />
                <span className="text-xs font-semibold text-slate-600">px</span>
              </div>
              <p className="text-[10px] text-slate-400">ค่าตั้งต้น 160px</p>
            </div>

            {/* Label Font Size (px) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ขนาดตัวหนังสือปุ่ม (Label Font)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={12}
                  max={80}
                  value={satisfactionConfig.labelFontSize ?? 20}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ labelFontSize: Number(inputEvent.target.value) })}
                  className="input-text w-28 bg-white font-bold text-slate-800"
                  placeholder="20"
                />
                <span className="text-xs font-semibold text-slate-600">px</span>
              </div>
              <p className="text-[10px] text-slate-400">ค่าตั้งต้น 20px (แย่/ปานกลาง/ดี)</p>
            </div>

            {/* Grid Max Width (px) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ความกว้างตารางปุ่ม (Grid Width)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={500}
                  max={1400}
                  value={satisfactionConfig.gridMaxWidth ?? 900}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ gridMaxWidth: Number(inputEvent.target.value) })}
                  className="input-text w-28 bg-white font-bold text-slate-800"
                  placeholder="900"
                />
                <span className="text-xs font-semibold text-slate-600">px</span>
              </div>
              <p className="text-[10px] text-slate-400">ค่าตั้งต้น 900px</p>
            </div>

          </div>

          {/* Cooldown Timer */}
          <div className="pt-2 border-t border-slate-200/60 max-w-sm space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              เวลาป้องกันการกดซ้ำ (Duplicate Vote Cooldown)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={120}
                value={satisfactionConfig.duplicateVoteMinutes}
                onChange={(inputEvent) => onUpdateSatisfactionConfig({ duplicateVoteMinutes: Number(inputEvent.target.value) })}
                className="input-text w-28 bg-white"
              />
              <span className="text-xs font-semibold text-slate-600">นาที (Minutes)</span>
            </div>
          </div>
        </div>

        {/* ─── 3. THANK YOU MODAL CONFIGURATION ─── */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">volunteer_activism</span>
            การตั้งค่าหน้าต่างขอบคุณ (Thank You Modal Settings)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            
            {/* Modal Max Width (px) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ความกว้างหน้าต่างขอบคุณ (Modal Width)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={400}
                  max={1200}
                  value={satisfactionConfig.modalMaxWidth ?? 650}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ modalMaxWidth: Number(inputEvent.target.value) })}
                  className="input-text w-28 bg-white font-bold text-slate-800"
                  placeholder="650"
                />
                <span className="text-xs font-semibold text-slate-600">px</span>
              </div>
              <p className="text-[10px] text-slate-400">ค่าตั้งต้น 650px (ขยายความกว้าง ไม่กระจุก)</p>
            </div>

            {/* Thank You Icon Size (px) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ขนาดไอคอนขอบคุณ (Icon Size)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={30}
                  max={180}
                  value={satisfactionConfig.thankYouIconSize ?? 80}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ thankYouIconSize: Number(inputEvent.target.value) })}
                  className="input-text w-28 bg-white font-bold text-slate-800"
                  placeholder="80"
                />
                <span className="text-xs font-semibold text-slate-600">px</span>
              </div>
              <p className="text-[10px] text-slate-400">ค่าตั้งต้น 80px (ไม่มีขอบเขียว)</p>
            </div>

            {/* Auto Reset Timer (Seconds) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                เวลานับถอยหลังปิด (Auto-Reset Timer)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={satisfactionConfig.autoResetSeconds}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ autoResetSeconds: Number(inputEvent.target.value) })}
                  className="input-text w-28 bg-white font-bold text-slate-800"
                />
                <span className="text-xs font-semibold text-slate-600">วินาที (Seconds)</span>
              </div>
              <p className="text-[10px] text-slate-400">ค่าตั้งต้น 4 วินาที</p>
            </div>

          </div>

          <hr className="border-slate-200/60" />

          {/* Thai Message & Font Size */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 block">
                ข้อความขอบคุณภาษาไทย (Thai Message)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">ขนาดฟอนต์ TH:</span>
                <input
                  type="number"
                  min={14}
                  max={60}
                  value={satisfactionConfig.thankYouFontSizeTh ?? 28}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ thankYouFontSizeTh: Number(inputEvent.target.value) })}
                  className="input-text w-20 py-1 bg-white font-bold text-xs"
                />
                <span className="text-xs text-slate-500">px</span>
              </div>
            </div>
            <textarea
              rows={2}
              value={satisfactionConfig.thankYouMessageTh}
              onChange={(textAreaEvent) => onUpdateSatisfactionConfig({ thankYouMessageTh: textAreaEvent.target.value })}
              className="input-text w-full leading-relaxed bg-white"
              placeholder="ขอขอบคุณสำหรับความคิดเห็นของท่าน..."
            />
          </div>

          {/* English Message & Font Size */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 block">
                ข้อความขอบคุณภาษาอังกฤษ (English Message)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">ขนาดฟอนต์ EN:</span>
                <input
                  type="number"
                  min={12}
                  max={40}
                  value={satisfactionConfig.thankYouFontSizeEn ?? 16}
                  onChange={(inputEvent) => onUpdateSatisfactionConfig({ thankYouFontSizeEn: Number(inputEvent.target.value) })}
                  className="input-text w-20 py-1 bg-white font-bold text-xs"
                />
                <span className="text-xs text-slate-500">px</span>
              </div>
            </div>
            <textarea
              rows={2}
              value={satisfactionConfig.thankYouMessageEn}
              onChange={(textAreaEvent) => onUpdateSatisfactionConfig({ thankYouMessageEn: textAreaEvent.target.value })}
              className="input-text w-full leading-relaxed bg-white"
              placeholder="Thank you for your feedback!..."
            />
          </div>

        </div>

      </div>
    </section>
  );
}
