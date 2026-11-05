"use client";

import { useState, useCallback, FormEvent } from "react";

export interface LoginCredentials {
  corporateId: string;
  password: string;
}

export interface UseLoginFormOptions {
  initialCorporateId?: string;
  initialPassword?: string;
  onSubmit?: (credentials: LoginCredentials) => Promise<void> | void;
}

export interface FormFieldErrors {
  corporateId?: string;
  password?: string;
}

/**
 * 🪝 useLoginForm
 * 
 * Colocated Hook สำหรับจัดการ State, Validation, Toggle Password และ Submit Lifecycle
 * ของแบบฟอร์มล็อกอินระดับองค์กร (Strict API-Ready Mode โดยใช้ Corporate ID)
 */
export function useLoginForm({
  initialCorporateId = "",
  initialPassword = "",
  onSubmit,
}: UseLoginFormOptions = {}) {
  const [corporateId, setCorporateId] = useState<string>(initialCorporateId);
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

    if (!corporateId.trim()) {
      errors.corporateId = "กรุณากรอกรหัสประจำตัวองค์กร (Corporate ID)";
    }

    if (!password) {
      errors.password = "กรุณากรอกรหัสผ่าน";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [corporateId, password]);

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
        await onSubmit({ corporateId: corporateId.trim(), password });
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
    [corporateId, password, validate, onSubmit]
  );

  return {
    corporateId,
    setCorporateId,
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
