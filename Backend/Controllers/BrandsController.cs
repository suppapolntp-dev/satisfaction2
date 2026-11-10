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
/// BrandsController: จัดการข้อมูลแบรนด์ในเครือ (CRUD) พร้อมระบบคัดกรองตามสิทธิ์ 5 ระดับ
/// เส้นทางหลัก: /api/brands
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BrandsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IScopeFilterService _scopeFilter;

    public BrandsController(AppDbContext context, IScopeFilterService scopeFilter)
    {
        _context = context;
        _scopeFilter = scopeFilter;
    }

    /// <summary>
    /// 1. ดึงรายการแบรนด์ทั้งหมดตามสิทธิ์ของผู้ใช้งาน
    /// GET /api/brands
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BrandListItemDto>>>> GetAllBrands()
    {
        var user = await GetCurrentAuthenticatedUserAsync();
        if (user == null)
        {
            return Unauthorized(ApiResponse.Fail("ไม่พบข้อมูลผู้ใช้งาน"));
        }

        var brandsQuery = _scopeFilter.FilterBrands(_context.Brands.AsNoTracking(), user)
            .Where(b => b.DeletedAt == null)
            .Include(b => b.BranchBrands)
            .OrderBy(b => b.BrandName);

        var brands = await brandsQuery.Select(b => new BrandListItemDto
        {
            Id = b.Id,
            BrandCode = b.BrandCode,
            BrandName = b.BrandName,
            ParentCompanyName = b.ParentCompanyName,
            Category = b.Category,
            BrandLogoUrl = b.BrandLogoUrl,
            BrandIconName = b.BrandIconName,
            Status = b.Status,
            BranchCount = b.BranchBrands.Count,
            CreatedAt = b.CreatedAt
        }).ToListAsync();

        return Ok(ApiResponse<List<BrandListItemDto>>.Ok(brands));
    }

    /// <summary>
    /// 2. ดึงข้อมูลแบรนด์รายตัว
    /// GET /api/brands/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<Brand>>> GetBrandById(Guid id)
    {
        var brand = await _context.Brands
            .Include(b => b.BranchBrands)
                .ThenInclude(bb => bb.Branch)
            .FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null);

        if (brand == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบแบรนด์ที่ระบุ"));
        }

        return Ok(ApiResponse<Brand>.Ok(brand));
    }

    /// <summary>
    /// 3. สร้างแบรนด์ใหม่
    /// POST /api/brands
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<Brand>>> CreateBrand([FromBody] CreateBrandRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.BrandCode) || string.IsNullOrWhiteSpace(request.BrandName))
        {
            return BadRequest(ApiResponse.Fail("กรุณาระบุ BrandCode และ BrandName"));
        }

        bool exists = await _context.Brands.AnyAsync(b => b.BrandCode.ToUpper() == request.BrandCode.ToUpper() && b.DeletedAt == null);
        if (exists)
        {
            return BadRequest(ApiResponse.Fail("รหัส BrandCode นี้มีอยู่ในระบบแล้ว"));
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdClaim, out var userId);

        var newBrand = new Brand
        {
            BrandCode = request.BrandCode.ToUpper().Trim(),
            BrandName = request.BrandName.Trim(),
            Category = request.Category,
            BrandLogoUrl = request.BrandLogoUrl,
            BrandIconName = string.IsNullOrWhiteSpace(request.BrandIconName) ? "restaurant" : request.BrandIconName,
            Status = "Active",
            CreatedBy = userId != Guid.Empty ? userId : null,
            UpdatedBy = userId != Guid.Empty ? userId : null
        };

        await _context.Brands.AddAsync(newBrand);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<Brand>.Ok(newBrand, "สร้างแบรนด์ใหม่สำเร็จ"));
    }

    /// <summary>
    /// 4. แก้ไขข้อมูลแบรนด์
    /// PUT /api/brands/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse>> UpdateBrand(Guid id, [FromBody] UpdateBrandRequest request)
    {
        var brand = await _context.Brands.FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null);
        if (brand == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบแบรนด์ที่ระบุ"));
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdClaim, out var userId);

        brand.BrandName = request.BrandName.Trim();
        brand.Category = request.Category;
        brand.BrandLogoUrl = request.BrandLogoUrl;
        brand.BrandIconName = request.BrandIconName;
        brand.Status = request.Status;
        brand.UpdatedBy = userId != Guid.Empty ? userId : null;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("แก้ไขข้อมูลแบรนด์สำเร็จ"));
    }

    /// <summary>
    /// 5. Soft Delete แบรนด์ (ซ่อนไว้ ไม่ลบทิ้งจริง)
    /// DELETE /api/brands/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteBrand(Guid id)
    {
        var brand = await _context.Brands.FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null);
        if (brand == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบแบรนด์ที่ระบุ"));
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdClaim, out var userId);

        brand.DeletedAt = DateTime.UtcNow;
        brand.UpdatedBy = userId != Guid.Empty ? userId : null;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("ลบแบรนด์สำเร็จ"));
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
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null);
    }
}

