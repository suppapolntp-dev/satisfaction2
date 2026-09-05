using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Auth;
using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// OtpService: สร้างรหัส OTP 6 หลัก, Ref Code, นับเวลาถอยหลัง และส่ง SMS
/// </summary>
public class OtpService : IOtpService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OtpService> _logger;

    public OtpService(AppDbContext context, IConfiguration configuration, ILogger<OtpService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<OtpSentResponseDto> GenerateAndSendOtpAsync(User user)
    {
        var expiryMinutes = int.Parse(_configuration["OtpSettings:ExpiryMinutes"] ?? "3");
        var isMockEnabled = bool.Parse(_configuration["OtpSettings:MockOtpEnabled"] ?? "true");
        var mockCode = _configuration["OtpSettings:MockOtpCode"] ?? "123456";

        // 1. สร้างรหัสตัวเลข 6 หลัก
        string otpCode = isMockEnabled ? mockCode : RandomNumberGenerator.GetInt32(100000, 999999).ToString();

        // 2. สร้าง Ref Code 4 ตัวอักษร เช่น "A8K2"
        string refCode = GenerateRefCode();

        // 3. ยกเลิก OTP เก่าที่ยังค้างอยู่ของ User คนนี้
        var pendingOtps = await _context.UserOtps
            .Where(o => o.UserId == user.Id && o.Status == OtpStatus.Pending)
            .ToListAsync();

        foreach (var oldOtp in pendingOtps)
        {
            oldOtp.Status = OtpStatus.Expired;
        }

        // 4. บันทึก OTP ใหม่ลงใน Database
        var newOtp = new UserOtp
        {
            UserId = user.Id,
            OtpCode = otpCode,
            RefCode = refCode,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Status = OtpStatus.Pending,
            IsVerified = false
        };

        await _context.UserOtps.AddAsync(newOtp);
        await _context.SaveChangesAsync();

        // 5. จำลองหรือส่ง SMS จริง
        _logger.LogInformation("📲 [SMS OTP] ส่งรหัส OTP {OtpCode} (Ref: {RefCode}) ไปที่เบอร์ {Phone}", 
            otpCode, refCode, user.Phone ?? "N/A");

        return new OtpSentResponseDto
        {
            UserId = user.Id,
            RefCode = refCode,
            ExpiresInSeconds = expiryMinutes * 60,
            PhoneMasked = MaskPhoneNumber(user.Phone)
        };
    }

    public async Task<bool> VerifyOtpAsync(Guid userId, string otpCode, string refCode)
    {
        var otpRecord = await _context.UserOtps
            .Where(o => o.UserId == userId && o.RefCode == refCode && o.Status == OtpStatus.Pending)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otpRecord == null)
        {
            return false;
        }

        // ตรวจสอบเวลาหมดอายุ
        if (DateTime.UtcNow > otpRecord.ExpiresAt)
        {
            otpRecord.Status = OtpStatus.Expired;
            await _context.SaveChangesAsync();
            return false;
        }

        // ตรวจสอบความถูกต้องของรหัส
        if (otpRecord.OtpCode != otpCode)
        {
            otpRecord.Status = OtpStatus.Failed;
            await _context.SaveChangesAsync();
            return false;
        }

        // ยืนยันสำเร็จ
        otpRecord.IsVerified = true;
        otpRecord.Status = OtpStatus.Verified;
        await _context.SaveChangesAsync();
        return true;
    }

    private static string GenerateRefCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var result = new char[4];
        for (int i = 0; i < 4; i++)
        {
            result[i] = chars[RandomNumberGenerator.GetInt32(chars.Length)];
        }
        return new string(result);
    }

    private static string MaskPhoneNumber(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 9)
        {
            return "0xx-xxx-xxxx";
        }

        var clean = phone.Replace("-", "").Replace(" ", "");
        if (clean.Length == 10)
        {
            return $"{clean[..3]}-xxx-{clean[7..]}"; // 081-xxx-5678
        }

        return $"{clean[..2]}xxx{clean[^2..]}";
    }
}

