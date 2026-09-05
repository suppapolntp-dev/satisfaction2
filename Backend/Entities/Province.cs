namespace Backend.Entities;

/// <summary>
/// ตาราง provinces: ข้อมูลจังหวัด (สังกัดอยู่ภายใต้ Region)
/// </summary>
public class Province
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Foreign Key เชื่อมไปยังตาราง Region
    public Guid RegionId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties (ความสัมพันธ์)
    public Region? Region { get; set; } // จังหวัดนี้สังกัดภาคไหน (1 Province -> 1 Region)
    
    public ICollection<Branch> Branches { get; set; } = new List<Branch>(); // จังหวัดนี้มีสาขาอะไรบ้าง
    public ICollection<UserProvinceScope> UserProvinceScopes { get; set; } = new List<UserProvinceScope>(); // สิทธิ์ User ที่คุมจังหวัดนี้
}

