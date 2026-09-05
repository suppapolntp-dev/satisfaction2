namespace Backend.Entities;

/// <summary>
/// ตาราง brands: ข้อมูลแบรนด์ในเครือ (เช่น Mister Donut, KFC, Ootoya, Pepper Lunch)
/// </summary>
public class Brand : BaseEntity
{
    public string BrandCode { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string ParentCompanyName { get; set; } = "Central Restaurants Group";
    public string? Category { get; set; }
    public string? BrandLogoUrl { get; set; }
    public string BrandIconName { get; set; } = "restaurant";
    public string Status { get; set; } = "Active"; // Active, Inactive
    
    // สำหรับ Soft Delete (ลบแบบซ่อนไว้ ไม่ลบจริงจากฐานข้อมูล)
    public DateTime? DeletedAt { get; set; }

    // Navigation Properties (ความสัมพันธ์)
    // 1 แบรนด์สามารถอยู่ได้ในหลายสาขา (ผ่านตารางเชื่อม BranchBrand)
    public ICollection<BranchBrand> BranchBrands { get; set; } = new List<BranchBrand>();
    
    // โหวตความพึงพอใจทั้งหมดของแบรนด์นี้
    public ICollection<SatisfactionVote> SatisfactionVotes { get; set; } = new List<SatisfactionVote>();
    
    // สิทธิ์ผู้ใช้ที่ดูแลแบรนด์นี้ (เช่น Brand Owner)
    public ICollection<UserBrandScope> UserBrandScopes { get; set; } = new List<UserBrandScope>();
    
    // กิจกรรม/แคมเปญของแบรนด์นี้
    public ICollection<Event> Events { get; set; } = new List<Event>();

    // ผู้สร้างและผู้แก้ไข (เชื่อมกับตาราง User)
    public User? Creator { get; set; }
    public User? Updater { get; set; }
}

