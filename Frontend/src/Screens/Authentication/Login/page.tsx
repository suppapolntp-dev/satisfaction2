"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import { OtpVerificationModal } from "@/Components/Modals/OtpVerificationModal";
import { OtpInfo } from "@/Services/authService";

export function LoginScreen() {
    const router = useRouter();
    const { login, verifyOtp } = useAuth();

    // ─── 1. Form States ───
    const [emailOrUserId, setEmailOrUserId] = useState("admin@satisfaction.local");
    const [password, setPassword] = useState("Admin@123456");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // ─── 2. 2FA SMS OTP Modal States ───
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpInfo, setOtpInfo] = useState<OtpInfo | null>(null);
    const [otpErrorMessage, setOtpErrorMessage] = useState<string | null>(null);

    // ─── 3. ฟังก์ชัน Submit ฟอร์ม Login ───
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            const response = await login(emailOrUserId, password);

            if (!response.success) {
                setErrorMessage(response.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                return;
            }

            // 🛡️ กรณีบัญชีเปิดใช้ 2FA (SMS OTP)
            if (response.data && response.data.requiresMfa && response.data.otpInfo) {
                setOtpInfo(response.data.otpInfo);
                setIsOtpModalOpen(true);
                return;
            }

            // เข้าสู่ระบบสำเร็จ ➜ นำทางไปหน้า Dashboard
            router.push("/dashboard");
        } catch (error: any) {
            setErrorMessage(error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        } finally {
            setIsLoading(false);
        }
    };

    // ─── 4. ฟังก์ชันยืนยัน OTP 6 หลัก ───
    const handleVerifyOtp = async (otpCode: string): Promise<boolean> => {
        if (!otpInfo) return false;
        setOtpErrorMessage(null);
        setIsLoading(true);

        try {
            const response = await verifyOtp(otpInfo.userId, otpCode, otpInfo.refCode);

            if (!response.success) {
                setOtpErrorMessage(response.message || "รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
                return false;
            }

            setIsOtpModalOpen(false);
            router.push("/dashboard");
            return true;
        } catch (error: any) {
            setOtpErrorMessage(error.message || "การตรวจสอบรหัส OTP ล้มเหลว");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // ─── 5. ฟังก์ชันขอรหัส OTP ใหม่ (Resend) ───
    const handleResendOtp = async () => {
        setOtpErrorMessage(null);
        try {
            const response = await login(emailOrUserId, password);
            if (response.success && response.data?.otpInfo) {
                setOtpInfo(response.data.otpInfo);
            }
        } catch {
            setOtpErrorMessage("ไม่สามารถขอรหัส OTP ใหม่ได้ในขณะนี้");
        }
    };

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col gap-6 select-none z-10">
            
            {/* 📊 ส่วนหัวแสดงสัญลักษณ์โปรเจกต์ (Header Section) */}
            <header className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-blue-900 rounded-2xl flex items-center justify-center mb-3 shadow-md text-white">
                    <span className="material-symbols-outlined text-[32px]">
                        sentiment_satisfied
                    </span>
                </div>
                <h1 className="font-bold text-2xl text-blue-900 tracking-tight">Satisfaction Console</h1>
                <p className="text-xs text-neutral-500 mt-1">Enterprise CSAT & Multi-Tier Analytics</p>
            </header>

            {/* ⚠️ ข้อความแจ้งเตือน Error */}
            {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3.5 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                    <span className="material-symbols-outlined text-[20px] text-rose-500 shrink-0">
                        error
                    </span>
                    <span className="font-medium">{errorMessage}</span>
                </div>
            )}

            {/* 📝 แบบฟอร์มกรอกข้อมูลความปลอดภัย ─── */}
            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>

                {/* กล่องอินพุต: Email / User ID */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider" htmlFor="emailOrUserId">
                        Email / Corporate ID
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <input
                            className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 focus:bg-white outline-none transition-all text-sm text-neutral-800 placeholder:text-neutral-400"
                            id="emailOrUserId"
                            type="text"
                            placeholder="admin@satisfaction.local"
                            value={emailOrUserId}
                            onChange={(e) => setEmailOrUserId(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* กล่องอินพุต: Password */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <input
                            className="w-full h-12 pl-10 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 focus:bg-white outline-none transition-all text-sm text-neutral-800 placeholder:text-neutral-400 font-mono"
                            id="password"
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        
                        <button
                            type="button"
                            aria-label="Toggle password visibility"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors touch-manipulation cursor-pointer"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                            <span className="material-symbols-outlined">
                                {isPasswordVisible ? "visibility" : "visibility_off"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* ปุ่มส่งข้อมูล Secure Login */}
                <button
                    className="w-full h-12 mt-2 bg-blue-900 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-blue-950 focus:ring-4 focus:ring-blue-900/25 active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation cursor-pointer"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="material-symbols-outlined text-[20px] animate-spin">
                                progress_activity
                            </span>
                            <span>กำลังเข้าสู่ระบบ...</span>
                        </>
                    ) : (
                        <>
                            <span>Secure Login</span>
                            <span className="material-symbols-outlined text-[18px]">
                                arrow_forward
                            </span>
                        </>
                    )}
                </button>
            </form>

            {/* 🔐 Popup Modal สำหรับ 2FA SMS OTP */}
            <OtpVerificationModal
                isOpen={isOtpModalOpen}
                otpInfo={otpInfo}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onCancel={() => {
                    setIsOtpModalOpen(false);
                    setOtpInfo(null);
                    setOtpErrorMessage(null);
                }}
                isLoading={isLoading}
                errorMessage={otpErrorMessage}
            />
        </div>
    );
}