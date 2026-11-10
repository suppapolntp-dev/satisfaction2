using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Auth;
using Backend.DTOs.Roles;
using Backend.Entities;

namespace Backend.Controllers;

/// <summary>
/// RolesController: จัดการบทบาทผู้ใช้งาน และกำหนดสิทธิ์รายโมดูลแบบ Dynamic (CRUD & Permission Matrix)
/// เส้นทางหลัก: /api/roles
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RolesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 1. ดึงรายชื่อ Roles ทั้งหมด พร้อมจำนวนพนักงานที่ถือ Role นั้น
    /// GET /api/roles
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RoleListItemDto>>>> GetAllRoles()
    {
        var roles = await _context.Roles
            .Include(r => r.Users)
            .OrderBy(r => r.CreatedAt)
            .Select(r => new RoleListItemDto
            {
                Id = r.Id,
                RoleCode = r.RoleCode,
                RoleName = r.RoleName,
                RoleDescription = r.RoleDescription,
                RoleStatus = r.RoleStatus,
                IsSystemDefault = r.IsSystemDefault,
                UserCount = r.Users.Count(u => u.DeletedAt == null),
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse<List<RoleListItemDto>>.Ok(roles));
    }

    /// <summary>
    /// 2. ดึงรายละเอียด Role รายตัว พร้อมสิทธิ์รายโมดูลและฟังก์ชันย่อย (Tree Permissions)
    /// GET /api/roles/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RoleDetailDto>>> GetRoleById(Guid id)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Module)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบบทบาทที่ระบุ"));
        }

        var result = new RoleDetailDto
        {
            Id = role.Id,
            RoleCode = role.RoleCode,
            RoleName = role.RoleName,
            RoleDescription = role.RoleDescription,
            RoleStatus = role.RoleStatus,
            IsSystemDefault = role.IsSystemDefault,
            Permissions = role.RolePermissions.Select(rp => new RolePermissionItemDto
            {
                ModuleId = rp.ModuleId,
                ModuleCode = rp.Module?.ModuleCode ?? string.Empty,
                ModuleLabel = rp.Module?.ModuleLabel ?? string.Empty,
                Description = rp.Module?.Description,
                ParentId = rp.Module?.ParentId,
                DisplayOrder = rp.Module?.DisplayOrder ?? 0,
                CanView = rp.CanView,
                CanCreate = rp.CanCreate,
                CanUpdate = rp.CanUpdate,
                CanDelete = rp.CanDelete,
                CanExport = rp.CanExport
            }).OrderBy(p => p.DisplayOrder).ToList()
        };

        return Ok(ApiResponse<RoleDetailDto>.Ok(result));
    }

    /// <summary>
    /// 3. สร้าง Role ใหม่จากหน้าเว็บ
    /// POST /api/roles
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<Role>>> CreateRole([FromBody] CreateRoleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RoleCode) || string.IsNullOrWhiteSpace(request.RoleName))
        {
            return BadRequest(ApiResponse.Fail("กรุณาระบุ RoleCode และ RoleName"));
        }

        // ตรวจสอบ RoleCode ซ้ำ
        bool exists = await _context.Roles.AnyAsync(r => r.RoleCode.ToUpper() == request.RoleCode.ToUpper());
        if (exists)
        {
            return BadRequest(ApiResponse.Fail("รหัส RoleCode นี้มีอยู่ในระบบแล้ว"));
        }

        var newRole = new Role
        {
            RoleCode = request.RoleCode.ToUpper().Trim(),
            RoleName = request.RoleName.Trim(),
            RoleDescription = request.RoleDescription,
            RoleStatus = "Active",
            IsSystemDefault = false
        };

        await _context.Roles.AddAsync(newRole);
        await _context.SaveChangesAsync();

        // สร้างแถวสิทธิ์เริ่มต้นสำหรับทุกโมดูล (Default = false)
        var allModules = await _context.SystemModules.ToListAsync();
        foreach (var mod in allModules)
        {
            await _context.RolePermissions.AddAsync(new RolePermission
            {
                RoleId = newRole.Id,
                ModuleId = mod.Id,
                CanView = false,
                CanCreate = false,
                CanUpdate = false,
                CanDelete = false,
                CanExport = false
            });
        }
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Role>.Ok(newRole, "สร้างบทบาทใหม่สำเร็จ"));
    }

    /// <summary>
    /// 4. แก้ไขชื่อและรายละเอียด Role
    /// PUT /api/roles/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse>> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบบทบาทที่ระบุ"));
        }

        role.RoleName = request.RoleName.Trim();
        role.RoleDescription = request.RoleDescription;
        role.RoleStatus = request.RoleStatus;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("แก้ไขข้อมูลบทบาทสำเร็จ"));
    }

    /// <summary>
    /// 5. อัปเดตสิทธิ์รายโมดูล (View, Create, Update, Delete, Export) จากหน้าเว็บ Matrix
    /// PUT /api/roles/{id}/permissions
    /// </summary>
    [HttpPut("{id}/permissions")]
    public async Task<ActionResult<ApiResponse>> UpdatePermissions(Guid id, [FromBody] UpdateRolePermissionsRequest request)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบบทบาทที่ระบุ"));
        }

        foreach (var p in request.Permissions)
        {
            var existing = role.RolePermissions.FirstOrDefault(rp => rp.ModuleId == p.ModuleId);
            if (existing != null)
            {
                existing.CanView = p.CanView;
                existing.CanCreate = p.CanCreate;
                existing.CanUpdate = p.CanUpdate;
                existing.CanDelete = p.CanDelete;
                existing.CanExport = p.CanExport;
            }
            else
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = id,
                    ModuleId = p.ModuleId,
                    CanView = p.CanView,
                    CanCreate = p.CanCreate,
                    CanUpdate = p.CanUpdate,
                    CanDelete = p.CanDelete,
                    CanExport = p.CanExport
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("อัปเดตสิทธิ์การใช้งานสำเร็จ"));
    }

    /// <summary>
    /// 6. ลบ Role ที่ไม่ได้ใช้
    /// DELETE /api/roles/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteRole(Guid id)
    {
        var role = await _context.Roles
            .Include(r => r.Users)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบบทบาทที่ระบุ"));
        }

        if (role.IsSystemDefault)
        {
            return BadRequest(ApiResponse.Fail("ไม่สามารถลบบทบาทเริ่มต้นของระบบได้"));
        }

        if (role.Users.Any(u => u.DeletedAt == null))
        {
            return BadRequest(ApiResponse.Fail("ไม่สามารถลบบทบาทนี้ได้ เนื่องจากยังมีพนักงานที่ถูกผูกกับบทบาทนี้อยู่"));
        }

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse.Ok("ลบบทบาทสำเร็จ"));
    }

    /// <summary>
    /// 7. ดึงรายชื่อโมดูลและฟังก์ชันย่อยทั้งหมดในระบบแบบ Tree Hierarchy
    /// GET /api/roles/modules
    /// </summary>
    [HttpGet("modules")]
    public async Task<ActionResult<ApiResponse<List<SystemModuleDto>>>> GetAllModules()
    {
        var allModules = await _context.SystemModules
            .AsNoTracking()
            .OrderBy(m => m.DisplayOrder)
            .ToListAsync();

        var parents = allModules.Where(m => m.ParentId == null).Select(p => new SystemModuleDto
        {
            Id = p.Id,
            ModuleCode = p.ModuleCode,
            ModuleLabel = p.ModuleLabel,
            Description = p.Description,
            ParentId = p.ParentId,
            DisplayOrder = p.DisplayOrder,
            Children = allModules.Where(c => c.ParentId == p.Id).OrderBy(c => c.DisplayOrder).Select(c => new SystemModuleDto
            {
                Id = c.Id,
                ModuleCode = c.ModuleCode,
                ModuleLabel = c.ModuleLabel,
                Description = c.Description,
                ParentId = c.ParentId,
                DisplayOrder = c.DisplayOrder
            }).ToList()
        }).ToList();

        return Ok(ApiResponse<List<SystemModuleDto>>.Ok(parents));
    }
}

