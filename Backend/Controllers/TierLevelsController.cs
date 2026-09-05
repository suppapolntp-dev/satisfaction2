using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.TierLevels;
using Backend.Entities;

namespace Backend.Controllers;

/// <summary>
/// TierLevelsController: จัดการระดับสิทธิ์องค์กร (Data Access Tier Levels) แบบ Dynamic CRUD
/// บันทึกและควบคุมระดับสิทธิ์ 5 ระดับเดิม พร้อมรองรับการเพิ่มระดับสิทธิ์ใหม่ในอนาคต
/// เส้นทางหลัก: /api/tierlevels
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TierLevelsController : ControllerBase
{
    private const string SettingKeyTierLevels = "SYSTEM_TIER_LEVELS";
    private readonly AppDbContext _context;

    public TierLevelsController(AppDbContext context)
    {
        _context = context;
    }

    private static readonly List<TierLevelItemDto> DefaultTierLevels = new()
    {
        new TierLevelItemDto
        {
            Id = "TIER-001",
            LevelOrder = 1,
            TierCode = "SUPER_ADMIN",
            NameTh = "Super Administrator (ระดับองค์กรสูงสุด)",
            NameEn = "Super Admin",
            Description = "ดูแลและวิเคราะห์ข้อมูลทุกระดับ ทั่วทั้งองค์กร ทุกแบรนด์และทุกสาขา",
            ScopeDimension = "Global",
            CanViewSuperAdminOverview = true,
            CanViewBrandRegionalGrid = true,
            CanViewRegionalProvinceGrid = true,
            CanViewProvincialBranchGrid = true,
            CanViewBranchKiosksGrid = true,
            IsSystemDefault = true,
            Status = "Active"
        },
        new TierLevelItemDto
        {
            Id = "TIER-002",
            LevelOrder = 2,
            TierCode = "BRAND",
            NameTh = "Brand Owner / Manager (ระดับแบรนด์)",
            NameEn = "Brand Owner",
            Description = "ดูแลและเข้าถึงข้อมูลเฉพาะแบรนด์ที่ได้รับมอบหมาย ครอบคลุมทุกสาขาของแบรนด์นั้น",
            ScopeDimension = "Brand",
            CanViewSuperAdminOverview = false,
            CanViewBrandRegionalGrid = true,
            CanViewRegionalProvinceGrid = true,
            CanViewProvincialBranchGrid = true,
            CanViewBranchKiosksGrid = true,
            IsSystemDefault = true,
            Status = "Active"
        },
        new TierLevelItemDto
        {
            Id = "TIER-003",
            LevelOrder = 3,
            TierCode = "REGION",
            NameTh = "Regional Manager (ระดับภูมิภาค)",
            NameEn = "Regional Manager (RM)",
            Description = "ดูแลและเข้าถึงข้อมูลสาขาทั้งหมดในเขตภูมิภาคที่รับผิดชอบ",
            ScopeDimension = "Region",
            CanViewSuperAdminOverview = false,
            CanViewBrandRegionalGrid = false,
            CanViewRegionalProvinceGrid = true,
            CanViewProvincialBranchGrid = true,
            CanViewBranchKiosksGrid = true,
            IsSystemDefault = true,
            Status = "Active"
        },
        new TierLevelItemDto
        {
            Id = "TIER-004",
            LevelOrder = 4,
            TierCode = "PROVINCE",
            NameTh = "Area Manager (ระดับจังหวัด / เขตพื้นที่)",
            NameEn = "Area Manager (AM)",
            Description = "ดูแลและเข้าถึงข้อมูลสาขาในระดับจังหวัดหรือคลัสเตอร์พื้นที่ที่รับผิดชอบ",
            ScopeDimension = "Province",
            CanViewSuperAdminOverview = false,
            CanViewBrandRegionalGrid = false,
            CanViewRegionalProvinceGrid = false,
            CanViewProvincialBranchGrid = true,
            CanViewBranchKiosksGrid = true,
            IsSystemDefault = true,
            Status = "Active"
        },
        new TierLevelItemDto
        {
            Id = "TIER-005",
            LevelOrder = 5,
            TierCode = "BRANCH",
            NameTh = "Branch Officer / Staff (ระดับสาขา)",
            NameEn = "Branch Staff",
            Description = "ดูแลและดูผลคะแนนความพึงพอใจเฉพาะสาขาและตู้ Kiosk ประจำสาขาของตนเอง",
            ScopeDimension = "Branch",
            CanViewSuperAdminOverview = false,
            CanViewBrandRegionalGrid = false,
            CanViewRegionalProvinceGrid = false,
            CanViewProvincialBranchGrid = false,
            CanViewBranchKiosksGrid = true,
            IsSystemDefault = true,
            Status = "Active"
        },
        new TierLevelItemDto
        {
            Id = "TIER-006",
            LevelOrder = 6,
            TierCode = "CUSTOM_SCOPE",
            NameTh = "Custom Scope (ระดับกลุ่มสโคปกำหนดเอง / Co-Location)",
            NameEn = "Custom Scope",
            Description = "สำหรับบุคลากรที่ดูแลข้ามแบรนด์ เช่น สาขา 2 แบรนด์ (Co-Location) หรือโครงการพิเศษ",
            ScopeDimension = "Custom",
            CanViewSuperAdminOverview = false,
            CanViewBrandRegionalGrid = true,
            CanViewRegionalProvinceGrid = true,
            CanViewProvincialBranchGrid = true,
            CanViewBranchKiosksGrid = true,
            IsSystemDefault = false,
            Status = "Active"
        }
    };

    private async Task<List<TierLevelItemDto>> GetTierListFromDbAsync()
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == SettingKeyTierLevels);
        if (setting == null || string.IsNullOrWhiteSpace(setting.SettingValue))
        {
            // Seed defaults into DB
            var json = JsonSerializer.Serialize(DefaultTierLevels);
            var newSetting = new SystemSetting
            {
                SettingKey = SettingKeyTierLevels,
                SettingValue = json,
                UpdatedAt = DateTime.UtcNow
            };
            await _context.SystemSettings.AddAsync(newSetting);
            await _context.SaveChangesAsync();
            return DefaultTierLevels;
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<List<TierLevelItemDto>>(setting.SettingValue);
            if (parsed != null && parsed.Count > 0)
            {
                return parsed.OrderBy(t => t.LevelOrder).ToList();
            }
        }
        catch
        {
            // fallback
        }

        return DefaultTierLevels;
    }

    private async Task SaveTierListToDbAsync(List<TierLevelItemDto> list)
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == SettingKeyTierLevels);
        var json = JsonSerializer.Serialize(list);

        Guid? currentUserId = null;
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var uId))
        {
            currentUserId = uId;
        }

        if (setting == null)
        {
            setting = new SystemSetting
            {
                SettingKey = SettingKeyTierLevels,
                SettingValue = json,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = currentUserId
            };
            await _context.SystemSettings.AddAsync(setting);
        }
        else
        {
            setting.SettingValue = json;
            setting.UpdatedAt = DateTime.UtcNow;
            setting.UpdatedBy = currentUserId;
        }

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// 1. ดึงรายชื่อระดับสิทธิ์องค์กรทั้งหมด เรียงตามลำดับ LevelOrder
    /// GET /api/tierlevels
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TierLevelItemDto>>>> GetAllTierLevels()
    {
        var tiers = await GetTierListFromDbAsync();
        return Ok(ApiResponse<List<TierLevelItemDto>>.Ok(tiers));
    }

    /// <summary>
    /// 2. ดึงข้อมูลระดับสิทธิ์รายตัวตาม ID หรือ TierCode
    /// GET /api/tierlevels/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TierLevelItemDto>>> GetTierLevelById(string id)
    {
        var tiers = await GetTierListFromDbAsync();
        var tier = tiers.FirstOrDefault(t => t.Id.Equals(id, StringComparison.OrdinalIgnoreCase) || t.TierCode.Equals(id, StringComparison.OrdinalIgnoreCase));
        if (tier == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบระดับสิทธิ์ที่ระบุ"));
        }
        return Ok(ApiResponse<TierLevelItemDto>.Ok(tier));
    }

    /// <summary>
    /// 3. สร้างระดับสิทธิ์องค์กรใหม่ (รองรับการขยายโครงสร้างในอนาคต)
    /// POST /api/tierlevels
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TierLevelItemDto>>> CreateTierLevel([FromBody] CreateTierLevelRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TierCode) || string.IsNullOrWhiteSpace(request.NameTh))
        {
            return BadRequest(ApiResponse.Fail("กรุณาระบุรหัสระดับสิทธิ์ (TierCode) และชื่อภาษาไทย"));
        }

        var normalizedCode = request.TierCode.Trim().ToUpperInvariant();
        var tiers = await GetTierListFromDbAsync();

        if (tiers.Any(t => t.TierCode.Equals(normalizedCode, StringComparison.OrdinalIgnoreCase)))
        {
            return BadRequest(ApiResponse.Fail($"รหัสระดับสิทธิ์ '{normalizedCode}' มีอยู่ในระบบแล้ว"));
        }

        var newTier = new TierLevelItemDto
        {
            Id = $"TIER-{DateTime.UtcNow.Ticks.ToString().Substring(12)}",
            LevelOrder = request.LevelOrder > 0 ? request.LevelOrder : (tiers.Max(t => t.LevelOrder) + 1),
            TierCode = normalizedCode,
            NameTh = request.NameTh.Trim(),
            NameEn = string.IsNullOrWhiteSpace(request.NameEn) ? request.NameTh.Trim() : request.NameEn.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            ScopeDimension = string.IsNullOrWhiteSpace(request.ScopeDimension) ? "Global" : request.ScopeDimension.Trim(),
            CanViewSuperAdminOverview = request.CanViewSuperAdminOverview,
            CanViewBrandRegionalGrid = request.CanViewBrandRegionalGrid,
            CanViewRegionalProvinceGrid = request.CanViewRegionalProvinceGrid,
            CanViewProvincialBranchGrid = request.CanViewProvincialBranchGrid,
            CanViewBranchKiosksGrid = request.CanViewBranchKiosksGrid,
            IsSystemDefault = false,
            Status = request.Status == "Inactive" ? "Inactive" : "Active"
        };

        tiers.Add(newTier);
        await SaveTierListToDbAsync(tiers);

        return Ok(ApiResponse<TierLevelItemDto>.Ok(newTier, "สร้างระดับสิทธิ์ใหม่เรียบร้อยแล้ว"));
    }

    /// <summary>
    /// 4. แก้ไขข้อมูลระดับสิทธิ์
    /// PUT /api/tierlevels/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<TierLevelItemDto>>> UpdateTierLevel(string id, [FromBody] UpdateTierLevelRequest request)
    {
        var tiers = await GetTierListFromDbAsync();
        var targetIndex = tiers.FindIndex(t => t.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
        if (targetIndex < 0)
        {
            return NotFound(ApiResponse.Fail("ไม่พบระดับสิทธิ์ที่ต้องการแก้ไข"));
        }

        var target = tiers[targetIndex];
        target.LevelOrder = request.LevelOrder > 0 ? request.LevelOrder : target.LevelOrder;
        target.NameTh = string.IsNullOrWhiteSpace(request.NameTh) ? target.NameTh : request.NameTh.Trim();
        target.NameEn = string.IsNullOrWhiteSpace(request.NameEn) ? target.NameEn : request.NameEn.Trim();
        target.Description = request.Description?.Trim() ?? target.Description;
        target.ScopeDimension = string.IsNullOrWhiteSpace(request.ScopeDimension) ? target.ScopeDimension : request.ScopeDimension.Trim();
        target.CanViewSuperAdminOverview = request.CanViewSuperAdminOverview;
        target.CanViewBrandRegionalGrid = request.CanViewBrandRegionalGrid;
        target.CanViewRegionalProvinceGrid = request.CanViewRegionalProvinceGrid;
        target.CanViewProvincialBranchGrid = request.CanViewProvincialBranchGrid;
        target.CanViewBranchKiosksGrid = request.CanViewBranchKiosksGrid;
        target.Status = request.Status == "Inactive" ? "Inactive" : "Active";

        tiers[targetIndex] = target;
        await SaveTierListToDbAsync(tiers);

        return Ok(ApiResponse<TierLevelItemDto>.Ok(target, "แก้ไขระดับสิทธิ์เรียบร้อยแล้ว"));
    }

    /// <summary>
    /// 5. ลบระดับสิทธิ์ (ไม่อนุญาตให้ลบระดับสิทธิ์เริ่มต้นของระบบ)
    /// DELETE /api/tierlevels/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTierLevel(string id)
    {
        var tiers = await GetTierListFromDbAsync();
        var target = tiers.FirstOrDefault(t => t.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
        if (target == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบระดับสิทธิ์ที่ต้องการลบ"));
        }

        if (target.IsSystemDefault)
        {
            return BadRequest(ApiResponse.Fail("ไม่สามารถลบระดับสิทธิ์หลักของระบบ (System Default Tier) ได้"));
        }

        tiers.RemoveAll(t => t.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
        await SaveTierListToDbAsync(tiers);

        return Ok(ApiResponse<bool>.Ok(true, "ลบระดับสิทธิ์เรียบร้อยแล้ว"));
    }
}

