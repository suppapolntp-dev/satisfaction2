namespace Backend.DTOs.DataAccess;

/// <summary>
/// DTO สำหรับข้อมูลสิทธิ์การเข้าถึงข้อมูลของผู้ใช้งาน (User Access Record)
/// </summary>
public class UserAccessRecordDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserPhone { get; set; } = string.Empty;
    public string TierLevel { get; set; } = "Branch Staff";
    public List<string> AssignedBrands { get; set; } = new();
    public List<string> AssignedRegions { get; set; } = new();
    public List<string> AssignedProvinces { get; set; } = new();
    public List<string> AssignedBranches { get; set; } = new();
    public UserTierPermissionsDto Permissions { get; set; } = new();
    public string Status { get; set; } = "Active";
}

/// <summary>
/// สิทธิ์การมองเห็น Grid ทั้ง 5 ระดับตาม Tier
/// </summary>
public class UserTierPermissionsDto
{
    public bool CanViewSuperAdminOverview { get; set; }
    public bool CanViewBrandRegionalGrid { get; set; }
    public bool CanViewRegionalProvinceGrid { get; set; }
    public bool CanViewProvincialBranchGrid { get; set; }
    public bool CanViewBranchKiosksGrid { get; set; }
}

/// <summary>
/// Request DTO สำหรับอัปเดตสิทธิ์และขอบเขตข้อมูลของผู้ใช้งาน
/// </summary>
public class SaveUserAccessRequest
{
    public string? Id { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserPhone { get; set; }
    public string TierLevel { get; set; } = "Branch Staff";
    public List<string> AssignedBrands { get; set; } = new();
    public List<string> AssignedRegions { get; set; } = new();
    public List<string> AssignedProvinces { get; set; } = new();
    public List<string> AssignedBranches { get; set; } = new();
    public string Status { get; set; } = "Active";
}

/// <summary>
/// DTO สำหรับกลุ่มขอบเขตที่กำหนดเอง (Custom Scope เช่น Dual-Brand, Co-Location Cluster)
/// </summary>
public class CustomScopeDto
{
    public string Id { get; set; } = string.Empty;
    public string ScopeName { get; set; } = string.Empty;
    public string ScopeType { get; set; } = "CoLocation"; // CoLocation, DualBrand, SpecialRegion
    public string Description { get; set; } = string.Empty;
    public List<string> TargetBranchCodes { get; set; } = new();
    public List<string> TargetBrandCodes { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

