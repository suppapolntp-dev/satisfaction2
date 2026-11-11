"use client";

import React from "react";

// ==========================================================================
// ─── 1. AUTHENTICATION & 2FA ILLUSTRATION COMPONENT
// ==========================================================================
export function AuthManualIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        Architecture Flow: Tier-Aware 2FA Authentication
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs">
        {/* Step 1: Input Creds */}
        <div className="bg-slate-800/90 rounded-lg p-3 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>STEP 1: CREDENTIALS</span>
            <span className="font-mono text-emerald-400">BCrypt.Verify()</span>
          </div>
          <div className="space-y-1">
            <div className="bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono text-[11px] truncate">
              user@satisfaction.local
            </div>
            <div className="bg-slate-950 px-2 py-1 rounded text-slate-500 font-mono text-[11px]">
              •••••••••••• (Hash Match)
            </div>
          </div>
          <span className="inline-block text-[10px] text-emerald-400 font-semibold">
            ✓ Password Match
          </span>
        </div>

        {/* Step 2: Tier Split */}
        <div className="bg-slate-800/90 rounded-lg p-3 border border-blue-500/40 space-y-2 relative">
          <div className="flex items-center justify-between text-blue-300 text-[10px]">
            <span>STEP 2: TIER 2FA ROUTING</span>
            <span className="font-mono text-blue-400">180s TTL</span>
          </div>
          <div className="space-y-1.5">
            <div className="p-1.5 rounded bg-blue-950/80 border border-blue-800/60 text-[11px]">
              <strong className="text-amber-300">Tier 1–4:</strong> SMS OTP 6 หลัก + Ref: <span className="font-mono text-white">#A94C</span>
            </div>
            <div className="p-1.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-[11px]">
              <strong className="text-emerald-300">Tier 5 (Staff):</strong> ข้าม 2FA ตรงสู่หน้างาน
            </div>
          </div>
        </div>

        {/* Step 3: Session JWT */}
        <div className="bg-slate-800/90 rounded-lg p-3 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>STEP 3: SESSION TOKENS</span>
            <span className="font-mono text-purple-400">JWT 24H</span>
          </div>
          <div className="space-y-1 font-mono text-[10px]">
            <div className="bg-slate-950 p-1.5 rounded text-blue-300 truncate">
              Access: eyJhbGciOi...
            </div>
            <div className="bg-slate-950 p-1.5 rounded text-purple-300 truncate">
              Refresh: SHA256-Rotated
            </div>
          </div>
          <span className="inline-block text-[10px] text-emerald-400 font-semibold">
            ✓ Session Secure & Active
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ─── 2. KIOSK TOUCHSCREEN TERMINAL ILLUSTRATION COMPONENT
// ==========================================================================
export function KioskManualIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Terminal Layout: Touch-First CSAT Kiosk
        </span>
        <span className="text-slate-400 text-[10px]">Resolution Independent · 64px Target</span>
      </div>

      {/* Mock Kiosk Touch Area */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 max-w-lg mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h5 className="text-sm font-bold text-white tracking-wide">กรุณาประเมินความพึงพอใจการบริการ</h5>
          <p className="text-[11px] text-slate-400">แตะที่ใบหน้าเพื่อส่งคะแนน (ระบบจะรีเซ็ตอัตโนมัติ)</p>
        </div>

        {/* 3 Touch-First Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-emerald-900/40 border-2 border-emerald-500/60 flex flex-col items-center justify-center gap-1.5 hover:scale-105 transition-transform cursor-pointer select-none">
            <span className="text-2xl">😊</span>
            <span className="text-[11px] font-bold text-emerald-300">พอใจมาก</span>
            <span className="text-[9px] font-mono text-emerald-400/80">Sentiment 1</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-900/30 border-2 border-amber-500/40 flex flex-col items-center justify-center gap-1.5 hover:scale-105 transition-transform cursor-pointer select-none">
            <span className="text-2xl">😐</span>
            <span className="text-[11px] font-bold text-amber-300">ปานกลาง</span>
            <span className="text-[9px] font-mono text-amber-400/80">Sentiment 2</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-900/30 border-2 border-rose-500/40 flex flex-col items-center justify-center gap-1.5 hover:scale-105 transition-transform cursor-pointer select-none">
            <span className="text-2xl">😞</span>
            <span className="text-[11px] font-bold text-rose-300">ต้องปรับปรุง</span>
            <span className="text-[9px] font-mono text-rose-400/80">Sentiment 3</span>
          </div>
        </div>

        {/* Safeguards Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-blue-400">security</span>
            Anti-Double Tap (1.5s lock)
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-purple-400">timer</span>
            Delta-Time Auto-Reset (3s)
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-emerald-400">wifi</span>
            Heartbeat: Online
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ─── 3. ANALYTICS DASHBOARD & BUCKETING ILLUSTRATION COMPONENT
// ==========================================================================
export function DashboardManualIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        Analytics Engine: CSAT Formula & Adaptive Timeline Bucketing
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Metric Calculation Card */}
        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">1. CSAT Calculation Formula</span>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center font-mono text-blue-300 text-[11px]">
            CSAT = (Positive Votes / Total Votes) × 100
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-300">ตัวอย่าง: (480 / 520) × 100</span>
            <span className="font-bold text-emerald-400 text-sm">92.3% (Great)</span>
          </div>
        </div>

        {/* Adaptive Bucketing Card */}
        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">2. Adaptive Time Granularity</span>
          <div className="space-y-1.5 text-[11px]">
            <div className="p-1.5 rounded bg-blue-950/70 border border-blue-800/60 flex justify-between items-center">
              <span>เลือกช่วงเวลา ≤ 2 วัน</span>
              <strong className="text-blue-300 font-mono text-[10px]">Hourly (09:00, 10:00)</strong>
            </div>
            <div className="p-1.5 rounded bg-purple-950/70 border border-purple-800/60 flex justify-between items-center">
              <span>เลือกช่วงเวลา &gt; 2 วัน</span>
              <strong className="text-purple-300 font-mono text-[10px]">Daily (2026-11-10)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ─── 4. BRAND & BRANCH CO-LOCATION ILLUSTRATION COMPONENT
// ==========================================================================
export function BrandBranchManualIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
        Co-Location Structure: Many-to-Many Multi-Brand Mapping
      </div>

      <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="font-mono text-xs font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
              BKK001
            </span>
            <span className="font-bold text-white">สาขา ฟิวเจอร์พาร์ค รังสิต</span>
          </div>
          <p className="text-[11px] text-slate-400">ภาคกลาง · ปทุมธานี · เปิดบริการ Active</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700/80 text-center min-w-[100px]">
            <span className="block font-bold text-rose-300 text-xs">KFC</span>
            <span className="text-[9px] text-slate-400">Fried Chicken</span>
          </div>
          <span className="text-slate-500 font-bold">+</span>
          <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-700/80 text-center min-w-[100px]">
            <span className="block font-bold text-amber-300 text-xs">Mister Donut</span>
            <span className="text-[9px] text-slate-400">Bakery & Sweets</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 text-center md:text-right border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
          <span className="text-emerald-400 font-bold block">ตู้ Kiosk ร่วม 1 ตู้</span>
          <span className="text-[10px]">บันทึกลง branch_brands</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ─── 5. EVENT & CAMPAIGN CALENDAR ILLUSTRATION COMPONENT
// ==========================================================================
export function EventCampaignManualIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        Campaign Binding: Target Branches Matrix
      </div>

      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
          <span className="font-bold text-amber-300">แคมเปญ: เมนูพิเศษรับลมหนาว 2026</span>
          <span className="font-mono text-slate-400 text-[10px]">01 พ.ย. — 15 พ.ย. 2026</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="text-slate-400">กลุ่มสาขาเป้าหมาย:</span>
          <span className="px-2 py-0.5 rounded bg-blue-900/60 border border-blue-700 text-blue-200">
            ภาคกลาง (12 สาขา)
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700 text-purple-200">
            ภาคเหนือ (8 สาขา)
          </span>
          <span className="text-emerald-400 font-semibold ml-auto">
            ✓ กรองสถิติเทียบวันจัดงานได้อัตโนมัติ
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ─── 6. USER & SCOPE HIERARCHY TREE ILLUSTRATION COMPONENT
// ==========================================================================
export function UserScopeManualIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        4-Level Nested Hierarchy Scope Engine
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-blue-400 font-mono block">LEVEL 1</span>
          <strong className="text-white text-xs block mt-0.5">Brand Scopes</strong>
          <span className="text-[9px] text-slate-400">KFC, Mister Donut</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-purple-400 font-mono block">LEVEL 2</span>
          <strong className="text-white text-xs block mt-0.5">Region Scopes</strong>
          <span className="text-[9px] text-slate-400">กลาง, เหนือ, อีสาน, ใต้</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-amber-400 font-mono block">LEVEL 3</span>
          <strong className="text-white text-xs block mt-0.5">Province Scopes</strong>
          <span className="text-[9px] text-slate-400">กทม., เชียงใหม่, ฯลฯ</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-emerald-400 font-mono block">LEVEL 4</span>
          <strong className="text-white text-xs block mt-0.5">Branch Scopes</strong>
          <span className="text-[9px] text-slate-400">Future Park (BKK001)</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ─── 7. ROLE PERMISSION MATRIX 5D ILLUSTRATION COMPONENT
// ==========================================================================
export function RoleMatrixManualIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="flex items-center justify-between text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider mb-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          5-Dimension Permission Matrix & Batch Control
        </span>
        <span className="text-slate-400 text-[10px]">Transactional Upsert</span>
      </div>

      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-x-auto text-xs">
        <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-mono text-slate-400 pb-2 border-b border-slate-800">
          <span className="text-left font-bold text-slate-300">MODULE</span>
          <span className="text-blue-300">VIEW</span>
          <span className="text-emerald-300">CREATE</span>
          <span className="text-amber-300">UPDATE</span>
          <span className="text-rose-300">DELETE</span>
          <span className="text-purple-300">EXPORT</span>
        </div>

        <div className="grid grid-cols-6 gap-2 text-center text-[11px] items-center pt-2">
          <span className="text-left font-semibold text-slate-200">Dashboard</span>
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-slate-600">—</span>
          <span className="text-slate-600">—</span>
          <span className="text-slate-600">—</span>
          <span className="text-emerald-400 font-bold">✓</span>
        </div>

        <div className="grid grid-cols-6 gap-2 text-center text-[11px] items-center pt-1.5">
          <span className="text-left font-semibold text-slate-200">Branches</span>
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-rose-400 font-bold">✓</span>
          <span className="text-emerald-400 font-bold">✓</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ─── 8. ALERT NOTIFICATION & WATCHER ILLUSTRATION COMPONENT
// ==========================================================================
export function AlertNotificationIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        Alert Trigger Engine: Anomaly & Heartbeat Watcher
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-rose-300">HIGH PRIORITY ALERT</span>
            <span className="font-mono text-rose-400">CSAT &lt; 80%</span>
          </div>
          <p className="text-[11px] text-slate-300">
            ตรวจพบสาขาที่มีคะแนน 24 ชม. ต่ำกว่า 80% (เมื่อมีโหวต ≥ 5 ครั้ง) ยิงแจ้งเตือนถึงผู้จัดการทันที
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/60 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-amber-300">KIOSK DISCONNECT ALERT</span>
            <span className="font-mono text-amber-400">&gt; 15 Mins</span>
          </div>
          <p className="text-[11px] text-slate-300">
            ตู้ Kiosk หน้าร้านไม่ส่ง Heartbeat นานเกิน 15 นาที ระบบปรับสถานะเป็น Offline พร้อมเตือนเจ้าหน้าที่
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ─── 9. SETTINGS & DYNAMIC BROADCAST ILLUSTRATION COMPONENT
// ==========================================================================
export function SettingsConfigIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        Zero-Downtime Dynamic Broadcast Flow
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
        <div className="space-y-0.5 text-center sm:text-left">
          <span className="text-[10px] text-blue-400 font-mono block">SUPER ADMIN</span>
          <strong className="text-white text-xs">ปรับค่า ThankYouDuration: 2s</strong>
          <span className="text-[10px] text-slate-400 block">บันทึกที่หน้า /settings</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] py-1 px-2.5 rounded bg-slate-900 border border-emerald-500/30">
          <span>Broadcasting Event</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </div>

        <div className="space-y-0.5 text-center sm:text-right">
          <span className="text-[10px] text-emerald-400 font-mono block">TOUCHSCREEN KIOSK</span>
          <strong className="text-white text-xs">รับ Event csat_satisfaction_settings_updated</strong>
          <span className="text-[10px] text-emerald-300 block">อัปเดตเวลานับถอยหลังทันที 0s Downtime</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ─── 10. AUDIT DEEP DIFF INSPECTOR ILLUSTRATION COMPONENT
// ==========================================================================
export function AuditTrailIllustration() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white border border-slate-800 shadow-inner">
      <div className="flex items-center justify-between text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider mb-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Deep Diff Inspector: Old vs New Comparison
        </span>
        <span className="text-slate-400 text-[10px]">Actor Snapshot + IP</span>
      </div>

      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-slate-800">
          <span><strong>Action:</strong> UPDATE_BRANCH (BKK001)</span>
          <span className="font-mono text-[10px]">Actor: admin@satisfaction.local · 192.168.1.100</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300">
            <span className="text-[10px] text-rose-400 block">OLD VALUE:</span>
            <span>&quot;Status&quot;: &quot;Inactive&quot;</span>
          </div>
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
            <span className="text-[10px] text-emerald-400 block">NEW VALUE:</span>
            <span>&quot;Status&quot;: &quot;Active&quot;</span>
          </div>
        </div>
      </div>
    </div>
  );
}
