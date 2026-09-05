namespace Backend.Entities;

/// <summary>
/// ตาราง role_permissions: สิทธิ์การใช้งานระดับโมดูลของแต่ละ Role
/// กำหนดได้ 5 สิทธิ์: ดู, สร้าง, แก้ไข, ลบ, ส่งออกรายงาน
/// </summary>
public class RolePermission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // บทบาทใด (Foreign Key เชื่อมกับ Role)
    public Guid RoleId { get; set; }
    
    // โมดูลใด (Foreign Key เชื่อมกับ SystemModule)
    public Guid ModuleId { get; set; }
    
    // สิทธิ์ 5 อย่าง (CRUD + Export)
    public bool CanView { get; set; } = false;   // ดูข้อมูลได้ไหม
    public bool CanCreate { get; set; } = false; // กดเพิ่มข้อมูลได้ไหม
    public bool CanUpdate { get; set; } = false; // กดแก้ไขข้อมูลได้ไหม
    public bool CanDelete { get; set; } = false; // กดลบข้อมูลได้ไหม
    public bool CanExport { get; set; } = false; // กดดาวน์โหลด Excel/PDF ได้ไหม

    // Navigation Properties
    public Role? Role { get; set; }
    public SystemModule? Module { get; set; }
}

