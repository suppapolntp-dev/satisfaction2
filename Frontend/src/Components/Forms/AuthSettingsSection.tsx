"use client";

import React from "react";
import { AuthHeroConfig } from "@/Lib/authSettings";

interface AuthSettingsSectionProps {
  authConfig: AuthHeroConfig;
  onUpdateAuthConfig: (updatedFields: Partial<AuthHeroConfig>) => void;
}

export default function AuthSettingsSection({
  authConfig,
  onUpdateAuthConfig,
}: AuthSettingsSectionProps) {
  const handlePillarChange = (index: number, field: "title" | "subtitle", val: string) => {
    const nextPillars = [...authConfig.pillars];
    if (nextPillars[index]) {
      nextPillars[index] = { ...nextPillars[index], [field]: val };
      onUpdateAuthConfig({ pillars: nextPillars });
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-900 text-[18px]">lock</span>
          Login & Authentication Settings (การตั้งค่าหน้าล็อกอินและ Hero Banner)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          ปรับแต่งข้อความพาดหัว, คำบรรยาย 3 เสาหลัก, และข้อความแบบฟอร์มล็อกอินฝั่ง Authentication
        </p>
      </div>

      <div className="p-6 space-y-6">
        
        {/* ─── 1. LOGIN FORM RIGHT PANE (ข้อความบนฟอร์มล็อกอิน) ─── */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900 text-[18px]">badge</span>
            ข้อความแบบฟอร์มล็อกอิน (Login Form Texts)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                หัวข้อฟอร์ม (Form Title)
              </label>
              <input
                type="text"
                value={authConfig.formTitle}
                onChange={(e) => onUpdateAuthConfig({ formTitle: e.target.value })}
                className="input-text w-full bg-white"
                placeholder="Welcome back"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ป้ายกำกับปุ่มกด (Submit Button Label)
              </label>
              <input
                type="text"
                value={authConfig.submitButtonLabel}
                onChange={(e) => onUpdateAuthConfig({ submitButtonLabel: e.target.value })}
                className="input-text w-full bg-white"
                placeholder="Sign In to Console"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              คำแนะนำใต้หัวข้อ (Form Subtitle)
            </label>
            <input
              type="text"
              value={authConfig.formSubtitle}
              onChange={(e) => onUpdateAuthConfig({ formSubtitle: e.target.value })}
              className="input-text w-full bg-white"
              placeholder="กรอกรหัสประจำตัวองค์กรเพื่อเข้าสู่ระบบงาน"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              คำเตือนความปลอดภัยด้านล่างสุด (Security Notice Text)
            </label>
            <textarea
              rows={2}
              value={authConfig.securityNoticeText}
              onChange={(e) => onUpdateAuthConfig({ securityNoticeText: e.target.value })}
              className="input-text w-full bg-white text-xs py-2"
              placeholder="ระบบสงวนสิทธิ์เฉพาะบุคลากรที่ได้รับมอบหมาย..."
            />
          </div>
        </div>

        {/* ─── 2. HERO BANNER LEFT PANE (ข้อความฝั่งมืด Slate 950) ─── */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900 text-[18px]">auto_awesome</span>
            ข้อความและพาดหัวแผง Hero ซ้ายมือ (Hero Banner & Identity)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ชื่อแบรนด์ระบบ (Brand Name)
              </label>
              <input
                type="text"
                value={authConfig.brandName}
                onChange={(e) => onUpdateAuthConfig({ brandName: e.target.value })}
                className="input-text w-full bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ป้ายกำกับระดับ (Badge Text)
              </label>
              <input
                type="text"
                value={authConfig.badgeText}
                onChange={(e) => onUpdateAuthConfig({ badgeText: e.target.value })}
                className="input-text w-full bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                คำกำกับเล็ก (Tag Text)
              </label>
              <input
                type="text"
                value={authConfig.tagText}
                onChange={(e) => onUpdateAuthConfig({ tagText: e.target.value })}
                className="input-text w-full bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              ข้อความพาดหัวใหญ่ (Headline)
            </label>
            <input
              type="text"
              value={authConfig.headline}
              onChange={(e) => onUpdateAuthConfig({ headline: e.target.value })}
              className="input-text w-full bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              คำอธิบายแพลตฟอร์ม (Subheadline)
            </label>
            <textarea
              rows={2}
              value={authConfig.subheadline}
              onChange={(e) => onUpdateAuthConfig({ subheadline: e.target.value })}
              className="input-text w-full bg-white text-xs py-2"
            />
          </div>
        </div>

        {/* ─── 3. ARCHITECTURE 3 PILLARS (เสาหลัก 3 ด้าน) ─── */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900 text-[18px]">view_column</span>
            3 เสาหลักสถาปัตยกรรม (Architecture Pillars)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {authConfig.pillars.map((pillar, idx) => (
              <div key={pillar.id || idx} className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-2.5">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  เสาหลักที่ {idx + 1}
                </span>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">หัวข้อหลัก</label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => handlePillarChange(idx, "title", e.target.value)}
                    className="input-text w-full text-xs py-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">คำขยายย่อย</label>
                  <input
                    type="text"
                    value={pillar.subtitle}
                    onChange={(e) => handlePillarChange(idx, "subtitle", e.target.value)}
                    className="input-text w-full text-xs py-1.5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 4. LEGAL & COPYRIGHT (ลิขสิทธิ์และส่วนท้าย) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              ข้อความลิขสิทธิ์ (Copyright Text)
            </label>
            <input
              type="text"
              value={authConfig.copyrightText}
              onChange={(e) => onUpdateAuthConfig({ copyrightText: e.target.value })}
              className="input-text w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              ป้ายกำกับ Privacy / Security
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={authConfig.privacyNoticeLabel}
                onChange={(e) => onUpdateAuthConfig({ privacyNoticeLabel: e.target.value })}
                className="input-text w-full text-xs"
                placeholder="Privacy Notice"
              />
              <input
                type="text"
                value={authConfig.securityAuditLabel}
                onChange={(e) => onUpdateAuthConfig({ securityAuditLabel: e.target.value })}
                className="input-text w-full text-xs"
                placeholder="Security Audit"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
