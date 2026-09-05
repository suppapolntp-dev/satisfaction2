using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.DataAccess;
using Backend.Entities;

namespace Backend.Controllers;

/// <summary>
/// DataAccessController: บริหารจัดการขอบเขตการเข้าถึงข้อมูล (Data Scopes) รายบุคคล
/// เช่น สิทธิ์แบรนด์ (Brand Scope), สิทธิ์ภาค (Region), สิทธิ์จังหวัด (Province), และสิทธิ์สาขา (Branch Scope)
/// เส้นทาง: /api/data-access
/// </summary>
[ApiController]
[Authorize]
public class DataAccessController : ControllerBase
{
    private readonly AppDbContext _context;

    public DataAccessController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 1. ดึงรายการสิทธิ์และขอบเขตข้อมูลของผู้ใช้งานทั้งหมดในระบบ
    /// GET /api/data-access/users
    /// </summary>
    [HttpGet("api/data-access/users")]
    public async Task<ActionResult<ApiResponse<List<UserAccessRecordDto>>>> GetUsersAccess()
    {
        var users = await _context.Users
            .Where(u => u.DeletedAt == null)
            .Include(u => u.Role)
            .Include(u => u.UserPermission)
            .Include(u => u.UserBrandScopes).ThenInclude(ubs => ubs.Brand)
            .Include(u => u.UserRegionScopes).ThenInclude(urs => urs.Region)
            .Include(u => u.UserProvinceScopes).ThenInclude(ups => ups.Province)
            .Include(u => u.UserBranchScopes).ThenInclude(ubs => ubs.Branch)
            .OrderBy(u => u.UserCode)
            .AsNoTracking()
            .ToListAsync();

        var result = users.Select(u =>
        {
            var tierName = u.TierLevel switch
            {
                TierLevel.SuperAdmin => "Super Admin",
                TierLevel.Brand => "Brand Owner",
                TierLevel.Region => "Regional Manager (RM)",
                TierLevel.Province => "Area Manager (AM)",
                TierLevel.Branch => "Branch Staff",
                _ => "Branch Staff"
            };

            var perm = u.UserPermission;
            var permsDto = new UserTierPermissionsDto
            {
                CanViewSuperAdminOverview = perm?.CanViewSuperAdminOverview ?? (u.TierLevel == TierLevel.SuperAdmin),
                CanViewBrandRegionalGrid = perm?.CanViewBrandRegionalGrid ?? (u.TierLevel <= TierLevel.Brand),
                CanViewRegionalProvinceGrid = perm?.CanViewRegionalProvinceGrid ?? (u.TierLevel <= TierLevel.Region),
                CanViewProvincialBranchGrid = perm?.CanViewProvincialBranchGrid ?? (u.TierLevel <= TierLevel.Province),
                CanViewBranchKiosksGrid = perm?.CanViewBranchKiosksGrid ?? true
            };

            return new UserAccessRecordDto
            {
                Id = u.Id.ToString(),
                UserId = u.Id.ToString(),
                UserName = $"{u.FirstName} {u.LastName}".Trim(),
                UserEmail = u.Email,
                UserPhone = u.Phone ?? "-",
                TierLevel = tierName,
                AssignedBrands = u.UserBrandScopes.Where(b => b.Brand != null).Select(b => b.Brand!.BrandName).ToList(),
                AssignedRegions = u.UserRegionScopes.Where(r => r.Region != null).Select(r => r.Region!.Name).ToList(),
                AssignedProvinces = u.UserProvinceScopes.Where(p => p.Province != null).Select(p => p.Province!.Name).ToList(),
                AssignedBranches = u.UserBranchScopes.Where(b => b.Branch != null).Select(b => b.Branch!.Name).ToList(),
                Permissions = permsDto,
                Status = u.Status
            };
        }).ToList();

        return Ok(ApiResponse<List<UserAccessRecordDto>>.Ok(result));
    }

