"use client";

import React, { useState } from "react";

export function LoginScreen() {
    // ─── 1. States ตัวแปรควบคุมระบบ (Descriptive Naming) ───
    const [corporateUserId, setCorporateUserId] = useState("");
    const [accountPassword, setAccountPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // ─── 2. ตรรกะฟังก์ชันส่งข้อมูลเข้าสู่ระบบ ───
    const handleFormSubmit = (submitEvent: React.FormEvent) => {
        submitEvent.preventDefault();
        
        // เคลียร์คอมเมนต์ภาษาต่างดาวออกหมดจด พิมพ์สระไทย-อังกฤษชัดเจนสำหรับทีม
        console.log("Submit targeted details:", { 
            corporateUserId, 
            accountPassword 
        });
    };

    // ─── 3. [Creative] ระบบคำนวณความปลอดภัยของรหัสผ่านแบบง่าย ───
    const getPasswordStrengthScore = () => {
        if (accountPassword.length === 0) return 0;
        if (accountPassword.length < 6) return 1; // อ่อนแอ (Weak)
        if (accountPassword.length < 10) return 2; // ปานกลาง (Medium)
        return 3; // ปลอดภัยสูง (Strong)
    };

    const currentStrengthScore = getPasswordStrengthScore();

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col gap-6 select-none z-10">
            
            {/* 📊 [Component] ส่วนหัวแสดงสัญลักษณ์โปรเจกต์ (Header Section) */}
            <header className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center mb-4 shadow-sm text-white animate-pulse">
                    <span className="material-symbols-outlined text-[28px]">
                        analytics
                    </span>
                </div>
                <h1 className="font-bold text-2xl text-blue-900 tracking-tight">Enterprise CSAT</h1>
                <p className="text-sm text-neutral-500 mt-1">Sign in to the Admin Console</p>
            </header>

            {/* 📝 [CSS & Clean] แบบฟอร์มกรอกข้อมูลความปลอดภัย ─── */}
            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>

                {/* กล่องอินพุต: User ID */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider" htmlFor="userId">
                        User ID
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <input
                            className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none transition-all text-sm text-neutral-800 placeholder:text-neutral-400"
                            id="userId"
                            type="text"
                            placeholder="Enter your corporate ID"
                            value={corporateUserId}
                            onChange={(changeEvent) => setCorporateUserId(changeEvent.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* กล่องอินพุต: Password */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider" htmlFor="password">
                            Password
                        </label>
                        <a
                            className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline transition-colors focus:outline-none"
                            href="#"
                        >
                            Forgot Password?
                        </a>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <input
                            className="w-full h-12 pl-10 pr-12 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none transition-all text-sm text-neutral-800 placeholder:text-neutral-400 font-mono"
                            id="password"
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="••••••••"
                            value={accountPassword}
                            onChange={(changeEvent) => setAccountPassword(changeEvent.target.value)}
                            required
                        />
                        
                        {/* ปุ่มเปิด/ซ่อนรหัสผ่าน ปรับโครงสร้าง Event และความเร็วการตอบสนองบน iPad */}
                        <button
                            type="button"
                            aria-label="Toggle password visibility"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors touch-manipulation"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                            <span className="material-symbols-outlined">
                                {isPasswordVisible ? "visibility" : "visibility_off"}
                            </span>
                        </button>
                    </div>

                    {/* 💡 [Creative] Password Strength Bar - แถบแสดงสถานะความปลอดภัยรหัสผ่านแบบ Real-time */}
                    {accountPassword.length > 0 && (
                        <div className="flex flex-col gap-1 mt-1 transition-all duration-300">
                            <div className="flex gap-1 h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 rounded-full ${
                                    currentStrengthScore === 1 ? "w-1/3 bg-rose-500" :
                                    currentStrengthScore === 2 ? "w-2/3 bg-amber-500" :
                                    "w-full bg-emerald-500"
                                }`} />
                            </div>
                            <span className={`text-[10px] font-bold ${
                                currentStrengthScore === 1 ? "text-rose-500" :
                                currentStrengthScore === 2 ? "text-amber-500" :
                                "text-emerald-500"
                            }`}>
                                {currentStrengthScore === 1 && "Weak password"}
                                {currentStrengthScore === 2 && "Medium security"}
                                {currentStrengthScore === 3 && "Strong secure password"}
                            </span>
                        </div>
                    )}
                </div>

                {/* ปุ่มส่งข้อมูล Secure Login */}
                <button
                    className="w-full h-12 mt-2 bg-blue-900 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-blue-950 focus:ring-4 focus:ring-blue-900/25 active:scale-[0.98] touch-manipulation"
                    type="submit"
                >
                    <span>Secure Login</span>
                    <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                    </span>
                </button>
            </form>

            {/* ⚠️ ประกาศข้อความระบบความปลอดภัยขององค์กร */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-neutral-500 shrink-0 text-[20px]">
                    info
                </span>
                <div className="text-xs text-neutral-500 leading-relaxed">
                    Access to the Enterprise CSAT platform is restricted to authorized personnel. New account requests must be provisioned through your department's system administrator.
                </div>
            </div>
        </div>
    );
}