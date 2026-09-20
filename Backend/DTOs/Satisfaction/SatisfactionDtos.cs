using Backend.Common;

namespace Backend.DTOs.Satisfaction;

// ข้อมูลที่ตู้ Kiosk ส่งมาเมื่อลูกค้ากดปุ่มประเมิน
public class SubmitVoteRequest
{
    public Guid? BranchId { get; set; }
    public Guid? BrandId { get; set; }
    public Guid? KioskId { get; set; }
    public string? BranchCode { get; set; }
    public string? BrandCode { get; set; }
    public string? KioskCode { get; set; }
    public SentimentType Sentiment { get; set; } // Positive (1), Neutral (2), Negative (3)
}

public class SubmitVoteResponse
{
    public Guid VoteId { get; set; }
    public string Status { get; set; } = "Recorded";
    public string Message { get; set; } = "Vote recorded successfully";
}

// ข้อมูลที่ส่งมาตอนบันทึกการตั้งค่าหน้าจอ Kiosk
public class UpdateSatisfactionConfigRequest
{
    public string ConfigJson { get; set; } = "{}";
}
