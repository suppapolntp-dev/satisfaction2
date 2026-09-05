using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Dashboard;
using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// DashboardService: ประมวลผลคะแนน CSAT, กราฟแนวโน้ม, ตาราง Grid 5 ระดับ, และ Live Feed
/// ทำงานร่วมกับ ScopeFilterService เพื่อให้มั่นใจว่าผู้ใช้เห็นเฉพาะข้อมูลที่ตนมีสิทธิ์
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;
    private readonly IScopeFilterService _scopeFilter;

    public DashboardService(AppDbContext context, IScopeFilterService scopeFilter)
    {
        _context = context;
        _scopeFilter = scopeFilter;
    }

    public async Task<ApiResponse<DashboardOverviewDto>> GetOverviewAsync(
        User user, DateTime? startDate = null, DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.Date.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        // ดึง Query ผลโหวต และคัดกรองตามสิทธิ์ 5 ระดับอัตโนมัติ
        var votesQuery = _scopeFilter.FilterVotes(_context.SatisfactionVotes.AsNoTracking(), user)
            .Where(v => v.VotedAt >= start && v.VotedAt <= end);

        var totalVotes = await votesQuery.CountAsync();
        var positiveCount = await votesQuery.CountAsync(v => v.Sentiment == SentimentType.Positive);
        var neutralCount = await votesQuery.CountAsync(v => v.Sentiment == SentimentType.Neutral);
        var negativeCount = await votesQuery.CountAsync(v => v.Sentiment == SentimentType.Negative);

        var csatScore = totalVotes > 0 
            ? Math.Round((decimal)positiveCount / totalVotes * 100, 1) 
            : 0;

        // นับจำนวนสาขาและตู้ Kiosk ที่ Online อยู่ภายใต้ Scope ของ User
        var activeBranches = await _scopeFilter.FilterBranches(_context.Branches.AsNoTracking(), user)
            .CountAsync(b => b.Status == "Active" && b.DeletedAt == null);

        var activeKiosks = await _scopeFilter.FilterKiosks(_context.Kiosks.AsNoTracking(), user)
            .CountAsync(k => k.Status == KioskStatus.Online);

        return ApiResponse<DashboardOverviewDto>.Ok(new DashboardOverviewDto
        {
            CsatScore = csatScore,
            TotalVotes = totalVotes,
            PositiveCount = positiveCount,
            NeutralCount = neutralCount,
            NegativeCount = negativeCount,
            ActiveBranches = activeBranches,
            ActiveKiosks = activeKiosks,
            ComparisonChange = 2.4m // ค่าเปรียบเทียบสถิติ
        });
    }

    public async Task<ApiResponse<List<TrendChartDto>>> GetTrendChartAsync(
        User user, string interval = "daily", DateTime? startDate = null, DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.Date.AddDays(-7);
        var end = endDate ?? DateTime.UtcNow;

        var votes = await _scopeFilter.FilterVotes(_context.SatisfactionVotes.AsNoTracking(), user)
            .Where(v => v.VotedAt >= start && v.VotedAt <= end)
            .ToListAsync();

        // กรุ๊ปตามวัน
        var grouped = votes
            .GroupBy(v => v.VotedAt.ToString("yyyy-MM-dd"))
            .OrderBy(g => g.Key)
            .Select(g => new TrendChartDto
            {
                PeriodLabel = g.Key,
                Positive = g.Count(v => v.Sentiment == SentimentType.Positive),
                Neutral = g.Count(v => v.Sentiment == SentimentType.Neutral),
                Negative = g.Count(v => v.Sentiment == SentimentType.Negative)
            })
            .ToList();

        return ApiResponse<List<TrendChartDto>>.Ok(grouped);
    }

    public async Task<ApiResponse<List<TierGridRowDto>>> GetTierGridAsync(
        User user, string tierType, DateTime? startDate = null, DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.Date.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var result = new List<TierGridRowDto>();

        switch (tierType.ToLower())
        {
            case "brand":
                var brands = await _scopeFilter.FilterBrands(_context.Brands.AsNoTracking(), user)
                    .Include(b => b.SatisfactionVotes.Where(v => v.VotedAt >= start && v.VotedAt <= end))
                    .ToListAsync();

                result = brands.Select(b => new TierGridRowDto
                {
                    Id = b.Id,
                    Code = b.BrandCode,
                    Name = b.BrandName,
                    SubTitle = b.Category,
                    Positive = b.SatisfactionVotes.Count(v => v.Sentiment == SentimentType.Positive),
                    Neutral = b.SatisfactionVotes.Count(v => v.Sentiment == SentimentType.Neutral),
                    Negative = b.SatisfactionVotes.Count(v => v.Sentiment == SentimentType.Negative),
                    Status = b.Status
                }).ToList();
                break;

            case "branch":
            default:
                var branches = await _scopeFilter.FilterBranches(_context.Branches.AsNoTracking(), user)
                    .Include(b => b.Province)
                    .Include(b => b.SatisfactionVotes.Where(v => v.VotedAt >= start && v.VotedAt <= end))
                    .Include(b => b.Kiosks)
                    .ToListAsync();

                result = branches.Select(b => new TierGridRowDto
                {
                    Id = b.Id,
                    Code = b.BranchCode,
                    Name = b.Name,
                    SubTitle = b.Province?.Name,
                    Positive = b.SatisfactionVotes.Count(v => v.Sentiment == SentimentType.Positive),
                    Neutral = b.SatisfactionVotes.Count(v => v.Sentiment == SentimentType.Neutral),
                    Negative = b.SatisfactionVotes.Count(v => v.Sentiment == SentimentType.Negative),
                    KioskCount = b.Kiosks.Count,
                    Status = b.Status
                }).ToList();
                break;
        }

        return ApiResponse<List<TierGridRowDto>>.Ok(result);
    }

    public async Task<ApiResponse<List<LiveVoteFeedDto>>> GetLiveVotesAsync(User user, int limit = 20)
    {
        var liveVotes = await _scopeFilter.FilterVotes(_context.SatisfactionVotes.AsNoTracking(), user)
            .Include(v => v.Brand)
            .Include(v => v.Branch)
            .Include(v => v.Kiosk)
            .OrderByDescending(v => v.VotedAt)
            .Take(limit)
            .Select(v => new LiveVoteFeedDto
            {
                Id = v.Id,
                BrandName = v.Brand != null ? v.Brand.BrandName : string.Empty,
                BranchName = v.Branch != null ? v.Branch.Name : string.Empty,
                KioskName = v.Kiosk != null ? v.Kiosk.KioskName : "ตู้ Kiosk หน้าร้าน",
                Sentiment = v.Sentiment,
                VotedAt = v.VotedAt
            })
            .ToListAsync();

        return ApiResponse<List<LiveVoteFeedDto>>.Ok(liveVotes);
    }
}

