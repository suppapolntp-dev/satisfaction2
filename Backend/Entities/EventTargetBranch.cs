namespace Backend.Entities;

/// <summary>
/// ตาราง event_target_branches: ตารางเชื่อมระหว่าง Event กับ สาขาเป้าหมาย (Event <-> Branch Junction)
/// เพื่อระบุว่ากิจกรรมนี้จัดเฉพาะที่สาขาไหนบ้าง
/// </summary>
public class EventTargetBranch
{
    // รหัสกิจกรรม (Foreign Key)
    public Guid EventId { get; set; }
    
    // รหัสสาขาที่เข้าร่วมกิจกรรม (Foreign Key)
    public Guid BranchId { get; set; }

    // Navigation Properties
    public Event? Event { get; set; }
    public Branch? Branch { get; set; }
}

