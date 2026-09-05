using Backend.Common;

namespace Backend.DTOs.Kiosks;

/// <summary>
/// DTO สำหรับแสดงข้อมูลตู้ Kiosk ในสาขา
/// </summary>
public class KioskListItemDto
{
    public Guid Id { get; set; }
    public string KioskCode { get; set; } = string.Empty;
    public string KioskName { get; set; } = string.Empty;
    public Guid BranchId { get; set; }
    public string BranchCode { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public string Status { get; set; } = "Online"; // Online, Offline, Maintenance
    public DateTime? LastPingAt { get; set; }
    public int TotalVotesCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request สำหรับลงทะเบียนตู้ Kiosk ใหม่
/// </summary>
public class RegisterKioskRequest
{
    public string KioskCode { get; set; } = string.Empty;
    public string KioskName { get; set; } = string.Empty;
    public Guid BranchId { get; set; }
    public string Status { get; set; } = "Online";
}

/// <summary>
/// Request สำหรับอัปเดตสถานะตู้ Kiosk
/// </summary>
public class UpdateKioskStatusRequest
{
    public string Status { get; set; } = "Online"; // Online, Offline, Maintenance
}

/// <summary>
/// Response จากการส่ง Heartbeat
/// </summary>
public class KioskHeartbeatResponse
{
    public Guid KioskId { get; set; }
    public string Status { get; set; } = "Online";
    public DateTime ServerTime { get; set; } = DateTime.UtcNow;
    public bool HasConfigUpdate { get; set; }
}

