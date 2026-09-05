using Backend.Common;

namespace Backend.DTOs.Dashboard;

// ภาพรวมคะแนน CSAT และจำนวนโหวต (Summary Cards ด้านบนของ Dashboard)
public class DashboardOverviewDto
{
    public decimal CsatScore { get; set; }        // คะแนน CSAT รวม (%) เช่น 94.5%
    public int TotalVotes { get; set; }          // จำนวนโหวตทั้งหมด
    public int PositiveCount { get; set; }        // จำนวนคนกด พอใจ (เขียว)
    public int NeutralCount { get; set; }         // จำนวนคนกด ปานกลาง (เหลือง)
    public int NegativeCount { get; set; }        // จำนวนคนกด ไม่พอใจ (แดง)
    public int ActiveBranches { get; set; }       // จำนวนสาขาที่เปิดให้บริการ
    public int ActiveKiosks { get; set; }         // จำนวนตู้ Kiosk ที่ Online อยู่
    public decimal ComparisonChange { get; set; } // % เทียบกับช่วงเวลาก่อนหน้า (+2.4% หรือ -1.1%)
}

// ข้อมูลแนวโน้มสำหรับวาดกราฟเส้น/แท่ง (Line / Bar Chart)
public class TrendChartDto
{
    public string PeriodLabel { get; set; } = string.Empty; // เช่น "09:00", "10:00" หรือ "2026-08-30"
    public int Positive { get; set; }
    public int Neutral { get; set; }
    public int Negative { get; set; }
    public int TotalVotes => Positive + Neutral + Negative;
    public decimal CsatScore => TotalVotes > 0 ? Math.Round((decimal)Positive / TotalVotes * 100, 1) : 0;
}

// ข้อมูลแถวในตาราง Grid 5 ระดับ (Brand, Region, Province, Branch, Kiosk)
public class TierGridRowDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? SubTitle { get; set; } // เช่น ชื่อภาค หรือ ชื่อจังหวัด
    public int Positive { get; set; }
    public int Neutral { get; set; }
    public int Negative { get; set; }
    public int TotalVotes => Positive + Neutral + Negative;
    public decimal CsatScore => TotalVotes > 0 ? Math.Round((decimal)Positive / TotalVotes * 100, 1) : 0;
    public int KioskCount { get; set; }
    public string Status { get; set; } = "Active";
}

// ผลโหวตล่าสุดแบบ Real-time Live Feed
public class LiveVoteFeedDto
{
    public Guid Id { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public string KioskName { get; set; } = string.Empty;
    public SentimentType Sentiment { get; set; }
    public DateTime VotedAt { get; set; }
}

