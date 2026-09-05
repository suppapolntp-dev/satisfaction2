namespace Backend.Entities;

/// <summary>
/// ตาราง user_province_scopes: กำหนดขอบเขตสิทธิ์จังหวัด (Province / Area) ที่ผู้ใช้สามารถเข้าถึงได้
/// (Composite Primary Key: UserId + ProvinceId)
/// </summary>
public class UserProvinceScope
{
    // ผู้ใช้งาน (Foreign Key)
    public Guid UserId { get; set; }
    
    // จังหวัดที่อนุญาตให้เข้าถึง (Foreign Key เช่น เชียงใหม่, ภูเก็ต, กรุงเทพฯ)
    public Guid ProvinceId { get; set; }

    // Navigation Properties
    public User? User { get; set; }
    public Province? Province { get; set; }
}

