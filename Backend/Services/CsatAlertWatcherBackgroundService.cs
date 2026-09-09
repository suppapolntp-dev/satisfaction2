using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// CsatAlertWatcherBackgroundService: Background Worker คอยตรวจเช็กคะแนนความพึงพอใจ CSAT ของสาขา
/// หากต่ำกว่าเกณฑ์มาตรฐาน (Threshold เช่น 80%) ในรอบการประเมิน 24 ชั่วโมง จะส่ง Alert ไปยัง Notifications อัตโนมัติ
/// ทำงานรอบละทุก ๆ 30 นาที
/// </summary>
public class CsatAlertWatcherBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CsatAlertWatcherBackgroundService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(30);

    public CsatAlertWatcherBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<CsatAlertWatcherBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🚀 [CsatAlertWatcherService] เริ่มต้นการเฝ้าระวังคะแนน CSAT ต่ำกว่าเกณฑ์ในพื้นหลัง...");

        // รอ 1 นาทีหลังจากระบบเริ่ม เพื่อให้แอปพลิเคชันและฐานข้อมูลเตรียมพร้อมก่อน
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckBranchCsatThresholdsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "⚠️ [CsatAlertWatcherService] เกิดข้อผิดพลาดในรอบการตรวจเช็กคะแนน CSAT");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task CheckBranchCsatThresholdsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var windowStart = DateTime.UtcNow.AddHours(-24);
        var minThreshold = 80.0m; // เกณฑ์คะแนนขั้นต่ำมาตรฐาน 80%

        var branches = await context.Branches.AsNoTracking().Where(b => b.DeletedAt == null).ToListAsync();

        foreach (var branch in branches)
        {
            var votes = await context.SatisfactionVotes
                .AsNoTracking()
                .Where(v => v.BranchId == branch.Id && v.VotedAt >= windowStart)
                .ToListAsync();

            if (votes.Count < 5) // ถ้าผลโหวตน้อยกว่า 5 ยังไม่ถือเป็นสัญญาณเตือน (เพื่อความแม่นยำ)
            {
                continue;
            }

            var pos = votes.Count(v => v.Sentiment == SentimentType.Positive);
            var score = Math.Round((decimal)pos / votes.Count * 100, 1);

            if (score < minThreshold)
            {
                // ตรวจสอบว่าแจ้งเตือนสาขานี้ไปในรอบ 12 ชั่วโมงหรือยัง
                var hasRecentAlert = await context.Notifications
                    .AnyAsync(n => n.TargetBranchId == branch.Id && 
                                   n.Title.Contains("CSAT ต่ำกว่าเกณฑ์") && 
                                   n.CreatedAt >= DateTime.UtcNow.AddHours(-12));

                if (!hasRecentAlert)
                {
                    context.Notifications.Add(new Notification
                    {
                        Title = $"แจ้งเตือนระดับ CSAT ต่ำกว่าเกณฑ์มาตรฐาน ({score}%)",
                        NotificationType = "Alert",
                        Description = $"สาขา {branch.Name} ได้รับคะแนนความพึงพอใจ {score}% (ต่ำกว่าเกณฑ์ {minThreshold}%) จากผลโหวต {votes.Count} ครั้งในรอบ 24 ชั่วโมงที่ผ่านมา กรุณาตรวจสอบการบริการหน้าร้าน",
                        Priority = "High",
                        IsRead = false,
                        TargetBranchId = branch.Id,
                        CreatedAt = DateTime.UtcNow
                    });

                    _logger.LogWarning("🚨 [CsatAlertWatcherService] ส่งแจ้งเตือน CSAT ต่ำ: สาขา {Branch} ได้ {Score}%", branch.Name, score);
                }
            }
        }

        await context.SaveChangesAsync();
    }
}

