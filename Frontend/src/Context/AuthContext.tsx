"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService, UserProfile, AuthResponse, ModulePermission } from "@/Services/authService";
import { getAuthToken, ApiResponse } from "@/Lib/apiClient";

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<ApiResponse<AuthResponse>>;
    verifyOtp: (userId: string, otpCode: string, refCode: string) => Promise<ApiResponse<AuthResponse>>;
    logout: () => Promise<void>;
    hasPermission: (moduleCode: string, action?: keyof Omit<ModulePermission, "moduleCode">) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // ดึงข้อมูล User Profile เมื่อแอปเริ่มต้น
    useEffect(() => {
        const initAuth = async () => {
            const token = getAuthToken();
            
            if (!token) {
                setIsLoading(false);
                return;
            }

            // 1. อ่านข้อมูลเร็วจาก localStorage ก่อนเพื่อความลื่นไหลของ UI
            const cachedUser = localStorage.getItem("satisfaction_user_profile");
            if (cachedUser) {
                try {
                    setUser(JSON.parse(cachedUser));
                } catch {
                    // ignore json error
                }
            }

            // 2. ยิงยืนยันกับ Backend จริงผ่าน /api/auth/me
            try {
                const response = await authService.getMe();
                if (response.success && response.data) {
                    setUser(response.data);
                    localStorage.setItem("satisfaction_user_profile", JSON.stringify(response.data));
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login(email, password);
            if (response.success && response.data && !response.data.requiresMfa && response.data.user) {
                setUser(response.data.user);
            }
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async (userId: string, otpCode: string, refCode: string) => {
        setIsLoading(true);
        try {
            const response = await authService.verifyOtp(userId, otpCode, refCode);
            if (response.success && response.data && response.data.user) {
                setUser(response.data.user);
            }
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // ฟังก์ชันตรวจสอบสิทธิ์รายโมดูล (Granular Permission Checker)
    const hasPermission = (
        moduleCode: string, 
        action: keyof Omit<ModulePermission, "moduleCode"> = "canView"
    ): boolean => {
        if (!user) return false;
        
        // Super Admin ผ่านได้ทุกอย่างเสมอ
        if (user.tierLevel === "SuperAdmin" || user.roleCode === "SUPER_ADMIN") {
            return true;
        }

        const perm = user.modulePermissions.find(
            (p) => p.moduleCode.toUpperCase() === moduleCode.toUpperCase()
        );

        return perm ? Boolean(perm[action]) : false;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                isLoading,
                login,
                verifyOtp,
                logout,
                hasPermission,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

