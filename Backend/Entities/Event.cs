namespace Backend.Entities;

/// <summary>
/// ตาราง events: ปฏิทินกิจกรรม แคมเปญการตลาด หรือการตรวจสาขา
/// </summary>
public class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // รหัสกิจกรรม เช่น "EVT-2026-001"
    public string EventCode { get; set; } = string.Empty;
    
    // ชื่อกิจกรรม เช่น "แคมเปญวันเด็ก แจกไอศกรีมฟรี", "ตรวจความสะอาดประจำไตรมาส"
    public string EventName { get; set; } = string.Empty;
    
    // วันที่จัดกิจกรรม (ใช้ DateOnly ของ C# สำหรับเก็บเฉพาะวันที่)
    public DateOnly EventDate { get; set; }
    
    // เวลาเริ่ม และ เวลาสิ้นสุด (ใช้ TimeOnly ของ C# สำหรับเก็บเฉพาะเวลา)
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    
    // แบรนด์ที่จัดกิจกรรม (ถ้าเป็น null แปลว่าจัดทุกแบรนด์)
    public Guid? BrandId { get; set; }
    
    // สถานที่จัดกิจกรรม
    public string? EventLocation { get; set; }
    
    // หมวดหมู่กิจกรรม (Foreign Key)
    public Guid? CategoryId { get; set; }
    
    // สถานะกิจกรรม (Upcoming, Active, Completed)
    public string EventStatus { get; set; } = "Upcoming";
    
    public string? Description { get; set; }
    
    // ธีมหน้าจอ Kiosk พิเศษระหว่างจัดกิจกรรม (เช่น ธีมคริสต์มาส, ธีมวันตรุษจีน)
    public string? KioskThemeOverride { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // ผู้สร้างกิจกรรม
    public Guid? CreatedBy { get; set; }

    // Navigation Properties
    public Brand? Brand { get; set; }
    public EventCategory? Category { get; set; }
    public User? Creator { get; set; }
    
    // สาขาเป้าหมายที่จัดกิจกรรมนี้ (เชื่อมผ่านตาราง Junction EventTargetBranch)
    public ICollection<EventTargetBranch> EventTargetBranches { get; set; } = new List<EventTargetBranch>();
}

