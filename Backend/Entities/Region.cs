namespace Backend.Entities;

/// <summary>
/// ตาราง regions: ข้อมูลภาค (เช่น เหนือ, กลาง, ใต้, ตะวันออกเฉียงเหนือ)
/// </summary>
public class Region
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string Name { get; set; } = string.Empty;
    
    public short DisplayOrder { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties (ความสัมพันธ์กับตารางอื่น)
    public ICollection<Province> Provinces { get; set; } = new List<Province>();
    public ICollection<UserRegionScope> UserRegionScopes { get; set; } = new List<UserRegionScope>();
}
