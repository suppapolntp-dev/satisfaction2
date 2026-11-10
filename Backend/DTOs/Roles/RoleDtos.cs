namespace Backend.DTOs.Roles;

// ข้อมูลสรุปของ Role สำหรับแสดงในตาราง
public class RoleListItemDto
{
    public Guid Id { get; set; }
    public string RoleCode { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public string? RoleDescription { get; set; }
    public string RoleStatus { get; set; } = "Active";
    public bool IsSystemDefault { get; set; }
    public int UserCount { get; set; } // จำนวนพนักงานที่ถือ Role นี้
    public DateTime CreatedAt { get; set; }
}

// Request ตอนกดสร้าง Role ใหม่
public class CreateRoleRequest
{
    public string RoleCode { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public string? RoleDescription { get; set; }
}

// Request ตอนแก้ไขชื่อและรายละเอียด Role
public class UpdateRoleRequest
{
    public string RoleName { get; set; } = string.Empty;
    public string? RoleDescription { get; set; }
    public string RoleStatus { get; set; } = "Active";
}

// Request ตอนแอดมินติ๊กสิทธิ์รายโมดูล (5 สิทธิ์)
public class UpdateRolePermissionsRequest
{
    public List<ModulePermissionInputDto> Permissions { get; set; } = new();
}

public class ModulePermissionInputDto
{
    public Guid ModuleId { get; set; }
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
    public bool CanExport { get; set; }
}

// DTO สำหรับส่งรายการโมดูลและฟังก์ชันย่อยแบบ Tree
public class SystemModuleDto
{
    public Guid Id { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleLabel { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public short DisplayOrder { get; set; }
    public List<SystemModuleDto> Children { get; set; } = new();
}

// DTO รายละเอียด Role พร้อมสิทธิ์ทั้งหมด
public class RoleDetailDto
{
    public Guid Id { get; set; }
    public string RoleCode { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public string? RoleDescription { get; set; }
    public string RoleStatus { get; set; } = "Active";
    public bool IsSystemDefault { get; set; }
    public List<RolePermissionItemDto> Permissions { get; set; } = new();
}

public class RolePermissionItemDto
{
    public Guid ModuleId { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleLabel { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public short DisplayOrder { get; set; }
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
    public bool CanExport { get; set; }
}

