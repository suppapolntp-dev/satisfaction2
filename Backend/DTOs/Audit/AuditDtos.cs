namespace Backend.DTOs.Audit;

/// <summary>
/// DTO สำหรับรายละเอียดความต่างก่อน-หลังแก้ไข (Diff Detail)
/// </summary>
public class AuditDiffDetailDto
{
    public string Field { get; set; } = string.Empty;
    public string BeforeValue { get; set; } = string.Empty;
    public string AfterValue { get; set; } = string.Empty;
}

/// <summary>
/// DTO สำหรับประวัติการทำงาน (Audit Log Item)
/// </summary>
public class AuditLogDto
{
    public string Id { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public string ActorName { get; set; } = string.Empty;
    public string ActorRole { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty; // CREATE, UPDATE, DELETE, LOGIN, EXPORT
    public string TargetEntity { get; set; } = string.Empty; // Brand, Branch, User, Role, System
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "SUCCESS"; // SUCCESS, FAILED, WARNING
    public string IpAddress { get; set; } = string.Empty;
    public List<AuditDiffDetailDto> DiffDetails { get; set; } = new();
}

/// <summary>
/// Request DTO สำหรับบันทึก Audit Log ใหม่
/// </summary>
public class CreateAuditLogRequest
{
    public string ActionType { get; set; } = "UPDATE";
    public string TargetEntity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "SUCCESS";
    public string? IpAddress { get; set; }
    public List<AuditDiffDetailDto>? DiffDetails { get; set; }
}

/// <summary>
/// DTO สำหรับสถานะการทำงานของบริการระบบ (ApiServiceHealth)
/// </summary>
public class ApiServiceHealthDto
{
    public string ServiceId { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string Status { get; set; } = "Operational"; // Operational, Degraded, Outage, Maintenance
    public decimal UptimePercent { get; set; } = 100.00m;
    public int LatencyMs { get; set; }
    public string LastChecked { get; set; } = string.Empty;
    public decimal ErrorRatePercent { get; set; } = 0.00m;
}

