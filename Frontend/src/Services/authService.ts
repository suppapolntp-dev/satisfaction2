import { apiClient, ApiResponse, setAuthCookies, clearAuthCookies } from "@/Lib/apiClient";

// ============================================================================
// TypeScript Type Definitions สำหรับระบบ Auth & Permissions
// ============================================================================

export type TierLevel = "SuperAdmin" | "Brand" | "Region" | "Province" | "Branch" | "CustomScope";

export interface DashboardPermissions {
    canViewSuperAdminOverview: boolean;
    canViewBrandRegionalGrid: boolean;
    canViewRegionalProvinceGrid: boolean;
    canViewProvincialBranchGrid: boolean;
    canViewBranchKiosksGrid: boolean;
}

export interface ModulePermission {
    moduleCode: string;
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canExport: boolean;
}

export interface UserProfile {
    id: string;
    userCode?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    roleCode: string;
    roleName: string;
    tierLevel: TierLevel;
    status: string;
    isMfaEnabled: boolean;
    dashboardPermissions?: DashboardPermissions;
    modulePermissions: ModulePermission[];
    brandScopes: string[];
    regionScopes: string[];
    provinceScopes: string[];
    branchScopes: string[];
}

export interface OtpInfo {
    userId: string;
    refCode: string;
    expiresInSeconds: number;
    phoneMasked: string;
}

export interface AuthResponse {
    requiresMfa: boolean;
    otpInfo?: OtpInfo;
    accessToken?: string;
    refreshToken?: string;
    expiresInDays?: number;
    user?: UserProfile;
}

// ============================================================================
// Auth Service API Calls
// ============================================================================

export const authService = {
    // 1. ส่ง Email & Password เพื่อ Login
    async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
        const response = await apiClient.post<AuthResponse>("/auth/login", { email, password });
        
        // ถ้า Login สำเร็จแบบไม่ต้องผ่าน OTP -> บันทึก Cookie ทันที
        if (response.success && response.data && !response.data.requiresMfa && response.data.accessToken) {
            setAuthCookies(response.data.accessToken, response.data.expiresInDays || 1);
            if (response.data.user) {
                localStorage.setItem("satisfaction_user_profile", JSON.stringify(response.data.user));
            }
        }
        
        return response;
    },

    // 2. ส่งรหัส OTP 6 หลัก เพื่อยืนยันตัวตน 2FA
    async verifyOtp(userId: string, otpCode: string, refCode: string): Promise<ApiResponse<AuthResponse>> {
        const response = await apiClient.post<AuthResponse>("/auth/verify-otp", { userId, otpCode, refCode });
        
        if (response.success && response.data && response.data.accessToken) {
            setAuthCookies(response.data.accessToken, response.data.expiresInDays || 1);
            if (response.data.user) {
                localStorage.setItem("satisfaction_user_profile", JSON.stringify(response.data.user));
            }
        }
        
        return response;
    },

    // 3. ดึงข้อมูลโปรไฟล์ สิทธิ์ และ Scopes ของตนเอง
    async getMe(): Promise<ApiResponse<UserProfile>> {
        return apiClient.get<UserProfile>("/auth/me");
    },

    // 4. ออกจากระบบ (Logout)
    async logout(): Promise<void> {
        try {
            await apiClient.post("/auth/logout");
        } catch {
            // แม้ Backend จะมีปัญหา ก็ให้ล้าง Cookie ฝั่ง Client ออกเสมอ
        } finally {
            clearAuthCookies();
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
    }
};

