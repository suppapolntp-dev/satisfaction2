using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Notifications;
using Backend.Entities;

namespace Backend.Controllers;

/// <summary>
/// NotificationsController: จัดการระบบแจ้งเตือน, Alert เตือนคะแนนตก, และข้อเสนอแนะลูกค้า
/// เส้นทางหลัก: /api/notifications
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 1. ดึงรายการแจ้งเตือนทั้งหมดที่เกี่ยวข้องกับผู้ใช้งานหรือสาขาที่สังกัด
    /// GET /api/notifications
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetNotifications([FromQuery] bool? unreadOnly = false)
    {
        var currentUserId = GetCurrentUserId();

        var query = _context.Notifications
            .Include(n => n.TargetBranch)
            .AsNoTracking()
            .AsQueryable();

        if (currentUserId.HasValue)
        {
            // ดึงแจ้งเตือนที่ระบุส่งถึง user คนนี้ หรือเป็น broadcast (RecipientUserId == null)
            query = query.Where(n => n.RecipientUserId == null || n.RecipientUserId == currentUserId.Value);
        }

        if (unreadOnly == true)
        {
            query = query.Where(n => !n.IsRead);
        }

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        var result = notifications.Select(n => new NotificationDto
        {
            NotificationId = n.Id.ToString(),
            NotificationTitle = n.Title,
            NotificationType = n.NotificationType,
            NotificationTimeText = FormatRelativeTime(n.CreatedAt),
            NotificationDescription = n.Description,
            IsNotificationRead = n.IsRead,
            TargetBranchName = n.TargetBranch != null ? n.TargetBranch.Name : "สำนักงานใหญ่",
            TargetBranchCode = n.TargetBranch != null ? n.TargetBranch.BranchCode : "HQ",
            NotificationPriority = n.Priority,
            CreatedAt = n.CreatedAt
        }).ToList();

        return Ok(ApiResponse<List<NotificationDto>>.Ok(result));
    }

    /// <summary>
    /// 2. ทำเครื่องหมายแจ้งเตือนรายการเดียวว่าอ่านแล้ว
    /// PUT /api/notifications/{id}/read
    /// </summary>
    [HttpPut("{id}/read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(string id)
    {
        if (!Guid.TryParse(id, out var guid))
        {
            return BadRequest(ApiResponse.Fail("รูปแบบรหัสแจ้งเตือนไม่ถูกต้อง"));
        }

        var notif = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == guid);
        if (notif == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบการแจ้งเตือนนี้"));
        }

        notif.IsRead = true;
        notif.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "ทำเครื่องหมายอ่านแล้วสำเร็จ"));
    }

    /// <summary>
    /// 3. ทำเครื่องหมายแจ้งเตือนทั้งหมดว่าอ่านแล้ว
    /// PUT /api/notifications/read-all
    /// </summary>
    [HttpPut("read-all")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead()
    {
        var currentUserId = GetCurrentUserId();

        var query = _context.Notifications.Where(n => !n.IsRead);
        if (currentUserId.HasValue)
        {
            query = query.Where(n => n.RecipientUserId == null || n.RecipientUserId == currentUserId.Value);
        }

        var unreadItems = await query.ToListAsync();
        foreach (var item in unreadItems)
        {
            item.IsRead = true;
            item.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "ทำเครื่องหมายอ่านทั้งหมดเรียบร้อยแล้ว"));
    }

    /// <summary>
    /// 4. สร้างการแจ้งเตือนใหม่ (สำหรับ Admin หรือระบบ Trigger)
    /// POST /api/notifications
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<NotificationDto>>> CreateNotification([FromBody] CreateNotificationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(ApiResponse.Fail("กรุณาระบุหัวข้อการแจ้งเตือน"));
        }

        var notif = new Notification
        {
            Title = request.Title.Trim(),
            NotificationType = string.IsNullOrWhiteSpace(request.NotificationType) ? "Alert" : request.NotificationType,
            Description = request.Description ?? string.Empty,
            TargetBranchId = request.TargetBranchId,
            RecipientUserId = request.RecipientUserId,
            Priority = string.IsNullOrWhiteSpace(request.Priority) ? "Medium" : request.Priority,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Notifications.AddAsync(notif);
        await _context.SaveChangesAsync();

        string branchName = "สำนักงานใหญ่";
        string branchCode = "HQ";
        if (notif.TargetBranchId.HasValue)
        {
            var branch = await _context.Branches.FirstOrDefaultAsync(b => b.Id == notif.TargetBranchId.Value);
            if (branch != null)
            {
                branchName = branch.Name;
                branchCode = branch.BranchCode;
            }
        }

        var dto = new NotificationDto
        {
            NotificationId = notif.Id.ToString(),
            NotificationTitle = notif.Title,
            NotificationType = notif.NotificationType,
            NotificationTimeText = "เมื่อสักครู่",
            NotificationDescription = notif.Description,
            IsNotificationRead = false,
            TargetBranchName = branchName,
            TargetBranchCode = branchCode,
            NotificationPriority = notif.Priority,
            CreatedAt = notif.CreatedAt
        };

        return CreatedAtAction(nameof(GetNotifications), new { id = notif.Id }, ApiResponse<NotificationDto>.Ok(dto, "สร้างการแจ้งเตือนสำเร็จ"));
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim, out var id) ? id : null;
    }

    private static string FormatRelativeTime(DateTime dt)
    {
        var diff = DateTime.UtcNow - dt;
        if (diff.TotalMinutes < 1) return "เมื่อสักครู่";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} นาทีที่แล้ว";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} ชั่วโมงที่แล้ว";
        if (diff.TotalDays < 7) return $"{(int)diff.TotalDays} วันที่แล้ว";
        return dt.ToString("dd/MM/yyyy HH:mm");
    }
}

