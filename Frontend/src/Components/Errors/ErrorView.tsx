"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface ErrorViewProps {
  statusCode?: number | string;
  title?: string;
  description?: string;
  errorCode?: string;
  error?: Error & { digest?: string };
  reset?: () => void;
  primaryAction?: {
    label: string;
    icon?: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    icon?: string;
    onClick?: () => void;
    href?: string;
  };
  systemStatus?: string;
  className?: string;
}

/**
 * 🎨 Premium Editorial SaaS Error Illustrations (Inspired by Adam Fard Studio Dribbble shot)
 * Pure Vector SVG - Zero external dependencies, responsive, vibrant coral & deep petrol teal palette
 */
function EditorialIllustration({ statusCode }: { statusCode: number | string }) {
  const codeStr = String(statusCode);

  if (codeStr === "404") {
    // 🔍 404 Scene: Curious character searching among botanical shoots with magnifying glass
    return (
      <svg
        className="w-full h-full max-h-[190px]"
        viewBox="0 0 340 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Ground Soft Shadows */}
        <ellipse cx="170" cy="155" rx="100" ry="14" fill="#E2EAF1" />
        <ellipse cx="190" cy="157" rx="40" ry="5" fill="#0C2B3A" fillOpacity="0.12" />

        {/* Decorative Botanical Stems & Leaves */}
        <path d="M70 156 C65 130 85 105 105 110 C88 120 80 140 78 156 Z" fill="#0E747F" />
        <path d="M92 156 C88 135 115 120 125 128 C110 138 100 148 98 156 Z" fill="#2BB5B0" />
        <circle cx="106" cy="108" r="4" fill="#F95C2C" />

        {/* Searching Character */}
        {/* Legs / Coral Pants */}
        <path d="M172 156 L180 120 L188 156" stroke="#DC5B32" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M168 156 H176" stroke="#0F2231" strokeWidth="4" strokeLinecap="round" />
        <path d="M184 156 H192" stroke="#0F2231" strokeWidth="4" strokeLinecap="round" />

        {/* Torso & Light Slate Top */}
        <path d="M173 122 C173 98 193 98 193 122 Z" fill="#D9E4EC" />

        {/* Arms & Magnifying Glass */}
        <path d="M188 106 C198 108 212 98 216 102" stroke="#D9E4EC" strokeWidth="6" strokeLinecap="round" />
        <circle cx="224" cy="98" r="14" stroke="#0F2231" strokeWidth="3" fill="#E2EAF1" fillOpacity="0.5" />
        <line x1="234" y1="108" x2="244" y2="118" stroke="#0F2231" strokeWidth="4" strokeLinecap="round" />
        <text x="224" y="103" textAnchor="middle" fill="#F95C2C" fontSize="14" fontWeight="bold">?</text>

        {/* Head & Draped Hair */}
        <circle cx="183" cy="90" r="9" fill="#F8C3AF" />
        <path d="M180 82 C170 84 172 98 174 112 C178 116 182 108 182 96 C186 96 188 104 190 100 C192 90 190 82 180 82 Z" fill="#0F2231" />

        {/* Floating Sparkles & Accent Rings */}
        <circle cx="260" cy="50" r="10" stroke="#2BB5B0" strokeWidth="2.5" strokeDasharray="14 6" />
        <path d="M60 65 L64 57 L72 55 L64 53 L60 45 L56 53 L48 55 L56 57 Z" fill="#F95C2C" />
      </svg>
    );
  }

  if (codeStr === "403") {
    // 🔒 403 Scene: Guarded botanical gate with stylish padlock & protective leaves
    return (
      <svg
        className="w-full h-full max-h-[190px]"
        viewBox="0 0 340 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Ground Soft Shadows */}
        <ellipse cx="170" cy="155" rx="105" ry="14" fill="#E2EAF1" />
        <ellipse cx="170" cy="157" rx="42" ry="5" fill="#0C2B3A" fillOpacity="0.14" />

        {/* Surrounding Botanical Vines */}
        <path d="M100 156 C95 125 120 100 135 115 C122 125 110 142 108 156 Z" fill="#0E747F" />
        <path d="M240 156 C245 125 220 100 205 115 C218 125 230 142 232 156 Z" fill="#149B9E" />
        <path d="M125 156 C120 135 138 122 148 132 C138 140 132 148 130 156 Z" fill="#2BB5B0" />

        {/* Central Padlock Body */}
        {/* Shackle */}
        <path
          d="M152 105 V84 C152 74 160 66 170 66 C180 66 188 74 188 84 V105"
          stroke="#0F2231"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Lock Base */}
        <rect x="142" y="100" width="56" height="48" rx="14" fill="#F95C2C" />
        {/* Keyhole */}
        <circle cx="170" cy="120" r="5" fill="#FFFFFF" />
        <path d="M168 123 L166 134 H174 L172 123 Z" fill="#FFFFFF" />

        {/* Floating Security Glyphs */}
        <circle cx="68" cy="55" r="12" stroke="#F95C2C" strokeWidth="2" strokeDasharray="18 6" />
        <circle cx="68" cy="55" r="4" fill="#F95C2C" />
        <circle cx="270" cy="65" r="8" stroke="#2BB5B0" strokeWidth="2.5" />
      </svg>
    );
  }

  // 🥀 500 Scene: Exact Adam Fard Studio aesthetic - wilted flora in puddle + distressed slumped character
  return (
    <svg
      className="w-full h-full max-h-[190px]"
      viewBox="0 0 340 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Ground Soft Ambient Shadow */}
      <ellipse cx="170" cy="154" rx="110" ry="15" fill="#E2EAF1" />

      {/* Deep Contact Puddle Shadow */}
      <ellipse cx="175" cy="156" rx="48" ry="5.5" fill="#0C2B3A" fillOpacity="0.65" />

      {/* Wilted Drooping Flora (Deep Peacock Teal, Sea Green, Aqua) */}
      <path
        d="M175 156 C155 156 138 140 108 143 C85 145 60 152 50 155 C78 142 118 136 162 149 Z"
        fill="#0E747F"
      />
      <path
        d="M175 156 C158 151 146 128 116 134 C94 138 76 147 70 150 C98 132 132 124 166 146 Z"
        fill="#2BB5B0"
      />
      <path
        d="M175 156 C186 151 216 140 240 146 C258 149 270 154 272 155 C252 148 230 143 188 154 Z"
        fill="#149B9E"
      />
      {/* Small fallen leaf */}
      <ellipse cx="85" cy="158" rx="8" ry="3" fill="#2BB5B0" transform="rotate(-12 85 158)" />

      {/* Slumped Distressed Character */}
      {/* Folded Body & Legs (Coral/Rust Orange) */}
      <path
        d="M232 152 C226 128 232 114 244 114 C256 114 262 128 256 152 Z"
        fill="#DC5B32"
      />
      <path
        d="M238 152 C238 134 244 122 250 122 C256 122 258 134 254 152 Z"
        fill="#BF4620"
      />

      {/* Torso (Soft Powder Slate Blue) */}
      <path d="M234 126 C234 104 254 104 254 126 Z" fill="#D9E4EC" />

      {/* Arms raised clutching head in despair */}
      <path
        d="M235 125 C231 110 241 102 241 102"
        stroke="#D9E4EC"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M253 125 C257 110 247 102 247 102"
        stroke="#D9E4EC"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Peach Hands & Head */}
      <circle cx="244" cy="98" r="6" fill="#F8C3AF" />
      <circle cx="239" cy="97" r="3" fill="#F8C3AF" />
      <circle cx="249" cy="97" r="3" fill="#F8C3AF" />

      {/* Draped Dark Hair falling forward */}
      <path
        d="M244 90 C232 90 227 106 229 135 C234 140 239 128 239 110 C244 90 249 90 249 110 C249 128 254 140 259 135 C261 106 256 90 244 90 Z"
        fill="#0F2231"
      />

      {/* Top-Left Isolated Target Glyph (Dribbble Signature) */}
      <circle cx="62" cy="52" r="14" stroke="#F95C2C" strokeWidth="2.5" />
      <circle cx="62" cy="52" r="4.5" fill="#F95C2C" />

      {/* Bottom-Right Aqua Loop Ring */}
      <circle cx="282" cy="62" r="11" stroke="#2BB5B0" strokeWidth="2.5" strokeDasharray="16 6" />
    </svg>
  );
}

