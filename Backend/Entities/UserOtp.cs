using Backend.Common;

namespace Backend.Entities;

/// <summary>
/// ตาราง user_otps: จัดการรหัส OTP 6 หลัก, Ref Code, และเวลานับถอยหลังหมดอายุ
/// </summary>
public class UserOtp
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // ผู้ใช้ที่ขอรหัส OTP (Foreign Key)
    public Guid UserId { get; set; }
    
    // รหัสตัวเลข 6 หลัก (เช่น "584912")
    public string OtpCode { get; set; } = string.Empty;
    
    // รหัสอ้างอิง Ref Code 4 ตัวอักษร (เช่น "AB9X") ให้ผู้ใช้เทียบกับใน SMS
    public string RefCode { get; set; } = string.Empty;
    
    // เวลาที่รหัสนี้จะหมดอายุ (ปกติ 3-5 นาที)
    public DateTime ExpiresAt { get; set; }
    
    // สถานะว่ายืนยันถูกต้องไปแล้วหรือยัง
    public bool IsVerified { get; set; } = false;
    
    // สถานะของ OTP (Pending, Verified, Expired, Failed)
    public OtpStatus Status { get; set; } = OtpStatus.Pending;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public User? User { get; set; }
}

