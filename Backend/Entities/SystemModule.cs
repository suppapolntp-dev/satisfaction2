namespace Backend.Entities;

/// <summary>
/// ตาราง system_modules: รายการโมดูล/เมนูทั้งหมดของระบบ (เช่น แดชบอร์ด, จัดการแบรนด์, จัดการผู้ใช้)
/// </summary>
public class SystemModule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // รหัสโมดูลที่ไม่ซ้ำกัน เช่น "DASHBOARD", "ORGANIZATION", "USERS", "ROLES"
    public string ModuleCode { get; set; } = string.Empty;
    
    // ชื่อแสดงผลภาษาไทย เช่น "แดชบอร์ดภาพรวม", "จัดการโครงสร้างองค์กร", "จัดการผู้ใช้งาน"
    public string ModuleLabel { get; set; } = string.Empty;
    
    // ลำดับการแสดงผลในหน้าจอตั้งค่าสิทธิ์
    public short DisplayOrder { get; set; } = 0;

    // Navigation Properties
    // สิทธิ์การเข้าถึงโมดูลนี้ของแต่ละ Role
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

