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

export const API_MODE_STORAGE_KEY = "satisfaction_api_mode_enabled";

export function isApiModeEnabled(): boolean {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(API_MODE_STORAGE_KEY);
    return stored === null ? true : stored === "true";
}

export function setApiModeEnabled(enabled: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(API_MODE_STORAGE_KEY, enabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent("satisfaction:api-mode-change", { detail: { enabled } }));
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

async function ensureDevToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    const existing = getAuthToken();
    if (existing) return existing;

    try {
        const loginUrl = `${API_BASE_URL}/auth/login`;
        console.log("[apiClient] No auth token found. Attempting dev auto-login as admin...");
        const res = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin@satisfaction.local",
                password: "Admin@123456",
            }),
        });

        if (res.ok) {
            const data = await res.json();
            if (data?.success && data?.data?.accessToken) {
                const acquiredToken = data.data.accessToken;
                setAuthCookies(acquiredToken, data.data.expiresInDays || 1);
                console.log("[apiClient] Dev auto-login successful! Token set.");
                return acquiredToken;
            }
        }
    } catch (err) {
        console.warn("[apiClient] Dev auto-login skipped or unreachable:", err);
    }
    return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // ตรวจสอบโหมด API จากปุ่ม Toggle ที่ Navbar (หากปิด API ให้จำลองคืนค่าว่างเพื่อให้เห็น Empty State)
    if (!isApiModeEnabled()) {
        console.log(`[apiClient] API mode is DISABLED by Navbar toggle. Returning empty response for ${endpoint}`);
        return {
            success: true,
            message: "API mode disabled (Empty state preview)",
            data: null as any,
            errors: null,
            timestamp: new Date().toISOString(),
        };
    }

    let token = getAuthToken();

    if (!token && !endpoint.includes("/auth/")) {
        token = await ensureDevToken();
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    try {
        console.log(`[apiClient] Requesting: ${options.method || "GET"} ${url}`);
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "include", // ส่ง cookies ข้ามไปยัง Backend
        });

        console.log(`[apiClient] Response: ${options.method || "GET"} ${url} -> HTTP ${response.status}`);

        // จัดการกรณี 401 Unauthorized (Token หมดอายุ หรือยังไม่ได้ Login)
        if (response.status === 401) {
            console.warn(`[apiClient] 401 Unauthorized at ${endpoint} — clearing invalid token`);
            clearAuthCookies();
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
        console.warn(`[API Connection] ไม่สามารถเชื่อมต่อกับ Backend (${endpoint}):`, error?.message || error);
        return {
            success: false,
            message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์หลังบ้านได้ กรุณาตรวจสอบว่า Backend (port 5005) เปิดอยู่หรือไม่",
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

