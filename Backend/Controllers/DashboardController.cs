using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Dashboard;
using Backend.Entities;
using Backend.Services;

namespace Backend.Controllers;

/// <summary>
/// DashboardController: ส่งมอบข้อมูลสถิติ CSAT, กราฟแนวโน้ม และตาราง Grid 5 ระดับให้ Next.js
/// ทุก Endpoint ถูกคุ้มครองด้วย [Authorize] และคัดกรองตาม Scope ของผู้ใช้โดยอัตโนมัติ
/// เส้นทางหลัก: /api/dashboard
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly AppDbContext _context;

    public DashboardController(IDashboardService dashboardService, AppDbContext context)
    {
        _dashboardService = dashboardService;
        _context = context;
    }

    /// <summary>
    /// 1. ดึงภาพรวมคะแนน CSAT และจำนวนโหวต (Summary Cards)
    /// GET /api/dashboard/overview?timeFilter=today&brandId=...
    /// </summary>
    [HttpGet("overview")]
    public async Task<ActionResult<ApiResponse<DashboardOverviewDto>>> GetOverview(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate,
        [FromQuery] string? timeFilter,
        [FromQuery] Guid? brandId)
    {
        var user = await GetCurrentAuthenticatedUserAsync();
        if (user == null)
        {
            return Unauthorized(ApiResponse<DashboardOverviewDto>.Fail("ไม่พบข้อมูลผู้ใช้งาน"));
        }

        var (start, end) = ResolveDateRange(timeFilter, startDate, endDate);
        var result = await _dashboardService.GetOverviewAsync(user, start, end, brandId);
        return Ok(result);
    }

    /// <summary>
    /// 2. ดึงข้อมูลกราฟแนวโน้ม CSAT รายชั่วโมง/รายวัน/รายสัปดาห์
    /// GET /api/dashboard/trends?interval=daily&timeFilter=today&brandId=...
    /// </summary>
    [HttpGet("trends")]
    public async Task<ActionResult<ApiResponse<List<TrendChartDto>>>> GetTrends(
        [FromQuery] string interval = "daily",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? timeFilter = null,
        [FromQuery] Guid? brandId = null)
    {
        var user = await GetCurrentAuthenticatedUserAsync();
        if (user == null)
        {
            return Unauthorized(ApiResponse<List<TrendChartDto>>.Fail("ไม่พบข้อมูลผู้ใช้งาน"));
        }

        var (start, end) = ResolveDateRange(timeFilter, startDate, endDate);
        var result = await _dashboardService.GetTrendChartAsync(user, interval, start, end, brandId);
        return Ok(result);
    }

    /// <summary>
    /// 3. ดึงข้อมูลตาราง Grid 5 ระดับ (tierType: "brand", "region", "province", "branch", "kiosk")
    /// GET /api/dashboard/grid?tierType=branch&timeFilter=today&brandId=...
    /// </summary>
    [HttpGet("grid")]
    public async Task<ActionResult<ApiResponse<List<TierGridRowDto>>>> GetTierGrid(
        [FromQuery] string tierType = "branch",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? timeFilter = null,
        [FromQuery] Guid? brandId = null)
    {
        var user = await GetCurrentAuthenticatedUserAsync();
        if (user == null)
        {
            return Unauthorized(ApiResponse<List<TierGridRowDto>>.Fail("ไม่พบข้อมูลผู้ใช้งาน"));
        }

        var (start, end) = ResolveDateRange(timeFilter, startDate, endDate);
        var result = await _dashboardService.GetTierGridAsync(user, tierType, start, end, brandId);
        return Ok(result);
    }

    /// <summary>
    /// 4. ดึงฟีดผลโหวตสด Real-time จากตู้ Kiosk หน้าร้าน
    /// GET /api/dashboard/live-feed?limit=20&brandId=...
    /// </summary>
    [HttpGet("live-feed")]
    public async Task<ActionResult<ApiResponse<List<LiveVoteFeedDto>>>> GetLiveFeed(
        [FromQuery] int limit = 20,
        [FromQuery] Guid? brandId = null)
    {
        var user = await GetCurrentAuthenticatedUserAsync();
        if (user == null)
        {
            return Unauthorized(ApiResponse<List<LiveVoteFeedDto>>.Fail("ไม่พบข้อมูลผู้ใช้งาน"));
        }

        var result = await _dashboardService.GetLiveVotesAsync(user, limit, brandId);
        return Ok(result);
    }

    private static (DateTime start, DateTime end) ResolveDateRange(string? timeFilter, DateTime? startDate, DateTime? endDate)
    {
        var now = DateTime.UtcNow;
        if (startDate.HasValue && endDate.HasValue)
        {
            var endResolved = endDate.Value.TimeOfDay == TimeSpan.Zero
                ? endDate.Value.Date.AddDays(1).AddTicks(-1)
                : endDate.Value;
            return (startDate.Value, endResolved);
        }

        return timeFilter?.ToLower() switch
        {
            "today" => (now.Date, now),
            "yesterday" => (now.Date.AddDays(-1), now.Date.AddTicks(-1)),
            "week" => (now.Date.AddDays(-7), now),
            "month" => (now.Date.AddDays(-30), now),
            "quarter" => (now.Date.AddDays(-90), now),
            "year" => (now.Date.AddDays(-365), now),
            _ => (startDate ?? now.Date.AddDays(-30), endDate ?? now)
        };
    }

    /// <summary>
    /// ฟังก์ชัน Helper สำหรับดึงข้อมูล User พร้อม Scopes ครบทั้ง 4 ระดับ
    /// </summary>
    private async Task<User?> GetCurrentAuthenticatedUserAsync()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return await _context.Users
            .Include(u => u.Role)
            .Include(u => u.UserPermission)
            .Include(u => u.UserBrandScopes)
            .Include(u => u.UserRegionScopes)
            .Include(u => u.UserProvinceScopes)
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null);
    }
}

