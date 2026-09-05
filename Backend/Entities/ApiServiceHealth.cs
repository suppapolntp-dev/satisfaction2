namespace Backend.Entities;

/// <summary>
/// ตาราง api_service_health: ตรวจสอบสถานะการทำงาน (Uptime & Latency) ของ Microservices / APIs
/// </summary>
public class ApiServiceHealth
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // รหัสบริการ เช่น "AUTH_SERVICE", "KIOSK_API", "DATABASE_CLUSTER"
    public string ServiceCode { get; set; } = string.Empty;
    
    public string ServiceName { get; set; } = string.Empty;
    
    public string Endpoint { get; set; } = string.Empty;
    
    // สถานะ (Operational, Degraded, Outage, Maintenance)
    public string Status { get; set; } = "Operational";
    
    // อัตรา Uptime เช่น 99.98%
    public decimal UptimePercent { get; set; } = 100.00m;
    
    // ความเร็วในการตอบสนอง (ms)
    public int LatencyMs { get; set; } = 0;
    
    // อัตรา Error Rate เช่น 0.01%
    public decimal ErrorRatePercent { get; set; } = 0.00m;
    
    public DateTime LastCheckedAt { get; set; } = DateTime.UtcNow;
}

