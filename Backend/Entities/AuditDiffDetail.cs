namespace Backend.Entities;

/// <summary>
/// ตาราง audit_diff_details: รายละเอียดการเปลี่ยนแปลงของฟิลด์ข้อมูล (Visual Before/After Diff)
/// </summary>
public class AuditDiffDetail
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // เชื่อมกับบันทึก Audit Log (Foreign Key)
    public Guid AuditLogId { get; set; }
    
    // ชื่อฟิลด์ที่มีการแก้ไข เช่น "BrandName", "KioskCount", "Status"
    public string FieldName { get; set; } = string.Empty;
    
    // ค่าเดิมก่อนแก้ไข
    public string? BeforeValue { get; set; }
    
    // ค่าใหม่หลังแก้ไข
    public string? AfterValue { get; set; }

    // Navigation Property
    public AuditLog? AuditLog { get; set; }
}

