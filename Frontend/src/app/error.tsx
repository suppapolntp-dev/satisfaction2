"use client";

import React, { useEffect } from "react";
import { ErrorView } from "@/Components/Errors/ErrorView";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // บันทึก Error สำหรับการติดตาม (Logging / Telemetry)
    console.error("App Router Caught Error:", error);
  }, [error]);

  return (
    <ErrorView
      statusCode={500}
      title="เกิดข้อผิดพลาดในการโหลดข้อมูล"
      description="ระบบไม่สามารถประมวลผลคำขอนี้ได้ในขณะนี้ กรุณากดปุ่มลองใหม่อีกครั้ง หรือกลับไปที่หน้าหลัก"
      errorCode={error.digest ? `ERR_${error.digest.slice(0, 8)}` : "ERR_APPLICATION_ERROR"}
      error={error}
      reset={reset}
      primaryAction={{
        label: "ลองใหม่อีกครั้ง",
        icon: "refresh",
      }}
      secondaryAction={{
        label: "กลับสู่หน้า Dashboard",
        icon: "dashboard",
        href: "/dashboard",
      }}
    />
  );
}

