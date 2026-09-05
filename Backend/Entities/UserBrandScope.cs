namespace Backend.Entities;

/// <summary>
/// ตาราง user_brand_scopes: กำหนดขอบเขตสิทธิ์แบรนด์ที่ผู้ใช้สามารถเข้าถึงได้
/// (Composite Primary Key: UserId + BrandId)
/// </summary>
public class UserBrandScope
{
    // ผู้ใช้งาน (Foreign Key)
    public Guid UserId { get; set; }
    
    // แบรนด์ที่อนุญาตให้เข้าถึง (Foreign Key)
    public Guid BrandId { get; set; }

    // Navigation Properties
    public User? User { get; set; }
    public Brand? Brand { get; set; }
}