    /// <summary>
    /// 2. บันทึก/อัปเดตสิทธิ์ขอบเขตข้อมูลของผู้ใช้งาน (Brand, Region, Province, Branch)
    /// POST /api/data-access/users
    /// </summary>
    [HttpPost("api/data-access/users")]
    public async Task<ActionResult<ApiResponse<UserAccessRecordDto>>> SaveUserAccess([FromBody] SaveUserAccessRequest request)
    {
        var targetId = request.UserId ?? request.Id;
        if (string.IsNullOrEmpty(targetId) || !Guid.TryParse(targetId, out var userId))
        {
            return BadRequest(ApiResponse.Fail("ไม่พบรหัสผู้ใช้งาน"));
        }

        var user = await _context.Users
            .Include(u => u.UserPermission)
            .Include(u => u.UserBrandScopes)
            .Include(u => u.UserRegionScopes)
            .Include(u => u.UserProvinceScopes)
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null);

        if (user == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบบัญชีผู้ใช้งานในระบบ"));
        }

        // แปลง TierLevel
        user.TierLevel = request.TierLevel switch
        {
            "Super Admin" => TierLevel.SuperAdmin,
            "Brand Owner" => TierLevel.Brand,
            "Regional Manager (RM)" => TierLevel.Region,
            "Area Manager (AM)" => TierLevel.Province,
            _ => TierLevel.Branch
        };

        // 1. อัปเดต Brand Scopes
        _context.UserBrandScopes.RemoveRange(user.UserBrandScopes);
        if (request.AssignedBrands.Any())
        {
            var brands = await _context.Brands
                .Where(b => request.AssignedBrands.Contains(b.BrandName) || request.AssignedBrands.Contains(b.BrandCode))
                .ToListAsync();
            foreach (var b in brands)
            {
                user.UserBrandScopes.Add(new UserBrandScope { UserId = user.Id, BrandId = b.Id });
            }
        }

        // 2. อัปเดต Region Scopes
        _context.UserRegionScopes.RemoveRange(user.UserRegionScopes);
        if (request.AssignedRegions.Any())
        {
            var regions = await _context.Regions
                .Where(r => request.AssignedRegions.Contains(r.Name))
                .ToListAsync();
            foreach (var r in regions)
            {
                user.UserRegionScopes.Add(new UserRegionScope { UserId = user.Id, RegionId = r.Id });
            }
        }

        // 3. อัปเดต Province Scopes
        _context.UserProvinceScopes.RemoveRange(user.UserProvinceScopes);
        if (request.AssignedProvinces.Any())
        {
            var provinces = await _context.Provinces
                .Where(p => request.AssignedProvinces.Contains(p.Name))
                .ToListAsync();
            foreach (var p in provinces)
            {
                user.UserProvinceScopes.Add(new UserProvinceScope { UserId = user.Id, ProvinceId = p.Id });
            }
        }

        // 4. อัปเดต Branch Scopes
        _context.UserBranchScopes.RemoveRange(user.UserBranchScopes);
        if (request.AssignedBranches.Any())
        {
            var branches = await _context.Branches
                .Where(b => request.AssignedBranches.Contains(b.Name) || request.AssignedBranches.Contains(b.BranchCode))
                .ToListAsync();
            foreach (var b in branches)
            {
                user.UserBranchScopes.Add(new UserBranchScope { UserId = user.Id, BranchId = b.Id });
            }
        }

        // 5. อัปเดต UserPermission ให้สอดคล้องกับ TierLevel
        if (user.UserPermission == null)
        {
            user.UserPermission = new UserPermission { UserId = user.Id };
            await _context.UserPermissions.AddAsync(user.UserPermission);
        }

        user.UserPermission.CanViewSuperAdminOverview = user.TierLevel == TierLevel.SuperAdmin;
        user.UserPermission.CanViewBrandRegionalGrid = user.TierLevel <= TierLevel.Brand;
        user.UserPermission.CanViewRegionalProvinceGrid = user.TierLevel <= TierLevel.Region;
        user.UserPermission.CanViewProvincialBranchGrid = user.TierLevel <= TierLevel.Province;
        user.UserPermission.CanViewBranchKiosksGrid = true;

        await _context.SaveChangesAsync();

