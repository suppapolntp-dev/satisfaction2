"use client";

import React from "react";
import { BtnSatisfaction } from "@/Components/Buttons/SatifactionButton";

export default function SatisfactionPage() {
  return (
    <main className="h-screen w-full flex items-center justify-center p-4 lg:p-12 bg-white text-neutral-800">
      {/* กล่องจัดกึ่งกลางเนื้อหาหลักของตู้ Kiosk */}
      <div className="w-full max-w-4xl flex flex-col items-center justify-center pb-20 text-center select-none">
        
        {/* Section: หัวข้อคำถามประเมินความพึงพอใจ */}
        <header className="mb-12 pointer-events-none" style={{ WebkitUserSelect: "none" }}>
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-800 mb-4 tracking-tight">
            ท่านมีความพึงพอใจกับการบริการในวันนี้อย่างไร?
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 font-medium">
            โปรดประเมินความพึงพอใจจากตัวเลือกด้านล่าง
          </p>
        </header>

        {/* Section: ชุดปุ่มกดอีโมจิประเมินความพึงพอใจ */}
        <section className="w-full flex justify-center">
          <BtnSatisfaction />
        </section>

      </div>
    </main>
  );
}