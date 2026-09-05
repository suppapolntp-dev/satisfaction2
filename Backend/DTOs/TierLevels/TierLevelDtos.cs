namespace Backend.DTOs.TierLevels;

public class TierLevelItemDto
{
    public string Id { get; set; } = string.Empty;
    public int LevelOrder { get; set; } = 1;
    public string TierCode { get; set; } = string.Empty;
    public string NameTh { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ScopeDimension { get; set; } = "Global"; // Global, Brand, Region, Province, Branch, Custom
    public bool CanViewSuperAdminOverview { get; set; }
    public bool CanViewBrandRegionalGrid { get; set; }
    public bool CanViewRegionalProvinceGrid { get; set; }
    public bool CanViewProvincialBranchGrid { get; set; }
    public bool CanViewBranchKiosksGrid { get; set; }
    public bool IsSystemDefault { get; set; } = false;
    public string Status { get; set; } = "Active"; // Active, Inactive
}

public class CreateTierLevelRequest
{
    public int LevelOrder { get; set; } = 1;
    public string TierCode { get; set; } = string.Empty;
    public string NameTh { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ScopeDimension { get; set; } = "Global";
    public bool CanViewSuperAdminOverview { get; set; }
    public bool CanViewBrandRegionalGrid { get; set; }
    public bool CanViewRegionalProvinceGrid { get; set; }
    public bool CanViewProvincialBranchGrid { get; set; }
    public bool CanViewBranchKiosksGrid { get; set; }
    public string Status { get; set; } = "Active";
}

public class UpdateTierLevelRequest
{
    public int LevelOrder { get; set; } = 1;
    public string NameTh { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ScopeDimension { get; set; } = "Global";
    public bool CanViewSuperAdminOverview { get; set; }
    public bool CanViewBrandRegionalGrid { get; set; }
    public bool CanViewRegionalProvinceGrid { get; set; }
    public bool CanViewProvincialBranchGrid { get; set; }
    public bool CanViewBranchKiosksGrid { get; set; }
    public string Status { get; set; } = "Active";
}