export function ErrorView({
  statusCode = 500,
  title,
  description,
  errorCode,
  error,
  reset,
  primaryAction,
  secondaryAction,
  systemStatus = "Operational",
  className = "",
}: ErrorViewProps) {
  const [showDetails, setShowDetails] = useState(false);

  const is404 = String(statusCode) === "404";
  const is403 = String(statusCode) === "403";

  const defaultTitle = is403
    ? "Oops! ปฏิเสธการเข้าถึง (403)"
    : is404
    ? "Oops! ไม่พบหน้าที่ต้องการ (404)"
    : "Oops something went wrong!";

  const defaultDescription = is403
    ? "คุณไม่มีสิทธิ์ระดับ Role หรือ Data Access Tier ที่จำเป็นในการเข้าถึงหน้านี้ หากต้องการใช้งานกรุณาติดต่อผู้ดูแลระบบ"
    : is404
    ? "หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่พร้อมใช้งานชั่วคราวในระบบ Enterprise CSAT"
    : "ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้งเพื่อกู้คืนการประมวลผล หรือกลับสู่หน้าหลัก";

  const defaultErrorCode =
    errorCode ||
    (is403
      ? "ERR_403_FORBIDDEN"
      : is404
      ? "ERR_404_NOT_FOUND"
      : "ERR_INTERNAL_SERVER_ERROR");

  const resolvedTitle = title || defaultTitle;
  const resolvedDescription = description || defaultDescription;

  return (
    <div
      className={`min-h-[82vh] w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0C2B3A] via-[#0E3547] to-[#0A2431] text-slate-800 relative select-none ${className}`}
    >
      {/* Background Decorative Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#149B9E]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#F95C2C]/10 blur-3xl" />
      </div>

      {/* ─── Main Modal Card (Adam Fard Style: 2px Dark Border, Rounded-3xl, White Card) ─── */}
      <div className="max-w-[440px] w-full bg-white rounded-3xl border-2 border-[#0F2231] p-6 sm:p-8 text-center shadow-2xl relative z-10 transition-all">
        {/* Editorial SaaS Vector Scene */}
        <div className="w-full flex items-center justify-center -mt-2 mb-3">
          <EditorialIllustration statusCode={statusCode} />
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F2231] tracking-tight mb-2">
          {resolvedTitle}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 px-2">
          {resolvedDescription}
        </p>

        {/* Action Buttons (Coral CTA as Primary) */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center w-full">
          {/* Primary Action */}
          {reset ? (
            <button
              onClick={reset}
              className="w-full sm:w-auto flex-1 bg-[#F95C2C] hover:bg-[#E04B1D] text-white font-semibold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>{primaryAction?.label || "ลองใหม่อีกครั้ง"}</span>
            </button>
          ) : primaryAction?.onClick ? (
            <button
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto flex-1 bg-[#F95C2C] hover:bg-[#E04B1D] text-white font-semibold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">{primaryAction.icon || "arrow_back"}</span>
              <span>{primaryAction.label}</span>
            </button>
          ) : (
            <Link
              href={primaryAction?.href || "/dashboard"}
              className="w-full sm:w-auto flex-1 bg-[#F95C2C] hover:bg-[#E04B1D] text-white font-semibold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">{primaryAction?.icon || "dashboard"}</span>
              <span>{primaryAction?.label || "กลับสู่หน้าหลัก"}</span>
            </Link>
          )}

          {/* Secondary Action */}
          {secondaryAction?.onClick ? (
            <button
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto flex-1 bg-white border border-slate-300 hover:border-[#0F2231] hover:text-[#0F2231] text-slate-600 font-medium py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">{secondaryAction.icon || "support_agent"}</span>
              <span>{secondaryAction.label}</span>
            </button>
          ) : (
            <Link
              href={secondaryAction?.href || "/login"}
              className="w-full sm:w-auto flex-1 bg-white border border-slate-300 hover:border-[#0F2231] hover:text-[#0F2231] text-slate-600 font-medium py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">{secondaryAction?.icon || "login"}</span>
              <span>{secondaryAction?.label || "เข้าสู่ระบบ"}</span>
            </Link>
          )}
        </div>

        {/* Collapsible Technical Details (Clean & Minimal) */}
        {error && (
          <div className="w-full mt-4 text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <span>{showDetails ? "ซ่อนข้อมูลทางเทคนิค" : "ดูข้อมูลทางเทคนิค"}</span>
              <span className="material-symbols-outlined text-[13px]">
                {showDetails ? "expand_less" : "expand_more"}
              </span>
            </button>

            {showDetails && (
              <div className="mt-2.5 p-3.5 bg-[#0F2231] text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 text-left border border-slate-700">
                <p className="text-[#F95C2C] font-semibold mb-1">
                  {error.name}: {error.message}
                </p>
                {error.digest && <p className="text-slate-400 mb-1">Digest: {error.digest}</p>}
                {error.stack && (
                  <pre className="text-[10px] text-slate-300 whitespace-pre-wrap mt-1 leading-relaxed">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Subtle Card Footer Info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Status: {systemStatus}</span>
          </div>
          <div>
            <span>Code: <code className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{defaultErrorCode}</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}

