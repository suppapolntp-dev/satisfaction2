"use client";

import React, { useState, useEffect, useRef } from "react";
import { OtpInfo } from "@/Services/authService";

interface OtpVerificationModalProps {
    isOpen: boolean;
    otpInfo: OtpInfo | null;
    onVerify: (otpCode: string) => Promise<boolean>;
    onResend: () => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    errorMessage?: string | null;
}

export function OtpVerificationModal({
    isOpen,
    otpInfo,
    onVerify,
    onResend,
    onCancel,
    isLoading = false,
    errorMessage = null,
}: OtpVerificationModalProps) {
    const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState<number>(otpInfo?.expiresInSeconds || 180);
    const [canResend, setCanResend] = useState<boolean>(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // นับเวลาถอยหลัง 3 นาที
    useEffect(() => {
        if (!isOpen) return;

        setTimeLeft(otpInfo?.expiresInSeconds || 180);
        setCanResend(false);
        setOtpDigits(["", "", "", "", "", ""]);

        // Auto-focus ช่องแรก
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                if (prev <= (otpInfo?.expiresInSeconds || 180) - 60) {
                    setCanResend(true); // ปลดล็อกปุ่มขอรหัสใหม่หลังผ่านไป 60 วินาที
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, otpInfo]);

    if (!isOpen || !otpInfo) return null;

    // จัดการตอนพิมพ์ตัวเลขในแต่ละช่อง
    const handleDigitChange = (index: number, value: string) => {
        // รับเฉพาะตัวเลข
        const numericValue = value.replace(/\D/g, "");
        if (!numericValue && value !== "") return;

        const newDigits = [...otpDigits];

        // กรณี Copy & Paste 6 หลักพร้อมกัน
        if (numericValue.length > 1) {
            const pasted = numericValue.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pasted[i] || "";
            }
            setOtpDigits(newDigits);
            const nextFocusIndex = Math.min(pasted.length, 5);
            inputRefs.current[nextFocusIndex]?.focus();
            return;
        }

        newDigits[index] = numericValue.slice(-1);
        setOtpDigits(newDigits);

        // เลื่อน Cursor ไปช่องถัดไปอัตโนมัติ
        if (numericValue && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // จัดการปุ่ม Backspace ลบแล้วถอยหลัง
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = otpDigits.join("");
        if (fullCode.length === 6) {
            await onVerify(fullCode);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const isComplete = otpDigits.every((d) => d !== "");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 flex flex-col gap-6 select-none animate-in zoom-in-95 duration-200">
                
                {/* Header Section */}
                <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shadow-inner">
                        <span className="material-symbols-outlined text-[32px]">
                            verified_user
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        ยืนยันรหัส SMS OTP (2FA)
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                        กรุณากรอกรหัส 6 หลักที่ได้รับทางข้อความ SMS เพื่อความปลอดภัยระดับสูงสุด
                    </p>
                </div>

                {/* Ref Code & Masked Phone Info Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 font-medium">ส่งไปยังเบอร์</span>
                        <span className="font-semibold text-slate-700 font-mono text-sm">
                            {otpInfo.phoneMasked || "081-xxx-5678"}
                        </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-slate-400 font-medium">รหัสอ้างอิง (Ref)</span>
                        <span className="font-bold text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded text-xs font-mono tracking-wider">
                            {otpInfo.refCode}
                        </span>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* 6-Digit OTP Form */}
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
                    <div className="flex justify-between gap-2">
                        {otpDigits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleDigitChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading || timeLeft === 0}
                                className={`w-12 h-14 text-center text-xl font-bold font-mono rounded-xl border transition-all outline-none
                                    ${digit ? "border-blue-900 bg-blue-50/30 text-blue-950 shadow-sm" : "border-slate-200 bg-slate-50/50 text-slate-800"}
                                    focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 focus:bg-white
                                    disabled:opacity-50 disabled:bg-slate-100`}
                            />
                        ))}
                    </div>

                    {/* Countdown Timer & Resend Button */}
                    <div className="flex items-center justify-between text-xs px-1">
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">
                                timer
                            </span>
                            <span>หมดอายุใน:</span>
                            <span className={`font-mono font-semibold ${timeLeft < 30 ? "text-rose-600 font-bold animate-pulse" : "text-slate-700"}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={onResend}
                            disabled={!canResend || isLoading}
                            className={`font-semibold transition-colors
                                ${canResend ? "text-blue-900 hover:text-blue-700 underline cursor-pointer" : "text-slate-300 cursor-not-allowed"}`}
                        >
                            ขอรหัสใหม่
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2.5">
                        <button
                            type="submit"
                            disabled={!isComplete || isLoading || timeLeft === 0}
                            className="w-full h-12 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined text-[20px] animate-spin">
                                        progress_activity
                                    </span>
                                    <span>กำลังตรวจสอบ...</span>
                                </>
                            ) : (
                                <span>ยืนยันเข้าสู่ระบบ</span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="w-full h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-medium rounded-xl text-xs transition-colors cursor-pointer"
                        >
                            ยกเลิก / เปลี่ยนบัญชี
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

