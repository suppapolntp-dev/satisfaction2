"use client";

import React from "react";
import { BtnSatisfaction } from "@/Components/Buttons/SatifactionButton";
import { useSatisfactionScreen } from "./useSatisfactionScreen";

export default function SatisfactionScreen() {
  const {
    dynamicQuestionTitle,
    dynamicQuestionFontSize,
    dynamicSubtitle,
    dynamicSubtitleFontSize,
  } = useSatisfactionScreen();

  return (
    <main 
      onContextMenu={(e) => e.preventDefault()}
      className="h-screen w-full flex items-center justify-center p-4 lg:p-12 bg-white text-slate-800 select-none antialiased overflow-hidden cursor-default"
    >
      {/* กล่องจัดกึ่งกลางเนื้อหาหลักของตู้ Kiosk */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center pb-12 text-center select-none">
        
        {/* Section: หัวข้อคำถามประเมินความพึงพอใจและคำอธิบาย (ปรับข้อความและขนาดได้จาก System Settings) */}
        <header className="mb-12 pointer-events-none px-4 select-none" style={{ WebkitUserSelect: "none" }}>
          <h1 
            className="font-bold text-slate-800 mb-3 tracking-tight leading-tight transition-all select-none"
            style={{
              fontSize: `${dynamicQuestionFontSize}px`,
            }}
          >
            {dynamicQuestionTitle}
          </h1>
          <p 
            className="text-slate-500 font-medium transition-all select-none"
            style={{
              fontSize: `${dynamicSubtitleFontSize}px`,
            }}
          >
            {dynamicSubtitle}
          </p>
        </header>

        {/* Section: ชุดปุ่มกดอีโมจิประเมินความพึงพอใจ 3 ระดับ พร้อมแสงเรืองรอง */}
        <section className="w-full flex justify-center select-none">
          <BtnSatisfaction />
        </section>

      </div>
    </main>
  );
}