using Backend.Common;

namespace Backend.DTOs.Auth;

// ข้อมูลที่ Frontend ส่งมาตอน Login
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// ข้อมูลที่ Frontend ส่งมาตอนกดยืนยันรหัส OTP 6 หลัก
public class VerifyOtpRequest
{
    public Guid UserId { get; set; }
    public string OtpCode { get; set; } = string.Empty;
    public string RefCode { get; set; } = string.Empty;
}

// ข้อมูลสำหรับขอ Refresh Token ใบใหม่
public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

// ข้อมูลรายละเอียดเมื่อส่ง OTP สำเร็จ
public class OtpSentResponseDto
{
    public Guid UserId { get; set; }
    public string RefCode { get; set; } = string.Empty;
    public int ExpiresInSeconds { get; set; } = 180;
    public string PhoneMasked { get; set; } = string.Empty; // เช่น 081-xxx-5678
}

// ข้อมูลผลลัพธ์หลังจาก Login หรือ Verify OTP สำเร็จ
public class AuthResponseDto
{
    public bool RequiresMfa { get; set; } = false;
    public OtpSentResponseDto? OtpInfo { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public int? ExpiresInDays { get; set; }
    public UserProfileDto? User { get; set; }
}

// ข้อมูลโปรไฟล์ของผู้ใช้งาน
public class UserProfileDto
{
    public Guid Id { get; set; }
    public string? UserCode { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string RoleCode { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public TierLevel TierLevel { get; set; }
    public string Status { get; set; } = "Active";
    public bool IsMfaEnabled { get; set; }
    
    // สิทธิ์ดู Dashboard 5 ระดับ
    public DashboardPermissionsDto? DashboardPermissions { get; set; }
    
    // สิทธิ์โมดูลต่างๆ
    public List<ModulePermissionDto> ModulePermissions { get; set; } = new();
    
    // รายการ Scopes ที่ดูแล
    public List<Guid> BrandScopes { get; set; } = new();
    public List<Guid> RegionScopes { get; set; } = new();
    public List<Guid> ProvinceScopes { get; set; } = new();
    public List<Guid> BranchScopes { get; set; } = new();
}

public class DashboardPermissionsDto
{
    public bool CanViewSuperAdminOverview { get; set; }
    public bool CanViewBrandRegionalGrid { get; set; }
    public bool CanViewRegionalProvinceGrid { get; set; }
    public bool CanViewProvincialBranchGrid { get; set; }
    public bool CanViewBranchKiosksGrid { get; set; }
}

public class ModulePermissionDto
{
    public string ModuleCode { get; set; } = string.Empty;
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
    public bool CanExport { get; set; }
}

