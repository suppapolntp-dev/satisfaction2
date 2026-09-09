namespace Backend.DTOs.Export;

/// <summary>
/// พารามิเตอร์สำหรับคำขอส่งออกรายงาน CSAT
/// </summary>
public class ExportReportRequest
{
    public string Format { get; set; } = "excel"; // "excel" | "csv"
    public string? StartDate { get; set; }        // YYYY-MM-DD
    public string? EndDate { get; set; }          // YYYY-MM-DD
    public string? Company { get; set; }          // Filter บริษัท เช่น "All Companies" หรือ "CRG"
    public string? Brand { get; set; }            // Filter แบรนด์ เช่น "All Brands" หรือ BrandId / BrandName
    public string? Branch { get; set; }           // Filter สาขา เช่น "All Branches" หรือ BranchId / BranchName
}

