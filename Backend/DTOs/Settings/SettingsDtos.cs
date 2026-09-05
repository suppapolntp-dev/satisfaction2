namespace Backend.DTOs.Settings;

// ข้อมูลการตั้งค่าระบบส่วนกลางทั้งหมด
public class SystemSettingsDto
{
    public int JwtExpiryDays { get; set; } = 1;        // อายุ JWT Token (วัน) เช่น 1, 7, 30
    public int OtpExpiryMinutes { get; set; } = 3;     // เวลาหมดอายุ OTP (นาที) เช่น 3, 5
    public int OtpCooldownSeconds { get; set; } = 60;  // เวลารอขอ OTP ใหม่ (วินาที) เช่น 60
    public string SystemName { get; set; } = "Enterprise CSAT Management Platform";
}

// Request ตอนแอดมินกดบันทึกการตั้งค่าจากหน้าเว็บ
public class UpdateSystemSettingsRequest
{
    public int JwtExpiryDays { get; set; } = 1;
    public int OtpExpiryMinutes { get; set; } = 3;
    public int OtpCooldownSeconds { get; set; } = 60;
    public string SystemName { get; set; } = string.Empty;
}

