using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Settings;
using Backend.Entities;

namespace Backend.Controllers;

/// <summary>
/// SystemSettingsController: จัดการและอ่านค่าการตั้งค่าระบบส่วนกลางแบบ Dynamic (JWT, OTP, System Name)
/// เส้นทางหลัก: /api/settings
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SystemSettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SystemSettingsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 1. ดึงค่าการตั้งค่าระบบทั้งหมด
    /// GET /api/settings
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<SystemSettingsDto>>> GetSettings()
    {
        var settings = await _context.SystemSettings.ToListAsync();

        var dto = new SystemSettingsDto();

        var jwtSetting = settings.FirstOrDefault(s => s.SettingKey == AppConstants.SettingKeys.JwtExpiryDays);
        if (jwtSetting != null)
        {
            dto.JwtExpiryDays = ExtractIntFromJson(jwtSetting.SettingValue, "days", 1);
        }

        var otpSetting = settings.FirstOrDefault(s => s.SettingKey == AppConstants.SettingKeys.OtpExpiryMinutes);
        if (otpSetting != null)
        {
            dto.OtpExpiryMinutes = ExtractIntFromJson(otpSetting.SettingValue, "minutes", 3);
        }

        var cooldownSetting = settings.FirstOrDefault(s => s.SettingKey == AppConstants.SettingKeys.OtpCooldownSeconds);
        if (cooldownSetting != null)
        {
            dto.OtpCooldownSeconds = ExtractIntFromJson(cooldownSetting.SettingValue, "seconds", 60);
        }

        var nameSetting = settings.FirstOrDefault(s => s.SettingKey == AppConstants.SettingKeys.SystemName);
        if (nameSetting != null)
        {
            dto.SystemName = ExtractStringFromJson(nameSetting.SettingValue, "name", "Enterprise CSAT Management Platform");
        }

        return Ok(ApiResponse<SystemSettingsDto>.Ok(dto));
    }

    /// <summary>
    /// 2. บันทึกการตั้งค่าระบบใหม่จากหน้าเว็บ
    /// PUT /api/settings
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<ApiResponse>> UpdateSettings([FromBody] UpdateSystemSettingsRequest request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdClaim, out var userId);

        await SaveSettingAsync(AppConstants.SettingKeys.JwtExpiryDays, 
            $"{{\"days\": {request.JwtExpiryDays}}}", userId);

        await SaveSettingAsync(AppConstants.SettingKeys.OtpExpiryMinutes, 
            $"{{\"minutes\": {request.OtpExpiryMinutes}}}", userId);

        await SaveSettingAsync(AppConstants.SettingKeys.OtpCooldownSeconds, 
            $"{{\"seconds\": {request.OtpCooldownSeconds}}}", userId);

        if (!string.IsNullOrWhiteSpace(request.SystemName))
        {
            await SaveSettingAsync(AppConstants.SettingKeys.SystemName, 
                $"{{\"name\": \"{request.SystemName.Trim()}\"}}", userId);
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("บันทึกการตั้งค่าระบบสำเร็จ"));
    }

    private async Task SaveSettingAsync(string key, string jsonValue, Guid userId)
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == key);
        if (setting == null)
        {
            _context.SystemSettings.Add(new SystemSetting
            {
                SettingKey = key,
                SettingValue = jsonValue,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = userId != Guid.Empty ? userId : null
            });
        }
        else
        {
            setting.SettingValue = jsonValue;
            setting.UpdatedAt = DateTime.UtcNow;
            setting.UpdatedBy = userId != Guid.Empty ? userId : null;
        }
    }

    private static int ExtractIntFromJson(string json, string propertyName, int defaultValue)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty(propertyName, out var element))
            {
                return element.GetInt32();
            }
        }
        catch { }
        return defaultValue;
    }

    private static string ExtractStringFromJson(string json, string propertyName, string defaultValue)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty(propertyName, out var element))
            {
                return element.GetString() ?? defaultValue;
            }
        }
        catch { }
        return defaultValue;
    }
}

