using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Common;
using Backend.DTOs.Auth;
using Backend.Services;

namespace Backend.Controllers;

/// <summary>
/// AuthController: ควบคุมระบบการยืนยันตัวตน (Authentication & Security Endpoints)
/// เส้นทางหลัก: /api/auth
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// 1. เข้าสู่ระบบด้วย Email และ Password
    /// POST /api/auth/login
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.LoginAsync(request, ipAddress, userAgent);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// 2. ยืนยันรหัส SMS OTP 6 หลัก สำหรับผู้ใช้ที่เปิด 2FA
    /// POST /api/auth/verify-otp
    /// </summary>
    [HttpPost("verify-otp")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.VerifyOtpAndLoginAsync(request, ipAddress, userAgent);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// 3. ขอ JWT Access Token ใบใหม่โดยใช้ Refresh Token
    /// POST /api/auth/refresh-token
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.RefreshTokenAsync(request.RefreshToken, ipAddress, userAgent);

        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// 4. ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน และสิทธิ์ 5 ระดับ (ต้องแนบ JWT Token)
    /// GET /api/auth/me
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetMe()
    {
        // ดึง UserId จาก Claims ที่ฝังอยู่ใน JWT Token
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<UserProfileDto>.Fail("Token ไม่ถูกต้อง"));
        }

        var result = await _authService.GetUserProfileAsync(userId);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// 5. ออกจากระบบ และยกเลิก Session
    /// POST /api/auth/logout
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<ApiResponse>> Logout([FromBody] RefreshTokenRequest? request = null)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse.Fail("Token ไม่ถูกต้อง"));
        }

        var result = await _authService.LogoutAsync(userId, request?.RefreshToken);
        return Ok(result);
    }
}

