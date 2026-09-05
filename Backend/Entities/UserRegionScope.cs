namespace Backend.Entities;

/// <summary>
/// ตาราง user_region_scopes: กำหนดขอบเขตสิทธิ์ภาค (Region) ที่ผู้ใช้สามารถเข้าถึงได้
/// (Composite Primary Key: UserId + RegionId)
/// </summary>
public class UserRegionScope
{
    // ผู้ใช้งาน (Foreign Key)
    public Guid UserId { get; set; }
    
    // ภาคที่อนุญาตให้เข้าถึง (Foreign Key เช่น ภาคเหนือ, ภาคใต้)
    public Guid RegionId { get; set; }

    // Navigation Properties
    public User? User { get; set; }
    public Region? Region { get; set; }
}

