using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// Interface สัญญาการทำงานสำหรับการสร้างและตรวจสอบ JWT Access Token & Refresh Token
/// </summary>
public interface ITokenService
{
    // สร้าง JWT Token ที่มี Claims ข้อมูลผู้ใช้ (UserId, Email, Role, TierLevel)
    string GenerateAccessToken(User user, int? customLifetimeDays = null);
    
    // สุ่มสร้างรหัส Refresh Token แบบปลอดภัยสูง
    string GenerateRefreshToken();
    
    // ดึงจำนวนวันหมดอายุเริ่มต้นจาก Configuration
    int GetDefaultTokenLifetimeDays();
}

