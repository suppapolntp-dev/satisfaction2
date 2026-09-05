using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Auth;
using Backend.DTOs.Users;
using Backend.Entities;

namespace Backend.Controllers;

/// <summary>
/// UsersController: จัดการรายชื่อพนักงาน, กำหนดสิทธิ์ 5 ระดับ (TierLevel), จัดการ Scopes 4 มิติ และสวิตช์ 2FA OTP
/// เส้นทางหลัก: /api/users
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 1. ดึงรายชื่อพนักงานทั้งหมดในระบบ
    /// GET /api/users
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserListItemDto>>>> GetAllUsers()
    {
        var users = await _context.Users
            .Where(u => u.DeletedAt == null)
            .Include(u => u.Role)
            .Include(u => u.UserBrandScopes).ThenInclude(b => b.Brand)
            .Include(u => u.UserRegionScopes).ThenInclude(r => r.Region)
            .Include(u => u.UserProvinceScopes).ThenInclude(p => p.Province)
            .Include(u => u.UserBranchScopes).ThenInclude(br => br.Branch)
            .OrderBy(u => u.CreatedAt)
            .Select(u => new UserListItemDto
            {
                Id = u.Id,
                UserCode = u.UserCode,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Phone = u.Phone,
                RoleId = u.RoleId,
                RoleName = u.Role != null ? u.Role.RoleName : string.Empty,
                TierLevel = u.TierLevel,
                Status = u.Status,
                IsMfaEnabled = u.IsMfaEnabled,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                BrandScopes = u.UserBrandScopes.Where(b => b.Brand != null).Select(b => b.Brand!.BrandName).ToList(),
                RegionScopes = u.UserRegionScopes.Where(r => r.Region != null).Select(r => r.Region!.Name).ToList(),
                ProvinceScopes = u.UserProvinceScopes.Where(p => p.Province != null).Select(p => p.Province!.Name).ToList(),
                BranchScopes = u.UserBranchScopes.Where(br => br.Branch != null).Select(br => br.Branch!.Name).ToList()
            })
            .ToListAsync();

        return Ok(ApiResponse<List<UserListItemDto>>.Ok(users));
    }

    /// <summary>
    /// 2. ดึงข้อมูลพนักงานรายตัว พร้อมสิทธิ์ Dashboard และ Scopes ทั้ง 4 มิติ
    /// GET /api/users/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetUserById(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
                .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Module)
            .Include(u => u.UserPermission)
            .Include(u => u.UserBrandScopes)
            .Include(u => u.UserRegionScopes)
            .Include(u => u.UserProvinceScopes)
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null);

        if (user == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบผู้ใช้งานที่ระบุ"));
        }

        var profile = new UserProfileDto
        {
            Id = user.Id,
            UserCode = user.UserCode,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            RoleCode = user.Role?.RoleCode ?? string.Empty,
            RoleName = user.Role?.RoleName ?? string.Empty,
            TierLevel = user.TierLevel,
            Status = user.Status,
            IsMfaEnabled = user.IsMfaEnabled,
            DashboardPermissions = user.UserPermission == null ? null : new DashboardPermissionsDto
            {
                CanViewSuperAdminOverview = user.UserPermission.CanViewSuperAdminOverview,
                CanViewBrandRegionalGrid = user.UserPermission.CanViewBrandRegionalGrid,
                CanViewRegionalProvinceGrid = user.UserPermission.CanViewRegionalProvinceGrid,
                CanViewProvincialBranchGrid = user.UserPermission.CanViewProvincialBranchGrid,
                CanViewBranchKiosksGrid = user.UserPermission.CanViewBranchKiosksGrid
            },
            ModulePermissions = user.Role?.RolePermissions.Select(rp => new ModulePermissionDto
            {
                ModuleCode = rp.Module?.ModuleCode ?? string.Empty,
                CanView = rp.CanView,
                CanCreate = rp.CanCreate,
                CanUpdate = rp.CanUpdate,
                CanDelete = rp.CanDelete,
                CanExport = rp.CanExport
            }).ToList() ?? new List<ModulePermissionDto>(),
            BrandScopes = user.UserBrandScopes.Select(b => b.BrandId).ToList(),
            RegionScopes = user.UserRegionScopes.Select(r => r.RegionId).ToList(),
            ProvinceScopes = user.UserProvinceScopes.Select(p => p.ProvinceId).ToList(),
            BranchScopes = user.UserBranchScopes.Select(b => b.BranchId).ToList()
        };

        return Ok(ApiResponse<UserProfileDto>.Ok(profile));
    }

    /// <summary>
    /// 3. สร้างพนักงานใหม่ พร้อมเข้ารหัสรหัสผ่าน BCrypt และมอบหมาย Scopes
    /// POST /api/users
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<User>>> CreateUser([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(ApiResponse.Fail("กรุณาระบุอีเมลและรหัสผ่าน"));
        }

        bool emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.DeletedAt == null);
        if (emailExists)
        {
            return BadRequest(ApiResponse.Fail("อีเมลนี้มีอยู่ในระบบแล้ว"));
        }

        // เข้ารหัส Password ด้วย BCrypt Hash
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var newUser = new User
        {
            UserCode = request.UserCode,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim().ToLower(),
            Phone = request.Phone?.Trim(),
            PasswordHash = passwordHash,
            RoleId = request.RoleId,
            TierLevel = request.TierLevel,
            Status = "Active",
            IsMfaEnabled = request.IsMfaEnabled
        };

        await _context.Users.AddAsync(newUser);
        await _context.SaveChangesAsync();

        // 1. เพิ่มสิทธิ์ Dashboard Permissions
        if (request.DashboardPermissions != null)
        {
            await _context.UserPermissions.AddAsync(new UserPermission
            {
                UserId = newUser.Id,
                CanViewSuperAdminOverview = request.DashboardPermissions.CanViewSuperAdminOverview,
                CanViewBrandRegionalGrid = request.DashboardPermissions.CanViewBrandRegionalGrid,
                CanViewRegionalProvinceGrid = request.DashboardPermissions.CanViewRegionalProvinceGrid,
                CanViewProvincialBranchGrid = request.DashboardPermissions.CanViewProvincialBranchGrid,
                CanViewBranchKiosksGrid = request.DashboardPermissions.CanViewBranchKiosksGrid
            });
        }

        // 2. มอบหมาย 4 Scopes
        AssignScopes(newUser.Id, request.BrandScopeIds, request.RegionScopeIds, request.ProvinceScopeIds, request.BranchScopeIds);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<User>.Ok(newUser, "สร้างผู้ใช้งานใหม่สำเร็จ"));
    }

    /// <summary>
    /// 4. แก้ไขข้อมูลพนักงาน และอัปเดต Scopes
    /// PUT /api/users/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserPermission)
            .Include(u => u.UserBrandScopes)
            .Include(u => u.UserRegionScopes)
            .Include(u => u.UserProvinceScopes)
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null);

        if (user == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบผู้ใช้งานที่ระบุ"));
        }

        user.UserCode = request.UserCode;
        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Phone = request.Phone?.Trim();
        user.RoleId = request.RoleId;
        user.TierLevel = request.TierLevel;
        user.Status = request.Status;
        user.IsMfaEnabled = request.IsMfaEnabled;

        // อัปเดต Dashboard Permissions
        if (request.DashboardPermissions != null)
        {
            if (user.UserPermission == null)
            {
                user.UserPermission = new UserPermission { UserId = id };
                _context.UserPermissions.Add(user.UserPermission);
            }

            user.UserPermission.CanViewSuperAdminOverview = request.DashboardPermissions.CanViewSuperAdminOverview;
            user.UserPermission.CanViewBrandRegionalGrid = request.DashboardPermissions.CanViewBrandRegionalGrid;
            user.UserPermission.CanViewRegionalProvinceGrid = request.DashboardPermissions.CanViewRegionalProvinceGrid;
            user.UserPermission.CanViewProvincialBranchGrid = request.DashboardPermissions.CanViewProvincialBranchGrid;
            user.UserPermission.CanViewBranchKiosksGrid = request.DashboardPermissions.CanViewBranchKiosksGrid;
        }

        // ล้าง Scopes เก่า และบันทึก Scopes ใหม่
        _context.UserBrandScopes.RemoveRange(user.UserBrandScopes);
        _context.UserRegionScopes.RemoveRange(user.UserRegionScopes);
        _context.UserProvinceScopes.RemoveRange(user.UserProvinceScopes);
        _context.UserBranchScopes.RemoveRange(user.UserBranchScopes);

        AssignScopes(id, request.BrandScopeIds, request.RegionScopeIds, request.ProvinceScopeIds, request.BranchScopeIds);

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("แก้ไขข้อมูลผู้ใช้งานสำเร็จ"));
    }

    /// <summary>
    /// 5. รีเซ็ตรหัสผ่านพนักงาน
    /// PUT /api/users/{id}/reset-password
    /// </summary>
    [HttpPut("{id}/reset-password")]
    public async Task<ActionResult<ApiResponse>> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return BadRequest(ApiResponse.Fail("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร"));
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null);
        if (user == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบผู้ใช้งานที่ระบุ"));
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse.Ok("รีเซ็ตรหัสผ่านสำเร็จ"));
    }

    /// <summary>
    /// 6. Soft Delete ผู้ใช้งาน
    /// DELETE /api/users/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteUser(Guid id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null);
        if (user == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบผู้ใช้งานที่ระบุ"));
        }

        user.DeletedAt = DateTime.UtcNow;
        user.Status = "Inactive";

        // ยกเลิก Active Session ทั้งหมดของ User คนนี้ทันที
        var sessions = await _context.UserSessions.Where(s => s.UserId == id && s.RevokedAt == null).ToListAsync();
        foreach (var s in sessions)
        {
            s.RevokedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("ลบผู้ใช้งานสำเร็จ"));
    }

    private void AssignScopes(
        Guid userId, 
        List<Guid> brandIds, 
        List<Guid> regionIds, 
        List<Guid> provinceIds, 
        List<Guid> branchIds)
    {
        foreach (var bId in brandIds)
        {
            _context.UserBrandScopes.Add(new UserBrandScope { UserId = userId, BrandId = bId });
        }

        foreach (var rId in regionIds)
        {
            _context.UserRegionScopes.Add(new UserRegionScope { UserId = userId, RegionId = rId });
        }

        foreach (var pId in provinceIds)
        {
            _context.UserProvinceScopes.Add(new UserProvinceScope { UserId = userId, ProvinceId = pId });
        }

        foreach (var brId in branchIds)
        {
            _context.UserBranchScopes.Add(new UserBranchScope { UserId = userId, BranchId = brId });
        }
    }
}

