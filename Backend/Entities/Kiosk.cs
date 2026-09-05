using Backend.Common;

namespace Backend.Entities;

/// <summary>
/// ตาราง kiosks: ตู้ประเมินความพึงพอใจจอสัมผัสที่ตั้งอยู่หน้าร้าน
/// </summary>
public class Kiosk
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // รหัสตู้ที่ไม่ซ้ำกัน เช่น "KS-CTW-01"
    public string KioskCode { get; set; } = string.Empty;
    
    // ชื่อเรียกตู้ เช่น "ตู้หน้าเคาน์เตอร์แคชเชียร์ 1"
    public string KioskName { get; set; } = string.Empty;
    
    // ตู้นี้ตั้งอยู่ที่สาขาไหน (Foreign Key)
    public Guid BranchId { get; set; }
    
    // สถานะของตู้ (ใช้ Enum: Online, Offline, Maintenance)
    public KioskStatus Status { get; set; } = KioskStatus.Online;
    
    // เวลาที่ตู้ส่งสัญญาณ Heartbeat มาล่าสุด (บอกว่ายังไม่ดับ)
    public DateTime? LastPingAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties (ความสัมพันธ์)
    public Branch? Branch { get; set; } // สาขาที่ตู้นี้ติดตั้งอยู่
    
    // รายการผลโหวตที่ถูกกดจากตู้นี้
    public ICollection<SatisfactionVote> SatisfactionVotes { get; set; } = new List<SatisfactionVote>();
}

