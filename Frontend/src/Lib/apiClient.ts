// ============================================================================
// Enterprise API Client - ศูนย์กลางการยิง HTTP Requests เชื่อมต่อ Backend C#
// ============================================================================

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    timestamp: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

export function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    // อ่าน Token จาก Cookie
    const match = document.cookie.match(new RegExp("(^| )satisfaction_access_token=([^;]+)"));
    if (match) return match[2];

    // Fallback: อ่านจาก localStorage
    return localStorage.getItem("satisfaction_access_token");
}

export function setAuthCookies(accessToken: string, expiresInDays: number = 1) {
    if (typeof window === "undefined") return;

    // บันทึกลง Cookie สำหรับให้ Next.js Middleware อ่านได้
    const maxAge = expiresInDays * 24 * 60 * 60;
    document.cookie = `satisfaction_access_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
    
    // บันทึกลง localStorage สำรอง
    localStorage.setItem("satisfaction_access_token", accessToken);
}

export function clearAuthCookies() {
    if (typeof window === "undefined") return;
    document.cookie = "satisfaction_access_token=; path=/; max-age=0; SameSite=Lax";
    localStorage.removeItem("satisfaction_access_token");
    localStorage.removeItem("satisfaction_user_profile");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = getAuthToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "include", // ส่ง cookies ข้ามไปยัง Backend
        });

        // จัดการกรณี 401 Unauthorized (Token หมดอายุ หรือยังไม่ได้ Login)
        if (response.status === 401) {
            clearAuthCookies();
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
            return {
                success: false,
                message: "Unauthorized",
                data: null as any,
                errors: ["Unauthorized"],
                timestamp: new Date().toISOString(),
            };
        }

        const text = await response.text();
        const data: ApiResponse<T> = text ? JSON.parse(text) : {
            success: response.ok,
            message: response.statusText,
            data: null as any,
            errors: null,
            timestamp: new Date().toISOString(),
        };

        return data;
    } catch (error: any) {
        console.error(`[API Error] Request failed on ${endpoint}:`, error);
        return {
            success: false,
            message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์หลังบ้านได้ (ตรวจสอบสถานะ Backend)",
            data: null as any,
            errors: [error.message || "Network Error"],
            timestamp: new Date().toISOString(),
        };
    }
}

export const apiClient = {
    get: <T>(endpoint: string, options?: RequestInit) => 
        request<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, body?: any, options?: RequestInit) => 
        request<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),

    put: <T>(endpoint: string, body?: any, options?: RequestInit) => 
        request<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),

    delete: <T>(endpoint: string, options?: RequestInit) => 
        request<T>(endpoint, { ...options, method: "DELETE" }),
};

