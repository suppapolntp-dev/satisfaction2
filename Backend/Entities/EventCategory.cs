namespace Backend.Entities;

/// <summary>
/// ตาราง event_categories: หมวดหมู่ของกิจกรรม (เช่น โปรโมชั่น, วันหยุดนักขัตฤกษ์, ตรวจสาขา Audit)
/// </summary>
public class EventCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // รหัสหมวดหมู่ เช่น "PROMOTION", "HOLIDAY", "INSPECTION", "MAINTENANCE"
    public string CategoryCode { get; set; } = string.Empty;
    
    // ชื่อแสดงผล เช่น "โปรโมชั่นการตลาด", "วันหยุดนักขัตฤกษ์", "ตรวจประเมินสาขา"
    public string CategoryLabel { get; set; } = string.Empty;
    
    public short DisplayOrder { get; set; } = 0;

    // Navigation Properties
    public ICollection<Event> Events { get; set; } = new List<Event>();
}

