namespace Backend.Entities;

/// <summary>
/// ตาราง system_settings: การตั้งค่าระบบส่วนกลางแบบ Dynamic Key-Value (JSONB)
/// เช่น อายุของ JWT Token, เวลานับถอยหลัง OTP, นโยบายความปลอดภัย
/// </summary>
public class SystemSetting
{
    // ใช้ SettingKey เป็น Primary Key เช่น "JWT_EXPIRY_DAYS", "OTP_EXPIRY_MINUTES"
    public string SettingKey { get; set; } = string.Empty;
    
    // ข้อมูลการตั้งค่ารูปแบบ JSON
    public string SettingValue { get; set; } = "{}";
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // ผู้แก้ไขค่าการตั้งค่านี้ล่าสุด (Foreign Key)
    public Guid? UpdatedBy { get; set; }

    // Navigation Property
    public User? Updater { get; set; }
}

