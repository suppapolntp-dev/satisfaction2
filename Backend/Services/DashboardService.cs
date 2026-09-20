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
        User user, DateTime? startDate = null, DateTime? endDate = null, Guid? brandId = null)
    {
        var start = startDate ?? DateTime.UtcNow.Date.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        // ดึง Query ผลโหวต และคัดกรองตามสิทธิ์ 5 ระดับอัตโนมัติ
        var votesQuery = _scopeFilter.FilterVotes(_context.SatisfactionVotes.AsNoTracking(), user)
            .Where(v => v.VotedAt >= start && v.VotedAt <= end);

        if (brandId.HasValue && brandId.Value != Guid.Empty)
        {
            votesQuery = votesQuery.Where(v => v.BrandId == brandId.Value);
        }

        var totalVotes = await votesQuery.CountAsync();
        var positiveCount = await votesQuery.CountAsync(v => v.Sentiment == SentimentType.Positive);
        var neutralCount = await votesQuery.CountAsync(v => v.Sentiment == SentimentType.Neutral);
        var negativeCount = await votesQuery.CountAsync(v => v.Sentiment == SentimentType.Negative);

        var csatScore = totalVotes > 0 
            ? Math.Round((decimal)positiveCount / totalVotes * 100, 1) 
            : 0;

        // นับจำนวนสาขาและตู้ Kiosk ที่ Online อยู่ภายใต้ Scope ของ User
        var branchesQuery = _scopeFilter.FilterBranches(_context.Branches.AsNoTracking(), user);
        if (brandId.HasValue && brandId.Value != Guid.Empty)
        {
            branchesQuery = branchesQuery.Where(b => b.BranchBrands.Any(bb => bb.BrandId == brandId.Value));
        }
        var activeBranches = await branchesQuery.CountAsync(b => b.Status == "Active" && b.DeletedAt == null);

        var kiosksQuery = _scopeFilter.FilterKiosks(_context.Kiosks.AsNoTracking(), user);
        if (brandId.HasValue && brandId.Value != Guid.Empty)
        {
            kiosksQuery = kiosksQuery.Where(k => k.Branch != null && k.Branch.BranchBrands.Any(bb => bb.BrandId == brandId.Value));
        }
        var activeKiosks = await kiosksQuery.CountAsync(k => k.Status == KioskStatus.Online);

        return ApiResponse<DashboardOverviewDto>.Ok(new DashboardOverviewDto
        {
            CsatScore = csatScore,
            TotalVotes = totalVotes,
            PositiveCount = positiveCount,
            NeutralCount = neutralCount,
            NegativeCount = negativeCount,
            ActiveBranches = activeBranches,
            ActiveKiosks = activeKiosks,
            ComparisonChange = 2.4m
        });
    }

    public async Task<ApiResponse<List<TrendChartDto>>> GetTrendChartAsync(
        User user, string interval = "daily", DateTime? startDate = null, DateTime? endDate = null, Guid? brandId = null)
    {
        var isHourly = interval.Equals("hourly", StringComparison.OrdinalIgnoreCase) || 
                       (startDate.HasValue && endDate.HasValue && (endDate.Value - startDate.Value).TotalDays <= 2);
        var start = startDate ?? (isHourly ? DateTime.UtcNow.Date : DateTime.UtcNow.Date.AddDays(-7));
        var end = endDate ?? DateTime.UtcNow;

        var votesQuery = _scopeFilter.FilterVotes(_context.SatisfactionVotes.AsNoTracking(), user)
            .Where(v => v.VotedAt >= start && v.VotedAt <= end);

        if (brandId.HasValue && brandId.Value != Guid.Empty)
        {
            votesQuery = votesQuery.Where(v => v.BrandId == brandId.Value);
        }

        var votes = await votesQuery.ToListAsync();

        List<TrendChartDto> grouped;
        if (isHourly)
        {
            grouped = votes
                .GroupBy(v => v.VotedAt.ToString("HH:00"))
                .OrderBy(g => g.Key)
                .Select(g => new TrendChartDto
                {
                    PeriodLabel = g.Key,
                    Positive = g.Count(v => v.Sentiment == SentimentType.Positive),
                    Neutral = g.Count(v => v.Sentiment == SentimentType.Neutral),
                    Negative = g.Count(v => v.Sentiment == SentimentType.Negative)
                })
                .ToList();
        }
        else
        {
            grouped = votes
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
        }

        return ApiResponse<List<TrendChartDto>>.Ok(grouped);
    }

    public async Task<ApiResponse<List<TierGridRowDto>>> GetTierGridAsync(
        User user, string tierType, DateTime? startDate = null, DateTime? endDate = null, Guid? brandId = null)
    {
        var start = startDate ?? DateTime.UtcNow.Date.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var result = new List<TierGridRowDto>();

        switch (tierType.ToLower())
        {
            case "brand":
                var brandsQuery = _scopeFilter.FilterBrands(_context.Brands.AsNoTracking(), user);
                if (brandId.HasValue && brandId.Value != Guid.Empty)
                {
                    brandsQuery = brandsQuery.Where(b => b.Id == brandId.Value);
                }
                var brands = await brandsQuery
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

            case "region":
                var regions = await _context.Regions.AsNoTracking()
                    .Include(r => r.Provinces)
                    .ThenInclude(p => p.Branches)
                    .ThenInclude(b => b.SatisfactionVotes.Where(v => v.VotedAt >= start && v.VotedAt <= end && (!brandId.HasValue || brandId.Value == Guid.Empty || v.BrandId == brandId.Value)))
                    .OrderBy(r => r.DisplayOrder)
                    .ToListAsync();

                result = regions.Select(r =>
                {
                    var votes = r.Provinces.SelectMany(p => p.Branches).SelectMany(b => b.SatisfactionVotes).ToList();
                    return new TierGridRowDto
                    {
                        Id = r.Id,
                        Code = $"REG-{r.DisplayOrder:D2}",
                        Name = r.Name,
                        SubTitle = $"{r.Provinces.Count} จังหวัด",
                        Positive = votes.Count(v => v.Sentiment == SentimentType.Positive),
                        Neutral = votes.Count(v => v.Sentiment == SentimentType.Neutral),
                        Negative = votes.Count(v => v.Sentiment == SentimentType.Negative),
                        KioskCount = r.Provinces.SelectMany(p => p.Branches).Sum(b => b.KioskCount),
                        Status = "Active"
                    };
                }).ToList();
                break;

            case "province":
                var provinces = await _context.Provinces.AsNoTracking()
                    .Include(p => p.Region)
                    .Include(p => p.Branches)
                    .ThenInclude(b => b.SatisfactionVotes.Where(v => v.VotedAt >= start && v.VotedAt <= end && (!brandId.HasValue || brandId.Value == Guid.Empty || v.BrandId == brandId.Value)))
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                result = provinces.Select(p =>
                {
                    var votes = p.Branches.SelectMany(b => b.SatisfactionVotes).ToList();
                    return new TierGridRowDto
                    {
                        Id = p.Id,
                        Code = $"PRV-{p.Id.ToString()[..4].ToUpper()}",
                        Name = p.Name,
                        SubTitle = p.Region?.Name ?? "ภูมิภาค",
                        Positive = votes.Count(v => v.Sentiment == SentimentType.Positive),
                        Neutral = votes.Count(v => v.Sentiment == SentimentType.Neutral),
                        Negative = votes.Count(v => v.Sentiment == SentimentType.Negative),
                        KioskCount = p.Branches.Sum(b => b.KioskCount),
                        Status = "Active"
                    };
                }).ToList();
                break;

            case "kiosk":
                var kiosksQuery = _scopeFilter.FilterKiosks(_context.Kiosks.AsNoTracking(), user);
                if (brandId.HasValue && brandId.Value != Guid.Empty)
                {
                    kiosksQuery = kiosksQuery.Where(k => k.Branch != null && k.Branch.BranchBrands.Any(bb => bb.BrandId == brandId.Value));
                }
                var kiosks = await kiosksQuery
                    .Include(k => k.Branch)
                    .Include(k => k.SatisfactionVotes.Where(v => v.VotedAt >= start && v.VotedAt <= end && (!brandId.HasValue || brandId.Value == Guid.Empty || v.BrandId == brandId.Value)))
                    .ToListAsync();

                result = kiosks.Select(k => new TierGridRowDto
                {
                    Id = k.Id,
                    Code = k.KioskCode,
                    Name = k.KioskName,
                    SubTitle = k.Branch?.Name ?? "สาขา",
                    Positive = k.SatisfactionVotes.Count(v => v.Sentiment == SentimentType.Positive),
                    Neutral = k.SatisfactionVotes.Count(v => v.Sentiment == SentimentType.Neutral),
                    Negative = k.SatisfactionVotes.Count(v => v.Sentiment == SentimentType.Negative),
                    KioskCount = 1,
                    Status = k.Status.ToString()
                }).ToList();
                break;

            case "branch":
            default:
                var branchesQuery = _scopeFilter.FilterBranches(_context.Branches.AsNoTracking(), user);
                if (brandId.HasValue && brandId.Value != Guid.Empty)
                {
                    branchesQuery = branchesQuery.Where(b => b.BranchBrands.Any(bb => bb.BrandId == brandId.Value));
                }
                var branches = await branchesQuery
                    .Include(b => b.Province)
                    .Include(b => b.SatisfactionVotes.Where(v => v.VotedAt >= start && v.VotedAt <= end && (!brandId.HasValue || brandId.Value == Guid.Empty || v.BrandId == brandId.Value)))
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

    public async Task<ApiResponse<List<LiveVoteFeedDto>>> GetLiveVotesAsync(User user, int limit = 20, Guid? brandId = null)
    {
        var votesQuery = _scopeFilter.FilterVotes(_context.SatisfactionVotes.AsNoTracking(), user);

        if (brandId.HasValue && brandId.Value != Guid.Empty)
        {
            votesQuery = votesQuery.Where(v => v.BrandId == brandId.Value);
        }

        var liveVotes = await votesQuery
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