        var responseDto = new UserAccessRecordDto
        {
            Id = user.Id.ToString(),
            UserId = user.Id.ToString(),
            UserName = $"{user.FirstName} {user.LastName}".Trim(),
            UserEmail = user.Email,
            UserPhone = user.Phone ?? "-",
            TierLevel = request.TierLevel,
            AssignedBrands = request.AssignedBrands,
            AssignedRegions = request.AssignedRegions,
            AssignedProvinces = request.AssignedProvinces,
            AssignedBranches = request.AssignedBranches,
            Permissions = new UserTierPermissionsDto
            {
                CanViewSuperAdminOverview = user.UserPermission.CanViewSuperAdminOverview,
                CanViewBrandRegionalGrid = user.UserPermission.CanViewBrandRegionalGrid,
                CanViewRegionalProvinceGrid = user.UserPermission.CanViewRegionalProvinceGrid,
                CanViewProvincialBranchGrid = user.UserPermission.CanViewProvincialBranchGrid,
                CanViewBranchKiosksGrid = user.UserPermission.CanViewBranchKiosksGrid
            },
            Status = user.Status
        };

        return Ok(ApiResponse<UserAccessRecordDto>.Ok(responseDto, "บันทึกสิทธิ์การเข้าถึงข้อมูลสำเร็จ"));
    }

    /// <summary>
    /// 3. รีเซ็ตขอบเขตข้อมูลของผู้ใช้งาน
    /// DELETE /api/data-access/users/{id}
    /// </summary>
    [HttpDelete("api/data-access/users/{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUserAccess(string id)
    {
        if (!Guid.TryParse(id, out var userId))
        {
            return BadRequest(ApiResponse.Fail("รูปแบบรหัสผู้ใช้งานไม่ถูกต้อง"));
        }

        var brandScopes = await _context.UserBrandScopes.Where(s => s.UserId == userId).ToListAsync();
        var regionScopes = await _context.UserRegionScopes.Where(s => s.UserId == userId).ToListAsync();
        var provinceScopes = await _context.UserProvinceScopes.Where(s => s.UserId == userId).ToListAsync();
        var branchScopes = await _context.UserBranchScopes.Where(s => s.UserId == userId).ToListAsync();

        _context.UserBrandScopes.RemoveRange(brandScopes);
        _context.UserRegionScopes.RemoveRange(regionScopes);
        _context.UserProvinceScopes.RemoveRange(provinceScopes);
        _context.UserBranchScopes.RemoveRange(branchScopes);

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "รีเซ็ตขอบเขตข้อมูลสำเร็จ"));
    }

    /// <summary>
    /// 4. ดึงกลุ่ม Custom Scopes (เช่น Co-Location Cluster, Dual-Brand)
    /// GET /api/custom-scopes
    /// </summary>
    [HttpGet("api/custom-scopes")]
    public ActionResult<ApiResponse<List<CustomScopeDto>>> GetCustomScopes()
    {
        // Custom Scopes จำลองกลุ่ม Co-Location และ Dual-Brand
        var scopes = new List<CustomScopeDto>
        {
            new()
            {
                Id = "SCOPE-COLOC-01",
                ScopeName = "กลุ่มสาขา Co-Location (Central & Future Park)",
                ScopeType = "CoLocation",
                Description = "สาขาที่มีแบรนด์ Mister Donut และ Auntie Anne's เปิดบริการร่วมกัน",
                TargetBranchCodes = new() { "MDO-NON-01", "KFC-BKK-01" },
                TargetBrandCodes = new() { "MDO", "AAN" },
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new()
            {
                Id = "SCOPE-DUAL-02",
                ScopeName = "กลุ่ม Dual-Brand Flagship (Siam Paragon & EmQuartier)",
                ScopeType = "DualBrand",
                Description = "กลุ่มร้านเรือธงใจกลางเมืองที่มีหลายแบรนด์พรีเมียม",
                TargetBranchCodes = new() { "KFC-BKK-01", "OOT-BKK-01" },
                TargetBrandCodes = new() { "KFC", "OOT" },
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            }
        };

        return Ok(ApiResponse<List<CustomScopeDto>>.Ok(scopes));
    }
}
