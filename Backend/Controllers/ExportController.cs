using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Export;
using Backend.Entities;
using Backend.Services;

namespace Backend.Controllers;

/// <summary>
/// ExportController: สร้างและดาวน์โหลดรายงานสรุปผลการประเมินความพึงพอใจ (CSAT Analytics Export)
/// รองรับทั้ง Excel-compatible CSV (UTF-8 with BOM สำหรับเปิดใน MS Excel ภาษาไทยได้ทันที)
/// เส้นทางหลัก: /api/export
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExportController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IScopeFilterService _scopeFilter;

    public ExportController(AppDbContext context, IScopeFilterService scopeFilter)
    {
        _context = context;
        _scopeFilter = scopeFilter;
    }

    /// <summary>
    /// ส่งออกรายงานผลโหวตความพึงพอใจ CSAT รายการละเอียดตามช่วงวันที่และตัวกรอง
    /// POST /api/export/csat-report
    /// </summary>
    [HttpPost("csat-report")]
    public async Task<IActionResult> ExportCsatReport([FromBody] ExportReportRequest request)
    {
        var user = await GetCurrentAuthenticatedUserAsync();
        if (user == null)
        {
            return Unauthorized(ApiResponse.Fail("ไม่พบข้อมูลผู้ใช้งาน"));
        }

        var start = DateTime.TryParse(request.StartDate, out var sDate) 
            ? DateTime.SpecifyKind(sDate.Date, DateTimeKind.Utc) 
            : DateTime.UtcNow.AddDays(-30);
        var end = DateTime.TryParse(request.EndDate, out var eDate) 
            ? DateTime.SpecifyKind(eDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc) 
            : DateTime.UtcNow;

        var votesQuery = _scopeFilter.FilterVotes(_context.SatisfactionVotes.AsNoTracking(), user)
            .Include(v => v.Brand)
            .Include(v => v.Branch)
                .ThenInclude(b => b!.Province)
                    .ThenInclude(p => p!.Region)
            .Include(v => v.Kiosk)
            .Where(v => v.VotedAt >= start && v.VotedAt <= end);

        // ฟิลเตอร์แบรนด์เพิ่มเติมถ้ามีการระบุ
        if (!string.IsNullOrWhiteSpace(request.Brand) && request.Brand != "All Brands" && request.Brand != "ทุกแบรนด์")
        {
            votesQuery = votesQuery.Where(v => v.Brand != null && 
                (v.Brand.BrandName.ToLower() == request.Brand.ToLower() || v.Brand.BrandCode.ToLower() == request.Brand.ToLower()));
        }

        // ฟิลเตอร์สาขาเพิ่มเติมถ้ามีการระบุ
        if (!string.IsNullOrWhiteSpace(request.Branch) && request.Branch != "All Branches" && request.Branch != "ทุกสาขา")
        {
            votesQuery = votesQuery.Where(v => v.Branch != null && 
                (v.Branch.Name.ToLower().Contains(request.Branch.ToLower()) || v.Branch.BranchCode.ToLower() == request.Branch.ToLower()));
        }

        var votes = await votesQuery
            .OrderByDescending(v => v.VotedAt)
            .Take(10000) // จำกัดไม่เกิน 10,000 แถวเพื่อความเร็วและความปลอดภัยของทรัพยากร
            .ToListAsync();

        var sb = new StringBuilder();
        // UTF-8 BOM Header เพื่อให้ Microsoft Excel เปิดภาษาไทยได้โดยไม่เป็นตัวยึกยือ
        sb.Append('\uFEFF');

        // คอลัมน์ Header รายงาน
        sb.AppendLine("ลำดับ,วันเวลาที่ประเมิน (UTC),แบรนด์,รหัสสาขา,ชื่อสาขา,จังหวัด,ภูมิภาค,รหัสตู้ Kiosk,ชื่อตู้ Kiosk,ระดับความพึงพอใจ,IP Address");

        int index = 1;
        foreach (var vote in votes)
        {
            var sentimentText = vote.Sentiment switch
            {
                SentimentType.Positive => "พอใจ (Positive)",
                SentimentType.Neutral => "ปานกลาง (Neutral)",
                SentimentType.Negative => "ไม่พอใจ (Negative)",
                _ => vote.Sentiment.ToString()
            };

            var line = $"{index++}," +
                       $"\"{vote.VotedAt:yyyy-MM-dd HH:mm:ss}\"," +
                       $"\"{EscapeCsv(vote.Brand?.BrandName ?? "-")}\"," +
                       $"\"{EscapeCsv(vote.Branch?.BranchCode ?? "-")}\"," +
                       $"\"{EscapeCsv(vote.Branch?.Name ?? "-")}\"," +
                       $"\"{EscapeCsv(vote.Branch?.Province?.Name ?? "-")}\"," +
                       $"\"{EscapeCsv(vote.Branch?.Province?.Region?.Name ?? "-")}\"," +
                       $"\"{EscapeCsv(vote.Kiosk?.KioskCode ?? "-")}\"," +
                       $"\"{EscapeCsv(vote.Kiosk?.KioskName ?? "-")}\"," +
                       $"\"{sentimentText}\"," +
                       $"\"{EscapeCsv(vote.ClientIp ?? "-")}\"";

            sb.AppendLine(line);
        }

        var fileName = $"CSAT_Report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        var bytes = Encoding.UTF8.GetBytes(sb.ToString());

        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    /// <summary>
    /// ส่งออกรายงานสรุปคะแนนระดับสาขา (Branch Performance Summary)
    /// GET /api/export/branch-summary
    /// </summary>
    [HttpGet("branch-summary")]
    public async Task<IActionResult> ExportBranchSummary([FromQuery] string? startDate, [FromQuery] string? endDate)
    {
        var user = await GetCurrentAuthenticatedUserAsync();
        if (user == null)
        {
            return Unauthorized(ApiResponse.Fail("ไม่พบข้อมูลผู้ใช้งาน"));
        }

        var start = DateTime.TryParse(startDate, out var sDate) 
            ? DateTime.SpecifyKind(sDate.Date, DateTimeKind.Utc) 
            : DateTime.UtcNow.AddDays(-30);
        var end = DateTime.TryParse(endDate, out var eDate) 
            ? DateTime.SpecifyKind(eDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc) 
            : DateTime.UtcNow;

        var branches = await _scopeFilter.FilterBranches(_context.Branches.AsNoTracking(), user)
            .Include(b => b.Province)
                .ThenInclude(p => p!.Region)
            .Include(b => b.BranchBrands)
                .ThenInclude(bb => bb.Brand)
            .Include(b => b.Kiosks)
            .OrderBy(b => b.BranchCode)
            .ToListAsync();

        var branchIds = branches.Select(b => b.Id).ToList();

        var votes = await _context.SatisfactionVotes.AsNoTracking()
            .Where(v => branchIds.Contains(v.BranchId) && v.VotedAt >= start && v.VotedAt <= end)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.Append('\uFEFF');
        sb.AppendLine("รหัสสาขา,ชื่อสาขา,แบรนด์ในสาขา,จังหวัด,ภูมิภาค,จำนวนตู้ Kiosk,พอใจ,ปานกลาง,ไม่พอใจ,ผลโหวตรวม,คะแนน CSAT (%)");

        foreach (var b in branches)
        {
            var bVotes = votes.Where(v => v.BranchId == b.Id).ToList();
            var pos = bVotes.Count(v => v.Sentiment == SentimentType.Positive);
            var neu = bVotes.Count(v => v.Sentiment == SentimentType.Neutral);
            var neg = bVotes.Count(v => v.Sentiment == SentimentType.Negative);
            var total = pos + neu + neg;
            var csat = total > 0 ? Math.Round((decimal)pos / total * 100, 1) : 0;
            var brandsStr = string.Join(" / ", b.BranchBrands.Select(bb => bb.Brand?.BrandName).Where(n => !string.IsNullOrEmpty(n)));

            sb.AppendLine($"\"{EscapeCsv(b.BranchCode)}\"," +
                          $"\"{EscapeCsv(b.Name)}\"," +
                          $"\"{EscapeCsv(brandsStr)}\"," +
                          $"\"{EscapeCsv(b.Province?.Name ?? "-")}\"," +
                          $"\"{EscapeCsv(b.Province?.Region?.Name ?? "-")}\"," +
                          $"{b.Kiosks.Count},{pos},{neu},{neg},{total},{csat}%");
        }

        var fileName = $"Branch_CSAT_Summary_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        var bytes = Encoding.UTF8.GetBytes(sb.ToString());

        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    private static string EscapeCsv(string val)
    {
        return val.Replace("\"", "\"\"");
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
            .Include(u => u.UserPermission)
            .Include(u => u.UserBrandScopes)
            .Include(u => u.UserRegionScopes)
            .Include(u => u.UserProvinceScopes)
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null);
    }
}

