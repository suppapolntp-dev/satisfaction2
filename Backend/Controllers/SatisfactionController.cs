using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Satisfaction;
using Backend.Entities;

namespace Backend.Controllers;

/// <summary>
/// SatisfactionController: รับข้อมูลผลโหวตจากตู้ Kiosk และจัดการการตั้งค่าหน้าจอ Kiosk UI
/// เส้นทางหลัก: /api/satisfaction
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SatisfactionController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<SatisfactionController> _logger;

    public SatisfactionController(AppDbContext context, ILogger<SatisfactionController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// 1. รับผลการกดโหวตจากลูกค้าหน้าร้าน (เปิดเป็น Public ให้ตู้ Kiosk ยิงเข้ามาได้รวดเร็ว)
    /// POST /api/satisfaction/vote
    /// </summary>
    [HttpPost("vote")]
    public async Task<ActionResult<ApiResponse>> SubmitVote([FromBody] SubmitVoteRequest request)
    {
        if (request.BranchId == Guid.Empty || request.BrandId == Guid.Empty)
        {
            return BadRequest(ApiResponse.Fail("กรุณาระบุ BranchId และ BrandId"));
        }

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        var vote = new SatisfactionVote
        {
            BranchId = request.BranchId,
            BrandId = request.BrandId,
            KioskId = request.KioskId,
            Sentiment = request.Sentiment,
            VotedAt = DateTime.UtcNow,
            ClientIp = clientIp
        };

        await _context.SatisfactionVotes.AddAsync(vote);

        // อัปเดต LastPingAt ของตู้ Kiosk ถ้ามีการส่ง KioskId มาด้วย
        if (request.KioskId.HasValue && request.KioskId.Value != Guid.Empty)
        {
            var kiosk = await _context.Kiosks.FindAsync(request.KioskId.Value);
            if (kiosk != null)
            {
                kiosk.LastPingAt = DateTime.UtcNow;
                kiosk.Status = KioskStatus.Online;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("🗳️ [CSAT Vote Recorded] Branch: {BranchId}, Brand: {BrandId}, Sentiment: {Sentiment}",
            request.BranchId, request.BrandId, request.Sentiment);

        return Ok(ApiResponse.Ok("บันทึกผลการประเมินสำเร็จ ขอบคุณที่ใช้บริการ"));
    }

    /// <summary>
    /// 2. ดึงการตั้งค่าหน้าจอ Kiosk UI (คำถาม, ข้อความขอบคุณ, สีธีม, เวลานับถอยหลัง)
    /// GET /api/satisfaction/config
    /// </summary>
    [HttpGet("config")]
    public async Task<ActionResult<ApiResponse<SatisfactionConfig>>> GetConfig()
    {
        var config = await _context.SatisfactionConfigs.FirstOrDefaultAsync();

        if (config == null)
        {
            // ถ้ายังไม่มีการตั้งค่า ให้คืนค่า Default
            config = new SatisfactionConfig
            {
                Config = "{\"questionTh\":\"ท่านพึงพอใจกับบริการในวันนี้ระดับใด?\",\"questionEn\":\"How satisfied are you with our service today?\",\"thankYouMessage\":\"ขอบคุณที่ใช้บริการค่ะ\",\"autoResetSeconds\":5,\"primaryColor\":\"#E11D48\"}"
            };
            await _context.SatisfactionConfigs.AddAsync(config);
            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse<SatisfactionConfig>.Ok(config));
    }

    /// <summary>
    /// 3. แก้ไขการตั้งค่าหน้าจอ Kiosk (เฉพาะผู้ดูแลระบบที่มีสิทธิ์)
    /// PUT /api/satisfaction/config
    /// </summary>
    [HttpPut("config")]
    [Authorize]
    public async Task<ActionResult<ApiResponse>> UpdateConfig([FromBody] UpdateSatisfactionConfigRequest request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdClaim, out var userId);

        var config = await _context.SatisfactionConfigs.FirstOrDefaultAsync();

        if (config == null)
        {
            config = new SatisfactionConfig
            {
                Config = request.ConfigJson,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = userId != Guid.Empty ? userId : null
            };
            await _context.SatisfactionConfigs.AddAsync(config);
        }
        else
        {
            config.Config = request.ConfigJson;
            config.UpdatedAt = DateTime.UtcNow;
            config.UpdatedBy = userId != Guid.Empty ? userId : null;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("อัปเดตการตั้งค่าหน้าจอ Kiosk สำเร็จ"));
    }
}
