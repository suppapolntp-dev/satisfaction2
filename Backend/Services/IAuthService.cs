using Backend.Common;
using Backend.DTOs.Auth;

namespace Backend.Services;

/// <summary>
/// Interface สัญญาการทำงานของระบบ Authentication & User Profile
/// </summary>
public interface IAuthService
{
    // ตรวจสอบ Email / Password และตัดสินใจว่าต้องส่ง SMS OTP หรือออก Token ทันที
    Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null);
    
    // ตรวจสอบรหัส OTP 6 หลัก และออก JWT Token เมื่อยืนยัน 2FA สำเร็จ
    Task<ApiResponse<AuthResponseDto>> VerifyOtpAndLoginAsync(VerifyOtpRequest request, string? ipAddress = null, string? userAgent = null);
    
    // ขอ Access Token ใบใหม่โดยใช้ Refresh Token
    Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken, string? ipAddress = null, string? userAgent = null);
    
    // ดึงข้อมูลโปรไฟล์ สิทธิ์ และ Scopes ของผู้ใช้ปัจจุบัน
    Task<ApiResponse<UserProfileDto>> GetUserProfileAsync(Guid userId);
    
    // ยกเลิก Session เมื่อผู้ใช้กด Logout
    Task<ApiResponse> LogoutAsync(Guid userId, string? refreshToken = null);
}

