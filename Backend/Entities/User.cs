using Backend.Common;

namespace Backend.Entities;

/// <summary>
/// ตาราง users: ข้อมูลผู้ใช้งานระบบหลังบ้านทั้งหมด (Admin, Manager, Staff)
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // รหัสพนักงาน เช่น "EMP-001"
    public string? UserCode { get; set; }
    
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    
    // อีเมลสำหรับ Login (เป็น Case-insensitive ใน PostgreSQL)
    public string Email { get; set; } = string.Empty;
    
    // เบอร์โทรศัพท์สำหรับรับ SMS OTP ยืนยันตัวตน 2FA
    public string? Phone { get; set; }
    
    // รหัสผ่านที่เข้ารหัสด้วย BCrypt One-way Hash
    public string PasswordHash { get; set; } = string.Empty;
    
    // บทบาทผู้ใช้ (Foreign Key เชื่อมกับ Role)
    public Guid RoleId { get; set; }
    
    // ระดับชั้น 5 ระดับ (หรือ Custom) ใช้ Enum: SuperAdmin, Brand, Region, Province, Branch, CustomScope
    public TierLevel TierLevel { get; set; } = TierLevel.Branch;
    
    // สถานะบัญชี (Active, Inactive)
    public string Status { get; set; } = "Active";
    
    // สวิตช์เปิด-ปิดการบังคับใช้ 2FA SMS OTP สำหรับผู้ใช้คนนี้
    public bool IsMfaEnabled { get; set; } = false;
    
    // เวลาที่เข้าสู่ระบบล่าสุด
    public DateTime? LastLoginAt { get; set; }
    
    // สำหรับ Soft Delete (ระงับบัญชีโดยไม่ลบทิ้ง)
    public DateTime? DeletedAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties (ความสัมพันธ์)
    public Role? Role { get; set; } // ตำแหน่ง/บทบาทของผู้ใช้คนนี้
    
    // สิทธิ์การมองเห็นหน้า Dashboard รายบุคคล (1-to-1)
    public UserPermission? UserPermission { get; set; }
    
    // รายการ Session / Refresh Token
    public ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();
    
    // ประวัติการขอรหัส OTP
    public ICollection<UserOtp> UserOtps { get; set; } = new List<UserOtp>();

    // 4 Scopes ในการเข้าถึงข้อมูลตามลำดับชั้น
    public ICollection<UserBrandScope> UserBrandScopes { get; set; } = new List<UserBrandScope>();
    public ICollection<UserRegionScope> UserRegionScopes { get; set; } = new List<UserRegionScope>();
    public ICollection<UserProvinceScope> UserProvinceScopes { get; set; } = new List<UserProvinceScope>();
    public ICollection<UserBranchScope> UserBranchScopes { get; set; } = new List<UserBranchScope>();
    
    // การแจ้งเตือนที่ส่งถึงผู้ใช้นี้
    public ICollection<Notification> ReceivedNotifications { get; set; } = new List<Notification>();
}

