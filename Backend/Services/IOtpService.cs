using Backend.DTOs.Auth;
using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// Interface สัญญาการทำงานของระบบ SMS OTP
/// </summary>
public interface IOtpService
{
    // สร้างรหัส OTP 6 หลัก + Ref Code และส่ง SMS ไปที่เบอร์โทรศัพท์ของผู้ใช้
    Task<OtpSentResponseDto> GenerateAndSendOtpAsync(User user);
    
    // ตรวจสอบความถูกต้องของรหัส OTP และ Ref Code
    Task<bool> VerifyOtpAsync(Guid userId, string otpCode, string refCode);
}

