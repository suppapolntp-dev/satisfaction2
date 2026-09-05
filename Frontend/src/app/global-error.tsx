"use client";

import React, { useEffect } from "react";
import { ErrorView } from "@/Components/Errors/ErrorView";
import "@/app/globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Layout Error:", error);
  }, [error]);

  return (
    <html lang="th">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="bg-[#f7f9fb] text-slate-800 antialiased min-h-screen">
        <ErrorView
          statusCode={500}
          title="เกิดข้อผิดพลาดร้ายแรงของระบบ"
          description="ระบบไม่สามารถเรนเดอร์โครงสร้างหน้าหลักได้ กรุณากดปุ่มเพื่อลองใหม่อีกครั้ง"
          errorCode={error.digest ? `ERR_GLOBAL_${error.digest.slice(0, 8)}` : "ERR_CRITICAL_GLOBAL"}
          error={error}
          reset={reset}
          primaryAction={{
            label: "ลองใหม่อีกครั้ง",
            icon: "refresh",
          }}
          secondaryAction={{
            label: "กลับสู่หน้าเข้าสู่ระบบ",
            icon: "login",
            href: "/login",
          }}
        />
      </body>
    </html>
  );
}

