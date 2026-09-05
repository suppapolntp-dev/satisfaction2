using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Organization;
using Backend.Entities;
using Backend.Services;

namespace Backend.Controllers;

/// <summary>
/// BranchesController: จัดการสาขาหน้าร้าน, ผูกแบรนด์ (Dual-Brand), และตู้ Kiosk ประจำสาขา
/// เส้นทางหลัก: /api/branches
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BranchesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IScopeFilterService _scopeFilter;

    public BranchesController(AppDbContext context, IScopeFilterService scopeFilter)
    {
        _context = context;
        _scopeFilter = scopeFilter;
    }

    /// <summary>
    /// 1. ดึงรายการสาขาทั้งหมดตามสิทธิ์ 5 ระดับของผู้ใช้งาน
    /// GET /api/branches
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BranchListItemDto>>>> GetAllBranches()
    {
        var user = await GetCurrentAuthenticatedUserAsync();
        if (user == null)
        {
            return Unauthorized(ApiResponse.Fail("ไม่พบข้อมูลผู้ใช้งาน"));
        }

        var branchesQuery = _scopeFilter.FilterBranches(_context.Branches.AsNoTracking(), user)
            .Where(b => b.DeletedAt == null)
            .Include(b => b.Province)
                .ThenInclude(p => p!.Region)
            .Include(b => b.BranchBrands)
                .ThenInclude(bb => bb.Brand)
            .Include(b => b.Kiosks)
            .OrderBy(b => b.Name);

        var branches = await branchesQuery.Select(b => new BranchListItemDto
        {
            Id = b.Id,
            BranchCode = b.BranchCode,
            Name = b.Name,
            ProvinceId = b.ProvinceId,
            ProvinceName = b.Province != null ? b.Province.Name : string.Empty,
            RegionName = b.Province != null && b.Province.Region != null ? b.Province.Region.Name : string.Empty,
            KioskCount = b.Kiosks.Count,
            Status = b.Status,
            BrandNames = b.BranchBrands.Where(bb => bb.Brand != null).Select(bb => bb.Brand!.BrandName).ToList(),
            CreatedAt = b.CreatedAt
        }).ToListAsync();

        return Ok(ApiResponse<List<BranchListItemDto>>.Ok(branches));
    }

    /// <summary>
    /// 2. ดึงรายละเอียดสาขารายตัว พร้อมตู้ Kiosk และแบรนด์ทั้งหมดในสาขานั้น
    /// GET /api/branches/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> GetBranchById(Guid id)
    {
        var branch = await _context.Branches
            .Include(b => b.Province)
                .ThenInclude(p => p!.Region)
            .Include(b => b.BranchBrands)
                .ThenInclude(bb => bb.Brand)
            .Include(b => b.Kiosks)
            .FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null);

        if (branch == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบสาขาที่ระบุ"));
        }

        var result = new
        {
            branch.Id,
            branch.BranchCode,
            branch.Name,
            branch.ProvinceId,
            ProvinceName = branch.Province?.Name,
            RegionName = branch.Province?.Region?.Name,
            branch.Status,
            Brands = branch.BranchBrands.Select(bb => new
            {
                bb.BrandId,
                bb.Brand?.BrandCode,
                bb.Brand?.BrandName
            }).ToList(),
            Kiosks = branch.Kiosks.Select(k => new
            {
                k.Id,
                k.KioskCode,
                k.KioskName,
                k.Status,
                k.LastPingAt
            }).ToList()
        };

        return Ok(ApiResponse<object>.Ok(result));
    }

    /// <summary>
    /// 3. สร้างสาขาใหม่ และผูกแบรนด์ (Co-Location)
    /// POST /api/branches
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<Branch>>> CreateBranch([FromBody] CreateBranchRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.BranchCode) || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiResponse.Fail("กรุณาระบุ BranchCode และ Name"));
        }

        bool exists = await _context.Branches.AnyAsync(b => b.BranchCode.ToUpper() == request.BranchCode.ToUpper() && b.DeletedAt == null);
        if (exists)
        {
            return BadRequest(ApiResponse.Fail("รหัส BranchCode นี้มีอยู่ในระบบแล้ว"));
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdClaim, out var userId);

        var newBranch = new Branch
        {
            BranchCode = request.BranchCode.ToUpper().Trim(),
            Name = request.Name.Trim(),
            ProvinceId = request.ProvinceId,
            Status = "Active",
            CreatedBy = userId != Guid.Empty ? userId : null,
            UpdatedBy = userId != Guid.Empty ? userId : null
        };

        await _context.Branches.AddAsync(newBranch);
        await _context.SaveChangesAsync();

        // ผูกแบรนด์ที่เปิดขายในสาขานี้
        if (request.BrandIds.Any())
        {
            foreach (var brandId in request.BrandIds)
            {
                await _context.BranchBrands.AddAsync(new BranchBrand
                {
                    BranchId = newBranch.Id,
                    BrandId = brandId
                });
            }
            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse<Branch>.Ok(newBranch, "สร้างสาขาใหม่สำเร็จ"));
    }

    /// <summary>
    /// 4. แก้ไขข้อมูลสาขา และปรับปรุงแบรนด์ที่ผูก
    /// PUT /api/branches/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse>> UpdateBranch(Guid id, [FromBody] UpdateBranchRequest request)
    {
        var branch = await _context.Branches
            .Include(b => b.BranchBrands)
            .FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null);

        if (branch == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบสาขาที่ระบุ"));
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdClaim, out var userId);

        branch.Name = request.Name.Trim();
        branch.ProvinceId = request.ProvinceId;
        branch.Status = request.Status;
        branch.UpdatedBy = userId != Guid.Empty ? userId : null;

        // อัปเดตรายการแบรนด์
        _context.BranchBrands.RemoveRange(branch.BranchBrands);
        foreach (var brandId in request.BrandIds)
        {
            _context.BranchBrands.Add(new BranchBrand
            {
                BranchId = id,
                BrandId = brandId
            });
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("แก้ไขข้อมูลสาขาสำเร็จ"));
    }

    /// <summary>
    /// 5. Soft Delete สาขา
    /// DELETE /api/branches/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteBranch(Guid id)
    {
        var branch = await _context.Branches.FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null);
        if (branch == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบสาขาที่ระบุ"));
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdClaim, out var userId);

        branch.DeletedAt = DateTime.UtcNow;
        branch.UpdatedBy = userId != Guid.Empty ? userId : null;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("ลบสาขาสำเร็จ"));
    }

    /// <summary>
    /// 6. เพิ่มตู้ Kiosk ใหม่ในสาขานี้
    /// POST /api/branches/{id}/kiosks
    /// </summary>
    [HttpPost("{id}/kiosks")]
    public async Task<ActionResult<ApiResponse<Kiosk>>> AddKioskToBranch(Guid id, [FromBody] CreateKioskRequest request)
    {
        var branch = await _context.Branches.FindAsync(id);
        if (branch == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบสาขาที่ระบุ"));
        }

        bool exists = await _context.Kiosks.AnyAsync(k => k.KioskCode.ToUpper() == request.KioskCode.ToUpper());
        if (exists)
        {
            return BadRequest(ApiResponse.Fail("รหัส KioskCode นี้มีอยู่ในระบบแล้ว"));
        }

        var kiosk = new Kiosk
        {
            BranchId = id,
            KioskCode = request.KioskCode.ToUpper().Trim(),
            KioskName = request.KioskName.Trim(),
            Status = KioskStatus.Online,
            LastPingAt = DateTime.UtcNow
        };

        await _context.Kiosks.AddAsync(kiosk);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Kiosk>.Ok(kiosk, "เพิ่มตู้ Kiosk ในสาขาสำเร็จ"));
    }

    /// <summary>
    /// 7. ดึงรายชื่อจังหวัดและภาคสำหรับทำ Dropdown ตอนสร้างสาขา
    /// GET /api/branches/provinces
    /// </summary>
    [HttpGet("provinces")]
    public async Task<ActionResult<ApiResponse<List<Province>>>> GetProvinces()
    {
        var provinces = await _context.Provinces
            .Include(p => p.Region)
            .OrderBy(p => p.Region != null ? p.Region.DisplayOrder : 0)
            .ThenBy(p => p.Name)
            .ToListAsync();

        return Ok(ApiResponse<List<Province>>.Ok(provinces));
    }

    private async Task<User?> GetCurrentAuthenticatedUserAsync()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return await _context.Users
            .Include(u => u.Role)
            .Include(u => u.UserBrandScopes)
            .Include(u => u.UserRegionScopes)
            .Include(u => u.UserProvinceScopes)
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null);
    }
}

