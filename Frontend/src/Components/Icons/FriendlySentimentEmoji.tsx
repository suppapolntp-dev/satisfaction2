"use client";

import React, { useState } from "react";

export type SentimentLevel = "sad" | "neutral" | "happy";

interface FriendlySentimentEmojiProps {
  level: SentimentLevel;
  className?: string;
  isHoveredOrActive?: boolean;
}

// ข้อมูลรูปภาพอิโมจิแบบ 3D และสีสันธรรมชาติ (Microsoft Fluent 3D / High-Res Natural Emojis)
const EMOJI_CDN_SOURCES: Record<SentimentLevel, { cdnUrl: string; altText: string }> = {
  sad: {
    cdnUrl: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Frowning%20face/3D/frowning_face_3d.png",
    altText: "Sad Frowning Face",
  },
  neutral: {
    cdnUrl: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Neutral%20face/3D/neutral_face_3d.png",
    altText: "Neutral Calm Face",
  },
  happy: {
    cdnUrl: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Grinning%20face%20with%20smiling%20eyes/3D/grinning_face_with_smiling_eyes_3d.png",
    altText: "Happy Smiling Face",
  },
};

/**
 * FriendlySentimentEmoji - อิโมจิความพึงพอใจ 3 ระดับ
 * รองรับทั้งภาพ 3D Natural Emoji ที่ดูมีมิติ สวยงาม สมจริง และมี Gradient Vector Fallback อัตโนมัติ
 */
export default function FriendlySentimentEmoji({
  level,
  className = "w-24 h-24 md:w-32 md:h-32",
  isHoveredOrActive = false,
}: FriendlySentimentEmojiProps) {
  const [imageError, setImageError] = useState<boolean>(false);
  const emojiSource = EMOJI_CDN_SOURCES[level];

  // หากโหลดรูป CDN ไม่ได้หรือทำงานแบบ Offline จะแสดงผลด้วย High-Quality Gradient 3D Vector ด้านล่าง
  if (imageError) {
    if (level === "sad") {
      return (
        <svg
          viewBox="0 0 120 120"
          className={`${className} transition-transform duration-300 ${isHoveredOrActive ? "scale-110" : ""}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="sadGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFE4E6" />
              <stop offset="60%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#DC2626" />
            </radialGradient>
            <filter id="shadowSad" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#991B1B" floodOpacity="0.25" />
            </filter>
          </defs>
          <circle cx="60" cy="60" r="50" fill="url(#sadGrad)" filter="url(#shadowSad)" />
          {/* Eyes */}
          <ellipse cx="44" cy="50" rx="5" ry="6.5" fill="#450A0A" />
          <ellipse cx="76" cy="50" rx="5" ry="6.5" fill="#450A0A" />
          <circle cx="42" cy="47.5" r="2" fill="#FFFFFF" />
          <circle cx="74" cy="47.5" r="2" fill="#FFFFFF" />
          {/* Sad Eyebrows */}
          <path d="M36 40 Q44 45 50 43" stroke="#450A0A" strokeWidth="3" strokeLinecap="round" />
          <path d="M84 40 Q76 45 70 43" stroke="#450A0A" strokeWidth="3" strokeLinecap="round" />
          {/* Mouth */}
          <path d="M44 80 Q60 66 76 80" stroke="#450A0A" strokeWidth="5.5" strokeLinecap="round" />
          {/* Cute Tear */}
          <path d="M84 58 Q88 64 85 68 Q82 70 80 67 Q78 63 84 58 Z" fill="#38BDF8" opacity="0.9" />
        </svg>
      );
    }

    if (level === "neutral") {
      return (
        <svg
          viewBox="0 0 120 120"
          className={`${className} transition-transform duration-300 ${isHoveredOrActive ? "scale-110" : ""}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="neutralGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="60%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <filter id="shadowNeu" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#78350F" floodOpacity="0.25" />
            </filter>
          </defs>
          <circle cx="60" cy="60" r="50" fill="url(#neutralGrad)" filter="url(#shadowNeu)" />
          {/* Eyes */}
          <circle cx="44" cy="52" r="5.5" fill="#451A03" />
          <circle cx="76" cy="52" r="5.5" fill="#451A03" />
          <circle cx="42" cy="49.5" r="2" fill="#FFFFFF" />
          <circle cx="74" cy="49.5" r="2" fill="#FFFFFF" />
          {/* Eyebrows */}
          <path d="M38 42 L50 42" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 42 L82 42" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
          {/* Straight Mouth */}
          <path d="M44 76 L76 76" stroke="#451A03" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      );
    }

    // Happy
    return (
      <svg
        viewBox="0 0 120 120"
        className={`${className} transition-transform duration-300 ${isHoveredOrActive ? "scale-110" : ""}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="happyGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#DCFCE7" />
            <stop offset="55%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
          <filter id="shadowHap" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#064E3B" floodOpacity="0.25" />
          </filter>
        </defs>
        <circle cx="60" cy="60" r="50" fill="url(#happyGrad)" filter="url(#shadowHap)" />
        {/* Joyful Eyes (^_^) */}
        <path d="M35 52 Q44 40 53 52" stroke="#064E3B" strokeWidth="5" strokeLinecap="round" />
        <path d="M67 52 Q76 40 85 52" stroke="#064E3B" strokeWidth="5" strokeLinecap="round" />
        {/* Rosy Cheeks */}
        <ellipse cx="28" cy="62" rx="7" ry="4" fill="#FBCFE8" opacity="0.85" />
        <ellipse cx="92" cy="62" rx="7" ry="4" fill="#FBCFE8" opacity="0.85" />
        {/* Big Smile */}
        <path d="M40 66 Q60 92 80 66" fill="#064E3B" stroke="#064E3B" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 78 Q60 88 70 78 Z" fill="#FB7185" />
      </svg>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className} transition-transform duration-300 ${isHoveredOrActive ? "scale-110" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={emojiSource.cdnUrl}
        alt={emojiSource.altText}
        onError={() => setImageError(true)}
        className="w-full h-full object-contain pointer-events-none drop-shadow-md select-none"
        loading="eager"
      />
    </div>
  );
}
