namespace Backend.DTOs.Events;

/// <summary>
/// DTO สำหรับแสดงผลรายการ Event ในตารางและปฏิทิน (ตรงกับ ScheduledEventItem / EventItem ใน Frontend)
/// </summary>
public class EventListItemDto
{
    public string EventId { get; set; } = string.Empty;
    public string EventName { get; set; } = string.Empty;
    public string EventDate { get; set; } = string.Empty; // YYYY-MM-DD
    public string StartTime { get; set; } = string.Empty; // HH:mm
    public string EndTime { get; set; } = string.Empty;   // HH:mm
    public string BrandScope { get; set; } = "ทุกแบรนด์";
    public Guid? BrandId { get; set; }
    public string EventLocation { get; set; } = string.Empty;
    public string EventCategory { get; set; } = "CAMPAIGN";
    public string EventStatus { get; set; } = "Upcoming"; // Upcoming, Active, Completed
    public string? Description { get; set; }
    public string? KioskThemeOverride { get; set; }
    public List<Guid> TargetBranchIds { get; set; } = new();
    public List<string> TargetBranchNames { get; set; } = new();
}

/// <summary>
/// Request DTO สำหรับสร้าง Event ใหม่
/// </summary>
public class CreateEventRequest
{
    public string? EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string EventDate { get; set; } = string.Empty; // YYYY-MM-DD
    public string StartTime { get; set; } = "09:00";
    public string EndTime { get; set; } = "18:00";
    public string BrandScope { get; set; } = "ทุกแบรนด์";
    public Guid? BrandId { get; set; }
    public string EventLocation { get; set; } = string.Empty;
    public string EventCategory { get; set; } = "CAMPAIGN";
    public string EventStatus { get; set; } = "Upcoming";
    public string? Description { get; set; }
    public string? KioskThemeOverride { get; set; }
    public List<Guid> TargetBranchIds { get; set; } = new();
}

/// <summary>
/// Request DTO สำหรับอัปเดต Event
/// </summary>
public class UpdateEventRequest
{
    public string? EventName { get; set; }
    public string? EventDate { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? BrandScope { get; set; }
    public Guid? BrandId { get; set; }
    public string? EventLocation { get; set; }
    public string? EventCategory { get; set; }
    public string? EventStatus { get; set; }
    public string? Description { get; set; }
    public string? KioskThemeOverride { get; set; }
    public List<Guid>? TargetBranchIds { get; set; }
}

/// <summary>
/// หมวดหมู่ของ Event
/// </summary>
public class EventCategoryDto
{
    public Guid Id { get; set; }
    public string CategoryCode { get; set; } = string.Empty;
    public string CategoryLabel { get; set; } = string.Empty;
    public short DisplayOrder { get; set; }
}

