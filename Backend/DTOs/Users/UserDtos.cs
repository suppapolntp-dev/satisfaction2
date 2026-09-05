using Backend.Common;
using Backend.DTOs.Auth;

namespace Backend.DTOs.Users;

// สรุปข้อมูลพนักงานสำหรับแสดงในตาราง User Management
public class UserListItemDto
{
    public Guid Id { get; set; }
    public string? UserCode { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public TierLevel TierLevel { get; set; }
    public string Status { get; set; } = "Active";
    public bool IsMfaEnabled { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> BrandScopes { get; set; } = new();
    public List<string> RegionScopes { get; set; } = new();
    public List<string> ProvinceScopes { get; set; } = new();
    public List<string> BranchScopes { get; set; } = new();
}

// Request ตอนสร้างพนักงานใหม่
public class CreateUserRequest
{
    public string? UserCode { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Password { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public TierLevel TierLevel { get; set; } = TierLevel.Branch;
    public bool IsMfaEnabled { get; set; } = false;
    
    // สิทธิ์ดู Dashboard 5 ระดับ
    public DashboardPermissionsDto? DashboardPermissions { get; set; }
    
    // 4 Scopes ที่มอบหมายให้ดูแล
    public List<Guid> BrandScopeIds { get; set; } = new();
    public List<Guid> RegionScopeIds { get; set; } = new();
    public List<Guid> ProvinceScopeIds { get; set; } = new();
    public List<Guid> BranchScopeIds { get; set; } = new();
}

// Request ตอนแก้ไขข้อมูลพนักงาน
public class UpdateUserRequest
{
    public string? UserCode { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public Guid RoleId { get; set; }
    public TierLevel TierLevel { get; set; }
    public string Status { get; set; } = "Active";
    public bool IsMfaEnabled { get; set; }
    
    public DashboardPermissionsDto? DashboardPermissions { get; set; }
    
    public List<Guid> BrandScopeIds { get; set; } = new();
    public List<Guid> RegionScopeIds { get; set; } = new();
    public List<Guid> ProvinceScopeIds { get; set; } = new();
    public List<Guid> BranchScopeIds { get; set; } = new();
}

// Request สำหรับรีเซ็ตรหัสผ่าน
public class ResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

