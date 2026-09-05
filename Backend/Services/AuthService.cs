using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Data;
using Backend.DTOs.Auth;
using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// AuthService: ตรวจสอบความถูกต้องของรหัสผ่าน BCrypt, จัดการ 2FA SMS OTP, และออก Session Tokens
/// </summary>
public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IOtpService _otpService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AppDbContext context, 
        ITokenService tokenService, 
        IOtpService otpService,
        ILogger<AuthService> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _otpService = otpService;
        _logger = logger;
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return ApiResponse<AuthResponseDto>.Fail("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        // ค้นหาผู้ใช้ตามอีเมล (Case-insensitive) ที่ยังไม่ถูกลบ
        var user = await _context.Users
            .Include(u => u.Role)
                .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Module)
            .Include(u => u.UserPermission)
            .Include(u => u.UserBrandScopes)
            .Include(u => u.UserRegionScopes)
            .Include(u => u.UserProvinceScopes)
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.DeletedAt == null);

        if (user == null || user.Status != "Active")
        {
            return ApiResponse<AuthResponseDto>.Fail("อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกระงับ");
        }

        // ตรวจสอบความถูกต้องของรหัสผ่านด้วย BCrypt
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return ApiResponse<AuthResponseDto>.Fail("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        // 🛡️ กรณีเปิดใช้ 2FA (SMS OTP)
        if (user.IsMfaEnabled)
        {
            var otpInfo = await _otpService.GenerateAndSendOtpAsync(user);
            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                RequiresMfa = true,
                OtpInfo = otpInfo
            }, "กรุณายืนยันรหัส OTP ที่ได้รับทาง SMS");
        }

        // กรณีไม่ต้องใช้ 2FA: ออก JWT Tokens และบันทึก Session ทันที
        return await IssueTokensAndCreateSessionAsync(user, ipAddress, userAgent);
    }

    public async Task<ApiResponse<AuthResponseDto>> VerifyOtpAndLoginAsync(VerifyOtpRequest request, string? ipAddress = null, string? userAgent = null)
    {
        var user = await _context.Users
            .Include(u => u.Role)
                .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Module)
            .Include(u => u.UserPermission)
            .Include(u => u.UserBrandScopes)
            .Include(u => u.UserRegionScopes)
            .Include(u => u.UserProvinceScopes)
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Id == request.UserId && u.DeletedAt == null);

        if (user == null || user.Status != "Active")
        {
            return ApiResponse<AuthResponseDto>.Fail("ไม่พบผู้ใช้งานหรือบัญชีถูกระงับ");
        }

        // ตรวจสอบรหัส OTP
        bool isOtpValid = await _otpService.VerifyOtpAsync(user.Id, request.OtpCode, request.RefCode);
        if (!isOtpValid)
        {
            return ApiResponse<AuthResponseDto>.Fail("รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว");
        }

        // ออก Tokens และบันทึก Session
        return await IssueTokensAndCreateSessionAsync(user, ipAddress, userAgent);
    }

    public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken, string? ipAddress = null, string? userAgent = null)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return ApiResponse<AuthResponseDto>.Fail("Refresh Token ไม่ถูกต้อง");
        }

        var tokenHash = HashToken(refreshToken);

        var session = await _context.UserSessions
            .Include(s => s.User)
                .ThenInclude(u => u!.Role)
                    .ThenInclude(r => r!.RolePermissions)
                        .ThenInclude(rp => rp.Module)
            .Include(s => s.User)
                .ThenInclude(u => u!.UserPermission)
            .Include(s => s.User)
                .ThenInclude(u => u!.UserBrandScopes)
            .Include(s => s.User)
                .ThenInclude(u => u!.UserRegionScopes)
            .Include(s => s.User)
                .ThenInclude(u => u!.UserProvinceScopes)
            .Include(s => s.User)
                .ThenInclude(u => u!.UserBranchScopes)
            .FirstOrDefaultAsync(s => s.RefreshTokenHash == tokenHash && s.RevokedAt == null);

        if (session == null || session.ExpiresAt < DateTime.UtcNow || session.User == null)
        {
            return ApiResponse<AuthResponseDto>.Fail("Session หมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่");
        }

        // ยกเลิก Session เก่า และสร้าง Session ใหม่ (Token Rotation)
        session.RevokedAt = DateTime.UtcNow;

        return await IssueTokensAndCreateSessionAsync(session.User, ipAddress, userAgent);
    }

    public async Task<ApiResponse<UserProfileDto>> GetUserProfileAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
                .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Module)
            .Include(u => u.UserPermission)
            .Include(u => u.UserBrandScopes)
            .Include(u => u.UserRegionScopes)
            .Include(u => u.UserProvinceScopes)
            .Include(u => u.UserBranchScopes)
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null);

        if (user == null)
        {
            return ApiResponse<UserProfileDto>.Fail("ไม่พบผู้ใช้งาน");
        }

        return ApiResponse<UserProfileDto>.Ok(MapToUserProfileDto(user));
    }

    public async Task<ApiResponse> LogoutAsync(Guid userId, string? refreshToken = null)
    {
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            var tokenHash = HashToken(refreshToken);
            var session = await _context.UserSessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.RefreshTokenHash == tokenHash);
            
            if (session != null)
            {
                session.RevokedAt = DateTime.UtcNow;
            }
        }
        else
        {
            // ถ้าไม่ระบุ Token ให้ Revoke ทุก Session ที่ยัง Active ของ User คนนี้
            var activeSessions = await _context.UserSessions
                .Where(s => s.UserId == userId && s.RevokedAt == null)
                .ToListAsync();

            foreach (var s in activeSessions)
            {
                s.RevokedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
        return ApiResponse.Ok("ออกจากระบบสำเร็จ");
    }

    private async Task<ApiResponse<AuthResponseDto>> IssueTokensAndCreateSessionAsync(
        User user, string? ipAddress, string? userAgent)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var rawRefreshToken = _tokenService.GenerateRefreshToken();
        var lifetimeDays = _tokenService.GetDefaultTokenLifetimeDays();

        // บันทึก Session ลงในฐานข้อมูล
        var session = new UserSession
        {
            UserId = user.Id,
            RefreshTokenHash = HashToken(rawRefreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        await _context.UserSessions.AddAsync(session);
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var profileDto = MapToUserProfileDto(user);

        return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            RequiresMfa = false,
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            ExpiresInDays = lifetimeDays,
            User = profileDto
        }, "เข้าสู่ระบบสำเร็จ");
    }

    private static UserProfileDto MapToUserProfileDto(User user)
    {
        return new UserProfileDto
        {
            Id = user.Id,
            UserCode = user.UserCode,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            RoleCode = user.Role?.RoleCode ?? string.Empty,
            RoleName = user.Role?.RoleName ?? string.Empty,
            TierLevel = user.TierLevel,
            Status = user.Status,
            IsMfaEnabled = user.IsMfaEnabled,
            DashboardPermissions = user.UserPermission == null ? null : new DashboardPermissionsDto
            {
                CanViewSuperAdminOverview = user.UserPermission.CanViewSuperAdminOverview,
                CanViewBrandRegionalGrid = user.UserPermission.CanViewBrandRegionalGrid,
                CanViewRegionalProvinceGrid = user.UserPermission.CanViewRegionalProvinceGrid,
                CanViewProvincialBranchGrid = user.UserPermission.CanViewProvincialBranchGrid,
                CanViewBranchKiosksGrid = user.UserPermission.CanViewBranchKiosksGrid
            },
            ModulePermissions = user.Role?.RolePermissions.Select(rp => new ModulePermissionDto
            {
                ModuleCode = rp.Module?.ModuleCode ?? string.Empty,
                CanView = rp.CanView,
                CanCreate = rp.CanCreate,
                CanUpdate = rp.CanUpdate,
                CanDelete = rp.CanDelete,
                CanExport = rp.CanExport
            }).ToList() ?? new List<ModulePermissionDto>(),
            BrandScopes = user.UserBrandScopes.Select(b => b.BrandId).ToList(),
            RegionScopes = user.UserRegionScopes.Select(r => r.RegionId).ToList(),
            ProvinceScopes = user.UserProvinceScopes.Select(p => p.ProvinceId).ToList(),
            BranchScopes = user.UserBranchScopes.Select(b => b.BranchId).ToList()
        };
    }

    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }
}

