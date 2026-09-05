using Backend.Common;

namespace Backend.Entities;

/// <summary>
/// ตาราง satisfaction_votes: บันทึกผลการกดประเมินความพึงพอใจจากลูกค้าหน้าร้าน (High-Throughput Table)
/// </summary>
public class SatisfactionVote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // โหวตที่สาขาไหน (Foreign Key)
    public Guid BranchId { get; set; }
    
    // โหวตที่ตู้ Kiosk ตัวไหน (Foreign Key, ยอมให้เป็น null ได้ถ้ากดผ่าน Web Kiosk)
    public Guid? KioskId { get; set; }
    
    // โหวตให้แบรนด์ไหน (Foreign Key)
    public Guid BrandId { get; set; }
    
    // ผลการประเมิน (Enum: Positive = พอใจ, Neutral = ปานกลาง, Negative = ไม่พอใจ)
    public SentimentType Sentiment { get; set; }
    
    // วันเวลาที่ลูกค้ากดโหวต (UTC)
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;
    
    // IP Address ของตู้หรือเครื่องที่กดโหวต (ไว้ป้องกัน Spam Vote)
    public string? ClientIp { get; set; }

    // Navigation Properties
    public Branch? Branch { get; set; }
    public Kiosk? Kiosk { get; set; }
    public Brand? Brand { get; set; }
}

