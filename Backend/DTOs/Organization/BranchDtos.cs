namespace Backend.DTOs.Organization;

// สรุปข้อมูลสาขาสำหรับแสดงในตาราง
public class BranchListItemDto
{
    public Guid Id { get; set; }
    public string BranchCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid ProvinceId { get; set; }
    public string ProvinceName { get; set; } = string.Empty;
    public string RegionName { get; set; } = string.Empty;
    public int KioskCount { get; set; }
    public string Status { get; set; } = "Active";
    public List<string> BrandNames { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

// Request ตอนสร้างสาขาใหม่
public class CreateBranchRequest
{
    public string BranchCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid ProvinceId { get; set; }
    public List<Guid> BrandIds { get; set; } = new(); // แบรนด์ที่เปิดขายในสาขานี้
}

// Request ตอนแก้ไขสาขา
public class UpdateBranchRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid ProvinceId { get; set; }
    public string Status { get; set; } = "Active";
    public List<Guid> BrandIds { get; set; } = new();
}

// Request ตอนเพิ่มตู้ Kiosk ใหม่ในสาขา
public class CreateKioskRequest
{
    public string KioskCode { get; set; } = string.Empty;
    public string KioskName { get; set; } = string.Empty;
}

