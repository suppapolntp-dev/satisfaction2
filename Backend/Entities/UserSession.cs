namespace Backend.Entities;

/// <summary>
/// ตาราง user_sessions: จัดการ JWT Refresh Token, อุปกรณ์ที่ Login เข้ามา, และการ Revoke สิทธิ์
/// </summary>
public class UserSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // ผู้ใช้งานเจ้าของ Session นี้ (Foreign Key)
    public Guid UserId { get; set; }
    
    // Hash ของ Refresh Token เพื่อความปลอดภัย
    public string RefreshTokenHash { get; set; } = string.Empty;
    
    // วันเวลาที่ Refresh Token จะหมดอายุ (เช่น 30 วัน)
    public DateTime ExpiresAt { get; set; }
    
    // IP Address ของอุปกรณ์ที่ Login เข้ามา
    public string? IpAddress { get; set; }
    
    // ข้อมูลเบราว์เซอร์หรือเครื่องที่ใช้เข้าสู่ระบบ (User-Agent)
    public string? UserAgent { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // เวลาที่ถูกยกเลิกสิทธิ์ (ถ้าผู้ใช้กด Logout หรือถูกสั่งตัดสิทธิ์ ค่านี้จะมีเวลาถูกบันทึก)
    public DateTime? RevokedAt { get; set; }

    // Navigation Property
    public User? User { get; set; }
}

