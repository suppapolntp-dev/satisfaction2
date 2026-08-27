"use client";

import React, { useState, useEffect } from "react";
import { BtnSatisfaction } from "@/Components/Buttons/SatifactionButton";
import { 
  SatisfactionConfig, 
  DEFAULT_SATISFACTION_CONFIG, 
  getStoredSatisfactionConfig 
} from "@/Lib/satisfactionSettings";

export default function SatisfactionScreen() {
  const [satisfactionConfig, setSatisfactionConfig] = useState<SatisfactionConfig>(DEFAULT_SATISFACTION_CONFIG);

  // ดึงค่าการตั้งค่าเพื่อแสดงหัวข้อและคำอธิบายตามที่ตั้งไว้ใน System Settings
  useEffect(() => {
    const loadConfig = () => {
      setSatisfactionConfig(getStoredSatisfactionConfig());
    };

    loadConfig();

    const handleSettingsUpdated = () => loadConfig();
    window.addEventListener("csat_satisfaction_settings_updated", handleSettingsUpdated);

    return () => {
      window.removeEventListener("csat_satisfaction_settings_updated", handleSettingsUpdated);
    };
  }, []);

  const dynamicQuestionTitle = satisfactionConfig.questionTitle || "ท่านมีความพึงพอใจกับการบริการในวันนี้อย่างไร?";
  const dynamicQuestionFontSize = Number(satisfactionConfig.questionFontSize) || 36;
  
  const dynamicSubtitle = satisfactionConfig.questionSubtitle || "โปรดประเมินความพึงพอใจจากตัวเลือกด้านล่าง";
  const dynamicSubtitleFontSize = Number(satisfactionConfig.subtitleFontSize) || 18;

  return (
    <main className="h-screen w-full flex items-center justify-center p-4 lg:p-12 bg-white text-slate-800">
      {/* กล่องจัดกึ่งกลางเนื้อหาหลักของตู้ Kiosk */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center pb-12 text-center select-none">
        
        {/* Section: หัวข้อคำถามประเมินความพึงพอใจและคำอธิบาย (ปรับข้อความและขนาดได้จาก System Settings) */}
        <header className="mb-12 pointer-events-none px-4" style={{ WebkitUserSelect: "none" }}>
          <h1 
            className="font-bold text-slate-800 mb-3 tracking-tight leading-tight transition-all"
            style={{
              fontSize: `${dynamicQuestionFontSize}px`,
            }}
          >
            {dynamicQuestionTitle}
          </h1>
          <p 
            className="text-slate-500 font-medium transition-all"
            style={{
              fontSize: `${dynamicSubtitleFontSize}px`,
            }}
          >
            {dynamicSubtitle}
          </p>
        </header>

        {/* Section: ชุดปุ่มกดอีโมจิประเมินความพึงพอใจ 3 ระดับ พร้อมแสงเรืองรอง */}
        <section className="w-full flex justify-center">
          <BtnSatisfaction />
        </section>

      </div>
    </main>
  );
}