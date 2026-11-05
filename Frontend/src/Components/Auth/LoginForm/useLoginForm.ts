"use client";

import { useState, useCallback, FormEvent } from "react";

export interface LoginCredentials {
  emailOrUserId: string;
  password: string;
}

export interface UseLoginFormOptions {
  initialEmail?: string;
  initialPassword?: string;
  onSubmit?: (credentials: LoginCredentials) => Promise<void> | void;
}

export interface FormFieldErrors {
  emailOrUserId?: string;
  password?: string;
}

/**
 * 🪝 useLoginForm
 * 
 * Colocated Hook สำหรับจัดการ State, Validation, Toggle Password และ Submit Lifecycle
 * ของแบบฟอร์มล็อกอินระดับองค์กร (Strict API-Ready Mode)
 */
export function useLoginForm({
  initialEmail = "",
  initialPassword = "",
  onSubmit,
}: UseLoginFormOptions = {}) {
  const [emailOrUserId, setEmailOrUserId] = useState<string>(initialEmail);
  const [password, setPassword] = useState<string>(initialPassword);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const validate = useCallback((): boolean => {
    const errors: FormFieldErrors = {};

    if (!emailOrUserId.trim()) {
      errors.emailOrUserId = "กรุณากรอกอีเมลหรือรหัสประจำตัวองค์กร";
    }

    if (!password) {
      errors.password = "กรุณากรอกรหัสผ่าน";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [emailOrUserId, password]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMessage(null);

      if (!validate()) {
        return;
      }

      if (!onSubmit) {
        return;
      }

      setIsLoading(true);
      try {
        await onSubmit({ emailOrUserId: emailOrUserId.trim(), password });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    },
    [emailOrUserId, password, validate, onSubmit]
  );

  return {
    emailOrUserId,
    setEmailOrUserId,
    password,
    setPassword,
    isPasswordVisible,
    togglePasswordVisibility,
    isLoading,
    setIsLoading,
    errorMessage,
    setErrorMessage,
    fieldErrors,
    handleSubmit,
  };
}
