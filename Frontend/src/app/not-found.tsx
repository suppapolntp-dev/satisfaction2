import React from "react";
import { ErrorView } from "@/Components/Errors/ErrorView";

export default function NotFound() {
  return (
    <ErrorView
      statusCode={404}
      title="404 - ไม่พบหน้าที่ต้องการ"
      description="หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่พร้อมใช้งานชั่วคราวในระบบ Enterprise CSAT"
      errorCode="ERR_404_NOT_FOUND"
      primaryAction={{
        label: "เข้าสู่ระบบ",
        icon: "login",
        href: "/login",
      }}
      secondaryAction={{
        label: "Dashboard",
        icon: "dashboard",
        href: "/dashboard",
      }}
    />
  );
}

