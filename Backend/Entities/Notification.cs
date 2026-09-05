namespace Backend.Entities;

/// <summary>
/// ตาราง notifications: แจ้งเตือนระบบ, ข้อเสนอแนะลูกค้า, หรือ Alert สำคัญ
/// </summary>
public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string Title { get; set; } = string.Empty;
    
    // ประเภทการแจ้งเตือน (Alert, Feedback, System)
    public string NotificationType { get; set; } = "Alert";
    
    public string Description { get; set; } = string.Empty;
    
    // อ่านแล้วหรือยัง
    public bool IsRead { get; set; } = false;
    
    // สาขาเป้าหมายที่เกิดเหตุการณ์ (Nullable)
    public Guid? TargetBranchId { get; set; }
    
    // ผู้รับการแจ้งเตือน (ถ้าเป็น null แปลว่าแจ้งเตือนถึงทุกคนในสาขานั้น)
    public Guid? RecipientUserId { get; set; }
    
    // ระดับความสำคัญ (High, Medium, Low)
    public string Priority { get; set; } = "Medium";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    // Navigation Properties
    public Branch? TargetBranch { get; set; }
    public User? RecipientUser { get; set; }
}

