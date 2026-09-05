using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Kiosks;
using Backend.Entities;

namespace Backend.Controllers;

/// <summary>
/// KiosksController: จัดการอุปกรณ์ตู้ประเมินความพึงพอใจหน้าร้าน (Kiosk Terminals), Heartbeat, และสถานะการออนไลน์
/// เส้นทางหลัก: /api/kiosks
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class KiosksController : ControllerBase
{
    private readonly AppDbContext _context;

    public KiosksController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 1. ดึงรายการตู้ Kiosk ทั้งหมด (พร้อมฟิลเตอร์สาขาและสถานะ)
    /// GET /api/kiosks
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<ApiResponse<List<KioskListItemDto>>>> GetKiosks(
        [FromQuery] Guid? branchId = null,
        [FromQuery] string? status = null)
    {
        var query = _context.Kiosks
            .Include(k => k.Branch)
            .Include(k => k.SatisfactionVotes)
            .AsNoTracking()
            .AsQueryable();

        if (branchId.HasValue && branchId.Value != Guid.Empty)
        {
            query = query.Where(k => k.BranchId == branchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All" && Enum.TryParse<KioskStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(k => k.Status == parsedStatus);
        }

        var kiosks = await query
            .OrderBy(k => k.KioskCode)
            .ToListAsync();

        var result = kiosks.Select(k => new KioskListItemDto
        {
            Id = k.Id,
            KioskCode = k.KioskCode,
            KioskName = k.KioskName,
            BranchId = k.BranchId,
            BranchCode = k.Branch != null ? k.Branch.BranchCode : "-",
            BranchName = k.Branch != null ? k.Branch.Name : "ไม่ระบุสาขา",
            Status = k.Status.ToString(),
            LastPingAt = k.LastPingAt,
            TotalVotesCount = k.SatisfactionVotes.Count,
            CreatedAt = k.CreatedAt
        }).ToList();

        return Ok(ApiResponse<List<KioskListItemDto>>.Ok(result));
    }

    /// <summary>
    /// 2. ตู้ Kiosk ส่งสัญญาณ Heartbeat มายังเซิร์ฟเวอร์เพื่อยืนยันว่ายังเปิดใช้งานอยู่ (ไม่ต้อง Authorize)
    /// POST /api/kiosks/{id}/heartbeat
    /// </summary>
    [HttpPost("{id}/heartbeat")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<KioskHeartbeatResponse>>> Heartbeat(string id)
    {
        Kiosk? kiosk = null;
        if (Guid.TryParse(id, out var guid))
        {
            kiosk = await _context.Kiosks.FirstOrDefaultAsync(k => k.Id == guid);
        }
        else
        {
            kiosk = await _context.Kiosks.FirstOrDefaultAsync(k => k.KioskCode.ToLower() == id.ToLower());
        }

        if (kiosk == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบข้อมูลตู้ Kiosk ในระบบ"));
        }

        kiosk.LastPingAt = DateTime.UtcNow;
        if (kiosk.Status == KioskStatus.Offline)
        {
            kiosk.Status = KioskStatus.Online;
        }

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<KioskHeartbeatResponse>.Ok(new KioskHeartbeatResponse
        {
            KioskId = kiosk.Id,
            Status = kiosk.Status.ToString(),
            ServerTime = DateTime.UtcNow,
            HasConfigUpdate = false
        }, "Heartbeat acknowledged"));
    }

    /// <summary>
    /// 3. ลงทะเบียนตู้ Kiosk ประจำสาขาใหม่
    /// POST /api/kiosks
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ApiResponse<KioskListItemDto>>> RegisterKiosk([FromBody] RegisterKioskRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.KioskCode))
        {
            return BadRequest(ApiResponse.Fail("กรุณาระบุรหัสตู้ Kiosk"));
        }

        var branch = await _context.Branches.FirstOrDefaultAsync(b => b.Id == request.BranchId);
        if (branch == null)
        {
            return BadRequest(ApiResponse.Fail("ไม่พบสาขาเป้าหมาย"));
        }

        var codeUpper = request.KioskCode.Trim().ToUpper();
        var exists = await _context.Kiosks.AnyAsync(k => k.KioskCode == codeUpper);
        if (exists)
        {
            return BadRequest(ApiResponse.Fail($"มีตู้รหัส '{codeUpper}' ในระบบแล้ว"));
        }

        Enum.TryParse<KioskStatus>(request.Status, true, out var initialStatus);

        var kiosk = new Kiosk
        {
            KioskCode = codeUpper,
            KioskName = string.IsNullOrWhiteSpace(request.KioskName) ? $"ตู้ประเมิน {codeUpper}" : request.KioskName.Trim(),
            BranchId = request.BranchId,
            Status = initialStatus,
            LastPingAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Kiosks.AddAsync(kiosk);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<KioskListItemDto>.Ok(new KioskListItemDto
        {
            Id = kiosk.Id,
            KioskCode = kiosk.KioskCode,
            KioskName = kiosk.KioskName,
            BranchId = kiosk.BranchId,
            BranchCode = branch.BranchCode,
            BranchName = branch.Name,
            Status = kiosk.Status.ToString(),
            LastPingAt = kiosk.LastPingAt,
            TotalVotesCount = 0,
            CreatedAt = kiosk.CreatedAt
        }, "ลงทะเบียนตู้ Kiosk สำเร็จ"));
    }

    /// <summary>
    /// 4. ปรับเปลี่ยนสถานะตู้ Kiosk (Online, Offline, Maintenance)
    /// PUT /api/kiosks/{id}/status
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateKioskStatus(string id, [FromBody] UpdateKioskStatusRequest request)
    {
        if (!Enum.TryParse<KioskStatus>(request.Status, true, out var targetStatus))
        {
            return BadRequest(ApiResponse.Fail("สถานะที่ระบุไม่ถูกต้อง (Online, Offline, Maintenance)"));
        }

        var kiosk = await _context.Kiosks.FirstOrDefaultAsync(k => k.Id.ToString() == id || k.KioskCode.ToLower() == id.ToLower());
        if (kiosk == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบตู้ Kiosk"));
        }

        kiosk.Status = targetStatus;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, $"ปรับปรุงสถานะตู้ Kiosk เป็น {targetStatus} สำเร็จ"));
    }

    /// <summary>
    /// 5. ลบตู้ Kiosk
    /// DELETE /api/kiosks/{id}
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteKiosk(string id)
    {
        var kiosk = await _context.Kiosks.FirstOrDefaultAsync(k => k.Id.ToString() == id || k.KioskCode.ToLower() == id.ToLower());
        if (kiosk == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบตู้ Kiosk"));
        }

        _context.Kiosks.Remove(kiosk);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "ลบตู้ Kiosk สำเร็จ"));
    }
}

