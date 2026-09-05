namespace Backend.DTOs.Organization;

// สรุปข้อมูลแบรนด์สำหรับแสดงในตาราง
public class BrandListItemDto
{
    public Guid Id { get; set; }
    public string BrandCode { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? BrandLogoUrl { get; set; }
    public string BrandIconName { get; set; } = "restaurant";
    public string Status { get; set; } = "Active";
    public int BranchCount { get; set; } // จำนวนสาขาที่ขายแบรนด์นี้
    public DateTime CreatedAt { get; set; }
}

// Request ตอนสร้างแบรนด์ใหม่
public class CreateBrandRequest
{
    public string BrandCode { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? BrandLogoUrl { get; set; }
    public string BrandIconName { get; set; } = "restaurant";
}

// Request ตอนแก้ไขข้อมูลแบรนด์
public class UpdateBrandRequest
{
    public string BrandName { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? BrandLogoUrl { get; set; }
    public string BrandIconName { get; set; } = "restaurant";
    public string Status { get; set; } = "Active";
}

