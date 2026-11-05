import React from "react";
import { ErrorView } from "@/Components/Errors/ErrorView";

export default function UnauthorizedPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[70vh]">
      <ErrorView
        statusCode={403}
        title="403 - ปฏิเสธการเข้าถึง (Access Denied)"
        description="คุณไม่มีสิทธิ์ระดับ Role หรือ Data Access Tier ที่จำเป็นในการเข้าถึงหน้านี้ หากจำเป็นต้องใช้งาน กรุณาติดต่อ Super Admin"
        errorCode="ERR_403_FORBIDDEN"
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
    </div>
  );
}
