using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// TokenService: พัฒนาด้วย System.IdentityModel.Tokens.Jwt
/// สร้างและเซ็นต์ดิจิทัลลายเซ็น JWT ด้วยกุญแจลับ HMAC-SHA256 (HMAC-SHA256 Signed Token)
/// </summary>
public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAccessToken(User user, int? customLifetimeDays = null)
    {
        var secretKey = _configuration["JwtSettings:SecretKey"] 
            ?? "SuperSecretSecurityKeyForEnterpriseCsatSatisfactionPlatform2026!";
        var issuer = _configuration["JwtSettings:Issuer"] ?? "SatisfactionApi";
        var audience = _configuration["JwtSettings:Audience"] ?? "SatisfactionClient";
        
        var lifetimeDays = customLifetimeDays 
            ?? int.Parse(_configuration["JwtSettings:TokenLifetimeDays"] ?? "1");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // ฝังข้อมูลสำคัญ (Claims) ของผู้ใช้ลงไปใน Token
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
            new(ClaimTypes.Role, user.Role?.RoleCode ?? "STAFF"),
            new("tier", user.TierLevel.ToString()),
            new("user_code", user.UserCode ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(lifetimeDays),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        // สุ่มเลขฐานสอง 64 ไบต์ที่ปลอดภัยทาง Cryptography แล้วแปลงเป็น Base64 String
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public int GetDefaultTokenLifetimeDays()
    {
        return int.Parse(_configuration["JwtSettings:TokenLifetimeDays"] ?? "1");
    }
}

