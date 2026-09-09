using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// KioskMonitoringBackgroundService: Background Worker ตรวจจับตู้ Kiosk ที่ขาดการส่ง Heartbeat เกินเวลาที่กำหนด
/// และปรับสถานะเป็น Offline พร้อมสร้าง Notification แจ้งเตือนผู้ดูแลระบบอัตโนมัติ
/// ทำงานรอบละทุก ๆ 2 นาที
/// </summary>
public class KioskMonitoringBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<KioskMonitoringBackgroundService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(2);
    private static readonly TimeSpan OfflineThreshold = TimeSpan.FromMinutes(10);

    public KioskMonitoringBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<KioskMonitoringBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🚀 [KioskMonitoringService] เริ่มต้นการตรวจสอบสถานะตู้ Kiosk ในพื้นหลัง...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await MonitorKiosksAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "⚠️ [KioskMonitoringService] เกิดข้อผิดพลาดในรอบการตรวจเช็กสถานะตู้ Kiosk");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task MonitorKiosksAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoffTime = DateTime.UtcNow - OfflineThreshold;

        // ค้นหาตู้ที่สถานะยังเป็น Online แต่ไม่มี Ping นานเกิน 10 นาที
        var staleKiosks = await context.Kiosks
            .Include(k => k.Branch)
            .Where(k => k.Status == KioskStatus.Online && (k.LastPingAt == null || k.LastPingAt < cutoffTime))
            .ToListAsync();

        if (!staleKiosks.Any())
        {
            return;
        }

        _logger.LogWarning("⚠️ [KioskMonitoringService] พบตู้ Kiosk ขาดการเชื่อมต่อ {Count} เครื่อง กำลังปรับเป็น Offline...", staleKiosks.Count);

        foreach (var kiosk in staleKiosks)
        {
            kiosk.Status = KioskStatus.Offline;

            // ตรวจสอบว่าเคยแจ้งเตือนตู้เครื่องนี้ไปในรอบ 2 ชั่วโมงที่ผ่านมาหรือยัง ป้องกัน Notification ซ้ำซ้อน
            var recentAlertExists = await context.Notifications
                .AnyAsync(n => n.TargetBranchId == kiosk.BranchId && 
                               n.Title.Contains(kiosk.KioskCode) && 
                               n.CreatedAt >= DateTime.UtcNow.AddHours(-2));

            if (!recentAlertExists)
            {
                context.Notifications.Add(new Notification
                {
                    Title = $"ตู้ Kiosk หมายเลข {kiosk.KioskCode} ออฟไลน์",
                    NotificationType = "Alert",
                    Description = $"ตู้ {kiosk.KioskName} ณ สาขา {kiosk.Branch?.Name ?? "ไม่ระบุ"} ขาดสัญญาณ Heartbeat นานกว่า 10 นาที กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือแหล่งจ่ายไฟ",
                    Priority = "High",
                    IsRead = false,
                    TargetBranchId = kiosk.BranchId,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await context.SaveChangesAsync();
    }
}

