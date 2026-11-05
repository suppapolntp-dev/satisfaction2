"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LoginCredentials } from "@/Components/Auth/LoginForm";

export interface UseLoginScreenReturn {
  isAuthenticating: boolean;
  loginError: string | null;
  handleLoginSubmit: (credentials: LoginCredentials) => Promise<void>;
}

/**
 * 🪝 useLoginScreen
 * 
 * Colocated Hook ประจำหน้าจอ LoginScreen
 * ทำหน้าที่ประสานงานระหว่าง Screen Layout, Navigation Router และ API Authentication Flow
 */
export function useLoginScreen(): UseLoginScreenReturn {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginSubmit = useCallback(
    async (credentials: LoginCredentials) => {
      setLoginError(null);
      setIsAuthenticating(true);

      try {
        // TODO: Connect API [authService.login] with tiered MFA & JWT cookie session
        // For development/stubbing: Validate inputs and transition to dashboard
        if (!credentials.emailOrUserId || !credentials.password) {
          throw new Error("ข้อมูลการเข้าสู่ระบบไม่ครบถ้วน");
        }

        // นำทางไปยัง Dashboard ของระบบแอดมิน
        router.push("/dashboard");
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูล";
        setLoginError(errorMsg);
        throw err;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [router]
  );

  return {
    isAuthenticating,
    loginError,
    handleLoginSubmit,
  };
}
