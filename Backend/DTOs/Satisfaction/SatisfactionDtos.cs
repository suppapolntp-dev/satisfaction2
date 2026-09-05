using Backend.Common;

namespace Backend.DTOs.Satisfaction;

// ข้อมูลที่ตู้ Kiosk ส่งมาเมื่อลูกค้ากดปุ่มประเมิน
public class SubmitVoteRequest
{
    public Guid BranchId { get; set; }
    public Guid BrandId { get; set; }
    public Guid? KioskId { get; set; }
    public SentimentType Sentiment { get; set; } // Positive (1), Neutral (2), Negative (3)
}

// ข้อมูลที่ส่งมาตอนบันทึกการตั้งค่าหน้าจอ Kiosk
public class UpdateSatisfactionConfigRequest
{
    public string ConfigJson { get; set; } = "{}";
}
