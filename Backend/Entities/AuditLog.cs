namespace Backend.Entities;

/// <summary>
/// ตาราง audit_logs: บันทึกประวัติการทำงานของผู้ใช้งานเพื่อความโปร่งใสและตรวจสอบย้อนหลัง
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // เวลาที่เกิดเหตุการณ์
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    
    // ผู้กระทำ (Foreign Key, ยอมให้เป็น null ถ้าทำโดย System Background)
    public Guid? ActorUserId { get; set; }
    
    // บันทึก Snapshot ชื่อและบทบาท ณ เวลาที่ทำ ป้องกันกรณี User เปลี่ยนชื่อหรือถูกลบในภายหลัง
    public string ActorNameSnapshot { get; set; } = string.Empty;
    public string ActorRoleSnapshot { get; set; } = string.Empty;
    
    // ประเภท Action เช่น "CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT"
    public string ActionType { get; set; } = string.Empty;
    
    // ข้อมูลที่ถูกกระทำ เช่น "Brand", "Branch", "User", "Role"
    public string TargetEntity { get; set; } = string.Empty;
    
    // คำอธิบายเหตุการณ์ เช่น "แก้ไขข้อมูลสาขา Central World"
    public string Description { get; set; } = string.Empty;
    
    // สถานะ (SUCCESS, FAILED, WARNING)
    public string Status { get; set; } = "SUCCESS";
    
    // IP Address ของผู้ทำรายการ
    public string? IpAddress { get; set; }

    // Navigation Properties
    public User? ActorUser { get; set; }
    
    // รายละเอียดความเปลี่ยนแปลงค่าก่อน-หลัง (Visual Diff)
    public ICollection<AuditDiffDetail> DiffDetails { get; set; } = new List<AuditDiffDetail>();
}

