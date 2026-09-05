using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Events;
using Backend.Entities;

namespace Backend.Controllers;

/// <summary>
/// EventsController: จัดการปฏิทินกิจกรรม, แคมเปญโปรโมชั่น, และการตรวจสาขา
/// เส้นทางหลัก: /api/events
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 1. ดึงรายการ Event ทั้งหมด (พร้อมฟิลเตอร์แบรนด์, หมวดหมู่, และสถานะ)
    /// GET /api/events
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<EventListItemDto>>>> GetEvents(
        [FromQuery] string? status = null,
        [FromQuery] string? category = null,
        [FromQuery] Guid? brandId = null,
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null)
    {
        var query = _context.Events
            .Include(e => e.Brand)
            .Include(e => e.Category)
            .Include(e => e.EventTargetBranches)
                .ThenInclude(etb => etb.Branch)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(e => e.EventStatus.ToLower() == status.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(e => e.Category != null && e.Category.CategoryCode.ToLower() == category.ToLower());
        }

        if (brandId.HasValue && brandId.Value != Guid.Empty)
        {
            query = query.Where(e => e.BrandId == brandId.Value);
        }

        if (DateOnly.TryParse(startDate, out var parsedStart))
        {
            query = query.Where(e => e.EventDate >= parsedStart);
        }

        if (DateOnly.TryParse(endDate, out var parsedEnd))
        {
            query = query.Where(e => e.EventDate <= parsedEnd);
        }

        var events = await query
            .OrderByDescending(e => e.EventDate)
            .ThenBy(e => e.StartTime)
            .ToListAsync();

        var result = events.Select(e => new EventListItemDto
        {
            EventId = !string.IsNullOrEmpty(e.EventCode) ? e.EventCode : e.Id.ToString(),
            EventName = e.EventName,
            EventDate = e.EventDate.ToString("yyyy-MM-dd"),
            StartTime = e.StartTime.ToString("HH:mm"),
            EndTime = e.EndTime.ToString("HH:mm"),
            BrandScope = e.Brand != null ? e.Brand.BrandName : "ทุกแบรนด์",
            BrandId = e.BrandId,
            EventLocation = e.EventLocation ?? "ทุกสาขา",
            EventCategory = e.Category != null ? e.Category.CategoryCode : "CAMPAIGN",
            EventStatus = e.EventStatus,
            Description = e.Description,
            KioskThemeOverride = e.KioskThemeOverride,
            TargetBranchIds = e.EventTargetBranches.Select(tb => tb.BranchId).ToList(),
            TargetBranchNames = e.EventTargetBranches
                .Where(tb => tb.Branch != null)
                .Select(tb => tb.Branch!.Name)
                .ToList()
        }).ToList();

        return Ok(ApiResponse<List<EventListItemDto>>.Ok(result));
    }

    /// <summary>
    /// 2. ดึงรายละเอียด Event รายตัว
    /// GET /api/events/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<EventListItemDto>>> GetEventById(string id)
    {
        var ev = await FindEventByCodeOrIdAsync(id);
        if (ev == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบข้อมูลกิจกรรม"));
        }

        var dto = new EventListItemDto
        {
            EventId = !string.IsNullOrEmpty(ev.EventCode) ? ev.EventCode : ev.Id.ToString(),
            EventName = ev.EventName,
            EventDate = ev.EventDate.ToString("yyyy-MM-dd"),
            StartTime = ev.StartTime.ToString("HH:mm"),
            EndTime = ev.EndTime.ToString("HH:mm"),
            BrandScope = ev.Brand != null ? ev.Brand.BrandName : "ทุกแบรนด์",
            BrandId = ev.BrandId,
            EventLocation = ev.EventLocation ?? "ทุกสาขา",
            EventCategory = ev.Category != null ? ev.Category.CategoryCode : "CAMPAIGN",
            EventStatus = ev.EventStatus,
            Description = ev.Description,
            KioskThemeOverride = ev.KioskThemeOverride,
            TargetBranchIds = ev.EventTargetBranches.Select(tb => tb.BranchId).ToList(),
            TargetBranchNames = ev.EventTargetBranches
                .Where(tb => tb.Branch != null)
                .Select(tb => tb.Branch!.Name)
                .ToList()
        };

        return Ok(ApiResponse<EventListItemDto>.Ok(dto));
    }

    /// <summary>
    /// 3. สร้าง Event ใหม่
    /// POST /api/events
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<EventListItemDto>>> CreateEvent([FromBody] CreateEventRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EventName))
        {
            return BadRequest(ApiResponse.Fail("กรุณาระบุชื่อกิจกรรม"));
        }

        DateOnly.TryParse(request.EventDate, out var eventDate);
        if (eventDate == default)
        {
            eventDate = DateOnly.FromDateTime(DateTime.UtcNow);
        }

        TimeOnly.TryParse(request.StartTime, out var startTime);
        TimeOnly.TryParse(request.EndTime, out var endTime);
        if (endTime == default) endTime = startTime.AddHours(2);

        // หมวดหมู่
        EventCategory? category = null;
        if (!string.IsNullOrWhiteSpace(request.EventCategory))
        {
            category = await _context.EventCategories
                .FirstOrDefaultAsync(c => c.CategoryCode.ToUpper() == request.EventCategory.ToUpper());
        }

        var newEvent = new Event
        {
            EventCode = !string.IsNullOrWhiteSpace(request.EventId) ? request.EventId : $"EVT-{DateTime.UtcNow.Year}-{DateTime.UtcNow.Ticks % 10000:D4}",
            EventName = request.EventName.Trim(),
            EventDate = eventDate,
            StartTime = startTime,
            EndTime = endTime,
            BrandId = request.BrandId,
            EventLocation = string.IsNullOrWhiteSpace(request.EventLocation) ? "ทุกสาขา" : request.EventLocation.Trim(),
            CategoryId = category?.Id,
            EventStatus = string.IsNullOrWhiteSpace(request.EventStatus) ? "Upcoming" : request.EventStatus,
            Description = request.Description,
            KioskThemeOverride = request.KioskThemeOverride,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var currentUserId = GetCurrentUserId();
        if (currentUserId.HasValue)
        {
            newEvent.CreatedBy = currentUserId.Value;
        }

        await _context.Events.AddAsync(newEvent);

        // ผูกสาขาเป้าหมาย
        if (request.TargetBranchIds != null && request.TargetBranchIds.Any())
        {
            foreach (var branchId in request.TargetBranchIds.Distinct())
            {
                newEvent.EventTargetBranches.Add(new EventTargetBranch
                {
                    EventId = newEvent.Id,
                    BranchId = branchId
                });
            }
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEventById), new { id = newEvent.EventCode }, ApiResponse<EventListItemDto>.Ok(new EventListItemDto
        {
            EventId = newEvent.EventCode,
            EventName = newEvent.EventName,
            EventDate = newEvent.EventDate.ToString("yyyy-MM-dd"),
            StartTime = newEvent.StartTime.ToString("HH:mm"),
            EndTime = newEvent.EndTime.ToString("HH:mm"),
            BrandScope = request.BrandScope,
            BrandId = newEvent.BrandId,
            EventLocation = newEvent.EventLocation ?? "ทุกสาขา",
            EventCategory = category?.CategoryCode ?? "CAMPAIGN",
            EventStatus = newEvent.EventStatus,
            Description = newEvent.Description,
            KioskThemeOverride = newEvent.KioskThemeOverride,
            TargetBranchIds = request.TargetBranchIds ?? new()
        }, "สร้างกิจกรรมสำเร็จ"));
    }

    /// <summary>
    /// 4. อัปเดต Event
    /// PUT /api/events/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<EventListItemDto>>> UpdateEvent(string id, [FromBody] UpdateEventRequest request)
    {
        var ev = await FindEventByCodeOrIdAsync(id);
        if (ev == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบข้อมูลกิจกรรม"));
        }

        if (!string.IsNullOrWhiteSpace(request.EventName))
        {
            ev.EventName = request.EventName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.EventDate) && DateOnly.TryParse(request.EventDate, out var eventDate))
        {
            ev.EventDate = eventDate;
        }

        if (!string.IsNullOrWhiteSpace(request.StartTime) && TimeOnly.TryParse(request.StartTime, out var startTime))
        {
            ev.StartTime = startTime;
        }

        if (!string.IsNullOrWhiteSpace(request.EndTime) && TimeOnly.TryParse(request.EndTime, out var endTime))
        {
            ev.EndTime = endTime;
        }

        if (request.BrandId.HasValue)
        {
            ev.BrandId = request.BrandId.Value == Guid.Empty ? null : request.BrandId.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.EventLocation))
        {
            ev.EventLocation = request.EventLocation.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.EventStatus))
        {
            ev.EventStatus = request.EventStatus;
        }

        if (request.Description != null)
        {
            ev.Description = request.Description;
        }

        if (request.KioskThemeOverride != null)
        {
            ev.KioskThemeOverride = request.KioskThemeOverride;
        }

        if (!string.IsNullOrWhiteSpace(request.EventCategory))
        {
            var cat = await _context.EventCategories
                .FirstOrDefaultAsync(c => c.CategoryCode.ToUpper() == request.EventCategory.ToUpper());
            if (cat != null)
            {
                ev.CategoryId = cat.Id;
            }
        }

        if (request.TargetBranchIds != null)
        {
            // ลบสาขาเก่าและผูกสาขาใหม่
            _context.EventTargetBranches.RemoveRange(ev.EventTargetBranches);
            foreach (var bId in request.TargetBranchIds.Distinct())
            {
                ev.EventTargetBranches.Add(new EventTargetBranch
                {
                    EventId = ev.Id,
                    BranchId = bId
                });
            }
        }

        ev.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<EventListItemDto>.Ok(new EventListItemDto
        {
            EventId = !string.IsNullOrEmpty(ev.EventCode) ? ev.EventCode : ev.Id.ToString(),
            EventName = ev.EventName,
            EventDate = ev.EventDate.ToString("yyyy-MM-dd"),
            StartTime = ev.StartTime.ToString("HH:mm"),
            EndTime = ev.EndTime.ToString("HH:mm"),
            BrandScope = ev.Brand != null ? ev.Brand.BrandName : "ทุกแบรนด์",
            BrandId = ev.BrandId,
            EventLocation = ev.EventLocation ?? "ทุกสาขา",
            EventCategory = ev.Category != null ? ev.Category.CategoryCode : "CAMPAIGN",
            EventStatus = ev.EventStatus,
            Description = ev.Description,
            KioskThemeOverride = ev.KioskThemeOverride,
            TargetBranchIds = ev.EventTargetBranches.Select(tb => tb.BranchId).ToList()
        }, "อัปเดตกิจกรรมสำเร็จ"));
    }

    /// <summary>
    /// 5. ลบ Event
    /// DELETE /api/events/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteEvent(string id)
    {
        var ev = await FindEventByCodeOrIdAsync(id);
        if (ev == null)
        {
            return NotFound(ApiResponse.Fail("ไม่พบข้อมูลกิจกรรม"));
        }

        _context.EventTargetBranches.RemoveRange(ev.EventTargetBranches);
        _context.Events.Remove(ev);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "ลบกิจกรรมเรียบร้อยแล้ว"));
    }

    /// <summary>
    /// 6. ดึงรายชื่อหมวดหมู่ Event ทั้งหมด
    /// GET /api/events/categories
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<ApiResponse<List<EventCategoryDto>>>> GetCategories()
    {
        var categories = await _context.EventCategories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new EventCategoryDto
            {
                Id = c.Id,
                CategoryCode = c.CategoryCode,
                CategoryLabel = c.CategoryLabel,
                DisplayOrder = c.DisplayOrder
            })
            .ToListAsync();

        return Ok(ApiResponse<List<EventCategoryDto>>.Ok(categories));
    }

    private async Task<Event?> FindEventByCodeOrIdAsync(string idOrCode)
    {
        var query = _context.Events
            .Include(e => e.Brand)
            .Include(e => e.Category)
            .Include(e => e.EventTargetBranches)
                .ThenInclude(etb => etb.Branch);

        if (Guid.TryParse(idOrCode, out var guid))
        {
            var byId = await query.FirstOrDefaultAsync(e => e.Id == guid);
            if (byId != null) return byId;
        }

        return await query.FirstOrDefaultAsync(e => e.EventCode.ToLower() == idOrCode.ToLower());
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim, out var id) ? id : null;
    }
}
