namespace Backend.Entities;

/// <summary>
/// ตาราง roles: บทบาท/ตำแหน่งของผู้ใช้งาน (เช่น Super Admin, Area Manager, Branch Staff)
/// </summary>
public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // รหัสบทบาทที่ไม่ซ้ำกัน เช่น "SUPER_ADMIN", "AREA_MANAGER", "BRANCH_STAFF"
    public string RoleCode { get; set; } = string.Empty;
    
    // ชื่อบทบาทที่แสดง เช่น "ผู้ดูแลระบบสูงสุด", "ผู้จัดการเขตพื้นที่"
    public string RoleName { get; set; } = string.Empty;
    
    // คำอธิบายหน้าที่ของบทบาทนี้
    public string? RoleDescription { get; set; }
    
    // สถานะ (Active, Inactive)
    public string RoleStatus { get; set; } = "Active";
    
    // เป็น Role เริ่มต้นของระบบที่ไม่ควรถูกลบใช่หรือไม่
    public bool IsSystemDefault { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties (ความสัมพันธ์)
    // สิทธิ์รายโมดูลของ Role นี้ (เช่น ดูได้, แก้ไขได้)
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    
    // รายชื่อผู้ใช้งานทั้งหมดที่ถือ Role นี้อยู่
    public ICollection<User> Users { get; set; } = new List<User>();
}

