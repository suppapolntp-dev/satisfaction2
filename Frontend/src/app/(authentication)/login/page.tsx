import { Metadata } from "next";
import { LoginScreen } from "@/Screens/Authentication/Login";

export const metadata: Metadata = {
  title: "Secure Login | Satisfaction Console",
  description: "Enterprise Customer Satisfaction & Multi-Tier Analytics Platform",
};

/**
 * 🚪 LoginPage (Next.js App Router Entry Point)
 * 
 * Entry point บางๆ ตามมาตรฐาน Clean Architecture
 * ทำหน้าที่ส่งต่อการเรนเดอร์ไปยัง Screen Component หลักที่ `src/Screens/Authentication/Login`
 */
export default function LoginPage() {
  return <LoginScreen />;
}
