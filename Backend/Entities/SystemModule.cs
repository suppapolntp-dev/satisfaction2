namespace Backend.Entities;

/// <summary>
/// ตาราง system_modules: รายการโมดูล/เมนูทั้งหมดของระบบ (ทั้งโมดูลหลักและฟังก์ชันย่อยแบบ Tree)
/// </summary>
public class SystemModule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // รหัสโมดูลที่ไม่ซ้ำกัน เช่น "DASHBOARD", "DASHBOARD_FILTER", "EVENTS_CALENDAR_VIEW"
    public string ModuleCode { get; set; } = string.Empty;
    
    // ชื่อแสดงผล เช่น "dashboard (แดชบอร์ดและการวิเคราะห์)", "filter", "calendar view"
    public string ModuleLabel { get; set; } = string.Empty;

    // คำอธิบายโมดูลหรือฟังก์ชันย่อย
    public string? Description { get; set; }

    // รหัสโมดูลแม่ (สำหรับโครงสร้าง Tree Hierarchy - ถ้าเป็น null แปลว่าเป็นโมดูลหลัก)
    public Guid? ParentId { get; set; }
    
    // ลำดับการแสดงผลในหน้าจอตั้งค่าสิทธิ์
    public short DisplayOrder { get; set; } = 0;

    // Navigation Properties
    public SystemModule? Parent { get; set; }
    public ICollection<SystemModule> Children { get; set; } = new List<SystemModule>();

    // สิทธิ์การเข้าถึงโมดูลนี้ของแต่ละ Role
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
